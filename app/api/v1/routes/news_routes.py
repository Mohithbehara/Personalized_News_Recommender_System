from fastapi import APIRouter, HTTPException, Query
from app.api.v1.models.article_model import save_article
from app.core.config import settings
from app.database.redis_client import redis_client
from app.services.keyword_extractor import extract_keywords
from app.services.article_fetcher import fetch_full_article
import requests
import asyncio
import math
import json
from concurrent.futures import ThreadPoolExecutor
from typing import Optional, List, Dict

# --- Summarization dependencies ---
from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.summarizers.text_rank import TextRankSummarizer


news_router = APIRouter(tags=["News"])


def summarize_text(text: Optional[str], sentences: int = 8):
    """Generate comprehensive summary using TextRank algorithm - full paragraph summaries"""
    if not text or len(text.split()) < 15:
        return text

    try:
        parser = PlaintextParser.from_string(text, Tokenizer("english"))
        summarizer = TextRankSummarizer()
        
        doc_sentences = len(parser.document.sentences)
        
        if doc_sentences <= 5:
            num_sentences = doc_sentences
        else:
            num_sentences = max(5, min(10, int(doc_sentences * 0.25)))
        
        summary_sentences = summarizer(parser.document, num_sentences)
        summary = " ".join([str(sentence) for sentence in summary_sentences])
        
        return summary.strip()
    except Exception as e:
        print(f"Summarization error: {e}")
        return text


def process_single_article(article: dict, topic: str) -> dict:
    """
    Process a single article: fetch full content, extract keywords, summarize.
    This runs in a thread pool for parallel execution.
    """
    article_url = article.get("url")
    
    # Fetch full content
    full_content = None
    if article_url:
        full_content = fetch_full_article(article_url)
    
    # Priority: full_content > content > description > title
    raw_text = (
        full_content
        or article.get("content")
        or article.get("description")
        or article.get("title")
    )

    # Extract keywords and summarize
    keywords = extract_keywords(raw_text)
    summarized = summarize_text(raw_text, sentences=10)

    return {
        "article_id": article["url"],
        "title": article["title"],
        "summary": summarized or article.get("description", ""),
        "url": article["url"],
        "source": article["source"]["name"],
        "topic": topic,
        "keywords": keywords,
        "has_full_content": bool(full_content),
    }


@news_router.get("/{topic}")
async def get_news(
    topic: str,
    page: int = Query(1, ge=1, description="Page number for pagination"),
    page_size: int = Query(5, ge=1, le=10, description="Number of articles per page"),
):
    """
    Fetch news articles for a topic with server-side pagination.

    - GNews returns up to 20 articles per topic.
    - We process all articles in parallel once and cache the full list.
    - Pagination is applied on the server to return only the requested slice.
    """
    cache_key = f"news:{topic}"

    # -------------------- Load from cache if available --------------------
    cached = redis_client.get(cache_key)
    base_payload: Dict[str, any] = None

    if cached:
        # Properly deserialize JSON from cache
        try:
            base_payload = json.loads(cached)
            source = "cache"
        except json.JSONDecodeError:
            # If cache is corrupted, treat as cache miss
            base_payload = None
    
    if not base_payload:
        # -------------------- Fetch from GNews API --------------------
        url = (
            f"https://gnews.io/api/v4/search?q={topic}&lang=en&country=in&max=20&apikey={settings.NEWS_API_KEY}"
        )
        
        try:
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            data = response.json()
        except requests.RequestException as e:
            raise HTTPException(status_code=500, detail=f"Failed to fetch news from GNews API: {str(e)}")

        if "articles" not in data or not data["articles"]:
            raise HTTPException(status_code=404, detail="No articles found for this topic")

        # 🚀 PROCESS ALL ARTICLES IN PARALLEL
        loop = asyncio.get_event_loop()

        with ThreadPoolExecutor(max_workers=10) as executor:
            tasks = [
                loop.run_in_executor(executor, process_single_article, article, topic)
                for article in data["articles"]
            ]
            articles_output = await asyncio.gather(*tasks)

        # Save all articles to database
        for article_data in articles_output:
            try:
                await save_article(article_data)
            except Exception as e:
                print(f"Error saving article {article_data.get('url')}: {e}")

        base_payload = {"topic": topic, "articles": articles_output}

        # Cache the full article list as JSON (no pagination in cache)
        redis_client.setex(cache_key, 600, json.dumps(base_payload))
        source = "api"

    # -------------------- Apply server-side pagination --------------------
    articles: List[Dict] = base_payload.get("articles", [])
    total = len(articles)

    # Ensure valid page_size and compute total_pages
    page_size = max(1, min(page_size, 10))
    total_pages = max(1, math.ceil(total / page_size)) if total else 1

    # Clamp page within valid range
    page = max(1, min(page, total_pages))

    start = (page - 1) * page_size
    end = start + page_size
    paginated_articles = articles[start:end]

    return {
        "source": source,
        "topic": topic,
        "page": page,
        "page_size": page_size,
        "total": total,
        "total_pages": total_pages,
        "articles": paginated_articles,
    }