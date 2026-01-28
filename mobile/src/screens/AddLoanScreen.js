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

export default function AddLoanScreen({ navigation }) {
  const [alertConfig, setAlertConfig] = useState({ visible: false });
  const [personName, setPersonName] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("given"); // given, taken
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

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
      />

      <Text style={styles.label}>Amount (PKR)</Text>
      <TextInput
        style={styles.input}
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        placeholder="0.00"
      />

      <CustomDatePicker
        label="Due Date (Optional)"
        value={dueDate}
        onChange={setDueDate}
      />

      <Text style={styles.label}>Description (Optional)</Text>
      <TextInput
        style={styles.input}
        value={description}
        onChangeText={setDescription}
        placeholder="Reason for loan"
      />

      <ModernButton
        title="Save Loan"
        onPress={handleSubmit}
        loading={loading}
        variant={type === "given" ? "danger" : "primary"} // Red for money leaving (given), Blue/Green for taken? Or just Primary/Indigo.
        // Let's stick to Primary or logic. If I gave loan, money left me (Expense-ish). If I took, money came (Income-ish).
        // For consistency let's use default primary, or maybe customized.
        // Let's use Primary to keep it clean.
      />

      <CustomAlert {...alertConfig} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  label: { fontSize: 16, fontWeight: "bold", marginTop: 15, marginBottom: 5 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },

  typeRow: { flexDirection: "row", marginBottom: 10 },
  typeBtn: {
    flex: 1,
    padding: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
    marginHorizontal: 5,
    borderRadius: 10,
  },
  typeBtnActive: { backgroundColor: "#333", borderColor: "#333" },
  typeText: { fontWeight: "bold", color: "#666" },
  typeTextActive: { color: "#fff" },

  submitBtn: {
    backgroundColor: "#333",
    padding: 15,
    borderRadius: 10,
    marginTop: 30,
    alignItems: "center",
  },
  submitBtnText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});
