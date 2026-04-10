import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import RecurringService from "../services/recurringService";
import { useTheme } from "../context/ThemeContext";

export default function AddRecurringScreen({ navigation }) {
  const { colors, isDarkMode } = useTheme();
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");
  const [frequency, setFrequency] = useState("monthly");
  const [startDate, setStartDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title || !amount) {
      Alert.alert("Error", "Title and Amount are required");
      return;
    }

    setLoading(true);
    try {
      await RecurringService.create({
        title,
        amount: parseFloat(amount),
        type,
        frequency,
        start_date: startDate.toISOString().split("T")[0],
      });
      Alert.alert("Success", "Recurring transaction created");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "Failed to create rule");
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) setStartDate(selectedDate);
  };

  const frequencies = ["daily", "weekly", "monthly", "yearly"];
  const expenseChipColor = colors.danger;
  const incomeChipColor = colors.success;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    form: {
      padding: 20,
    },
    label: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 5,
      marginTop: 15,
    },
    input: {
      backgroundColor: colors.inputBackground,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: colors.text,
    },
    row: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginTop: 5,
    },
    chip: {
      paddingHorizontal: 15,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      marginRight: 10,
      marginBottom: 10,
      backgroundColor: colors.card,
    },
    activeFreqChip: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    chipText: {
      color: colors.text,
    },
    activeChipText: {
      color: "#fff",
      fontWeight: "bold",
    },
    activeChip: {},
    dateButton: {
      padding: 12,
      backgroundColor: colors.inputBackground,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
    },
    dateText: {
      color: colors.text,
    },
    button: {
      backgroundColor: colors.primary,
      paddingVertical: 14,
      borderRadius: 8,
      alignItems: "center",
      marginTop: 30,
    },
    buttonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "bold",
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.form}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Netflix Subscription"
          placeholderTextColor={colors.placeholder}
        />

        <Text style={styles.label}>Amount</Text>
        <TextInput
          style={styles.input}
          value={amount}
          onChangeText={setAmount}
          placeholder="0.00"
          placeholderTextColor={colors.placeholder}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Type</Text>
        <View style={styles.row}>
          {["expense", "income"].map((t) => (
            <TouchableOpacity
              key={t}
              style={[
                styles.chip,
                type === t && styles.activeChip,
                {
                  borderColor: t === "expense" ? expenseChipColor : incomeChipColor,
                },
                type === t && {
                  backgroundColor:
                    t === "expense" ? expenseChipColor : incomeChipColor,
                },
              ]}
              onPress={() => setType(t)}
            >
              <Text
                style={[
                  styles.chipText,
                  type === t && styles.activeChipText,
                  {
                    color:
                      type === t
                        ? "#fff"
                        : t === "expense"
                          ? expenseChipColor
                          : incomeChipColor,
                  },
                ]}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Frequency</Text>
        <View style={styles.row}>
          {frequencies.map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.chip, frequency === f && styles.activeFreqChip]}
              onPress={() => setFrequency(f)}
            >
              <Text
                style={[
                  styles.chipText,
                  frequency === f && styles.activeChipText,
                ]}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Start Date</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateText}>{startDate.toLocaleDateString()}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display="default"
            onChange={onDateChange}
            themeVariant={isDarkMode ? "dark" : "light"}
          />
        )}

        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Create Rule</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
