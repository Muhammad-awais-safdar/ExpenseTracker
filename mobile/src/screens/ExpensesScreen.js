import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import ExpenseService from "../services/expenseService";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

export default function ExpensesScreen({ navigation }) {
  const { colors, isDarkMode } = useTheme();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadExpenses = async () => {
    try {
      const data = await ExpenseService.getAll();
      setExpenses(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadExpenses();
    }, []),
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadExpenses();
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.danger} />
      </View>
    );
  }

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    item: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      padding: 16,
      borderRadius: 16,
      marginBottom: 12,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 5,
      elevation: 2,
    },
    iconBox: {
      width: 40,
      height: 40,
      backgroundColor: isDarkMode ? "rgba(239, 68, 68, 0.1)" : "#FEE2E2",
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 15,
    },
    info: { flex: 1 },
    desc: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 4,
    },
    category: { fontSize: 12, color: colors.textSecondary },
    amount: { fontSize: 16, fontWeight: "bold", color: colors.danger },

    emptyContainer: { alignItems: "center", marginTop: 50 },
    emptyText: { color: colors.textSecondary, marginTop: 10, fontSize: 16 },

    fab: {
      position: "absolute",
      bottom: 30,
      right: 30,
      backgroundColor: colors.danger,
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: colors.danger,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
    },
  });

  return (
    <View style={styles.container}>
      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.danger}
          />
        }
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={styles.iconBox}>
              <Ionicons
                name="receipt-outline"
                size={20}
                color={colors.danger}
              />
            </View>
            <View style={styles.info}>
              <Text style={styles.desc}>{item.description}</Text>
              <Text style={styles.category}>
                {item.category?.name || "Uncategorized"} •{" "}
                {new Date(item.date).toLocaleDateString()}
              </Text>
            </View>
            <Text style={styles.amount}>-Rs {item.amount}</Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="receipt-outline"
              size={50}
              color={colors.textSecondary}
            />
            <Text style={styles.emptyText}>No expenses yet</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("AddExpense")}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}
