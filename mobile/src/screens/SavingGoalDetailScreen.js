import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import SavingsService from "../services/SavingsService";
import * as Progress from "react-native-progress";
import ModernButton from "../components/ui/ModernButton";

export default function SavingGoalDetailScreen({ route, navigation }) {
  const { goalId } = route.params;
  const { colors, isDarkMode } = useTheme();
  const [goal, setGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [transactionType, setTransactionType] = useState("deposit"); // deposit or withdraw
  const [amount, setAmount] = useState("");
  const [transLoading, setTransLoading] = useState(false);

  useEffect(() => {
    loadGoal();
  }, []);

  const loadGoal = async () => {
    try {
      const data = await SavingsService.getById(goalId);
      setGoal(data);
    } catch (error) {
      Alert.alert("Error", "Failed to load details");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert("Delete Goal", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await SavingsService.delete(goalId);
            navigation.goBack();
          } catch (e) {
            Alert.alert("Error", "Failed to delete");
          }
        },
      },
    ]);
  };

  const handleTransaction = async () => {
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid amount");
      return;
    }

    setTransLoading(true);
    try {
      await SavingsService.addTransaction(goalId, {
        type: transactionType,
        amount: parseFloat(amount),
      });
      setShowModal(false);
      setAmount("");
      loadGoal(); // Refresh
    } catch (error) {
      Alert.alert("Error", "Failed to process transaction");
    } finally {
      setTransLoading(false);
    }
  };

  const openTransactionModal = (type) => {
    setTransactionType(type);
    setShowModal(true);
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      alignItems: "center",
      paddingVertical: 40,
      backgroundColor: goal?.color || colors.primary,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: "#fff",
      marginTop: 10,
    },
    subtitle: {
      color: "rgba(255,255,255,0.8)",
      fontSize: 14,
    },
    content: {
      flex: 1,
      backgroundColor: colors.background,
      marginTop: -20,
      borderTopLeftRadius: 25,
      borderTopRightRadius: 25,
      padding: 20,
    },
    card: {
      backgroundColor: colors.card,
      padding: 20,
      borderRadius: 16,
      alignItems: "center",
      shadowColor: colors.shadow,
      shadowOpacity: 0.1,
      shadowRadius: 5,
      elevation: 3,
      marginBottom: 20,
    },
    balanceLabel: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    balanceValue: {
      fontSize: 32,
      fontWeight: "bold",
      color: colors.text,
      marginVertical: 5,
    },
    targetLabel: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    actions: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 20,
    },
    actionBtn: {
      flex: 1,
      padding: 15,
      borderRadius: 12,
      alignItems: "center",
      marginHorizontal: 5,
    },
    depositBtn: { backgroundColor: colors.success },
    withdrawBtn: { backgroundColor: colors.danger },
    btnText: { color: "#fff", fontWeight: "bold" },

    // Modal Styles
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      padding: 20,
    },
    modalContent: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 15,
      textAlign: "center",
    },
    input: {
      backgroundColor: colors.inputBackground,
      padding: 15,
      borderRadius: 10,
      color: colors.text,
      fontSize: 18,
      marginBottom: 20,
      textAlign: "center",
    },
    historyTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 10,
    },
    transItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
  });

  if (loading || !goal)
    return (
      <ActivityIndicator style={{ marginTop: 50 }} color={colors.primary} />
    );

  const progress = Math.min(goal.current_amount / goal.target_amount, 1);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name={goal.icon || "star"} size={50} color="#fff" />
        <Text style={styles.title}>{goal.name}</Text>
        <Text style={styles.subtitle}>
          Target: {new Date(goal.target_date).toLocaleDateString()}
        </Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.balanceLabel}>Current Saved</Text>
          <Text style={styles.balanceValue}>
            Rs {goal.current_amount.toLocaleString()}
          </Text>
          <Text style={styles.targetLabel}>
            Target: Rs {goal.target_amount.toLocaleString()}
          </Text>

          <Progress.Bar
            progress={progress}
            width={250}
            height={10}
            color={goal.color}
            unfilledColor={colors.border}
            style={{ marginTop: 15 }}
          />
          <Text style={{ marginTop: 5, color: colors.textSecondary }}>
            {Math.round(progress * 100)}% Complete
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.depositBtn]}
            onPress={() => openTransactionModal("deposit")}
          >
            <Text style={styles.btnText}>+ Deposit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.withdrawBtn]}
            onPress={() => openTransactionModal("withdraw")}
          >
            <Text style={styles.btnText}>- Withdraw</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.historyTitle}>History</Text>
        {goal.transactions?.map((t) => (
          <View key={t.id} style={styles.transItem}>
            <Text style={{ color: colors.text }}>
              {new Date(t.created_at).toLocaleDateString()}
            </Text>
            <Text
              style={{
                color: t.type === "deposit" ? colors.success : colors.danger,
                fontWeight: "bold",
              }}
            >
              {t.type === "deposit" ? "+" : "-"} {t.amount}
            </Text>
          </View>
        ))}

        <TouchableOpacity
          onPress={handleDelete}
          style={{ marginTop: 30, alignItems: "center" }}
        >
          <Text style={{ color: colors.danger }}>Delete Goal</Text>
        </TouchableOpacity>
        <View style={{ height: 50 }} />
      </ScrollView>

      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {transactionType === "deposit" ? "Add Money" : "Withdraw Money"}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Amount"
              placeholderTextColor={colors.placeholder}
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              autoFocus
            />
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <ModernButton
                title="Cancel"
                onPress={() => setShowModal(false)}
                style={{
                  flex: 1,
                  marginRight: 5,
                  backgroundColor: colors.textSecondary,
                }}
              />
              <ModernButton
                title="Confirm"
                onPress={handleTransaction}
                loading={transLoading}
                style={{
                  flex: 1,
                  marginLeft: 5,
                  backgroundColor:
                    transactionType === "deposit"
                      ? colors.success
                      : colors.danger,
                }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
