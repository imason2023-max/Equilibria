import axios from "axios";

export const api = axios.create({
  baseURL: "https://equilibria-backend-g5oa.onrender.com",
  withCredentials: true,
});

// ===============================
// AUTH ENDPOINTS
// ===============================
export const AuthAPI = {
  // REGISTER
  register: async (data: {
    email: string;
    username: string;
    password: string;
  }) => {
    const res = await api.post("/api/v1/auth/register", data);
    return res.data;
  },

  // LOGIN — FastAPI OAuth2 uses form-urlencoded
  login: async (data: { email: string; password: string }) => {
    const form = new URLSearchParams();
    form.append("username", data.email); // backend expects "username"
    form.append("password", data.password);

    const res = await api.post("/api/v1/auth/login", form, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    return res.data; // { access_token, token_type }
  },

  // GET CURRENT USER (JWT)
  getMe: async (token: string) => {
    const res = await api.get("/api/v1/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },
};

// ===============================
// RECOVERY ENDPOINTS
// ===============================
export const RecoveryAPI = {
  // POST /recovery/log
  log: async (
    data: {
      sleep_hours: number;
      sleep_quality: number;
      soreness_level: number;
      energy_level: number;
      stress_level: number;
    },
    token: string
  ) => {
    const res = await api.post("/api/v1/recovery/log", data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  // GET /recovery/latest
  latest: async (token: string) => {
    const res = await api.get("/api/v1/recovery/latest", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },
};

// ===============================
// WEARABLE SYNC ENDPOINTS
// ===============================
export const WearableAPI = {
  sync: async (
    data: {
      source: string;
      measurement_date: string;
      hrv_rmssd: number;
      hrv_sdnn: number;
      resting_heart_rate: number;
      avg_heart_rate: number;
      sleep_duration_minutes: number;
      deep_sleep_minutes: number;
      rem_sleep_minutes: number;
      steps: number;
      active_calories: number;
      raw_data: object;
    },
    token: string
  ) => {
    const res = await api.post("/api/v1/wearables/sync", data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },
};

// ===============================
// WORKOUT CREATION ENDPOINT
// ===============================
export const WorkoutAPI = {
  create: async (
    data: {
      name: string;
      description: string;
      workout_type: string;
      is_template: boolean;
      exercises: string[];
    },
    token: string
  ) => {
    const res = await api.post("/api/v1/workouts/", data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },
};

// ===============================
// WORKOUT SESSION ENDPOINT
// ===============================
export const WorkoutSessionAPI = {
  log: async (
    data: {
      workout_id: number;
      duration_minutes: number;
      exercises_completed: string[];
      notes: string;
    },
    token: string
  ) => {
    const res = await api.post("/api/v1/workouts/sessions", data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },
};
