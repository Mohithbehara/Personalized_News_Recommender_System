from pydantic import BaseModel
from typing import List
from .article_schema import ArticleSchema

class RecommendationResponseSchema(BaseModel):
    user_id: str
    feed_content: int
    personalized_news: List[ArticleSchema]
    collaborative_suggestions: List[str]
