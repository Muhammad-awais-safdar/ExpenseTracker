import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  KeyboardAvoidingView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useTheme } from "../context/ThemeContext";
import SavingsService from "../services/SavingsService";

export default function AddSavingGoalScreen({ navigation, route }) {
  const { colors, isDarkMode } = useTheme();
  // If editing, route.params.goal would be passed. Simplified for now (Add only).

  const [form, setForm] = useState({
    name: "",
    target_amount: "",
    target_date: new Date(),
    color: "#4F46E5",
    icon: "wallet",
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const colorsList = [
    "#4F46E5",
    "#EF4444",
    "#10B981",
    "#F59E0B",
    "#EC4899",
    "#8B5CF6",
    "#6366F1",
  ];
  const iconsList = [
    "wallet",
    "car",
    "home",
    "airplane",
    "gift",
    "phone-portrait",
    "school",
  ];

  const handleSave = async () => {
    if (!form.name || !form.target_amount) {
      Alert.alert("Error", "Please fill in Name and Target Amount");
      return;
    }

    setLoading(true);
    try {
      await SavingsService.create({
        ...form,
        target_date: form.target_date.toISOString().split("T")[0],
      });
      Alert.alert("Success", "Goal created successfully!");
      navigation.goBack();
    } catch (error) {
      console.log("Error creating goal", error);
      Alert.alert("Error", "Failed to create goal");
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: 20 },
    label: {
      color: colors.text,
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 8,
      marginTop: 15,
    },
    input: {
      backgroundColor: colors.card,
      color: colors.text,
      padding: 15,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      fontSize: 16,
    },
    dateButton: {
      backgroundColor: colors.card,
      padding: 15,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    selectionRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 10 },
    selectItem: {
      width: 45,
      height: 45,
      borderRadius: 25,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 10,
      marginBottom: 10,
      borderWidth: 2,
    },
    saveBtn: {
      backgroundColor: colors.primary,
      padding: 18,
      borderRadius: 16,
      alignItems: "center",
      marginTop: 40,
      marginBottom: 40,
    },
    saveBtnText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.label}>Goal Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. New Laptop"
          placeholderTextColor={colors.placeholder}
          value={form.name}
          onChangeText={(t) => setForm({ ...form, name: t })}
        />

        <Text style={styles.label}>Target Amount</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 50000"
          placeholderTextColor={colors.placeholder}
          keyboardType="numeric"
          value={form.target_amount}
          onChangeText={(t) => setForm({ ...form, target_amount: t })}
        />

        <Text style={styles.label}>Target Date</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={{ color: colors.text }}>
            {form.target_date.toLocaleDateString()}
          </Text>
          <Ionicons name="calendar" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={form.target_date}
            mode="date"
            display="default"
            onChange={(e, d) => {
              setShowDatePicker(Platform.OS === "ios");
              if (d) setForm({ ...form, target_date: d });
            }}
          />
        )}

        <Text style={styles.label}>Color</Text>
        <View style={styles.selectionRow}>
          {colorsList.map((c) => (
            <TouchableOpacity
              key={c}
              style={[
                styles.selectItem,
                {
                  backgroundColor: c,
                  borderColor: form.color === c ? colors.text : "transparent",
                },
              ]}
              onPress={() => setForm({ ...form, color: c })}
            />
          ))}
        </View>

        <Text style={styles.label}>Icon</Text>
        <View style={styles.selectionRow}>
          {iconsList.map((i) => (
            <TouchableOpacity
              key={i}
              style={[
                styles.selectItem,
                {
                  backgroundColor: colors.card,
                  borderColor: form.icon === i ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setForm({ ...form, icon: i })}
            >
              <Ionicons
                name={i}
                size={24}
                color={form.icon === i ? colors.primary : colors.textSecondary}
              />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, { opacity: loading ? 0.7 : 1 }]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.saveBtnText}>
            {loading ? "Creating..." : "Create Goal"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
