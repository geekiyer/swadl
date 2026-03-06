import { useState } from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useThemeColors, useThemeStore } from "../../lib/theme";

interface TimePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  label?: string;
}

function formatTimeShort(d: Date): string {
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function isToday(d: Date): boolean {
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function formatLabel(d: Date): string {
  if (isToday(d)) return `Today, ${formatTimeShort(d)}`;
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function TimePicker({ value, onChange, label = "When" }: TimePickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [mode, setMode] = useState<"date" | "time">("time");
  const tc = useThemeColors();
  const themeMode = useThemeStore((s) => s.mode);

  function handleChange(_event: unknown, selectedDate?: Date) {
    if (Platform.OS === "android") {
      setShowPicker(false);
    }
    if (selectedDate) {
      onChange(selectedDate);
    }
  }

  function openTimePicker() {
    setMode("time");
    setShowPicker(true);
  }

  function openDatePicker() {
    setMode("date");
    setShowPicker(true);
  }

  return (
    <View className="mb-4">
      <Text className="text-[11px] font-body-bold text-ash uppercase mb-2" style={{ letterSpacing: 2 }}>
        {label}
      </Text>
      <View className="flex-row gap-2">
        <TouchableOpacity
          className="bg-navy-card border border-navy-border rounded-xl px-4 py-3 flex-1"
          onPress={openTimePicker}
        >
          <Text className="text-base text-white font-mono">
            {formatTimeShort(value)}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-navy-card border border-navy-border rounded-xl px-4 py-3"
          onPress={openDatePicker}
        >
          <Text className="text-base text-ash">
            {isToday(value) ? "Today" : value.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
          </Text>
        </TouchableOpacity>
      </View>

      {showPicker && (
        <DateTimePicker
          value={value}
          mode={mode}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleChange}
          maximumDate={new Date()}
          themeVariant={themeMode}
          textColor={tc.white}
        />
      )}
    </View>
  );
}
