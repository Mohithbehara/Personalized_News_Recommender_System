from fastapi import APIRouter, HTTPException
from app.api.v1.schemas.preference_schema import PreferenceUpdateSchema, PreferenceResponseSchema
from app.api.v1.models.preference_model import update_preferences, get_preferences

preference_router = APIRouter(prefix="/preferences", tags=["Preferences"])


@preference_router.post("/update", response_model=PreferenceResponseSchema)
async def update_user_preferences(data: PreferenceUpdateSchema):
    return await update_preferences(data.user_id, data.interests)


@preference_router.get("/{user_id}", response_model=PreferenceResponseSchema)
async def get_user_preferences(user_id: str):
    prefs = await get_preferences(user_id)
    if not prefs:
        raise HTTPException(status_code=404, detail="Preferences not found")
    return PreferenceResponseSchema(**prefs)
