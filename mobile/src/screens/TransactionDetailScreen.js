import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import TransactionService from "../services/transactionService";

export default function TransactionDetailScreen({ route, navigation }) {
  const { transaction } = route.params;
  const { colors, isDarkMode } = useTheme();

  const isExpense = transaction.type === "expense";
  const isIncome = transaction.type === "income";
  const isLoan = transaction.type.includes("loan");

  // Determine color and icon
  let color = colors.text;
  let icon = "help-circle";

  if (isExpense) {
    color = colors.danger;
    icon = "cart";
  } else if (isIncome) {
    color = colors.success;
    icon = "wallet";
  } else if (isLoan) {
    color = colors.warning;
    icon = "swap-horizontal";
  }

  // Handle Delete
  const handleDelete = () => {
    Alert.alert("Delete Transaction", "Are you sure? This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await TransactionService.delete(transaction.id, transaction.type);
            navigation.goBack();
            // Note: The previous screen needs to refresh.
            // We can rely on useFocusEffect there or pass a callback.
          } catch (error) {
            Alert.alert("Error", "Failed to delete");
          }
        },
      },
    ]);
  };

  const DetailRow = ({ label, value, valueStyle }) => (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, valueStyle]}>{value}</Text>
    </View>
  );

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      alignItems: "center",
      paddingVertical: 40,
      backgroundColor: isDarkMode ? colors.surfaceHighlight : color,
    },
    iconCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: "rgba(255,255,255,0.2)",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 15,
    },
    amount: {
      fontSize: 36,
      fontWeight: "bold",
      color: "#fff",
    },
    typeText: {
      fontSize: 16,
      color: "rgba(255,255,255,0.9)",
      marginTop: 5,
      textTransform: "capitalize",
    },
    content: {
      flex: 1,
      padding: 20,
      marginTop: -20,
      backgroundColor: colors.background,
      borderTopLeftRadius: 25,
      borderTopRightRadius: 25,
    },
    section: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 5,
      elevation: 3,
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    label: {
      fontSize: 15,
      color: colors.textSecondary,
    },
    value: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
      flexShrink: 1,
      textAlign: "right",
      maxWidth: "60%",
    },
    deleteBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(239, 68, 68, 0.1)",
      padding: 15,
      borderRadius: 12,
      marginTop: 10,
    },
    deleteText: {
      color: colors.danger,
      fontWeight: "bold",
      marginLeft: 8,
      fontSize: 16,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Ionicons name={icon} size={40} color="#fff" />
        </View>
        <Text style={styles.amount}>Rs {transaction.amount}</Text>
        <Text style={styles.typeText}>
          {transaction.type.replace("_", " ")}
        </Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <DetailRow
            label="Date"
            value={new Date(transaction.date).toLocaleDateString()}
          />
          <DetailRow
            label="Category"
            value={transaction.category?.name || "N/A"}
          />
          <DetailRow
            label="Description/Source"
            value={
              transaction.title ||
              transaction.description ||
              transaction.source ||
              "N/A"
            }
          />

          {isLoan && <DetailRow label="Person" value={transaction.title} />}

          <DetailRow
            label="Transaction ID"
            value={`#${transaction.id}`}
            valueStyle={{ fontSize: 12, color: colors.textSecondary }}
          />
        </View>

        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={20} color={colors.danger} />
          <Text style={styles.deleteText}>Delete Transaction</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
