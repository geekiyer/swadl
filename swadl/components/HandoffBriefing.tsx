import { View, Text } from "react-native";
import { shadows } from "../constants/theme";

interface BriefingPoint {
  label: string;
  summary: string;
}

interface HandoffBriefingProps {
  points: BriefingPoint[];
}

export function HandoffBriefing({ points }: HandoffBriefingProps) {
  return (
    <View className="bg-navy-card border border-navy-border rounded-2xl p-5" style={shadows.sm}>
      {points.map((point, index) => (
        <View
          key={index}
          className={`${index > 0 ? "mt-3 pt-3 border-t border-navy-border" : ""}`}
        >
          <Text className="text-[11px] text-ash uppercase font-body-bold" style={{ letterSpacing: 2 }}>
            {point.label}
          </Text>
          <Text className="text-base mt-1 text-white font-body">{point.summary}</Text>
        </View>
      ))}
    </View>
  );
}
