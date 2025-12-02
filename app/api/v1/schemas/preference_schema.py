from pydantic import BaseModel
from typing import List

# Request: When user sets or updates preferences
class PreferenceUpdateSchema(BaseModel):
    user_id: str
    interests: List[str]

# Response: What we return back
class PreferenceResponseSchema(BaseModel):
    user_id: str
    interests: List[str]
