import { useAuthStore } from "@/stores/useAuthStore";
import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.MODE === "development"
      ? "http://localhost:4000/api"
      : "/api",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalResquest = error.config;

    // Những api ko cần check refresh token
    if (
      originalResquest.url.includes("/auth/signin") ||
      originalResquest.url.includes("/auth/signup") ||
      originalResquest.url.includes("/auth/refresh")
    ) {
      return Promise.reject(error);
    }

    originalResquest._retryCount = originalResquest._retryCount || 0;

    if (error.response?.status === 403 && originalResquest._retryCount < 4) {
      originalResquest._retryCount += 1;
      try {
        const res = await api.post("/auth/refresh", { withCredentials: true });
        const newAccessToken = res.data.accessToken;
        useAuthStore.getState().setAccessToken(newAccessToken);

        originalResquest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalResquest);
      } catch (refreshError) {
        useAuthStore.getState().clearState();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

export default api;
