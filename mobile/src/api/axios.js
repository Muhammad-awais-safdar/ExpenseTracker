import axios from "axios";

const API_URL = process.env.API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    // console.log(`[API REQUEST] ${config.method.toUpperCase()} ${config.url}`);
    // console.log("[API HEADERS]", config.headers);
    // console.log("[API DATA]", config.data);
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
    // console.log(`[API RESPONSE] ${response.status} ${response.config.url}`);
    // console.log("[API RESPONSE DATA]", response.data);
    return response;
  },
  (error) => {
    if (error.response) {
      // console.error(
      //   `[API ERROR] ${error.response.status} ${error.response.config.url}`,
      // );
      // Handle 401 Unauthorized globally
      if (error.response.status === 401 && onUnauthorized) {
        // console.log("Session expired, triggering logout...");
        onUnauthorized();
        // Return a pending promise to halt chain execution while logout happens
        return new Promise(() => {});
      }

      // console.error("[API ERROR DATA]", error.response.data);
    } else {
      // console.error("[API ERROR]", error.message);
    }
    return Promise.reject(error);
  },
);

export default api;
