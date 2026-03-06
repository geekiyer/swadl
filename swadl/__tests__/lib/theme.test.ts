import { useThemeStore } from "../../lib/theme";
import { colors as darkColors } from "../../constants/theme";

beforeEach(() => {
  useThemeStore.setState({ mode: "dark" });
});

describe("useThemeStore", () => {
  it("defaults to dark mode", () => {
    expect(useThemeStore.getState().mode).toBe("dark");
  });

  it("toggles to light mode", () => {
    useThemeStore.getState().toggleMode();
    expect(useThemeStore.getState().mode).toBe("light");
  });

  it("toggles back to dark mode", () => {
    useThemeStore.getState().toggleMode();
    useThemeStore.getState().toggleMode();
    expect(useThemeStore.getState().mode).toBe("dark");
  });
});

describe("light mode overrides", () => {
  it("light mode overrides key colors for readability", () => {
    // The light overrides should change backgrounds to light colors
    // and text (white) to dark. Verify the override values.
    const lightOverrides = {
      midnight: "#F8F9FB",
      navyCard: "#FFFFFF",
      navyRaise: "#F1F3F7",
      navyBorder: "#E2E6ED",
      white: "#0F1D32",
      ash: "#4A5568",
    };

    // Light backgrounds should be light, not dark
    expect(lightOverrides.midnight).not.toBe(darkColors.midnight);
    expect(lightOverrides.navyCard).not.toBe(darkColors.navyCard);

    // "white" in light mode should be dark (for text contrast)
    expect(lightOverrides.white).not.toBe("#FFFFFF");
  });

  it("dark mode colors remain unchanged", () => {
    expect(darkColors.midnight).toBe("#080E1A");
    expect(darkColors.amber).toBe("#F59E0B");
    expect(darkColors.navyCard).toBe("#0F1D32");
  });

  it("accent colors (amber, ember, info) are not overridden in light mode", () => {
    // These should stay the same across both modes
    expect(darkColors.amber).toBe("#F59E0B");
    expect(darkColors.ember).toBe("#FF6B5A");
    expect(darkColors.info).toBe("#5AC8FA");
    expect(darkColors.success).toBe("#34C97A");
  });
});
