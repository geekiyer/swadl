import { View, Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { usePressSpring } from "../hooks/usePressSpring";
import {
  Springs,
  Timings,
  PRESS_SCALE_DENSE,
  SWIPE_THRESHOLD,
  SWIPE_RESISTANCE,
  SWIPE_EXIT_WIDTH,
} from "../constants/animation";
import { colors } from "../constants/theme";
import { Check } from "lucide-react-native";

interface TaskItemProps {
  title: string;
  time?: string;
  assignee?: string;
  isCompleted?: boolean;
  onComplete?: () => void;
  onPress?: () => void;
}

export function TaskItem({
  title,
  time,
  assignee,
  isCompleted,
  onComplete,
  onPress,
}: TaskItemProps) {
  const { animStyle, handlers } = usePressSpring(PRESS_SCALE_DENSE);
  const translateX = useSharedValue(0);
  const rowOpacity = useSharedValue(1);

  function fireComplete() {
    onComplete?.();
  }

  const pan = Gesture.Pan()
    .activeOffsetX(20)
    .failOffsetY([-15, 15])
    .onUpdate((e) => {
      if (isCompleted) return;
      const x = e.translationX * SWIPE_RESISTANCE;
      translateX.value = Math.max(0, x);
    })
    .onEnd(() => {
      if (isCompleted) return;
      if (translateX.value >= SWIPE_THRESHOLD) {
        translateX.value = withSpring(SWIPE_EXIT_WIDTH, Springs.gentle);
        rowOpacity.value = withTiming(0, Timings.fast, () => {
          runOnJS(fireComplete)();
        });
      } else {
        translateX.value = withSpring(0, Springs.snapBack);
      }
    });

  const swipeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: rowOpacity.value,
  }));

  const bgRevealStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, translateX.value / SWIPE_THRESHOLD),
  }));

  return (
    <Animated.View style={animStyle} className="mb-2">
      <View className="rounded-xl overflow-hidden">
        {/* Green background revealed on swipe */}
        <Animated.View
          style={[
            bgRevealStyle,
            {
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: colors.success,
              justifyContent: "center",
              paddingLeft: 20,
              borderRadius: 12,
            },
          ]}
        >
          <Check size={22} strokeWidth={2} color={colors.white} />
        </Animated.View>

        {/* Foreground card */}
        <GestureDetector gesture={pan}>
          <Animated.View style={swipeStyle}>
            <View
              className="flex-row items-center bg-navy-raise border border-navy-border rounded-xl p-3.5"
              onTouchEnd={() => {
                if (translateX.value < 1) {
                  onPress?.();
                }
              }}
              {...handlers}
            >
              {/* Completion circle */}
              <View
                className={`w-5 h-5 rounded-md border-2 mr-3 items-center justify-center ${
                  isCompleted
                    ? "bg-success border-success"
                    : "border-navy-border"
                }`}
              >
                {isCompleted && (
                  <Check size={12} strokeWidth={2.5} color={colors.white} />
                )}
              </View>

              <View className="flex-1">
                <Text
                  className={`text-sm font-body-semibold ${
                    isCompleted ? "text-ash line-through" : "text-white"
                  }`}
                >
                  {title}
                </Text>
                <View className="flex-row mt-0.5">
                  {time && (
                    <Text className="text-xs text-ash font-mono">{time}</Text>
                  )}
                  {assignee && (
                    <Text className="text-xs text-honey ml-2 font-body-medium">
                      {assignee}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          </Animated.View>
        </GestureDetector>
      </View>
    </Animated.View>
  );
}
