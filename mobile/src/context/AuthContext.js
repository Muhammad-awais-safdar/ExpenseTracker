import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api, { setUnauthorizedCallback } from "../api/axios";
import AuthService from "../services/authService";
import MemoryCache from "../utils/memoryCache";
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isSplashLoading, setIsSplashLoading] = useState(true);
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);

  useEffect(() => {
    loadStorageData();
    checkBiometricSupport();
    setUnauthorizedCallback(() => {
      handleSessionExpiry();
    });
  }, []);

  const checkBiometricSupport = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    setIsBiometricSupported(compatible && enrolled);
  };

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
      // Parallel execution for faster startup
      const [storedToken, storedUser, bioEnabled] = await Promise.all([
        AsyncStorage.getItem("token"),
        AsyncStorage.getItem("user"),
        AsyncStorage.getItem("biometric_enabled"),
      ]);

      if (bioEnabled === "true") {
        setIsBiometricEnabled(true);
      }

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
      }
    } catch (e) {
      console.error("Failed to load auth data", e);
    } finally {
      setIsSplashLoading(false);
    }
  };

  const enableBiometrics = async (email, password) => {
    try {
      if (!isBiometricSupported)
        throw new Error("Biometrics not supported or enrolled");

      await SecureStore.setItemAsync("bio_email", email);
      await SecureStore.setItemAsync("bio_password", password);
      await AsyncStorage.setItem("biometric_enabled", "true");
      setIsBiometricEnabled(true);
      return true;
    } catch (e) {
      console.log("Error enabling biometrics", e);
      throw e;
    }
  };

  const disableBiometrics = async () => {
    await SecureStore.deleteItemAsync("bio_email");
    await SecureStore.deleteItemAsync("bio_password");
    await AsyncStorage.setItem("biometric_enabled", "false");
    setIsBiometricEnabled(false);
  };

  const loginWithBiometrics = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Login with Biometrics",
        disableDeviceFallback: false,
      });

      if (result.success) {
        const email = await SecureStore.getItemAsync("bio_email");
        const password = await SecureStore.getItemAsync("bio_password");

        if (email && password) {
          return await login(email, password);
        } else {
          throw new Error("No credentials stored");
        }
      } else {
        throw new Error("Biometric authentication failed");
      }
    } catch (e) {
      console.log("Biometric login error", e);
      throw e;
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
      value={{
        user,
        token,
        isSplashLoading,
        login,
        register,
        logout,
        isBiometricSupported,
        isBiometricEnabled,
        enableBiometrics,
        disableBiometrics,
        loginWithBiometrics,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
