"""
Workout and workout session endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import structlog

from app.db.session import get_db
from app.db.models import User, Workout, WorkoutSession
from app.schemas.auth import WorkoutCreate, WorkoutResponse, WorkoutSessionCreate, WorkoutSessionResponse
from app.core.security import get_current_active_user

router = APIRouter()
logger = structlog.get_logger()


@router.post("/", response_model=WorkoutResponse, status_code=status.HTTP_201_CREATED)
def create_workout(
    workout_data: WorkoutCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new workout plan or template"""
    new_workout = Workout(
        user_id=current_user.id,
        name=workout_data.name,
        description=workout_data.description,
        workout_type=workout_data.workout_type,
        is_template=workout_data.is_template,
        exercises=workout_data.exercises
    )
    
    db.add(new_workout)
    db.commit()
    db.refresh(new_workout)
    
    logger.info(
        "Workout created",
        user_id=current_user.id,
        workout_id=new_workout.id,
        name=new_workout.name
    )
    
    return new_workout


@router.get("/", response_model=List[WorkoutResponse])
def get_workouts(
    templates_only: bool = False,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all workouts for the current user"""
    query = db.query(Workout).filter(Workout.user_id == current_user.id)
    
    if templates_only:
        query = query.filter(Workout.is_template == True)
    
    workouts = query.order_by(Workout.created_at.desc()).all()
    return workouts


@router.get("/{workout_id}", response_model=WorkoutResponse)
def get_workout(
    workout_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get a specific workout by ID"""
    workout = db.query(Workout).filter(
        Workout.id == workout_id,
        Workout.user_id == current_user.id
    ).first()
    
    if not workout:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workout not found"
        )
    
    return workout


@router.put("/{workout_id}", response_model=WorkoutResponse)
def update_workout(
    workout_id: int,
    workout_data: WorkoutCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update an existing workout"""
    workout = db.query(Workout).filter(
        Workout.id == workout_id,
        Workout.user_id == current_user.id
    ).first()
    
    if not workout:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workout not found"
        )
    
    workout.name = workout_data.name
    workout.description = workout_data.description
    workout.workout_type = workout_data.workout_type
    workout.is_template = workout_data.is_template
    workout.exercises = workout_data.exercises
    
    db.commit()
    db.refresh(workout)
    
    logger.info("Workout updated", user_id=current_user.id, workout_id=workout_id)
    
    return workout


@router.delete("/{workout_id}")
def delete_workout(
    workout_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete a workout"""
    workout = db.query(Workout).filter(
        Workout.id == workout_id,
        Workout.user_id == current_user.id
    ).first()
    
    if not workout:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workout not found"
        )
    
    db.delete(workout)
    db.commit()
    
    logger.info("Workout deleted", user_id=current_user.id, workout_id=workout_id)
    
    return {"message": "Workout deleted successfully"}


# ========== WORKOUT SESSIONS ==========

@router.post("/sessions", response_model=WorkoutSessionResponse, status_code=status.HTTP_201_CREATED)
def log_workout_session(
    session_data: WorkoutSessionCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Log a completed workout session"""
    # Calculate total volume
    total_volume = 0
    for exercise in session_data.exercises_completed:
        if "weight" in exercise and "reps" in exercise and "sets" in exercise:
            total_volume += exercise["weight"] * exercise["reps"] * exercise["sets"]
    
    new_session = WorkoutSession(
        user_id=current_user.id,
        workout_id=session_data.workout_id,
        duration_minutes=session_data.duration_minutes,
        exercises_completed=session_data.exercises_completed,
        total_volume=total_volume if total_volume > 0 else None,
        notes=session_data.notes
    )
    
    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    
    logger.info(
        "Workout session logged",
        user_id=current_user.id,
        session_id=new_session.id,
        volume=total_volume
    )
    
    return new_session


@router.get("/sessions", response_model=List[WorkoutSessionResponse])
def get_workout_sessions(
    limit: int = 50,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get workout session history"""
    sessions = db.query(WorkoutSession).filter(
        WorkoutSession.user_id == current_user.id
    ).order_by(WorkoutSession.session_date.desc()).limit(limit).all()
    
    return sessions


@router.get("/sessions/{session_id}", response_model=WorkoutSessionResponse)
def get_workout_session(
    session_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get a specific workout session"""
    session = db.query(WorkoutSession).filter(
        WorkoutSession.id == session_id,
        WorkoutSession.user_id == current_user.id
    ).first()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workout session not found"
        )
    
    return session