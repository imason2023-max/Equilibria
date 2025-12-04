# Equilibria – Recovery-Driven Training Companion

### Project Memebers: Ian Mason, Dwain Nicholson, Fenthon Aristhomene, Andrew Naranjo, Kadeem Wilks

Equilibria is a fitness and lifting app that helps lifters make smarter training decisions by focusing on **recovery first**.  
Instead of just tracking sets and reps, Equilibria combines **daily check-ins**, **HRV and wearable data**, and **workout logging** to compute a recovery score and suggest whether users should train heavy, go lighter, or rest.

This repo contains the **final integrated version** of the project, including:

- 📱 React Native (Expo) mobile frontend  
- 🧠 FastAPI backend with recovery engine & recommendations  
- 🗄️ PostgreSQL database schema and integration  
- 📄 Architecture documentation and project artifacts  

---

# TO GET STARTED:
- Visit `docs/GETTING_STARTED.md` – it breaks down everything you need to start using our app.


## 🌟 Key Features

- **User Authentication**  
  - Register, log in, log out  
  - JWT-based authentication with protected API routes  

- **Daily Recovery Check-In**  
  - Users input sleep, soreness, energy, and (optionally) HRV/wearable metrics  
  - Backend computes a 1–10 recovery score  
  - App suggests: **Heavy**, **Moderate**, or **Rest** day  

- **Workout Builder & Templates**  
  - Exercise library by muscle group  
  - Templates for PPL (Push–Pull–Legs), Upper/Lower, Full Body, etc.  
  - Users can drag-and-drop or select exercises to build custom workouts  

- **Workout Logging & History**  
  - Log sessions with sets, reps, load, and RPE  
  - View past workouts and session details  
  - Track progression over time  

- **Weekly Insights**  
  - Aggregated view of recovery trends and training volume  
  - Highlights overtraining/undertraining risk  
  - Uses recovery score + workout data to show how well users follow recommendations  

- **Wearable Data Integration (Prototype)**  
  - Designed to consume HRV / heart-rate data from Apple Health / Google Fit / BLE devices  
  - Currently integrated via API endpoints and mock/simulated data for this phase  

---

## 🧱 High-Level Architecture

Equilibria follows a **client–server architecture**:

- **Frontend (React Native + Expo)**  
  - Implements all screens: Login, Register, Dashboard, Daily Check-In, Workout Builder, History, Weekly Insights, etc.  
  - Communicates with the backend over HTTPS using a shared base URL.  
  - Stores the JWT access token in AsyncStorage for authenticated requests.

- **Backend (FastAPI)**  
  - Exposes RESTful APIs under `/api/v1/...` for auth, recovery, workouts, and insights.  
  - Contains the **Recovery Engine**, which computes the recovery score and training recommendation.  
  - Persists users, workouts, and recovery logs in PostgreSQL.  

- **Database (PostgreSQL)**  
  - Stores user accounts, workout templates, sessions, and daily recovery logs.  

For full diagrams and deep-dive details, see:

- `docs/ARCHITECTURE.md` – Architecture, data flow, and database schema  
- `backend/README.md` – Backend endpoints, stack, and setup  
- `docs/TEAM_ROLES.md` – Breakdown of team responsibilities
- `frontend/README.md` – Frontend endpoints, stack, and setup
- `docs/USE_CASES.md` - Use Cases Included

---

## 📁 Project Structure

```text
.
├── backend/                 # FastAPI backend (API, recovery engine, DB integration)
│   ├── app/
│   ├── tests/
│   ├── requirements.txt
│   └── README.md            # Backend-specific documentation
│
├── frontend/                # React Native (Expo) mobile app
│   ├── app/                 # Screens, navigation, components
│   ├── api/                 # API client & config (base URL, token handling)
│   ├── assets/
│   ├── package.json
│   └── README_FRONTEND.md   
│
├── docs/                    # Project documentation
│   ├── ARCHITECTURE.md
│   ├── TEAM_ROLES.md        # Team member responsibilities (separate file)
│   └── USE_CASES.md         # Use cases included in the final implementation
│
├── .gitignore
│
│
└── README.md                # This file – top-level project overview
```

## 📌 Notes
This project is a prototype focused on core functionality: recovery scoring, recommendations, workout planning, and historical insights.
Wearable integrations (Apple Health, Google Fit, BLE sensors) are architected but may rely on mocked/simulated data in this phase.
The app currently runs via Expo dev environment and a deployed FastAPI backend hosted on Render.
