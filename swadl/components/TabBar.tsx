import { View, Text, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import {
  Home,
  ClipboardList,
  BarChart3,
  CheckSquare,
  Settings,
} from "lucide-react-native";
import { colors } from "../constants/theme";
import type { LucideIcon } from "lucide-react-native";

const TAB_ICONS: Record<string, LucideIcon> = {
  index: Home,
  summary: ClipboardList,
  trends: BarChart3,
  chores: CheckSquare,
  settings: Settings,
};

const TAB_LABELS: Record<string, string> = {
  index: "Home",
  summary: "Summary",
  trends: "Trends",
  chores: "Chores",
  settings: "Settings",
};

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  // Filter to only visible tabs (respects href: null for restricted users)
  const visibleRoutes = state.routes.filter((route) => {
    const options = descriptors[route.key]?.options;
    if (!options) return true;
    return (options as Record<string, unknown>).href !== null;
  });

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <View style={styles.tabs}>
        {visibleRoutes.map((route) => {
          const routeIndex = state.routes.indexOf(route);
          const isFocused = state.index === routeIndex;
          const Icon = TAB_ICONS[route.name] ?? Home;
          const label = TAB_LABELS[route.name] ?? route.name;
          const tintColor = isFocused ? colors.amber : colors.ash;

          return (
            <Pressable
              key={route.key}
              style={styles.tab}
              onPress={() => {
                if (!isFocused) {
                  navigation.navigate(route.name);
                }
              }}
            >
              <Icon size={24} strokeWidth={1.5} color={tintColor} />
              <Text
                style={[
                  styles.label,
                  { color: tintColor },
                ]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.navyCard,
    borderTopWidth: 1,
    borderTopColor: colors.navyBorder,
  },
  tabs: {
    flexDirection: "row",
    height: 56,
    alignItems: "center",
    justifyContent: "space-around",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
  },
  label: {
    fontFamily: "JetBrainsMono_400Regular",
    fontSize: 10,
    marginTop: 2,
  },
});
