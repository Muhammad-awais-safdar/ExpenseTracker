import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";

export default function CustomDatePicker({ label, value, onChange }) {
  const { colors, isDarkMode } = useTheme();
  const [show, setShow] = useState(false);

  const displayDate = value ? new Date(value) : new Date();

  const handleChange = (event, selectedDate) => {
    if (Platform.OS === "android") {
      setShow(false);
    }

    if (selectedDate) {
      // Format to YYYY-MM-DD
      const formatted = selectedDate.toISOString().split("T")[0];
      onChange(formatted);
    }
  };

  const styles = StyleSheet.create({
    container: { marginBottom: 20 },
    label: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 8,
    },
    btn: {
      backgroundColor: colors.inputBackground,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 15,
      borderRadius: 12,
      flexDirection: "row",
      alignItems: "center",
    },
    text: { fontSize: 16, color: colors.text },
    placeholder: { color: colors.placeholder },
  });

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TouchableOpacity style={styles.btn} onPress={() => setShow(true)}>
        <Ionicons
          name="calendar-outline"
          size={20}
          color={colors.textSecondary}
          style={{ marginRight: 10 }}
        />
        <Text style={[styles.text, !value && styles.placeholder]}>
          {value || "Select Date"}
        </Text>
      </TouchableOpacity>

      {show && (
        <DateTimePicker
          testID="dateTimePicker"
          value={displayDate}
          mode="date"
          is24Hour={true}
          display={Platform.OS === "ios" ? "inline" : "default"}
          onChange={handleChange}
          themeVariant={isDarkMode ? "dark" : "light"}
        />
      )}
    </View>
  );
}
