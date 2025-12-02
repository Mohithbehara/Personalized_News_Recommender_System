import httpx
from app.core.config import settings
from app.services.article_fetcher import fetch_full_article

BASE_URL = "https://gnews.io/api/v4"

async def fetch_news(query: str):
    url = f"{BASE_URL}/search"
    
    params = {
        "q": query,
        "token": settings.NEWS_API_KEY,
        "lang": "en",
        "max": 10
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)
        data = response.json()

    if "errors" in data:
        return None

    articles = data.get("articles", [])
    
    # Enrich articles with full content
    for article in articles:
        if article.get('url'):
            full_text = await fetch_full_article(article['url'])
            if full_text:
                article['full_content'] = full_text  # Add new field
            else:
                article['full_content'] = article.get('content', '')  # Fallback to truncated
    
    return articles