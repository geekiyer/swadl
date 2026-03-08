import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import Animated from "react-native-reanimated";
import { usePressSpring } from "../hooks/usePressSpring";
import { colors } from "../constants/theme";
import { useThemeColors } from "../lib/theme";

const MOODS = [
  { key: "happy", label: "Happy", icon: "\u{1F60A}" },
  { key: "sleepy", label: "Sleepy", icon: "\u{1F634}" },
  { key: "fussy", label: "Fussy", icon: "\u{1F61F}" },
  { key: "calm", label: "Calm", icon: "\u{1F60C}" },
] as const;

type Mood = (typeof MOODS)[number]["key"];

interface MoodPickerProps {
  currentMood?: Mood;
  onMoodChange?: (mood: Mood) => void;
}

function MoodButton({
  mood,
  selected,
  onPress,
}: {
  mood: (typeof MOODS)[number];
  selected: boolean;
  onPress: () => void;
}) {
  const { animStyle, handlers } = usePressSpring();
  const tc = useThemeColors();

  return (
    <Animated.View style={animStyle} className="flex-1">
      <Pressable
        style={{
          paddingVertical: 12,
          paddingHorizontal: 8,
          borderRadius: 12,
          borderWidth: selected ? 2 : 1,
          alignItems: 'center',
          backgroundColor: tc.raisedBg,
          borderColor: selected ? colors.feedPrimary : tc.border,
        }}
        onPress={onPress}
        {...handlers}
      >
        <Text className="text-xl">{mood.icon}</Text>
        <Text
          style={{
            fontSize: 10,
            marginTop: 4,
            fontFamily: 'Nunito_600SemiBold',
            color: selected ? colors.feedPrimary : tc.textSecondary,
          }}
        >
          {mood.label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export function MoodPicker({ currentMood, onMoodChange }: MoodPickerProps) {
  const [selected, setSelected] = useState<Mood>(currentMood ?? "calm");

  function selectMood(mood: Mood) {
    setSelected(mood);
    onMoodChange?.(mood);
  }

  return (
    <View className="flex-row gap-3">
      {MOODS.map((mood) => (
        <MoodButton
          key={mood.key}
          mood={mood}
          selected={selected === mood.key}
          onPress={() => selectMood(mood.key)}
        />
      ))}
    </View>
  );
}
