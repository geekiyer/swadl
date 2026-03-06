import { Pressable, View, Text } from "react-native";
import Animated from "react-native-reanimated";
import { usePressSpring } from "../hooks/usePressSpring";
import { shadows } from "../constants/theme";
import type { LucideIcon } from "lucide-react-native";

interface StatusCardProps {
  icon: LucideIcon;
  iconBgColor: string;
  iconColor: string;
  label: string;
  value: string;
  timeAgo: string;
  onPress?: () => void;
}

export function StatusCard({
  icon: Icon,
  iconBgColor,
  iconColor,
  label,
  value,
  timeAgo,
  onPress,
}: StatusCardProps) {
  const { animStyle, handlers } = usePressSpring();

  return (
    <Animated.View style={[animStyle, shadows.sm]} className="flex-1 mx-1">
      <Pressable
        className="bg-navy-card border border-navy-border rounded-2xl p-4"
        style={{ height: 140 }}
        onPress={onPress}
        {...handlers}
      >
        <View
          className="w-8 h-8 rounded-lg items-center justify-center mb-2"
          style={{ backgroundColor: iconBgColor }}
        >
          <Icon size={18} strokeWidth={1.5} color={iconColor} />
        </View>
        <Text
          className="text-[11px] text-ash uppercase font-body-bold"
          style={{ letterSpacing: 2 }}
        >
          {label}
        </Text>
        <Text
          className="text-base text-white mt-1 font-body-semibold"
          style={{ letterSpacing: -0.3 }}
        >
          {value}
        </Text>
        <Text className="text-xs text-amber mt-0.5 font-mono">
          {timeAgo}
        </Text>
      </Pressable>
    </Animated.View>
  );
}
