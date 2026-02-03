import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";
import { ActivityIndicator, View } from "react-native";

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
import BudgetsScreen from "../screens/BudgetsScreen";
import AddBudgetScreen from "../screens/AddBudgetScreen";
import AllTransactionsScreen from "../screens/AllTransactionsScreen"; // Import New Screen
import AnalyticsScreen from "../screens/AnalyticsScreen";
import SettingsScreen from "../screens/SettingsScreen";
import ProfileScreen from "../screens/ProfileScreen";
import ChangePasswordScreen from "../screens/ChangePasswordScreen";
import RecurringTransactionsScreen from "../screens/RecurringTransactionsScreen";
import AddRecurringScreen from "../screens/AddRecurringScreen";
import SavingGoalDetailScreen from "../screens/SavingGoalDetailScreen";
import TransactionDetailScreen from "../screens/TransactionDetailScreen";

const Stack = createNativeStackNavigator();

import { ThemeProvider, useTheme } from "../context/ThemeContext";
import { DefaultTheme, DarkTheme } from "@react-navigation/native";

function AppContent() {
  const { token, isSplashLoading } = useAuth();
  const { isDarkMode, colors } = useTheme();

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

  if (isSplashLoading) {
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
              name="SavingGoalDetail"
              component={SavingGoalDetailScreen}
              options={{
                title: "Goal Details",
                headerTintColor: "#fff",
                headerTransparent: true,
                headerTitle: "",
              }}
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
          </>
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
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function AppNavigator() {
  return <AppContent />;
}
