from app.database.mongodb import get_database

def get_preferences_collection():
    db = get_database()
    if db is None:
        raise Exception("[!] MongoDB not initialized")
    return db["preferences"]


async def update_preferences(user_id: str, interests: list):
    collection = get_preferences_collection()
    await collection.update_one(
        {"user_id": user_id},
        {"$set": {"interests": interests}},
        upsert=True
    )
    return {"user_id": user_id, "interests": interests}


async def get_preferences(user_id: str):
    collection = get_preferences_collection()
    return await collection.find_one({"user_id": user_id})
