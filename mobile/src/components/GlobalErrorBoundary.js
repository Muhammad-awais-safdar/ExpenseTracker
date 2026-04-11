import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import logger from "../utils/logger";

class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    logger.error("ERROR_BOUNDARY", "Uncaught component error", {
      error: error.message,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    // You could also navigate back to the Home screen here if desired
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View style={styles.card}>
            <View style={styles.iconContainer}>
              <Ionicons name="bug-outline" size={60} color="#FF6B6B" />
            </View>
            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.message}>
              The application encountered an unexpected error. Don't worry, your
              data is safe.
            </Text>
            
            {__DEV__ && (
              <ScrollView style={styles.debugContainer}>
                <Text style={styles.debugText}>{this.state.error?.toString()}</Text>
              </ScrollView>
            )}

            <TouchableOpacity style={styles.button} onPress={this.handleReset}>
              <Text style={styles.buttonText}>Reload Application</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 30,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
    width: "100%",
  },
  iconContainer: {
    marginBottom: 20,
    backgroundColor: "#FFF5F5",
    padding: 20,
    borderRadius: 60,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2D3436",
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: "#636E72",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 30,
  },
  button: {
    backgroundColor: "#2D3436",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  debugContainer: {
    maxHeight: 150,
    backgroundColor: "#f1f2f6",
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    width: "100%",
  },
  debugText: {
    fontSize: 12,
    fontFamily: "monospace",
    color: "#d63031",
  }
});

export default GlobalErrorBoundary;
