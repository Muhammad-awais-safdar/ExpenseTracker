import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import ImportService from "../services/importService";
import MemoryCache from "../utils/memoryCache";

export default function ImportDataScreen() {
  const { colors } = useTheme();
  const [csv, setCsv] = useState("");
  const [loading, setLoading] = useState(false);
  const [importErrors, setImportErrors] = useState([]);

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, padding: 16 },
    title: { color: colors.text, fontSize: 18, fontWeight: "700", marginBottom: 8 },
    hint: { color: colors.textSecondary, marginBottom: 10, fontSize: 12 },
    input: {
      minHeight: 220,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      backgroundColor: colors.inputBackground,
      color: colors.text,
      padding: 12,
      textAlignVertical: "top",
    },
    btn: {
      marginTop: 14,
      backgroundColor: colors.primary,
      borderRadius: 10,
      paddingVertical: 12,
      alignItems: "center",
    },
    btnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
    helpCard: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      backgroundColor: colors.card,
      padding: 10,
      marginBottom: 10,
    },
    helpTitle: { color: colors.text, fontWeight: "700", marginBottom: 6 },
    helpLine: { color: colors.textSecondary, fontSize: 12, marginBottom: 4 },
    errorTitle: { color: colors.danger, fontWeight: "700", marginTop: 12 },
    errorLine: { color: colors.textSecondary, fontSize: 12, marginTop: 4 },
  });

  const runImport = async () => {
    if (!csv.trim()) {
      Alert.alert("No Data", "Paste CSV content first.");
      return;
    }
    setLoading(true);
    try {
      const result = await ImportService.importCsvText(csv);
      setImportErrors(result.errors.slice(0, 5));
      MemoryCache.clear();
      Alert.alert(
        "Import Finished",
        `Imported: ${result.imported}\nFailed: ${result.failed}`,
      );
    } catch (e) {
      Alert.alert("Import Failed", e?.message || "Unable to import data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Import CSV Data</Text>
      <View style={styles.helpCard}>
        <Text style={styles.helpTitle}>CSV format help</Text>
        <Text style={styles.helpLine}>
          Header: type,amount,date,description,source,category_id,person_name,due_date
        </Text>
        <Text style={styles.helpLine}>
          Allowed type values: expense, income, loan_given, loan_taken
        </Text>
        <Text style={styles.helpLine}>
          Use quotes for text with commas, e.g. "Dinner, with friends"
        </Text>
        <Text style={styles.helpLine}>Date format: YYYY-MM-DD</Text>
      </View>
      <Text style={styles.hint}>Paste CSV rows below and tap Import Now.</Text>
      <TextInput
        style={styles.input}
        multiline
        value={csv}
        onChangeText={setCsv}
        placeholder="Paste CSV rows here..."
        placeholderTextColor={colors.placeholder}
      />
      <TouchableOpacity style={styles.btn} onPress={runImport} disabled={loading}>
        <Text style={styles.btnText}>{loading ? "Importing..." : "Import Now"}</Text>
      </TouchableOpacity>
      {importErrors.length > 0 && (
        <View>
          <Text style={styles.errorTitle}>Top import errors</Text>
          {importErrors.map((err, idx) => (
            <Text key={idx} style={styles.errorLine}>
              - {err}
            </Text>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
