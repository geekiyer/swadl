import { colors, spacing, radii, typography, shadows } from "../../constants/theme";

describe("colors", () => {
  it("exports all required background colors", () => {
    expect(colors.cream).toBe("#FFF9F0");
    expect(colors.cardWhite).toBeDefined();
    expect(colors.charcoal).toBeDefined();
    expect(colors.charcoalCard).toBeDefined();
    expect(colors.borderSoft).toBeDefined();
  });

  it("exports category primary colors", () => {
    expect(colors.feedPrimary).toBe("#E88A30");
    expect(colors.diaperPrimary).toBe("#3A8A55");
    expect(colors.sleepPrimary).toBe("#4A5A9A");
    expect(colors.pumpPrimary).toBe("#B85A5E");
  });

  it("exports semantic colors", () => {
    expect(colors.success).toBeDefined();
    expect(colors.warning).toBeDefined();
    expect(colors.danger).toBeDefined();
    expect(colors.info).toBeDefined();
  });

  it("warning matches feedPrimary (per design spec)", () => {
    expect(colors.warning).toBe(colors.feedPrimary);
  });
});

describe("spacing", () => {
  it("all values are multiples of 4", () => {
    Object.values(spacing).forEach((value) => {
      expect(value % 4).toBe(0);
    });
  });

  it("has expected base values", () => {
    expect(spacing.px1).toBe(4);
    expect(spacing.px4).toBe(16);
    expect(spacing.px8).toBe(32);
  });
});

describe("radii", () => {
  it("has progressive radius scale", () => {
    expect(radii.tag).toBeLessThan(radii.sm);
    expect(radii.sm).toBeLessThan(radii.btn);
    expect(radii.btn).toBeLessThan(radii.card);
    expect(radii.card).toBeLessThan(radii.panel);
    expect(radii.panel).toBeLessThan(radii.modal);
  });

  it("full radius is max for pills/avatars", () => {
    expect(radii.full).toBe(9999);
  });
});

describe("typography", () => {
  it("uses Baloo2 for display", () => {
    expect(typography.display).toBe("Baloo2_800ExtraBold");
  });

  it("uses Nunito for body", () => {
    expect(typography.body.fontFamily).toBe("Nunito_400Regular");
    expect(typography.bodyBold.fontFamily).toBe("Nunito_700Bold");
  });

  it("uses JetBrains Mono for numeric data", () => {
    expect(typography.mono).toBe("JetBrainsMono_400Regular");
    expect(typography.monoBold).toBe("JetBrainsMono_700Bold");
  });

  it("label style has uppercase transform and letter spacing", () => {
    expect(typography.label.textTransform).toBe("uppercase");
    expect(typography.label.letterSpacing).toBe(2);
  });

  it("display scale decreases progressively", () => {
    expect(typography.displayXL.fontSize).toBeGreaterThan(typography.displayLG.fontSize);
    expect(typography.displayLG.fontSize).toBeGreaterThan(typography.displayMD.fontSize);
  });
});

describe("shadows", () => {
  it("none shadow has zero values", () => {
    expect(shadows.none.shadowOpacity).toBe(0);
    expect(shadows.none.elevation).toBe(0);
  });

  it("shadows increase in elevation: sm < md < lg", () => {
    expect(shadows.sm.elevation).toBeLessThan(shadows.md.elevation);
    expect(shadows.md.elevation).toBeLessThan(shadows.lg.elevation);
  });

  it("feed shadow uses feedPrimary color", () => {
    expect(shadows.feed.shadowColor).toBe("#E88A30");
  });
});
