import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import BudgetService from "../services/budgetService";
import { useFocusEffect } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";

export default function BudgetsScreen({ navigation }) {
  const { colors, isDarkMode } = useTheme();
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
    return (
      <ActivityIndicator
        size="large"
        style={{ flex: 1 }}
        color={colors.primary}
      />
    );
  }

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    item: {
      padding: 15,
      marginHorizontal: 15,
      marginTop: 10,
      backgroundColor: colors.card,
      borderRadius: 10,
      elevation: 1,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 5,
    },
    catName: { fontSize: 18, fontWeight: "bold", color: colors.text },
    amt: { fontSize: 18, fontWeight: "bold", color: colors.info },
    period: { color: colors.textSecondary, fontSize: 12, marginTop: 10 },

    progressContainer: {
      height: 8,
      backgroundColor: colors.border,
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
    usedText: { fontSize: 14, color: colors.textSecondary },
    totalText: { fontSize: 14, color: colors.text, fontWeight: "bold" },

    empty: { textAlign: "center", marginTop: 50, color: colors.textSecondary },
    fab: {
      position: "absolute",
      bottom: 30,
      right: 30,
      backgroundColor: colors.info,
      width: 60,
      height: 60,
      borderRadius: 30,
      justifyContent: "center",
      alignItems: "center",
      elevation: 5,
    },
    fabText: { color: "#fff", fontSize: 30, fontWeight: "bold", marginTop: -2 },
  });

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
                    backgroundColor: item.category?.color || colors.info,
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
