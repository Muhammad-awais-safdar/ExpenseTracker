import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import BudgetService from "../services/budgetService";
import CategoryService from "../services/categoryService";
import MemoryCache from "../utils/memoryCache";
import CustomAlert from "../components/ui/CustomAlert";
import ModernButton from "../components/ui/ModernButton";
import CustomDatePicker from "../components/ui/CustomDatePicker";
import { useTheme } from "../context/ThemeContext";

export default function AddBudgetScreen({ navigation }) {
  const [alertConfig, setAlertConfig] = useState({ visible: false });
  const [amount, setAmount] = useState("");
  const [period, setPeriod] = useState("monthly"); // monthly, yearly
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [endDate, setEndDate] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const { colors, isDarkMode } = useTheme();

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
      // alert("Error"); // Silent fail or retry
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
      setAlertConfig({
        visible: true,
        title: "Missing Data",
        message: "Please select a category and enter a limit amount.",
        type: "warning",
        confirmText: "Okay",
        onConfirm: () => setAlertConfig({ visible: false }),
      });
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
      MemoryCache.clear();
      setAlertConfig({
        visible: true,
        title: "Budget Set",
        message: "Your budget has been successfully created.",
        type: "success",
        confirmText: "Excellent",
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
        message: "Failed to set budget. Please try again.",
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
    typeBtnActive: { backgroundColor: colors.info, borderColor: colors.info },
    typeText: { fontWeight: "bold", color: colors.textSecondary },
    typeTextActive: { color: "#fff" },

    categoryContainer: { flexDirection: "row", marginVertical: 10 },
    categoryChip: {
      padding: 10,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 20,
      marginRight: 10,
      marginBottom: 5,
      backgroundColor: colors.surface,
    },
    selectedChip: { backgroundColor: colors.info, borderColor: colors.info },
    chipText: { color: colors.text },
    selectedChipText: { color: "#fff" },

    dateRow: { flexDirection: "row", justifyContent: "space-between" },
  });

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

      <Text style={styles.label}>Limit Amount (PKR)</Text>
      <TextInput
        style={styles.input}
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        placeholder="0.00"
        placeholderTextColor={colors.placeholder}
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
          <CustomDatePicker
            label="Start Date"
            value={startDate}
            onChange={(d) => {
              setStartDate(d);
              calculateEndDate(period, d);
            }}
          />
        </View>
        <View style={{ flex: 1, marginLeft: 5 }}>
          <Text style={styles.label}>End Date</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.inputBackground, opacity: 0.7 },
            ]}
            value={endDate}
            editable={false}
            placeholderTextColor={colors.placeholder}
          />
        </View>
      </View>

      <ModernButton
        title="Set Budget"
        onPress={handleSubmit}
        loading={loading}
        style={{ backgroundColor: colors.info, marginTop: 30 }}
      />

      <CustomAlert {...alertConfig} />
    </ScrollView>
  );
}
