import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api, { setUnauthorizedCallback } from "../api/axios";
import AuthService from "../services/authService";
import MemoryCache from "../utils/memoryCache";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStorageData();
    // Register global logout handler
    setUnauthorizedCallback(() => {
      // Logout without calling API again to prevent loops
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
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name, email, password, password_confirmation) => {
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
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
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
