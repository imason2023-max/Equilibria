import axios from "axios";

export const api = axios.create({
  baseURL: "https://equilibria-backend-g5oa.onrender.com",
  withCredentials: true,
});


export const AuthAPI = {
  
  register: async (data: {
    email: string;
    username: string;
    password: string;
  }) => {
    const res = await api.post("/api/v1/auth/register", data);
    return res.data;
  },

  
  login: async (data: { email: string; password: string }) => {
    const form = new URLSearchParams();
    form.append("username", data.email); 
    form.append("password", data.password);

    const res = await api.post("/api/v1/auth/login", form, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    return res.data; 
  },

  
  getMe: async (token: string) => {
    const res = await api.get("/api/v1/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },
};


export const RecoveryAPI = {
  
  log: async (
    data: {
      sleep_hours: number;
      sleep_quality: number;
      soreness_level: number;
      energy_level: number;
      stress_level: number;
      hrv_rmssd: number; 
    },
    token: string
  ) => {
    const res = await api.post("/api/v1/recovery/log", data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  
  latest: async (token: string) => {
    try {
      const res = await api.get("/api/v1/recovery/latest", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (err: any) {
      
      if (err.response?.status === 404) {
        return null; 
      }
      throw err; 
    }
  },
};


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
