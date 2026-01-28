import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { MotiView } from "moti";

export default function AnimatedCard({
  children,
  onPress,
  style,
  delay = 0,
  noPadding,
}) {
  return (
    <MotiView
      from={{ opacity: 0, scale: 0.9, translateY: 20 }}
      animate={{ opacity: 1, scale: 1, translateY: 0 }}
      transition={{
        type: "spring",
        delay: delay,
        damping: 15,
        stiffness: 100,
      }}
      style={[styles.container, style]}
    >
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.inner,
          !noPadding && styles.padding,
          pressed && styles.pressed,
        ]}
      >
        {children}
      </Pressable>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  inner: {
    backgroundColor: "#fff",
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
    overflow: "hidden", // For ripple/pressed effects
  },
  padding: {
    padding: 20,
  },
  pressed: {
    backgroundColor: "#F9FAFB",
    transform: [{ scale: 0.98 }],
  },
});
