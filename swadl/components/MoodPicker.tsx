import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import Animated from "react-native-reanimated";
import { usePressSpring } from "../hooks/usePressSpring";

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

  return (
    <Animated.View style={animStyle} className="flex-1">
      <Pressable
        className={`py-3 px-2 rounded-xl border items-center ${
          selected
            ? "bg-navy-raise border-amber"
            : "bg-navy-raise border-navy-border"
        }`}
        onPress={onPress}
        {...handlers}
      >
        <Text className="text-xl">{mood.icon}</Text>
        <Text
          className={`text-[10px] mt-1 font-body-semibold ${
            selected ? "text-honey" : "text-ash"
          }`}
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
