import React from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../context/ThemeContext";

export default function GradientBackground({ children, style }) {
  const { isDarkMode, colors } = useTheme();

  const lightColors = ["#4F46E5", "#3730A3"]; // Indigo to darker indigo
  const darkColors = [colors.background, "#1F2937"]; // Dark gray/blue for night

  return (
    <LinearGradient
      colors={isDarkMode ? darkColors : lightColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, style]}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#4F46E5",
  },
  blob: {
    position: "absolute",
    borderRadius: 999,
    opacity: 0.2,
    backgroundColor: "#fff",
  },
  blob1: {
    width: 300,
    height: 300,
    top: -100,
    right: -100,
  },
  blob2: {
    width: 200,
    height: 200,
    bottom: -50,
    left: -50,
  },
});
