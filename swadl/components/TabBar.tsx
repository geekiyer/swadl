import { View, Text, Pressable } from "react-native";
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
import { useThemeColors } from "../lib/theme";
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
  const tc = useThemeColors();

  // Filter to only visible tabs (respects href: null for restricted users)
  const visibleRoutes = state.routes.filter((route) => {
    const options = descriptors[route.key]?.options;
    if (!options) return true;
    return (options as Record<string, unknown>).href !== null;
  });

  return (
    <View style={{ backgroundColor: tc.cardBg, borderTopWidth: 1.5, borderTopColor: tc.border, paddingBottom: insets.bottom }}>
      <View style={{ flexDirection: "row", height: 56, alignItems: "center", justifyContent: "space-around" }}>
        {visibleRoutes.map((route) => {
          const routeIndex = state.routes.indexOf(route);
          const isFocused = state.index === routeIndex;
          const Icon = TAB_ICONS[route.name] ?? Home;
          const label = TAB_LABELS[route.name] ?? route.name;
          const tintColor = isFocused ? colors.feedPrimary : tc.textPlaceholder;

          return (
            <Pressable
              key={route.key}
              style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 6 }}
              onPress={() => {
                if (!isFocused) {
                  navigation.navigate(route.name);
                }
              }}
            >
              <Icon size={24} strokeWidth={2} color={tintColor} />
              <Text
                style={{
                  fontFamily: "Nunito_800ExtraBold",
                  fontSize: 13,
                  marginTop: 2,
                  color: tintColor,
                }}
              >
                {label}
              </Text>
              {isFocused && (
                <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: colors.feedPrimary, marginTop: 2 }} />
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
