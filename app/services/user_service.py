from app.database.mongodb import get_database

async def store_preferences(data):
    db = get_database()
    user_id = data["user_id"]
    interests = data["interests"]

    await db.preferences.update_one(
        {"user_id": user_id},
        {"$set": {"interests": interests}},
        upsert=True
    )
    return {"message": "Preferences saved", "interests": interests}


async def fetch_preferences(user_id):
    db = get_database()
    prefs = await db.preferences.find_one({"user_id": user_id})
    if prefs:
        prefs["_id"] = str(prefs["_id"])
    return prefs or {"user_id": user_id, "interests": []}


async def store_interaction(data):
    db = get_database()
    await db.interactions.insert_one(data)
    return {"message": "Interaction saved", "details": data}
