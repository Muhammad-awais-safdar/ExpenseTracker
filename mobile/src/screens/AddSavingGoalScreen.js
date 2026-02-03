import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import SavingsService from "../services/SavingsService";
import CustomDatePicker from "../components/ui/CustomDatePicker";
import ModernButton from "../components/ui/ModernButton";
import CustomAlert from "../components/ui/CustomAlert";

export default function AddSavingGoalScreen({ navigation }) {
  const { colors, isDarkMode } = useTheme();
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [targetDate, setTargetDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [selectedColor, setSelectedColor] = useState("#8B5CF6"); // Default purple
  const [loading, setLoading] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ visible: false });

  const predefinedColors = [
    "#8B5CF6", // Purple
    "#EF4444", // Red
    "#10B981", // Green
    "#F59E0B", // Orange
    "#3B82F6", // Blue
    "#EC4899", // Pink
  ];

  const handleSubmit = async () => {
    if (!name || !targetAmount) {
      setAlertConfig({
        visible: true,
        title: "Missing Info",
        message: "Please enter a name and target amount.",
        type: "warning",
        onConfirm: () => setAlertConfig({ visible: false }),
      });
      return;
    }

    setLoading(true);
    try {
      await SavingsService.create({
        name,
        target_amount: parseFloat(targetAmount),
        target_date: targetDate,
        color: selectedColor,
        icon: "star", // Default icon for now
      });

      setAlertConfig({
        visible: true,
        title: "Success",
        message: "Goal created successfully!",
        type: "success",
        onConfirm: () => {
          setAlertConfig({ visible: false });
          navigation.goBack();
        },
      });
    } catch (error) {
      setAlertConfig({
        visible: true,
        title: "Error",
        message: "Failed to create goal.",
        type: "error",
        onConfirm: () => setAlertConfig({ visible: false }),
      });
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scrollContent: { padding: 20 },
    inputGroup: { marginBottom: 20 },
    label: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 8,
    },
    input: {
      backgroundColor: colors.inputBackground,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      padding: 15,
      borderRadius: 12,
      fontSize: 16,
      color: colors.text,
    },
    colorContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 10,
    },
    colorCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      borderWidth: 2,
      borderColor: "transparent",
    },
    selectedColorCircle: {
      borderColor: colors.text,
    },
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Goal Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. New Laptop"
            placeholderTextColor={colors.placeholder}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Target Amount</Text>
          <TextInput
            style={styles.input}
            value={targetAmount}
            onChangeText={setTargetAmount}
            keyboardType="numeric"
            placeholder="0.00"
            placeholderTextColor={colors.placeholder}
          />
        </View>

        <CustomDatePicker
          label="Target Date"
          value={targetDate}
          onChange={setTargetDate}
        />

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Color</Text>
          <View style={styles.colorContainer}>
            {predefinedColors.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorCircle,
                  { backgroundColor: color },
                  selectedColor === color && styles.selectedColorCircle,
                ]}
                onPress={() => setSelectedColor(color)}
              />
            ))}
          </View>
        </View>

        <ModernButton
          title="Create Goal"
          onPress={handleSubmit}
          loading={loading}
          style={{ marginTop: 20 }}
        />

        <CustomAlert {...alertConfig} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
