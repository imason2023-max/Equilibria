"""
Recovery endpoints: Log recovery data, get recovery score and recommendations
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List
import structlog

from app.db.session import get_db
from app.db.models import User, RecoveryLog, WearableData
from app.schemas.auth import RecoveryInput, RecoveryResponse
from app.core.security import get_current_active_user

# TODO: Import Fenthon's modules when ready
# from app.integration.recovery_engine import calculate_recovery_score
# from app.integration.recommendation_rules import get_workout_recommendation

router = APIRouter()
logger = structlog.get_logger()


def calculate_recovery_score_placeholder(recovery_data: dict, wearable_data: dict = None) -> float:
    """
    PLACEHOLDER: This will be replaced with Fenthon's recovery_engine.py
    
    To integrate Fenthon's code:
    1. Make sure his recovery_engine.py is in app/integration/
    2. Import: from app.integration.recovery_engine import calculate_recovery_score
    3. Replace this function with his implementation
    """
    sleep = recovery_data.get("sleep_quality", 5)
    soreness = recovery_data.get("soreness_level", 5)
    energy = recovery_data.get("energy_level", 5)
    
    # Invert soreness
    soreness_inverted = 11 - soreness
    
    # Weighted average
    score = (0.4 * sleep) + (0.3 * soreness_inverted) + (0.3 * energy)
    
    # Add HRV if available
    if wearable_data and wearable_data.get("hrv_rmssd"):
        hrv_contribution = min(wearable_data["hrv_rmssd"] / 50, 2)
        score += hrv_contribution
    
    return round(min(max(score, 1), 10), 1)


def get_workout_recommendation_placeholder(recovery_score: float) -> str:
    """
    PLACEHOLDER: This will be replaced with Fenthon's recommendation_rules.py
    
    To integrate Fenthon's code:
    1. Make sure his recommendation_rules.py is in app/integration/
    2. Import: from app.integration.recommendation_rules import get_workout_recommendation
    3. Replace this function with his implementation
    """
    if recovery_score >= 8:
        return "Heavy"
    elif recovery_score >= 5:
        return "Moderate"
    else:
        return "Light/Rest"


@router.post("/log", response_model=RecoveryResponse, status_code=status.HTTP_201_CREATED)
def log_recovery_data(
    recovery_data: RecoveryInput,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Log daily recovery data"""
    # Get latest wearable data if available
    yesterday = datetime.utcnow() - timedelta(days=1)
    wearable = db.query(WearableData).filter(
        WearableData.user_id == current_user.id,
        WearableData.measurement_date >= yesterday
    ).order_by(WearableData.measurement_date.desc()).first()
    
    wearable_dict = None
    if wearable:
        wearable_dict = {
            "hrv_rmssd": wearable.hrv_rmssd,
            "resting_heart_rate": wearable.resting_heart_rate,
            "sleep_duration_minutes": wearable.sleep_duration_minutes
        }
    
    # Calculate recovery score
    recovery_score = calculate_recovery_score_placeholder(
        recovery_data.model_dump(),
        wearable_dict
    )
    
    # Get workout recommendation
    recommendation = get_workout_recommendation_placeholder(recovery_score)
    
    # Create recovery log entry
    new_log = RecoveryLog(
        user_id=current_user.id,
        sleep_hours=recovery_data.sleep_hours,
        sleep_quality=recovery_data.sleep_quality,
        soreness_level=recovery_data.soreness_level,
        energy_level=recovery_data.energy_level,
        stress_level=recovery_data.stress_level,
        recovery_score=recovery_score,
        recommended_intensity=recommendation
    )
    
    db.add(new_log)
    db.commit()
    db.refresh(new_log)
    
    logger.info(
        "Recovery data logged",
        user_id=current_user.id,
        recovery_score=recovery_score,
        recommendation=recommendation
    )
    
    return new_log


@router.get("/history", response_model=List[RecoveryResponse])
def get_recovery_history(
    days: int = 30,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get recovery history"""
    cutoff_date = datetime.utcnow() - timedelta(days=days)
    
    logs = db.query(RecoveryLog).filter(
        RecoveryLog.user_id == current_user.id,
        RecoveryLog.date >= cutoff_date
    ).order_by(RecoveryLog.date.desc()).all()
    
    return logs


@router.get("/latest", response_model=RecoveryResponse)
def get_latest_recovery(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get the most recent recovery score"""
    latest = db.query(RecoveryLog).filter(
        RecoveryLog.user_id == current_user.id
    ).order_by(RecoveryLog.date.desc()).first()
    
    if not latest:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No recovery data found"
        )
    
    return latest


@router.get("/stats")
def get_recovery_stats(
    days: int = 30,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get recovery statistics"""
    cutoff_date = datetime.utcnow() - timedelta(days=days)
    
    logs = db.query(RecoveryLog).filter(
        RecoveryLog.user_id == current_user.id,
        RecoveryLog.date >= cutoff_date,
        RecoveryLog.recovery_score.isnot(None)
    ).all()
    
    if not logs:
        return {
            "average_score": None,
            "total_logs": 0,
            "days_requested": days
        }
    
    scores = [log.recovery_score for log in logs]
    avg_score = sum(scores) / len(scores)
    
    return {
        "average_score": round(avg_score, 1),
        "highest_score": max(scores),
        "lowest_score": min(scores),
        "total_logs": len(logs),
        "days_requested": days
    }