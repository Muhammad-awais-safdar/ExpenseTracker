import {
  Text,
  ActivityIndicator,
  StyleSheet,
  Pressable,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function ModernButton({
  title,
  onPress,
  loading,
  disabled,
  variant = "primary", // primary, secondary, danger
  icon: Icon,
}) {
  const getColors = () => {
    if (disabled) return ["#E5E7EB", "#D1D5DB"]; // Keep gray for disabled
    if (variant === "danger") return ["#EF4444", "#DC2626"];
    if (variant === "secondary") return ["transparent", "transparent"];
    return ["#4F46E5", "#4338CA"]; // Default Primary
  };

  const getTextColor = () => {
    if (disabled) return "#9CA3AF";
    // For secondary, we return null here to let the caller or parent handle it, or default to primary
    // But since this is a UI component, let's keep it simple for now or pass color as prop?
    // Let's stick to standard behavior but allowing transparency.
    if (variant === "secondary") return "#4F46E5";
    return "#fff";
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={loading || disabled}
      style={({ pressed }) => [
        styles.container,
        pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
      ]}
    >
      <LinearGradient
        colors={getColors()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.gradient,
          variant === "secondary" && styles.secondaryBorder,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={getTextColor()} />
        ) : (
          <>
            {Icon && <Icon style={{ marginRight: 8 }} color={getTextColor()} />}
            <Text style={[styles.text, { color: getTextColor() }]}>
              {title}
            </Text>
          </>
        )}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: "hidden",
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  gradient: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  secondaryBorder: {
    borderWidth: 1,
    borderColor: "#4F46E5",
  },
  text: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
