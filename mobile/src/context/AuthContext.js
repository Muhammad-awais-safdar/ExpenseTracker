import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api, { setUnauthorizedCallback } from "../api/axios";
import AuthService from "../services/authService";
import MemoryCache from "../utils/memoryCache";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isSplashLoading, setIsSplashLoading] = useState(true);

  useEffect(() => {
    loadStorageData();
    setUnauthorizedCallback(() => {
      handleSessionExpiry();
    });
  }, []);

  const handleSessionExpiry = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common["Authorization"];
    MemoryCache.clear();
  };

  const loadStorageData = async () => {
    try {
      const storedToken = await AsyncStorage.getItem("token");
      const storedUser = await AsyncStorage.getItem("user");

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
      }
    } catch (e) {
      console.log("Failed to load auth data", e);
    } finally {
      setIsSplashLoading(false);
    }
  };

  const login = async (email, password) => {
    // Local loading is handled by the component
    try {
      const { user, token } = await AuthService.login(email, password);

      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("user", JSON.stringify(user));

      setToken(token);
      setUser(user);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      return user;
    } catch (error) {
      console.log("Login error", error.response?.data || error.message);
      throw error;
    }
  };

  const register = async (name, email, password, password_confirmation) => {
    try {
      const { user, token } = await AuthService.register(
        name,
        email,
        password,
        password_confirmation,
      );

      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("user", JSON.stringify(user));

      setToken(token);
      setUser(user);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      return user;
    } catch (error) {
      console.log("Register error", error.response?.data || error.message);
      throw error;
    }
  };

  const logout = async () => {
    // Only logout logic
    try {
      await AuthService.logout();
    } catch (e) {
      console.log("Logout error", e);
    }

    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common["Authorization"];
    MemoryCache.clear();
  };

  return (
    <AuthContext.Provider
      value={{ user, token, isSplashLoading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
