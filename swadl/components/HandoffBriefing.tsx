import { View, Text } from "react-native";

interface BriefingPoint {
  label: string;
  summary: string;
}

interface HandoffBriefingProps {
  points: BriefingPoint[];
}

export function HandoffBriefing({ points }: HandoffBriefingProps) {
  return (
    <View className="bg-gray-50 rounded-xl p-4">
      {points.map((point, index) => (
        <View
          key={index}
          className={`${index > 0 ? "mt-3 pt-3 border-t border-gray-200" : ""}`}
        >
          <Text className="text-xs text-gray-500 uppercase tracking-wide">
            {point.label}
          </Text>
          <Text className="text-base mt-1">{point.summary}</Text>
        </View>
      ))}
    </View>
  );
}
