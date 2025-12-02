from pydantic_settings import BaseSettings
from dotenv import load_dotenv
load_dotenv()

class Settings(BaseSettings):
    MONGO_URI: str
    MONGO_DB: str = "news_recommender"

    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379

    NEWS_API_KEY: str
    ADMIN_SECRET: str = "admin123"
    
    # JWT Configuration
    JWT_SECRET_KEY: str = "hiii-this-is-mohith's-secret-key"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    class Config:
        env_file = ".env"

settings = Settings()
