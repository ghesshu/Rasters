import axios from "axios";
import authService from "./auth.service";

const API_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem("token");

    // If token exists, add it to the Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 (Unauthorized) and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // For JWT token-based auth, we would typically handle token refresh here
        // But since we're using a single token approach, we'll just redirect to login
        // You could implement token refresh logic here if needed in the future

        // Clear user data and token
        localStorage.removeItem("user");
        localStorage.removeItem("token");

        // Redirect to login page or trigger a logout event
        window.location.href = "/";

        return Promise.reject(error);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
