from sumy.summarizers.lex_rank import LexRankSummarizer
from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from transformers import pipeline

# Create both models (lazy load)
extractive_summarizer = LexRankSummarizer()
abstractive_summarizer = pipeline("summarization", model="google/pegasus-xsum")


def extractive_summary(text: str, sentences: int = 3):
    if not text or len(text.strip()) < 50:
        return None
    
    try:
        parser = PlaintextParser.from_string(text, Tokenizer("english"))
        summary = extractive_summarizer(parser.document, sentences)
        return " ".join([str(sentence) for sentence in summary])
    except Exception as e:
        print(f"Extractive summary error: {e}")
        return None


def abstractive_summary(text: str):
    if not text or len(text.strip()) < 50:
        return None
    
    try:
        # Pegasus can handle ~1024 tokens input
        # If text is too long, pre-summarize with extractive
        if len(text.split()) > 800:
            text = extractive_summary(text, sentences=15) or text[:3000]
        
        result = abstractive_summarizer(
            text, 
            max_length=130,  # Increased for better summaries
            min_length=30, 
            do_sample=False,
            truncation=True
        )
        return result[0]["summary_text"]
    except Exception as e:
        print(f"Abstractive summary error: {e}")
        return None


def summarize_article(article: dict, method: str = "extractive") -> str:
    """
    Summarize article using full content if available.
    
    Args:
        article: Article dict from GNews (must have 'full_content' or 'content')
        method: 'extractive' or 'abstractive'
    """
    # Use full content if available, else fall back to truncated
    text = article.get('full_content') or article.get('content', '')
    
    if not text:
        return "Summary unavailable - no content found."
    
    if method == "extractive":
        summary = extractive_summary(text, sentences=3)
    else:
        summary = abstractive_summary(text)
    
    return summary or "Summary generation failed."