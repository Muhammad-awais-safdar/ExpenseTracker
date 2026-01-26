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

export default function ExpensesScreen({ navigation }) {
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
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#EF4444" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#EF4444"
          />
        }
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={styles.iconBox}>
              <Ionicons name="receipt-outline" size={20} color="#EF4444" />
            </View>
            <View style={styles.info}>
              <Text style={styles.desc}>{item.description}</Text>
              <Text style={styles.category}>
                {item.category?.name || "Uncategorized"} •{" "}
                {new Date(item.date).toLocaleDateString()}
              </Text>
            </View>
            <Text style={styles.amount}>-${item.amount}</Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={50} color="#ccc" />
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  iconBox: {
    width: 40,
    height: 40,
    backgroundColor: "#FEE2E2",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  info: { flex: 1 },
  desc: { fontSize: 16, fontWeight: "600", color: "#1F2937", marginBottom: 4 },
  category: { fontSize: 12, color: "#6B7280" },
  amount: { fontSize: 16, fontWeight: "bold", color: "#EF4444" },

  emptyContainer: { alignItems: "center", marginTop: 50 },
  emptyText: { color: "#9CA3AF", marginTop: 10, fontSize: 16 },

  fab: {
    position: "absolute",
    bottom: 30,
    right: 30,
    backgroundColor: "#EF4444",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
});
