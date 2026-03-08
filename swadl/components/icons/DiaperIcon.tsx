import Svg, { Path, Circle } from 'react-native-svg';
import { colors } from '../../constants/theme';

interface DiaperIconProps {
  size?: number;
  theme?: 'light' | 'dark';
}

export function DiaperIcon({ size = 36, theme = 'light' }: DiaperIconProps) {
  const fill = theme === 'light' ? colors.diaperFill : colors.diaperFillDark;
  const stroke = theme === 'light' ? colors.diaperIcon : colors.diaperIconDark;
  const tabFill = theme === 'light' ? colors.diaperTab : colors.diaperTabDark;

  return (
    <Svg width={size} height={size} viewBox="0 0 38 38" fill="none">
      <Path d="M7 14c0-2 2-3.5 3.5-3.5h17c1.5 0 3.5 1.5 3.5 3.5v3.5c0 7.5-6 15-12 15S7 25 7 17.5z"
        fill={fill} stroke={stroke} strokeWidth={1.2} />
      <Path d="M12 13c0 0 3 2.5 7 2.5s7-2.5 7-2.5"
        stroke={stroke} strokeWidth={0.9} opacity={0.35} strokeLinecap="round" />
      <Path d="M7 15l-2 1.5a1.8 1.8 0 001.8 1.8H9"
        fill={tabFill} stroke={stroke} strokeWidth={0.9} />
      <Path d="M31 15l2 1.5a1.8 1.8 0 01-1.8 1.8H29"
        fill={tabFill} stroke={stroke} strokeWidth={0.9} />
      <Circle cx={8.5} cy={16.5} r={1}
        fill={stroke} opacity={theme === 'light' ? 0.25 : 0.18} />
      <Circle cx={29.5} cy={16.5} r={1}
        fill={stroke} opacity={theme === 'light' ? 0.25 : 0.18} />
      <Path d="M25 16v7"
        stroke={theme === 'light' ? '#FFF' : stroke}
        strokeWidth={0.8} opacity={theme === 'light' ? 0.2 : 0.06}
        strokeLinecap="round" />
    </Svg>
  );
}
