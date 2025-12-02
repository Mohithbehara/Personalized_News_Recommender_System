from rake_nltk import Rake
import nltk

# Ensure stopwords data is available
nltk.download("stopwords", quiet=True)
nltk.download("punkt", quiet=True)

rake = Rake()

def extract_keywords(text: str, max_keywords: int = 5):
    if not text:
        return []

    rake.extract_keywords_from_text(text)
    keywords = rake.get_ranked_phrases()

    return keywords[:max_keywords]
