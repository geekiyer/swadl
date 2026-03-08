import { Pressable, View, Text } from "react-native";
import Animated from "react-native-reanimated";
import { usePressSpring } from "../hooks/usePressSpring";
import { shadows } from "../constants/theme";
import { useThemeColors } from "../lib/theme";
import { BottleIcon } from "./icons/BottleIcon";
import { MoonIcon } from "./icons/MoonIcon";
import { DiaperIcon } from "./icons/DiaperIcon";

type StatusCardType = 'feed' | 'sleep' | 'diaper';

interface StatusCardProps {
  type: StatusCardType;
  label: string;
  value: string;
  onPress: () => void;
}

const CARD_ICONS: Record<StatusCardType, typeof BottleIcon> = {
  feed: BottleIcon,
  sleep: MoonIcon,
  diaper: DiaperIcon,
};

export function StatusCard({ type, label, value, onPress }: StatusCardProps) {
  const { animStyle, handlers } = usePressSpring(0.96);
  const tc = useThemeColors();
  const Icon = CARD_ICONS[type];

  return (
    <Animated.View style={[animStyle, shadows.sm, { flex: 1 }]}>
      <Pressable
        style={{
          backgroundColor: tc.cardBg,
          borderWidth: 1.5,
          borderColor: tc.border,
          borderRadius: 16,
          paddingTop: 10,
          paddingBottom: 8,
          paddingHorizontal: 6,
          alignItems: 'center',
        }}
        onPress={onPress}
        {...handlers}
      >
        <View style={{ marginBottom: 3 }}>
          <Icon size={30} theme={tc.mode} />
        </View>
        <Text
          style={{
            fontSize: 8,
            color: tc.textMuted,
            fontFamily: 'Nunito_800ExtraBold',
            letterSpacing: 1,
            textTransform: 'uppercase',
          }}
        >
          {label}
        </Text>
        <Text
          style={{
            fontSize: 13,
            lineHeight: 18,
            color: tc.textPrimary,
            fontFamily: 'Baloo2_700Bold',
            marginTop: 2,
          }}
        >
          {value}
        </Text>
      </Pressable>
    </Animated.View>
  );
}
