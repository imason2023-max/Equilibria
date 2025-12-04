# Use Cases

## 1. Regular User Use Cases

### UC-01 — Register an Account

**Actor:** User  
**Goal:** Create a new account to access the application  
**Preconditions:** None  
**Summary:** User enters email, username, password → data sent via frontend → backend creates user in database.

---

### UC-02 — Log In

**Actor:** User  
**Goal:** Authenticate and access the app  
**Preconditions:** User account exists  
**Summary:** User submits credentials → backend issues JWT → frontend stores token → navigates to Dashboard.

---

### UC-03 — View Dashboard & Daily Recommendation

**Actor:** User  
**Goal:** Quickly view today's recovery score and training recommendation  
**Preconditions:** At least one daily check-in exists OR score is recomputed  
**Summary:** App fetches latest recovery log → displays score, intensity suggestion, and summary metrics.

---

### UC-04 — Complete Daily Recovery Check-In

**Actor:** User  
**Goal:** Submit daily wellness/accessory data  
**Inputs:** Sleep hours, sleep quality, soreness, energy, optional HRV/wearable metrics  
**Summary:** User enters values → backend computes score → updated dashboard recommendation.

---

### UC-05 — Create a Workout Using Templates

**Actor:** User  
**Goal:** Build a personalized workout  
**Preconditions:** Exercise library and templates available  
**Summary:** User browses exercises → selects template (PPL, Upper/Lower, etc.) → customizes workout using builder.

---

### UC-06 — Log a Workout Session

**Actor:** User  
**Goal:** Record sets, reps, weight, and other training data  
**Preconditions:** Workout created or selected  
**Summary:** User logs exercises → backend saves session → contributes to insights and recovery trend.

---

### UC-07 — View Workout History

**Actor:** User  
**Goal:** Review past workouts  
**Preconditions:** At least one logged session  
**Summary:** User selects a past workout → app shows detailed session breakdown.

---

### UC-08 — View Weekly Insights

**Actor:** User  
**Goal:** Understand weekly recovery trends and training load  
**Preconditions:** Multiple recovery logs or workout sessions  
**Summary:** App fetches weekly insight data → shows recovery trend, volume, and adherence indicators.

---

### UC-09 — Sync Wearable Data (Prototype)

**Actor:** User  
**Goal:** Pull HRV/heart-rate data from a wearable device  
**Summary:** App requests data from Apple Health / Google Fit / BLE → backend stores or uses for daily scoring.

---

### UC-10 — Log Out

**Actor:** User  
**Goal:** End session securely  
**Summary:** App removes stored token → returns user to login screen.

---

## 2. Administrator Use Cases

### UC-A01 — Manage Exercise Library

**Actor:** Admin  
**Goal:** Add, update, or remove exercises  
**Summary:** Admin uses backend/admin panel (or API tools) to adjust database entries.

---

### UC-A02 — Manage Workout Templates

**Actor:** Admin  
**Goal:** Maintain preset routines (PPL, Upper/Lower, Full Body)  
**Summary:** Admin performs CRUD actions on templates that appear in the builder.

---

### UC-A03 — Review System Logs & App Behavior

**Actor:** Admin  
**Goal:** Identify bugs or performance issues  
**Summary:** Admin checks logs, telemetry, or monitoring tools to ensure system health.

---

## 3. System Use Cases (Automatic Behaviors)

### UC-S01 — Compute Recovery Score

**Actor:** System  
**Inputs:** Sleep, soreness, energy, HRV, sleep quality  
**Summary:** Algorithm runs on backend → outputs score (1–10) + recommendation.

---

### UC-S02 — Generate Daily Recommendation

**Actor:** System  
**Goal:** Suggest heavy, moderate, or rest day  
**Summary:** System uses recovery score + recent data to determine intensity label.

---

### UC-S03 — Detect Overtraining / Undertraining

**Actor:** System  
**Goal:** Notify user when training load is too high or too low  
**Summary:** Weekly insights evaluate patterns → flagged conditions displayed on dashboard.

---

### UC-S04 — Sync Wearable Data in Background

**Actor:** System  
**Goal:** Auto-refresh HRV & health metrics  
**Summary:** Cron-based task or user-triggered API fetch updates wellness data in backend.

---

### UC-S05 — Store & Secure User Data

**Actor:** System  
**Goal:** Persist all user data safely  
**Summary:** Backend validates input → encrypts sensitive data → stores in PostgreSQL.

---

## Use Case Overview

| ID | Use Case | Actor | Type |
|---|---|---|---|
| UC-01 | Register an Account | User | User |
| UC-02 | Log In | User | User |
| UC-03 | View Dashboard & Daily Recommendation | User | User |
| UC-04 | Complete Daily Recovery Check-In | User | User |
| UC-05 | Create a Workout Using Templates | User | User |
| UC-06 | Log a Workout Session | User | User |
| UC-07 | View Workout History | User | User |
| UC-08 | View Weekly Insights | User | User |
| UC-09 | Sync Wearable Data (Prototype) | User | User |
| UC-10 | Log Out | User | User |
| UC-A01 | Manage Exercise Library | Admin | Admin |
| UC-A02 | Manage Workout Templates | Admin | Admin |
| UC-A03 | Review System Logs & App Behavior | Admin | Admin |
| UC-S01 | Compute Recovery Score | System | System |
| UC-S02 | Generate Daily Recommendation | System | System |
| UC-S03 | Detect Overtraining / Undertraining | System | System |
| UC-S04 | Sync Wearable Data in Background | System | System |
| UC-S05 | Store & Secure User Data | System | System |
