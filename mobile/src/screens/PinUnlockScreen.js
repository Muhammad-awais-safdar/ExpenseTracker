import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { usePinLock } from "../context/PinLockContext";

export default function PinUnlockScreen() {
  const { colors } = useTheme();
  const { verifyPin } = usePinLock();
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);

  const handleUnlock = async () => {
    if (pin.length < 4) {
      Alert.alert("Invalid PIN", "Enter your 4-digit PIN.");
      return;
    }
    setBusy(true);
    const ok = await verifyPin(pin);
    setBusy(false);
    if (!ok) {
      Alert.alert("Incorrect PIN", "Please try again.");
      return;
    }
    setPin("");
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      padding: 24,
      backgroundColor: colors.background,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    title: {
      fontSize: 22,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 6,
      textAlign: "center",
    },
    subtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 16,
      textAlign: "center",
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      padding: 12,
      color: colors.text,
      fontSize: 20,
      letterSpacing: 8,
      textAlign: "center",
      backgroundColor: colors.inputBackground,
      marginBottom: 14,
    },
    btn: {
      backgroundColor: colors.primary,
      borderRadius: 10,
      paddingVertical: 12,
      alignItems: "center",
    },
    btnText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "700",
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>App Locked</Text>
        <Text style={styles.subtitle}>Enter PIN to continue</Text>
        <TextInput
          style={styles.input}
          value={pin}
          onChangeText={(v) => setPin(v.replace(/\D/g, "").slice(0, 4))}
          keyboardType="numeric"
          secureTextEntry
          maxLength={4}
          placeholder="••••"
          placeholderTextColor={colors.placeholder}
        />
        <TouchableOpacity style={styles.btn} onPress={handleUnlock} disabled={busy}>
          <Text style={styles.btnText}>{busy ? "Checking..." : "Unlock"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
