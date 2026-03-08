import Svg, { Path, Circle } from 'react-native-svg';
import { colors } from '../constants/theme';

interface BabyNameStarProps {
  theme?: 'light' | 'dark';
}

export function BabyNameStar({ theme = 'light' }: BabyNameStarProps) {
  return (
    <Svg width={24} height={24} viewBox="0 0 32 32" fill="none">
      <Path
        d="M16 3l4 8.5 9 1.5-6.5 6 1.5 9.5L16 23.5 8 28.5l1.5-9.5L3 13l9-1.5z"
        fill={colors.starFill}
        stroke={colors.starStroke}
        strokeWidth={1.2}
        strokeLinejoin="round"
      />
      <Circle cx={12} cy={14} r={1} fill={colors.starHighlight} opacity={0.7} />
      <Circle cx={18} cy={17} r={0.7} fill={colors.starHighlight} opacity={0.5} />
    </Svg>
  );
}
