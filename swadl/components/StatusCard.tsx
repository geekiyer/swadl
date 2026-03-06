import { Pressable } from "react-native";
import Animated from "react-native-reanimated";
import { View, Text } from "react-native";
import { usePressSpring } from "../hooks/usePressSpring";
import { shadows } from "../constants/theme";

interface StatusCardProps {
  title: string;
  value: string;
  subtitle?: string;
  onPress?: () => void;
}

export function StatusCard({ title, value, subtitle, onPress }: StatusCardProps) {
  const { animStyle, handlers } = usePressSpring();

  return (
    <Animated.View style={[animStyle, shadows.sm]} className="flex-1 mx-1">
      <Pressable
        className="bg-navy-card border border-navy-border rounded-2xl p-5"
        onPress={onPress}
        {...handlers}
      >
        <Text className="text-[11px] text-ash uppercase font-body-bold" style={{ letterSpacing: 2 }}>
          {title}
        </Text>
        <Text className="text-lg text-white mt-1 font-display" style={{ letterSpacing: -0.5 }}>{value}</Text>
        {subtitle && (
          <Text className="text-sm text-ash mt-0.5 font-body">{subtitle}</Text>
        )}
      </Pressable>
    </Animated.View>
  );
}
