import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ScrollView,
  Switch,
  TextInput,
  Modal,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import ExportService from "../services/exportService";

export default function SettingsScreen({ navigation }) {
  const { isDarkMode, toggleTheme, colors } = useTheme();
  const {
    logout,
    user,
    isBiometricSupported,
    isBiometricEnabled,
    enableBiometrics,
    disableBiometrics,
  } = useAuth();
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [password, setPassword] = useState("");

  const handleBiometricToggle = async (value) => {
    if (value) {
      setShowPasswordPrompt(true);
    } else {
      Alert.alert("Disable Biometrics", "Are you sure?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Disable",
          onPress: async () => {
            await disableBiometrics();
          },
        },
      ]);
    }
  };

  const confirmEnableBiometrics = async () => {
    if (!password) {
      Alert.alert("Error", "Password is required");
      return;
    }
    try {
      await enableBiometrics(user.email, password);
      setShowPasswordPrompt(false);
      setPassword("");
      Alert.alert("Success", "Biometric login enabled");
    } catch (e) {
      Alert.alert(
        "Error",
        "Failed to enable biometrics. Ensure your password is correct.",
      );
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  const handleExport = async () => {
    try {
      Alert.alert("Exporting", "Generating CSV file...");
      await ExportService.downloadTransactions();
    } catch (e) {
      Alert.alert("Error", "Failed to export transactions");
    }
  };

  const menuItems = [
    {
      title: "Account",
      items: [
        {
          label: "Profile Information",
          icon: "person-outline",
          action: () => navigation.navigate("Profile"),
          color: "#4F46E5",
        },
        {
          label: "Change Password",
          icon: "lock-closed-outline",
          action: () => navigation.navigate("ChangePassword"),
          color: "#10B981",
        },
      ],
    },
    {
      title: "Security",
      items: [
        {
          label: "Biometric Login",
          icon: "finger-print-outline",
          action: () => handleBiometricToggle(!isBiometricEnabled),
          color: "#8B5CF6",
          rightElement: isBiometricSupported ? (
            <Switch
              value={isBiometricEnabled}
              onValueChange={handleBiometricToggle}
              trackColor={{ false: "#767577", true: "#8B5CF6" }}
            />
          ) : (
            <Text style={{ color: "#9CA3AF", fontSize: 12 }}>
              Not Supported
            </Text>
          ),
        },
      ],
    },
    {
      title: "Appearance",
      items: [
        {
          label: "Dark Mode",
          icon: "moon-outline",
          action: toggleTheme,
          color: "#6366F1",
          rightElement: (
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: "#767577", true: "#6366F1" }}
            />
          ),
        },
      ],
    },
    {
      title: "General",
      items: [
        {
          label: "Export Transactions (CSV)",
          icon: "download-outline",
          action: handleExport,
          color: "#4F46E5",
        },
        {
          label: "Recurring Transactions",
          icon: "repeat-outline",
          action: () => navigation.navigate("RecurringTransactions"),
          color: "#EC4899",
        },
        {
          label: "Notifications (Coming Soon)",
          icon: "notifications-outline",
          action: () => {}, // Placeholder
          color: "#F59E0B",
        },
        {
          label: "About",
          icon: "information-circle-outline",
          action: () => Alert.alert("About", "Expense Tracker v1.0.0"),
          color: "#6B7280",
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </Text>
          </View>
          <Text style={styles.userName}>{user?.name || "User"}</Text>
          <Text style={styles.userEmail}>
            {user?.email || "user@example.com"}
          </Text>
        </View>

        <ScrollView style={styles.content}>
          {menuItems.map((section, index) => (
            <View key={index} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <View style={styles.sectionContent}>
                {section.items.map((item, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.menuItem,
                      idx === section.items.length - 1 && styles.lastItem,
                    ]}
                    onPress={item.action}
                  >
                    <View
                      style={[
                        styles.iconBox,
                        { backgroundColor: item.color + "20" },
                      ]}
                    >
                      <Ionicons name={item.icon} size={20} color={item.color} />
                    </View>
                    <Text style={styles.menuText}>{item.label}</Text>
                    {item.rightElement ? (
                      item.rightElement
                    ) : (
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color="#9CA3AF"
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}

          {/* Password Prompt Modal */}
          <Modal
            visible={showPasswordPrompt}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowPasswordPrompt(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Confirm Password</Text>
                <Text style={styles.modalText}>
                  Enter your password to enable biometric login.
                </Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.modalButtonCancel}
                    onPress={() => setShowPasswordPrompt(false)}
                  >
                    <Text style={styles.modalButtonTextCancel}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalButtonConfirm}
                    onPress={confirmEnableBiometrics}
                  >
                    <Text style={styles.modalButtonTextConfirm}>Enable</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
          <Text style={styles.version}>Version 1.0.0</Text>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  container: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    padding: 30,
    backgroundColor: "#fff",
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#4F46E5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  avatarText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#fff",
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
  },
  userEmail: {
    color: "#6B7280",
    marginTop: 2,
  },
  content: {
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280", // Keep gray for section headers
    marginBottom: 10,
    marginLeft: 5,
    textTransform: "uppercase",
  },
  sectionContent: {
    // backgroundColor handled inline
    borderRadius: 12,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: "#374151",
  },
  logoutButton: {
    marginTop: 10,
    backgroundColor: "#FEE2E2",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  logoutText: {
    color: "#EF4444",
    fontWeight: "bold",
    fontSize: 16,
  },
  version: {
    textAlign: "center",
    color: "#9CA3AF",
    fontSize: 12,
    marginTop: 20,
    marginBottom: 30,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    width: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#1F2937",
  },
  modalText: {
    color: "#6B7280",
    marginBottom: 15,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  modalButtonCancel: {
    padding: 10,
    marginRight: 10,
  },
  modalButtonConfirm: {
    backgroundColor: "#4F46E5",
    padding: 10,
    borderRadius: 8,
  },
  modalButtonTextCancel: {
    color: "#6B7280",
    fontWeight: "600",
  },
  modalButtonTextConfirm: {
    color: "#fff",
    fontWeight: "600",
  },
});
