import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import BudgetService from "../services/budgetService";
import CategoryService from "../services/categoryService";

export default function AddBudgetScreen({ navigation }) {
  const [amount, setAmount] = useState("");
  const [period, setPeriod] = useState("monthly"); // monthly, yearly
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [endDate, setEndDate] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCategories();
    calculateEndDate("monthly", new Date().toISOString().split("T")[0]);
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
    }
  };

  const calculateEndDate = (p, start) => {
    const d = new Date(start);
    if (p === "monthly") d.setMonth(d.getMonth() + 1);
    else d.setFullYear(d.getFullYear() + 1);
    setEndDate(d.toISOString().split("T")[0]);
  };

  const handlePeriodChange = (p) => {
    setPeriod(p);
    calculateEndDate(p, startDate);
  };

  const handleSubmit = async () => {
    if (!amount || !selectedCategory) {
      Alert.alert("Error", "Please fill required fields");
      return;
    }

    setLoading(true);
    try {
      await BudgetService.create({
        category_id: selectedCategory,
        amount: parseFloat(amount),
        period,
        start_date: startDate,
        end_date: endDate,
      });
      Alert.alert("Success", "Budget set successfully");
      navigation.goBack();
    } catch (error) {
      console.log(error.response?.data);
      Alert.alert("Error", "Failed to add budget");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Period</Text>
      <View style={styles.typeRow}>
        <TouchableOpacity
          style={[styles.typeBtn, period === "monthly" && styles.typeBtnActive]}
          onPress={() => handlePeriodChange("monthly")}
        >
          <Text
            style={[
              styles.typeText,
              period === "monthly" && styles.typeTextActive,
            ]}
          >
            Monthly
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.typeBtn, period === "yearly" && styles.typeBtnActive]}
          onPress={() => handlePeriodChange("yearly")}
        >
          <Text
            style={[
              styles.typeText,
              period === "yearly" && styles.typeTextActive,
            ]}
          >
            Yearly
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Limit Amount ($)</Text>
      <TextInput
        style={styles.input}
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        placeholder="0.00"
      />

      <Text style={styles.label}>Category to Track</Text>
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

      <View style={styles.dateRow}>
        <View style={{ flex: 1, marginRight: 5 }}>
          <Text style={styles.label}>Start Date</Text>
          <TextInput style={styles.input} value={startDate} editable={false} />
        </View>
        <View style={{ flex: 1, marginLeft: 5 }}>
          <Text style={styles.label}>End Date</Text>
          <TextInput style={styles.input} value={endDate} editable={false} />
        </View>
      </View>

      <TouchableOpacity
        style={styles.submitBtn}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.submitBtnText}>
          {loading ? "Saving..." : "Set Budget"}
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
    color: "#333",
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
  typeBtnActive: { backgroundColor: "#F59E0B", borderColor: "#F59E0B" },
  typeText: { fontWeight: "bold", color: "#666" },
  typeTextActive: { color: "#fff" },

  categoryContainer: { flexDirection: "row", marginVertical: 10 },
  categoryChip: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 5,
  },
  selectedChip: { backgroundColor: "#F59E0B", borderColor: "#F59E0B" },
  chipText: { color: "#333" },
  selectedChipText: { color: "#fff" },

  dateRow: { flexDirection: "row", justifyContent: "space-between" },

  submitBtn: {
    backgroundColor: "#F59E0B",
    padding: 15,
    borderRadius: 10,
    marginTop: 30,
    alignItems: "center",
  },
  submitBtnText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});
