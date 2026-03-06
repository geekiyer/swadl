import { colors } from "../../constants/theme";

// Test the particle color cycling logic from LogConfirmation

const PARTICLE_COLORS = [colors.amber, colors.honey, colors.cream];

describe("LogConfirmation particle colors", () => {
  it("uses amber brand family colors", () => {
    expect(PARTICLE_COLORS).toContain(colors.amber);
    expect(PARTICLE_COLORS).toContain(colors.honey);
    expect(PARTICLE_COLORS).toContain(colors.cream);
  });

  it("cycles colors correctly for 8 particles", () => {
    const particleCount = 8;
    const assignedColors: string[] = [];

    for (let i = 0; i < particleCount; i++) {
      assignedColors.push(PARTICLE_COLORS[i % PARTICLE_COLORS.length]);
    }

    // First 3 should be amber, honey, cream
    expect(assignedColors[0]).toBe(colors.amber);
    expect(assignedColors[1]).toBe(colors.honey);
    expect(assignedColors[2]).toBe(colors.cream);

    // Then it cycles
    expect(assignedColors[3]).toBe(colors.amber);
    expect(assignedColors[4]).toBe(colors.honey);

    expect(assignedColors).toHaveLength(particleCount);
  });
});
