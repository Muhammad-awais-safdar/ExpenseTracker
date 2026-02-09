import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { LineChart, PieChart } from "react-native-chart-kit";
import AnalyticsService from "../services/analyticsService";
import { getValidIconName } from "../utils/iconMap";
import ExportService from "../services/exportService";
import { Alert } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

const { width } = Dimensions.get("window");

export default function AnalyticsScreen({ navigation }) {
  const { colors, isDarkMode } = useTheme();

  const handleExport = () => {
    Alert.alert("Export Report", "Choose a format", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "PDF Report",
        onPress: async () => {
          try {
            setLoading(true);
            await ExportService.exportToPdf(data, period.toUpperCase());
          } catch (e) {
            Alert.alert("Error", "Failed to generate PDF");
          } finally {
            setLoading(false);
          }
        },
      },
      {
        text: "CSV Data",
        onPress: async () => {
          try {
            setLoading(true);
            // Map Analytics filters to CSV filters
            const filters = {};
            if (period === "custom") {
              filters.start_date = startDate.toISOString().split("T")[0];
              filters.end_date = endDate.toISOString().split("T")[0];
            } else if (data?.range) {
              filters.start_date = data.range.start;
              filters.end_date = data.range.end;
            }
            await ExportService.exportToCsv(filters);
          } catch (e) {
            Alert.alert("Error", "Failed to download CSV");
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  // ... existing code ...
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState("month"); // day, week, month, year, custom
  const [data, setData] = useState(null);

  // Custom Date Range
  const [showStartDate, setShowStartDate] = useState(false);
  const [showEndDate, setShowEndDate] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const periods = [
    { label: "Today", value: "day" },
    { label: "Week", value: "week" },
    { label: "Month", value: "month" },
    { label: "Year", value: "year" },
  ];

  const fetchAnalytics = async () => {
    try {
      const result = await AnalyticsService.getAnalytics(
        period,
        period === "custom" ? startDate : null,
        period === "custom" ? endDate : null,
      );
      setData(result);
    } catch (error) {
      console.error("Failed to load analytics", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchAnalytics();
  }, [period, startDate, endDate]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAnalytics();
  }, []);

  // Format chart data
  const chartConfig = {
    backgroundGradientFrom: isDarkMode ? "#1F2937" : "#ffffff",
    backgroundGradientTo: isDarkMode ? "#1F2937" : "#ffffff",
    color: (opacity = 1) =>
      isDarkMode
        ? `rgba(99, 102, 241, ${opacity})`
        : `rgba(79, 70, 229, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    decimalPlaces: 0,
    labelColor: (opacity = 1) =>
      isDarkMode
        ? `rgba(255, 255, 255, ${opacity})`
        : `rgba(0, 0, 0, ${opacity})`,
  };

  const lineChartData = {
    labels: data?.chart_data?.map((d) => d.label) || [],
    datasets: [
      {
        data: data?.chart_data?.map((d) => d.expense) || [0],
        color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`, // Red for expense
        strokeWidth: 2,
      },
      {
        data: data?.chart_data?.map((d) => d.income) || [0],
        color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`, // Green for income
        strokeWidth: 2,
      },
    ],
    legend: ["Expense", "Income"],
  };

  const pieData =
    data?.categories?.map((c) => ({
      name: c.name,
      population: c.total,
      color: c.color,
      legendFontColor: isDarkMode ? "#E5E7EB" : "#374151",
      legendFontSize: 12,
    })) || [];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.card,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          },
        ]}
      >
        <Text
          style={[styles.headerTitle, { color: colors.text, marginLeft: 20 }]}
        >
          Analytics
        </Text>
        <TouchableOpacity onPress={handleExport} style={{ marginRight: 20 }}>
          <Ionicons name="share-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Period Selector */}
      <View style={styles.periodParams}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.periodSelector}
        >
          {periods.map((p) => (
            <TouchableOpacity
              key={p.value}
              style={[
                styles.periodBtn,
                period === p.value && { backgroundColor: colors.primary },
              ]}
              onPress={() => setPeriod(p.value)}
            >
              <Text
                style={[
                  { height: "100%" },
                  styles.periodText,
                  period === p.value
                    ? { color: "#fff" }
                    : { color: colors.textSecondary },
                ]}
              >
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[
              styles.periodBtn,
              period === "custom" && { backgroundColor: colors.primary },
            ]}
            onPress={() => setPeriod("custom")}
          >
            <Text
              style={[
                styles.periodText,
                period === "custom"
                  ? { color: "#fff" }
                  : { color: colors.textSecondary },
              ]}
            >
              Custom
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {period === "custom" && (
        <View style={styles.dateRange}>
          <TouchableOpacity
            onPress={() => setShowStartDate(true)}
            style={[styles.dateBtn, { borderColor: colors.border }]}
          >
            <Text style={{ color: colors.text }}>
              Start: {startDate.toLocaleDateString()}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowEndDate(true)}
            style={[styles.dateBtn, { borderColor: colors.border }]}
          >
            <Text style={{ color: colors.text }}>
              End: {endDate.toLocaleDateString()}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {showStartDate && (
        <DateTimePicker
          value={startDate}
          mode="date"
          onChange={(event, date) => {
            setShowStartDate(false);
            if (date) setStartDate(date);
          }}
        />
      )}
      {showEndDate && (
        <DateTimePicker
          value={endDate}
          mode="date"
          onChange={(event, date) => {
            setShowEndDate(false);
            if (date) setEndDate(date);
          }}
        />
      )}

      {loading ? (
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={{ marginTop: 50 }}
        />
      ) : (
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {/* Summary Cards */}
          <View style={styles.summaryRow}>
            <View
              style={[
                styles.summaryCard,
                {
                  backgroundColor: isDarkMode
                    ? "rgba(16, 185, 129, 0.1)"
                    : "#D1FAE5",
                },
              ]}
            >
              <Text
                style={[styles.summaryLabel, { color: colors.textSecondary }]}
              >
                Income
              </Text>
              <Text style={[styles.summaryValue, { color: colors.success }]}>
                Rs {data?.summary?.income?.toLocaleString() || 0}
              </Text>
            </View>
            <View
              style={[
                styles.summaryCard,
                {
                  backgroundColor: isDarkMode
                    ? "rgba(239, 68, 68, 0.1)"
                    : "#FEE2E2",
                },
              ]}
            >
              <Text
                style={[styles.summaryLabel, { color: colors.textSecondary }]}
              >
                Expense
              </Text>
              <Text style={[styles.summaryValue, { color: colors.danger }]}>
                Rs {data?.summary?.expense?.toLocaleString() || 0}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.summaryCard,
              {
                marginHorizontal: 20,
                marginBottom: 20,
                backgroundColor: isDarkMode
                  ? colors.surfaceHighlight
                  : "#F3F4F6",
              },
            ]}
          >
            <Text
              style={[styles.summaryLabel, { color: colors.textSecondary }]}
            >
              Total Savings
            </Text>
            <Text
              style={[
                styles.summaryValue,
                {
                  color:
                    data?.summary?.savings >= 0
                      ? colors.success
                      : colors.danger,
                },
              ]}
            >
              Rs {data?.summary?.savings?.toLocaleString() || 0} (
              {data?.summary?.savings_rate}%)
            </Text>
          </View>

          {/* Trend Chart */}
          <View
            style={[styles.chartContainer, { backgroundColor: colors.card }]}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Trends
            </Text>
            {data?.chart_data?.length > 0 ? (
              <LineChart
                data={lineChartData}
                width={width - 40}
                height={220}
                chartConfig={chartConfig}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16,
                }}
              />
            ) : (
              <Text
                style={{
                  textAlign: "center",
                  color: colors.textSecondary,
                  marginVertical: 20,
                }}
              >
                No data for this period
              </Text>
            )}
          </View>

          {/* Category Breakdown */}
          <View
            style={[
              styles.chartContainer,
              { backgroundColor: colors.card, marginTop: 20 },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Expenses by Category
            </Text>
            {pieData.length > 0 ? (
              <PieChart
                data={pieData}
                width={width - 40}
                height={220}
                chartConfig={chartConfig}
                accessor={"population"}
                backgroundColor={"transparent"}
                paddingLeft={"15"}
                absolute
              />
            ) : (
              <Text
                style={{
                  textAlign: "center",
                  color: colors.textSecondary,
                  marginVertical: 20,
                }}
              >
                No expenses for this period
              </Text>
            )}

            {/* List Breakdown */}
            <View style={styles.categoryList}>
              {data?.categories?.map((cat, index) => (
                <View
                  key={index}
                  style={[
                    styles.categoryItem,
                    { borderBottomColor: colors.border },
                  ]}
                >
                  <View
                    style={[
                      styles.iconBox,
                      { backgroundColor: cat.color + "20" },
                    ]}
                  >
                    <Ionicons
                      name={getValidIconName(cat.icon)}
                      size={20}
                      color={cat.color}
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text style={[styles.catName, { color: colors.text }]}>
                        {cat.name}
                      </Text>
                      <Text style={[styles.catAmount, { color: colors.text }]}>
                        Rs {cat.total.toLocaleString()}
                      </Text>
                    </View>
                    <View style={styles.progressBarBg}>
                      <View
                        style={[
                          styles.progressBarFill,
                          {
                            width: `${cat.percentage}%`,
                            backgroundColor: cat.color,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.catPercent}>{cat.percentage}%</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    // paddingHorizontal: 20, // Handled in inline style now
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  periodSelector: {
    paddingHorizontal: 20,
    marginVertical: 15,
  },
  periodParams: {
    height: 60,
  },
  periodBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: "rgba(0,0,0,0.05)",
    borderWidth: 1,
    borderColor: "transparent",
  },
  periodText: {
    fontWeight: "600",
  },
  dateRange: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingBottom: 10,
  },
  dateBtn: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
  },
  summaryRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    justifyContent: "space-between",
    marginBottom: 20,
  },
  summaryCard: {
    width: "48%",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "bold",
  },
  chartContainer: {
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 16,
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    alignSelf: "flex-start",
  },
  categoryList: {
    width: "100%",
    marginTop: 20,
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  catName: {
    fontWeight: "600",
  },
  catAmount: {
    fontWeight: "bold",
  },
  progressBarBg: {
    height: 4,
    backgroundColor: "rgba(0,0,0,0.1)",
    borderRadius: 2,
    marginTop: 6,
    width: "100%",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 2,
  },
  catPercent: {
    fontSize: 10,
    color: "#999",
    marginTop: 2,
    alignSelf: "flex-end",
  },
});
