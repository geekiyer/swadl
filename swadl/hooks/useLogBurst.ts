// hooks/useLogBurst.ts
// The confirmation animation shown after a successful log save.
// Call burst() immediately after the Supabase insert resolves.

import * as Haptics from 'expo-haptics';
import {
  useSharedValue, useAnimatedStyle,
  withSpring, withTiming, withDelay, withSequence, runOnJS,
} from 'react-native-reanimated';
import { Springs, Timings } from '../constants/animation';

export function useLogBurst(onDismiss?: () => void) {
  const checkScale    = useSharedValue(0);
  const checkOpacity  = useSharedValue(0);
  const labelOpacity  = useSharedValue(0);
  const labelY        = useSharedValue(8);
  const particleP     = useSharedValue(0);   // 0->1: burst out, then 0: fade

  function burst() {
    // 1. Haptic fires FIRST — before any visual update
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // 2. Checkmark pops in, holds, then fades out — single assignment with withSequence
    checkOpacity.value = withSequence(
      withTiming(1, Timings.snap),
      withDelay(1300, withTiming(0, Timings.fast, (finished) => {
        if (finished && onDismiss) runOnJS(onDismiss)();
      })),
    );
    checkScale.value = withSpring(1, Springs.microFeedback);

    // 3. Particles burst outward, hold, then fade
    particleP.value = withSequence(
      withSpring(1, { damping: 20, stiffness: 180 }),
      withDelay(200, withTiming(0, { duration: 300 })),
    );

    // 4. "Logged!" label fades up 120ms later, then fades out
    labelOpacity.value = withDelay(120, withSequence(
      withTiming(1, { duration: 160 }),
      withDelay(1100, withTiming(0, Timings.fast)),
    ));
    labelY.value = withDelay(120, withSpring(0, { damping: 20, stiffness: 200 }));
  }

  const checkStyle = useAnimatedStyle(() => ({
    opacity:   checkOpacity.value,
    transform: [{ scale: checkScale.value }],
  }));
  const labelStyle = useAnimatedStyle(() => ({
    opacity:   labelOpacity.value,
    transform: [{ translateY: labelY.value }],
  }));

  return { burst, checkStyle, labelStyle, particleP };
}

// Particle positions — 8 evenly-spaced directions
export const BURST_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];
export const BURST_RADII  = [44, 38, 44, 38, 44, 38, 44, 38]; // alternating
