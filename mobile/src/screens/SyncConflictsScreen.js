import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { useSync } from "../context/SyncContext";

export default function SyncConflictsScreen() {
  const { colors } = useTheme();
  const {
    offlineQueue,
    retryQueueItem,
    removeQueueItem,
    syncNow,
    isSyncing,
    clearQueue,
  } = useSync();

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, padding: 16 },
    card: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 12,
      marginBottom: 10,
    },
    row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    title: { color: colors.text, fontWeight: "700", fontSize: 14 },
    sub: { color: colors.textSecondary, fontSize: 12, marginTop: 4 },
    err: { color: colors.danger, fontSize: 12, marginTop: 6 },
    actions: { flexDirection: "row", gap: 10, marginTop: 10 },
    btn: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
      backgroundColor: colors.inputBackground,
    },
    btnPrimary: { backgroundColor: colors.primary },
    btnDanger: { backgroundColor: colors.danger },
    btnText: { color: colors.text, fontWeight: "600", fontSize: 12 },
    btnTextOn: { color: "#fff", fontWeight: "700", fontSize: 12 },
    topActions: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  });

  const pending = offlineQueue.length;
  const now = Date.now();

  return (
    <View style={styles.container}>
      <View style={styles.topActions}>
        <TouchableOpacity
          style={[styles.btn, styles.btnPrimary]}
          onPress={syncNow}
          disabled={isSyncing || pending === 0}
        >
          <Text style={styles.btnTextOn}>{isSyncing ? "Syncing..." : "Sync All"}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, styles.btnDanger]}
          onPress={() =>
            Alert.alert("Clear queue", "Remove all pending offline actions?", [
              { text: "Cancel", style: "cancel" },
              { text: "Clear", style: "destructive", onPress: clearQueue },
            ])
          }
          disabled={pending === 0}
        >
          <Text style={styles.btnTextOn}>Clear All</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={offlineQueue}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={{ alignItems: "center", marginTop: 50 }}>
            <Ionicons name="checkmark-done-outline" size={44} color={colors.success} />
            <Text style={{ color: colors.textSecondary, marginTop: 10 }}>
              No pending sync conflicts
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.title}>{item.type}</Text>
              <Text style={styles.sub}>
                {item.status || "pending"}
                {item.last_status_code ? ` (${item.last_status_code})` : ""}
              </Text>
            </View>
            <Text style={styles.sub}>
              {new Date(item.timestamp || Date.now()).toLocaleString()}
            </Text>
            {!!item.retry_count && (
              <Text style={styles.sub}>Retry attempts: {item.retry_count}</Text>
            )}
            {!!item.next_retry_at && item.next_retry_at > now && (
              <Text style={styles.sub}>
                Retry available in{" "}
                {Math.ceil((item.next_retry_at - now) / 1000)}s
              </Text>
            )}
            {!!item.last_error && <Text style={styles.err}>{item.last_error}</Text>}

            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.btn, styles.btnPrimary]}
                onPress={async () => {
                  const ok = await retryQueueItem(item.id);
                  if (!ok) Alert.alert("Retry failed", "Please review and try again.");
                }}
                disabled={item.next_retry_at && item.next_retry_at > now}
              >
                <Text style={styles.btnTextOn}>Retry</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.btnDanger]}
                onPress={() => removeQueueItem(item.id)}
              >
                <Text style={styles.btnTextOn}>Discard</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}
