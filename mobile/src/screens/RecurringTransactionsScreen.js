import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Switch,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import RecurringService from "../services/recurringService";

export default function RecurringTransactionsScreen({ navigation }) {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadRules();
    }, []),
  );

  const loadRules = async () => {
    try {
      const data = await RecurringService.getAll();
      setRules(data);
    } catch (error) {
      console.log("Error loading recurring rules:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (id, currentState) => {
    // Optimistic update
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, is_active: !currentState } : r)),
    );

    try {
      await RecurringService.update(id, { is_active: !currentState });
    } catch (e) {
      Alert.alert("Error", "Failed to update rule");
      // Revert
      setRules((prev) =>
        prev.map((r) => (r.id === id ? { ...r, is_active: currentState } : r)),
      );
    }
  };

  const handleDelete = (id) => {
    Alert.alert(
      "Delete",
      "Are you sure you want to delete this recurring rule?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await RecurringService.delete(id);
              setRules((prev) => prev.filter((r) => r.id !== id));
            } catch (e) {
              Alert.alert("Error", "Failed to delete rule");
            }
          },
        },
      ],
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
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
              name={item.type === "expense" ? "cart-outline" : "wallet-outline"}
              size={20}
              color={item.type === "expense" ? "#EF4444" : "#10B981"}
            />
          </View>
          <View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>
              {item.frequency} • Next:{" "}
              {new Date(item.next_run_date).toLocaleDateString()}
            </Text>
          </View>
        </View>
        <Switch
          value={item.is_active}
          onValueChange={() => toggleActive(item.id, item.is_active)}
          trackColor={{ false: "#767577", true: "#4F46E5" }}
        />
      </View>
      <View style={styles.footer}>
        <Text
          style={[
            styles.amount,
            { color: item.type === "expense" ? "#EF4444" : "#10B981" },
          ]}
        >
          {item.type === "expense" ? "-" : "+"} Rs {item.amount}
        </Text>
        <TouchableOpacity onPress={() => handleDelete(item.id)}>
          <Ionicons name="trash-outline" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#4F46E5"
          style={{ marginTop: 20 }}
        />
      ) : (
        <FlatList
          data={rules}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              No recurring transactions set up
            </Text>
          }
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("AddRecurring")}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  list: {
    padding: 20,
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  title: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#1F2937",
  },
  subtitle: {
    color: "#6B7280",
    fontSize: 12,
    textTransform: "capitalize",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 10,
  },
  amount: {
    fontWeight: "bold",
    fontSize: 16,
  },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#4F46E5",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 50,
    color: "#9CA3AF",
  },
});
