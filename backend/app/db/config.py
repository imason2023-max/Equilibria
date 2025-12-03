"""
Configuration settings for Equilibria API
"""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # App Settings
    APP_NAME: str = "Equilibria"
    DEBUG: bool = True
    
    # Database
    DATABASE_URL: str = "postgresql://equilibria_user:equilibria_pass@postgres:5432/equilibria_db"
    
    # JWT Settings
    SECRET_KEY: str = "your-secret-key-change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8081",
        "http://localhost:19006",
    ]
    
    # Redis & Celery
    REDIS_URL: str = "redis://redis:6379/0"
    CELERY_BROKER_URL: str = "redis://redis:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://redis:6379/0"
    
    # Wearable API Keys
    APPLE_HEALTH_KEY: str = ""
    GOOGLE_FIT_CLIENT_ID: str = ""
    GOOGLE_FIT_CLIENT_SECRET: str = ""
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()