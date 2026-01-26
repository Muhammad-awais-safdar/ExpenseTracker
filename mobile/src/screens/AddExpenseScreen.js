import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import ExpenseService from "../services/expenseService";
import CategoryService from "../services/categoryService";
import { Ionicons } from "@expo/vector-icons";

export default function AddExpenseScreen({ navigation }) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingCats, setLoadingCats] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await CategoryService.getAll();
      const expenseCategories = data.filter((c) => c.type === "expense");
      setCategories(expenseCategories);
      if (expenseCategories.length > 0)
        setSelectedCategory(expenseCategories[0].id);
    } catch (error) {
      Alert.alert("Error", "Failed to load categories");
    } finally {
      setLoadingCats(false);
    }
  };

  const handleSubmit = async () => {
    if (!amount || !selectedCategory) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      await ExpenseService.create({
        amount: parseFloat(amount),
        description,
        date,
        category_id: selectedCategory,
      });
      Alert.alert("Success", "Expense added");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "Failed to add expense");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Amount ($)</Text>
        <TextInput
          style={styles.input}
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          placeholder="0.00"
          placeholderTextColor="#9CA3AF"
          autoFocus
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={styles.input}
          value={description}
          onChangeText={setDescription}
          placeholder="What did you buy?"
          placeholderTextColor="#9CA3AF"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
        <TextInput
          style={styles.input}
          value={date}
          onChangeText={setDate}
          placeholder="2023-01-01"
          placeholderTextColor="#9CA3AF"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Category</Text>
        {loadingCats ? (
          <ActivityIndicator color="#4F46E5" />
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryContainer}
          >
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryChip,
                  selectedCategory === cat.id && styles.selectedChip,
                ]}
                onPress={() => setSelectedCategory(cat.id)}
              >
                <Text
                  style={[
                    styles.chipText,
                    selectedCategory === cat.id && styles.selectedChipText,
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      <TouchableOpacity
        style={styles.submitBtn}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitBtnText}>Save Expense</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F9FAFB" },

  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 8 },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 15,
    borderRadius: 12,
    fontSize: 16,
    color: "#1F2937",
  },

  categoryContainer: { flexDirection: "row", paddingTop: 5 },
  categoryChip: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 25,
    marginRight: 10,
  },
  selectedChip: { backgroundColor: "#4F46E5", borderColor: "#4F46E5" },
  chipText: { color: "#374151", fontWeight: "500" },
  selectedChipText: { color: "#fff" },

  submitBtn: {
    backgroundColor: "#4F46E5",
    padding: 18,
    borderRadius: 16,
    marginTop: 20,
    alignItems: "center",
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
