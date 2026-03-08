import { View, Text, Pressable } from "react-native";
import { useUnitStore } from "../lib/store";
import { colors } from "../constants/theme";

export function UnitToggle() {
  const { unit, toggleUnit } = useUnitStore();

  return (
    <Pressable
      className="flex-row bg-raised-bg rounded-lg p-0.5 self-end border border-border-main"
      onPress={toggleUnit}
    >
      <View
        className={`px-3 py-1 rounded-md ${
          unit === "oz" ? "bg-card-bg" : ""
        }`}
      >
        <Text
          className={`text-xs font-body-bold ${
            unit === "oz" ? "text-feed-primary" : "text-text-secondary"
          }`}
        >
          oz
        </Text>
      </View>
      <View
        className={`px-3 py-1 rounded-md ${
          unit === "ml" ? "bg-card-bg" : ""
        }`}
      >
        <Text
          className={`text-xs font-body-bold ${
            unit === "ml" ? "text-feed-primary" : "text-text-secondary"
          }`}
        >
          ml
        </Text>
      </View>
    </Pressable>
  );
}
