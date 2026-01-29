import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "react-native";
import { theme } from "../constants/theme";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [themeLoaded, setThemeLoaded] = useState(false);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const storedTheme = await AsyncStorage.getItem("theme");
      if (storedTheme) {
        setIsDarkMode(storedTheme === "dark");
      } else {
        // Default to system preference if no stored preference
        setIsDarkMode(systemScheme === "dark");
      }
    } catch (e) {
      console.log("Failed to load theme", e);
    } finally {
      setThemeLoaded(true);
    }
  };

  const toggleTheme = async () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    try {
      await AsyncStorage.setItem("theme", newMode ? "dark" : "light");
    } catch (e) {
      console.log("Failed to save theme", e);
    }
  };

  const colors = isDarkMode ? theme.dark : theme.light;

  return (
    <ThemeContext.Provider
      value={{ isDarkMode, toggleTheme, colors, themeLoaded }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
