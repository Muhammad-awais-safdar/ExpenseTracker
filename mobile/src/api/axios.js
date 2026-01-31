import axios from "axios";

const API_URL = process.env.API_URL;
console.log("Configured API_URL:", API_URL); // Debug Log

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
    console.log(`[API REQUEST] ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error("[API REQUEST ERROR]", error);
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
    // Always reject so the caller logic (LoginScreen) handles the error state (stops loading)
    return Promise.reject(error);
  },
);

export default api;
