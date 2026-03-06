// hooks/usePressSpring.ts
import { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Springs, PRESS_SCALE } from '../constants/animation';

export function usePressSpring(scale = PRESS_SCALE) {
  const pressed = useSharedValue(0);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{
      scale: withSpring(pressed.value === 1 ? scale : 1, Springs.snappy),
    }],
    shadowOpacity: withSpring(
      pressed.value === 1 ? 0.08 : 0.18,
      Springs.snappy
    ),
  }));

  const handlers = {
    onPressIn:  () => { pressed.value = 1; },
    onPressOut: () => { pressed.value = 0; },
  };

  return { animStyle, handlers };
}
