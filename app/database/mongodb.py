from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

client = None
_db = None

def get_database():
    """Get the database instance"""
    return _db

# async def connect_to_mongo():
#     global client, db
#     try:
#         client = AsyncIOMotorClient(
#             settings.MONGO_URI,
#             tls=True,
#             tlsAllowInvalidCertificates=True  # Atlas requires this for python local SSL
#         )
#         db = client[settings.MONGO_DB]
#         print("✅ Connected to MongoDB Atlas")
#     except Exception as e:
#         print("❌ MongoDB Atlas connection failed:", e)
#         db = None

async def connect_to_mongo():
    global client, _db
    try:
        print("Connecting to MongoDB...")
        # print("URI:", settings.MONGO_URI)

        client = AsyncIOMotorClient(
            settings.MONGO_URI,
            serverSelectionTimeoutMS=5000
        )
        _db = client[settings.MONGO_DB]

        # Test the connection
        await client.admin.command('ping')
        
        print("DB Object:", _db)
        print("Database name:", _db.name)
        print("Collections:", await _db.list_collection_names())

        print("[+] MongoDB Atlas: Connected")
    except Exception as e:
        print("[!] MongoDB connection failed:", e)
        import traceback
        traceback.print_exc()
        _db = None


async def close_mongo_connection():
    global client
    if client:
        client.close()
        print("[-] MongoDB connection closed")
