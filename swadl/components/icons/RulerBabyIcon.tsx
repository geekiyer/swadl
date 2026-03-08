import Svg, { Rect, Path, Circle, Line } from 'react-native-svg';
import { colors } from '../../constants/theme';

interface RulerBabyIconProps {
  size?: number;
  theme?: 'light' | 'dark';
}

export function RulerBabyIcon({ size = 36, theme = 'light' }: RulerBabyIconProps) {
  const rulerFill = theme === 'light' ? colors.growthFill : colors.growthFillDark;
  const stroke = theme === 'light' ? colors.growthIcon : colors.growthIconDark;
  const bodyFill = theme === 'light' ? colors.growthBody : colors.growthFillDark;
  const arrow = theme === 'light' ? colors.growthArrow : colors.growthArrowDark;

  return (
    <Svg width={size} height={size} viewBox="0 0 38 38" fill="none">
      <Rect x={8} y={6} width={8} height={28} rx={3}
        fill={rulerFill} stroke={stroke} strokeWidth={1.1} />
      <Line x1={8} y1={11} x2={12} y2={11}
        stroke={stroke} strokeWidth={0.7} opacity={0.4} />
      <Line x1={8} y1={15} x2={11} y2={15}
        stroke={stroke} strokeWidth={0.7} opacity={0.3} />
      <Line x1={8} y1={19} x2={12} y2={19}
        stroke={stroke} strokeWidth={0.7} opacity={0.4} />
      <Line x1={8} y1={23} x2={11} y2={23}
        stroke={stroke} strokeWidth={0.7} opacity={0.3} />
      <Line x1={8} y1={27} x2={12} y2={27}
        stroke={stroke} strokeWidth={0.7} opacity={0.4} />
      <Circle cx={24} cy={12} r={5}
        fill={bodyFill} stroke={stroke} strokeWidth={1} />
      <Path d="M24 17v8"
        stroke={stroke} strokeWidth={1.5} strokeLinecap="round" />
      <Path d="M24 25c-3 0-4 3-4 6"
        stroke={stroke} strokeWidth={1.2} strokeLinecap="round" />
      <Path d="M24 25c3 0 4 3 4 6"
        stroke={stroke} strokeWidth={1.2} strokeLinecap="round" />
      <Path d="M24 20l-4-2"
        stroke={stroke} strokeWidth={1.2} strokeLinecap="round" />
      <Path d="M24 20l4-2"
        stroke={stroke} strokeWidth={1.2} strokeLinecap="round" />
      <Circle cx={22.5} cy={11.5} r={0.6}
        fill={stroke} opacity={0.4} />
      <Circle cx={25.5} cy={11.5} r={0.6}
        fill={stroke} opacity={0.4} />
      <Path d="M23 13.5c0.5 0.5 1.5 0.5 2 0"
        stroke={stroke} strokeWidth={0.6} strokeLinecap="round" opacity={0.4} />
      <Path d="M32 14l0-8"
        stroke={arrow} strokeWidth={1.2} strokeLinecap="round" />
      <Path d="M30 8l2-2 2 2"
        stroke={arrow} strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
