from app.database.mongodb import get_database

def get_articles_collection():
    db = get_database()
    if db is None:
        raise Exception("[!] MongoDB not initialized")
    return db["articles"]


async def save_article(article: dict):
    collection = get_articles_collection()
    await collection.update_one(
        {"article_id": article["article_id"]},
        {"$set": article},
        upsert=True
    )
    return article


async def get_article(article_id: str):
    collection = get_articles_collection()
    return await collection.find_one({"article_id": article_id})
