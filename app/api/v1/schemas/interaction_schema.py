from pydantic import BaseModel
from typing import Literal, List

# Request schema (what user sends)
class InteractionCreateSchema(BaseModel):
    user_id: str
    article_id: str
    topic: str
    keywords: List[str]  # new field for personalization
    interaction_type: Literal["view", "read", "like", "save", "dislike"]


# Response schema (what we return)
class InteractionResponseSchema(BaseModel):
    message: str
    user_id: str
    article_id: str
    topic: str
    updated_profile: dict  # return updated scores so user sees learned behavior
