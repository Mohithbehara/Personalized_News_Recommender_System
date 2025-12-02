from fastapi import APIRouter, HTTPException
from app.api.v1.models.interaction_model import get_user_profile
from app.api.v1.models.collab_model import collab_recommend_articles
from app.api.v1.models.hybrid_model import hybrid_recommend
from app.utils.serializer import serialize_doc
from app.database.redis_client import redis_client
from app.core.config import settings
import requests


rec_router = APIRouter(prefix="/recommend", tags=["Recommendations"])

KEYWORD_FACTOR = 3


# -------------------- SMART RECOMMENDER (MAIN ENTRY) --------------------
@rec_router.get("/{user_id}")
async def smart_recommend(user_id: str):

    cache_key = f"hybrid_rec:{user_id}"
    cached = redis_client.get(cache_key)

    # ----- Serve Cached Response -----
    if cached:
        print("⚡ Serving from Redis Cache")
        return {
            "source": "redis",
            **eval(cached)
        }

    # ----- Load Profile -----
    profile = await get_user_profile(user_id)

    # If user never interacted → cold start
    if not profile:
        print("🧊 Cold start mode triggered")
        cold_start_data = await fetch_trending_news()
        return {
            "source": "cold_start",
            "message": "No interactions yet. Showing trending news.",
            "articles": cold_start_data
        }

    profile = serialize_doc(profile)

    print("🧠 Generating fresh Hybrid Recommendation...")

    # ---------------- Hybrid Recommendation ----------------
    hybrid_results = await hybrid_recommend(user_id)

    if hybrid_results:
        response_body = {
            "source": "live",
            "recommendation_type": "hybrid",
            "count": len(hybrid_results),
            "recommendations": hybrid_results
        }

        redis_client.setex(cache_key, 600, str(response_body))  # cache 10 min
        return response_body

    # ---------------- Collaborative Fallback ----------------
    collab_results = await collab_recommend_articles(user_id)
    if collab_results:
        return {
            "source": "collaborative",
            "recommendations": serialize_doc(collab_results)
        }

    # ---------------- Content-Based Fallback ----------------
    content_results = await content_based_recommend(profile)
    if content_results:
        return {
            "source": "content_based",
            "recommendations": content_results
        }

    # ---------------- Final Fallback ----------------
    cold_start_data = await fetch_trending_news()
    return {
        "source": "cold_start",
        "message": "Not enough data — showing trending news.",
        "articles": cold_start_data
    }


# ---------------- Helper: Content-Based Recommendation ----------------
async def content_based_recommend(profile):

    sorted_topics = sorted(profile["topics"].items(), key=lambda x: x[1], reverse=True)
    top_topic, top_score = sorted_topics[0]

    url = f"https://gnews.io/api/v4/search?q={top_topic}&lang=en&country=in&max=10&apikey={settings.NEWS_API_KEY}"
    response = requests.get(url).json()

    if "articles" not in response:
        return None

    user_keywords = profile.get("keywords", {})
    ranked_articles = []

    for article in response["articles"]:
        text = (article.get("title", "") + 
                article.get("description", "")).lower()

        matched_keywords = [kw for kw in user_keywords if kw.lower() in text]
        score = top_score + len(matched_keywords) * KEYWORD_FACTOR

        ranked_articles.append({
            "title": article["title"],
            "url": article["url"],
            "summary": article.get("description", ""),
            "source": article["source"]["name"],
            "score": score,
            "matched_keywords": matched_keywords,
        })

    ranked_articles.sort(key=lambda x: x["score"], reverse=True)

    return ranked_articles


# ---------------- Cold Start (Trending Recommendations) ----------------
async def fetch_trending_news():
    url = f"https://gnews.io/api/v4/top-headlines?lang=en&country=in&apikey={settings.NEWS_API_KEY}"
    response = requests.get(url).json()
    
    return response.get("articles", [])
