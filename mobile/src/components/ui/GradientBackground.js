import React from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";

export default function GradientBackground({ children }) {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={["#4F46E5", "#312E81"]}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      {/* Decorative circles/blobs */}
      <View style={[styles.blob, styles.blob1]} />
      <View style={[styles.blob, styles.blob2]} />

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#4F46E5",
  },
  blob: {
    position: "absolute",
    borderRadius: 999,
    opacity: 0.2,
    backgroundColor: "#fff",
  },
  blob1: {
    width: 300,
    height: 300,
    top: -100,
    right: -100,
  },
  blob2: {
    width: 200,
    height: 200,
    bottom: -50,
    left: -50,
  },
});
