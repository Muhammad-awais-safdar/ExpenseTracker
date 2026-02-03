import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import GradientBackground from "../components/ui/GradientBackground";
import ModernButton from "../components/ui/ModernButton";
import { Ionicons } from "@expo/vector-icons";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, isBiometricEnabled, loginWithBiometrics } = useAuth();
  const { colors, isDarkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Animation Values
  const headerAnim = useRef(new Animated.Value(-50)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const formAnim = useRef(new Animated.Value(50)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;

  // Auto-prompt for biometrics
  useEffect(() => {
    if (isBiometricEnabled) {
      handleBiometricLogin();
    }
  }, [isBiometricEnabled]);

  const handleBiometricLogin = async () => {
    try {
      await loginWithBiometrics();
    } catch (e) {
      console.log("Bio login failed or cancelled");
    }
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 600,
        delay: 100,
        useNativeDriver: true,
      }),
      Animated.spring(headerAnim, {
        toValue: 0,
        friction: 8,
        delay: 100,
        useNativeDriver: true,
      }),
      Animated.timing(formOpacity, {
        toValue: 1,
        duration: 600,
        delay: 300,
        useNativeDriver: true,
      }),
      Animated.spring(formAnim, {
        toValue: 0,
        friction: 8,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    setErrors({});
    if (!email || !password) {
      setErrors({
        email: !email ? ["Email is required"] : null,
        password: !password ? ["Password is required"] : null,
      });
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
    } catch (e) {
      if (e.response?.status === 422) {
        setErrors(e.response.data.errors);
      } else if (e.response?.status === 401 || e.response?.status === 403) {
        const msg = e.response.data?.message || "Invalid email or password";
        setErrors({ general: [msg] });
      } else {
        const msg =
          e.response?.data?.message || "An error occurred. Please try again.";
        setErrors({ general: [msg] });
      }
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    keyboardView: { flex: 1 },
    container: {
      flex: 1,
      justifyContent: "center",
      padding: 24,
    },
    header: {
      alignItems: "center",
      marginBottom: 40,
    },
    iconCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: isDarkMode ? colors.surface : "#fff",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 16,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 5,
    },
    appTitle: {
      fontSize: 28,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    formContainer: {
      backgroundColor: isDarkMode ? colors.surface : "#fff",
      borderRadius: 24,
      padding: 24,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.1,
      shadowRadius: 20,
      elevation: 10,
    },
    inputGroup: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.inputBackground,
      borderRadius: 12,
      paddingHorizontal: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      height: 56,
    },
    inputIcon: { marginRight: 12 },
    input: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
      height: "100%",
    },
    spacer: { height: 12 },
    errorText: {
      color: colors.danger,
      fontSize: 12,
      marginLeft: 4,
      marginTop: -8,
      marginBottom: 12,
    },
    generalErrorBox: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDarkMode ? "rgba(239, 68, 68, 0.1)" : "#FEF2F2",
      padding: 12,
      borderRadius: 12,
      marginBottom: 16,
    },
    generalErrorText: {
      color: colors.danger,
      marginLeft: 8,
      fontSize: 14,
      fontWeight: "500",
    },
    footerLink: {
      marginTop: 20,
      alignItems: "center",
    },
    footerText: {
      color: colors.textSecondary,
      fontSize: 14,
    },
    boldText: {
      color: colors.primary,
      fontWeight: "bold",
    },
    bioButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginTop: 15,
      padding: 10,
    },
    bioText: {
      color: colors.primary,
      fontWeight: "600",
      marginLeft: 8,
    },
  });

  return (
    <GradientBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.container}>
          {/* Logo / Header Area */}
          <Animated.View
            style={[
              styles.header,
              {
                opacity: headerOpacity,
                transform: [{ translateY: headerAnim }],
              },
            ]}
          >
            <View style={styles.iconCircle}>
              <Ionicons
                name="wallet-outline"
                size={40}
                color={colors.primary}
              />
            </View>
            <Text style={styles.appTitle}>ExpenseTracker</Text>
            <Text style={styles.subtitle}>Welcome back!</Text>
          </Animated.View>

          {/* Form Area */}
          <Animated.View
            style={[
              styles.formContainer,
              { opacity: formOpacity, transform: [{ translateY: formAnim }] },
            ]}
          >
            <View style={styles.inputGroup}>
              <Ionicons
                name="mail-outline"
                size={20}
                color={colors.placeholder}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                placeholderTextColor={colors.placeholder}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
            {errors.email && (
              <Text style={styles.errorText}>{errors.email[0]}</Text>
            )}

            <View style={styles.inputGroup}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={colors.placeholder}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={colors.placeholder}
                value={password}
                onChangeText={setPassword}
                autoCapitalize="none"
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={colors.placeholder}
                />
              </TouchableOpacity>
            </View>
            {errors.password && (
              <Text style={styles.errorText}>{errors.password[0]}</Text>
            )}

            {errors.general && (
              <View style={styles.generalErrorBox}>
                <Ionicons name="alert-circle" size={20} color={colors.danger} />
                <Text style={styles.generalErrorText}>{errors.general[0]}</Text>
              </View>
            )}

            <View style={styles.spacer} />

            <ModernButton
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
              variant="primary"
            />

            {isBiometricEnabled && (
              <TouchableOpacity
                onPress={handleBiometricLogin}
                style={styles.bioButton}
              >
                <Ionicons
                  name="finger-print-outline"
                  size={24}
                  color={colors.primary}
                />
                <Text style={styles.bioText}>Login with Biometrics</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={() => navigation.navigate("Register")}
              style={styles.footerLink}
            >
              <Text style={styles.footerText}>
                Don't have an account?{" "}
                <Text style={styles.boldText}>Sign Up</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
}
