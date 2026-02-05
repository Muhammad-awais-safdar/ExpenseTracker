import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import LoanService from "../services/loanService";
import MemoryCache from "../utils/memoryCache";
import CustomAlert from "../components/ui/CustomAlert";
import ModernButton from "../components/ui/ModernButton";
import CustomDatePicker from "../components/ui/CustomDatePicker";
import { Ionicons } from "@expo/vector-icons";
import { useSync } from "../context/SyncContext";
import { useTheme } from "../context/ThemeContext";

export default function AddLoanScreen({ navigation }) {
  const [alertConfig, setAlertConfig] = useState({ visible: false });
  const [personName, setPersonName] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("given"); // given, taken
  const [dueDate, setDueDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const { isOnline, addToQueue } = useSync();
  const { colors, isDarkMode } = useTheme();

  const handleSubmit = async () => {
    if (!personName || !amount) {
      setAlertConfig({
        visible: true,
        title: "Missing Details",
        message: "Please enter the person's name and amount.",
        type: "warning",
        confirmText: "Okay",
        onConfirm: () => setAlertConfig({ visible: false }),
      });
      return;
    }

    setLoading(true);
    try {
      if (!isOnline) {
        addToQueue({
          type: "ADD_LOAN",
          payload: {
            person_name: personName,
            amount: parseFloat(amount),
            type,
            due_date: dueDate || null,
            description,
          },
        });
        setAlertConfig({
          visible: true,
          title: "Saved Offline",
          message: "Loan saved to offline queue. Will sync when online.",
          type: "info",
          confirmText: "Done",
          onConfirm: () => {
            setAlertConfig({ visible: false });
            navigation.goBack();
          },
        });
      } else {
        await LoanService.create({
          person_name: personName,
          amount: parseFloat(amount),
          type,
          due_date: dueDate || null,
          description,
        });
        MemoryCache.clear();
        setAlertConfig({
          visible: true,
          title: "Loan Recorded",
          message: "The loan has been saved successfully.",
          type: "success",
          confirmText: "Done",
          onConfirm: () => {
            setAlertConfig({ visible: false });
            navigation.goBack();
          },
        });
      }
    } catch (error) {
      setAlertConfig({
        visible: true,
        title: "Error",
        message: "Failed to record loan. Please check your connection.",
        type: "error",
        onConfirm: () => setAlertConfig({ visible: false }),
      });
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: colors.background },
    label: {
      fontSize: 16,
      fontWeight: "bold",
      marginTop: 15,
      marginBottom: 5,
      color: colors.text,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.inputBorder,
      padding: 12,
      borderRadius: 8,
      fontSize: 16,
      backgroundColor: colors.inputBackground,
      color: colors.text,
    },

    typeRow: { flexDirection: "row", marginBottom: 10 },
    typeBtn: {
      flex: 1,
      padding: 15,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      marginHorizontal: 5,
      borderRadius: 10,
      backgroundColor: colors.surface,
    },
    typeBtnActive: {
      backgroundColor: colors.warning,
      borderColor: colors.warning,
    },
    typeText: { fontWeight: "bold", color: colors.textSecondary },
    typeTextActive: { color: "#fff" },

    submitBtnText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  });

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Type</Text>
      <View style={styles.typeRow}>
        <TouchableOpacity
          style={[styles.typeBtn, type === "given" && styles.typeBtnActive]}
          onPress={() => setType("given")}
        >
          <Text
            style={[styles.typeText, type === "given" && styles.typeTextActive]}
          >
            I GAVE
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.typeBtn, type === "taken" && styles.typeBtnActive]}
          onPress={() => setType("taken")}
        >
          <Text
            style={[styles.typeText, type === "taken" && styles.typeTextActive]}
          >
            I TOOK
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Person Name</Text>
      <TextInput
        style={styles.input}
        value={personName}
        onChangeText={setPersonName}
        placeholder="John Doe"
        placeholderTextColor={colors.placeholder}
      />

      <Text style={styles.label}>Amount (PKR)</Text>
      <TextInput
        style={styles.input}
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        placeholder="0.00"
        placeholderTextColor={colors.placeholder}
      />

      <CustomDatePicker
        label="Due Date"
        value={dueDate}
        onChange={setDueDate}
      />

      <Text style={styles.label}>Description (Optional)</Text>
      <TextInput
        style={styles.input}
        value={description}
        onChangeText={setDescription}
        placeholder="Reason for loan"
        placeholderTextColor={colors.placeholder}
      />

      <ModernButton
        title="Save Loan"
        onPress={handleSubmit}
        loading={loading}
        style={{ backgroundColor: colors.warning, marginTop: 30 }}
      />

      <CustomAlert {...alertConfig} />
    </ScrollView>
  );
}
