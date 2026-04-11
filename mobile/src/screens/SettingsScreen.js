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
import { useReminders } from "../context/ReminderContext";
import { usePinLock } from "../context/PinLockContext";
import { Ionicons } from "@expo/vector-icons";
import ExportService from "../services/exportService";
import CategoryService from "../services/categoryService";
import MemoryCache from "../utils/memoryCache";
import { useToast } from "../context/ToastContext";
import { getErrorMessage } from "../api/axios";

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
  const { isReminderEnabled, toggleReminders } = useReminders();
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [password, setPassword] = useState("");
  const [showPinPrompt, setShowPinPrompt] = useState(false);
  const [pin, setPin] = useState("");
  const { isPinEnabled, enablePin, disablePin } = usePinLock();
  const { showToast } = useToast();
  const [processing, setProcessing] = useState(false);

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

  const handlePinToggle = async (value) => {
    if (value) {
      setShowPinPrompt(true);
      return;
    }
    Alert.alert("Disable PIN Lock", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Disable",
        onPress: async () => {
          await disablePin();
        },
      },
    ]);
  };

  const confirmEnablePin = async () => {
    if (!/^\d{4}$/.test(pin)) {
      Alert.alert("Invalid PIN", "PIN must be exactly 4 digits.");
      return;
    }
    await enablePin(pin);
    setPin("");
    setShowPinPrompt(false);
    Alert.alert("Success", "PIN lock enabled");
  };

  const handleExport = async () => {
    try {
      Alert.alert("Exporting", "Generating CSV file...");
      await ExportService.exportToCsv();
    } catch (e) {
      Alert.alert("Error", "Failed to export transactions");
    }
  };

  const handleClearCache = () => {
    Alert.alert(
      "Clear Cache & Cookies",
      "This will clear all temporary data. You will remain logged in, but data will be re-synced from the server. Proceed?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear Everything",
          style: "destructive",
          onPress: async () => {
            await MemoryCache.clear();
            showToast("Success", "Cache cleared successfully", "success");
          },
        },
      ],
    );
  };

  const handleRestoreCategories = () => {
    Alert.alert(
      "Restore Default Categories",
      "This will add standard categories (Food, Travel, etc.) to your account if they are missing. Proceed?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Restore Defaults",
          onPress: async () => {
            try {
              setProcessing(true);
              await CategoryService.seed();
              await MemoryCache.clear(); // Clear cache to force reload categories
              showToast("Success", "Default categories restored!", "success");
            } catch (error) {
              showToast("Error", getErrorMessage(error), "error");
            } finally {
              setProcessing(false);
            }
          },
        },
      ],
    );
  };

  const menuItems = [
    {
      title: "Account",
      items: [
        {
          label: "Profile Information",
          icon: "person-outline",
          action: () => navigation.navigate("Profile"),
          color: colors.primary,
        },
        {
          label: "Change Password",
          icon: "lock-closed-outline",
          action: () => navigation.navigate("ChangePassword"),
          color: colors.success,
        },
      ],
    },
    {
      title: "Security",
      items: [
        {
          label: "PIN App Lock",
          icon: "keypad-outline",
          action: () => handlePinToggle(!isPinEnabled),
          color: "#0EA5E9",
          rightElement: (
            <Switch
              value={isPinEnabled}
              onValueChange={handlePinToggle}
              trackColor={{ false: "#767577", true: "#0EA5E9" }}
            />
          ),
        },
        {
          label: "Biometric Login",
          icon: "finger-print-outline",
          action: () => handleBiometricToggle(!isBiometricEnabled),
          color: "#8B5CF6", // Violet
          rightElement: isBiometricSupported ? (
            <Switch
              value={isBiometricEnabled}
              onValueChange={handleBiometricToggle}
              trackColor={{ false: "#767577", true: "#8B5CF6" }}
            />
          ) : (
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
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
          color: "#6366F1", // Indigo
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
          color: colors.primary,
        },
        {
          label: "Recurring Transactions",
          icon: "repeat-outline",
          action: () => navigation.navigate("RecurringTransactions"),
          color: "#EC4899", // Pink
        },
        {
          label: "Sync Conflicts",
          icon: "sync-outline",
          action: () => navigation.navigate("SyncConflicts"),
          color: colors.info,
        },
        {
          label: "Import CSV Data",
          icon: "cloud-upload-outline",
          action: () => navigation.navigate("ImportData"),
          color: colors.primary,
        },
        {
          label: "Backup & Restore",
          icon: "server-outline",
          action: () => navigation.navigate("BackupRestore"),
          color: "#14B8A6",
        },
        {
          label: "Financial Health",
          icon: "pulse-outline",
          action: () => navigation.navigate("FinancialHealth"),
          color: "#A855F7",
        },
        {
          label: "Reminders",
          icon: "notifications-outline",
          action: () => toggleReminders(!isReminderEnabled),
          color: colors.warning,
          rightElement: (
            <Switch
              value={isReminderEnabled}
              onValueChange={toggleReminders}
              trackColor={{ false: "#767577", true: colors.warning }}
            />
          ),
        },
        {
          label: "Restore Default Categories",
          icon: "refresh-circle-outline",
          action: handleRestoreCategories,
          color: colors.success,
        },
        {
          label: "Clear Cache and Cookies",
          icon: "trash-outline",
          action: handleClearCache,
          color: colors.danger,
        },
        {
          label: "About",
          icon: "information-circle-outline",
          action: () => Alert.alert("About", "Expense Tracker v1.0.0"),
          color: colors.textSecondary,
        },
      ],
    },
  ];

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
    },
    header: {
      alignItems: "center",
      padding: 30,
      backgroundColor: colors.card,
      marginBottom: 20,
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.primary,
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
      color: colors.text,
    },
    userEmail: {
      color: colors.textSecondary,
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
      color: colors.textSecondary,
      marginBottom: 10,
      marginLeft: 5,
      textTransform: "uppercase",
    },
    sectionContent: {
      backgroundColor: colors.card,
      borderRadius: 12,
      overflow: "hidden",
    },
    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      padding: 15,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
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
      color: colors.text,
    },
    logoutButton: {
      marginTop: 10,
      backgroundColor: isDarkMode ? "rgba(239, 68, 68, 0.2)" : "#FEE2E2",
      padding: 15,
      borderRadius: 12,
      alignItems: "center",
    },
    logoutText: {
      color: colors.danger,
      fontWeight: "bold",
      fontSize: 16,
    },
    version: {
      textAlign: "center",
      color: colors.textSecondary,
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
      backgroundColor: colors.card,
      padding: 20,
      borderRadius: 12,
      width: "80%",
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 10,
      color: colors.text,
    },
    modalText: {
      color: colors.textSecondary,
      marginBottom: 15,
    },
    modalInput: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 10,
      marginBottom: 20,
      fontSize: 16,
      color: colors.text,
      backgroundColor: colors.inputBackground,
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
      backgroundColor: colors.primary,
      padding: 10,
      borderRadius: 8,
    },
    modalButtonTextCancel: {
      color: colors.textSecondary,
      fontWeight: "600",
    },
    modalButtonTextConfirm: {
      color: "#fff",
      fontWeight: "600",
    },
  });

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
                        color={colors.textSecondary}
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
                  placeholderTextColor={colors.placeholder}
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

          <Modal
            visible={showPinPrompt}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowPinPrompt(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Set 4-Digit PIN</Text>
                <Text style={styles.modalText}>
                  This PIN will be required when reopening the app.
                </Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="1234"
                  placeholderTextColor={colors.placeholder}
                  value={pin}
                  onChangeText={(v) => setPin(v.replace(/\D/g, "").slice(0, 4))}
                  secureTextEntry
                  keyboardType="numeric"
                  maxLength={4}
                />
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.modalButtonCancel}
                    onPress={() => setShowPinPrompt(false)}
                  >
                    <Text style={styles.modalButtonTextCancel}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalButtonConfirm}
                    onPress={confirmEnablePin}
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
