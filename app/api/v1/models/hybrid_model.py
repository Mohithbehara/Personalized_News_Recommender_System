from app.api.v1.models.interaction_model import get_user_profile
from app.api.v1.models.collab_model import collab_recommend_articles
from app.database.redis_client import redis_client
from app.core.config import settings
import requests
import json

CONTENT_WEIGHT = 0.6
COLLAB_WEIGHT = 0.4
KEYWORD_FACTOR = 3


async def compute_content_scores(user_id: str):
    profile = await get_user_profile(user_id)
    if not profile or not profile.get("topics"):
        return None

    # Pick highest scored topic
    sorted_topics = sorted(profile["topics"].items(), key=lambda x: x[1], reverse=True)
    top_topic, top_score = sorted_topics[0]

    url = f"https://gnews.io/api/v4/search?q={top_topic}&lang=en&country=in&max=10&apikey={settings.NEWS_API_KEY}"
    response = requests.get(url).json()

    if "articles" not in response:
        return None

    user_keywords = profile.get("keywords", {})

    ranked_articles = {}

    for article in response["articles"]:
        text = (article.get("title", "") + " " + article.get("description", "")).lower()

        keyword_matches = [kw for kw in user_keywords.keys() if kw.lower() in text]
        keyword_score = len(keyword_matches) * KEYWORD_FACTOR

        final_score = top_score + keyword_score

        ranked_articles[article["url"]] = {
            "article": article,
            "content_score": final_score
        }

    return ranked_articles


async def hybrid_recommend(user_id: str):

    cache_key = f"hybrid_rec:{user_id}"

    # ------------------ Check Cache First ------------------
    cached = redis_client.get(cache_key)
    if cached:
        print("⚡ Served from Redis Cache")
        return json.loads(cached)

    # ------------------ Compute Fresh Recommendation ------------------
    content_results = await compute_content_scores(user_id)
    collab_results = await collab_recommend_articles(user_id)

    if not content_results and not collab_results:
        return None

    final_scores = {}

    # ---- Content-based weighted scoring ----
    if content_results:
        for url, item in content_results.items():
            final_scores[url] = {
                "article": item["article"],
                "score": item["content_score"] * CONTENT_WEIGHT
            }

    # ---- Collaborative weighted scoring ----
    if collab_results:
        for rec in collab_results:
            url = rec.get("url") or rec.get("article_url")
            if not url:
                continue

            collab_score = rec.get("similarity") or rec.get("score") or 0

            if url not in final_scores:
                final_scores[url] = {
                    "article": rec,
                    "score": collab_score * COLLAB_WEIGHT
                }
            else:
                final_scores[url]["score"] += collab_score * COLLAB_WEIGHT

    # Sort recommendations
    sorted_recommendations = sorted(
        final_scores.values(),
        key=lambda x: x["score"],
        reverse=True
    )

    # ------------------ Store in Redis Cache (10min) ------------------
    redis_client.setex(cache_key, 600, json.dumps(sorted_recommendations))  # 600 sec = 10 min

    print("📝 Stored hybrid recommendation in cache")

    return sorted_recommendations
