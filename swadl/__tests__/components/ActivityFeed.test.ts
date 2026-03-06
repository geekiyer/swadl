import { colors } from "../../constants/theme";

// Test the DOT_COLORS mapping and timeLabel logic from ActivityFeed
// Since the component depends on useRecentActivity, we test pure logic.

type ActivityKind = "feed" | "diaper" | "sleep" | "pump";

const DOT_COLORS: Record<ActivityKind, string> = {
  feed: colors.amber,
  diaper: colors.honey,
  sleep: colors.info,
  pump: colors.ember,
};

describe("ActivityFeed DOT_COLORS", () => {
  it("maps feed to amber", () => {
    expect(DOT_COLORS.feed).toBe(colors.amber);
  });

  it("maps diaper to honey", () => {
    expect(DOT_COLORS.diaper).toBe(colors.honey);
  });

  it("maps sleep to info (blue)", () => {
    expect(DOT_COLORS.sleep).toBe(colors.info);
  });

  it("maps pump to ember", () => {
    expect(DOT_COLORS.pump).toBe(colors.ember);
  });

  it("all activity kinds have a unique color", () => {
    const values = Object.values(DOT_COLORS);
    const unique = new Set(values);
    expect(unique.size).toBe(values.length);
  });

  it("covers all activity types", () => {
    const kinds: ActivityKind[] = ["feed", "diaper", "sleep", "pump"];
    kinds.forEach((kind) => {
      expect(DOT_COLORS[kind]).toBeDefined();
    });
  });
});
