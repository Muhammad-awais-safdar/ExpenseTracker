import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import AuthService from "../services/authService";
import { useTheme } from "../context/ThemeContext";
import CustomAlert from "../components/ui/CustomAlert";

export default function ProfileScreen({ navigation }) {
  const { colors, isDarkMode } = useTheme();
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [loading, setLoading] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ visible: false });

  const handleUpdate = async () => {
    if (!name || !email) {
      setAlertConfig({
        visible: true,
        title: "Validation Error",
        message: "Name and Email are required",
        type: "warning",
        confirmText: "Okay",
        onConfirm: () => setAlertConfig({ visible: false }),
      });
      return;
    }

    setLoading(true);
    try {
      const response = await AuthService.updateProfile({ name, email });
      if (setUser) {
        setUser((prev) => ({ ...prev, name, email }));
      }

      setAlertConfig({
        visible: true,
        title: "Success",
        message: "Profile updated successfully",
        type: "success",
        confirmText: "Done",
        onConfirm: () => {
          setAlertConfig({ visible: false });
          navigation.goBack();
        },
      });
    } catch (error) {
      console.log(error.response?.data);
      setAlertConfig({
        visible: true,
        title: "Error",
        message: error.response?.data?.message || "Failed to update profile",
        type: "error",
        confirmText: "Retry",
        onConfirm: () => setAlertConfig({ visible: false }),
      });
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    form: {
      padding: 20,
      marginTop: 20,
    },
    label: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 5,
    },
    input: {
      backgroundColor: colors.inputBackground,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      marginBottom: 20,
      color: colors.text,
    },
    button: {
      backgroundColor: colors.primary,
      paddingVertical: 14,
      borderRadius: 8,
      alignItems: "center",
      marginTop: 10,
    },
    buttonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "bold",
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter your name"
          placeholderTextColor={colors.placeholder}
        />

        <Text style={styles.label}>Email Address</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          placeholderTextColor={colors.placeholder}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleUpdate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>

      <CustomAlert {...alertConfig} />
    </SafeAreaView>
  );
}
