import axios from "axios";
import { Platform } from "react-native";

const baseURL =
  Platform.OS === "android" ? "http://10.0.2.2:8000" : "http://localhost:8000";

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export default api;
