import { Tabs } from "expo-router";
import { Text } from "react-native";
import { useProfile } from "../../lib/queries";

export default function TabsLayout() {
  const { data: profile } = useProfile();
  const isRestricted = profile?.role === "restricted";

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: "#2563eb",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20 }}>&#x1F3E0;</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="summary"
        options={{
          title: "Summary",
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20 }}>&#x1F4CB;</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="trends"
        options={{
          title: "Trends",
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20 }}>&#x1F4C8;</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="chores"
        options={{
          title: "Chores",
          href: isRestricted ? null : "/(tabs)/chores",
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20 }}>&#x2705;</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          href: isRestricted ? null : "/(tabs)/settings",
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20 }}>&#x2699;</Text>
          ),
        }}
      />
    </Tabs>
  );
}
