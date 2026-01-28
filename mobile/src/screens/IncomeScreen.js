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
import IncomeService from "../services/incomeService";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

export default function IncomeScreen({ navigation }) {
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadIncomes = async () => {
    try {
      const data = await IncomeService.getAll();
      setIncomes(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadIncomes();
    }, []),
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadIncomes();
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={incomes}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#10B981"
          />
        }
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={styles.iconBox}>
              <Ionicons name="cash-outline" size={20} color="#10B981" />
            </View>
            <View style={styles.info}>
              <Text style={styles.desc}>{item.source}</Text>
              <Text style={styles.category}>
                {item.category?.name || "Uncategorized"} •{" "}
                {new Date(item.date).toLocaleDateString()}
              </Text>
            </View>
            <Text style={styles.amount}>+Rs {item.amount}</Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="wallet-outline" size={50} color="#ccc" />
            <Text style={styles.emptyText}>No income records yet</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("AddIncome")}
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
    backgroundColor: "#D1FAE5",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  info: { flex: 1 },
  desc: { fontSize: 16, fontWeight: "600", color: "#1F2937", marginBottom: 4 },
  category: { fontSize: 12, color: "#6B7280" },
  amount: { fontSize: 16, fontWeight: "bold", color: "#10B981" },

  emptyContainer: { alignItems: "center", marginTop: 50 },
  emptyText: { color: "#9CA3AF", marginTop: 10, fontSize: 16 },

  fab: {
    position: "absolute",
    bottom: 30,
    right: 30,
    backgroundColor: "#10B981",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
});
