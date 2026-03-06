// constants/theme.ts
// AUTO-GENERATED from docs/brand.md — edit brand.md, not this file.

export const colors = {
  // Backgrounds (darkest → lightest)
  midnight:    '#080E1A',   // page background
  navyDeep:    '#0A1628',   // screen background
  navyCard:    '#0F1D32',   // card surface
  navyRaise:   '#162A46',   // elevated surface, inputs
  navyBorder:  '#1E3354',   // borders, dividers, icon backgrounds

  // Brand — Amber family
  amber:       '#F59E0B',   // PRIMARY: CTA buttons, FAB, active states, progress
  honey:       '#FBBF24',   // hover/highlight of amber
  cream:       '#FDE68A',   // text on amber backgrounds

  // Brand — Ember (accent, use sparingly: 1 per screen max)
  ember:       '#FF6B5A',   // secondary accent, the "l" in the wordmark, alerts
  emberDim:    '#FF8577',

  // Neutrals
  ash:         '#9BA3B5',   // secondary text, labels, meta
  fog:         '#C8CDD8',   // tertiary text
  white:       '#FFFFFF',

  // Semantic
  success:     '#34C97A',   // log confirmed, on-shift, completed
  warning:     '#F59E0B',   // same as amber — due soon, overdue approaching
  danger:      '#FF5050',   // overdue, urgent flag, error
  info:        '#5AC8FA',   // sleep data, informational
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
  tag:    6,    // status tags, code chips
  sm:     8,    // small buttons
  btn:    10,   // standard buttons, inputs
  card:   14,   // list items, task rows
  panel:  16,   // cards, panels
  modal:  20,   // bottom sheets, modals
  icon:   12,   // icon containers (36×36)
  appIcon: '22.5%', // app icon rounded square (iOS standard)
  full:   9999, // pills, avatars
} as const;

export const typography = {
  // Font families
  display: 'Fraunces_900Black',      // headings, hero numbers, screen titles
  displayItalic: 'Fraunces_900Black_Italic', // emphasis in display text
  body:    'Outfit_400Regular',      // default body text
  bodyMedium: 'Outfit_500Medium',
  bodySemiBold: 'Outfit_600SemiBold',
  bodyBold: 'Outfit_700Bold',
  bodyExtraBold: 'Outfit_800ExtraBold',
  mono:    'JetBrainsMono_400Regular', // ALL numeric data: times, oz, counts
  monoBold: 'JetBrainsMono_700Bold',

  // Scale
  displayXL:  { fontSize: 72, lineHeight: 68,  letterSpacing: -3,   fontFamily: 'Fraunces_900Black' },
  displayLG:  { fontSize: 48, lineHeight: 46,  letterSpacing: -2,   fontFamily: 'Fraunces_900Black' },
  displayMD:  { fontSize: 32, lineHeight: 32,  letterSpacing: -1,   fontFamily: 'Fraunces_900Black' },
  headingLG:  { fontSize: 24, lineHeight: 28,  letterSpacing: -0.5, fontFamily: 'Outfit_700Bold' },
  headingSM:  { fontSize: 18, lineHeight: 24,  letterSpacing: 0,    fontFamily: 'Outfit_600SemiBold' },
  body:       { fontSize: 15, lineHeight: 24,  letterSpacing: 0,    fontFamily: 'Outfit_400Regular' },
  bodyBold:   { fontSize: 15, lineHeight: 24,  letterSpacing: 0,    fontFamily: 'Outfit_600SemiBold' },
  label:      { fontSize: 11, lineHeight: 16,  letterSpacing: 2,    fontFamily: 'Outfit_700Bold',    textTransform: 'uppercase' as const },
  caption:    { fontSize: 12, lineHeight: 18,  letterSpacing: 0,    fontFamily: 'Outfit_400Regular' },
  monoLG:     { fontSize: 28, lineHeight: 32,  letterSpacing: -1,   fontFamily: 'JetBrainsMono_700Bold' },
  monoMD:     { fontSize: 20, lineHeight: 24,  letterSpacing: -0.5, fontFamily: 'JetBrainsMono_700Bold' },
  monoSM:     { fontSize: 14, lineHeight: 20,  letterSpacing: 0,    fontFamily: 'JetBrainsMono_400Regular' },
  monoXS:     { fontSize: 11, lineHeight: 16,  letterSpacing: 0,    fontFamily: 'JetBrainsMono_400Regular' },
} as const;

// Shadow system (React Native shadows)
// Use these objects spread into StyleSheet styles.
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.20,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 6,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.40,
    shadowRadius: 24,
    elevation: 12,
  },
  amber: {
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  amberGlow: {
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.20,
    shadowRadius: 24,
    elevation: 0,
  },
} as const;

export type ColorToken   = keyof typeof colors;
export type SpacingToken = keyof typeof spacing;
export type RadiiToken   = keyof typeof radii;
export type ShadowToken  = keyof typeof shadows;
