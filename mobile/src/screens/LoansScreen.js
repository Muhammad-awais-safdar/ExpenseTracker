import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  SegmentedControlIOS,
} from "react-native";
import LoanService from "../services/loanService";
import { useFocusEffect } from "@react-navigation/native";
import CustomAlert from "../components/ui/CustomAlert";

export default function LoansScreen({ navigation }) {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [alertConfig, setAlertConfig] = useState({ visible: false });

  const loadLoans = async () => {
    try {
      const data = await LoanService.getAll();
      setLoans(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadLoans();
    }, []),
  );

  const filteredLoans = loans.filter((l) =>
    filter === "all" ? true : l.type === filter,
  );

  if (loading) {
    return <ActivityIndicator size="large" style={{ flex: 1 }} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <TouchableOpacity
          onPress={() => setFilter("all")}
          style={[styles.filterBtn, filter === "all" && styles.activeFilter]}
        >
          <Text
            style={[
              styles.filterText,
              filter === "all" && styles.activeFilterText,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setFilter("given")}
          style={[styles.filterBtn, filter === "given" && styles.activeFilter]}
        >
          <Text
            style={[
              styles.filterText,
              filter === "given" && styles.activeFilterText,
            ]}
          >
            Given
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setFilter("taken")}
          style={[styles.filterBtn, filter === "taken" && styles.activeFilter]}
        >
          <Text
            style={[
              styles.filterText,
              filter === "taken" && styles.activeFilterText,
            ]}
          >
            Taken
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredLoans}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View>
              <Text style={styles.person}>{item.person_name}</Text>
              <Text style={styles.date}>
                {item.due_date
                  ? `Due: ${new Date(item.due_date).toLocaleDateString()}`
                  : "No due date"}
              </Text>
              <View
                style={[
                  styles.badge,
                  item.status === "paid"
                    ? styles.paidBadge
                    : styles.pendingBadge,
                ]}
              >
                <Text style={styles.badgeText}>
                  {item.status.toUpperCase()}
                </Text>
              </View>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text
                style={[
                  styles.amount,
                  item.type === "given" ? styles.given : styles.taken,
                ]}
              >
                {item.type === "given" ? "->" : "<-"} Rs {item.amount}
              </Text>
              <Text style={styles.typeLabel}>
                {item.type === "given" ? "You gave" : "You took"}
              </Text>

              {item.status === "pending" && (
                <TouchableOpacity
                  style={[
                    styles.payBtn,
                    {
                      backgroundColor:
                        item.type === "given" ? "#10B981" : "#4F46E5",
                    },
                  ]}
                  onPress={() => {
                    console.log(
                      "[LoansScreen] Mark Paid Button Pressed for ID:",
                      item.id,
                    );
                    setAlertConfig({
                      visible: true,
                      title: "Settle Loan",
                      message: `Mark this loan with ${item.person_name} as Paid?`,
                      type: "info",
                      confirmText: "Yes, Settle",
                      cancelText: "No",
                      onCancel: () => setAlertConfig({ visible: false }),
                      onConfirm: async () => {
                        console.log("[LoansScreen] User confirmed settlement");
                        setAlertConfig({ visible: false });
                        setLoading(true);
                        try {
                          console.log("[LoansScreen] Sending API request...");
                          const result = await LoanService.update(item.id, {
                            status: "paid",
                          }); // Send only status, strict
                          console.log("[LoansScreen] API Success:", result);
                          await loadLoans(); // Await reload
                        } catch (e) {
                          console.error("[LoansScreen] API Failed:", e);
                          alert("Failed to update loan");
                        } finally {
                          setLoading(false);
                        }
                      },
                    });
                  }}
                >
                  <Text style={styles.payBtnText}>Mark Paid</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No loans found</Text>}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("AddLoan")}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <CustomAlert {...alertConfig} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  filterContainer: {
    flexDirection: "row",
    padding: 15,
    backgroundColor: "#fff",
  },
  filterBtn: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: "#f0f0f0",
  },
  activeFilter: { backgroundColor: "#333" },
  filterText: { color: "#333" },
  activeFilterText: { color: "#fff" },

  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    marginHorizontal: 15,
    marginTop: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 1,
  },
  person: { fontSize: 18, fontWeight: "bold", color: "#333" },
  date: { color: "#888", fontSize: 12, marginBottom: 5 },
  amount: { fontWeight: "bold", fontSize: 18 },
  given: { color: "#EF4444" }, // Money left you
  taken: { color: "#10B981" }, // Money came to you
  typeLabel: { fontSize: 10, color: "#666" },

  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 5,
    alignSelf: "flex-start",
  },
  paidBadge: { backgroundColor: "#D1FAE5" },
  pendingBadge: { backgroundColor: "#FEF3C7" },
  badgeText: { fontSize: 10, fontWeight: "bold", color: "#333" },

  empty: { textAlign: "center", marginTop: 50, color: "#888" },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 30,
    backgroundColor: "#333",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  fabText: { color: "#fff", fontSize: 30, fontWeight: "bold", marginTop: -2 },

  payBtn: {
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
  },
  payBtnText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
});
