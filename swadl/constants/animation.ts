// constants/animation.ts
// AUTO-GENERATED from docs/animations.md — edit animations.md, not this file.

import { Easing } from 'react-native-reanimated';

// ── Spring configs ────────────────────────────────────────
// d = damping, k = stiffness, m = mass
export const Springs = {
  // Card press, toggle, checkbox — anything the user touches directly
  snappy: {
    damping: 18, stiffness: 280, mass: 0.8,
    overshootClamping: false,
  },
  // FAB, confirmation checkmark, mood pip — tiny celebratory moments
  microFeedback: {
    damping: 12, stiffness: 400, mass: 0.6,
  },
  // Bottom sheet arrive, modal enter — surfaces entering the scene
  modal: {
    damping: 24, stiffness: 220, mass: 1.0,
  },
  // Swipe complete, item remove — outcomes of a gesture
  gentle: {
    damping: 30, stiffness: 160, mass: 1.0,
  },
  // Cancelled swipe, drag release
  snapBack: {
    damping: 24, stiffness: 220, mass: 0.9,
  },
  // FAB open/close rotation
  rotate: {
    damping: 18, stiffness: 240, mass: 1.0,
  },
  // Growth arrow bounce — celebratory upward motion
  growthBounce: {
    damping: 14, stiffness: 320, mass: 0.7,
  },
} as const;

// ── Timing configs ────────────────────────────────────────
export const Timings = {
  // Opacity fades, color transitions, badge changes
  fast:    { duration: 150, easing: Easing.out(Easing.quad) },
  // Stack navigation entry (used by Expo Router)
  screen:  { duration: 320, easing: Easing.out(Easing.exp)  },
  // Sheet dismiss, modal close — intentional exit feels decisive
  dismiss: { duration: 260, easing: Easing.in(Easing.quad)  },
  // Bar/line chart reveals on screen mount
  chart:   { duration: 600, easing: Easing.out(Easing.exp)  },
  // Very fast: checkmark opacity, haptic-sync moments
  snap:    { duration: 80,  easing: Easing.out(Easing.quad) },
  // Routine clock hand rotation — smooth sweep
  clockSweep: { duration: 400, easing: Easing.out(Easing.cubic) },
} as const;

// ── Scalar constants ──────────────────────────────────────
export const STAGGER_MS         = 40;    // chart bar stagger delay per bar
export const SWIPE_THRESHOLD    = 80;    // px right-swipe to trigger task complete
export const SWIPE_RESISTANCE   = 0.55;  // multiplier: card moves slower than finger
export const SWIPE_EXIT_WIDTH   = 400;   // px off-screen exit on complete
export const PTR_THRESHOLD      = 72;    // px pull to trigger refresh
export const PTR_MAX_PULL       = 120;   // clamp pull distance
export const PTR_DECAY          = 0.4;   // scroll content resistance on overscroll
export const RUBBER_BAND        = 0.18;  // sheet over-pull resistance above top snap
export const SHEET_CLOSE_THRESHOLD = 0.25; // fraction of screen height — dismiss if below
export const LOG_BURST_DURATION = 1600;  // ms: full confirmation cycle (haptic → dismiss)
export const LOG_BURST_PARTICLES = 8;    // number of burst dots
export const PRESS_SCALE        = 0.95;  // default card press-in scale
export const PRESS_SCALE_DENSE  = 0.96;  // denser list items (feed items in activity list)
export const PRESS_SCALE_ACTION = 0.92;  // action buttons (quick action grid)
export const FAB_ROTATE_OPEN    = 45;    // degrees: + rotates to × when sheet opens
export const CHART_STAGGER_OFFSET = 200; // ms: nap bars appear after night bars in sleep chart
export const ACTION_GRID_STAGGER = 50;   // ms: stagger delay per action button on mount
export const GROWTH_ARROW_DELAY = 200;   // ms: delay before growth arrow animates up
export const AVATAR_RING_SCALE  = 1.12;  // max scale of avatar ring pulse
export const AVATAR_RING_DELAY  = 300;   // ms: delay before ring pulse starts (after fonts load)
