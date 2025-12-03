"""
Equilibria Backend - Main Application Entry Point
Author: Dwain Nicholson
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import structlog
from contextlib import asynccontextmanager

from app.api.routes import auth, recovery, wearables, workouts, users
from app.core.config import settings
from app.db.session import engine
from app.db.base import Base

# Initialize structured logging
logger = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    # Startup
    logger.info("Starting Equilibria API", version="1.0.0")
    
    # Run migrations on startup
    try:
        from alembic.config import Config
        from alembic import command
        alembic_cfg = Config("alembic.ini")
        command.upgrade(alembic_cfg, "head")
        logger.info("Database migrations completed")
    except Exception as e:
        logger.error("Migration failed", error=str(e))
    
    yield
    # Shutdown
    logger.info("Shutting down Equilibria API")


app = FastAPI(
    title="Equilibria API",
    description="Recovery-Focused Fitness App Backend",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled exception", exc_info=exc, path=request.url.path)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error occurred"}
    )


# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "equilibria-api",
        "version": "1.0.0"
    }


# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])
app.include_router(recovery.router, prefix="/api/v1/recovery", tags=["Recovery"])
app.include_router(wearables.router, prefix="/api/v1/wearables", tags=["Wearables"])
app.include_router(workouts.router, prefix="/api/v1/workouts", tags=["Workouts"])


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
