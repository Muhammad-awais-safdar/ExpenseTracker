import { Text, ActivityIndicator, StyleSheet, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";

export default function ModernButton({
  title,
  onPress,
  loading,
  disabled,
  variant = "primary", // primary, secondary, danger
  icon: Icon,
}) {
  const getColors = () => {
    if (disabled) return ["#E5E7EB", "#D1D5DB"];
    if (variant === "danger") return ["#EF4444", "#DC2626"];
    if (variant === "secondary") return ["#fff", "#fff"];
    return ["#4F46E5", "#4338CA"]; // Primary Indigo
  };

  const getTextColor = () => {
    if (disabled) return "#9CA3AF";
    if (variant === "secondary") return "#4F46E5";
    return "#fff";
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={loading || disabled}
      style={({ pressed }) => [style.container, pressed && { opacity: 0.9 }]}
    >
      <MotiView
        from={{ scale: 1 }}
        animate={{ scale: loading ? 0.95 : 1 }}
        transition={{ type: "spring" }}
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
              {Icon && <Icon style={{ marginRight: 8 }} />}
              <Text style={[styles.text, { color: getTextColor() }]}>
                {title}
              </Text>
            </>
          )}
        </LinearGradient>
      </MotiView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: "hidden",
    marginVertical: 10,
    shadowColor: "#4F46E5",
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
    borderColor: "#E0E7FF",
  },
  text: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
