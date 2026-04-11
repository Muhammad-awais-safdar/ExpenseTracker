import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api, { setUnauthorizedCallback } from "../api/axios";
import logger from "../utils/logger";
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
    logger.warn("AUTH", "Session expired or invalid. Clearing local state.");
    
    // 1. Clear State (triggers immediate re-render of AppNavigator)
    setToken(null);
    setUser(null);

    // 2. Clear Persistence
    try {
      await Promise.all([
        SecureStore.deleteItemAsync("token"),
        AsyncStorage.removeItem("user"),
        MemoryCache.clear()
      ]);
    } catch (e) {
      logger.error("AUTH", "Failed to clear storage during expiry", e);
    }

    // 3. Clear headers
    delete api.defaults.headers.common["Authorization"];
  };

  const loadStorageData = async () => {
    try {
      // Parallel execution for faster startup
      const [storedToken, storedUser, bioEnabled] = await Promise.all([
        SecureStore.getItemAsync("token"),
        AsyncStorage.getItem("user"),
        AsyncStorage.getItem("biometric_enabled"),
      ]);

      if (bioEnabled === "true") {
        setIsBiometricEnabled(true);
      }

      if (storedToken && storedUser) {
        const userObj = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(userObj);
        api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
        logger.info("AUTH", "Session restored", { email: userObj.email });
      } else {
        logger.debug("AUTH", "No stored session found");
      }
    } catch (e) {
      logger.error("AUTH", "Failed to load storage data", e);
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
      console.error("Error enabling biometrics", e);
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
      console.error("Biometric login error", e);
      throw e;
    }
  };

  const login = async (email, password) => {
    try {
      // 1. Clear any existing state before starting a new login
      await handleSessionExpiry();

      const result = await AuthService.login(email, password);

      // 2. Validate response structure
      if (!result || !result.token || !result.user) {
        throw new Error("Invalid response from server. Missing credentials.");
      }

      const { user, token } = result;

      // 3. Persist and update state
      await SecureStore.setItemAsync("token", token);
      await AsyncStorage.setItem("user", JSON.stringify(user));

      setToken(token);
      setUser(user);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      
      // 4. Purge all cache to ensure new user gets fresh categories/dashboard
      await MemoryCache.clear();
      
      logger.info("AUTH", "User logged in successfully", { email: user.email });
      return user;
    } catch (error) {
      // 4. Ensure state is cleared on failure to prevent navigation leakage
      await handleSessionExpiry();
      logger.error("AUTH", "Login failed", error.response?.data || error.message);
      throw error;
    }
  };

  const register = async (name, email, password, password_confirmation) => {
    try {
      // 1. Clear any existing state
      await handleSessionExpiry();

      const result = await AuthService.register(
        name,
        email,
        password,
        password_confirmation,
      );

      // 2. Validate response
      if (!result || !result.token || !result.user) {
        throw new Error("Registration succeeded but no token was returned.");
      }

      const { user, token } = result;

      // 3. Persist and update state
      await SecureStore.setItemAsync("token", token);
      await AsyncStorage.setItem("user", JSON.stringify(user));

      setToken(token);
      setUser(user);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      
      // 4. Purge all cache
      await MemoryCache.clear();
      
      logger.info("AUTH", "User registered successfully", { email: user.email });
      return user;
    } catch (error) {
      // 4. Ensure clean state on failure
      await handleSessionExpiry();
      console.error("Register error", error.response?.data || error.message);
      throw error;
    }
  };

  const logout = async () => {
    // Only logout logic
    try {
      logger.info("AUTH", "Logging out user", { email: user?.email });
      await AuthService.logout();
    } catch (e) {
      logger.error("AUTH", "Logout API error (clearing local session anyway)", e);
    }

    await SecureStore.deleteItemAsync("token");
    await AsyncStorage.removeItem("user");
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common["Authorization"];
    MemoryCache.clear();
    logger.debug("AUTH", "Local session cleared");
  };

  const updateUser = async (updater) => {
    setUser((prev) => {
      const nextUser =
        typeof updater === "function" ? updater(prev || {}) : updater;

      AsyncStorage.setItem("user", JSON.stringify(nextUser)).catch((e) => {
        console.error("Failed to persist updated user", e);
      });

      return nextUser;
    });
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
        setUser: updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
