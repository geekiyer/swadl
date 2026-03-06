import { View, Text, TouchableOpacity } from "react-native";

interface StatusCardProps {
  title: string;
  value: string;
  subtitle?: string;
  onPress?: () => void;
}

export function StatusCard({ title, value, subtitle, onPress }: StatusCardProps) {
  return (
    <TouchableOpacity
      className="bg-gray-50 rounded-xl p-4 flex-1 mx-1"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text className="text-xs text-gray-500 uppercase tracking-wide">
        {title}
      </Text>
      <Text className="text-lg font-semibold mt-1">{value}</Text>
      {subtitle && (
        <Text className="text-sm text-gray-400 mt-0.5">{subtitle}</Text>
      )}
    </TouchableOpacity>
  );
}
