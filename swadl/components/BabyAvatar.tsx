import { useEffect, useRef } from 'react';
import { Pressable, Text, Image, ActivityIndicator, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withSequence,
} from 'react-native-reanimated';
import { colors } from '../constants/theme';
import { Springs, Timings, AVATAR_RING_SCALE, AVATAR_RING_DELAY } from '../constants/animation';

interface BabyAvatarProps {
  avatarUrl?: string | null;
  babyName?: string;
  theme: 'light' | 'dark';
  onPress?: () => void;
  loading?: boolean;
}

export function BabyAvatar({ avatarUrl, babyName, theme, onPress, loading }: BabyAvatarProps) {
  const hasAnimated = useRef(false);
  const avatarScale = useSharedValue(0.8);
  const avatarOpacity = useSharedValue(0);
  const ringScale = useSharedValue(1);

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    // After delay, scale in avatar
    avatarScale.value = withDelay(
      AVATAR_RING_DELAY,
      withSpring(1, Springs.snappy)
    );
    avatarOpacity.value = withDelay(
      AVATAR_RING_DELAY,
      withTiming(1, Timings.fast)
    );

    // Ring pulse after avatar arrives
    ringScale.value = withDelay(
      AVATAR_RING_DELAY + 200,
      withSequence(
        withSpring(AVATAR_RING_SCALE, { damping: 10, stiffness: 300, mass: 0.6 }),
        withSpring(1, Springs.snappy)
      )
    );
  }, []);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
  }));

  const avatarStyle = useAnimatedStyle(() => ({
    transform: [{ scale: avatarScale.value }],
    opacity: avatarOpacity.value,
  }));

  const borderColor = theme === 'light' ? colors.feedPrimary : colors.feedIconDark;
  const bgColor = theme === 'light' ? colors.creamWarm : colors.charcoalRaise;
  const initialColor = theme === 'light' ? colors.feedPrimary : colors.feedIconDark;
  const initial = babyName ? babyName.charAt(0).toUpperCase() : '?';

  return (
    <Animated.View style={[ringStyle, { width: 48, height: 48, borderRadius: 24, borderWidth: 2.5, borderColor, backgroundColor: bgColor, overflow: 'hidden' }]}>
      <Pressable onPress={onPress} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Animated.View style={[avatarStyle, { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }]}>
          {loading ? (
            <ActivityIndicator size="small" color={initialColor} />
          ) : avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              style={{ width: '100%', height: '100%', borderRadius: 24 }}
              resizeMode="cover"
            />
          ) : (
            <Text style={{ fontFamily: 'Baloo2_800ExtraBold', fontSize: 20, color: initialColor }}>
              {initial}
            </Text>
          )}
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}
