import Svg, { Path, Ellipse, Circle, Text as SvgText } from 'react-native-svg';
import { colors } from '../../constants/theme';

interface MoonIconProps {
  size?: number;
  theme?: 'light' | 'dark';
}

export function MoonIcon({ size = 36, theme = 'light' }: MoonIconProps) {
  const fill = theme === 'light' ? colors.sleepFill : colors.sleepFillDark;
  const stroke = theme === 'light' ? colors.sleepIcon : colors.sleepIconDark;
  const glow = theme === 'light' ? colors.sleepGlow : colors.sleepFillDark;
  const star = theme === 'light' ? colors.sleepStar : colors.sleepIconDark;
  const cloudBg = theme === 'light' ? colors.sleepCloud : colors.sleepCloudDark;

  return (
    <Svg width={size} height={size} viewBox="0 0 38 38" fill="none">
      <Ellipse cx={18} cy={30} rx={11} ry={3.5}
        fill={cloudBg} opacity={theme === 'light' ? 0.4 : 0.35} />
      <Path d="M21 6c-6.5 0-11.5 5-11.5 11 0 5 3 9 7.5 10.5C11 26 7.5 22 7.5 17 7.5 11 12 6 18 6c1.3 0 2.5.2 3.7.5A11 11 0 0021 6z"
        fill={fill} stroke={stroke} strokeWidth={1.1} />
      <Path d="M21 6c-6.5 0-11.5 5-11.5 11 0 5 3 9 7.5 10.5C11 26 7.5 22 7.5 17 7.5 11 12 6 18 6c1.3 0 2.5.2 3.7.5A11 11 0 0021 6z"
        fill={glow} opacity={theme === 'light' ? 0.25 : 0.15} />
      <Path d="M26 10l1 2 2.2.4-1.6 1.5.4 2.2L26 15l-2 1.1.4-2.2-1.6-1.5 2.2-.4z"
        fill={star} opacity={theme === 'light' ? 0.5 : 0.35} />
      <Path d="M30 17l.5 1.2 1.3.2-.9.9.2 1.3-1.1-.6-1.1.6.2-1.3-.9-.9 1.3-.2z"
        fill={star} opacity={theme === 'light' ? 0.35 : 0.25} />
      <SvgText x={28} y={13}
        fontFamily="Baloo 2" fontSize={5} fontWeight="800"
        fill={stroke} opacity={0.3}>z</SvgText>
      <SvgText x={31} y={10}
        fontFamily="Baloo 2" fontSize={3.5} fontWeight="800"
        fill={stroke} opacity={0.2}>z</SvgText>
    </Svg>
  );
}
