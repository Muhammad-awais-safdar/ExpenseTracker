import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { LineChart, PieChart } from "react-native-chart-kit";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { useTheme } from "../context/ThemeContext";
import DashboardService from "../services/dashboardService";
import ModernButton from "../components/ui/ModernButton";
import { Ionicons } from "@expo/vector-icons";

export default function AnalyticsScreen({ navigation }) {
  const { colors, isDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const screenWidth = Dimensions.get("window").width;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const dashboardData = await DashboardService.getDashboardData();
      setData(dashboardData);
    } catch (error) {
      console.error("Failed to load analytics", error);
    } finally {
      setLoading(false);
    }
  };

  const chartConfig = {
    backgroundGradientFrom: isDarkMode ? "#1F2937" : "#fff",
    backgroundGradientTo: isDarkMode ? "#1F2937" : "#fff",
    color: (opacity = 1) =>
      isDarkMode
        ? `rgba(255, 255, 255, ${opacity})`
        : `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!data) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Failed to load data</Text>
        <ModernButton title="Retry" onPress={loadData} />
      </View>
    );
  }

  // Parse Trend Data for Line Chart
  const trendLabels = data.trends?.map((t) => t.month) || [];
  const incomeData = data.trends?.map((t) => parseFloat(t.income)) || [];
  const expenseData = data.trends?.map((t) => parseFloat(t.expense)) || [];

  const lineChartData = {
    labels: trendLabels,
    datasets: [
      {
        data: incomeData,
        color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`, // Green
        strokeWidth: 2,
      },
      {
        data: expenseData,
        color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`, // Red
        strokeWidth: 2,
      },
    ],
    legend: ["Income", "Expense"],
  };

  // Parse Category Data for Pie Chart
  const pieData =
    data.expense_by_category?.map((item) => ({
      name: item.category.name,
      population: parseFloat(item.total),
      color: item.category.color,
      legendFontColor: isDarkMode ? "#fff" : "#333",
      legendFontSize: 12,
    })) || [];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Text style={[styles.header, { color: colors.text }]}>
        Financial Trends
      </Text>
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <LineChart
          data={lineChartData}
          width={screenWidth - 40}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
        />
      </View>

      <Text style={[styles.header, { color: colors.text, marginTop: 20 }]}>
        Expense Breakdown
      </Text>
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        {pieData.length > 0 ? (
          <PieChart
            data={pieData}
            width={screenWidth - 40}
            height={220}
            chartConfig={chartConfig}
            accessor={"population"}
            backgroundColor={"transparent"}
            paddingLeft={"15"}
            absolute
          />
        ) : (
          <View
            style={{
              height: 100,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ color: colors.textSecondary }}>
              No expense data available
            </Text>
          </View>
        )}
      </View>

      <View style={{ marginTop: 20, marginBottom: 40 }}>
        <ModernButton
          title="Download PDF Report"
          icon={(props) => (
            <Ionicons name="document-text" size={20} color="#fff" {...props} />
          )}
          onPress={generatePDF}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  card: {
    padding: 10,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
