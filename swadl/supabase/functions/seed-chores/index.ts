// Edge function: seed-chores
// POST /functions/v1/seed-chores
// Body: { household_id, feeding_method }
// Populates default recurring chores based on feeding method.

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CHORE_TEMPLATES = [
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

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers":
          "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const { household_id, feeding_method } = await req.json();

    if (!household_id || !feeding_method) {
      return new Response(
        JSON.stringify({ error: "household_id and feeding_method are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const applicable = CHORE_TEMPLATES.filter(
      (t) =>
        !t.feedingMethods ||
        t.feedingMethods.includes(feeding_method)
    );

    const inserts = applicable.map((t) => ({
      household_id,
      title: t.title,
      description: t.description,
      category: t.category,
      recurrence: t.recurrence,
      is_template: true,
    }));

    const { data, error } = await supabase.from("chores").insert(inserts).select("id, title");

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ seeded: data?.length ?? 0, chores: data }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
