import React from "react";
import { Tabs, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform, TouchableOpacity } from "react-native";

export default function TabLayout() {
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#09090b", // slate-950 active tab
        tabBarInactiveTintColor: "#71717a", // slate-500 inactive tab
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopWidth: 1,
          borderTopColor: "#e4e4e7",
          height: Platform.OS === "ios" ? 88 : 64,
          paddingBottom: Platform.OS === "ios" ? 30 : 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
        headerStyle: {
          backgroundColor: "#ffffff",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 1,
        },
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: "700",
          color: "#09090b",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "My Share Code",
          tabBarLabel: "Share",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "qr-code" : "qr-code-outline"} size={size} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="cards"
        options={{
          title: "My Cards",
          tabBarLabel: "Cards",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "card" : "card-outline"} size={size} color={color} />
          ),
          headerRight: () => (
            <TouchableOpacity 
              onPress={() => router.push("/create-card" as any)}
              style={{ marginRight: 16, padding: 4 }}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={26} color="#09090b" />
            </TouchableOpacity>
          ),
        }}
      />

      <Tabs.Screen
        name="saved"
        options={{
          title: "My Wallet",
          tabBarLabel: "Wallet",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "wallet" : "wallet-outline"} size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="leads"
        options={{
          title: "Captured Leads",
          tabBarLabel: "Leads",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "people" : "people-outline"} size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings & NFC",
          tabBarLabel: "Settings",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "settings" : "settings-outline"} size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
