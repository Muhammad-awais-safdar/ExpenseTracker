import api from "../api/axios";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { Platform, Alert } from "react-native";

const ExportService = {
  downloadTransactions: async () => {
    try {
      // Get Authentication Token (assuming it's stored or we can get it from axios interceptors)
      // Axios interceptors usually facilitate this, but FileSystem.downloadAsync needs headers manually.
      // We need to retrieve the token. Since we don't have direct access to AuthContext here easily without passing it,
      // we'll rely on Axios to get the blob/string first, then write it.
      // OR better: use axios to fetch data as blob/text, then write to FS.

      const response = await api.get("/api/export/transactions", {
        responseType: "text", // CSV is text
      });

      const csvData = response.data;
      const filename = `transactions_${new Date().toISOString().split("T")[0]}.csv`;
      const fileUri = FileSystem.documentDirectory + filename;

      await FileSystem.writeAsStringAsync(fileUri, csvData, {
        encoding: FileSystem.EncodingType
          ? FileSystem.EncodingType.UTF8
          : "utf8",
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert("Error", "Sharing is not available on this device");
      }
    } catch (error) {
      console.error("Export failed:", error);
      throw error;
    }
  },
};

export default ExportService;
