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

export default function AddRecurringScreen({ navigation }) {
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
      console.log(error);
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.form}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Netflix Subscription"
        />

        <Text style={styles.label}>Amount</Text>
        <TextInput
          style={styles.input}
          value={amount}
          onChangeText={setAmount}
          placeholder="0.00"
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
                { borderColor: t === "expense" ? "#EF4444" : "#10B981" },
                type === t && {
                  backgroundColor: t === "expense" ? "#EF4444" : "#10B981",
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
                          ? "#EF4444"
                          : "#10B981",
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
          <Text>{startDate.toLocaleDateString()}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display="default"
            onChange={onDateChange}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 5,
    marginTop: 15,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
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
    borderColor: "#E5E7EB",
    marginRight: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  activeFreqChip: {
    backgroundColor: "#4F46E5",
    borderColor: "#4F46E5",
  },
  chipText: {
    color: "#374151",
  },
  activeChipText: {
    color: "#fff",
    fontWeight: "bold",
  },
  activeChip: {
    // styles handled inline for dynamic colors or generic active class
  },
  dateButton: {
    padding: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
  },
  button: {
    backgroundColor: "#4F46E5",
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
