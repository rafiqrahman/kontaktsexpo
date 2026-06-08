import React, { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { AuthProvider, useAuth } from "../store/authContext";
import { ThemeProvider } from "../store/themeContext";
import { ActivityIndicator, View } from "react-native";

function RootLayoutNav() {
  const { userToken, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const segArray = segments as any[];
    // Check if user is currently inside the (auth) directory
    const inAuthGroup = segArray[0] === "(auth)";

    if (!userToken) {
      // Redirect to login if not signed in and not already in auth folder
      if (!inAuthGroup) {
        router.replace("/(auth)");
      }
    } else {
      // Redirect to tabs if signed in and trying to access auth screens or landing
      if (inAuthGroup || segArray.length === 0 || segArray[0] === "index") {
        router.replace("/(tabs)");
      }
    }
  }, [userToken, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fafafa" }}>
        <ActivityIndicator size="large" color="#09090b" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="scanner" options={{ presentation: "modal", animation: "slide_from_bottom" }} />
      <Stack.Screen name="card/[id]" options={{ presentation: "card" }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <RootLayoutNav />
      </ThemeProvider>
    </AuthProvider>
  );
}
