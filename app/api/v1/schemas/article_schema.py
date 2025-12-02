from pydantic import BaseModel
from typing import Optional, List

class ArticleSchema(BaseModel):
    article_id: str
    title: str
    summary: Optional[str]
    url: str
    source: Optional[str]
    topic: str
    keywords: Optional[List[str]]  # <-- NEW
