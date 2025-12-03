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
```

### Option B — Local (Uvicorn)
```bash
pip install -r requirements.txt
uvicorn main:app --reload
```

## 🧪 Testing
- **Swagger UI**
- **Interactive API documentation is available at:**
```bash
http://localhost:8000/docs
```
Use the built-in “Try It Out” feature to test individual endpoints.

## Pytest Suite
**A collection of automated tests is included to ensure reliability of the API and logic components.
Run all tests:**
```bash
pytest
```
**These tests include:**
- Endpoint response validation
- Error and edge-case handling
- Recovery-engine logic tests

## React Native UI Test (Kadeem’s Component)
If applicable, run the UI test included with the Daily Recovery screen:
```bash
npm test
```

## 🛠 Additional Tools
**Admin Dashboard**
An  HTML dashboard is available for quick backend inspection and debugging:
```bash
admin_dashboard.html
```

## 🌐 Deployment
The backend supports cloud deployment and containerization. It is compatible with:
**Render — backend hosting + PostgreSQL**
**Docker — containerized development and production builds**
**Upstash Redis — caching layer for performance optimizations**
Deployment is handled using a combination of Docker, environment variables, and platform-specific build hooks.

---

## 👥 Developer Contributions
# Dwain
- Designed and implemented the main backend architecture
- Built authentication system, workout routes, and database layer
- Set up Docker configuration, Redis caching, Celery workers, and deployment pipeline
# Fenthon
- Developed the primary recovery engine, including scoring and recommendation logic
- Implemented progression and intensity rules
- Integrated recovery algorithms into the backend’s routing and service architecture
# Kadeem
- Added a supplemental recovery engine implementation
- Contributed additional endpoints (insights, profile, status checks)
- Created Pytest test suite and a lightweight admin dashboard for debugging
---
