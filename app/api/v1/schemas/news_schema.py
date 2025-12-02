from pydantic import BaseModel
from typing import List
from app.api.v1.schemas.article_schema import ArticleSchema

class NewsResponse(BaseModel):
    topic: str
    articles: List[ArticleSchema]
