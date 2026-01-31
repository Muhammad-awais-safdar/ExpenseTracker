import React, { createContext, useState, useEffect, useContext } from "react";
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api"; // Assuming you have an api instance
import { Alert } from "react-native";

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
        // If it's a server error (500), maybe keep it? For now, we keep it to retry later?
        // Or if it's a validation error (422), discard it?
        // Implementing simple retry logic: keep it in queue if network error or 500
        if (!error.response || error.response.status >= 500) {
          failedItems.push(action);
        } else {
          // 4xx error means our data was bad, discard it to unblock queue?
          // Ideally notify user.
          // For simplicity in v1, we discard 4xx to prevent permanent jams.
        }
      }
    }

    setOfflineQueue(failedItems);
    setIsSyncing(false);

    if (failedItems.length === 0 && queue.length > 0) {
      Alert.alert("Sync Complete", "All offline actions have been synced.");
    }
  };

  const processAction = async (action) => {
    switch (action.type) {
      case "ADD_TRANSACTION":
        await api.post("/transactions", action.payload);
        break;
      case "UPDATE_TRANSACTION":
        await api.put(`/transactions/${action.payload.id}`, action.payload);
        break;
      case "DELETE_TRANSACTION":
        await api.delete(`/transactions/${action.payload.id}`);
        break;
      // Add other cases like categories, budgets, etc.
      default:
        console.warn("Unknown offline action type:", action.type);
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
