import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import GradientBackground from "../components/ui/GradientBackground";
import ModernButton from "../components/ui/ModernButton";
import { Ionicons } from "@expo/vector-icons";

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const { register } = useAuth();
  const { colors, isDarkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Animation Values
  const headerAnim = useRef(new Animated.Value(-30)).current;
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
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.spring(formAnim, {
        toValue: 0,
        friction: 8,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleRegister = async () => {
    setErrors({});
    setLoading(true);
    try {
      await register(name, email, password, passwordConfirmation);
    } catch (e) {
      if (e.response && e.response.status === 422) {
        setErrors(e.response.data.errors);
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
      flexGrow: 1,
      justifyContent: "center",
      padding: 24,
    },
    header: {
      marginBottom: 30,
      marginTop: 20,
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: isDarkMode
        ? colors.surfaceHighlight
        : "rgba(255,255,255,0.2)",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 20,
    },
    appTitle: {
      fontSize: 28,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: isDarkMode ? colors.textSecondary : "rgba(255,255,255,0.8)",
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
  });

  return (
    <GradientBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.container}>
          {/* Header Area */}
          <Animated.View
            style={[
              styles.header,
              {
                opacity: headerOpacity,
                transform: [{ translateY: headerAnim }],
              },
            ]}
          >
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backBtn}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color={isDarkMode ? colors.text : "#fff"}
              />
            </TouchableOpacity>
            <Text style={styles.appTitle}>Join Us</Text>
            <Text style={styles.subtitle}>Create your account</Text>
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
                name="person-outline"
                size={20}
                color={colors.placeholder}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor={colors.placeholder}
                value={name}
                onChangeText={setName}
              />
            </View>
            {errors.name && (
              <Text style={styles.errorText}>{errors.name[0]}</Text>
            )}

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
                secureTextEntry
              />
            </View>
            {errors.password && (
              <Text style={styles.errorText}>{errors.password[0]}</Text>
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
                placeholder="Confirm Password"
                placeholderTextColor={colors.placeholder}
                value={passwordConfirmation}
                onChangeText={setPasswordConfirmation}
                secureTextEntry
              />
            </View>

            {errors.general && (
              <View style={styles.generalErrorBox}>
                <Ionicons name="alert-circle" size={20} color={colors.danger} />
                <Text style={styles.generalErrorText}>{errors.general[0]}</Text>
              </View>
            )}

            <View style={styles.spacer} />

            <ModernButton
              title="Create Account"
              onPress={handleRegister}
              loading={loading}
              variant="primary"
            />

            <TouchableOpacity
              onPress={() => navigation.navigate("Login")}
              style={styles.footerLink}
            >
              <Text style={styles.footerText}>
                Already have an account?{" "}
                <Text style={styles.boldText}>Log In</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
}
