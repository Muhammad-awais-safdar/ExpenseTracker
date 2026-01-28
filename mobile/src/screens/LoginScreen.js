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
import GradientBackground from "../components/ui/GradientBackground";
import ModernButton from "../components/ui/ModernButton";
import { Ionicons } from "@expo/vector-icons";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Animation Values
  const headerAnim = useRef(new Animated.Value(-50)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const formAnim = useRef(new Animated.Value(50)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;

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
              <Ionicons name="wallet-outline" size={40} color="#4F46E5" />
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
                color="#9CA3AF"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                placeholderTextColor="#9CA3AF"
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
                color="#9CA3AF"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                autoCapitalize="none"
                secureTextEntry
              />
            </View>
            {errors.password && (
              <Text style={styles.errorText}>{errors.password[0]}</Text>
            )}

            {errors.general && (
              <View style={styles.generalErrorBox}>
                <Ionicons name="alert-circle" size={20} color="#EF4444" />
                <Text style={styles.generalErrorText}>{errors.general[0]}</Text>
              </View>
            )}

            <View style={styles.spacer} />

            <ModernButton
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
            />

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
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
  },
  formContainer: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "transparent",
    height: 56,
  },
  inputIcon: { marginRight: 12 },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
    height: "100%",
  },
  spacer: { height: 12 },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    marginLeft: 4,
    marginTop: -8,
    marginBottom: 12,
  },
  generalErrorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  generalErrorText: {
    color: "#EF4444",
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "500",
  },
  footerLink: {
    marginTop: 20,
    alignItems: "center",
  },
  footerText: {
    color: "#6B7280",
    fontSize: 14,
  },
  boldText: {
    color: "#4F46E5",
    fontWeight: "bold",
  },
});
