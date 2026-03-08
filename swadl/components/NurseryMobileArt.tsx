import { useEffect, useRef } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import Svg, { Path, Circle, Line, Ellipse, Rect } from 'react-native-svg';

// ---------------------------------------------------------------------------
// Interface
// ---------------------------------------------------------------------------

interface NurseryMobileArtProps {
  theme: 'light' | 'dark';
  screen: 'home' | 'summary' | 'trends' | 'chores';
}

// ---------------------------------------------------------------------------
// String positions per screen (center-x of each ornament)
// ---------------------------------------------------------------------------

const STRING_POSITIONS: Record<
  NurseryMobileArtProps['screen'],
  [number, number, number]
> = {
  home: [90, 125, 158],
  summary: [90, 160, 220],
  trends: [90, 160, 230],
  chores: [90, 160, 220],
};

// ---------------------------------------------------------------------------
// Per-screen ornament render functions
// ---------------------------------------------------------------------------

function renderHomeOrnaments(L: boolean) {
  // Star ornament
  const starBody   = L ? '#FFD740' : '#A08418';
  const starStroke = L ? '#F0B820' : '#C0A030';
  const starInner  = L ? '#FFE680' : '#B89828';
  const starGlint  = L ? '#FFF'    : '#D4B848';
  const blush      = L ? '#FFB0A0' : '#C07050';
  const blushOp    = L ? 0.25 : 0.12;

  // Moon ornament
  const moonBody   = L ? '#C8D8F4' : '#2A3050';
  const moonLight  = L ? '#E0E8F8' : '#343E60';
  const moonCrater = L ? '#B0C0E0' : '#1E2840';
  const moonFace   = L ? '#8090C0' : '#6878A8';
  const moonGlow   = L ? '#D0D8F0' : '#3A4868';
  const moonBlush  = L ? '#FFB8B0' : '#A06858';
  const moonBlushOp= L ? 0.2 : 0.1;

  // Cloud ornament
  const cloud1     = L ? '#F0E8DC' : '#28221A';
  const cloud2     = L ? '#F5EEDF' : '#302818';
  const cloud3     = L ? '#FFF6EE' : '#382E20';
  const cloud4     = L ? '#FFF8F2' : '#3A3020';
  const cloudHi    = L ? '#FFF'    : '#4A3E28';
  const cloudHiOp  = L ? 0.4 : 0.35;
  const cloudEye   = L ? '#C8B8A0' : '#5A4A38';
  const cloudBlush = L ? '#FFB8B0' : '#A06858';
  const cloudBlushOp=L ? 0.15 : 0.08;

  return (
    <>
      {/* ═══ BIG STAR ═══ */}
      {/* Star body */}
      <Path d="M90 38l4.5 9 10 1.5-7.2 7 1.7 10L90 60.5l-9 5 1.7-10-7.2-7 10-1.5z"
        fill={starBody} stroke={starStroke} strokeWidth={1.2} strokeLinejoin="round" />
      {/* Star inner highlight */}
      <Path d="M90 42l2.5 5 5.5.8-4 3.8 1 5.5L90 54l-5 2.8 1-5.5-4-3.8 5.5-.8z"
        fill={starInner} opacity={0.6} />
      {/* Sparkle glints */}
      <Circle cx={86} cy={46} r={1.2} fill={starGlint} opacity={L ? 0.6 : 0.35} />
      <Circle cx={93} cy={50} r={0.8} fill={starGlint} opacity={L ? 0.4 : 0.2} />
      {/* Rosy cheeks */}
      <Circle cx={86.5} cy={52} r={1.8} fill={blush} opacity={blushOp} />
      <Circle cx={93.5} cy={52} r={1.8} fill={blush} opacity={blushOp} />

      {/* ═══ ROUND MOON ═══ */}
      {/* Moon base */}
      <Circle cx={125} cy={58} r={20} fill={moonBody} />
      {/* Crescent highlight */}
      <Circle cx={132} cy={54} r={17} fill={moonLight} />
      {/* Surface craters */}
      <Circle cx={118} cy={50} r={3} fill={moonCrater} opacity={L ? 0.3 : 0.4} />
      <Circle cx={122} cy={62} r={2} fill={moonCrater} opacity={L ? 0.25 : 0.3} />
      <Circle cx={114} cy={58} r={1.5} fill={moonCrater} opacity={L ? 0.2 : 0.25} />
      {/* Sleepy eyes */}
      <Path d="M119 55 Q121 53 123 55"
        stroke={moonFace} strokeWidth={1.2} strokeLinecap="round" fill="none" />
      <Path d="M126 54 Q128 52 130 54"
        stroke={moonFace} strokeWidth={1.2} strokeLinecap="round" fill="none" />
      {/* Smile */}
      <Path d="M121 60 Q125 63 129 60"
        stroke={moonFace} strokeWidth={1} strokeLinecap="round" fill="none" />
      {/* Blush */}
      <Circle cx={119} cy={59} r={2.5} fill={moonBlush} opacity={moonBlushOp} />
      <Circle cx={131} cy={59} r={2.5} fill={moonBlush} opacity={moonBlushOp} />
      {/* Glow ring */}
      <Circle cx={125} cy={58} r={22} stroke={moonGlow} strokeWidth={0.8} fill="none" opacity={0.3} />

      {/* ═══ CLOUD ═══ */}
      {/* Cloud puffs */}
      <Ellipse cx={158} cy={60} rx={16} ry={9} fill={cloud1} />
      <Ellipse cx={150} cy={55} rx={11} ry={8} fill={cloud2} />
      <Ellipse cx={165} cy={56} rx={9} ry={7} fill={cloud3} />
      <Ellipse cx={156} cy={52} rx={8} ry={6} fill={cloud4} />
      {/* Top highlight */}
      <Ellipse cx={154} cy={50} rx={5} ry={3.5} fill={cloudHi} opacity={cloudHiOp} />
      {/* Face */}
      <Circle cx={153} cy={56} r={1} fill={cloudEye} opacity={0.4} />
      <Circle cx={162} cy={56} r={1} fill={cloudEye} opacity={0.4} />
      {/* Blush */}
      <Circle cx={152} cy={59} r={2} fill={cloudBlush} opacity={cloudBlushOp} />
      <Circle cx={163} cy={59} r={2} fill={cloudBlush} opacity={cloudBlushOp} />
    </>
  );
}

function renderSummaryOrnaments(L: boolean) {
  // Colors
  const clipBody   = L ? '#F5EDE0' : '#302818';
  const clipStroke = L ? '#C8A878' : '#5A4830';
  const clipClip   = L ? '#D4B896' : '#4A3A28';
  const heartFill  = L ? '#FFB8B0' : '#5A2828';
  const heartStroke= L ? '#E87870' : '#A05050';
  const heartHi    = L ? '#FFD8D4' : '#784040';
  const pacFill    = L ? '#D0E8F0' : '#1E3040';
  const pacStroke  = L ? '#80B8C8' : '#4A7888';
  const pacHandle  = L ? '#C0D8E4' : '#283848';

  return (
    <>
      {/* ═══ CLIPBOARD (left ~x90) ═══ */}
      {/* Board */}
      <Rect x={72} y={38} width={36} height={44} rx={5}
        fill={clipBody} stroke={clipStroke} strokeWidth={1.5} />
      {/* Top clip */}
      <Rect x={82} y={32} width={16} height={10} rx={3}
        fill={clipClip} stroke={clipStroke} strokeWidth={1.2} />
      <Rect x={86} y={30} width={8} height={6} rx={2.5}
        fill={clipClip} stroke={clipStroke} strokeWidth={1} />
      {/* Lines on clipboard */}
      <Line x1={80} y1={52} x2={100} y2={52}
        stroke={clipStroke} strokeWidth={1.2} opacity={0.4} strokeLinecap="round" />
      <Line x1={80} y1={58} x2={96} y2={58}
        stroke={clipStroke} strokeWidth={1} opacity={0.3} strokeLinecap="round" />
      <Line x1={80} y1={64} x2={98} y2={64}
        stroke={clipStroke} strokeWidth={1} opacity={0.3} strokeLinecap="round" />
      {/* Checkmark on first line */}
      <Path d="M77 51l2 2 4-4"
        stroke={L ? '#4A9A65' : '#6AD490'} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {/* Highlight */}
      <Rect x={74} y={40} width={4} height={20} rx={2}
        fill={L ? '#FFF' : '#4A3A28'} opacity={L ? 0.25 : 0.15} />

      {/* ═══ HEART (center ~x160) ═══ */}
      <Path d="M160 50 C150 38 132 42 136 56 C138 64 150 76 160 84 C170 76 182 64 184 56 C188 42 170 38 160 50z"
        fill={heartFill} stroke={heartStroke} strokeWidth={1.5} />
      {/* Inner highlight */}
      <Path d="M160 56 C154 48 142 50 144 58 C146 64 152 72 160 78 C168 72 174 64 176 58 C178 50 166 48 160 56z"
        fill={heartHi} opacity={0.4} />
      {/* Sparkle */}
      <Circle cx={146} cy={50} r={2.5} fill={L ? '#FFF' : heartHi} opacity={L ? 0.5 : 0.3} />
      {/* Kawaii face */}
      <Circle cx={153} cy={62} r={1.2} fill={heartStroke} opacity={0.4} />
      <Circle cx={167} cy={62} r={1.2} fill={heartStroke} opacity={0.4} />
      <Path d="M156 67 Q160 70 164 67"
        stroke={heartStroke} strokeWidth={1} strokeLinecap="round" fill="none" opacity={0.35} />
      {/* Blush */}
      <Circle cx={151} cy={66} r={3} fill={L ? '#FF8070' : '#A04040'} opacity={L ? 0.15 : 0.1} />
      <Circle cx={169} cy={66} r={3} fill={L ? '#FF8070' : '#A04040'} opacity={L ? 0.15 : 0.1} />

      {/* ═══ PACIFIER (right ~x220) ═══ */}
      {/* Shield */}
      <Ellipse cx={220} cy={68} rx={18} ry={12}
        fill={pacFill} stroke={pacStroke} strokeWidth={1.3} />
      {/* Nipple */}
      <Ellipse cx={220} cy={82} rx={8} ry={6}
        fill={pacHandle} stroke={pacStroke} strokeWidth={1} />
      {/* Handle ring */}
      <Circle cx={220} cy={54} r={8}
        fill="none" stroke={pacStroke} strokeWidth={2.5} />
      <Circle cx={220} cy={54} r={5.5}
        fill="none" stroke={pacStroke} strokeWidth={1} opacity={0.3} />
      {/* Shield holes */}
      <Circle cx={210} cy={66} r={2} fill={pacStroke} opacity={0.15} />
      <Circle cx={230} cy={66} r={2} fill={pacStroke} opacity={0.15} />
      {/* Highlight */}
      <Ellipse cx={215} cy={62} rx={6} ry={3}
        fill={L ? '#FFF' : '#3A5060'} opacity={L ? 0.3 : 0.2} />
    </>
  );
}

function renderTrendsOrnaments(L: boolean) {
  const rainbowRed    = L ? '#FF8080' : '#802828';
  const rainbowOrange = L ? '#FFB860' : '#805828';
  const rainbowYellow = L ? '#FFE060' : '#807020';
  const rainbowGreen  = L ? '#80D880' : '#286828';
  const rainbowBlue   = L ? '#80B8F0' : '#283870';
  const rainbowPurple = L ? '#C0A0E8' : '#3A2860';
  const scopeBody  = L ? '#C8A878' : '#4A3A28';
  const scopeLens  = L ? '#B8D8F0' : '#1E3050';
  const scopeRing  = L ? '#D4B896' : '#5A4830';
  const shootFill  = L ? '#FFE060' : '#A08418';
  const shootTrail = L ? '#FFD740' : '#806818';

  return (
    <>
      {/* ═══ RAINBOW (left ~x90) ═══ */}
      {[
        { r: 30, color: rainbowRed },
        { r: 26, color: rainbowOrange },
        { r: 22, color: rainbowYellow },
        { r: 18, color: rainbowGreen },
        { r: 14, color: rainbowBlue },
        { r: 10, color: rainbowPurple },
      ].map(({ r, color }, i) => (
        <Path key={i}
          d={`M${65} ${76} A${r} ${r} 0 0 1 ${65 + r * 2} ${76}`}
          stroke={color} strokeWidth={3} fill="none" strokeLinecap="round"
          opacity={L ? 0.6 : 0.4} />
      ))}
      {/* Cloud base under rainbow */}
      <Ellipse cx={70} cy={78} rx={10} ry={5}
        fill={L ? '#F0E8DC' : '#28221A'} />
      <Ellipse cx={118} cy={78} rx={10} ry={5}
        fill={L ? '#F0E8DC' : '#28221A'} />

      {/* ═══ TELESCOPE (center ~x160) ═══ */}
      {/* Tripod legs */}
      <Line x1={160} y1={82} x2={148} y2={98}
        stroke={scopeBody} strokeWidth={2} strokeLinecap="round" />
      <Line x1={160} y1={82} x2={172} y2={98}
        stroke={scopeBody} strokeWidth={2} strokeLinecap="round" />
      <Line x1={160} y1={82} x2={160} y2={100}
        stroke={scopeBody} strokeWidth={1.5} strokeLinecap="round" opacity={0.5} />
      {/* Tube body */}
      <Rect x={140} y={50} width={40} height={14} rx={4}
        fill={scopeBody} stroke={scopeRing} strokeWidth={1.2}
        transform="rotate(-25, 160, 57)" />
      {/* Lens */}
      <Circle cx={178} cy={46} r={9}
        fill={scopeLens} stroke={scopeRing} strokeWidth={1.5} />
      <Circle cx={178} cy={46} r={6}
        fill={L ? '#D0E8F8' : '#283E58'} opacity={0.6} />
      {/* Lens flare */}
      <Circle cx={175} cy={43} r={2} fill={L ? '#FFF' : '#4A6880'} opacity={L ? 0.5 : 0.3} />
      {/* Eyepiece */}
      <Circle cx={142} cy={62} r={5}
        fill={scopeBody} stroke={scopeRing} strokeWidth={1} />

      {/* ═══ SHOOTING STAR (right ~x220) ═══ */}
      {/* Star body */}
      <Path d="M230 52l3 6 6.5 1-4.7 4.6 1.1 6.5L230 66.5l-5.9 3.6 1.1-6.5L220.5 59l6.5-1z"
        fill={shootFill} stroke={L ? '#E8B020' : '#C09828'} strokeWidth={1} strokeLinejoin="round" />
      {/* Inner glow */}
      <Path d="M230 56l1.5 3 3.3.5-2.4 2.3.6 3.3-3-1.5-3 1.5.6-3.3-2.4-2.3 3.3-.5z"
        fill={L ? '#FFE878' : '#B89828'} opacity={0.6} />
      {/* Trail streaks */}
      <Line x1={224} y1={56} x2={205} y2={72}
        stroke={shootTrail} strokeWidth={2.5} strokeLinecap="round" opacity={L ? 0.4 : 0.2} />
      <Line x1={222} y1={60} x2={208} y2={74}
        stroke={shootTrail} strokeWidth={1.5} strokeLinecap="round" opacity={L ? 0.25 : 0.12} />
      <Line x1={226} y1={58} x2={212} y2={70}
        stroke={shootTrail} strokeWidth={1} strokeLinecap="round" opacity={L ? 0.15 : 0.08} />
      {/* Trail sparkles */}
      <Circle cx={210} cy={70} r={1.5} fill={shootFill} opacity={L ? 0.3 : 0.15} />
      <Circle cx={215} cy={66} r={1} fill={shootFill} opacity={L ? 0.2 : 0.1} />
    </>
  );
}

function renderChoresOrnaments(L: boolean) {
  const bubbleFill  = L ? '#D8F0F8' : '#1E3040';
  const bubbleStroke= L ? '#90C8D8' : '#3A6070';
  const bubbleHi    = L ? '#FFF' : '#4A7888';
  const broomHandle = L ? '#D4B896' : '#4A3A28';
  const broomHead   = L ? '#E8C888' : '#3A2818';
  const broomBristle= L ? '#C8A060' : '#5A4020';
  const checkStarFill  = L ? '#80D880' : '#1E4820';
  const checkStarStroke= L ? '#40A840' : '#4AA868';
  const checkWhite     = L ? '#FFF' : '#A0E8A0';

  return (
    <>
      {/* ═══ SOAP BUBBLES cluster (left ~x80-105) ═══ */}
      {/* Big bubble */}
      <Circle cx={90} cy={56} r={18}
        fill={bubbleFill} stroke={bubbleStroke} strokeWidth={1} />
      <Circle cx={90} cy={56} r={15}
        fill="none" stroke={bubbleStroke} strokeWidth={0.5} opacity={0.2} />
      <Ellipse cx={84} cy={48} rx={5} ry={3}
        fill={bubbleHi} opacity={L ? 0.45 : 0.2} />
      {/* Medium bubble */}
      <Circle cx={108} cy={46} r={11}
        fill={bubbleFill} stroke={bubbleStroke} strokeWidth={0.8} />
      <Ellipse cx={104} cy={41} rx={3.5} ry={2}
        fill={bubbleHi} opacity={L ? 0.4 : 0.18} />
      {/* Small bubbles */}
      <Circle cx={76} cy={42} r={7}
        fill={bubbleFill} stroke={bubbleStroke} strokeWidth={0.7} />
      <Circle cx={100} cy={72} r={5}
        fill={bubbleFill} stroke={bubbleStroke} strokeWidth={0.6} />
      <Circle cx={112} cy={62} r={4}
        fill={bubbleFill} stroke={bubbleStroke} strokeWidth={0.5} />
      {/* Tiny rainbow reflects */}
      <Ellipse cx={86} cy={50} rx={2} ry={1}
        fill={L ? '#FFD0D0' : '#5A3030'} opacity={L ? 0.2 : 0.1} />

      {/* ═══ BROOM (center ~x160) ═══ */}
      {/* Handle */}
      <Line x1={160} y1={42} x2={160} y2={82}
        stroke={broomHandle} strokeWidth={3.5} strokeLinecap="round" />
      <Line x1={160} y1={42} x2={160} y2={70}
        stroke={L ? '#E8D4B4' : '#5A4830'} strokeWidth={1.5} strokeLinecap="round" opacity={0.4} />
      {/* Broom head binding */}
      <Rect x={153} y={78} width={14} height={5} rx={1.5}
        fill={broomHandle} stroke={broomBristle} strokeWidth={0.8} />
      {/* Bristles */}
      {[-8, -5, -2.5, 0, 2.5, 5, 8].map((dx, i) => (
        <Line key={i}
          x1={160 + dx} y1={83} x2={160 + dx * 1.3} y2={98}
          stroke={broomBristle} strokeWidth={2} strokeLinecap="round" opacity={0.7 - i * 0.03} />
      ))}
      {/* Bristle highlight */}
      <Line x1={157} y1={85} x2={155} y2={96}
        stroke={L ? '#E8D8B8' : '#6A5030'} strokeWidth={1.5} strokeLinecap="round" opacity={0.3} />

      {/* ═══ CHECK-STAR (right ~x220) ═══ */}
      {/* Star body */}
      <Path d="M220 48l5 10 11 1.6-8 7.8 1.9 11L220 72l-9.9 6.4 1.9-11-8-7.8 11-1.6z"
        fill={checkStarFill} stroke={checkStarStroke} strokeWidth={1.3} strokeLinejoin="round" />
      {/* Inner highlight */}
      <Path d="M220 54l2.8 5.5 6 .9-4.3 4.2 1 6L220 67.5l-5.5 3 1-6-4.3-4.2 6-.9z"
        fill={L ? '#A0F0A0' : '#2A5828'} opacity={0.5} />
      {/* Checkmark in center */}
      <Path d="M214 64l4 4 8-9"
        stroke={checkWhite} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      {/* Sparkle */}
      <Circle cx={212} cy={54} r={2} fill={checkWhite} opacity={L ? 0.4 : 0.2} />
      {/* Blush */}
      <Circle cx={214} cy={68} r={2.5} fill={L ? '#80C080' : '#306830'} opacity={L ? 0.2 : 0.12} />
      <Circle cx={226} cy={68} r={2.5} fill={L ? '#80C080' : '#306830'} opacity={L ? 0.2 : 0.12} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function NurseryMobileArt({ theme, screen }: NurseryMobileArtProps) {
  const L = theme === 'light';

  // Shared colors
  const arm       = L ? '#D4B896' : '#4A3A28';
  const armHi     = L ? '#E8D0B0' : '#5A4830';
  const hookInner = L ? '#E8D8C0' : '#5A4830';
  const sparkGold = L ? '#FFE680' : '#B89828';
  const sparkBlue = L ? '#D0D8F0' : '#4A5A80';
  const sparkWarm = L ? '#F0E0C8' : '#4A3A28';

  // String endpoints for the current screen
  const [s1x, s2x, s3x] = STRING_POSITIONS[screen];

  // Arm end-x: extend to cover rightmost string position + margin
  const armEndX = Math.max(160, s3x + 10);

  // Animation shared values
  const translateY = useSharedValue(12);
  const translateX = useSharedValue(0);
  const opacity    = useSharedValue(0);
  const scale      = useSharedValue(0.9);
  const rotation   = useSharedValue(-2);

  // Track first mount to avoid re-animating on tab switch
  const hasMounted = useRef(false);

  useEffect(() => {
    if (hasMounted.current) return;
    hasMounted.current = true;

    const springConfig = { damping: 12, stiffness: 90, mass: 1 };

    // Float-in after 300ms delay
    translateY.value = withDelay(300, withSpring(0, springConfig));
    opacity.value    = withDelay(300, withSpring(1, springConfig));
    scale.value      = withDelay(300, withSpring(1, springConfig));
    rotation.value   = withDelay(300, withSpring(0, springConfig));

    // Start idle sway after float-in settles (~1200ms + 300ms delay)
    const swayDelay = 1500;
    translateX.value = withDelay(
      swayDelay,
      withRepeat(
        withSequence(
          withTiming(-1.5, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
          withTiming(1.5, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true,
      ),
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  // Select ornament renderer
  const renderOrnaments = () => {
    switch (screen) {
      case 'home':    return renderHomeOrnaments(L);
      case 'summary': return renderSummaryOrnaments(L);
      case 'trends':  return renderTrendsOrnaments(L);
      case 'chores':  return renderChoresOrnaments(L);
    }
  };

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        { position: 'absolute', right: 0, top: -14, width: 240, height: 110 },
        animatedStyle,
      ]}
    >
      <Svg width={240} height={110} viewBox="20 4 240 100" fill="none">

        {/* ═══ MAIN ARM — thick wooden bar ═══ */}
        <Path d={`M60 18 Q${Math.round((60 + armEndX) / 2)} 8 ${armEndX} 16`}
          stroke={arm} strokeWidth={4} strokeLinecap="round" fill="none" />
        <Path d={`M60 18 Q${Math.round((60 + armEndX) / 2)} 10 ${armEndX} 16`}
          stroke={armHi} strokeWidth={2.5} strokeLinecap="round" fill="none" opacity={0.5} />

        {/* Hook mount */}
        <Circle cx={60} cy={18} r={4} fill={arm} />
        <Circle cx={60} cy={18} r={2} fill={hookInner} />

        {/* ═══ STRINGS ═══ */}
        <Line x1={s1x} y1={12} x2={s1x} y2={38}
          stroke={arm} strokeWidth={1.5} />
        <Line x1={s2x} y1={12} x2={s2x} y2={34}
          stroke={arm} strokeWidth={1.5} />
        <Line x1={s3x} y1={14} x2={s3x} y2={42}
          stroke={arm} strokeWidth={1.5} />

        {/* ═══ ORNAMENTS ═══ */}
        {renderOrnaments()}

        {/* ═══ SPARKLES ═══ */}
        <Circle cx={78} cy={30} r={1.5} fill={sparkGold} opacity={L ? 0.4 : 0.2} />
        <Circle cx={108} cy={22} r={1} fill={sparkGold} opacity={L ? 0.3 : 0.15} />
        <Circle cx={145} cy={26} r={1.2} fill={sparkBlue} opacity={L ? 0.3 : 0.2} />
        <Circle cx={175} cy={35} r={1} fill={sparkWarm} opacity={L ? 0.3 : 0.2} />
        <Path d="M72 24l1 2 2 .3-1.5 1.4.4 2-1.9-1-1.9 1 .4-2L69 26.3l2-.3z"
          fill={sparkGold} opacity={L ? 0.25 : 0.15} />
        <Path d="M180 28l.6 1.3 1.4.2-1 1 .2 1.3-1.2-.6-1.2.6.2-1.3-1-1 1.4-.2z"
          fill={sparkBlue} opacity={L ? 0.2 : 0.12} />
      </Svg>
    </Animated.View>
  );
}
