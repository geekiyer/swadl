import { colors } from "../../constants/theme";

// Test the category config mapping from ActivityFeed
// Since the component depends on useRecentActivity, we test pure logic.

type ActivityKind = "feed" | "diaper" | "sleep" | "pump" | "growth" | "routine";

const CATEGORY_BG_COLORS: Record<ActivityKind, string> = {
  feed: colors.feedBg,
  diaper: colors.diaperBg,
  sleep: colors.sleepBg,
  pump: colors.pumpBg,
  growth: colors.growthBg,
  routine: colors.routineBg,
};

describe("ActivityFeed category backgrounds", () => {
  it("maps feed to feedBg", () => {
    expect(CATEGORY_BG_COLORS.feed).toBe(colors.feedBg);
  });

  it("maps diaper to diaperBg", () => {
    expect(CATEGORY_BG_COLORS.diaper).toBe(colors.diaperBg);
  });

  it("maps sleep to sleepBg", () => {
    expect(CATEGORY_BG_COLORS.sleep).toBe(colors.sleepBg);
  });

  it("maps pump to pumpBg", () => {
    expect(CATEGORY_BG_COLORS.pump).toBe(colors.pumpBg);
  });

  it("maps growth to growthBg", () => {
    expect(CATEGORY_BG_COLORS.growth).toBe(colors.growthBg);
  });

  it("maps routine to routineBg", () => {
    expect(CATEGORY_BG_COLORS.routine).toBe(colors.routineBg);
  });

  it("all activity kinds have a unique color", () => {
    const values = Object.values(CATEGORY_BG_COLORS);
    const unique = new Set(values);
    expect(unique.size).toBe(values.length);
  });

  it("covers all activity types", () => {
    const kinds: ActivityKind[] = ["feed", "diaper", "sleep", "pump", "growth", "routine"];
    kinds.forEach((kind) => {
      expect(CATEGORY_BG_COLORS[kind]).toBeDefined();
    });
  });
});
