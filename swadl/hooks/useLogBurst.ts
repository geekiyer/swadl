// hooks/useLogBurst.ts
// The confirmation animation shown after a successful log save.
// Call burst() immediately after the Supabase insert resolves.

import * as Haptics from 'expo-haptics';
import {
  useSharedValue, useAnimatedStyle,
  withSpring, withTiming, withDelay, runOnJS,
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
    runOnJS(Haptics.notificationAsync)(Haptics.NotificationFeedbackType.Success);

    // 2. Checkmark pops in (micro spring)
    checkOpacity.value = withTiming(1, Timings.snap);
    checkScale.value   = withSpring(1, Springs.microFeedback);

    // 3. Particles burst outward
    particleP.value    = withSpring(1, { damping: 20, stiffness: 180 });

    // 4. "Logged!" label fades up 120ms later
    labelOpacity.value = withDelay(120, withTiming(1, { duration: 160 }));
    labelY.value       = withDelay(120, withSpring(0, { damping: 20, stiffness: 200 }));

    // 5. Fade particles at 400ms
    particleP.value    = withDelay(400, withTiming(0, { duration: 300 }));

    // 6. Everything fades out at 1400ms, then onDismiss fires
    checkOpacity.value = withDelay(1400, withTiming(0, Timings.fast,
      (finished) => { if (finished && onDismiss) runOnJS(onDismiss)(); }
    ));
    labelOpacity.value = withDelay(1400, withTiming(0, Timings.fast));
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
// Use these to map particleP (0->1) to x/y offsets via interpolate:
//   x = cos(angle * pi/180) * radius * particleP.value
//   y = sin(angle * pi/180) * radius * particleP.value
// Colors cycle: colors.amber -> colors.honey -> colors.cream
export const BURST_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];
export const BURST_RADII  = [44, 38, 44, 38, 44, 38, 44, 38]; // alternating
