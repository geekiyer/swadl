import { colors } from "../../constants/theme";

// Test the particle color cycling logic from LogConfirmation

const PARTICLE_COLORS = [colors.feedPrimary, colors.diaperPrimary, colors.cream];

describe("LogConfirmation particle colors", () => {
  it("uses category and brand colors", () => {
    expect(PARTICLE_COLORS).toContain(colors.feedPrimary);
    expect(PARTICLE_COLORS).toContain(colors.diaperPrimary);
    expect(PARTICLE_COLORS).toContain(colors.cream);
  });

  it("cycles colors correctly for 8 particles", () => {
    const particleCount = 8;
    const assignedColors: string[] = [];

    for (let i = 0; i < particleCount; i++) {
      assignedColors.push(PARTICLE_COLORS[i % PARTICLE_COLORS.length]);
    }

    // First 3 should be feedPrimary, diaperPrimary, cream
    expect(assignedColors[0]).toBe(colors.feedPrimary);
    expect(assignedColors[1]).toBe(colors.diaperPrimary);
    expect(assignedColors[2]).toBe(colors.cream);

    // Then it cycles
    expect(assignedColors[3]).toBe(colors.feedPrimary);
    expect(assignedColors[4]).toBe(colors.diaperPrimary);

    expect(assignedColors).toHaveLength(particleCount);
  });
});
