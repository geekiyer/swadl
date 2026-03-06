import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";

const MOODS = [
  { key: "happy", label: "Happy", icon: ":-)" },
  { key: "fussy", label: "Fussy", icon: ":-(" },
  { key: "sleepy", label: "Sleepy", icon: "(-.-)" },
  { key: "calm", label: "Calm", icon: "(-)" },
] as const;

type Mood = (typeof MOODS)[number]["key"];

interface MoodPickerProps {
  currentMood?: Mood;
  onMoodChange?: (mood: Mood) => void;
}

export function MoodPicker({ currentMood, onMoodChange }: MoodPickerProps) {
  const [selected, setSelected] = useState<Mood>(currentMood ?? "calm");

  function cycleMood() {
    const currentIndex = MOODS.findIndex((m) => m.key === selected);
    const nextIndex = (currentIndex + 1) % MOODS.length;
    const next = MOODS[nextIndex].key;
    setSelected(next);
    onMoodChange?.(next);
  }

  const current = MOODS.find((m) => m.key === selected)!;

  return (
    <TouchableOpacity
      className="bg-blue-50 rounded-xl px-4 py-3 items-center"
      onPress={cycleMood}
      activeOpacity={0.7}
    >
      <Text className="text-2xl">{current.icon}</Text>
      <Text className="text-xs text-blue-600 mt-1 font-medium">
        {current.label}
      </Text>
    </TouchableOpacity>
  );
}
