import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, ScrollView, RefreshControl } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";
import DashboardService from "../services/dashboardService";
import LoanService from "../services/loanService";

export default function FinancialHealthScreen() {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const dashboard = await DashboardService.getSummary();
      const loansData = await LoanService.getAll();
      const loans = Array.isArray(loansData?.data) ? loansData.data : (loansData || []);

      const pendingGiven = loans
        .filter((l) => l.status === "pending" && l.type === "given")
        .reduce((a, b) => a + Number(b.amount || 0), 0);
      const pendingTaken = loans
        .filter((l) => l.status === "pending" && l.type === "taken")
        .reduce((a, b) => a + Number(b.amount || 0), 0);

      const netWorth =
        Number(dashboard?.summary?.balance || 0) + pendingGiven - pendingTaken;

      const trendExpenses = (dashboard?.trends || []).map((t) => Number(t.expense || 0));
      const avgExpense =
        trendExpenses.length > 0
          ? trendExpenses.reduce((a, b) => a + b, 0) / trendExpenses.length
          : 0;
      const currentExpense = Number(dashboard?.summary?.monthly_expense || 0);
      const anomalyRatio = avgExpense > 0 ? currentExpense / avgExpense : 1;

      const forecastSavings =
        Number(dashboard?.summary?.monthly_income || 0) -
        Number(dashboard?.summary?.monthly_expense || 0);

      setSummary({
        netWorth,
        pendingGiven,
        pendingTaken,
        avgExpense,
        currentExpense,
        anomalyRatio,
        forecastSavings,
      });
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, []),
  );

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, padding: 16 },
    card: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 14,
      marginBottom: 12,
    },
    title: { color: colors.text, fontWeight: "700", fontSize: 16, marginBottom: 8 },
    label: { color: colors.textSecondary, fontSize: 13, marginBottom: 4 },
    value: { color: colors.text, fontWeight: "700", fontSize: 18 },
  });

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Net Worth</Text>
        <Text style={styles.label}>Balance + receivable loans - payable loans</Text>
        <Text style={styles.value}>Rs {Number(summary?.netWorth || 0).toFixed(2)}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.title}>Debt Position</Text>
        <Text style={styles.label}>
          Receivable: Rs {Number(summary?.pendingGiven || 0).toFixed(2)}
        </Text>
        <Text style={styles.label}>
          Payable: Rs {Number(summary?.pendingTaken || 0).toFixed(2)}
        </Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.title}>Spending Anomaly</Text>
        <Text style={styles.label}>
          This month expense: Rs {Number(summary?.currentExpense || 0).toFixed(2)}
        </Text>
        <Text style={styles.label}>
          Avg expense (recent trend): Rs {Number(summary?.avgExpense || 0).toFixed(2)}
        </Text>
        <Text style={styles.value}>
          {summary?.anomalyRatio >= 1.2 ? "High Spending Detected" : "Normal Spending"}
        </Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.title}>Cashflow Forecast</Text>
        <Text style={styles.label}>Projected monthly savings (income - expense)</Text>
        <Text style={styles.value}>
          Rs {Number(summary?.forecastSavings || 0).toFixed(2)}
        </Text>
      </View>
    </ScrollView>
  );
}
