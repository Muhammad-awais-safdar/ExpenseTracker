import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ProgressBarAndroid,
} from "react-native";
import BudgetService from "../services/budgetService";
import { useFocusEffect } from "@react-navigation/native";

export default function BudgetsScreen({ navigation }) {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadBudgets = async () => {
    try {
      const data = await BudgetService.getAll();
      setBudgets(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadBudgets();
    }, []),
  );

  if (loading) {
    return <ActivityIndicator size="large" style={{ flex: 1 }} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={budgets}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={styles.header}>
              <Text style={styles.catName}>
                {item.category?.name || "General"}
              </Text>
              <Text style={styles.amt}>{Math.round(item.percentage)}%</Text>
            </View>

            <View style={styles.progressContainer}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${item.percentage}%`,
                    backgroundColor: item.category?.color || "#4F46E5",
                  },
                ]}
              />
            </View>

            <View style={styles.rowBetween}>
              <Text style={styles.usedText}>
                Used:{" "}
                <Text style={{ fontWeight: "bold" }}>Rs {item.spent}</Text>
              </Text>
              <Text style={styles.totalText}>Total: Rs {item.amount}</Text>
            </View>

            <Text style={styles.period}>
              {item.period.toUpperCase()} • Ends{" "}
              {new Date(item.end_date).toLocaleDateString()}
            </Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No active budgets</Text>}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("AddBudget")}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  item: {
    padding: 15,
    marginHorizontal: 15,
    marginTop: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  catName: { fontSize: 18, fontWeight: "bold" },
  amt: { fontSize: 18, fontWeight: "bold", color: "#4F46E5" },
  period: { color: "#666", fontSize: 12, marginTop: 10 },

  progressContainer: {
    height: 8,
    backgroundColor: "#E5E7EB", // Gray-200
    borderRadius: 4,
    marginVertical: 10,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 4,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  usedText: { fontSize: 14, color: "#6B7280" },
  totalText: { fontSize: 14, color: "#111827", fontWeight: "bold" },

  empty: { textAlign: "center", marginTop: 50, color: "#888" },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 30,
    backgroundColor: "#F59E0B",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  fabText: { color: "#fff", fontSize: 30, fontWeight: "bold", marginTop: -2 },
});
