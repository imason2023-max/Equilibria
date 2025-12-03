"""
User profile management endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import structlog

from app.db.session import get_db
from app.db.models import User
from app.schemas.auth import UserResponse
from app.core.security import get_current_active_user, get_password_hash

router = APIRouter()
logger = structlog.get_logger()


class UserProfileUpdate(BaseModel):
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    age: Optional[int] = None
    fitness_level: Optional[str] = None


class PasswordChange(BaseModel):
    current_password: str
    new_password: str


@router.get("/profile", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_active_user)):
    """Get current user's profile"""
    return current_user


@router.put("/profile", response_model=UserResponse)
def update_profile(
    profile_data: UserProfileUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update user profile information"""
    if profile_data.height_cm is not None:
        current_user.height_cm = profile_data.height_cm
    if profile_data.weight_kg is not None:
        current_user.weight_kg = profile_data.weight_kg
    if profile_data.age is not None:
        current_user.age = profile_data.age
    if profile_data.fitness_level is not None:
        current_user.fitness_level = profile_data.fitness_level
    
    db.commit()
    db.refresh(current_user)
    
    logger.info("User profile updated", user_id=current_user.id)
    
    return current_user


@router.post("/change-password")
def change_password(
    password_data: PasswordChange,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Change user password"""
    from app.core.security import verify_password
    
    # Verify current password
    if not verify_password(password_data.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    # Update to new password
    current_user.hashed_password = get_password_hash(password_data.new_password)
    db.commit()
    
    logger.info("Password changed", user_id=current_user.id)
    
    return {"message": "Password changed successfully"}


@router.delete("/account")
def delete_account(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete user account"""
    current_user.is_active = False
    db.commit()
    
    logger.info("User account deactivated", user_id=current_user.id)
    
    return {"message": "Account deactivated successfully"}