from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Config
from app.core.config import settings

# DB Connections
from app.database.mongodb import connect_to_mongo, close_mongo_connection
from app.database.redis_client import redis_client

# Routers
from app.api.v1.routes.user_routes import user_router
from app.api.v1.routes.news_routes import news_router
from app.api.v1.routes.interaction_routes import interaction_router
from app.api.v1.routes.recommendation_routes import rec_router
from app.api.v1.routes.admin_routes import admin_router
from app.api.v1.routes.headlines_routes import headlines_router



# -----------------------------
#       CREATE APP INSTANCE
# -----------------------------
app = FastAPI(
    title="AI News Recommender",
    version="1.0.0",
    description="FastAPI backend for personalized news recommendation using MongoDB, Redis, and ML models."
)


# -----------------------------
#       CORS MIDDLEWARE
# -----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # update later with frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------------
#       STARTUP EVENT
# -----------------------------
@app.on_event("startup")
async def startup_event():
    print("[*] Connecting to MongoDB...")
    await connect_to_mongo()
    print("[+] MongoDB Connected")

    print("[*] Connecting to Redis...")
    redis_client.ping()
    print("[+] Redis Connected")


# -----------------------------
#       SHUTDOWN EVENT
# -----------------------------
@app.on_event("shutdown")
async def shutdown_event():
    print("[-] Closing MongoDB connection...")
    await close_mongo_connection()
    print("[*] Shutdown complete.")


# -----------------------------
#          ROUTES
# -----------------------------
app.include_router(user_router, prefix="/api/v1/users", tags=["Users"])
app.include_router(news_router, prefix="/api/v1/news", tags=["News"])
app.include_router(interaction_router, prefix="/api/v1/interactions", tags=["Interactions"])
app.include_router(rec_router, prefix="/api/v1/recommendations", tags=["Recommendations"])
app.include_router(admin_router, prefix="/api/v1/admin", tags=["Admin"])
# Add this line where you register other routers
app.include_router(headlines_router, prefix="/api/v1/headlines")

# -----------------------------
#            ROOT
# -----------------------------
@app.get("/")
async def root():
    return {"message": "AI News Recommender API is running"}
