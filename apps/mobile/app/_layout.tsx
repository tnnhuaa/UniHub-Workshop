import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { initializeDatabase } from "../db/client";
import { useAuthStore } from "../store/authStore";

export default function RootLayout() {
  const hydrate = useAuthStore((state) => state.hydrate);
  const [isReady, setIsReady] = useState(false);
  const [isDbReady, setIsDbReady] = useState(false);

  useEffect(() => {
    const runHydrate = async () => {
      initializeDatabase();
      setIsDbReady(true);
      await hydrate();
      setIsReady(true);
    };

    void runHydrate();
  }, [hydrate]);

  if (!isDbReady || !isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1f2937" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6b7280",
  },
});
