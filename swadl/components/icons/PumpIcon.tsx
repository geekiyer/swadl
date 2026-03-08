import Svg, { Rect, Path, Ellipse, Line, Circle } from 'react-native-svg';
import { colors } from '../../constants/theme';

interface PumpIconProps {
  size?: number;
  theme?: 'light' | 'dark';
}

export function PumpIcon({ size = 36, theme = 'light' }: PumpIconProps) {
  const fill = theme === 'light' ? colors.pumpFill : colors.pumpFillDark;
  const stroke = theme === 'light' ? colors.pumpIcon : colors.pumpIconDark;
  const flange = theme === 'light' ? colors.pumpFlange : colors.pumpFlangeDark;
  const funnelFill = theme === 'light' ? colors.pumpFunnel : colors.pumpFunnelDark;
  const liquid = colors.pumpLiquid;
  const handleFill = theme === 'light' ? colors.pumpHandle : colors.pumpHandleDark;

  return (
    <Svg width={size} height={size} viewBox="0 0 38 38" fill="none">
      <Rect x={12} y={19} width={14} height={13} rx={4}
        fill={fill} stroke={stroke} strokeWidth={1.1} />
      <Path d="M13 19c0 0 0-5.5 6-5.5s6 5.5 6 5.5"
        fill={funnelFill} stroke={stroke} strokeWidth={1.1} />
      <Ellipse cx={19} cy={12} rx={4.5} ry={2.5}
        fill={flange} stroke={stroke} strokeWidth={0.9} />
      <Rect x={13} y={27} width={12} height={4} rx={2.5}
        fill={liquid} opacity={theme === 'light' ? 0.2 : 0.12} />
      <Line x1={14} y1={23} x2={17} y2={23}
        stroke={stroke} strokeWidth={0.6} opacity={0.3} />
      <Line x1={14} y1={26} x2={16} y2={26}
        stroke={stroke} strokeWidth={0.6} opacity={0.25} />
      <Path d="M25 13.5h3a2 2 0 012 2v1.5a2 2 0 01-2 2h-1"
        stroke={stroke} strokeWidth={1.1} fill={handleFill} />
      <Circle cx={19} cy={8.5} r={1}
        fill={liquid} opacity={0.25} />
      <Path d="M23 21v7"
        stroke={theme === 'light' ? '#FFF' : stroke}
        strokeWidth={0.8} opacity={theme === 'light' ? 0.2 : 0.06}
        strokeLinecap="round" />
    </Svg>
  );
}
