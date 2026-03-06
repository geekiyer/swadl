import {
  Springs,
  SWIPE_THRESHOLD,
  SWIPE_RESISTANCE,
  SWIPE_EXIT_WIDTH,
  PRESS_SCALE,
  PRESS_SCALE_DENSE,
  LOG_BURST_DURATION,
  LOG_BURST_PARTICLES,
  STAGGER_MS,
  PTR_THRESHOLD,
  SHEET_CLOSE_THRESHOLD,
} from "../../constants/animation";

describe("Springs", () => {
  it("exports all required spring configs", () => {
    expect(Springs.snappy).toBeDefined();
    expect(Springs.microFeedback).toBeDefined();
    expect(Springs.modal).toBeDefined();
    expect(Springs.gentle).toBeDefined();
    expect(Springs.snapBack).toBeDefined();
    expect(Springs.rotate).toBeDefined();
  });

  it("all springs have damping and stiffness", () => {
    Object.values(Springs).forEach((spring) => {
      expect(spring.damping).toBeGreaterThan(0);
      expect(spring.stiffness).toBeGreaterThan(0);
    });
  });

  it("snappy spring has mass < 1 for responsiveness", () => {
    expect(Springs.snappy.mass).toBeLessThan(1);
  });

  it("microFeedback is the stiffest spring (for instant feel)", () => {
    const maxStiffness = Math.max(...Object.values(Springs).map((s) => s.stiffness));
    expect(Springs.microFeedback.stiffness).toBe(maxStiffness);
  });

  it("gentle spring has highest damping (minimal bounce)", () => {
    const maxDamping = Math.max(...Object.values(Springs).map((s) => s.damping));
    expect(Springs.gentle.damping).toBe(maxDamping);
  });
});

describe("scalar constants", () => {
  it("SWIPE_THRESHOLD is reasonable for a thumb gesture", () => {
    expect(SWIPE_THRESHOLD).toBeGreaterThanOrEqual(60);
    expect(SWIPE_THRESHOLD).toBeLessThanOrEqual(120);
  });

  it("SWIPE_RESISTANCE slows the gesture (< 1)", () => {
    expect(SWIPE_RESISTANCE).toBeGreaterThan(0);
    expect(SWIPE_RESISTANCE).toBeLessThan(1);
  });

  it("SWIPE_EXIT_WIDTH is wider than screen width for offscreen exit", () => {
    expect(SWIPE_EXIT_WIDTH).toBeGreaterThanOrEqual(300);
  });

  it("PRESS_SCALE values are close to 1 (subtle press)", () => {
    expect(PRESS_SCALE).toBeGreaterThan(0.9);
    expect(PRESS_SCALE).toBeLessThan(1);
    expect(PRESS_SCALE_DENSE).toBeGreaterThan(PRESS_SCALE);
    expect(PRESS_SCALE_DENSE).toBeLessThan(1);
  });

  it("LOG_BURST_DURATION is long enough for visual feedback", () => {
    expect(LOG_BURST_DURATION).toBeGreaterThanOrEqual(1000);
  });

  it("LOG_BURST_PARTICLES is a reasonable count", () => {
    expect(LOG_BURST_PARTICLES).toBeGreaterThanOrEqual(4);
    expect(LOG_BURST_PARTICLES).toBeLessThanOrEqual(16);
  });

  it("PTR_THRESHOLD is usable for pull-to-refresh", () => {
    expect(PTR_THRESHOLD).toBeGreaterThan(40);
  });

  it("SHEET_CLOSE_THRESHOLD is a fraction of screen", () => {
    expect(SHEET_CLOSE_THRESHOLD).toBeGreaterThan(0);
    expect(SHEET_CLOSE_THRESHOLD).toBeLessThan(1);
  });

  it("STAGGER_MS is small enough for smooth stagger animation", () => {
    expect(STAGGER_MS).toBeGreaterThan(0);
    expect(STAGGER_MS).toBeLessThanOrEqual(100);
  });
});
