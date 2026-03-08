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
    <View className="bg-card-bg border border-border-main rounded-2xl p-5" style={shadows.sm}>
      {points.map((point, index) => (
        <View
          key={index}
          className={`${index > 0 ? "mt-3 pt-3 border-t border-border-main" : ""}`}
        >
          <Text className="text-[13px] text-text-secondary uppercase font-body-bold" style={{ letterSpacing: 2 }}>
            {point.label}
          </Text>
          <Text className="text-base mt-1 text-text-primary font-body">{point.summary}</Text>
        </View>
      ))}
    </View>
  );
}
