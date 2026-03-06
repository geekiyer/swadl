import { View, Text, Pressable } from "react-native";
import { useUnitStore } from "../lib/store";

export function UnitToggle() {
  const { unit, toggleUnit } = useUnitStore();

  return (
    <Pressable
      className="flex-row bg-gray-100 rounded-md p-0.5 self-end"
      onPress={toggleUnit}
    >
      <View
        className={`px-2.5 py-1 rounded ${
          unit === "oz" ? "bg-white" : ""
        }`}
      >
        <Text
          className={`text-xs font-medium ${
            unit === "oz" ? "text-blue-600" : "text-gray-400"
          }`}
        >
          oz
        </Text>
      </View>
      <View
        className={`px-2.5 py-1 rounded ${
          unit === "ml" ? "bg-white" : ""
        }`}
      >
        <Text
          className={`text-xs font-medium ${
            unit === "ml" ? "text-blue-600" : "text-gray-400"
          }`}
        >
          ml
        </Text>
      </View>
    </Pressable>
  );
}
