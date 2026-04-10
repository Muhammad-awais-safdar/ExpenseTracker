import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import BackupService from "../services/backupService";

export default function BackupRestoreScreen() {
  const { colors } = useTheme();
  const [payload, setPayload] = useState("");
  const [loading, setLoading] = useState(false);

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, padding: 16 },
    title: { fontSize: 18, fontWeight: "700", color: colors.text, marginBottom: 10 },
    hint: { fontSize: 12, color: colors.textSecondary, marginBottom: 10 },
    input: {
      minHeight: 220,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      backgroundColor: colors.inputBackground,
      color: colors.text,
      padding: 12,
      textAlignVertical: "top",
      marginBottom: 10,
    },
    btn: {
      borderRadius: 10,
      paddingVertical: 12,
      alignItems: "center",
      marginBottom: 10,
    },
    primary: { backgroundColor: colors.primary },
    warn: { backgroundColor: colors.warning },
    btnText: { color: "#fff", fontWeight: "700" },
  });

  const exportNow = async () => {
    setLoading(true);
    try {
      const backup = await BackupService.exportSnapshot();
      setPayload(backup);
      Alert.alert("Backup Ready", "Backup JSON has been generated.");
    } catch (e) {
      Alert.alert("Backup Failed", e?.message || "Could not generate backup.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Backup & Restore</Text>
      <Text style={styles.hint}>
        Generate JSON backup of your account data. Keep it secure.
      </Text>
      <TouchableOpacity
        style={[styles.btn, styles.primary]}
        onPress={exportNow}
        disabled={loading}
      >
        <Text style={styles.btnText}>{loading ? "Generating..." : "Generate Backup"}</Text>
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        multiline
        value={payload}
        onChangeText={setPayload}
        placeholder="Backup JSON appears here..."
        placeholderTextColor={colors.placeholder}
      />

      <TouchableOpacity
        style={[styles.btn, styles.warn]}
        onPress={async () => {
          if (!payload.trim()) {
            Alert.alert("No Backup", "Paste backup JSON first.");
            return;
          }

          Alert.alert(
            "Restore Backup",
            "This will import records into your current account and may create duplicates. Continue?",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Restore",
                style: "destructive",
                onPress: async () => {
                  setLoading(true);
                  try {
                    const result = await BackupService.restoreSnapshot(payload);
                    Alert.alert(
                      "Restore Complete",
                      `Restored: ${result.restored}\nSkipped: ${result.skipped}`,
                    );
                  } catch (e) {
                    Alert.alert("Restore Failed", e?.message || "Invalid backup JSON");
                  } finally {
                    setLoading(false);
                  }
                },
              },
            ],
          );
        }}
      >
        <Text style={styles.btnText}>{loading ? "Restoring..." : "Restore Backup"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
