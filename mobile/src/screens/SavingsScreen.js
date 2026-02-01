import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";
import SavingsService from "../services/SavingsService";

export default function SavingsScreen({ navigation }) {
  const { colors, isDarkMode } = useTheme();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadGoals = async () => {
    try {
      const data = await SavingsService.getAll();
      setGoals(data);
    } catch (error) {
      console.log("Error loading savings", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadGoals();
    }, []),
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadGoals();
  };

  const renderItem = ({ item }) => {
    const progress = item.progress_percentage || 0;

    return (
      <TouchableOpacity
        style={[
          styles.card,
          { backgroundColor: colors.card, shadowColor: colors.shadow },
        ]}
        onPress={() =>
          navigation.navigate("SavingGoalDetail", { goalId: item.id })
        }
      >
        <View style={styles.cardHeader}>
          <View style={styles.iconBox}>
            <Ionicons
              name={item.icon || "wallet"}
              size={24}
              color={item.color || colors.primary}
            />
          </View>
          <View style={{ flex: 1, marginLeft: 15 }}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              {item.name}
            </Text>
            <Text
              style={[styles.cardSubtitle, { color: colors.textSecondary }]}
            >
              Target: Rs {item.target_amount}
            </Text>
          </View>
          <View style={styles.pctBadge}>
            <Text style={styles.pctText}>{progress}%</Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressBar,
              { backgroundColor: isDarkMode ? "#333" : "#e5e7eb" },
            ]}
          >
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(progress, 100)}%`,
                  backgroundColor: item.color || colors.primary,
                },
              ]}
            />
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Text style={[styles.currentLabel, { color: colors.textSecondary }]}>
            Saved
          </Text>
          <Text style={[styles.currentAmount, { color: colors.text }]}>
            Rs {item.current_amount}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    listContent: { padding: 20 },
    card: {
      borderRadius: 16,
      padding: 20,
      marginBottom: 15,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 15,
    },
    iconBox: {
      width: 50,
      height: 50,
      borderRadius: 12,
      backgroundColor: isDarkMode ? "rgba(255,255,255,0.05)" : "#F3F4F6",
      justifyContent: "center",
      alignItems: "center",
    },
    cardTitle: { fontSize: 18, fontWeight: "bold" },
    cardSubtitle: { fontSize: 14, marginTop: 2 },
    pctBadge: {
      backgroundColor: isDarkMode ? "rgba(255,255,255,0.1)" : "#E0E7FF",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    pctText: { fontSize: 14, fontWeight: "bold", color: colors.primary },

    progressContainer: { marginBottom: 15 },
    progressBar: { height: 8, borderRadius: 4, overflow: "hidden" },
    progressFill: { height: "100%", borderRadius: 4 },

    cardFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    currentLabel: { fontSize: 14 },
    currentAmount: { fontSize: 18, fontWeight: "bold" },

    fab: {
      position: "absolute",
      bottom: 25,
      right: 25,
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 5,
    },
  });

  return (
    <View style={styles.container}>
      <FlatList
        data={goals}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          !loading && (
            <View style={{ alignItems: "center", marginTop: 50 }}>
              <Text style={{ color: colors.textSecondary }}>
                No savings goals yet.
              </Text>
            </View>
          )
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("AddSavingGoal")}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}
