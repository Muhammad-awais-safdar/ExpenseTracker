import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Platform,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import DashboardService from "../services/dashboardService";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import MemoryCache from "../utils/memoryCache";

export default function HomeScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboard = async () => {
    // 1. Try cache first
    const cached = MemoryCache.get("dashboard");
    if (cached) {
      setDashboardData(cached);
      setLoading(false); // Show content immediately
    }

    try {
      // 2. Fetch fresh data
      const data = await DashboardService.getSummary();
      setDashboardData(data);
      // 3. Update cache
      MemoryCache.set("dashboard", data);
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, []),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Force refresh bypasses strict cache reading logic if we wanted,
    // but here standard loadDashboard works fine as it updates cache
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  const QuickAction = ({ title, icon, color, route }) => (
    <TouchableOpacity
      style={styles.actionBtn}
      onPress={() => navigation.navigate(route)}
    >
      <View style={[styles.actionIcon, { backgroundColor: color + "20" }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.actionBtnText}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={["#4F46E5", "#3730A3"]}
        style={styles.headerBackground}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.username}>{user?.name?.split(" ")[0]}</Text>
          </View>
          <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceValue}>
            Rs {dashboardData?.summary?.balance?.toFixed(2) || "0.00"}
          </Text>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <View
                style={[
                  styles.arrowIcon,
                  { backgroundColor: "rgba(16, 185, 129, 0.2)" },
                ]}
              >
                <Ionicons name="arrow-down" size={12} color="#10B981" />
              </View>
              <Text style={styles.statValue}>
                Rs {dashboardData?.summary?.monthly_income?.toFixed(0)}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.stat}>
              <View
                style={[
                  styles.arrowIcon,
                  { backgroundColor: "rgba(239, 68, 68, 0.2)" },
                ]}
              >
                <Ionicons name="arrow-up" size={12} color="#EF4444" />
              </View>
              <Text style={styles.statValue}>
                Rs {dashboardData?.summary?.monthly_expense?.toFixed(0)}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#4F46E5"
          />
        }
      >
        {/* Actions Grid */}
        <View style={styles.actionsGrid}>
          <QuickAction
            title="Add Expense"
            icon="remove-circle"
            color="#EF4444"
            route="AddExpense"
          />
          <QuickAction
            title="Add Income"
            icon="add-circle"
            color="#10B981"
            route="AddIncome"
          />
          <QuickAction
            title="Loans"
            icon="swap-horizontal"
            color="#F59E0B"
            route="Loans"
          />
          <QuickAction
            title="Budgets"
            icon="pie-chart"
            color="#8B5CF6"
            route="Budgets"
          />
        </View>

        {/* Recent Transactions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("AllTransactions")}
          >
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {dashboardData?.recent_transactions?.length > 0 ? (
          dashboardData.recent_transactions.map((item, index) => (
            <View key={index} style={styles.transactionItem}>
              <View
                style={[
                  styles.iconBox,
                  {
                    backgroundColor:
                      item.type === "expense" ? "#FEE2E2" : "#D1FAE5",
                  },
                ]}
              >
                <Ionicons
                  name={
                    item.type === "expense" ? "cart-outline" : "wallet-outline"
                  }
                  size={20}
                  color={item.type === "expense" ? "#EF4444" : "#10B981"}
                />
              </View>
              <View style={styles.transactionInfo}>
                <Text style={styles.tTitle}>
                  {item.category?.name ||
                    (item.type === "income" ? item.source : item.description)}
                </Text>
                <Text style={styles.tDate}>
                  {new Date(item.date).toLocaleDateString()}
                </Text>
              </View>
              <Text
                style={[
                  styles.tAmount,
                  item.type === "expense" ? styles.negative : styles.positive,
                ]}
              >
                {item.type === "expense" ? "-" : "+"}Rs {item.amount}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No recent transactions</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },

  headerBackground: {
    paddingTop: Platform.OS === "ios" ? 60 : 50,
    paddingHorizontal: 20,
    paddingBottom: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  greeting: { color: "rgba(255,255,255,0.8)", fontSize: 14 },
  username: { color: "#fff", fontSize: 24, fontWeight: "bold" },
  logoutBtn: { padding: 5 },

  balanceCard: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  balanceLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    marginBottom: 5,
  },
  balanceValue: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 15,
  },
  statsRow: { flexDirection: "row", alignItems: "center" },
  stat: { flexDirection: "row", alignItems: "center", marginRight: 15 },
  arrowIcon: { padding: 4, borderRadius: 10, marginRight: 6 },
  statValue: { color: "#fff", fontWeight: "600" },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginRight: 15,
  },

  scrollContent: { marginTop: -20, paddingTop: 20, paddingHorizontal: 20 },

  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  actionBtn: {
    width: "48%",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 16,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  actionIcon: { padding: 8, borderRadius: 10, marginRight: 10 },
  actionBtnText: { fontWeight: "600", color: "#1F2937", fontSize: 14 },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#1F2937" },
  seeAll: { color: "#4F46E5", fontWeight: "600" },

  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  transactionInfo: { flex: 1 },
  tTitle: {
    fontWeight: "600",
    fontSize: 16,
    color: "#1F2937",
    marginBottom: 2,
  },
  tDate: { color: "#9CA3AF", fontSize: 12 },
  tAmount: { fontWeight: "bold", fontSize: 16 },
  positive: { color: "#10B981" },
  negative: { color: "#EF4444" },
  emptyText: { textAlign: "center", color: "#9CA3AF", marginTop: 20 },
});
