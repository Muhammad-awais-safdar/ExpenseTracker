import React, { useEffect, useState, useCallback, useRef } from "react";
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
  Animated,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import { getValidIconName } from "../utils/iconMap";
import { LinearGradient } from "expo-linear-gradient";
import DashboardService from "../services/dashboardService";
import MemoryCache from "../utils/memoryCache";

export default function HomeScreen({ navigation }) {
  const { user, logout } = useAuth();
  const { colors, isDarkMode } = useTheme();
  const [dashboardData, setDashboardData] = useState(
    MemoryCache.getStale("dashboard") || null,
  );
  const [loading, setLoading] = useState(!dashboardData);
  const [refreshing, setRefreshing] = useState(false);

  // Animation values
  const balanceAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(50)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  const loadDashboard = async () => {
    console.log("[HomeScreen] loadDashboard started");
    // 1. Instant Cache Load (Stale-While-Revalidate)
    const cached = MemoryCache.getStale("dashboard");
    if (cached) {
      setDashboardData(cached);
      setLoading(false);
    }

    try {
      const data = await DashboardService.getSummary();

      setDashboardData(data);
      await MemoryCache.set("dashboard", data);
    } catch (error) {
      console.error("[HomeScreen] Dashboard fetch error:", error);
      if (error.response?.status === 401) {
        console.log("[HomeScreen] 401 detected, logging out");
        logout(); // Force logout on 401
      }
    } finally {
      if (mounted.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  };

  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadDashboard();

      Animated.parallel([
        Animated.timing(balanceAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.stagger(100, [
          Animated.timing(contentOpacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.spring(contentAnim, {
            toValue: 0,
            friction: 8,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }, []),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadDashboard();
  }, []);

  const [showLongWaitMessage, setShowLongWaitMessage] = useState(false);

  useEffect(() => {
    let timer;
    if (loading) {
      timer = setTimeout(() => {
        setShowLongWaitMessage(true);
      }, 10000); // Show message after 10 seconds
    }
    return () => clearTimeout(timer);
  }, [loading]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        {/* Lottie Animation for Premium Feel */}
        <LottieView
          source={{
            uri: "https://assets5.lottiefiles.com/packages/lf20_tijmpkyq.json", // Premium Wallet/Card Animation
          }}
          autoPlay
          loop
          style={{ width: 200, height: 200 }}
        />
        <Text style={{ marginTop: -40, color: "#6B7280", fontWeight: "600" }}>
          {showLongWaitMessage
            ? "Server is waking up..."
            : "Syncing your finances..."}
        </Text>
        {showLongWaitMessage && (
          <TouchableOpacity
            onPress={logout}
            style={{
              marginTop: 20,
              padding: 10,
              backgroundColor: "#FEE2E2",
              borderRadius: 8,
            }}
          >
            <Text style={{ color: "#EF4444", fontWeight: "bold" }}>
              Cancel & Logout
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  const QuickAction = ({ title, icon, color, route }) => (
    <View style={styles.actionBtnWrapper}>
      <TouchableOpacity
        style={[
          styles.actionBtn,
          {
            backgroundColor: colors.card,
            shadowColor: colors.shadow,
          },
        ]}
        onPress={() => navigation.navigate(route)}
      >
        <View style={[styles.actionIcon, { backgroundColor: color + "20" }]}>
          <Ionicons name={getValidIconName(icon)} size={24} color={color} />
        </View>
        <Text style={[styles.actionBtnText, { color: colors.text }]}>
          {title}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={
          isDarkMode
            ? [colors.navBackground, colors.background]
            : [colors.primary, "#3730A3"]
        }
        style={styles.headerBackground}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text
              style={[
                styles.username,
                { color: isDarkMode ? colors.text : "#fff" },
              ]}
            >
              {user?.name?.split(" ")[0]}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate("Settings")}
            style={styles.logoutBtn}
          >
            <Ionicons
              name="settings-outline"
              size={24}
              color={isDarkMode ? colors.text : "#fff"}
            />
          </TouchableOpacity>
        </View>

        {/* Balance Card */}
        <Animated.View
          style={[
            styles.balanceCard,
            {
              backgroundColor: isDarkMode
                ? colors.surfaceHighlight
                : "rgba(255,255,255,0.1)",
              borderColor: isDarkMode ? colors.border : "rgba(255,255,255,0.2)",
              opacity: balanceAnim,
              transform: [
                {
                  scale: balanceAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.95, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <Text
            style={[
              styles.balanceLabel,
              {
                color: isDarkMode
                  ? colors.textSecondary
                  : "rgba(255,255,255,0.8)",
              },
            ]}
          >
            Total Balance
          </Text>
          <Text
            style={[
              styles.balanceValue,
              { color: isDarkMode ? colors.text : "#fff" },
            ]}
          >
            Rs {dashboardData?.summary?.balance?.toFixed(2) || "0.00"}
          </Text>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <View
                style={[
                  styles.arrowIcon,
                  {
                    backgroundColor: isDarkMode
                      ? "rgba(16, 185, 129, 0.1)"
                      : "rgba(16, 185, 129, 0.2)",
                  },
                ]}
              >
                <Ionicons name="arrow-down" size={12} color={colors.success} />
              </View>
              <Text
                style={[
                  styles.statValue,
                  { color: isDarkMode ? colors.text : "#fff" },
                ]}
              >
                Rs {dashboardData?.summary?.monthly_income?.toFixed(0)}
              </Text>
            </View>
            <View
              style={[
                styles.divider,
                {
                  backgroundColor: isDarkMode
                    ? colors.border
                    : "rgba(255,255,255,0.2)",
                },
              ]}
            />
            <View style={styles.stat}>
              <View
                style={[
                  styles.arrowIcon,
                  {
                    backgroundColor: isDarkMode
                      ? "rgba(239, 68, 68, 0.1)"
                      : "rgba(239, 68, 68, 0.2)",
                  },
                ]}
              >
                <Ionicons name="arrow-up" size={12} color={colors.danger} />
              </View>
              <Text
                style={[
                  styles.statValue,
                  { color: isDarkMode ? colors.text : "#fff" },
                ]}
              >
                Rs {dashboardData?.summary?.monthly_expense?.toFixed(0)}
              </Text>
            </View>
          </View>
        </Animated.View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        <Animated.View
          style={{
            opacity: contentOpacity,
            transform: [{ translateY: contentAnim }],
          }}
        >
          {/* Actions Grid */}
          <View style={styles.actionsGrid}>
            <QuickAction
              title="Add Expense"
              icon={getValidIconName("remove-circle-outline")}
              color={colors.danger}
              route="AddExpense"
            />
            <QuickAction
              title="Add Income"
              icon={getValidIconName("add-circle-outline")}
              color={colors.success}
              route="AddIncome"
            />
            <QuickAction
              title="Loans"
              icon={getValidIconName("swap-horizontal-outline")}
              color={colors.warning}
              route="Loans"
            />
            <QuickAction
              title="Budgets"
              icon={getValidIconName("pie-chart-outline")}
              color={colors.info}
              route="Budgets"
            />
            <QuickAction
              title="Trends"
              icon={getValidIconName("bar-chart-outline")}
              color={colors.primary}
              route="Analytics"
            />
          </View>

          {/* Recent Transactions */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Recent Transactions
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("AllTransactions")}
            >
              <Text style={[styles.seeAll, { color: colors.primary }]}>
                See All
              </Text>
            </TouchableOpacity>
          </View>

          {dashboardData?.recent_transactions?.length > 0 ? (
            dashboardData.recent_transactions.map((item, index) => (
              <View
                key={index}
                style={[
                  styles.transactionItem,
                  {
                    backgroundColor: colors.card,
                    shadowColor: colors.shadow,
                  },
                ]}
              >
                <View
                  style={[
                    styles.iconBox,
                    {
                      backgroundColor:
                        item.type === "expense"
                          ? isDarkMode
                            ? "rgba(239, 68, 68, 0.1)"
                            : "#FEE2E2"
                          : isDarkMode
                            ? "rgba(16, 185, 129, 0.1)"
                            : "#D1FAE5",
                    },
                  ]}
                >
                  <Ionicons
                    name={
                      item.category?.icon
                        ? getValidIconName(item.category.icon)
                        : item.type === "expense"
                          ? getValidIconName("expense")
                          : getValidIconName("income")
                    }
                    size={20}
                    color={
                      item.type === "expense" ? colors.danger : colors.success
                    }
                  />
                </View>
                <View style={styles.transactionInfo}>
                  <Text style={[styles.tTitle, { color: colors.text }]}>
                    {item.category?.name ||
                      (item.type === "income" ? "Income" : "Expense")}
                  </Text>
                  <Text style={[styles.tDate, { color: colors.textSecondary }]}>
                    {item.type === "income"
                      ? item.source || ""
                      : item.description || ""}
                    {item.source || item.description ? " • " : ""}
                    {new Date(item.date).toLocaleDateString()}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.tAmount,
                    {
                      color:
                        item.type === "expense"
                          ? colors.danger
                          : colors.success,
                    },
                  ]}
                >
                  {item.type === "expense" ? "-" : "+"}Rs {item.amount}
                </Text>
              </View>
            ))
          ) : (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No recent transactions
            </Text>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  username: { fontSize: 24, fontWeight: "bold" },
  logoutBtn: { padding: 5 },

  balanceCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
  },
  balanceLabel: {
    fontSize: 14,
    marginBottom: 5,
  },
  balanceValue: {
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 15,
  },
  statsRow: { flexDirection: "row", alignItems: "center" },
  stat: { flexDirection: "row", alignItems: "center", marginRight: 15 },
  arrowIcon: { padding: 4, borderRadius: 10, marginRight: 6 },
  statValue: { fontWeight: "600" },
  divider: {
    width: 1,
    height: 20,
    marginRight: 15,
  },

  scrollContent: { marginTop: 10, paddingHorizontal: 20 },

  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  actionBtnWrapper: {
    width: "48%",
    marginBottom: 15,
  },
  actionBtn: {
    padding: 15,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    width: "100%", // Fill wrapper
  },
  actionIcon: { padding: 8, borderRadius: 10, marginRight: 10 },
  actionBtnText: { fontWeight: "600", fontSize: 14 },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold" },
  seeAll: { fontWeight: "600" },

  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
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
    marginBottom: 2,
  },
  tDate: { fontSize: 12 },
  tAmount: { fontWeight: "bold", fontSize: 16 },
  emptyText: { textAlign: "center", marginTop: 20 },
});
