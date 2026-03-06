import { BURST_ANGLES, BURST_RADII } from "../../hooks/useLogBurst";
import { LOG_BURST_PARTICLES } from "../../constants/animation";

describe("useLogBurst constants", () => {
  it("BURST_ANGLES has 8 evenly-spaced directions", () => {
    expect(BURST_ANGLES).toHaveLength(8);
    expect(BURST_ANGLES[0]).toBe(0);
    expect(BURST_ANGLES[1]).toBe(45);
    expect(BURST_ANGLES[7]).toBe(315);
  });

  it("BURST_RADII matches the number of angles", () => {
    expect(BURST_RADII).toHaveLength(BURST_ANGLES.length);
  });

  it("BURST_RADII alternates between two values", () => {
    const unique = new Set(BURST_RADII);
    expect(unique.size).toBe(2);
  });

  it("matches LOG_BURST_PARTICLES count", () => {
    expect(BURST_ANGLES.length).toBe(LOG_BURST_PARTICLES);
  });

  it("all angles are within 0-360 degrees", () => {
    BURST_ANGLES.forEach((angle) => {
      expect(angle).toBeGreaterThanOrEqual(0);
      expect(angle).toBeLessThan(360);
    });
  });

  it("all radii are positive", () => {
    BURST_RADII.forEach((radius) => {
      expect(radius).toBeGreaterThan(0);
    });
  });
});
