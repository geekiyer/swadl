// constants/theme.ts
// AUTO-GENERATED from docs/brand.md — edit brand.md, not this file.

export const colors = {
  // ── Light mode backgrounds (warmest → coolest) ──
  cream:         '#FFF9F0',   // page background (light)
  creamWarm:     '#FFF5E8',   // warm gradient wash at top
  creamGold:     '#FFEED8',   // gradient start for header area
  cardWhite:     '#FFFFFF',   // card surface (light)
  borderSoft:    '#F0E4D4',   // borders, dividers (light)
  borderWarm:    '#E8D8C4',   // stronger borders, input outlines (light)

  // ── Dark mode backgrounds (warm charcoal family) ──
  charcoal:      '#1A1612',   // page background (dark)
  charcoalCard:  '#221E18',   // card surface (dark)
  charcoalRaise: '#2A2418',   // elevated surface (dark)
  charcoalBorder:'#302820',   // borders, dividers (dark)

  // ── Text ──
  textDark:      '#2E1F10',   // primary text (light mode)
  textBody:      '#4A3828',   // body text (light mode)
  textSecondary: '#8A7560',   // secondary text, labels (light mode)
  textMuted:     '#B8A898',   // muted text, timestamps (light mode)
  textPlaceholder:'#C4B4A4',  // placeholder, inactive tabs (light mode)

  textLightPrimary:  '#F5EDE2',  // primary text (dark mode)
  textLightBody:     '#D0C4B8',  // body text (dark mode)
  textLightSecondary:'#8A7A68',  // secondary text (dark mode)
  textLightMuted:    '#5A4A38',  // muted text (dark mode)
  textLightPlaceholder:'#8A7A6A',// placeholder, inactive tabs (dark mode)

  // ── Category: Feed (warm amber/orange) ──
  feedPrimary:   '#E88A30',   // primary accent
  feedIcon:      '#C07A2A',   // icon strokes (light)
  feedIconDark:  '#F0A850',   // icon strokes (dark)
  feedBg:        '#FFF3E4',   // tinted background (light)
  feedBorder:    '#F5DFC0',   // border (light)
  feedFill:      '#FCECD4',   // icon body fill (light)
  feedLiquid:    '#F5B040',   // liquid fill inside bottle
  feedFillDark:  '#3A2A18',   // icon body fill (dark)

  // ── Category: Diaper (sage green) ──
  diaperPrimary: '#3A8A55',
  diaperIcon:    '#4A9A65',   // icon strokes (light)
  diaperIconDark:'#6AD490',   // icon strokes (dark)
  diaperBg:      '#EDF8F0',   // tinted background (light)
  diaperBorder:  '#C0E8CE',
  diaperFill:    '#D8F0E0',   // icon body fill (light)
  diaperTab:     '#B8E0C8',   // tab detail fill
  diaperFillDark:'#1A2A1E',   // icon body fill (dark)
  diaperTabDark: '#1E3024',

  // ── Category: Sleep (soft periwinkle) ──
  sleepPrimary:  '#4A5A9A',
  sleepIcon:     '#5468A8',   // icon strokes (light)
  sleepIconDark: '#98AAE0',   // icon strokes (dark)
  sleepBg:       '#EDF0FA',   // tinted background (light)
  sleepBorder:   '#C0C8E8',
  sleepFill:     '#C8D4F0',   // moon fill (light)
  sleepGlow:     '#E8EEF8',   // inner moon glow
  sleepStar:     '#8A9AD0',   // companion star fill
  sleepFillDark: '#2A3050',   // moon fill (dark)

  // ── Category: Pump (soft rose) ──
  pumpPrimary:   '#B85A5E',
  pumpIcon:      '#B85A5E',   // icon strokes (light)
  pumpIconDark:  '#F0A0A4',   // icon strokes (dark)
  pumpBg:        '#FDEFF0',   // tinted background (light)
  pumpBorder:    '#F0C8CA',
  pumpFill:      '#F8E0E0',   // icon body fill (light)
  pumpFlange:    '#F0C8CA',
  pumpLiquid:    '#E8888A',
  pumpFillDark:  '#2A1A1A',   // icon body fill (dark)

  // ── Category: Growth (lavender/purple) ──
  growthPrimary: '#6A5AAA',
  growthIcon:    '#6A5AAA',   // icon strokes (light)
  growthIconDark:'#B8A8E8',   // icon strokes (dark)
  growthBg:      '#F0F0FD',   // tinted background (light)
  growthBorder:  '#C8C4F0',
  growthFill:    '#E8E4F8',   // ruler fill (light)
  growthBody:    '#D8D0F0',   // baby figure fill
  growthArrow:   '#8A7AC0',   // upward arrow
  growthFillDark:'#2A2440',   // ruler fill (dark)
  growthArrowDark:'#9888D0',

  // ── Category: Routine (warm gold/olive) ──
  routinePrimary:'#8A7A30',
  routineIcon:   '#8A7A30',   // icon strokes (light)
  routineIconDark:'#D8C870',  // icon strokes (dark)
  routineBg:     '#FFF8E8',   // tinted background (light)
  routineBorder: '#E8DCA0',
  routineFill:   '#FFF4D8',   // clock face fill (light)
  routineInner:  '#FFF8E8',   // inner clock ring
  routineFillDark:'#2A2818',  // clock face fill (dark)
  routineBath:   '#6AA0B8',   // bath bubbles stroke
  routineBathBg: '#D0E8F0',   // bath bubbles fill (light)
  routineBathDark:'#1A2A30',  // bath bubbles fill (dark)
  routineVitamin:'#AA6A8A',   // vitamin pill stroke
  routineVitaminBg:'#F0D8E8', // vitamin pill fill (light)
  routineVitaminDark:'#301828',
  routineTummy:  '#5A9A5A',   // tummy time mat stroke
  routineTummyBg:'#D8F0D8',   // tummy time mat fill (light)
  routineTummyDark:'#1A2A1A',

  // ── Semantic ──
  success:       '#34C97A',   // completed, on-shift
  warning:       '#E88A30',   // same as feedPrimary — due soon
  danger:        '#FF5050',   // overdue, urgent, error
  info:          '#5AC8FA',   // informational

  // ── Neutrals ──
  white:         '#FFFFFF',
  black:         '#000000',

  // ── Background pattern ──
  patternLight:  '#C09860',   // star/dot pattern fill (light, at ~3% opacity)
  patternDark:   '#D4A868',   // star/dot pattern fill (dark, at ~4% opacity)

  // ── Feed item detail text ──
  textDetail:      '#9A8A78',   // detail/secondary line in feed items (light)
  textDetailDark:  '#7A6A58',   // detail/secondary line in feed items (dark)

  // ── Settings button border ──
  settingsBtnBorder: '#F0DCC0',

  // ── Star decoration ──
  starFill:        '#F5B040',   // baby name star fill
  starStroke:      '#D49020',   // baby name star stroke
  starHighlight:   '#FDE8B8',   // baby name star sparkle dots

  // ── Icon sub-colors ──
  feedNipple:      '#F5DDB8',   // bottle nipple fill (light)
  feedNippleDark:  '#2A2018',   // bottle nipple fill (dark)
  feedNippleTip:   '#F0C878',   // bottle nipple tip (light)
  feedNippleTipDark:'#4A3418',  // bottle nipple tip (dark)
  feedStroke:      '#D49020',   // bottle icon stroke (used in 38×38 version)
  pumpFunnel:      '#F0D0D0',   // pump funnel fill (light)
  pumpFunnelDark:  '#281818',   // pump funnel fill (dark)
  pumpFlangeDark:  '#301818',   // pump flange dark
  pumpHandle:      '#F8E8E8',   // pump handle fill (light)
  pumpHandleDark:  '#281818',   // pump handle fill (dark)
  sleepCloud:      '#D8E0F4',   // cloud base fill (light)
  sleepCloudDark:  '#2A2A40',   // cloud base fill (dark)
  routineClockInnerDark: '#302E18',  // clock inner ring (dark)
  routineBathHighlight:  '#E0F0F8',  // bath bubble highlight (light)
  routineBathHighlightDark: '#1E3038', // bath bubble highlight (dark)
  routineBathStrokeDark:  '#68A8C0',   // bath stroke (dark)
  routineVitaminDarkStroke: '#C080A0', // vitamin stroke (dark)
  routineTummyDarkStroke:   '#68A868', // tummy mat stroke (dark)
} as const;

export const spacing = {
  // Base unit: 4px. All values are multiples of 4.
  px1:   4,
  px2:   8,
  px3:   12,
  px4:   16,
  px5:   20,
  px6:   24,
  px8:   32,
  px10:  40,
  px12:  48,
  px16:  64,
} as const;

export const radii = {
  tag:    8,    // status tags, badges
  sm:     10,   // small buttons
  btn:    12,   // standard buttons, icon containers in feed
  card:   16,   // list items, action buttons, status cards, feed items
  panel:  18,   // larger cards, panels
  modal:  24,   // bottom sheets, modals
  full:   9999, // pills, avatars
  appIcon: '22.5%', // app icon rounded square (iOS standard)
} as const;

export const typography = {
  // Font families
  display: 'Baloo2_800ExtraBold',        // headings, baby name, screen titles
  displayBold: 'Baloo2_700Bold',         // section headers, button labels
  body:    'Nunito_400Regular',           // default body text
  bodyMedium: 'Nunito_500Medium',
  bodySemiBold: 'Nunito_600SemiBold',
  bodyBold: 'Nunito_700Bold',
  bodyExtraBold: 'Nunito_800ExtraBold',   // names in feed, strong emphasis
  mono:    'JetBrainsMono_400Regular',    // ALL numeric data: times, oz, counts
  monoBold: 'JetBrainsMono_700Bold',

  // Scale
  displayXL:  { fontSize: 60, lineHeight: 58,  letterSpacing: -2,   fontFamily: 'Baloo2_800ExtraBold' },
  displayLG:  { fontSize: 42, lineHeight: 42,  letterSpacing: -1.5, fontFamily: 'Baloo2_800ExtraBold' },
  displayMD:  { fontSize: 34, lineHeight: 36,  letterSpacing: -0.5, fontFamily: 'Baloo2_800ExtraBold' },
  headingLG:  { fontSize: 26, lineHeight: 30,  letterSpacing: -0.3, fontFamily: 'Baloo2_700Bold' },
  headingSM:  { fontSize: 20, lineHeight: 26,  letterSpacing: 0,    fontFamily: 'Nunito_700Bold' },
  body:       { fontSize: 18, lineHeight: 26,  letterSpacing: 0,    fontFamily: 'Nunito_400Regular' },
  bodyBold:   { fontSize: 18, lineHeight: 26,  letterSpacing: 0,    fontFamily: 'Nunito_700Bold' },
  label:      { fontSize: 14, lineHeight: 20,  letterSpacing: 2,    fontFamily: 'Baloo2_700Bold',     textTransform: 'uppercase' as const },
  caption:    { fontSize: 15, lineHeight: 22,  letterSpacing: 0,    fontFamily: 'Nunito_400Regular' },
  pillLabel:  { fontSize: 15, lineHeight: 20,  letterSpacing: 0.3,  fontFamily: 'Baloo2_700Bold' },
  monoLG:     { fontSize: 32, lineHeight: 36,  letterSpacing: -1,   fontFamily: 'JetBrainsMono_700Bold' },
  monoMD:     { fontSize: 24, lineHeight: 28,  letterSpacing: -0.5, fontFamily: 'JetBrainsMono_700Bold' },
  monoSM:     { fontSize: 18, lineHeight: 24,  letterSpacing: 0,    fontFamily: 'JetBrainsMono_400Regular' },
  monoXS:     { fontSize: 14, lineHeight: 20,  letterSpacing: -0.3, fontFamily: 'JetBrainsMono_400Regular' },
} as const;

export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  feed: {
    shadowColor: '#E88A30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  feedGlow: {
    shadowColor: '#E88A30',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.10,
    shadowRadius: 20,
    elevation: 0,
  },
} as const;

export type ColorToken   = keyof typeof colors;
export type SpacingToken = keyof typeof spacing;
export type RadiiToken   = keyof typeof radii;
export type ShadowToken  = keyof typeof shadows;
