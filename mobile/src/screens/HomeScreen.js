import React from "react";
import { View, Text, StyleSheet, Button, TouchableOpacity } from "react-native";
import { useAuth } from "../context/AuthContext";

export default function HomeScreen({ navigation }) {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Welcome, {user?.name}!</Text>

      <View style={styles.buttonContainer}>
        <Button
          title="View Expenses"
          onPress={() => navigation.navigate("Expenses")}
        />
        <View style={styles.spacer} />
        <Button
          title="View Income"
          onPress={() => navigation.navigate("Income")}
        />
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  welcome: {
    fontSize: 24,
    marginBottom: 40,
    fontWeight: "bold",
  },
  buttonContainer: {
    width: "100%",
    marginBottom: 20,
  },
  spacer: {
    height: 10,
  },
  logoutBtn: {
    marginTop: 20,
    padding: 10,
  },
  logoutText: {
    color: "red",
    fontSize: 16,
  },
});
