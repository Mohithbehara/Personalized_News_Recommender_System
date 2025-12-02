from fastapi import APIRouter, HTTPException
from app.api.v1.schemas.interaction_schema import InteractionCreateSchema, InteractionResponseSchema
from app.api.v1.models.interaction_model import record_interaction, get_saved_articles
from app.database.mongodb import get_database
from bson import ObjectId

interaction_router = APIRouter(tags=["Interactions"])


@interaction_router.post("/add", response_model=InteractionResponseSchema)
async def add_user_interaction(data: InteractionCreateSchema):
    """Record user interaction (like, save, dislike, read, view)"""
    
    if not data.keywords or len(data.keywords) == 0:
        raise HTTPException(status_code=400, detail="Keywords cannot be empty")

    try:
        profile = await record_interaction(data.dict())

        return InteractionResponseSchema(
            message="Interaction saved and profile updated",
            user_id=data.user_id,
            article_id=data.article_id,
            topic=data.topic,
            updated_profile=profile
        )
    except Exception as e:
        print(f"Error recording interaction: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to save interaction: {str(e)}")


@interaction_router.get("/saved/{user_id}")
async def get_user_saved_articles(user_id: str):
    """Get all saved articles for a user"""
    try:
        saved_articles = await get_saved_articles(user_id)
        return {
            "user_id": user_id,
            "count": len(saved_articles),
            "articles": saved_articles
        }
    except Exception as e:
        print(f"Error fetching saved articles: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch saved articles: {str(e)}")
