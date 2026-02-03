import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";
import SavingsService from "../services/SavingsService";
import * as Progress from "react-native-progress";

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
      console.error("Failed to load savings goals", error);
      Alert.alert("Error", "Failed to load savings goals");
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

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    listContent: {
      padding: 20,
      paddingBottom: 80,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 15,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 5,
      elevation: 3,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
    },
    iconBox: {
      width: 40,
      height: 40,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
    },
    title: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.text,
      flex: 1,
      marginLeft: 15,
    },
    amountContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 15,
      marginBottom: 5,
    },
    currentAmount: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.primary,
    },
    targetAmount: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    progressBar: {
      marginTop: 10,
      borderRadius: 5,
    },
    percent: {
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: "right",
      marginTop: 5,
    },
    fab: {
      position: "absolute",
      bottom: 20,
      right: 20,
      backgroundColor: colors.primary,
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: "center",
      alignItems: "center",
      elevation: 5,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
    },
    emptyText: {
      textAlign: "center",
      color: colors.textSecondary,
      marginTop: 50,
      fontSize: 16,
    },
  });

  const renderItem = ({ item }) => {
    const progress = Math.min(item.current_amount / item.target_amount, 1);

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() =>
          navigation.navigate("SavingGoalDetail", { goalId: item.id })
        }
      >
        <View style={styles.header}>
          <View
            style={[styles.iconBox, { backgroundColor: item.color + "20" }]}
          >
            <Ionicons
              name={item.icon || "star"}
              size={20}
              color={item.color || colors.primary}
            />
          </View>
          <Text style={styles.title}>{item.name}</Text>
        </View>

        <View style={styles.amountContainer}>
          <Text style={styles.currentAmount}>
            Rs {item.current_amount.toLocaleString()}
          </Text>
          <Text style={styles.targetAmount}>
            of Rs {item.target_amount.toLocaleString()}
          </Text>
        </View>

        <Progress.Bar
          progress={progress}
          width={null}
          height={8}
          color={item.color || colors.primary}
          unfilledColor={
            isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"
          }
          borderWidth={0}
          style={styles.progressBar}
        />
        <Text style={styles.percent}>{Math.round(progress * 100)}%</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
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
            <Text style={styles.emptyText}>
              No savings goals yet. Create one!
            </Text>
          }
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("AddSavingGoal")}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}
