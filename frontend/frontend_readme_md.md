# Equilibria Frontend (Developer Overview)

This folder contains the full React Native (Expo) frontend for **Equilibria**, a recovery-focused fitness and workout logging app.

This README explains how the frontend is organized, how it communicates with the backend, and how to contribute to the codebase.

---

## 🧱 Project Purpose

The Equilibria frontend provides:

- A clean mobile UI for daily check-ins, workout creation, session logging, and insights
- Full navigation across Dashboard, Check-In, Builder, Weekly Insights, and History screens
- Secure authentication using JWT tokens stored in AsyncStorage
- Real-time communication with the FastAPI backend

All features are implemented using Expo's managed workflow for cross-platform development.

---

## 📁 Folder Structure

```
frontend/
├── app/
│   ├── screens/         # All UI screens (Login, Register, Dashboard, Check-In, etc.)
│   ├── navigation/      # Tab navigation + stack navigation
│   ├── components/      # Buttons, cards, list items, helpers
│   └── hooks/           # Custom hooks (optional, depending on code)
│
├── api/
│   ├── config.ts        # Backend base URL (edit this when switching environments)
│   └── client.ts        # Reusable authenticated API fetch wrapper
│
├── assets/              # Icons, images, fonts
│
├── App.tsx              # App entry point (navigation container)
├── package.json
└── README.md            # (This file)
```

---

## 🔗 API Communication

All backend requests go through a helper function:

```typescript
apiFetch("/api/v1/...")
```

This wrapper:
- Prepends the base URL from `config.ts`
- Adds JSON headers
- Automatically attaches the JWT token from AsyncStorage
- Returns a fetch `Response` object that screens can `.json()` as needed

### Example usage:

```typescript
const res = await apiFetch("/api/v1/recovery/latest");
const data = await res.json();
```

### To switch between deployed and local backends, edit:

```
api/config.ts
```

---

## 🧭 Navigation Structure

Equilibria uses **React Navigation** with:

### 1. Auth Stack
- `LoginScreen`
- `RegisterScreen`

### 2. Main App Tabs
- `DashboardScreen`
- `DailyCheckInScreen`
- `WorkoutBuilderScreen`
- `WeeklyInsightsScreen`
- `HistoryScreen`

### 3. Nested Screens
- `WorkoutDetailsScreen`
- `WorkoutSessionDetailsScreen`
- `WorkoutSessionHistoryScreen`

Navigation is defined in `/app/navigation/`, and wrapped in `App.tsx`.

---

## 🎨 UI Overview

The frontend is built around:

- Clean dark-theme UI
- Consistent spacing and corner radii
- Simple typography hierarchy
- Reusable component patterns

All screens follow the same structure:
1. A header
2. A scrollable area
3. Cards/lists/buttons
4. A persistent bottom tab bar

UI screens themselves live in:
```
app/screens/
```

---

## 🔄 State & Storage

The frontend uses:

- **React Hooks** (`useState`, `useEffect`) for UI state
- **AsyncStorage** for:
  - JWT token
  - Basic caching
  - Maintaining login state

There is no heavy state manager (Redux/MobX) — the project is purposely lightweight.

---

## 🛠️ Adding a New Screen

To add a new screen:

1. **Create a file in:**
   ```
   app/screens/NewScreen.tsx
   ```

2. **Add it to your navigation stack in:**
   ```
   app/navigation/AppNavigator.tsx
   ```

3. **(Optional)** Add an icon entry if it belongs in the tab bar.

4. **Use the shared API wrapper for backend calls:**
   ```typescript
   const res = await apiFetch("/api/v1/...");
   ```

5. **Run** `npx expo start` and verify navigation works.

---

## 🧪 Debugging

### Common tools:
- Expo console (live output)
- React Native error overlays
- Browser devtools for web mode (`w`)
- Backend logs (Render or local uvicorn logs)

### Useful reset command:

```bash
npx expo start --clear
```

Clears bundler cache when weird errors appear.

---

## 📦 Dependencies

Key packages used in this project:

- **expo** — Managed React Native workflow
- **react-navigation** — Screen navigation
- **@react-native-async-storage/async-storage** — Token persistence
- **axios** (optional) or native `fetch` — API requests

Install all dependencies:

```bash
npm install
```

---

## 🚀 Running the Frontend

1. **Navigate to the frontend directory:**
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

4. **Choose your platform:**
   - Press `w` for web
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go for physical device

---

## 🔐 Authentication Flow

1. User enters credentials on `LoginScreen` or `RegisterScreen`
2. Backend returns JWT token
3. Token is stored in AsyncStorage
4. `apiFetch` automatically includes token in subsequent requests
5. On logout, token is removed and user returns to auth stack

---

## 🎯 Best Practices

- **Keep screens focused** — One screen, one responsibility
- **Reuse components** — Create shared components in `/components/`
- **Use TypeScript** — Type your props and API responses
- **Handle errors gracefully** — Show user-friendly messages
- **Test on multiple devices** — iOS, Android, and web when possible

---

## 📚 Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation Docs](https://reactnavigation.org/)
- [React Native Docs](https://reactnative.dev/)
- [AsyncStorage Guide](https://react-native-async-storage.github.io/async-storage/)

---

## 🤝 Contributing

When contributing to the frontend:

1. Follow the existing folder structure
2. Use consistent naming conventions
3. Write clear commit messages
4. Test your changes on at least one platform
5. Update this README if you add new patterns or structure

---

## 📝 Notes

- The frontend is designed to work with both deployed and local backends
- All API endpoints should be prefixed with `/api/v1/`
- JWT tokens automatically expire after a set duration (configured in backend)
- The app uses a tab-based navigation pattern for main features