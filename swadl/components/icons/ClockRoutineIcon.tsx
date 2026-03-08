import Svg, { Circle, Line, Rect, Ellipse, Path } from 'react-native-svg';
import { colors } from '../../constants/theme';

interface ClockRoutineIconProps {
  size?: number;
  theme?: 'light' | 'dark';
}

export function ClockRoutineIcon({ size = 36, theme = 'light' }: ClockRoutineIconProps) {
  const clockFill = theme === 'light' ? colors.routineFill : colors.routineFillDark;
  const clockInner = theme === 'light' ? colors.routineInner : colors.routineClockInnerDark;
  const stroke = theme === 'light' ? colors.routineIcon : colors.routineIconDark;
  const bathFill = theme === 'light' ? colors.routineBathBg : colors.routineBathDark;
  const bathStroke = colors.routineBath;
  const vitFill = theme === 'light' ? colors.routineVitaminBg : colors.routineVitaminDark;
  const vitStroke = colors.routineVitamin;
  const matFill = theme === 'light' ? colors.routineTummyBg : colors.routineTummyDark;
  const matStroke = colors.routineTummy;

  return (
    <Svg width={size} height={size} viewBox="0 0 38 38" fill="none">
      <Circle cx={19} cy={19} r={10}
        fill={clockFill} stroke={stroke} strokeWidth={1.1} />
      <Circle cx={19} cy={19} r={7.5}
        fill={clockInner} stroke={stroke} strokeWidth={0.6} opacity={0.3} />
      <Line x1={19} y1={19} x2={19} y2={13}
        stroke={stroke} strokeWidth={1.2} strokeLinecap="round" />
      <Line x1={19} y1={19} x2={23} y2={17}
        stroke={stroke} strokeWidth={1} strokeLinecap="round" />
      <Circle cx={19} cy={19} r={1.2} fill={stroke} />
      <Circle cx={19} cy={10.5} r={0.6} fill={stroke} opacity={0.4} />
      <Circle cx={27.5} cy={19} r={0.6} fill={stroke} opacity={0.4} />
      <Circle cx={19} cy={27.5} r={0.6} fill={stroke} opacity={0.4} />
      <Circle cx={10.5} cy={19} r={0.6} fill={stroke} opacity={0.4} />
      <Circle cx={8} cy={8} r={3}
        fill={bathFill} stroke={bathStroke} strokeWidth={0.8} />
      <Circle cx={11} cy={6} r={1.8}
        fill={bathFill} stroke={bathStroke} strokeWidth={0.6} />
      <Circle cx={6} cy={5.5} r={1.2}
        fill={theme === 'light' ? colors.routineBathHighlight : colors.routineBathHighlightDark}
        stroke={bathStroke} strokeWidth={0.5} />
      <Rect x={28} y={4} width={6} height={10} rx={3}
        fill={vitFill} stroke={vitStroke} strokeWidth={0.8} />
      <Line x1={28} y1={9} x2={34} y2={9}
        stroke={vitStroke} strokeWidth={0.6} opacity={0.4} />
      <Circle cx={31} cy={7} r={0.6}
        fill={vitStroke} opacity={0.3} />
      <Ellipse cx={19} cy={34} rx={8} ry={2.5}
        fill={matFill} stroke={matStroke} strokeWidth={0.7} />
      <Path d="M15 33c1-1.5 3-2 4-2s3 .5 4 2"
        stroke={matStroke} strokeWidth={0.6} opacity={0.4} />
    </Svg>
  );
}
