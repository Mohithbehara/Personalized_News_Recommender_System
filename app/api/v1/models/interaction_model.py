from bson import ObjectId
from app.database.mongodb import get_database
from app.database.redis_client import redis_client


def get_interactions_collection():
    return get_database()["interactions"]


def get_profiles_collection():
    return get_database()["profiles"]


# Weighted behavior scoring system
SCORE_WEIGHTS = {
    "view": 1,
    "like": 5,
    "save": 8,
    "dislike": -5
}


async def record_interaction(data: dict):

    interactions = get_interactions_collection()
    profiles = get_profiles_collection()

    # Insert raw interaction record for history tracking
    insert_result = await interactions.insert_one(data)
    interaction_id = str(insert_result.inserted_id)

    user_id = data["user_id"]
    topic = data["topic"]
    keywords = data.get("keywords", [])
    interaction_type = data.get("interaction_type", "view")

    score_change = SCORE_WEIGHTS.get(interaction_type, 1)

    # Fetch existing profile
    profile = await profiles.find_one({"user_id": user_id})

    # If new user - create empty preference structure
    if not profile:
        profile = {
            "user_id": user_id,
            "topics": {},
            "keywords": {}
        }

    # Update score for topic
    profile["topics"][topic] = profile["topics"].get(topic, 0) + score_change

    # Update keyword weights
    for kw in keywords:
        profile["keywords"][kw] = profile["keywords"].get(kw, 0) + score_change

    # Save profile changes
    await profiles.update_one({"user_id": user_id}, {"$set": profile}, upsert=True)

    # Remove ObjectId -> convert to string if exists
    if "_id" in profile:
        profile["_id"] = str(profile["_id"])

    # ----------------- CLEAR HYBRID CACHE -----------------
    cache_key = f"hybrid_rec:{user_id}"
    redis_client.delete(cache_key)
    print(f"🗑️ Cache cleared for user: {user_id} (hybrid recommendations invalidated)")

    # ------------------ Send response ----------------------
    return {
        "message": "Interaction recorded and profile updated",
        "interaction_id": interaction_id,
        "user_id": user_id,
        "article_id": data.get("article_id"),
        "topic": topic,
        "updated_profile": profile
    }


async def get_user_profile(user_id: str):
    profile = await get_profiles_collection().find_one({"user_id": user_id})

    if profile and "_id" in profile:
        profile["_id"] = str(profile["_id"])

    return profile


async def get_saved_articles(user_id: str):
    """Fetch all articles saved by a user"""
    interactions = get_interactions_collection()
    articles_collection = get_database()["articles"]
    
    # Find all 'save' interactions for this user
    saved_interactions = await interactions.find({
        "user_id": user_id,
        "interaction_type": "save"
    }).sort("_id", -1).to_list(100)  # Get most recent 100 saves
    
    saved_articles = []
    seen_article_ids = set()
    
    for interaction in saved_interactions:
        article_id = interaction.get("article_id")
        
        # Skip duplicates
        if article_id in seen_article_ids:
            continue
        seen_article_ids.add(article_id)
        
        # Try to fetch full article data from articles collection
        article = await articles_collection.find_one({"article_id": article_id})
        
        if article:
            # Convert ObjectId to string if present
            if "_id" in article and isinstance(article["_id"], ObjectId):
                article["_id"] = str(article["_id"])
            saved_articles.append(article)
        else:
            # If article not in collection, create minimal article from interaction
            saved_articles.append({
                "article_id": article_id,
                "title": f"Saved article",
                "url": article_id if article_id.startswith("http") else f"https://{article_id}",
                "topic": interaction.get("topic", "general"),
                "keywords": interaction.get("keywords", []),
                "summary": "Article details not available",
                "source": "Unknown"
            })
    
    return saved_articles