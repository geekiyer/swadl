export type ChoreCategory =
  | "feeding_prep"
  | "sanitation"
  | "laundry"
  | "diaper_bag"
  | "safety"
  | "other";

export interface ChoreTemplate {
  title: string;
  description: string;
  category: ChoreCategory;
  recurrence: { type: "daily" | "weekly"; days?: number[]; time?: string };
  feedingMethods?: ("breast" | "bottle" | "combo" | "solids")[];
}

export const CHORE_TEMPLATES: ChoreTemplate[] = [
  {
    title: "Sanitize bottles",
    description: "Wash and sanitize all bottles and nipples",
    category: "sanitation",
    recurrence: { type: "daily", time: "20:00" },
    feedingMethods: ["bottle", "combo"],
  },
  {
    title: "Sanitize pump parts",
    description: "Disassemble, wash, and sanitize breast pump parts",
    category: "sanitation",
    recurrence: { type: "daily", time: "21:00" },
    feedingMethods: ["breast", "combo"],
  },
  {
    title: "Restock diaper bag",
    description:
      "Check and refill diapers, wipes, change of clothes, and snacks",
    category: "diaper_bag",
    recurrence: { type: "daily", time: "08:00" },
  },
  {
    title: "Baby laundry",
    description: "Wash baby clothes, bibs, and burp cloths",
    category: "laundry",
    recurrence: { type: "weekly", days: [1, 4], time: "09:00" },
  },
  {
    title: "Wash crib sheets",
    description: "Strip and wash crib sheets and mattress pad",
    category: "laundry",
    recurrence: { type: "weekly", days: [0], time: "10:00" },
  },
  {
    title: "Prep bottles for next day",
    description: "Prepare and refrigerate bottles for the next day",
    category: "feeding_prep",
    recurrence: { type: "daily", time: "21:00" },
    feedingMethods: ["bottle", "combo"],
  },
  {
    title: "Tummy time",
    description: "10-15 minutes of supervised tummy time",
    category: "other",
    recurrence: { type: "daily", time: "10:00" },
  },
  {
    title: "Check baby monitor batteries",
    description: "Ensure baby monitor is charged and functioning",
    category: "safety",
    recurrence: { type: "weekly", days: [0], time: "20:00" },
  },
];
