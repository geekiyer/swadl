import { View, Text, Pressable } from "react-native";
import { useUnitStore } from "../lib/store";
import { colors } from "../constants/theme";

export function UnitToggle() {
  const { unit, toggleUnit } = useUnitStore();

  return (
    <Pressable
      className="flex-row bg-navy-raise rounded-lg p-0.5 self-end border border-navy-border"
      onPress={toggleUnit}
    >
      <View
        className={`px-3 py-1 rounded-md ${
          unit === "oz" ? "bg-navy-card" : ""
        }`}
      >
        <Text
          className={`text-xs font-body-bold ${
            unit === "oz" ? "text-amber" : "text-ash"
          }`}
        >
          oz
        </Text>
      </View>
      <View
        className={`px-3 py-1 rounded-md ${
          unit === "ml" ? "bg-navy-card" : ""
        }`}
      >
        <Text
          className={`text-xs font-body-bold ${
            unit === "ml" ? "text-amber" : "text-ash"
          }`}
        >
          ml
        </Text>
      </View>
    </Pressable>
  );
}
