# Equilibria – Getting Started Guide

This guide explains how to install, run, and use the Equilibria app as fast as possible. Follow these steps exactly and you will have both the frontend and backend running with minimal setup.

---

## 🚀 1. Requirements

Before you begin, make sure you have:

### Backend
- Python 3.9+
- pip (Python package manager)

### Frontend
- Node.js (v18+) and npm
- Expo CLI (installed on first run automatically)
- Expo Go app (optional — for testing on your phone)

---

## 🗂️ 2. Clone the Repository

```bash
git clone https://github.com/imason2023-max/Equilibria.git
cd Equilibria
```

---

## 🧠 3. Running the Backend

### If you are using the deployed backend

👉 **You can skip backend setup entirely.**

The deployed API lives at:

```
https://equilibria-backend-g5oa.onrender.com
```

The frontend is already configured to use this URL.

### If you want to run the backend locally:

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

**Local backend URL:**
```
http://localhost:8000
```

**API docs (Swagger):**
```
http://localhost:8000/docs
```

---

## 📱 4. Running the Frontend (React Native + Expo)

1. **Open Terminal → navigate to the frontend folder:**

```bash
cd frontend
```

2. **Install dependencies:**

```bash
npm install
```

3. **Start the Expo development server:**

```bash
npx expo start
```

4. **Choose how to run the app:**
   - Press `w` → open in the web browser
   - Press `i` → run in iOS simulator (Mac only)
   - Press `a` → run in Android emulator
   - Scan QR code with **Expo Go** → run on your phone

---

## 🔗 5. Backend Connection

The frontend reads its backend URL from:

```
frontend/api/config.ts
```

The default is already set to the deployed backend:

```typescript
export const API_URL = "https://equilibria-backend-g5oa.onrender.com";
```

If you run the backend locally, change it to:

```typescript
export const API_URL = "http://localhost:8000";
```

---

## 👤 6. Creating an Account

Inside the app:

1. Tap **Register**
2. Enter email, username, password
3. Log in with your new account

If the backend is running correctly, you will be taken to the **Dashboard** after logging in.

---

## 📊 7. Using the App

Once logged in, you can:

### Daily Check-In
Record your:
- Sleep
- Soreness
- Energy
- HRV (if available)

This generates your daily **Recovery Score**.

### Dashboard
See:
- Today's recovery score
- Your recommended training intensity
- Weekly summaries

### Workout Builder
- Choose template (PPL, Upper/Lower, Full Body)
- Customize exercises
- Save your workout

### Log a Workout
- Add sets, reps, load, RPE
- Saved sessions appear in **Workout History**

### Weekly Insights
- Review recovery trends
- See training volume
- Detect overtraining or undertraining patterns

---

## 🛠️ 8. Troubleshooting

### App won't connect to backend?
- Check base URL in `frontend/api/config.ts`
- Try running backend locally
- Make sure no trailing slashes in the URL

### Expo stuck "Waiting on Metro Bundler"?
Quit terminal, restart Expo using:

```bash
npx expo start --clear
```

### Module errors?
Run:

```bash
npm install
```

---

## 🎉 Ready to Go

You're now fully set up to run Equilibria. If you need more details, check the full documentation:

- `README.md`
- `docs/ARCHITECTURE.md`
- `backend/README.md`

---

## 📚 Next Steps

- Explore the [API Documentation](http://localhost:8000/docs) (if running locally)
- Review the [Use Cases](./USE_CASES.md) to understand all features
- Check out the [Architecture Guide](./ARCHITECTURE.md) for technical details
- Join our community or report issues on [GitHub](https://github.com/imason2023-max/Equilibria)