from fastapi import APIRouter, HTTPException, Query, Path
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


headlines_router = APIRouter(tags=["Headlines"])


def summarize_text(text: Optional[str], sentences: int = 8):
    """Generate comprehensive summary using TextRank algorithm"""
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


def process_single_headline(article: dict, category: str) -> dict:
    """
    Process a single headline article: fetch full content, extract keywords, summarize.
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
    summarized = summarize_text(raw_text, sentences=8)

    return {
        "article_id": article["url"],
        "title": article["title"],
        "summary": summarized or article.get("description", ""),
        "url": article["url"],
        "source": article["source"]["name"],
        "topic": f"headlines_{category}",
        "category": category,
        "keywords": keywords,
        "has_full_content": bool(full_content),
        "published_at": article.get("publishedAt", ""),
        "image": article.get("image", ""),
    }


@headlines_router.get("/{category}")
async def get_headlines(
    category: str = Path(
        ...,
        description="Category: general, world, nation, business, technology, entertainment, sports, science, health"
    ),
    page: int = Query(1, ge=1, description="Page number for pagination"),
    page_size: int = Query(5, ge=1, le=10, description="Number of articles per page"),
):
    """
    Fetch top headlines by category with server-side pagination.
    
    Available categories:
    - general: General news
    - world: World news
    - nation: National news
    - business: Business news
    - technology: Technology news
    - entertainment: Entertainment news
    - sports: Sports news
    - science: Science news
    - health: Health news
    """
    
    # Validate category
    valid_categories = [
        "general", "world", "nation", "business", "technology",
        "entertainment", "sports", "science", "health"
    ]
    
    if category not in valid_categories:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid category. Must be one of: {', '.join(valid_categories)}"
        )
    
    cache_key = f"headlines:{category}"

    # -------------------- Load from cache if available --------------------
    cached = redis_client.get(cache_key)
    base_payload: Dict[str, any] = None

    if cached:
        try:
            base_payload = json.loads(cached)
            source = "cache"
            print(f"✅ Cache HIT for headlines '{category}' - {len(base_payload.get('articles', []))} articles")
        except json.JSONDecodeError:
            base_payload = None
            print(f"⚠️ Cache corrupted for headlines '{category}', refetching...")
    
    if not base_payload:
        # -------------------- Fetch from GNews Top Headlines API --------------------
        url = (
            f"https://gnews.io/api/v4/top-headlines"
            f"?category={category}"
            f"&lang=en"
            f"&country=us"
            f"&max=10"
            f"&apikey={settings.NEWS_API_KEY}"
        )
        
        print(f"🌐 Fetching headlines from GNews API: category={category}")
        
        try:
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            print(f"📊 GNews returned {len(data.get('articles', []))} headlines for category '{category}'")
            
        except requests.RequestException as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to fetch headlines from GNews API: {str(e)}"
            )

        if "articles" not in data or not data["articles"]:
            raise HTTPException(
                status_code=404,
                detail=f"No headlines found for category '{category}'"
            )

        # 🚀 PROCESS ALL HEADLINES IN PARALLEL
        loop = asyncio.get_event_loop()

        with ThreadPoolExecutor(max_workers=10) as executor:
            tasks = [
                loop.run_in_executor(executor, process_single_headline, article, category)
                for article in data["articles"]
            ]
            articles_output = await asyncio.gather(*tasks)

        print(f"✨ Processed {len(articles_output)} headlines successfully")

        # Save all articles to database
        for article_data in articles_output:
            try:
                await save_article(article_data)
            except Exception as e:
                print(f"Error saving headline {article_data.get('url')}: {e}")

        base_payload = {
            "category": category,
            "articles": articles_output
        }

        # Cache for 5 minutes (headlines are time-sensitive)
        redis_client.setex(cache_key, 300, json.dumps(base_payload))
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

    print(f"📄 Returning page {page}/{total_pages} ({len(paginated_articles)} headlines)")

    return {
        "source": source,
        "category": category,
        "page": page,
        "page_size": page_size,
        "total": total,
        "total_pages": total_pages,
        "articles": paginated_articles,
    }


@headlines_router.get("/")
async def get_all_categories_preview():
    """
    Get a preview of headlines from all categories (2 articles each).
    Useful for dashboard/overview pages.
    """
    categories = ["general", "technology", "business", "sports", "health"]
    
    all_previews = {}
    
    for cat in categories:
        try:
            result = await get_headlines(category=cat, page=1, page_size=2)
            all_previews[cat] = result["articles"]
        except Exception as e:
            print(f"Error fetching preview for {cat}: {e}")
            all_previews[cat] = []
    
    return {
        "previews": all_previews,
        "total_categories": len(categories)
    }