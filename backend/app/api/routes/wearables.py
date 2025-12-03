"""
Wearable data ingestion endpoints
Handles data from Apple Health, Google Fit, and BLE devices
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List
import structlog

from app.db.session import get_db
from app.db.models import User, WearableData
from app.schemas.auth import WearableDataInput, WearableDataResponse
from app.core.security import get_current_active_user

router = APIRouter()
logger = structlog.get_logger()


def deduplicate_wearable_data(db: Session, user_id: int, source: str, measurement_date: datetime):
    """Check for duplicate entries"""
    existing = db.query(WearableData).filter(
        WearableData.user_id == user_id,
        WearableData.source == source,
        WearableData.measurement_date == measurement_date
    ).first()
    
    return existing


@router.post("/sync", response_model=WearableDataResponse, status_code=status.HTTP_201_CREATED)
def sync_wearable_data(
    data: WearableDataInput,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Sync wearable data from Apple Health, Google Fit, or BLE devices
    
    Data sources:
    - apple_health: Data from Apple HealthKit
    - google_fit: Data from Google Fit API
    - polar_h10: HRV data from Polar H10 chest strap
    """
    # Check for duplicates
    existing = deduplicate_wearable_data(
        db,
        current_user.id,
        data.source,
        data.measurement_date
    )
    
    if existing:
        logger.info(
            "Duplicate wearable data detected, updating existing entry",
            user_id=current_user.id,
            source=data.source,
            date=data.measurement_date
        )
        # Update existing entry
        for key, value in data.model_dump(exclude_unset=True).items():
            if key not in ["source", "measurement_date"] and value is not None:
                setattr(existing, key, value)
        
        existing.sync_timestamp = datetime.utcnow()
        db.commit()
        db.refresh(existing)
        return existing
    
    # Create new entry
    new_data = WearableData(
        user_id=current_user.id,
        source=data.source,
        measurement_date=data.measurement_date,
        hrv_rmssd=data.hrv_rmssd,
        hrv_sdnn=data.hrv_sdnn,
        resting_heart_rate=data.resting_heart_rate,
        avg_heart_rate=data.avg_heart_rate,
        sleep_duration_minutes=data.sleep_duration_minutes,
        deep_sleep_minutes=data.deep_sleep_minutes,
        rem_sleep_minutes=data.rem_sleep_minutes,
        steps=data.steps,
        active_calories=data.active_calories,
        raw_data=data.raw_data
    )
    
    db.add(new_data)
    db.commit()
    db.refresh(new_data)
    
    logger.info(
        "Wearable data synced",
        user_id=current_user.id,
        source=data.source,
        date=data.measurement_date
    )
    
    return new_data


@router.post("/sync/batch", response_model=List[WearableDataResponse])
def sync_wearable_data_batch(
    data_list: List[WearableDataInput],
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Sync multiple wearable data entries at once"""
    results = []
    
    for data in data_list:
        # Check for duplicates
        existing = deduplicate_wearable_data(
            db,
            current_user.id,
            data.source,
            data.measurement_date
        )
        
        if existing:
            # Update existing
            for key, value in data.model_dump(exclude_unset=True).items():
                if key not in ["source", "measurement_date"] and value is not None:
                    setattr(existing, key, value)
            existing.sync_timestamp = datetime.utcnow()
            results.append(existing)
        else:
            # Create new
            new_data = WearableData(
                user_id=current_user.id,
                source=data.source,
                measurement_date=data.measurement_date,
                hrv_rmssd=data.hrv_rmssd,
                hrv_sdnn=data.hrv_sdnn,
                resting_heart_rate=data.resting_heart_rate,
                avg_heart_rate=data.avg_heart_rate,
                sleep_duration_minutes=data.sleep_duration_minutes,
                deep_sleep_minutes=data.deep_sleep_minutes,
                rem_sleep_minutes=data.rem_sleep_minutes,
                steps=data.steps,
                active_calories=data.active_calories,
                raw_data=data.raw_data
            )
            db.add(new_data)
            results.append(new_data)
    
    db.commit()
    for item in results:
        db.refresh(item)
    
    logger.info(
        "Batch wearable sync completed",
        user_id=current_user.id,
        count=len(results)
    )
    
    return results


@router.get("/history", response_model=List[WearableDataResponse])
def get_wearable_history(
    days: int = 30,
    source: str = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get wearable data history"""
    cutoff_date = datetime.utcnow() - timedelta(days=days)
    
    query = db.query(WearableData).filter(
        WearableData.user_id == current_user.id,
        WearableData.measurement_date >= cutoff_date
    )
    
    if source:
        query = query.filter(WearableData.source == source)
    
    data = query.order_by(WearableData.measurement_date.desc()).all()
    
    return data


@router.get("/latest", response_model=WearableDataResponse)
def get_latest_wearable_data(
    source: str = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get the most recent wearable data entry"""
    query = db.query(WearableData).filter(
        WearableData.user_id == current_user.id
    )
    
    if source:
        query = query.filter(WearableData.source == source)
    
    latest = query.order_by(WearableData.measurement_date.desc()).first()
    
    if not latest:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No wearable data found"
        )
    
    return latest


@router.delete("/clear")
def clear_wearable_data(
    days: int = None,
    source: str = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Clear wearable data"""
    query = db.query(WearableData).filter(
        WearableData.user_id == current_user.id
    )
    
    if days:
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        query = query.filter(WearableData.measurement_date < cutoff_date)
    
    if source:
        query = query.filter(WearableData.source == source)
    
    count = query.delete()
    db.commit()
    
    logger.info(
        "Wearable data cleared",
        user_id=current_user.id,
        count=count,
        days=days,
        source=source
    )
    
    return {"message": f"Cleared {count} wearable data entries"}