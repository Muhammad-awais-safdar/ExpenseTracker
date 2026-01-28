import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import LoanService from "../services/loanService";
import MemoryCache from "../utils/memoryCache";

export default function AddLoanScreen({ navigation }) {
  const [personName, setPersonName] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("given"); // given, taken
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!personName || !amount) {
      Alert.alert("Error", "Please fill required fields (Name, Amount)");
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
        due_date: dueDate || null,
        description,
      });
      MemoryCache.clear();
      Alert.alert("Success", "Loan recorded successfully");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "Failed to add loan");
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

      <Text style={styles.label}>Due Date (Optional YYYY-MM-DD)</Text>
      <TextInput
        style={styles.input}
        value={dueDate}
        onChangeText={setDueDate}
        placeholder="2023-12-31"
      />

      <Text style={styles.label}>Description (Optional)</Text>
      <TextInput
        style={styles.input}
        value={description}
        onChangeText={setDescription}
        placeholder="Reason for loan"
      />

      <TouchableOpacity
        style={styles.submitBtn}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.submitBtnText}>
          {loading ? "Saving..." : "Save Loan"}
        </Text>
      </TouchableOpacity>
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
