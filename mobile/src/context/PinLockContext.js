import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { AppState } from "react-native";
import { useAuth } from "./AuthContext";

const PinLockContext = createContext({});

const PIN_ENABLED_KEY = "pin_lock_enabled";
const PIN_VALUE_KEY = "pin_lock_value";

export const PinLockProvider = ({ children }) => {
  const { token } = useAuth();
  const [isPinEnabled, setIsPinEnabled] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const appStateRef = useRef(AppState.currentState);

  useEffect(() => {
    const loadState = async () => {
      const enabled = await AsyncStorage.getItem(PIN_ENABLED_KEY);
      const pin = await SecureStore.getItemAsync(PIN_VALUE_KEY);
      const active = enabled === "true" && !!pin;
      setIsPinEnabled(active);
      setIsLocked(active && !!token);
    };
    loadState();
  }, [token]);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (nextState) => {
      const wasActive = appStateRef.current === "active";
      const goingBackground = nextState === "background" || nextState === "inactive";
      if (wasActive && goingBackground && isPinEnabled && token) {
        setIsLocked(true);
      }
      appStateRef.current = nextState;
    });
    return () => sub.remove();
  }, [isPinEnabled, token]);

  const enablePin = async (pin) => {
    await SecureStore.setItemAsync(PIN_VALUE_KEY, pin);
    await AsyncStorage.setItem(PIN_ENABLED_KEY, "true");
    setIsPinEnabled(true);
    setIsLocked(true);
  };

  const disablePin = async () => {
    await SecureStore.deleteItemAsync(PIN_VALUE_KEY);
    await AsyncStorage.setItem(PIN_ENABLED_KEY, "false");
    setIsPinEnabled(false);
    setIsLocked(false);
  };

  const verifyPin = async (pin) => {
    const saved = await SecureStore.getItemAsync(PIN_VALUE_KEY);
    if (saved && saved === pin) {
      setIsLocked(false);
      return true;
    }
    return false;
  };

  const lockNow = () => {
    if (isPinEnabled && token) {
      setIsLocked(true);
    }
  };

  return (
    <PinLockContext.Provider
      value={{
        isPinEnabled,
        isLocked,
        enablePin,
        disablePin,
        verifyPin,
        lockNow,
      }}
    >
      {children}
    </PinLockContext.Provider>
  );
};

export const usePinLock = () => useContext(PinLockContext);
