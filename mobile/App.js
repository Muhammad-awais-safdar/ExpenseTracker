import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "./src/context/AuthContext";
import { ThemeProvider } from "./src/context/ThemeContext";
import { SyncProvider } from "./src/context/SyncContext";
import AppNavigator from "./src/navigation/AppNavigator";
import MemoryCache from "./src/utils/memoryCache";

export default function App() {
  useEffect(() => {
    MemoryCache.init();
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ThemeProvider>
          <SyncProvider>
            <AppNavigator />
          </SyncProvider>
        </ThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
