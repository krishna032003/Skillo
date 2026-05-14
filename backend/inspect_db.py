import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient

async def main():
    mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/skillo")
    client = AsyncIOMotorClient(mongo_uri)
    db = client.get_database()
    doc = await db.users.find_one({"user_id": "Krishna Sahu"})
    print("Database Document for Krishna Sahu:")
    print(doc)

if __name__ == "__main__":
    asyncio.run(main())
