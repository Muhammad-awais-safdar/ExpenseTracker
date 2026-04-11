import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import IncomeService from "../services/incomeService";
import CategoryService from "../services/categoryService";
import { getErrorMessage } from "../api/axios";
import { useToast } from "../context/ToastContext";
import MemoryCache from "../utils/memoryCache";
import { useSync } from "../context/SyncContext";
import { useTheme } from "../context/ThemeContext";
import CustomAlert from "../components/ui/CustomAlert";
import ModernButton from "../components/ui/ModernButton";
import CustomDatePicker from "../components/ui/CustomDatePicker";

export default function AddIncomeScreen({ navigation }) {
  const [alertConfig, setAlertConfig] = useState({ visible: false });
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingCats, setLoadingCats] = useState(true);
  const { isOnline, addToQueue, syncNow, isSyncing } = useSync();
  const { colors, isDarkMode } = useTheme();
  const { showToast } = useToast();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await CategoryService.getAll();
      const incomeCategories = data.filter((c) => c.type === "income");
      setCategories(incomeCategories);
      if (incomeCategories.length > 0)
        setSelectedCategory(incomeCategories[0].id);
    } catch (error) {
      if (error.response?.status !== 401) {
        showToast("Error", getErrorMessage(error), "error");
      }
    } finally {
      setLoadingCats(false);
    }
  };

  const handleSubmit = async () => {
    if (!amount || !selectedCategory) {
      showToast("Missing Information", "Please enter an amount and select a category.", "warning");
      return;
    }

    setLoading(true);
    try {
      if (!isOnline) {
        addToQueue({
          type: "ADD_INCOME",
          payload: {
            amount: parseFloat(amount),
            source,
            date,
            category_id: selectedCategory,
          },
        });
        showToast("Saved Offline", "Income saved to offline queue. Will sync when online.", "info");
        navigation.goBack();
      } else {
        await IncomeService.create({
          amount: parseFloat(amount),
          source,
          date,
          category_id: selectedCategory,
        });
        showToast("Success", "Income recorded successfully!", "success");
        navigation.goBack();
      }
    } catch (error) {
      showToast("Error", getErrorMessage(error), "error");
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: colors.background },
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

    categoryContainer: { flexDirection: "row", paddingTop: 5 },
    categoryChip: {
      paddingVertical: 10,
      paddingHorizontal: 20,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 25,
      marginRight: 10,
    },
    selectedChip: {
      backgroundColor: colors.success,
      borderColor: colors.success,
    },
    chipText: { color: colors.text, fontWeight: "500" },
    selectedChipText: { color: "#fff" },

    submitBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Amount (PKR)</Text>
        <TextInput
          style={styles.input}
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          placeholder="0.00"
          placeholderTextColor={colors.placeholder}
          autoFocus
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Source</Text>
        <TextInput
          style={styles.input}
          value={source}
          onChangeText={setSource}
          placeholder="e.g. Salary, Freelance"
          placeholderTextColor={colors.placeholder}
        />
      </View>

      <CustomDatePicker label="Date" value={date} onChange={setDate} />

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Category</Text>
        {loadingCats ? (
          <ActivityIndicator color={colors.success} />
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

      <ModernButton
        title="Save Income"
        onPress={handleSubmit}
        loading={loading}
        style={{ backgroundColor: colors.success }} // Override for Income Green
      />
      <CustomAlert {...alertConfig} />
    </ScrollView>
  );
}
