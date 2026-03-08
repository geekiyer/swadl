import { Tabs } from "expo-router";
import { useProfile } from "../../lib/queries";
import { useThemeColors } from "../../lib/theme";
import { TabBar } from "../../components/TabBar";

export default function TabsLayout() {
  const { data: profile } = useProfile();
  const isRestricted = profile?.role === "restricted";
  const tc = useThemeColors();

  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
        animation: "none",
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="summary" options={{ title: "Summary" }} />
      <Tabs.Screen name="trends" options={{ title: "Trends" }} />
      <Tabs.Screen
        name="chores"
        options={{
          title: "Chores",
          href: isRestricted ? null : "/(tabs)/chores",
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          href: isRestricted ? null : "/(tabs)/settings",
        }}
      />
    </Tabs>
  );
}
