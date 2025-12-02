from newspaper import Article
import requests
from bs4 import BeautifulSoup
from typing import Optional

def fetch_full_article(url: str) -> Optional[str]:
    """
    Fetch full article content from URL.
    Falls back to basic scraping if newspaper3k fails.
    """
    try:
        # Method 1: newspaper3k (best for news articles)
        article = Article(url)
        article.download()
        article.parse()
        
        if article.text and len(article.text) > 200:
            return article.text
            
    except Exception as e:
        print(f"Newspaper3k failed for {url}: {e}")
    
    # Method 2: Fallback with requests + BeautifulSoup
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(url, timeout=10, headers=headers)
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Remove unwanted elements
        for element in soup(["script", "style", "nav", "footer", "header", "aside"]):
            element.decompose()
        
        # Get text from paragraphs
        paragraphs = soup.find_all('p')
        text = ' '.join([p.get_text().strip() for p in paragraphs if p.get_text().strip()])
        
        return text if len(text) > 200 else None
        
    except Exception as e:
        print(f"Fallback scraping failed for {url}: {e}")
        return None