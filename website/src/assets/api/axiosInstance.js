// axiosInstance.js — safe to keep simple, hydration race is now closed at the source
import axios from "axios";
import { authStore } from "./authStore";

const AUTH_FREE_PATHS = ["/api/login", "/api/register", "/api/refresh-token"];

const api = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL,
});

api.interceptors.request.use((config) => {
  const token = authStore.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isHandling401 = false;

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || "";
    const isAuthFreeRequest = AUTH_FREE_PATHS.some((p) => url.includes(p));
    const hadToken = Boolean(error.config?.headers?.Authorization);

    if (status === 401 && !isAuthFreeRequest && hadToken && !isHandling401) {
      isHandling401 = true;
      authStore.triggerLogout();
      authStore.triggerRedirectToLogin();
      setTimeout(() => { isHandling401 = false; }, 0);
    }

    return Promise.reject(error);
  }
);

export default api;
