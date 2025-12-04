# Equilibria System Architecture

**Director: Ian Mason**

## Overview

Equilibria is a recovery-focused fitness application that helps users optimize their training by monitoring recovery metrics and providing intelligent workout recommendations. The system uses a modern microservices architecture with a React Native mobile frontend, FastAPI backend, and PostgreSQL database.

---

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER DEVICES                             │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   iPhone     │  │   Android    │  │   Wearables  │         │
│  │  (Expo App)  │  │  (Expo App)  │  │ Apple Watch  │         │
│  └───────┬──────┘  └───────┬──────┘  └──────┬───────┘         │
│          │                  │                 │                  │
└──────────┼──────────────────┼─────────────────┼─────────────────┘
           │                  │                 │
           │  HTTPS/REST API  │                 │ HealthKit/
           │  (JWT Auth)      │                 │ Google Fit API
           ▼                  ▼                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND API LAYER (Render)                    │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    FastAPI (Python 3.11)                  │  │
│  │                                                            │  │
│  │  ┌────────────┐  ┌─────────────┐  ┌──────────────┐      │  │
│  │  │    Auth    │  │  Recovery   │  │   Workouts   │      │  │
│  │  │  Endpoints │  │  Endpoints  │  │  Endpoints   │      │  │
│  │  └────────────┘  └─────────────┘  └──────────────┘      │  │
│  │                                                            │  │
│  │  ┌────────────┐  ┌─────────────┐  ┌──────────────┐      │  │
│  │  │ Wearables  │  │   Users     │  │   Insights   │      │  │
│  │  │ Endpoints  │  │  Endpoints  │  │  Endpoints   │      │  │
│  │  └────────────┘  └─────────────┘  └──────────────┘      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              BUSINESS LOGIC LAYER                         │  │
│  │                                                            │  │
│  │  ┌────────────────────┐  ┌─────────────────────┐         │  │
│  │  │  Recovery Engine   │  │  Recommendation      │         │  │
│  │  │  (Fenthon)         │  │  Rules (Fenthon)     │         │  │
│  │  │  - Score calc      │  │  - Heavy/Moderate    │         │  │
│  │  │  - HRV analysis    │  │  - Light/Rest        │         │  │
│  │  │  - Sleep metrics   │  │                      │         │  │
│  │  └────────────────────┘  └─────────────────────┘         │  │
│  │                                                            │  │
│  │  ┌────────────────────┐  ┌─────────────────────┐         │  │
│  │  │ Progression        │  │  JWT Security        │         │  │
│  │  │ Tracker (Fenthon)  │  │  (Dwain)             │         │  │
│  │  └────────────────────┘  └─────────────────────┘         │  │
│  └──────────────────────────────────────────────────────────┘  │
└──────────────────────────┬───────────────────────────────────────┘
                           │
                           │ SQLAlchemy ORM
                           │ Alembic Migrations
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATA LAYER (Render)                           │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              PostgreSQL 18 Database                       │  │
│  │                                                            │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐  │  │
│  │  │  users   │  │ recovery │  │ workouts │  │wearable │  │  │
│  │  │          │  │   _logs  │  │          │  │  _data  │  │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └─────────┘  │  │
│  │                                                            │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐               │  │
│  │  │ workout  │  │exercise  │  │  sets    │               │  │
│  │  │ sessions │  │templates │  │          │               │  │
│  │  └──────────┘  └──────────┘  └──────────┘               │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Redis Cache                            │  │
│  │          (Session Management & Task Queue)                │  │
│  └──────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Component Breakdown

### 1. Frontend Layer (React Native + Expo)
**Developer:** Andrew Naranjo

**Technology Stack:**
- React Native 0.81.5
- Expo ~54.0
- TypeScript
- React Navigation
- Axios for API calls
- AsyncStorage for offline support

**Key Features:**
- User authentication (register/login)
- Daily check-in screens
- Recovery score display
- Workout builder (drag-and-drop)
- Workout session logging
- Offline-first architecture
- Wearable data sync interface

**Screens:**
```
├── Auth
│   ├── LoginScreen
│   └── RegisterScreen
├── Main (Tabs)
│   ├── DashboardScreen
│   ├── DailyCheckInScreen
│   ├── WorkoutBuilderScreen
│   └── WeeklyInsightsScreen
└── Details
    ├── WorkoutHistoryScreen
    ├── WorkoutDetailsScreen
    └── WorkoutSessionDetailsScreen
```

---

### 2. Backend API Layer (FastAPI)
**Developer:** Dwain Nicholson

**Technology Stack:**
- FastAPI 0.109.0
- Python 3.11+
- Uvicorn/Gunicorn (ASGI server)
- Pydantic for validation
- python-jose for JWT
- passlib for password hashing

**API Structure:**
```
/api/v1/
├── /auth
│   ├── POST /register
│   ├── POST /login
│   └── GET /me
├── /recovery
│   ├── POST /log
│   ├── GET /latest
│   ├── GET /history
│   └── GET /stats
├── /workouts
│   ├── POST /
│   ├── GET /
│   ├── GET /{id}
│   └── POST /sessions
├── /wearables
│   └── POST /sync
└── /users
    ├── GET /me
    └── PUT /me
```

**Authentication Flow:**
```
1. User → POST /register → Backend creates user
2. User → POST /login → Backend returns JWT token
3. User → Stores token in AsyncStorage
4. User → All requests include: Authorization: Bearer {token}
5. Backend → Validates token → Returns data
```

---

### 3. Business Logic Layer

#### 3a. Recovery Engine (Fenthon Aristhomene)

**Algorithm Overview:**

The recovery score (1-10 scale) is calculated using a multi-factor weighted system:

**Base Score Calculation:**
```python
base_score = (
    0.30 * sleep_quality +      # 30% weight
    0.25 * soreness_inverted +  # 25% weight (11 - soreness)
    0.20 * energy_level +       # 20% weight
    0.15 * stress_inverted      # 15% weight (11 - stress)
)
```

**Sleep Duration Modifier:**
```
if sleep_hours < 5:    multiply by 0.8  (20% penalty)
if sleep_hours < 6:    multiply by 0.9  (10% penalty)
if 6 ≤ sleep ≤ 8.5:    multiply by 1.0  (optimal)
if sleep > 8.5:        multiply by 1.05 (5% bonus)
```

**HRV (Heart Rate Variability) Bonus:**
```
if HRV ≥ 80 ms:   +0.7 points
if HRV ≥ 60 ms:   +0.4 points
if HRV ≥ 40 ms:   +0.2 points
if HRV ≥ 20 ms:   +0.0 points
if HRV < 20 ms:   -0.3 points
```

**Resting Heart Rate Adjustment:**
```
if RHR ≤ 50 bpm:  +0.3 points
if RHR ≤ 60 bpm:  +0.15 points
if RHR ≤ 70 bpm:  +0.0 points
if RHR ≤ 80 bpm:  -0.2 points
if RHR > 80 bpm:  -0.4 points
```

**Final Score:** Clamped between 1.0 and 10.0, rounded to 1 decimal place

#### 3b. Recommendation Rules (Fenthon Aristhomene)

Based on recovery score, workout intensity is recommended:

```python
if recovery_score >= 8.0:
    return "Heavy"       # High-intensity training
elif recovery_score >= 5.0:
    return "Moderate"    # Normal training
else:
    return "Light/Rest"  # Active recovery or rest
```

**Training Guidelines:**

- **Heavy (8-10):** Full intensity, progressive overload, max effort sets
- **Moderate (5-7.9):** Normal training, controlled intensity
- **Light/Rest (1-4.9):** Active recovery, mobility work, or complete rest

#### 3c. Progression Tracker (Fenthon Aristhomene)

Tracks exercise performance over time:
- Stores best lifts per exercise
- Monitors weight progression
- Suggests next target loads
- Calculates estimated 1RM

---

### 4. Data Layer

#### 4a. PostgreSQL Database (Version 18)

**Database Schema:**

**users table:**
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

**recovery_logs table:**
```sql
CREATE TABLE recovery_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    date TIMESTAMP DEFAULT NOW(),
    sleep_hours FLOAT,
    sleep_quality INTEGER,
    soreness_level INTEGER,
    energy_level INTEGER,
    stress_level INTEGER,
    recovery_score FLOAT,
    recommended_intensity VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW()
);
```

**wearable_data table:**
```sql
CREATE TABLE wearable_data (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    source VARCHAR(50),  -- 'apple_health', 'google_fit', etc.
    measurement_date TIMESTAMP,
    hrv_rmssd FLOAT,
    hrv_sdnn FLOAT,
    resting_heart_rate INTEGER,
    avg_heart_rate INTEGER,
    sleep_duration_minutes INTEGER,
    deep_sleep_minutes INTEGER,
    rem_sleep_minutes INTEGER,
    steps INTEGER,
    active_calories INTEGER,
    raw_data JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
```

**workouts table:**
```sql
CREATE TABLE workouts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    name VARCHAR(255),
    description TEXT,
    workout_type VARCHAR(50),
    is_template BOOLEAN DEFAULT FALSE,
    exercises JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
```

**workout_sessions table:**
```sql
CREATE TABLE workout_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    workout_id INTEGER REFERENCES workouts(id),
    date TIMESTAMP DEFAULT NOW(),
    duration_minutes INTEGER,
    exercises_completed JSONB,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### 4b. Redis Cache

**Usage:**
- Session management
- Token blacklist (for logout)
- Rate limiting
- Celery task queue (background jobs)

---

## Data Flow Diagrams

### User Registration Flow
```
User Input → Frontend Validation → POST /api/v1/auth/register
                                          ↓
                                    Hash Password
                                          ↓
                                    Save to Database
                                          ↓
                                    Return User Object
                                          ↓
                                    Frontend Stores Data
```

### Recovery Check-In Flow
```
User Input (Sleep, Soreness, Energy, Stress)
            ↓
    Frontend Validation
            ↓
    Save Locally (AsyncStorage) ← Offline Support
            ↓
    POST /api/v1/recovery/log (with JWT token)
            ↓
    Backend Validates Token
            ↓
    Fetch Latest Wearable Data (if available)
            ↓
    Call Fenthon's Recovery Engine
            ├─ Calculate Base Score
            ├─ Apply Sleep Modifier
            ├─ Add HRV Bonus/Penalty
            └─ Add RHR Adjustment
            ↓
    Generate Recommendation (Heavy/Moderate/Light)
            ↓
    Save to recovery_logs table
            ↓
    Return Score + Recommendation
            ↓
    Frontend Updates Dashboard
            ↓
    Mark Local Entry as Synced
```

### Wearable Data Sync Flow
```
Apple Watch/Google Fit → Wearable API (HealthKit/Google Fit)
            ↓
    Frontend Collects Data
            ↓
    POST /api/v1/wearables/sync
            ↓
    Backend Validates & Deduplicates
            ↓
    Save to wearable_data table
            ↓
    Next Recovery Calculation Uses This Data
```

---

## Security Architecture

### Authentication & Authorization

**JWT Token Structure:**
```json
{
  "sub": "user_id",
  "username": "user_name",
  "exp": 1234567890
}
```

**Security Measures:**
1. **Password Hashing:** bcrypt with salt
2. **JWT Tokens:** HS256 algorithm
3. **Token Expiry:** 24 hours (configurable)
4. **HTTPS Only:** All communication encrypted
5. **CORS Configuration:** Controlled origins
6. **SQL Injection Prevention:** SQLAlchemy ORM
7. **Input Validation:** Pydantic models

### API Security Headers
```python
CORS_ORIGINS = [
    "http://localhost:3000",      # Local dev
    "http://localhost:8081",      # Expo dev
    "http://localhost:19006",     # Expo web
    # Production origins added as needed
]
```

---

## Deployment Architecture

### Production Environment (Render.com)

**Backend Service:**
```
Service: equilibria-backend-g5oa
Region: Virginia, US
Instance: Free tier (0.1 CPU, 256MB RAM)
Auto-deploy: Enabled (GitHub main branch)
Health Check: /api/v1/health
```

**Database:**
```
Service: equilibria-db
Type: PostgreSQL 18
Region: Virginia, US
Plan: Free tier (1GB storage)
Backups: Daily
```

**Environment Variables:**
```bash
DATABASE_URL=postgresql://...
SECRET_KEY=<secure-random-string>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
REDIS_URL=redis://...
CORS_ORIGINS=["http://..."]
```

**Deployment Process:**
```
1. Developer pushes to GitHub main branch
2. Render detects commit
3. Runs build: pip install -r requirements.txt
4. Runs migrations: alembic upgrade head
5. Starts service: uvicorn main:app
6. Health check passes
7. Service live
```

### Frontend Deployment (Future)

**Recommended:** Vercel or Netlify for web version
**Mobile:** App Store & Google Play (via EAS Build)

---

## Offline-First Architecture

### Local Storage Strategy

**Frontend (AsyncStorage):**
```javascript
Storage Keys:
- "auth_token"          → JWT token
- "user"                → User object
- "CHECKIN_HISTORY"     → Array of check-ins
- "WORKOUT_HISTORY"     → Array of workout sessions
- "LATEST_RECOVERY"     → Most recent recovery data
```

**Sync Strategy:**
1. **Write:** Save locally first (instant feedback)
2. **Try Sync:** Attempt to sync with backend
3. **Mark Status:** Flag as synced/pending
4. **Background Sync:** Retry failed syncs when online
5. **Conflict Resolution:** Backend data wins

**Example Flow:**
```
1. User offline → Complete check-in
2. Save to AsyncStorage with synced: false
3. Show data immediately on dashboard
4. User back online → Detect connection
5. POST to /api/v1/recovery/log
6. Success → Update local entry: synced: true
7. Failure → Keep pending, retry later
```

---

## Performance Optimization

### Backend Optimizations:
1. **Database Indexing:** On user_id, date fields
2. **Connection Pooling:** SQLAlchemy pool
3. **Query Optimization:** Eager loading relationships
4. **Caching:** Redis for frequent queries
5. **Async Operations:** FastAPI async endpoints

### Frontend Optimizations:
1. **Lazy Loading:** Screens load on demand
2. **Image Optimization:** Compressed assets
3. **Local Caching:** AsyncStorage for data
4. **Debouncing:** Input validation delays
5. **FlatList Optimization:** For large lists

---

## Monitoring & Logging

### Backend Logging (structlog):
```python
logger.info(
    "Recovery data logged",
    user_id=current_user.id,
    recovery_score=recovery_score,
    recommendation=recommendation
)
```

### Error Tracking:
- Sentry integration (future)
- Render logs dashboard
- Custom error endpoints

### Metrics to Monitor:
- API response times
- Database query performance
- User registration rate
- Recovery score distribution
- Wearable sync success rate

---

## Testing Strategy

### Backend Testing:
- **Unit Tests:** Individual functions
- **Integration Tests:** API endpoints
- **Database Tests:** CRUD operations
- **Load Tests:** Concurrent users

### Frontend Testing:
- **Component Tests:** React Native Testing Library
- **Integration Tests:** User flows
- **E2E Tests:** Full app workflows
- **Device Tests:** iOS & Android

---

## Future Enhancements

### Phase 2 Features:
1. Real-time wearable integration
2. Social features (share workouts)
3. Coach/trainer dashboard
4. Advanced analytics & charts
5. Push notifications
6. Progressive overload automation
7. Exercise video library
8. Nutrition tracking integration

### Scalability Plans:
1. Migrate to managed Kubernetes
2. Implement microservices architecture
3. Add CDN for static assets
4. Database read replicas
5. Multi-region deployment

---

## Team Contributions

### Dwain Nicholson (Backend Lead)
- FastAPI backend architecture
- Database design & migrations
- JWT authentication system
- API endpoint implementation
- Deployment & DevOps
- Integration coordination

### Fenthon Aristhomene (Recovery Intelligence)
- Recovery score algorithm
- Recommendation rules engine
- Progression tracking logic
- HRV & sleep analysis
- Wearable data processing

### Andrew Naranjo (Frontend Lead)
- React Native mobile app
- All screen implementations
- Offline-first architecture
- API integration
- UI/UX design
- Navigation system

### Kadeem Wilks (QA & Support)
- Testing & quality assurance
- Bug tracking & reporting
- Admin dashboard development
- Documentation support
- Integration testing

### Ian Mason (Project Management)
- UI/UX design coordination
- Project planning & organization
- GitHub repository management
- Deployment coordination
- Documentation

---

## API Reference Summary

**Base URL:** `https://equilibria-backend-g5oa.onrender.com`

**Authentication:** JWT Bearer token in Authorization header

**Full API Docs:** `https://equilibria-backend-g5oa.onrender.com/docs`

**Key Endpoints:**
- `POST /api/v1/auth/register` - Create new user
- `POST /api/v1/auth/login` - Get JWT token
- `POST /api/v1/recovery/log` - Submit recovery data
- `GET /api/v1/recovery/latest` - Get latest score
- `POST /api/v1/workouts/` - Create workout
- `POST /api/v1/wearables/sync` - Sync wearable data

---

## Conclusion

Equilibria represents a complete, production-ready fitness recovery application with:
- Modern, scalable architecture
- Advanced recovery algorithms
- Professional mobile interface
- Secure authentication
- Offline-first design
- Real-time data sync
- Comprehensive testing

The system is designed to scale from prototype to production with minimal changes.

---

**Document Version:** 1.0  
**Last Updated:** December 2, 2025  
**Maintained by:** Equilibria Development Team
