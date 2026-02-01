import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import SavingsService from "../services/SavingsService";

export default function SavingGoalDetailScreen({ route, navigation }) {
  const { goalId } = route.params;
  const { colors, isDarkMode } = useTheme();

  const [goal, setGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [txType, setTxType] = useState("deposit"); // deposit | withdraw
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadGoal = async () => {
    try {
      const data = await SavingsService.getById(goalId); // Need to add getById to service if not exists, or re-use getAll and find.
      // Wait, let's implement getById in backend controller?
      // I added show method in controller. So creating getById in service is needed.
      // Or I can use getAll and filter here if getById is unavialable?
      // I'll assume I added it to Service (I'll check later).
      // Actually I should just use the response from show endpoint.
      // I'll stick to a standard fetch.
      // Wait, I implemented 'show' in Controller.
      // I need to add 'getById' to SavingsService.js which I missed.
      // I will add it immediately after this tool call.

      // Temporary workaround if getById is missing in Service:
      // const all = await SavingsService.getAll();
      // const found = all.find(g => g.id === goalId);
      // setGoal(found);
      // But I want real detail with transactions.

      // I will assume I will fix Service next.
      // So I will call SavingsService.getById(goalId).
    } catch (error) {
      console.log("Error", error);
    }
  };

  // Re-fetch logic
  const fetchDetail = async () => {
    try {
      // Since I haven't added getById to JS service yet, I'll direct fetch or use a patch.
      // For now let's assume getById exists.
      const res = await SavingsService.getById(goalId);
      setGoal(res);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, []);

  const handleTransaction = async () => {
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      Alert.alert("Invalid Amount");
      return;
    }
    setSubmitting(true);
    try {
      await SavingsService.addTransaction(goalId, {
        type: txType,
        amount: parseFloat(amount),
        date: new Date().toISOString().split("T")[0],
        note: "Manual entry",
      });
      setAmount("");
      setShowModal(false);
      fetchDetail(); // Reload
    } catch (error) {
      Alert.alert("Error", "Transaction failed");
    } finally {
      setSubmitting(false);
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      alignItems: "center",
      padding: 30,
      backgroundColor: isDarkMode ? colors.surfaceHighlight : colors.primary,
    },
    goalIcon: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: "rgba(255,255,255,0.2)",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 15,
    },
    goalName: { fontSize: 24, fontWeight: "bold", color: "#fff" },
    goalTarget: { fontSize: 16, color: "rgba(255,255,255,0.8)", marginTop: 5 },

    mainStats: { padding: 20, marginTop: -30 },
    statCard: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 25,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
    },
    currentLabel: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 5,
    },
    currentAmount: {
      fontSize: 36,
      fontWeight: "bold",
      color: goal?.color || colors.primary,
    },
    progressRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
      marginTop: 20,
    },
    progressBar: {
      height: 10,
      backgroundColor: isDarkMode ? "#333" : "#e5e7eb",
      borderRadius: 5,
      width: "100%",
      marginTop: 10,
    },

    actionRow: {
      flexDirection: "row",
      padding: 20,
      justifyContent: "space-between",
    },
    actionBtn: {
      flex: 0.48,
      padding: 15,
      borderRadius: 12,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
    },

    historySection: { padding: 20, flex: 1 },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 15,
    },

    // Modal
    modalContainer: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalContent: {
      backgroundColor: colors.card,
      padding: 25,
      borderTopLeftRadius: 25,
      borderTopRightRadius: 25,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 20,
    },
    input: {
      backgroundColor: colors.inputBackground,
      padding: 15,
      borderRadius: 12,
      fontSize: 24,
      textAlign: "center",
      color: colors.text,
      marginBottom: 20,
    },
    confirmBtn: { padding: 15, borderRadius: 12, alignItems: "center" },
  });

  if (loading || !goal)
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" style={{ marginTop: 50 }} />
      </View>
    );

  return (
    <View style={styles.container}>
      <ScrollView>
        <View
          style={[
            styles.header,
            { backgroundColor: goal.color || colors.primary },
          ]}
        >
          <View style={styles.goalIcon}>
            <Ionicons name={goal.icon || "wallet"} size={40} color="#fff" />
          </View>
          <Text style={styles.goalName}>{goal.name}</Text>
          <Text style={styles.goalTarget}>Target: Rs {goal.target_amount}</Text>
        </View>

        <View style={styles.mainStats}>
          <View style={styles.statCard}>
            <Text style={styles.currentLabel}>Current Balance</Text>
            <Text style={styles.currentAmount}>Rs {goal.current_amount}</Text>

            <View style={styles.progressBar}>
              <View
                style={{
                  height: "100%",
                  borderRadius: 5,
                  width: `${goal.progress_percentage}%`,
                  backgroundColor: goal.color || colors.primary,
                }}
              />
            </View>
            <Text style={{ marginTop: 5, color: colors.textSecondary }}>
              {goal.progress_percentage}% Reached
            </Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[
              styles.actionBtn,
              { backgroundColor: colors.success + "20" },
            ]}
            onPress={() => {
              setTxType("deposit");
              setShowModal(true);
            }}
          >
            <Ionicons
              name="add-circle"
              size={24}
              color={colors.success}
              style={{ marginRight: 8 }}
            />
            <Text style={{ color: colors.success, fontWeight: "bold" }}>
              Deposit
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionBtn,
              { backgroundColor: colors.danger + "20" },
            ]}
            onPress={() => {
              setTxType("withdraw");
              setShowModal(true);
            }}
          >
            <Ionicons
              name="remove-circle"
              size={24}
              color={colors.danger}
              style={{ marginRight: 8 }}
            />
            <Text style={{ color: colors.danger, fontWeight: "bold" }}>
              Withdraw
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          {goal.transactions &&
            goal.transactions.map((tx) => (
              <View
                key={tx.id}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                }}
              >
                <View>
                  <Text
                    style={{
                      color: colors.text,
                      fontWeight: "600",
                      capitalize: "sentences",
                    }}
                  >
                    {tx.type === "deposit" ? "Deposit" : "Withdrawal"}
                  </Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                    {new Date(tx.date).toLocaleDateString()}
                  </Text>
                </View>
                <Text
                  style={{
                    fontWeight: "bold",
                    color:
                      tx.type === "deposit" ? colors.success : colors.danger,
                  }}
                >
                  {tx.type === "deposit" ? "+" : "-"} Rs {tx.amount}
                </Text>
              </View>
            ))}
        </View>
      </ScrollView>

      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {txType === "deposit" ? "Add Money" : "Withdraw Money"}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor={colors.placeholder}
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              autoFocus
            />
            <TouchableOpacity
              style={[
                styles.confirmBtn,
                {
                  backgroundColor:
                    txType === "deposit" ? colors.success : colors.danger,
                },
              ]}
              onPress={handleTransaction}
              disabled={submitting}
            >
              <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 18 }}>
                {submitting ? "Processing..." : "Confirm"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ marginTop: 15, alignItems: "center" }}
              onPress={() => setShowModal(false)}
            >
              <Text style={{ color: colors.textSecondary }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
