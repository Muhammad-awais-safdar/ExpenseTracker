import axios from "axios";
import { Alert } from "react-native";
import logger from "../utils/logger";

const API_URL =
  process.env.EXPO_PUBLIC_API_URL || "https://voxelry.duckdns.org/expensetracker";

const api = axios.create({
  baseURL: API_URL,
  // timeout: 60000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    logger.info("API", `🚀 ${config.method.toUpperCase()} ${config.url}`, {
      params: config.params,
      data: logger.mask(config.data),
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
    logger.info("API", `✅ ${response.status} ${response.config.url}`, {
      count: Array.isArray(response.data)
        ? response.data.length
        : response.data.data
          ? response.data.data.length
          : 1,
    });
    return response;
  },
  (error) => {
    const status = error.response ? error.response.status : "NETWORK_ERR";
    const url = error.config ? error.config.url : "unknown";

    logger.error("API", `❌ ${status} ${url}`, {
      message: error.message,
      responseData: error.response ? error.response.data : null,
    });

    if (!error.response) {
      Alert.alert(
        "Connection Error",
        "Could not connect to the server. Please check your internet connection.",
      );
    }

    if (error.response) {
      if (error.response.status === 401) {
        const isAuthRequest =
          error.config.url.includes("/login") ||
          error.config.url.includes("/register");

        if (!isAuthRequest && onUnauthorized) {
          logger.warn(
            "AUTH",
            "Unauthorized access detected. Triggering session cleanup.",
          );
          onUnauthorized();
        }
      }
    }
    return Promise.reject(error);
  },
);

export default api;
