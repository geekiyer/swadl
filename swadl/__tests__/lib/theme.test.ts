import { useThemeStore } from "../../lib/theme";
import { colors } from "../../constants/theme";

beforeEach(() => {
  useThemeStore.setState({ mode: "light" });
});

describe("useThemeStore", () => {
  it("defaults to light mode", () => {
    expect(useThemeStore.getState().mode).toBe("light");
  });

  it("toggles to dark mode", () => {
    useThemeStore.getState().toggleMode();
    expect(useThemeStore.getState().mode).toBe("dark");
  });

  it("toggles back to light mode", () => {
    useThemeStore.getState().toggleMode();
    useThemeStore.getState().toggleMode();
    expect(useThemeStore.getState().mode).toBe("light");
  });
});

describe("nursery theme colors", () => {
  it("light mode backgrounds are warm cream tones", () => {
    expect(colors.cream).toBe("#FFF9F0");
    expect(colors.cardWhite).toBe("#FFFFFF");
    expect(colors.creamWarm).toBe("#FFF5E8");
    expect(colors.borderSoft).toBe("#F0E4D4");
  });

  it("dark mode backgrounds are warm charcoal tones", () => {
    expect(colors.charcoal).toBe("#1A1612");
    expect(colors.charcoalCard).toBe("#221E18");
    expect(colors.charcoalRaise).toBe("#2A2418");
    expect(colors.charcoalBorder).toBe("#302820");
  });

  it("category colors are defined", () => {
    expect(colors.feedPrimary).toBe("#E88A30");
    expect(colors.diaperPrimary).toBe("#3A8A55");
    expect(colors.sleepPrimary).toBe("#4A5A9A");
    expect(colors.pumpPrimary).toBe("#B85A5E");
    expect(colors.growthPrimary).toBe("#6A5AAA");
    expect(colors.routinePrimary).toBe("#8A7A30");
  });

  it("semantic colors are consistent", () => {
    expect(colors.success).toBe("#34C97A");
    expect(colors.warning).toBe(colors.feedPrimary);
    expect(colors.danger).toBe("#FF5050");
    expect(colors.info).toBe("#5AC8FA");
  });
});
