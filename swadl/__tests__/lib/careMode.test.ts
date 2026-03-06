// Test the CareModeResult derivation logic (extracted from useCareMode)
// Since useCareMode uses React Query + Supabase, we test the pure logic.

type CareMode = "together" | "shifts" | "nanny";

interface CareModeResult {
  mode: CareMode;
  isTogether: boolean;
  isShiftBased: boolean;
  isNanny: boolean;
}

function deriveCareModeResult(mode: CareMode): CareModeResult {
  return {
    mode,
    isTogether: mode === "together",
    isShiftBased: mode === "shifts" || mode === "nanny",
    isNanny: mode === "nanny",
  };
}

describe("CareModeResult derivation", () => {
  it("together mode: isTogether=true, isShiftBased=false, isNanny=false", () => {
    const result = deriveCareModeResult("together");
    expect(result.mode).toBe("together");
    expect(result.isTogether).toBe(true);
    expect(result.isShiftBased).toBe(false);
    expect(result.isNanny).toBe(false);
  });

  it("shifts mode: isTogether=false, isShiftBased=true, isNanny=false", () => {
    const result = deriveCareModeResult("shifts");
    expect(result.mode).toBe("shifts");
    expect(result.isTogether).toBe(false);
    expect(result.isShiftBased).toBe(true);
    expect(result.isNanny).toBe(false);
  });

  it("nanny mode: isTogether=false, isShiftBased=true, isNanny=true", () => {
    const result = deriveCareModeResult("nanny");
    expect(result.mode).toBe("nanny");
    expect(result.isTogether).toBe(false);
    expect(result.isShiftBased).toBe(true);
    expect(result.isNanny).toBe(true);
  });

  it("nanny is a subset of shift-based", () => {
    const nanny = deriveCareModeResult("nanny");
    expect(nanny.isShiftBased).toBe(true);
    expect(nanny.isNanny).toBe(true);
  });

  it("only one primary mode is true at a time", () => {
    const modes: CareMode[] = ["together", "shifts", "nanny"];
    modes.forEach((mode) => {
      const result = deriveCareModeResult(mode);
      // isTogether and isNanny should not both be true
      expect(result.isTogether && result.isNanny).toBe(false);
    });
  });
});
