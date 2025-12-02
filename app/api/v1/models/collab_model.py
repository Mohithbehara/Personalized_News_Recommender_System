from app.database.mongodb import get_database
from app.database.redis_client import redis_client
from bson import ObjectId
import math
import json

def get_profiles_collection():
    return get_database()["profiles"]

SIMILARITY_CACHE_EXPIRE = 3600  # 1 hour


def cosine_similarity(profile_a, profile_b):
    keywords = set(profile_a.keys()).union(set(profile_b.keys()))

    dot = sum(profile_a.get(k, 0) * profile_b.get(k, 0) for k in keywords)
    norm_a = math.sqrt(sum(v * v for v in profile_a.values()))
    norm_b = math.sqrt(sum(v * v for v in profile_b.values()))

    return dot / (norm_a * norm_b) if norm_a and norm_b else 0


async def collab_recommend_articles(user_id: str):

    cache_key = f"similar_users:{user_id}"
    cached = redis_client.get(cache_key)

    # Serve from Redis if exists
    if cached:
        print("⚡ Serving similarity from Redis")
        return json.loads(cached)

    print("🧠 Computing similarity for collaborative filtering...")

    profiles = get_profiles_collection()

    all_profiles = await profiles.find().to_list(length=500)

    target = next((p for p in all_profiles if p["user_id"] == user_id), None)
    if not target:
        return None

    target_keywords = target.get("keywords", {})

    similarities = []

    for other in all_profiles:
        if other["user_id"] == user_id:
            continue

        sim = cosine_similarity(target_keywords, other.get("keywords", {}))

        if sim > 0:   # Only store meaningful ones
            similarities.append({
                "user_id": other["user_id"],
                "similarity": round(sim, 4)
            })

    similarities.sort(key=lambda x: x["similarity"], reverse=True)

    # Cache for faster calls next time
    if similarities:
        redis_client.setex(cache_key, SIMILARITY_CACHE_EXPIRE, json.dumps(similarities))

    return similarities
