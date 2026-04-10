import React from "react";
import { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";
import { usePinLock } from "../context/PinLockContext";
import { ActivityIndicator, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Import all screens
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import HomeScreen from "../screens/HomeScreen";
import ExpensesScreen from "../screens/ExpensesScreen";
import AddExpenseScreen from "../screens/AddExpenseScreen";
import IncomeScreen from "../screens/IncomeScreen";
import AddIncomeScreen from "../screens/AddIncomeScreen";
import LoansScreen from "../screens/LoansScreen";
import AddLoanScreen from "../screens/AddLoanScreen";
import AnalyticsScreen from "../screens/AnalyticsScreen";
import BudgetsScreen from "../screens/BudgetsScreen";
import AddBudgetScreen from "../screens/AddBudgetScreen";
import AllTransactionsScreen from "../screens/AllTransactionsScreen"; // Import New Screen

import SettingsScreen from "../screens/SettingsScreen";
import ProfileScreen from "../screens/ProfileScreen";
import ChangePasswordScreen from "../screens/ChangePasswordScreen";
import RecurringTransactionsScreen from "../screens/RecurringTransactionsScreen";
import AddRecurringScreen from "../screens/AddRecurringScreen";
import TransactionDetailScreen from "../screens/TransactionDetailScreen";
import PinUnlockScreen from "../screens/PinUnlockScreen";
import OnboardingScreen from "../screens/OnboardingScreen";
import SyncConflictsScreen from "../screens/SyncConflictsScreen";
import ImportDataScreen from "../screens/ImportDataScreen";
import BackupRestoreScreen from "../screens/BackupRestoreScreen";
import FinancialHealthScreen from "../screens/FinancialHealthScreen";

const Stack = createNativeStackNavigator();

import { useTheme } from "../context/ThemeContext";
import { DefaultTheme, DarkTheme } from "@react-navigation/native";

function AppContent() {
  const { token, isSplashLoading } = useAuth();
  const { isPinEnabled, isLocked } = usePinLock();
  const { isDarkMode, colors } = useTheme();
  const [isOnboardingChecked, setIsOnboardingChecked] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const loadOnboarding = async () => {
      const seen = await AsyncStorage.getItem("onboarding_seen");
      setShowOnboarding(!seen);
      setIsOnboardingChecked(true);
    };
    loadOnboarding();
  }, []);

  // Custom Navigation Theme
  const navigationTheme = {
    dark: isDarkMode,
    colors: {
      ...(isDarkMode ? DarkTheme.colors : DefaultTheme.colors),
      primary: colors.primary,
      background: colors.background,
      card: colors.card,
      text: colors.text,
      border: colors.border,
      notification: colors.danger,
    },
  };

  if (isSplashLoading || !isOnboardingChecked) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: true,
          headerStyle: { backgroundColor: colors.navBackground },
          headerTintColor: colors.navText,
          headerShadowVisible: false, // Cleaner look
        }}
      >
        {token ? (
          isPinEnabled && isLocked ? (
            <Stack.Screen
              name="PinUnlock"
              component={PinUnlockScreen}
              options={{ headerShown: false }}
            />
          ) : (
          <>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen name="Expenses" component={ExpensesScreen} />
            <Stack.Screen
              name="AddExpense"
              component={AddExpenseScreen}
              options={{ title: "Add Expense" }}
            />
            <Stack.Screen name="Income" component={IncomeScreen} />
            <Stack.Screen
              name="AddIncome"
              component={AddIncomeScreen}
              options={{ title: "Add Income" }}
            />
            <Stack.Screen name="Loans" component={LoansScreen} />
            <Stack.Screen
              name="AddLoan"
              component={AddLoanScreen}
              options={{ title: "Add Loan" }}
            />
            <Stack.Screen name="Budgets" component={BudgetsScreen} />
            <Stack.Screen
              name="AddBudget"
              component={AddBudgetScreen}
              options={{ title: "Set Budget" }}
            />
            <Stack.Screen
              name="AllTransactions"
              component={AllTransactionsScreen}
              options={{ title: "All Transactions" }}
            />
            <Stack.Screen
              name="TransactionDetail"
              component={TransactionDetailScreen}
              options={{
                title: "Details",
                headerTintColor: "#fff",
                headerTransparent: true,
                headerTitle: "",
              }}
            />
            <Stack.Screen
              name="Analytics"
              component={AnalyticsScreen}
              options={{ title: "Financial Trends" }}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{ title: "Settings" }}
            />
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{ title: "Edit Profile" }}
            />
            <Stack.Screen
              name="ChangePassword"
              component={ChangePasswordScreen}
              options={{ title: "Change Password" }}
            />
            <Stack.Screen
              name="RecurringTransactions"
              component={RecurringTransactionsScreen}
              options={{ title: "Recurring Transactions" }}
            />
            <Stack.Screen
              name="AddRecurring"
              component={AddRecurringScreen}
              options={{ title: "New Recurring Rule" }}
            />
            <Stack.Screen
              name="SyncConflicts"
              component={SyncConflictsScreen}
              options={{ title: "Sync Conflicts" }}
            />
            <Stack.Screen
              name="ImportData"
              component={ImportDataScreen}
              options={{ title: "Import CSV" }}
            />
            <Stack.Screen
              name="BackupRestore"
              component={BackupRestoreScreen}
              options={{ title: "Backup & Restore" }}
            />
            <Stack.Screen
              name="FinancialHealth"
              component={FinancialHealthScreen}
              options={{ title: "Financial Health" }}
            />
          </>
          )
        ) : (
          showOnboarding ? (
            <Stack.Screen name="Onboarding" options={{ headerShown: false }}>
              {() => (
                <OnboardingScreen
                  onDone={async () => {
                    await AsyncStorage.setItem("onboarding_seen", "1");
                    setShowOnboarding(false);
                  }}
                />
              )}
            </Stack.Screen>
          ) : (
            <>
              <Stack.Screen
                name="Login"
                component={LoginScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Register"
                component={RegisterScreen}
                options={{ headerShown: false }}
              />
            </>
          )
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function AppNavigator() {
  return <AppContent />;
}
