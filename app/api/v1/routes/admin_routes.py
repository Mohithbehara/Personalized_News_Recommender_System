from fastapi import APIRouter, HTTPException, Header
from app.database.mongodb import get_database
from app.database.redis_client import redis_client
from app.core.config import settings
from bson import ObjectId

admin_router = APIRouter( tags=["Admin Panel"])


def verify_admin(secret: str):
    if secret != settings.ADMIN_SECRET:
        raise HTTPException(status_code=403, detail="Unauthorized Admin Access")


def clean(doc):
    if "_id" in doc and isinstance(doc["_id"], ObjectId):
        doc["_id"] = str(doc["_id"])
    return doc


# ------------------- Fetch Users -------------------
@admin_router.get("/users")
async def list_users(admin_key: str = Header(None)):
    verify_admin(admin_key)

    db = get_database()
    users = await db["users"].find().to_list(500)

    return [clean(u) for u in users]


# ------------------- Fetch Interactions -------------------
@admin_router.get("/interactions")
async def list_interactions(admin_key: str = Header(None)):
    verify_admin(admin_key)

    db = get_database()
    interactions = await db["interactions"].find().to_list(1000)

    return [clean(i) for i in interactions]


# ------------------- Fetch Profiles -------------------
@admin_router.get("/profiles")
async def list_profiles(admin_key: str = Header(None)):
    verify_admin(admin_key)

    db = get_database()
    profiles = await db["profiles"].find().to_list(500)

    return [clean(p) for p in profiles]


# ------------------- Redis Cache Keys -------------------
@admin_router.get("/cache/keys")
async def get_cache_keys(admin_key: str = Header(None)):
    verify_admin(admin_key)

    keys = redis_client.keys("*")
    # Convert bytes → string only if needed
    keys = [key.decode() if isinstance(key, bytes) else key for key in keys]


    return {"cached_keys": keys}


# ------------------- Clear Cache -------------------
@admin_router.delete("/cache/clear")
async def clear_cache(admin_key: str = Header(None)):
    verify_admin(admin_key)

    redis_client.flushall()
    return {"status": "success", "message": "Redis cache cleared"}
