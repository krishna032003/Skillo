"use client";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { API_BASE } from "@/services/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { X, Plus, Trash2, BookOpen, Brain, ChevronRight, ChevronLeft, ExternalLink, AlertTriangle, Loader2, GraduationCap, PenLine, CheckSquare, Square } from "lucide-react";

interface Material { id:string; title:string; source?:string; courseName?:string; content_available?:boolean; created_at:string; topicName?:string; content_status?:string; content_type?:string; driveFileId?:string; mimeType?:string; }
interface ClassroomCourse { courseId:string; courseName:string; section?:string; topics?:{id:string;name:string}[]; materials:{type:string;title:string;alternateLink?:string;driveFileId?:string;courseId:string;courseName:string;mimeType?:string;sourceType?:string;parentTitle?:string;topicName?:string;content_type?:string;}[]; }
interface QResult { answer?:string; sources?:string[]; fallback_used?:boolean; confidence?:number; missing_content_materials?:{id:string;title:string}[]; chunks_used?:number; selected_materials?:string[]; action_type?:string; }

const ACTIONS = [
  {id:"summarize",label:"Summarize"},{id:"exam_notes",label:"Exam Notes"},{id:"mcqs",label:"Generate MCQs"},
  {id:"important_topics",label:"Key Topics"},{id:"explain_simply",label:"Explain Simply"},{id:"revision_plan",label:"Revision Plan"},
];

const md:Record<string,React.FC<React.ComponentPropsWithoutRef<'code'>&{className?:string}>> = {
  h1:({...p})=><h1 className="text-sm font-display font-bold dark:text-white text-gray-800 mt-4 mb-2" {...p}/>,
  h2:({...p})=><h2 className="text-xs font-display font-bold dark:text-white/90 text-gray-700 mt-4 mb-1.5" {...p}/>,
  p:({...p})=><p className="mb-3 leading-relaxed dark:text-gray-400 text-gray-600 text-xs font-medium" {...p}/>,
  ul:({...p})=><ul className="list-disc pl-5 mb-4 dark:text-gray-400 text-gray-600 text-xs space-y-2" {...p}/>,
  ol:({...p})=><ol className="list-decimal pl-5 mb-4 dark:text-gray-400 text-gray-600 text-xs space-y-2" {...p}/>,
  li:({...p})=><li className="leading-relaxed" {...p}/>,
  strong:({...p})=><strong className="font-bold text-indigo-500" {...p}/>,
  code:({className,children,...p})=>{
    const b=/language-(\w+)/.exec(className||'');
    return b?<pre className="dark:bg-gray-900 bg-gray-50 p-3 rounded-xl text-[10px] font-mono my-3 border dark:border-gray-800 border-gray-100 overflow-x-auto"><code className={className} {...p}>{children}</code></pre>
      :<code className="dark:bg-indigo-500/10 bg-indigo-50 px-1.5 py-0.5 rounded text-[10px] text-indigo-500 font-mono" {...p}>{children}</code>;
  },
};

export default function MaterialsModal({isOpen,onClose,userId}:{isOpen:boolean;onClose:()=>void;userId:string|null}){
  // Flow state
  const [step,setStep]=useState<"source"|"classroom"|"manual"|"browse"|"query">("source");
  // Materials from backend
  const [materials,setMaterials]=useState<Material[]>([]);
  const [selected,setSelected]=useState<Set<string>>(new Set());
  // Classroom
  const [courses,setCourses]=useState<ClassroomCourse[]>([]);
  const [activeCourse,setActiveCourse]=useState<string|null>(null);
  const [classroomLoading,setClassroomLoading]=useState(false);
  const [classroomError,setClassroomError]=useState("");
  const [importing,setImporting]=useState(false);
  const [classroomSelected,setClassroomSelected]=useState<Set<number>>(new Set());
  // Manual add
  const [noteTitle,setNoteTitle]=useState("");
  const [noteContent,setNoteContent]=useState("");
  const [saving,setSaving]=useState(false);
  // Paste content for metadata-only materials
  const [pasteTarget,setPasteTarget]=useState<string|null>(null);
  const [pasteText,setPasteText]=useState("");
  const [pasteSaving,setPasteSaving]=useState(false);
  // Query
  const [query,setQuery]=useState("");
  const [querying,setQuerying]=useState(false);
  const [queryProgress, setQueryProgress]=useState("Analyzing…");
  const [abortController, setAbortController]=useState<AbortController | null>(null);
  const [result,setResult]=useState<QResult|null>(null);
  const [extractingId,setExtractingId]=useState<string|null>(null);
  const [extractErrors,setExtractErrors]=useState<Record<string,string>>({});
  const [materialsError, setMaterialsError] = useState("");
  const fetchMaterials=useCallback(async()=>{
    if(!userId) return;
    try{
      const r=await fetch(`${API_BASE}/api/materials/${userId}`);
      if(r.ok){
        const d=await r.json();
        setMaterials(d.materials||[]);
        setMaterialsError("");
      } else {
        setMaterialsError("Failed to load materials.");
      }
    }catch{
      setMaterialsError("Network error while loading materials.");
    }
  },[userId]);

  useEffect(()=>{if(isOpen&&userId){fetchMaterials();setStep("source");setResult(null);setCourses([]);setClassroomError("");}},[isOpen,userId,fetchMaterials]);

  const fetchClassroomMaterials=async()=>{
    if(!userId) return;
    setClassroomLoading(true);setClassroomError("");setCourses([]);
    try{
      const r=await fetch(`${API_BASE}/api/classroom/${userId}/materials`);
      if(!r.ok){const e=await r.json().catch(()=>({}));throw new Error(e.detail||"Failed");}
      const d=await r.json();setCourses(d.courses||[]);
    }catch(e:unknown){setClassroomError((e as Error).message||"Failed to load");}
    finally{setClassroomLoading(false);}
  };

  const handleImportSelected=async()=>{
    if(!userId||!activeCourse) return;
    const course=courses.find(c=>c.courseId===activeCourse);
    if(!course) return;
    const mats=course.materials.filter((_,i)=>classroomSelected.has(i));
    if(mats.length===0) return;
    setImporting(true);
    try{
      const r=await fetch(`${API_BASE}/api/materials/import-classroom`,{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({user_id:userId,materials:mats})
      });
      if(r.ok){await fetchMaterials();setClassroomSelected(new Set());setStep("browse");}
    }catch{}finally{setImporting(false);}
  };

  const handleSaveManual=async()=>{
    if(!noteTitle||!noteContent||!userId) return;
    setSaving(true);
    try{
      const r=await fetch(`${API_BASE}/api/materials`,{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({user_id:userId,title:noteTitle,content:noteContent})});
      if(r.ok){setNoteTitle("");setNoteContent("");await fetchMaterials();setStep("browse");}
    }catch{}finally{setSaving(false);}
  };

  const handlePasteContent=async()=>{
    if(!userId||!pasteTarget||!pasteText.trim()) return;
    setPasteSaving(true);
    try{
      await fetch(`${API_BASE}/api/materials/${userId}/${pasteTarget}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({content:pasteText})});
      await fetchMaterials();setPasteTarget(null);setPasteText("");
    }catch{}finally{setPasteSaving(false);}
  };

  const handleExtractContent=async(matId:string, driveFileId:string, mimeType:string)=>{
    if(!userId) return;
    setExtractingId(matId);
    setExtractErrors(prev => ({...prev, [matId]: ""}));
    try{
      const r=await fetch(`${API_BASE}/api/materials/extract-content?user_id=${userId}&drive_file_id=${driveFileId}&mime_type=${encodeURIComponent(mimeType)}&material_id=${matId}`,{method:"POST"});
      const d=await r.json();
      if(d.success||d.content_status==="ready"){
        // Backend auto-updates DB now
        await fetchMaterials();
      } else {
        setExtractErrors(prev => ({...prev, [matId]: d.error || "Extraction failed"}));
      }
    }catch{
      setExtractErrors(prev => ({...prev, [matId]: "Failed to contact server."}));
    }finally{
      setExtractingId(null);
      await fetchMaterials();
    }
  };

  const handleDelete=async(id:string)=>{
    if(!userId) return;
    try{await fetch(`${API_BASE}/api/materials/${userId}/${id}`,{method:"DELETE"});fetchMaterials();}catch{}
  };

  const toggle=(id:string)=>setSelected(p=>{const n=new Set(p);if(n.has(id)){n.delete(id);}else{n.add(id);}return n;});
  const toggleCm=(i:number)=>setClassroomSelected(p=>{const n=new Set(p);if(n.has(i)){n.delete(i);}else{n.add(i);}return n;});

  const handleQuery=async(q?:string,action?:string)=>{
    const fq=q||query;if(!fq||!userId) return;
    
    if (abortController) {
      abortController.abort();
    }
    const controller = new AbortController();
    setAbortController(controller);

    setQuery(fq);
    setQuerying(true);
    setResult(null);
    setQueryProgress("Selecting chunks…");
    try{
      const selectedMats = materials.filter(m => selected.has(m.id));
      const needsExtract = selectedMats.filter(m => m.source==="classroom" && (!m.content_status || m.content_status==="metadata_only") && m.driveFileId);
      
      if (needsExtract.length > 0) {
        setQueryProgress("Extracting missing documents…");
        for (const m of needsExtract) {
          const mime = m.mimeType || m.content_type || "";
          await fetch(`${API_BASE}/api/materials/extract-content?user_id=${userId}&material_id=${m.id}&drive_file_id=${m.driveFileId}&mime_type=${encodeURIComponent(mime)}`,{method:"POST"}).catch(()=>{});
        }
      }

      setQueryProgress("Asking AI…");
      const body:Record<string,unknown>={user_id:userId,query:fq};
      if(selected.size>0) body.material_ids=Array.from(selected);
      if(action) body.quick_action=action;
      
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      const r=await fetch(`${API_BASE}/api/materials/query`,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(body),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      const d=await r.json();
      if (!r.ok && !d.answer) {
        throw new Error(d.detail || "Server error");
      }
      setResult(d);
      
      if (needsExtract.length > 0) fetchMaterials();
    }catch(e: unknown){
      const error = e as Error;
      console.error("[RAG] Query fetch error:", error);
      if (error.name === "AbortError") {
        setResult({answer:"**AI took too long.**\n\nFallback local summary mode triggered.", fallback_used: true});
      } else {
        setResult({answer:`**Connection error.**\n\n${error.message || "Failed to reach backend."}`});
      }
    }finally{
      setQuerying(false);
      setAbortController(null);
    }
  };

  if(!isOpen) return null;

  const courseData=activeCourse?courses.find(c=>c.courseId===activeCourse):null;

  return(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/60 backdrop-blur-md">
      <motion.div initial={{opacity:0,scale:0.98}} animate={{opacity:1,scale:1}}
        className="relative w-full max-w-4xl dark:bg-[#0c0d10] bg-white border dark:border-gray-800 border-gray-100 rounded-[24px] md:rounded-[32px] shadow-2xl flex flex-col max-h-[95vh] md:max-h-[90vh] overflow-hidden transition-colors">

        {/* Header */}
        <div className="flex items-center justify-between px-6 md:px-8 py-4 md:py-5 border-b dark:border-gray-800 border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <Brain size={18} className="text-indigo-500"/>
            <h2 className="text-xs md:text-sm font-display font-bold dark:text-white text-gray-800">Learning Architecture</h2>
            {selected.size>0&&<span className="hidden sm:inline-block text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 font-bold border border-indigo-500/20">{selected.size} active nodes</span>}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-indigo-500 transition-colors p-1"><X size={18}/></button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">

          {/* STEP: SOURCE SELECTION */}
          {step==="source"&&(
            <div className="space-y-6">
              <p className="text-[10px] text-gray-400 uppercase tracking-[0.3em] font-black">Choose Data Protocol</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
                <button onClick={()=>{setStep("classroom");fetchClassroomMaterials();}}
                  className="p-5 md:p-6 rounded-[20px] md:rounded-[24px] border dark:border-gray-800 border-gray-100 dark:bg-gray-900/40 bg-white hover:border-indigo-500/40 hover:shadow-xl transition-all text-left group">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 mb-4 group-hover:scale-110 transition-transform">
                    <GraduationCap size={20} />
                  </div>
                  <p className="text-sm font-display font-bold dark:text-white text-gray-800">Classroom Sync</p>
                  <p className="text-[11px] text-gray-400 mt-1 font-medium">Sync materials from external courses</p>
                </button>
                <button onClick={()=>setStep("manual")}
                  className="p-5 md:p-6 rounded-[20px] md:rounded-[24px] border dark:border-gray-800 border-gray-100 dark:bg-gray-900/40 bg-white hover:border-purple-500/40 hover:shadow-xl transition-all text-left group">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 mb-4 group-hover:scale-110 transition-transform">
                    <PenLine size={20} />
                  </div>
                  <p className="text-sm font-display font-bold dark:text-white text-gray-800">Manual Archive</p>
                  <p className="text-[11px] text-gray-400 mt-1 font-medium">Inject raw text or personal notes</p>
                </button>
              </div>
              {materials.length>0&&(
                <button onClick={()=>setStep("browse")} className="w-full py-3 dark:bg-gray-900/50 bg-gray-50 border dark:border-gray-800 border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-indigo-500 transition-colors">
                  View {materials.length} stored module{materials.length>1?"s":""} →
                </button>
              )}
            </div>
          )}

          {/* STEP: CLASSROOM */}
          {step==="classroom"&&(
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button onClick={()=>{setStep("source");setActiveCourse(null);}} className="text-gray-400 hover:text-white p-1"><ChevronLeft size={16}/></button>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Google Classroom</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <p className="text-[8px] text-gray-500">
                    OAuth: {(process.env.NEXT_PUBLIC_CLASSROOM_CLIENT_ID?.trim() || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim())?.endsWith('.apps.googleusercontent.com') ? <span className="text-emerald-400">Configured</span> : <span className="text-red-400">Missing/Invalid</span>}
                  </p>
                  <button onClick={() => {
                    let clientId = process.env.NEXT_PUBLIC_CLASSROOM_CLIENT_ID?.trim();
                    if (!clientId) clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim();
                    if (!clientId || !clientId.endsWith(".apps.googleusercontent.com")) { setClassroomError("No valid Google OAuth client ID found."); return; }
                    setClassroomError("");
                    const redirectUri = `${window.location.origin}/auth/callback`;
                    const params = new URLSearchParams({ client_id: clientId, redirect_uri: redirectUri, response_type: "token", scope: "https://www.googleapis.com/auth/classroom.courses.readonly https://www.googleapis.com/auth/classroom.coursework.me.readonly https://www.googleapis.com/auth/classroom.courseworkmaterials.readonly https://www.googleapis.com/auth/drive.readonly", prompt: "consent" });
                    const popup = window.open(`https://accounts.google.com/o/oauth2/v2/auth?${params}`, "classroom-auth", `width=500,height=600`);
                    if (!popup) { alert("Popup blocked"); return; }
                    const handler = async (event: MessageEvent) => {
                      if (event.origin !== window.location.origin) return;
                      if (event.data?.type === "GOOGLE_AUTH_SUCCESS" && event.data?.accessToken) {
                        window.removeEventListener("message", handler);
                        if (userId) await fetch(`${API_BASE}/api/classroom/${encodeURIComponent(userId)}/token`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ access_token: event.data.accessToken }) });
                        alert("Successfully reconnected."); fetchClassroomMaterials();
                      }
                    };
                    window.addEventListener("message", handler);
                  }} className="text-[9px] px-2 py-1 bg-amber-400/10 text-amber-400 border border-amber-400/20 rounded hover:bg-amber-400/20 transition-colors">
                    Reconnect Google
                  </button>
                </div>
              </div>

              {classroomLoading&&<div className="py-12 text-center"><Loader2 size={18} className="animate-spin text-indigo-500 mx-auto mb-2"/><p className="text-[10px] text-gray-400 uppercase tracking-widest">Fetching courses…</p></div>}
              {classroomError&&<div className="p-3 rounded-lg bg-red-400/8 border border-red-400/20 text-[10px] text-red-400"><AlertTriangle size={12} className="inline mr-1"/>{classroomError}</div>}

              {!classroomLoading&&!classroomError&&courses.length===0&&(
                <div className="py-12 text-center"><GraduationCap size={24} className="mx-auto mb-2 opacity-10"/><p className="text-[10px] text-gray-400 uppercase tracking-widest">No active courses found</p></div>
              )}

              {/* Course list */}
              {!activeCourse&&courses.length>0&&(
                <div className="grid grid-cols-1 gap-3">
                  {courses.map(c=>(
                    <button key={c.courseId} onClick={()=>{setActiveCourse(c.courseId);setClassroomSelected(new Set());}}
                      className="flex items-center justify-between p-4 rounded-2xl border dark:border-gray-800 border-gray-100 dark:bg-gray-900/40 bg-white hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all text-left group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                           <GraduationCap size={18} />
                        </div>
                        <div className="min-w-0 pr-2">
                          <p className="text-xs md:text-sm font-display font-bold dark:text-white text-gray-800 line-clamp-2 break-words leading-tight">{c.courseName}</p>
                          <p className="text-[9px] md:text-[10px] text-gray-400 font-medium uppercase tracking-widest mt-1">{c.materials.length} node{c.materials.length!==1?"s":""}</p>
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-gray-300 group-hover:text-indigo-500 shrink-0"/>
                    </button>
                  ))}
                </div>
              )}

              {/* Materials in selected course */}
              {activeCourse&&courseData&&(
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <button onClick={()=>setActiveCourse(null)} className="text-gray-400 hover:text-white p-1"><ChevronLeft size={16}/></button>
                    <p className="text-xs font-bold text-gray-800 dark:text-gray-200">{courseData.courseName}</p>
                  </div>

                  {courseData.materials.length===0?(
                    <p className="text-[10px] text-gray-400 py-12 text-center uppercase tracking-widest font-bold">No active nodes found</p>
                  ):(
                    <>
                      <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2 styled-scrollbar">
                        {courseData.materials.map((m,i)=>(
                          <div key={i} onClick={()=>toggleCm(i)}
                            className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition-all ${classroomSelected.has(i)?"border-indigo-500/40 bg-indigo-500/5":"dark:border-gray-800 border-gray-100 dark:bg-gray-900/40 bg-white hover:bg-gray-50 dark:hover:bg-gray-800/60"}`}>
                            {classroomSelected.has(i)?<CheckSquare size={16} className="text-indigo-500 shrink-0"/>:<Square size={16} className="text-gray-300 shrink-0"/>}
                            <div className="flex-1 min-w-0 pr-2">
                              <p className="text-xs md:text-sm dark:text-gray-200 text-gray-800 font-bold line-clamp-2 break-words leading-tight font-display">{m.title}</p>
                              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-gray-800">{m.type}</span>
                                {m.topicName&&<span className="text-[9px] text-gray-400 font-bold border dark:border-gray-700 border-gray-200 px-2 py-0.5 rounded-lg truncate max-w-[120px]">{m.topicName}</span>}
                              </div>
                            </div>
                            {m.alternateLink&&<a href={m.alternateLink} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} className="text-gray-300 hover:text-indigo-500 shrink-0 transition-colors"><ExternalLink size={14}/></a>}
                          </div>
                        ))}
                      </div>
                      <button onClick={handleImportSelected} disabled={classroomSelected.size===0||importing}
                        className="w-full py-4 bg-indigo-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-indigo-600 shadow-lg shadow-indigo-500/20 disabled:opacity-40 transition-all">
                        {importing?"Synchronizing…":`Import ${classroomSelected.size} Selected Nodes`}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* STEP: MANUAL ADD */}
          {step==="manual"&&(
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <button onClick={()=>setStep("source")} className="text-gray-400 hover:text-white p-1"><ChevronLeft size={16}/></button>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Add Manual Notes</p>
              </div>
              <div className="space-y-4">
                <input value={noteTitle} onChange={e=>setNoteTitle(e.target.value)} placeholder="Node Title"
                  className="w-full dark:bg-gray-900 bg-gray-50 border dark:border-gray-800 border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold dark:text-white text-gray-800 placeholder-gray-400 focus:outline-none focus:border-indigo-500/50 transition-all"/>
                <textarea value={noteContent} onChange={e=>setNoteContent(e.target.value)} placeholder="Inject research data here…"
                  className="w-full dark:bg-gray-900 bg-gray-50 border dark:border-gray-800 border-gray-100 rounded-2xl px-5 py-4 text-sm font-medium dark:text-gray-300 text-gray-600 placeholder-gray-400 focus:outline-none focus:border-indigo-500/50 h-56 resize-none transition-all styled-scrollbar"/>
                <button onClick={handleSaveManual} disabled={saving||!noteTitle||!noteContent}
                  className="w-full py-4 bg-indigo-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-indigo-600 shadow-lg shadow-indigo-500/20 disabled:opacity-40 transition-all flex items-center justify-center gap-2">
                  <Plus size={14}/>{saving?"Archiving…":"Inject Material"}
                </button>
              </div>
            </div>
          )}

          {/* STEP: BROWSE SAVED */}
          {step==="browse"&&(
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <button onClick={()=>setStep("source")} className="text-gray-400 hover:text-white p-1"><ChevronLeft size={16}/></button>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Saved Materials ({materials.length})</p>
                </div>

                {materialsError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-[10px] text-red-500 font-bold flex items-center gap-2">
                    <AlertTriangle size={14} /> {materialsError}
                  </div>
                )}

              {materials.length===0?(
                <div className="text-center py-12"><BookOpen size={24} className="mx-auto mb-2 opacity-10"/><p className="text-[10px] text-gray-400 uppercase tracking-widest">No materials saved yet</p></div>
              ):(
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pr-2 styled-scrollbar">
                    {materials.map(m=>(
                      <div key={m.id} onClick={()=>toggle(m.id)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all group relative ${selected.has(m.id)?"border-emerald-400/40 bg-emerald-400/5":"dark:border-gray-800 border-gray-100 dark:bg-gray-900/40 bg-white hover:bg-gray-50 dark:hover:bg-gray-800/60"}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            {selected.has(m.id)?<CheckSquare size={14} className="text-emerald-400 shrink-0"/>:<Square size={14} className="text-gray-400 shrink-0"/>}
                            <p className="text-[11px] font-bold dark:text-gray-200 text-gray-800 truncate font-display">{m.title}</p>
                          </div>
                          <button onClick={e=>{e.stopPropagation();handleDelete(m.id);}} className="text-gray-400 hover:text-red-500 transition-colors p-1"><Trash2 size={12}/></button>
                        </div>

                        {extractErrors[m.id] && (
                          <p className="text-[8px] text-red-500 font-bold mt-1 ml-6">{extractErrors[m.id]}</p>
                        )}

                        <div className="flex flex-wrap items-center gap-1.5 mt-2 pl-6">
                           <span className="text-[8px] px-1.5 py-px rounded bg-gray-100 dark:bg-gray-800 text-gray-400 font-bold uppercase tracking-widest">{m.source}</span>
                           {m.content_status==="ready"&&<span className="text-[8px] px-1.5 py-px rounded bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 font-bold uppercase">Ready</span>}
                           {m.source==="classroom" && (!m.content_status || m.content_status!=="ready") && m.driveFileId && (
                            <button onClick={(e)=>{e.stopPropagation(); handleExtractContent(m.id, m.driveFileId!, m.mimeType || m.content_type || "");}} disabled={extractingId===m.id}
                              className="text-[8px] text-emerald-500 font-bold uppercase tracking-widest hover:underline ml-auto">
                              {extractingId===m.id ? "Extracting..." : "Auto-Extract"}
                            </button>
                           )}
                           {m.source==="classroom" && (!m.content_status || m.content_status==="metadata_only") && !m.driveFileId && (
                            <button onClick={(e)=>{e.stopPropagation(); setPasteTarget(m.id);}}
                              className="text-[8px] text-amber-500 font-bold uppercase tracking-widest hover:underline ml-auto">
                              Paste Content
                            </button>
                           )}
                        </div>

                        {pasteTarget === m.id && (
                          <div className="mt-3 space-y-2" onClick={e=>e.stopPropagation()}>
                            <textarea 
                              value={pasteText}
                              onChange={e=>setPasteText(e.target.value)}
                              placeholder="Paste text content from this assignment..."
                              className="w-full p-3 text-[10px] dark:bg-gray-800 bg-gray-50 border dark:border-gray-700 border-gray-200 rounded-xl focus:outline-none h-24 resize-none"
                            />
                            <div className="flex gap-2">
                              <button onClick={handlePasteContent} disabled={pasteSaving||!pasteText.trim()} className="flex-1 py-2 bg-indigo-500 text-white text-[9px] font-black uppercase rounded-lg disabled:opacity-40">
                                {pasteSaving?"Saving...":"Save Content"}
                              </button>
                              <button onClick={()=>setPasteTarget(null)} className="px-3 py-2 text-[9px] font-black uppercase text-gray-400">Cancel</button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <button onClick={()=>setStep("query")}
                    className="w-full py-4 bg-indigo-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-indigo-600 shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2">
                    <Brain size={14}/>Analyze {selected.size>0?`${selected.size} Selected`:"All"} Materials
                  </button>
                </>
              )}
            </div>
          )}

          {/* STEP: QUERY */}
          {step==="query"&&(
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <button onClick={()=>setStep("browse")} className="text-gray-400 hover:text-white p-1"><ChevronLeft size={16}/></button>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Neural Query</p>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")handleQuery();}}
                    placeholder="Ask your library..."
                    className="flex-1 dark:bg-gray-900 bg-gray-50 border dark:border-gray-800 border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold dark:text-white text-gray-800 focus:outline-none focus:border-indigo-500/50 transition-all"/>
                  <button onClick={()=>handleQuery()} disabled={querying||!query}
                    className="h-14 px-8 bg-indigo-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-indigo-600 shadow-lg shadow-indigo-500/20 disabled:opacity-40 transition-all">Ask AI</button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {ACTIONS.map(action => (
                    <button 
                      key={action.id}
                      onClick={() => handleQuery(action.label, action.id)}
                      disabled={querying}
                      className="px-4 py-2 rounded-xl border dark:border-gray-800 border-gray-100 dark:bg-gray-900/40 bg-white hover:border-indigo-500/30 hover:bg-indigo-500/5 text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-indigo-500 transition-all disabled:opacity-40"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>

                <div className="min-h-[300px] dark:bg-gray-900/60 bg-gray-50 border dark:border-gray-800 border-gray-100 rounded-[24px] md:rounded-[32px] p-6 md:p-8 overflow-y-auto max-h-[50vh] flex flex-col shadow-inner">
                  {querying?(
                    <div className="flex-1 flex flex-col items-center justify-center text-indigo-500 text-[10px] font-black uppercase tracking-[0.2em] gap-4">
                      <Loader2 size={24} className="animate-spin mb-2"/>
                      {queryProgress}
                      <button 
                        onClick={() => abortController?.abort()}
                        className="mt-4 px-6 py-2 border border-indigo-500/30 rounded-xl hover:bg-indigo-500/10 transition-colors text-[8px]"
                      >
                        Cancel Query
                      </button>
                    </div>
                  ):result?(
                    <div className="flex-1">
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm]} components={md}>{String(result.answer||"")}</ReactMarkdown>
                      </div>
                    </div>
                  ):(
                    <div className="flex-1 flex flex-col items-center justify-center opacity-10">
                      <Brain size={48} className="mb-4" />
                      <p className="text-[10px] font-black uppercase tracking-[0.4em]">Ready for protocol</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
