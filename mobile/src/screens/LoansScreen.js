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
import { useTheme } from "../context/ThemeContext";

export default function LoansScreen({ navigation }) {
  const { colors, isDarkMode } = useTheme();
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
    return (
      <ActivityIndicator
        size="large"
        style={{ flex: 1 }}
        color={colors.warning}
      />
    );
  }

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    filterContainer: {
      flexDirection: "row",
      padding: 15,
      backgroundColor: colors.card,
    },
    filterBtn: {
      paddingVertical: 8,
      paddingHorizontal: 20,
      borderRadius: 20,
      marginRight: 10,
      backgroundColor: colors.inputBackground,
    },
    activeFilter: { backgroundColor: colors.warning },
    filterText: { color: colors.textSecondary },
    activeFilterText: { color: "#fff" },

    item: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
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
    person: { fontSize: 18, fontWeight: "bold", color: colors.text },
    date: { color: colors.textSecondary, fontSize: 12, marginBottom: 5 },
    amount: { fontWeight: "bold", fontSize: 18 },
    given: { color: colors.danger }, // Money left you
    taken: { color: colors.success }, // Money came to you
    typeLabel: { fontSize: 10, color: colors.textSecondary },

    badge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 5,
      alignSelf: "flex-start",
    },
    paidBadge: {
      backgroundColor: isDarkMode ? "rgba(16, 185, 129, 0.2)" : "#D1FAE5",
    },
    pendingBadge: {
      backgroundColor: isDarkMode ? "rgba(245, 158, 11, 0.2)" : "#FEF3C7",
    },
    badgeText: { fontSize: 10, fontWeight: "bold", color: colors.text },

    empty: { textAlign: "center", marginTop: 50, color: colors.textSecondary },
    fab: {
      position: "absolute",
      bottom: 30,
      right: 30,
      backgroundColor: colors.warning,
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
                        item.type === "given" ? colors.success : colors.info,
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
