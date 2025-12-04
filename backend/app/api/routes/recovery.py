"""
Recovery endpoints: Log recovery data, get recovery score and recommendations
NOW USING FENTHON'S PRODUCTION RECOVERY ENGINE!
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


from integration.recovery_engine import calculate_recovery_score
from integration.recommendation_rules import get_workout_recommendation

router = APIRouter()
logger = structlog.get_logger()


@router.post("/log", response_model=RecoveryResponse, status_code=status.HTTP_201_CREATED)
def log_recovery_data(
    recovery_data: RecoveryInput,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Log daily recovery data
    
    Uses Fenthon's advanced recovery engine to calculate score based on:
    - Sleep quality and duration
    - Soreness level (inverted)
    - Energy level
    - Stress level (inverted)
    - Optional wearable data (HRV, resting heart rate)
    """
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
    
    # ✅ Calculate recovery score using Fenthon's production algorithm
    recovery_score = calculate_recovery_score(
        recovery_data.model_dump(),
        wearable_dict
    )
    
    # ✅ Get workout recommendation using Fenthon's production rules
    recommendation = get_workout_recommendation(recovery_score)
    
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
        recommendation=recommendation,
        engine_version="fenthon_production_v1"
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
