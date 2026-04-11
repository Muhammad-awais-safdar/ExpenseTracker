import axios from "axios";
import { Alert } from "react-native";
import logger from "../utils/logger";

const API_URL =
  process.env.EXPO_PUBLIC_API_URL || "https://voxelry.duckdns.org/expensetracker";

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Helper to extract a friendly error message from Axios error
export const getErrorMessage = (error) => {
  if (!error.response) {
    if (error.code === "ECONNABORTED") return "Request timed out. Please try again.";
    return "Network error. Please check your connection.";
  }

  const { status, data } = error.response;

  // 1. Validation Errors
  if (status === 422 && data.errors) {
    const firstError = Object.values(data.errors)[0];
    return Array.isArray(firstError) ? firstError[0] : "Invalid input data.";
  }

  // 2. Custom API Exceptions
  if (data.message) {
    return data.message;
  }

  // 3. Fallbacks
  switch (status) {
    case 401: return "Session expired. Please log in again.";
    case 403: return "You don't have permission for this action.";
    case 404: return "The requested information was not found.";
    case 429: return "Too many requests. Please slow down.";
    case 500: return "Server error. We're working on it.";
    default: return "An unexpected error occurred.";
  }
};

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    logger.info("API", `🚀 ${config.method.toUpperCase()} ${config.url}`, {
      params: config.params,
    });
    return config;
  },
  (error) => {
    logger.error("API", "❌ Request Setup Error", error);
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
    logger.info("API", `✅ ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    const status = error.response ? error.response.status : "NETWORK_ERR";
    const url = error.config ? error.config.url : "unknown";

    logger.error("API", `❌ ${status} ${url}`, {
      message: error.message,
      readableMessage: getErrorMessage(error),
      responseData: error.response ? error.response.data : null,
    });

    if (error.response) {
      if (error.response.status === 401) {
        const isAuthRequest =
          url.includes("/login") ||
          url.includes("/register");

        if (!isAuthRequest && onUnauthorized) {
          onUnauthorized();
        }
      }
    }
    return Promise.reject(error);
  },
);

export default api;
