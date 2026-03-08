import Svg, { Rect, Path, Ellipse, Line } from 'react-native-svg';
import { colors } from '../../constants/theme';

interface BottleIconProps {
  size?: number;
  theme?: 'light' | 'dark';
}

export function BottleIcon({ size = 36, theme = 'light' }: BottleIconProps) {
  const fill = theme === 'light' ? colors.feedFill : colors.feedFillDark;
  const stroke = theme === 'light' ? colors.feedIcon : colors.feedIconDark;
  const nippleFill = theme === 'light' ? colors.feedNipple : colors.feedNippleDark;
  const nippleTip = theme === 'light' ? colors.feedNippleTip : colors.feedNippleTipDark;
  const liquid = colors.feedLiquid;

  return (
    <Svg width={size} height={size} viewBox="0 0 38 38" fill="none">
      <Rect x={11} y={13} width={16} height={19} rx={5}
        fill={fill} stroke={stroke} strokeWidth={1.3} />
      <Path d="M15 13V9.5a4 4 0 018 0V13"
        fill={nippleFill} stroke={stroke} strokeWidth={1.2} />
      <Ellipse cx={19} cy={8} rx={2.5} ry={1.8}
        fill={nippleTip} stroke={stroke} strokeWidth={0.9} />
      <Path d="M12 24c0 0 3-1.5 7-1.5s7 1.5 7 1.5v3a5 5 0 01-5 5h-4a5 5 0 01-5-5z"
        fill={liquid} opacity={theme === 'light' ? 0.3 : 0.18} />
      <Line x1={13} y1={19} x2={16} y2={19}
        stroke={stroke} strokeWidth={0.7} opacity={0.35} />
      <Line x1={13} y1={22} x2={15} y2={22}
        stroke={stroke} strokeWidth={0.7} opacity={0.35} />
      <Line x1={13} y1={25} x2={16} y2={25}
        stroke={stroke} strokeWidth={0.7} opacity={0.35} />
      <Path d="M24 17v9"
        stroke={theme === 'light' ? '#FFF' : stroke}
        strokeWidth={1} opacity={theme === 'light' ? 0.25 : 0.08}
        strokeLinecap="round" />
    </Svg>
  );
}
