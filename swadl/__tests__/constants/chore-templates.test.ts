import { CHORE_TEMPLATES, ChoreCategory } from "../../constants/chore-templates";

const validCategories: ChoreCategory[] = [
  "feeding_prep",
  "sanitation",
  "laundry",
  "diaper_bag",
  "safety",
  "other",
];

describe("CHORE_TEMPLATES", () => {
  it("has at least 5 templates", () => {
    expect(CHORE_TEMPLATES.length).toBeGreaterThanOrEqual(5);
  });

  it("every template has required fields", () => {
    CHORE_TEMPLATES.forEach((template) => {
      expect(template.title).toBeTruthy();
      expect(template.description).toBeTruthy();
      expect(validCategories).toContain(template.category);
      expect(template.recurrence).toBeDefined();
      expect(["daily", "weekly"]).toContain(template.recurrence.type);
    });
  });

  it("weekly templates include days array", () => {
    const weeklyTemplates = CHORE_TEMPLATES.filter(
      (t) => t.recurrence.type === "weekly"
    );
    weeklyTemplates.forEach((template) => {
      expect(template.recurrence.days).toBeDefined();
      expect(template.recurrence.days!.length).toBeGreaterThan(0);
      // Days should be 0-6 (Sun-Sat)
      template.recurrence.days!.forEach((day) => {
        expect(day).toBeGreaterThanOrEqual(0);
        expect(day).toBeLessThanOrEqual(6);
      });
    });
  });

  it("templates with feedingMethods use valid values", () => {
    const withMethods = CHORE_TEMPLATES.filter((t) => t.feedingMethods);
    const validMethods = ["breast", "bottle", "combo", "solids"];

    withMethods.forEach((template) => {
      template.feedingMethods!.forEach((method) => {
        expect(validMethods).toContain(method);
      });
    });
  });

  it("has bottle-specific templates", () => {
    const bottleTemplates = CHORE_TEMPLATES.filter(
      (t) => t.feedingMethods?.includes("bottle")
    );
    expect(bottleTemplates.length).toBeGreaterThan(0);
  });

  it("has breast-specific templates", () => {
    const breastTemplates = CHORE_TEMPLATES.filter(
      (t) => t.feedingMethods?.includes("breast")
    );
    expect(breastTemplates.length).toBeGreaterThan(0);
  });

  it("has universal templates (no feedingMethods filter)", () => {
    const universalTemplates = CHORE_TEMPLATES.filter(
      (t) => !t.feedingMethods
    );
    expect(universalTemplates.length).toBeGreaterThan(0);
  });

  it("no duplicate titles", () => {
    const titles = CHORE_TEMPLATES.map((t) => t.title);
    const unique = new Set(titles);
    expect(unique.size).toBe(titles.length);
  });

  it("times are in valid HH:MM format", () => {
    CHORE_TEMPLATES.forEach((template) => {
      if (template.recurrence.time) {
        expect(template.recurrence.time).toMatch(/^\d{2}:\d{2}$/);
        const [hours, minutes] = template.recurrence.time.split(":").map(Number);
        expect(hours).toBeGreaterThanOrEqual(0);
        expect(hours).toBeLessThanOrEqual(23);
        expect(minutes).toBeGreaterThanOrEqual(0);
        expect(minutes).toBeLessThanOrEqual(59);
      }
    });
  });
});
