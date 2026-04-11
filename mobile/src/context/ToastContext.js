import React, { createContext, useContext, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const ToastContext = createContext({});

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  const hideToast = useCallback(() => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setToast(null));
  }, [fadeAnim]);

  const showToast = useCallback(
    (title, message, type = "info", duration = 4000) => {
      setToast({ title, message, type });
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();

      setTimeout(hideToast, duration);
    },
    [fadeAnim, hideToast],
  );

  const getIcon = (type) => {
    switch (type) {
      case "success":
        return "checkmark-circle";
      case "error":
        return "alert-circle";
      case "warning":
        return "warning";
      default:
        return "information-circle";
    }
  };

  const getColor = (type) => {
    switch (type) {
      case "success":
        return "#10B981";
      case "error":
        return "#EF4444";
      case "warning":
        return "#F59E0B";
      default:
        return "#3B82F6";
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <Animated.View
          style={[
            styles.container,
            {
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={hideToast}
            style={[styles.toast, { borderLeftColor: getColor(toast.type) }]}
          >
            <Ionicons
              name={getIcon(toast.type)}
              size={24}
              color={getColor(toast.type)}
              style={styles.icon}
            />
            <View style={styles.textContainer}>
              <Text style={styles.title}>{toast.title}</Text>
              <Text style={styles.message}>{toast.message}</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);

const { width } = Dimensions.get("window");
const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 50,
    width: width,
    alignItems: "center",
    zIndex: 9999,
  },
  toast: {
    width: width * 0.9,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderLeftWidth: 6,
    // Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
  },
  icon: { marginRight: 12 },
  textContainer: { flex: 1 },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 2,
  },
  message: {
    fontSize: 13,
    color: "#6B7280",
  },
});
