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
    config.metadata = { startTime: new Date() };
    console.log(
      `[API REQUEST] ${config.method.toUpperCase()} ${config.url} at ${config.metadata.startTime.toISOString()}`,
    );
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
    const duration = new Date() - response.config.metadata.startTime;
    console.log(
      `[API RESPONSE] ${response.status} ${response.config.url} - ${duration}ms`,
    );
    return response;
  },
  (error) => {
    const duration = error.config?.metadata
      ? new Date() - error.config.metadata.startTime
      : "N/A";
    console.log(
      `[API ERROR] ${error.response?.status || "Network Error"} ${error.config?.url || "Unknown"} - ${duration}ms`,
    );

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
