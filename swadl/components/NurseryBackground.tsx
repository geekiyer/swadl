import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, Pattern, Rect, Circle, Path } from 'react-native-svg';
import { colors } from '../constants/theme';

interface NurseryBackgroundProps {
  theme?: 'light' | 'dark';
}

export function NurseryBackground({ theme = 'light' }: NurseryBackgroundProps) {
  const bgColor = theme === 'light' ? colors.cream : colors.charcoal;
  const patternColor = theme === 'light' ? colors.patternLight : colors.patternDark;
  const patternOpacity = theme === 'light' ? 0.03 : 0.04;
  const gradientColors = theme === 'light'
    ? [colors.creamGold, 'transparent'] as const
    : ['#28201A', 'transparent'] as const;
  const gradientOpacity = theme === 'light' ? 0.5 : 0.7;

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: bgColor }]} pointerEvents="none">
      {/* Pattern layer */}
      <View style={[StyleSheet.absoluteFill, { opacity: patternOpacity }]}>
        <Svg width="100%" height="100%">
          <Defs>
            <Pattern id="nurseryPattern" x={0} y={0} width={140} height={140} patternUnits="userSpaceOnUse">
              {/* Dots */}
              <Circle cx={12} cy={24} r={1.5} fill={patternColor} />
              <Circle cx={80} cy={18} r={1} fill={patternColor} />
              <Circle cx={45} cy={90} r={1.3} fill={patternColor} />
              <Circle cx={115} cy={70} r={1} fill={patternColor} />
              <Circle cx={130} cy={120} r={1} fill={patternColor} />
              {/* Stars */}
              <Path d="M28 60l1.8-4.5 1.8 4.5-4.5-2.8h5.4z" fill={patternColor} />
              <Path d="M100 105l1.2-3 1.2 3-3-2h4z" fill={patternColor} />
              {/* Moon */}
              <Path d="M70 35 Q72.5 30 75 35 Q72.5 32 70 35z" fill={patternColor} />
            </Pattern>
          </Defs>
          <Rect x={0} y={0} width="100%" height="100%" fill="url(#nurseryPattern)" />
        </Svg>
      </View>
      {/* Gradient wash */}
      <LinearGradient
        colors={gradientColors}
        style={[StyleSheet.absoluteFill, { height: 300, opacity: gradientOpacity }]}
      />
    </View>
  );
}
