from app.database.mongodb import get_database
from app.core.security import hash_password, verify_password


def get_users_collection():
    db = get_database()
    if db is None:
        raise Exception("[!] MongoDB not initialized")
    return db["users"]


async def create_user(user_data: dict):
    collection = get_users_collection()

    # Extract and validate password
    raw_password = user_data.pop("password")

    if not isinstance(raw_password, str):
        raw_password = str(raw_password)

    # Clean password string
    raw_password = raw_password.strip()

    # Hash password using SHA-256
    user_data["hashed_password"] = hash_password(raw_password)

    await collection.insert_one(user_data)

    # return safe user info
    return {
        "user_id": user_data["user_id"],
        "email": user_data["email"],
        "name": user_data.get("name")
    }


async def get_user_by_id(user_id: str):
    collection = get_users_collection()
    return await collection.find_one({"user_id": user_id})


async def validate_user(user_id: str, password: str):
    user = await get_user_by_id(user_id)
    if user and verify_password(password, user["hashed_password"]):
        return user
    return None
