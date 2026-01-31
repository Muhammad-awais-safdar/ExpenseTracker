import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "./src/context/AuthContext";
import { ThemeProvider } from "./src/context/ThemeContext";
import { SyncProvider } from "./src/context/SyncContext";

export default function App() {
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
