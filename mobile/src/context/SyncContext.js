import React, { createContext, useState, useEffect, useContext } from "react";
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../api/axios";
import { Alert } from "react-native";
import MemoryCache from "../utils/memoryCache";

const SyncContext = createContext();

export const SyncProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [offlineQueue, setOfflineQueue] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load queue from storage on init
  useEffect(() => {
    const loadQueue = async () => {
      try {
        const storedQueue = await AsyncStorage.getItem("offline_queue");
        if (storedQueue) {
          setOfflineQueue(JSON.parse(storedQueue));
        }
      } catch (e) {
        console.error("Failed to load offline queue", e);
      }
    };
    loadQueue();
  }, []);

  // Monitor Network State
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = state.isConnected && state.isInternetReachable !== false;
      setIsOnline(online);

      if (online && offlineQueue.length > 0 && !isSyncing) {
        syncNow();
      }
    });

    return () => unsubscribe();
  }, [offlineQueue, isSyncing]);

  // Persist queue whenever it changes
  useEffect(() => {
    const saveQueue = async () => {
      try {
        await AsyncStorage.setItem(
          "offline_queue",
          JSON.stringify(offlineQueue),
        );
      } catch (e) {
        console.error("Failed to save offline queue", e);
      }
    };
    saveQueue();
  }, [offlineQueue]);

  const addToQueue = (action) => {
    const newAction = {
      ...action,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      status: "pending", // pending, syncing, failed
    };
    setOfflineQueue((prev) => [...prev, newAction]);
    Alert.alert(
      "Offline",
      "Action saved to offline queue. Will sync when online.",
    );
  };

  const syncNow = async () => {
    if (isSyncing || offlineQueue.length === 0 || !isOnline) return;

    setIsSyncing(true);
    const queue = [...offlineQueue];
    const failedItems = [];

    // Sort queue by timestamp to ensure correct order of operations
    queue.sort((a, b) => a.timestamp - b.timestamp);

    for (const action of queue) {
      try {
        await processAction(action);
      } catch (error) {
        console.error("Sync failed for item", action, error);

        if (error.response?.status === 404) {
          // Only discard if we are SURE it's invalid. But for now, user wants to retry.
          // Maybe the backend was down or route changed.
          // We will keep it but log a warning.
          console.warn(
            "404 Error for action (Keeping in queue per user request):",
            action,
          );
          failedItems.push(action);
        } else if (error.response?.status === 422) {
          // Validation error. Hard to retry without user edit.
          // We'll keep it for now so user doesn't lose data, but it will likely fail again.
          console.warn("Validation Error for action:", action);
          failedItems.push(action);
        } else {
          // All other errors (500, Network, etc) -> Keep
          failedItems.push(action);
        }
      }
    }

    setOfflineQueue(failedItems);
    setIsSyncing(false);

    if (failedItems.length === 0 && queue.length > 0) {
      MemoryCache.clear(); // Clear cache so UI fetches fresh data
      Alert.alert("Sync Complete", "All offline actions have been synced.");
    }
  };

  const processAction = async (action) => {
    switch (action.type) {
      case "ADD_EXPENSE":
        await api.post("/api/expenses", action.payload);
        break;
      case "ADD_INCOME":
        await api.post("/api/incomes", action.payload);
        break;
      case "ADD_TRANSACTION": // Legacy fallback
        console.warn("Legacy ADD_TRANSACTION encountered", action);
        break;
      case "UPDATE_TRANSACTION":
        if (action.payload.type === "expense") {
          await api.put(`/api/expenses/${action.payload.id}`, action.payload);
        } else {
          await api.put(`/api/incomes/${action.payload.id}`, action.payload);
        }
        break;
      case "DELETE_TRANSACTION":
        if (action.payload.type === "expense") {
          await api.delete(`/api/expenses/${action.payload.id}`);
        } else {
          await api.delete(`/api/incomes/${action.payload.id}`);
        }
        break;
      default:
        console.warn("Unknown offline action type:", action.type);
        throw new Error(`Unknown action type: ${action.type}`); // Throw so it counts as failu
    }
  };

  return (
    <SyncContext.Provider
      value={{ isOnline, isSyncing, offlineQueue, addToQueue, syncNow }}
    >
      {children}
    </SyncContext.Provider>
  );
};

export const useSync = () => useContext(SyncContext);
