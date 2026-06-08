import React from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";

export default function IndexLoader() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#09090b" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fafafa",
  },
});
