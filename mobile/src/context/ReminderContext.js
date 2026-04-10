import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import { useAuth } from "./AuthContext";
import BudgetService from "../services/budgetService";
import RecurringService from "../services/recurringService";

const ReminderContext = createContext({});

const REMINDERS_ENABLED_KEY = "reminders_enabled";
const REMINDER_SEEN_PREFIX = "reminder_seen_";

const toList = (data) => (Array.isArray(data?.data) ? data.data : (data || []));

const isDueTodayOrTomorrow = (dateText) => {
  if (!dateText) return false;
  const target = new Date(dateText);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const normalize = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const value = normalize(target);
  return value === normalize(today) || value === normalize(tomorrow);
};

export const ReminderProvider = ({ children }) => {
  const { token } = useAuth();
  const [isReminderEnabled, setIsReminderEnabled] = useState(true);
  const [reminders, setReminders] = useState([]);
  const isAlertOpenRef = useRef(false);

  useEffect(() => {
    const loadPreference = async () => {
      try {
        const stored = await AsyncStorage.getItem(REMINDERS_ENABLED_KEY);
        if (stored !== null) {
          setIsReminderEnabled(stored === "true");
        }
      } catch (e) {
        console.error("Failed to load reminder settings", e);
      }
    };
    loadPreference();
  }, []);

  const toggleReminders = async (enabled) => {
    setIsReminderEnabled(enabled);
    await AsyncStorage.setItem(REMINDERS_ENABLED_KEY, String(enabled));
    if (!enabled) {
      setReminders([]);
    }
  };

  const hasSeenToday = async (key) => {
    const todayKey = `${REMINDER_SEEN_PREFIX}${key}_${new Date().toISOString().split("T")[0]}`;
    const found = await AsyncStorage.getItem(todayKey);
    return Boolean(found);
  };

  const markSeenToday = async (key) => {
    const todayKey = `${REMINDER_SEEN_PREFIX}${key}_${new Date().toISOString().split("T")[0]}`;
    await AsyncStorage.setItem(todayKey, "1");
  };

  const refreshReminders = async ({ showAlert = false } = {}) => {
    if (!token || !isReminderEnabled) return [];

    try {
      const [budgetsRaw, recurringRaw] = await Promise.all([
        BudgetService.getAll(),
        RecurringService.getAll(),
      ]);

      const budgets = toList(budgetsRaw);
      const recurring = toList(recurringRaw);
      const items = [];

      budgets.forEach((b) => {
        const pct = Number(b.percentage || 0);
        if (pct >= 100) {
          items.push({
            key: `budget-exceeded-${b.id}`,
            type: "budget",
            level: "critical",
            title: "Budget Exceeded",
            message: `${b.category?.name || "Budget"} has reached ${pct}%.`,
          });
        } else if (pct >= 80) {
          items.push({
            key: `budget-warning-${b.id}`,
            type: "budget",
            level: "warning",
            title: "Budget Warning",
            message: `${b.category?.name || "Budget"} has reached ${pct}%.`,
          });
        }
      });

      recurring
        .filter((r) => r.is_active && isDueTodayOrTomorrow(r.next_run_date))
        .forEach((r) => {
          items.push({
            key: `recurring-due-${r.id}`,
            type: "recurring",
            level: "info",
            title: "Recurring Due",
            message: `${r.title} is scheduled for ${new Date(r.next_run_date).toLocaleDateString()}.`,
          });
        });

      setReminders(items);

      if (showAlert && items.length > 0 && !isAlertOpenRef.current) {
        const first = items[0];
        const seen = await hasSeenToday(first.key);
        if (!seen) {
          isAlertOpenRef.current = true;
          Alert.alert(first.title, first.message, [
            {
              text: "OK",
              onPress: async () => {
                await markSeenToday(first.key);
                isAlertOpenRef.current = false;
              },
            },
          ]);
        }
      }

      return items;
    } catch (e) {
      console.error("Failed to refresh reminders", e);
      return [];
    }
  };

  return (
    <ReminderContext.Provider
      value={{
        isReminderEnabled,
        reminders,
        toggleReminders,
        refreshReminders,
      }}
    >
      {children}
    </ReminderContext.Provider>
  );
};

export const useReminders = () => useContext(ReminderContext);
