import { View, Text, TouchableOpacity } from "react-native";

interface TaskItemProps {
  title: string;
  time?: string;
  assignee?: string;
  onComplete?: () => void;
  onPress?: () => void;
}

export function TaskItem({
  title,
  time,
  assignee,
  onComplete,
  onPress,
}: TaskItemProps) {
  return (
    <TouchableOpacity
      className="flex-row items-center bg-white border border-gray-100 rounded-lg p-3 mb-2"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <TouchableOpacity
        className="w-6 h-6 rounded-full border-2 border-gray-300 mr-3"
        onPress={onComplete}
      />
      <View className="flex-1">
        <Text className="text-base font-medium">{title}</Text>
        <View className="flex-row mt-0.5">
          {time && <Text className="text-sm text-gray-400">{time}</Text>}
          {assignee && (
            <Text className="text-sm text-blue-500 ml-2">{assignee}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}
