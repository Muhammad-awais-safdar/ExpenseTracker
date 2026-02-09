import axios from "axios";
import { Alert } from "react-native";

const API_URL =
  process.env.API_URL || "https://expense-backend-tnag.onrender.com"; // Fallback ifenv fails
console.log("API_URL configured as:", API_URL);

const api = axios.create({
  baseURL: API_URL,
  timeout: 60000, // 60 seconds (Render Free Tier Cold Start)
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Keep reference to callback
let onUnauthorized = null;

export const setUnauthorizedCallback = (callback) => {
  onUnauthorized = callback;
};

// Add response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (!error.response) {
      // Network Error or Server Down
      Alert.alert(
        "Connection Error",
        "Could not connect to the server. Please check your internet connection.",
      );
    }

    if (error.response) {
      // Handle 401 Unauthorized globally
      if (error.response.status === 401 && onUnauthorized) {
        // Prevent global logout loop when explicitly logging in/registering
        const isAuthRequest =
          error.config.url.includes("/login") ||
          error.config.url.includes("/register");

        if (!isAuthRequest) {
          onUnauthorized();
        }
      }
    }
    // Always reject
    return Promise.reject(error);
  },
);

export default api;
