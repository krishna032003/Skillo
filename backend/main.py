from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from pydantic import BaseModel
import logging
from dotenv import load_dotenv
import sys
import os
import asyncio
import platform
import threading
import json
import uuid
import httpx
import urllib.parse
from datetime import datetime, timedelta, timezone
import warnings
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.server_api import ServerApi
from google.oauth2 import id_token
from google.auth.transport import requests as grequests
from fastapi.responses import StreamingResponse

# Suppress Pydantic V1 warnings related to Python 3.14+ compatibility
warnings.filterwarnings("ignore", message=".*Pydantic V1 functionality isn't compatible with Python 3.14.*")

# Ensure the parent directory is in the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Load environment variables
env_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(env_path, override=True)

from backend.routers.timetable import router as timetable_router
from backend.routers.materials import router as materials_router
from backend.agents.graph import graph
from backend.models.user import UserProfileSchema, OnboardResponse
from langchain_core.messages import HumanMessage

# MongoDB Setup
uri = os.getenv("MONGO_URI", os.getenv("MONGODB_URL", "mongodb://localhost:27017/skillo"))
client = AsyncIOMotorClient(
    uri,
    serverSelectionTimeoutMS=2000,
    tlsAllowInvalidCertificates=True,
    server_api=ServerApi('1')
)
db = client.get_database("skillo")

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        await client.admin.command('ping')
        print("Pinged your deployment. You successfully connected to MongoDB!")
    except Exception as e:
        print(f"MongoDB connection error: {e}")
        
    gemini_key = os.getenv("GEMINI_API_KEY", "")
    if gemini_key:
        print(f"GEMINI_API_KEY loaded: yes, length: {len(gemini_key)}")
    else:
        print("GEMINI_API_KEY loaded: no")
    
    yield

app = FastAPI(title="Skillo Agent Backend", lifespan=lifespan)

# CORS Setup
allowed_origins = [
    origin.strip()
    for origin in os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class GoogleAuthRequest(BaseModel):
    token: str
    access_token: str | None = None

class ClassroomTokenRequest(BaseModel):
    access_token: str

class FocusStartRequest(BaseModel):
    duration_minutes: int
    blocked_apps: list[str]
    user_id: str | None = None

class UserProfile(BaseModel):
    user_id: str
    profession: str | None = None
    name: str | None = None
    picture: str | None = None
    onboarded: bool = False
    objectives: list[str] = []
    goals: list[str] = []
    active_goals: list[str] = []

class ChatRequest(BaseModel):
    user_id: str
    command_type: str = ""
    message: str = ""

# --- Persistent fallback DB ---
_MOCK_DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "mock_db.json")
_mock_db_lock = threading.Lock()

def _load_mock_db() -> dict:
    try:
        if os.path.exists(_MOCK_DB_PATH):
            with open(_MOCK_DB_PATH, "r") as f:
                return json.load(f)
    except Exception:
        pass
    return {}

def _save_mock_db(data: dict):
    try:
        with _mock_db_lock:
            with open(_MOCK_DB_PATH, "w") as f:
                json.dump(data, f, default=str)
    except Exception as e:
        print(f"Warning: Could not save mock_db.json: {e}")

class _PersistentDict(dict):
    def __setitem__(self, key, value):
        super().__setitem__(key, value)
        _save_mock_db(dict(self))
    def __delitem__(self, key):
        super().__delitem__(key)
        _save_mock_db(dict(self))

MOCK_DB = _PersistentDict(_load_mock_db())
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")

# Routes
app.include_router(timetable_router)
app.include_router(materials_router)

@app.get("/")
async def root():
    return {"project": "Skillo Command Center", "status": "online", "message": "Welcome to Skillo AI"}

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.post("/auth/google")
async def google_login(data: GoogleAuthRequest):
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=500, detail="GOOGLE_CLIENT_ID is not configured on the backend.")

    try:
        idinfo = id_token.verify_oauth2_token(
            data.token,
            grequests.Request(),
            GOOGLE_CLIENT_ID
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid Google token: {e}")

    email = idinfo["email"]
    name = idinfo.get("name", "")
    picture = idinfo.get("picture", "")

    user_id = None
    is_new = False
    onboarded = False

    try:
        user = await db.users.find_one({"email": email})
        if not user:
            user_id = str(uuid.uuid4())
            is_new = True
            new_user = {
                "user_id": user_id,
                "email": email,
                "name": name,
                "picture": picture,
                "goals": [],
                "onboarded": False,
                "created_at": datetime.now(timezone.utc),
                "google_access_token": data.access_token
            }
            await db.users.insert_one(new_user)
        else:
            user_id = user["user_id"]
            onboarded = user.get("onboarded", False)
            if data.access_token:
                await db.users.update_one({"user_id": user_id}, {"$set": {"google_access_token": data.access_token}})

    except Exception as db_err:
        print(f"Warning: MongoDB unavailable ({db_err}), using MOCK_DB.")
        existing = next((u for u in MOCK_DB.values() if isinstance(u, dict) and u.get("email") == email), None)
        if existing:
            user_id = existing["user_id"]
            onboarded = existing.get("onboarded", False)
            if data.access_token:
                MOCK_DB[user_id]["google_access_token"] = data.access_token
        else:
            user_id = str(uuid.uuid4())
            is_new = True
            MOCK_DB[user_id] = {
                "user_id": user_id,
                "email": email,
                "name": name,
                "picture": picture,
                "goals": [],
                "onboarded": False,
                "google_access_token": data.access_token
            }

    return {
        "success": True,
        "user_id": user_id,
        "email": email,
        "name": name,
        "onboarded": onboarded,
        "is_new": is_new
    }

@app.get("/api/user/{user_id}")
async def get_user(user_id: str):
    try:
        user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    except Exception:
        user = MOCK_DB.get(user_id)
        if not user:
             user = next((u for u in MOCK_DB.values() if isinstance(u, dict) and u.get("name") == user_id), None)
             
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.post("/api/user")
async def save_user(profile: UserProfile):
    user_dict = profile.dict()
    try:
        await db.users.update_one(
            {"user_id": profile.user_id},
            {"$set": user_dict},
            upsert=True
        )
    except Exception:
        MOCK_DB[profile.user_id] = user_dict
    return {"status": "success"}

@app.delete("/api/user/{user_id}")
async def delete_user(user_id: str):
    deleted = False
    try:
        result = await db.users.delete_one({"user_id": user_id})
        if result.deleted_count > 0:
            deleted = True
    except Exception as e:
        print(f"MongoDB delete error: {e}")

    if user_id in MOCK_DB:
        name = MOCK_DB[user_id].get("name") if isinstance(MOCK_DB.get(user_id), dict) else None
        del MOCK_DB[user_id]
        if name and name in MOCK_DB:
            del MOCK_DB[name]
        deleted = True

    if not deleted:
        raise HTTPException(status_code=404, detail="User not found")
    return {"success": True, "message": "Account deleted successfully"}

@app.post("/api/onboard", response_model=OnboardResponse)
async def onboard_user(profile: UserProfileSchema):
    user_dict = profile.dict(exclude_unset=True)
    if not user_dict.get("user_id"):
        user_dict["user_id"] = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    user_dict["updated_at"] = now
    user_dict["onboarded"] = True
    update_data = {"$set": user_dict, "$setOnInsert": {"created_at": now}}
    try:
        await db.users.update_one({"user_id": user_dict["user_id"]}, update_data, upsert=True)
    except Exception as e:
        MOCK_DB[user_dict["user_id"]] = user_dict
        if user_dict.get("name"):
            MOCK_DB[user_dict["name"]] = user_dict
    return OnboardResponse(success=True, user_id=user_dict["user_id"], message="Profile saved successfully")

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    async def event_generator():
        try:
            user_data = await db.users.find_one({"user_id": request.user_id}, {"_id": 0})
        except Exception:
            user_data = MOCK_DB.get(request.user_id) or next((u for u in MOCK_DB.values() if isinstance(u, dict) and u.get("name") == request.user_id), None)
        
        if user_data:
            profile = user_data
            profile["active_goals"] = profile.get("goals", [])
            profile["hard_constraints"] = profile.get("hard_constraints", [])
        else:
            yield f"event: error\ndata: {json.dumps({'error': 'User profile not found.'})}\n\n"
            return
        
        initial_message = request.message if request.message else f"Execute command: {request.command_type}"
        initial_state = {
            "messages": [HumanMessage(content=initial_message)],
            "user_profile": profile,
            "active_goals": profile["active_goals"],
            "user_id": request.user_id,
            "command_type": request.command_type,
            "pipeline_logs": [],
            "active_node": "Start",
            "focus_progress": 0.0,
            "intent_detected": "",
            "decision_reason": "",
            "reflection_summary": ""
        }
        
        try:
            async for s in graph.astream(initial_state, stream_mode="values"):
                logs = s.get("pipeline_logs", [])
                if logs:
                    yield f"event: pipeline\ndata: {json.dumps({'active_node': s.get('active_node', 'System'), 'pipeline_log': logs[-1]})}\n\n"
                yield f"event: state\ndata: {json.dumps({'focus_progress': s.get('focus_progress', 0.0), 'intent_detected': s.get('intent_detected', '')})}\n\n"
                await asyncio.sleep(0.1)
            
            final_content = s["messages"][-1].content if s.get("messages") else "No output."
            if request.command_type == "weekly_review":
                try:
                    review_data = json.loads(final_content)
                    review_data["type"] = "weekly_review"
                    yield f"data: {json.dumps(review_data)}\n\n"
                except:
                    yield f"event: error\ndata: {json.dumps({'error': 'Failed to parse review.'})}\n\n"
            else:
                yield f"event: final\ndata: {json.dumps({'message': final_content, 'reflection_summary': s.get('reflection_summary', '')})}\n\n"
        except Exception as e:
            yield f"event: error\ndata: {json.dumps({'error': str(e)})}\n\n"
            
    return StreamingResponse(event_generator(), media_type="text/event-stream")

@app.post("/api/classroom/{user_id}/token")
async def save_classroom_token(user_id: str, data: ClassroomTokenRequest):
    try:
        user = await db.users.find_one({"user_id": user_id})
        if user:
            await db.users.update_one({"user_id": user_id}, {"$set": {"google_access_token": data.access_token}})
        elif user_id in MOCK_DB:
            MOCK_DB[user_id]["google_access_token"] = data.access_token
        else:
            raise HTTPException(status_code=404, detail="User not found")
        return {"success": True}
    except Exception:
        if user_id in MOCK_DB:
            MOCK_DB[user_id]["google_access_token"] = data.access_token
            return {"success": True}
        raise HTTPException(status_code=500, detail="Database error")

@app.get("/api/classroom/{user_id}")
async def get_classroom_courses(user_id: str):
    try:
        user = await db.users.find_one({"user_id": user_id})
    except Exception:
        user = MOCK_DB.get(user_id)
    if not user or not user.get("google_access_token"):
        raise HTTPException(status_code=400, detail="Missing access token")
        
    async with httpx.AsyncClient() as client:
        res = await client.get("https://classroom.googleapis.com/v1/courses", headers={"Authorization": f"Bearer {user['google_access_token']}"}, params={"courseStates": ["ACTIVE"]})
        if res.status_code != 200:
            raise HTTPException(status_code=res.status_code, detail=res.text)
        courses = res.json().get("courses", [])
        return {"success": True, "courses": courses}

@app.get("/api/classroom/{user_id}/materials")
async def get_classroom_materials(user_id: str):
    try:
        user = await db.users.find_one({"user_id": user_id})
    except Exception:
        user = MOCK_DB.get(user_id)
    if not user or not user.get("google_access_token"):
        raise HTTPException(status_code=400, detail="Missing access token")

    headers = {"Authorization": f"Bearer {user['google_access_token']}"}
    async def paginated_get(client, url, key, params=None):
        items = []
        next_token = None
        for _ in range(5):
            p = dict(params or {})
            p["pageSize"] = 50
            if next_token: p["pageToken"] = next_token
            res = await client.get(url, headers=headers, params=p)
            if res.status_code != 200: break
            data = res.json()
            items.extend(data.get(key, []))
            next_token = data.get("nextPageToken")
            if not next_token: break
        return items

    result_courses = []
    async with httpx.AsyncClient(timeout=30) as client:
        courses = await paginated_get(client, "https://classroom.googleapis.com/v1/courses", "courses", {"courseStates": "ACTIVE"})
        for course in courses:
            cid = course["id"]
            all_cw = await paginated_get(client, f"https://classroom.googleapis.com/v1/courses/{cid}/courseWork", "courseWork")
            mats = []
            for work in all_cw:
                for mat in work.get("materials", []):
                    m = _build_material(mat, cid, course.get("name", ""), "coursework", work.get("title", ""), "")
                    if m: mats.append(m)
            result_courses.append({"courseId": cid, "courseName": course.get("name", ""), "materials": mats})
    return {"success": True, "courses": result_courses}

def _detect_content_type(mime: str, title: str) -> str:
    m, t = mime.lower(), title.lower()
    if "pdf" in m or t.endswith(".pdf"): return "pdf"
    if "presentation" in m or "pptx" in m: return "ppt"
    if "document" in m or "docx" in m: return "doc"
    return "unknown"

def _build_material(mat, cid, cname, stype, ptitle, tname):
    if "driveFile" in mat:
        df = mat["driveFile"].get("driveFile", {})
        mime, title = df.get("mimeType", ""), df.get("title", "Untitled")
        return {"type": "drive", "title": title, "alternateLink": df.get("alternateLink", ""), "driveFileId": df.get("id", ""), "courseId": cid, "courseName": cname, "sourceType": stype, "parentTitle": ptitle, "topicName": tname, "mimeType": mime, "content_type": _detect_content_type(mime, title)}
    return None

@app.get("/api/debug/drive")
async def debug_drive_file(user_id: str, drive_file_id: str):
    if not user_id or not drive_file_id:
        return {"error": "Missing user_id or drive_file_id"}
    try:
        user = await db.users.find_one({"user_id": user_id})
    except Exception:
        user = MOCK_DB.get(user_id)
    if not user:
        return {"error": "User not found"}
    access_token = user.get("google_access_token")
    if not access_token:
        return {"error": "No access token found"}
    debug_data = {}
    async with httpx.AsyncClient() as client:
        t_res = await client.get(f"https://oauth2.googleapis.com/tokeninfo?access_token={access_token}")
        if t_res.status_code == 200:
            t_data = t_res.json()
            debug_data["token_scopes"] = t_data.get("scope", "")
            debug_data["has_drive_scope"] = "drive.readonly" in t_data.get("scope", "")
        else:
            debug_data["token_error"] = f"{t_res.status_code} {t_res.text}"
        headers = {"Authorization": f"Bearer {access_token}"}
        m_res = await client.get(
            f"https://www.googleapis.com/drive/v3/files/{drive_file_id}",
            headers=headers,
            params={
                "fields": "id,name,mimeType,owners(displayName,emailAddress),capabilities,copyRequiresWriterPermission,webViewLink,webContentLink,size",
                "supportsAllDrives": "true"
            }
        )
        debug_data["metadata_status"] = m_res.status_code
        if m_res.status_code == 200:
            debug_data["metadata"] = m_res.json()
        else:
            debug_data["metadata_error"] = m_res.text
    return debug_data

@app.post("/api/materials/extract-content")
async def extract_drive_content(user_id: str = "", drive_file_id: str = "", mime_type: str = "", material_id: str = ""):
    if not user_id or not drive_file_id:
        raise HTTPException(status_code=400, detail="user_id and drive_file_id required")
    try:
        user = await db.users.find_one({"user_id": user_id})
    except Exception:
        user = MOCK_DB.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    access_token = user.get("google_access_token")
    if not access_token:
        raise HTTPException(status_code=400, detail="No access token")
    headers = {"Authorization": f"Bearer {access_token}"}
    extracted = ""
    status = "extract_failed"
    error_msg = ""
    async with httpx.AsyncClient(timeout=60) as client:
        try:
            m_res = await client.get(
                f"https://www.googleapis.com/drive/v3/files/{drive_file_id}",
                headers=headers,
                params={"fields": "mimeType,capabilities,webContentLink", "supportsAllDrives": "true"}
            )
            if m_res.status_code == 200:
                m_data = m_res.json()
                if not mime_type or mime_type == "none":
                    mime_type = m_data.get("mimeType", "")
            
            mime_l = mime_type.lower()
            res = None
            if "document" in mime_l and "google" in mime_l:
                res = await client.get(
                    f"https://www.googleapis.com/drive/v3/files/{drive_file_id}/export",
                    headers=headers,
                    params={"mimeType": "text/plain", "supportsAllDrives": "true"}
                )
                if res.status_code == 200:
                    extracted = res.text.strip()
                    status = "ready" if extracted else "extract_failed"
            elif "pdf" in mime_l:
                res = await client.get(
                    f"https://www.googleapis.com/drive/v3/files/{drive_file_id}",
                    headers=headers,
                    params={"alt": "media", "supportsAllDrives": "true"}
                )
                if res.status_code == 200:
                    try:
                        import io
                        from pypdf import PdfReader
                        reader = PdfReader(io.BytesIO(res.content))
                        pages_text = [p.extract_text() for p in reader.pages if p.extract_text()]
                        extracted = "\n\n".join(pages_text)
                        status = "ready" if extracted else "metadata_only"
                    except Exception as ex:
                        error_msg = f"PDF parse error: {ex}"
            elif "text/plain" in mime_l:
                res = await client.get(
                    f"https://www.googleapis.com/drive/v3/files/{drive_file_id}",
                    headers=headers,
                    params={"alt": "media", "supportsAllDrives": "true"}
                )
                if res.status_code == 200:
                    extracted = res.text.strip()
                    status = "ready" if extracted else "extract_failed"
        except Exception as ex:
            error_msg = str(ex)

    updated = False
    if status == "ready" and material_id:
        from backend.routers.materials import MATERIALS_DB
        user_mats = list(MATERIALS_DB.get(user_id, []))
        for m in user_mats:
            if m["id"] == material_id:
                m["content"] = extracted[:50000]
                m["content_status"] = "ready"
                m["content_available"] = True
                m["extracted_text_length"] = len(extracted)
                updated = True
                break
        MATERIALS_DB[user_id] = user_mats

    return {
        "success": status == "ready",
        "content": extracted[:50000] if extracted else "",
        "content_status": status,
        "extracted_length": len(extracted),
        "material_id": material_id,
        "updated": updated,
        "error": error_msg,
    }

@app.get("/api/classroom/{user_id}/materials/debug")
async def debug_classroom_materials(user_id: str):
    try:
        user = await db.users.find_one({"user_id": user_id})
    except Exception:
        user = MOCK_DB.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    access_token = user.get("google_access_token")
    if not access_token:
        raise HTTPException(status_code=400, detail="Google access token not found.")
    headers = {"Authorization": f"Bearer {access_token}"}
    async with httpx.AsyncClient(timeout=60) as client:
        res = await client.get("https://classroom.googleapis.com/v1/courses", headers=headers, params={"courseStates": "ACTIVE"})
        courses = res.json().get("courses", [])
        counts = []
        for c in courses:
            counts.append({"courseId": c["id"], "courseName": c.get("name", ""), "status": "active"})
    return {"success": True, "counts": counts}

# --- Focus Mode ---
active_focus_task, focus_end_time, focus_start_time, active_focus_user = None, None, None, None

async def focus_blocker_loop(end_time, blocked_apps):
    is_windows = platform.system() == "Windows"
    try:
        while datetime.now(timezone.utc) < end_time:
            if is_windows:
                proc = await asyncio.create_subprocess_exec("powershell", "-Command", "Get-Process | Where-Object MainWindowTitle | Select-Object -ExpandProperty Name", stdout=asyncio.subprocess.PIPE)
                stdout, _ = await proc.communicate()
                for app in stdout.decode().split():
                    if any(b.lower() in app.lower() for b in blocked_apps):
                        await asyncio.create_subprocess_exec("taskkill", "/IM", f"{app}.exe", "/F")
            await asyncio.sleep(5)
    except asyncio.CancelledError: pass
    finally:
        global active_focus_task, focus_end_time, focus_start_time, active_focus_user
        active_focus_task = focus_end_time = focus_start_time = active_focus_user = None

@app.post("/api/focus/start")
async def start_focus(req: FocusStartRequest):
    global active_focus_task, focus_end_time, focus_start_time, active_focus_user
    if active_focus_task: active_focus_task.cancel()
    now = datetime.now(timezone.utc)
    focus_start_time, focus_end_time, active_focus_user = now, now + timedelta(minutes=req.duration_minutes), req.user_id
    active_focus_task = asyncio.create_task(focus_blocker_loop(focus_end_time, req.blocked_apps))
    return {"success": True, "end_time": focus_end_time.isoformat()}

@app.post("/api/focus/stop")
async def stop_focus():
    if active_focus_task: active_focus_task.cancel()
    return {"success": True}

@app.get("/api/focus/status")
async def get_focus_status():
    if active_focus_task and focus_end_time:
        rem = int((focus_end_time - datetime.now(timezone.utc)).total_seconds())
        if rem > 0: return {"active": True, "remaining_seconds": rem, "end_time": focus_end_time.isoformat()}
    return {"active": False}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=int(os.getenv("PORT", "8000")), reload=True)
