# Equilibria – Backend Overview

The Equilibria backend is a **FastAPI-based system** that powers user authentication, recovery scoring, workout management, and wearable data integration. It supports containerized deployment, background task processing, and full API testing.

---

## 🚀 Features

### Authentication
- Register users  
- Login with JWT token  
- Fetch current authenticated user  

**Endpoints**
- `POST /api/v1/auth/register`  
- `POST /api/v1/auth/login`  
- `GET /api/v1/auth/me`  

---

### Recovery System
Handles all data related to daily user recovery.

**Capabilities**
- Log daily recovery inputs (sleep, soreness, energy, HRV)  
- Compute recovery score and recommended intensity (heavy / light / rest)  
- Retrieve latest recovery log  

**Endpoints**
- `POST /api/v1/recovery/log`  
- `GET /api/v1/recovery/latest`  

**Implementation Sources**
- Core logic from Fenthon (recovery engine, scoring)  
- Supplemental scoring and helper logic from Kadeem  

---

### Workouts
Users can build workout templates and log workout sessions.

**Endpoints**
- `POST /api/v1/workouts/`  
- `POST /api/v1/workouts/sessions`  

---

### Wearable Sync
Integrates external wearable data (HRV, heart rate, activity data).

**Endpoint**
- `POST /api/v1/wearables/sync`  

---

### Insights
Weekly summaries and progress analytics.

**Endpoint**
- `GET /insights/weekly/{user_id}`  

---

## 🧰 Tech Stack
- **FastAPI** (Python 3.11)  
- **PostgreSQL 15**  
- **Redis + Celery** (caching & background tasks)  
- **Docker / Docker Compose**  
- **JWT Authentication**  
- **NumPy / Pandas / SciPy** (data processing)  

---

## 🖥️ Running the Backend

### Option A — Docker (Recommended)
```bash
docker-compose up --build
