import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import ExpenseService from "../services/expenseService";
import CategoryService from "../services/categoryService";
import MemoryCache from "../utils/memoryCache";
import { Ionicons } from "@expo/vector-icons";
import CustomAlert from "../components/ui/CustomAlert";
import ModernButton from "../components/ui/ModernButton";
import CustomDatePicker from "../components/ui/CustomDatePicker";

export default function AddExpenseScreen({ navigation }) {
  const [alertConfig, setAlertConfig] = useState({ visible: false });
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
      setAlertConfig({
        visible: true,
        title: "Missing Information",
        message: "Please enter an amount and select a category.",
        type: "warning",
        confirmText: "Okay",
        onConfirm: () => setAlertConfig({ visible: false }),
      });
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
      MemoryCache.clear(); // Clear cache to force refresh
      setAlertConfig({
        visible: true,
        title: "Success",
        message: "Expense recorded successfully!",
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
        message: "Failed to save expense. Please try again.",
        type: "error",
        onConfirm: () => setAlertConfig({ visible: false }),
      });
    } finally {
      setLoading(false);
    }
  };

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

      <CustomDatePicker label="Date" value={date} onChange={setDate} />

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

      <ModernButton
        title="Save Expense"
        onPress={handleSubmit}
        loading={loading}
        icon={(props) => (
          <Ionicons name="checkmark-circle" size={20} color="#fff" {...props} />
        )}
      />

      <CustomAlert {...alertConfig} />
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

  submitBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
