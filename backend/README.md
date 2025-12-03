Equilibria – Backend Overview (Summarized)
The Equilibria backend is a FastAPI-based system that powers the recovery-focused fitness application. It supports user authentication, recovery scoring, workout management, and wearable data integration. The backend is fully containerized, deployed, and supports both automated and manual testing.
🚀 Features & Capabilities
Authentication & Users
Register new users
Login and receive JWT token
Fetch current authenticated user
Endpoints:
POST /api/v1/auth/register
POST /api/v1/auth/login
GET /api/v1/auth/me

README
Recovery System
The backend supports full recovery-data ingestion and analysis:
Core Functions:
Log daily recovery inputs (sleep, soreness, energy, HRV)
Calculate a recovery score & intensity recommendation
Retrieve the most recent recovery results
Endpoints:
POST /api/v1/recovery/log
GET /api/v1/recovery/latest

README
Implementation Sources:
Recovery Engine integration module (Fenthon)
Additional scoring & 1RM-adjusted logic (Kadeem) 
README-2
Workout System
Users can create workout templates and log sessions.
Endpoints:
POST /api/v1/workouts/
POST /api/v1/workouts/sessions

README
Wearable Data Integration
Endpoint to sync wearable metrics (e.g., HRV)
Integrates into recovery algorithm
Endpoint:
POST /api/v1/wearables/sync

README
Insights System
Weekly or historical summaries for user progress.
Endpoint:
GET /insights/weekly/{user_id}

README-2
🧰 Tech Stack
FastAPI (Python 3.11)
PostgreSQL 15 – main DB
Redis + Celery – caching and background tasks
Docker / Docker Compose – local & cloud deployment
JWT Authentication
NumPy / Pandas / SciPy – data processing

README
🖥️ How to Run Locally
Option A – Using Docker (recommended)
docker-compose up --build
Backend will be available at:
http://localhost:8000

README
Option B – Using Uvicorn (lightweight dev mode)
pip install fastapi uvicorn pydantic
uvicorn main:app --reload

README-2
🧪 Testing
API Testing via Browser
Visit the interactive documentation:
/docs
Use “Try It Out” to test any endpoint.

README
Kadeem’s Pytest Suite
pytest
Includes:
API endpoint validation
Input/output structure tests
Error handling tests

README-2
React Native UI Testing (Edge Case)
Kadeem’s daily recovery screen has a UI test:
npm test

README-2
🛠 Additional Developer Tools
Admin Dashboard
Simple HTML/JS dashboard for quick inspection:
admin_dashboard.html

README-2
Deployment Notes
Already deployed on:
Render (backend & database)
Upstash (Redis cache)
Docker containers for portability

README
📁 Developer Responsibilities (Merged Summary)
Dwain (Lead Backend)
Created main backend architecture
Set up API routes, database, auth
Handled Docker, Redis, Celery, Render deployment

README
Fenthon (Recovery Engine Integration)
Implements core recovery scoring logic
Implements workout intensity rules & progression tracker
Works inside app/integration/

README
Kadeem (Backend Support & QA)
Added additional recovery logic implementation
Added backend endpoints (/profile, /insights, /check-status)
Built admin dashboard
Built Pytest test suite

README-2
