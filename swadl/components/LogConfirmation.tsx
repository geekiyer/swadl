import { View, Text, StyleSheet } from "react-native";
import Animated, { useAnimatedStyle, interpolate } from "react-native-reanimated";
import { useLogBurst, BURST_ANGLES, BURST_RADII } from "../hooks/useLogBurst";
import { colors } from "../constants/theme";
import { useImperativeHandle, forwardRef, useEffect } from "react";

export interface LogConfirmationRef {
  fire: () => void;
}

interface LogConfirmationProps {
  onDone: () => void;
  onReady?: () => void;
}

export const LogConfirmation = forwardRef<LogConfirmationRef, LogConfirmationProps>(
  function LogConfirmation({ onDone, onReady }, ref) {
    const { burst, checkStyle, labelStyle, particleP } = useLogBurst(onDone);

    useImperativeHandle(ref, () => ({
      fire: () => burst(),
    }));

    // Notify parent that the component is mounted and the ref is ready
    useEffect(() => {
      onReady?.();
    }, []);

    return (
      <View style={styles.overlay} pointerEvents="none">
        {/* Particles */}
        {BURST_ANGLES.map((angle, i) => (
          <BurstParticle
            key={i}
            angle={angle}
            radius={BURST_RADII[i]}
            progress={particleP}
            colorIndex={i}
          />
        ))}

        {/* Checkmark */}
        <Animated.View style={[styles.check, checkStyle]}>
          <Text style={styles.checkText}>✓</Text>
        </Animated.View>

        {/* Label */}
        <Animated.View style={[styles.label, labelStyle]}>
          <Text style={styles.labelText}>Logged!</Text>
        </Animated.View>
      </View>
    );
  }
);

interface BurstParticleProps {
  angle: number;
  radius: number;
  progress: Animated.SharedValue<number>;
  colorIndex: number;
}

const PARTICLE_COLORS = [colors.amber, colors.honey, colors.cream];

function BurstParticle({ angle, radius, progress, colorIndex }: BurstParticleProps) {
  const color = PARTICLE_COLORS[colorIndex % PARTICLE_COLORS.length];
  const rad = (angle * Math.PI) / 180;

  const style = useAnimatedStyle(() => {
    const p = progress.value;
    return {
      opacity: interpolate(p, [0, 0.3, 0.8, 1], [0, 1, 1, 0]),
      transform: [
        { translateX: Math.cos(rad) * radius * p },
        { translateY: Math.sin(rad) * radius * p },
        { scale: interpolate(p, [0, 0.5, 1], [0.3, 1, 0.5]) },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        styles.particle,
        { backgroundColor: color },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  check: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.success,
    justifyContent: "center",
    alignItems: "center",
  },
  checkText: {
    color: colors.white,
    fontSize: 28,
    fontFamily: "Outfit_700Bold",
  },
  label: {
    marginTop: 12,
  },
  labelText: {
    color: colors.white,
    fontSize: 18,
    fontFamily: "Outfit_600SemiBold",
  },
  particle: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
