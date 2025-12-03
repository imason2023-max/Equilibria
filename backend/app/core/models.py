"""
SQLAlchemy Database Models for Equilibria
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # User profile data
    height_cm = Column(Float, nullable=True)
    weight_kg = Column(Float, nullable=True)
    age = Column(Integer, nullable=True)
    fitness_level = Column(String, nullable=True)
    
    # Relationships
    recovery_logs = relationship("RecoveryLog", back_populates="user", cascade="all, delete-orphan")
    wearable_data = relationship("WearableData", back_populates="user", cascade="all, delete-orphan")
    workouts = relationship("Workout", back_populates="user", cascade="all, delete-orphan")
    workout_sessions = relationship("WorkoutSession", back_populates="user", cascade="all, delete-orphan")


class RecoveryLog(Base):
    __tablename__ = "recovery_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(DateTime(timezone=True), server_default=func.now())
    
    # Manual inputs
    sleep_hours = Column(Float, nullable=True)
    sleep_quality = Column(Integer, nullable=True)
    soreness_level = Column(Integer, nullable=True)
    energy_level = Column(Integer, nullable=True)
    stress_level = Column(Integer, nullable=True)
    
    # Calculated score
    recovery_score = Column(Float, nullable=True)
    recommended_intensity = Column(String, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="recovery_logs")


class WearableData(Base):
    __tablename__ = "wearable_data"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    source = Column(String, nullable=False)
    sync_timestamp = Column(DateTime(timezone=True), server_default=func.now())
    
    # HRV Data
    hrv_rmssd = Column(Float, nullable=True)
    hrv_sdnn = Column(Float, nullable=True)
    
    # Heart Rate
    resting_heart_rate = Column(Integer, nullable=True)
    avg_heart_rate = Column(Integer, nullable=True)
    
    # Sleep Data
    sleep_duration_minutes = Column(Integer, nullable=True)
    deep_sleep_minutes = Column(Integer, nullable=True)
    rem_sleep_minutes = Column(Integer, nullable=True)
    
    # Activity
    steps = Column(Integer, nullable=True)
    active_calories = Column(Integer, nullable=True)
    
    raw_data = Column(JSON, nullable=True)
    measurement_date = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="wearable_data")


class Workout(Base):
    __tablename__ = "workouts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    workout_type = Column(String, nullable=True)
    is_template = Column(Boolean, default=False)
    exercises = Column(JSON, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="workouts")


class WorkoutSession(Base):
    __tablename__ = "workout_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    workout_id = Column(Integer, ForeignKey("workouts.id"), nullable=True)
    
    session_date = Column(DateTime(timezone=True), server_default=func.now())
    duration_minutes = Column(Integer, nullable=True)
    exercises_completed = Column(JSON, nullable=False)
    total_volume = Column(Float, nullable=True)
    notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="workout_sessions")


class ExercisePerformance(Base):
    __tablename__ = "exercise_performance"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    session_id = Column(Integer, ForeignKey("workout_sessions.id"), nullable=False)
    
    exercise_name = Column(String, nullable=False, index=True)
    exercise_id = Column(String, nullable=True)
    
    weight_kg = Column(Float, nullable=True)
    reps = Column(Integer, nullable=False)
    sets = Column(Integer, nullable=False)
    rpe = Column(Integer, nullable=True)
    
    estimated_1rm = Column(Float, nullable=True)
    suggested_next_weight = Column(Float, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())