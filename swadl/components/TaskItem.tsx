import { View, Text, Pressable } from "react-native";
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
import { useThemeColors } from "../lib/theme";
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
  const tc = useThemeColors();
  const translateX = useSharedValue(0);
  const rowOpacity = useSharedValue(1);
  const checkProgress = useSharedValue(isCompleted ? 1 : 0);

  function fireComplete() {
    onComplete?.();
  }

  function handleTapComplete() {
    if (isCompleted) return;
    checkProgress.value = withSpring(1, Springs.microFeedback);
    rowOpacity.value = withTiming(0.4, { duration: 400 }, () => {
      runOnJS(fireComplete)();
    });
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

  const circleStyle = useAnimatedStyle(() => ({
    backgroundColor: checkProgress.value > 0
      ? `rgba(52, 199, 89, ${checkProgress.value})`
      : 'transparent',
    borderColor: checkProgress.value > 0.5
      ? colors.success
      : tc.border,
  }));

  const checkmarkStyle = useAnimatedStyle(() => ({
    opacity: checkProgress.value,
    transform: [{ scale: checkProgress.value }],
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
              style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: tc.raisedBg, borderWidth: 1, borderColor: tc.border, borderRadius: 12, padding: 14 }}
              onTouchEnd={() => {
                if (translateX.value < 1) {
                  onPress?.();
                }
              }}
              {...handlers}
            >
              {/* Completion circle */}
              <Pressable onPress={handleTapComplete} hitSlop={8}>
                <Animated.View
                  className="w-5 h-5 rounded-md border-2 items-center justify-center mr-3"
                  style={circleStyle}
                >
                  <Animated.View style={checkmarkStyle}>
                    <Check size={12} strokeWidth={2.5} color={colors.white} />
                  </Animated.View>
                </Animated.View>
              </Pressable>

              <View className="flex-1">
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: 'Nunito_600SemiBold',
                    color: isCompleted ? tc.textMuted : tc.textPrimary,
                    textDecorationLine: isCompleted ? 'line-through' : 'none',
                  }}
                >
                  {title}
                </Text>
                <View className="flex-row mt-0.5">
                  {time && (
                    <Text style={{ fontSize: 14, color: tc.textSecondary, fontFamily: 'JetBrainsMono_400Regular' }}>{time}</Text>
                  )}
                  {assignee && (
                    <Text style={{ fontSize: 14, color: colors.feedPrimary, fontFamily: 'Nunito_500Medium', marginLeft: 8 }}>
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
