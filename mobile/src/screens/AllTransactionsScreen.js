import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import TransactionService from "../services/transactionService";

export default function AllTransactionsScreen({ navigation }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadTransactions(1);
  }, []);

  const loadTransactions = async (pageNum) => {
    if (loading) return;
    if (pageNum === 1) setLoading(true);

    try {
      const data = await TransactionService.getAll(pageNum);

      // Laravel pagination structure: data, current_page, last_page
      const newTransactions = data.data;
      const currentPage = data.current_page;
      const lastPage = data.last_page;

      if (pageNum === 1) {
        setTransactions(newTransactions);
      } else {
        setTransactions((prev) => [...prev, ...newTransactions]);
      }

      setHasMore(currentPage < lastPage);
      setPage(pageNum);
    } catch (error) {
      console.log("Error loading transactions", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    // Reset to page 1
    loadTransactions(1);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadTransactions(page + 1);
    }
  };

  const getIcon = (item) => {
    if (item.type === "expense") return "cart-outline";
    if (item.type === "income") return "wallet-outline";
    if (item.type.includes("loan")) return "swap-horizontal";
    return "help-circle-outline";
  };

  const getColor = (item) => {
    if (item.type === "expense") return "#EF4444";
    if (item.type === "income") return "#10B981";
    if (item.type.includes("loan")) return "#F59E0B";
    return "#6B7280";
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <View
        style={[
          styles.iconBox,
          { backgroundColor: getColor(item) + "20" }, // 20% opacity
        ]}
      >
        <Ionicons name={getIcon(item)} size={20} color={getColor(item)} />
      </View>
      <View style={styles.info}>
        <Text style={styles.title}>
          {item.category?.name || item.title || "Transaction"}
        </Text>
        <Text style={styles.date}>
          {new Date(item.date).toLocaleDateString()}
        </Text>
      </View>
      <Text
        style={[
          styles.amount,
          {
            color:
              item.type === "expense" || item.type === "loan_given"
                ? "#EF4444"
                : "#10B981",
          },
        ]}
      >
        {item.type === "expense" || item.type === "loan_given" ? "-" : "+"}
        Rs {item.amount}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={transactions}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.type}-${item.id}-${index}`}
        contentContainerStyle={styles.listContent}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListFooterComponent={
          loading && page > 1 ? (
            <ActivityIndicator style={{ margin: 20 }} />
          ) : null
        }
        ListEmptyComponent={
          !loading && (
            <Text style={styles.emptyText}>No transactions found</Text>
          )
        }
      />
      {loading && page === 1 && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  listContent: {
    padding: 20,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  info: {
    flex: 1,
  },
  title: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#1F2937",
  },
  date: {
    color: "#6B7280",
    fontSize: 12,
    marginTop: 2,
  },
  amount: {
    fontWeight: "bold",
    fontSize: 16,
  },
  emptyText: {
    textAlign: "center",
    color: "#6B7280",
    marginTop: 50,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
});
