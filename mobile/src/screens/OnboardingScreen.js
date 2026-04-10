import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

const STEPS = [
  {
    icon: "wallet-outline",
    title: "Track Everything",
    description: "Record income, expenses, loans, and budgets in one place.",
  },
  {
    icon: "cloud-offline-outline",
    title: "Works Offline",
    description: "Add transactions without internet and sync automatically later.",
  },
  {
    icon: "analytics-outline",
    title: "Get Insights",
    description: "Use dashboards and trends to improve your monthly spending.",
  },
];

export default function OnboardingScreen({ onDone }) {
  const { colors } = useTheme();
  const [step, setStep] = useState(0);
  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 24,
      justifyContent: "center",
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 18,
      padding: 22,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
    },
    iconWrap: {
      width: 74,
      height: 74,
      borderRadius: 37,
      backgroundColor: `${colors.primary}20`,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 8,
      textAlign: "center",
    },
    desc: {
      fontSize: 15,
      color: colors.textSecondary,
      textAlign: "center",
      marginBottom: 18,
    },
    dots: {
      flexDirection: "row",
      marginBottom: 16,
      gap: 8,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.border,
    },
    dotActive: {
      width: 22,
      backgroundColor: colors.primary,
    },
    btn: {
      backgroundColor: colors.primary,
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: "center",
      width: "100%",
    },
    btnText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "700",
    },
    skip: {
      marginTop: 14,
      color: colors.textSecondary,
      fontWeight: "600",
    },
  });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconWrap}>
          <Ionicons name={current.icon} size={36} color={colors.primary} />
        </View>
        <Text style={styles.title}>{current.title}</Text>
        <Text style={styles.desc}>{current.description}</Text>

        <View style={styles.dots}>
          {STEPS.map((_, idx) => (
            <View key={idx} style={[styles.dot, idx === step && styles.dotActive]} />
          ))}
        </View>

        <TouchableOpacity
          style={styles.btn}
          onPress={() => (isLast ? onDone() : setStep((s) => s + 1))}
        >
          <Text style={styles.btnText}>{isLast ? "Get Started" : "Next"}</Text>
        </TouchableOpacity>

        {!isLast && (
          <TouchableOpacity onPress={onDone}>
            <Text style={styles.skip}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}
