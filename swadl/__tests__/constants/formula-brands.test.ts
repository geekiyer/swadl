import { FORMULA_BRANDS } from "../../constants/formula-brands";

describe("FORMULA_BRANDS", () => {
  it("has a reasonable number of brands", () => {
    expect(FORMULA_BRANDS.length).toBeGreaterThan(10);
  });

  it("includes major US brands", () => {
    const brands = Array.from(FORMULA_BRANDS);
    expect(brands.some((b) => b.includes("Similac"))).toBe(true);
    expect(brands.some((b) => b.includes("Enfamil"))).toBe(true);
    expect(brands.some((b) => b.includes("Gerber"))).toBe(true);
  });

  it("includes an 'Other' option", () => {
    expect(FORMULA_BRANDS).toContain("Other");
  });

  it("has no duplicates", () => {
    const unique = new Set(FORMULA_BRANDS);
    expect(unique.size).toBe(FORMULA_BRANDS.length);
  });

  it("every brand is a non-empty string", () => {
    FORMULA_BRANDS.forEach((brand) => {
      expect(typeof brand).toBe("string");
      expect(brand.length).toBeGreaterThan(0);
    });
  });
});
