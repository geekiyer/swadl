import { Pressable, View, Text, TouchableOpacity } from "react-native";
import Animated from "react-native-reanimated";
import { usePressSpring } from "../hooks/usePressSpring";
import { PRESS_SCALE_DENSE } from "../constants/animation";

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
  const { animStyle, handlers } = usePressSpring(PRESS_SCALE_DENSE);

  return (
    <Animated.View style={animStyle} className="mb-2">
      <Pressable
        className="flex-row items-center bg-navy-raise border border-navy-border rounded-xl p-3.5"
        onPress={onPress}
        {...handlers}
      >
        <TouchableOpacity
          className="w-5 h-5 rounded-md border-2 border-navy-border mr-3"
          onPress={onComplete}
        />
        <View className="flex-1">
          <Text className="text-sm font-body-semibold text-white">{title}</Text>
          <View className="flex-row mt-0.5">
            {time && <Text className="text-xs text-ash font-mono">{time}</Text>}
            {assignee && (
              <Text className="text-xs text-honey ml-2 font-body-medium">{assignee}</Text>
            )}
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}
