from app.services.user_service import *

async def save_preferences(data):
    return await store_preferences(data)

async def get_preferences(user_id):
    return await fetch_preferences(user_id)

async def save_interaction(data):
    return await store_interaction(data)
