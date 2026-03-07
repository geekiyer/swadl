// Edge function: generate-handoff
// POST /functions/v1/generate-handoff
// Body: { household_id }
// Returns a structured JSON briefing: last 4 hours of logs, current mood, next tasks.
// Used for both daily briefing (together mode) and shift handoff (shifts/nanny mode).

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const { household_id } = await req.json();

    if (!household_id) {
      return new Response(
        JSON.stringify({ error: "household_id is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const fourHoursAgo = new Date(
      Date.now() - 4 * 60 * 60 * 1000
    ).toISOString();

    // Get first baby
    const { data: babies } = await supabase
      .from("babies")
      .select("*")
      .eq("household_id", household_id);

    const baby = babies?.[0];
    if (!baby) {
      return new Response(
        JSON.stringify({ error: "No baby found for household" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // --- Feed logs (last 4 hours) ---
    const { data: feeds } = await supabase
      .from("feed_logs")
      .select("*")
      .eq("baby_id", baby.id)
      .gte("started_at", fourHoursAgo)
      .order("started_at", { ascending: false });

    const feedList = feeds ?? [];
    let feedSummary = "No feeds in the last 4 hours.";
    if (feedList.length > 0) {
      const descriptions = feedList.map((f: Record<string, unknown>) => {
        const time = new Date(f.started_at as string).toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        });
        const type = (f.type as string).replace("_", " ");
        const detail = f.amount_oz
          ? ` (${f.amount_oz} oz)`
          : f.duration_min
            ? ` (${f.duration_min} min)`
            : "";
        return `${type}${detail} at ${time}`;
      });
      feedSummary = `${feedList.length} feed(s): ${descriptions.join(", ")}`;
    }

    // --- Sleep logs (last 4 hours) ---
    const { data: sleeps } = await supabase
      .from("sleep_logs")
      .select("*")
      .eq("baby_id", baby.id)
      .gte("started_at", fourHoursAgo)
      .order("started_at", { ascending: false });

    const sleepList = sleeps ?? [];
    let sleepSummary = "No sleep logged in the last 4 hours.";
    if (sleepList.length > 0) {
      const current = sleepList.find(
        (s: Record<string, unknown>) => !s.ended_at
      );
      if (current) {
        const mins = Math.floor(
          (Date.now() - new Date(current.started_at as string).getTime()) /
            60000
        );
        sleepSummary = `Currently sleeping in ${current.location} (${mins} min). ${sleepList.length - 1} other nap(s).`;
      } else {
        const totalMins = sleepList.reduce(
          (sum: number, s: Record<string, unknown>) => {
            if (s.ended_at) {
              return (
                sum +
                (new Date(s.ended_at as string).getTime() -
                  new Date(s.started_at as string).getTime()) /
                  60000
              );
            }
            return sum;
          },
          0
        );
        sleepSummary = `${sleepList.length} nap(s), ~${Math.round(totalMins)} min total.`;
      }
    }

    // --- Diaper logs (last 4 hours) ---
    const { data: diapers } = await supabase
      .from("diaper_logs")
      .select("*")
      .eq("baby_id", baby.id)
      .gte("logged_at", fourHoursAgo)
      .order("logged_at", { ascending: false });

    const diaperList = diapers ?? [];
    let diaperSummary = "No diaper changes in the last 4 hours.";
    if (diaperList.length > 0) {
      const wet = diaperList.filter(
        (d: Record<string, unknown>) =>
          d.type === "wet" || d.type === "both"
      ).length;
      const dirty = diaperList.filter(
        (d: Record<string, unknown>) =>
          d.type === "dirty" || d.type === "both"
      ).length;
      diaperSummary = `${diaperList.length} change(s): ${wet} wet, ${dirty} dirty.`;
    }

    // --- Pump logs (last 4 hours) ---
    const { data: pumps } = await supabase
      .from("pump_logs")
      .select("*")
      .eq("baby_id", baby.id)
      .gte("started_at", fourHoursAgo)
      .order("started_at", { ascending: false });

    const pumpList = pumps ?? [];
    let pumpSummary = "No pump sessions in the last 4 hours.";
    if (pumpList.length > 0) {
      const totalOz = pumpList.reduce(
        (sum: number, p: Record<string, unknown>) =>
          sum + ((p.amount_oz as number) ?? 0),
        0
      );
      pumpSummary = `${pumpList.length} session(s), ${Math.round(totalOz * 10) / 10} oz total.`;
    }

    // --- Next 3 tasks ---
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const { data: chores } = await supabase
      .from("chores")
      .select("*")
      .eq("household_id", household_id)
      .order("created_at", { ascending: true });

    const choreList = chores ?? [];
    const choreIds = choreList.map((c: { id: string }) => c.id);

    let completedIds = new Set<string>();
    if (choreIds.length > 0) {
      const { data: completions } = await supabase
        .from("chore_completions")
        .select("chore_id")
        .in("chore_id", choreIds)
        .gte("completed_at", startOfDay.toISOString());
      completedIds = new Set(
        (completions ?? []).map((c: { chore_id: string }) => c.chore_id)
      );
    }

    const nextTasks = choreList
      .filter((c: { id: string }) => !completedIds.has(c.id))
      .slice(0, 3)
      .map((c: { title: string; recurrence: Record<string, string> }) => ({
        title: c.title,
        time: c.recurrence?.time ?? null,
      }));

    // --- Previous caregiver (active shift) ---
    const { data: activeShift } = await supabase
      .from("caregiver_shifts")
      .select("*")
      .eq("household_id", household_id)
      .is("ended_at", null)
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    let previousCaregiver: string | null = null;
    if (activeShift) {
      const { data: cg } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", activeShift.caregiver_id)
        .single();
      previousCaregiver = cg?.display_name ?? null;
    }

    const briefing = {
      baby_name: baby.name,
      generated_at: new Date().toISOString(),
      currentMood: null,
      feedSummary,
      sleepSummary,
      diaperSummary,
      pumpSummary,
      nextTasks,
      previousCaregiver,
      // Plain-text version for sharing outside the app
      shareText: [
        `${baby.name} — Care Update`,
        `Generated: ${new Date().toLocaleString()}`,
        "",
        `Feeding: ${feedSummary}`,
        `Sleep: ${sleepSummary}`,
        `Diapers: ${diaperSummary}`,
        `Pumping: ${pumpSummary}`,
        "",
        `Upcoming Tasks:`,
        ...nextTasks.map(
          (t: { title: string; time: string | null }) =>
            `• ${t.title}${t.time ? ` at ${t.time}` : ""}`
        ),
        previousCaregiver ? `\nOn shift: ${previousCaregiver}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    };

    return new Response(JSON.stringify(briefing), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
