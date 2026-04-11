import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "./src/context/AuthContext";
import { ThemeProvider } from "./src/context/ThemeContext";
import { SyncProvider } from "./src/context/SyncContext";
import { ReminderProvider } from "./src/context/ReminderContext";
import { PinLockProvider } from "./src/context/PinLockContext";
import AppNavigator from "./src/navigation/AppNavigator";
import MemoryCache from "./src/utils/memoryCache";
import logger from "./src/utils/logger";

import GlobalErrorBoundary from "./src/components/GlobalErrorBoundary";
import { ToastProvider } from "./src/context/ToastContext";

export default function App() {
  useEffect(() => {
    logger.info("APP", "Application initialized and mounted");
    MemoryCache.init();
  }, []);

  return (
    <SafeAreaProvider>
      <GlobalErrorBoundary>
        <ToastProvider>
          <AuthProvider>
            <ThemeProvider>
              <SyncProvider>
                <PinLockProvider>
                  <ReminderProvider>
                    <AppNavigator />
                  </ReminderProvider>
                </PinLockProvider>
              </SyncProvider>
            </ThemeProvider>
          </AuthProvider>
        </ToastProvider>
      </GlobalErrorBoundary>
    </SafeAreaProvider>
  );
}
