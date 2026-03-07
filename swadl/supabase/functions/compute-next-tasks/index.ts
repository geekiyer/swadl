// Edge function: compute-next-tasks
// POST /functions/v1/compute-next-tasks
// Body: { household_id, limit? }
// Evaluates recurrence rules + last completions to return the next N incomplete tasks.
// Can also be invoked by a cron schedule for all households.

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

function isDueToday(recurrence: Record<string, unknown>): boolean {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=Sun, 6=Sat

  if (recurrence.type === "daily") return true;

  if (recurrence.type === "weekly" && Array.isArray(recurrence.days)) {
    return (recurrence.days as number[]).includes(dayOfWeek);
  }

  // One-time or unknown recurrence type — always show
  return true;
}

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
    const body = await req.json();
    const householdId: string | undefined = body.household_id;
    const limit: number = body.limit ?? 3;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // If no household_id, compute for all households (cron mode)
    let householdIds: string[] = [];
    if (householdId) {
      householdIds = [householdId];
    } else {
      const { data: households } = await supabase
        .from("households")
        .select("id");
      householdIds = (households ?? []).map((h: { id: string }) => h.id);
    }

    const results: Record<string, unknown[]> = {};

    for (const hId of householdIds) {
      // Get all chores for household
      const { data: chores } = await supabase
        .from("chores")
        .select("*")
        .eq("household_id", hId)
        .order("created_at", { ascending: true });

      if (!chores || chores.length === 0) {
        results[hId] = [];
        continue;
      }

      // Get today's completions
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const choreIds = chores.map((c: { id: string }) => c.id);
      const { data: completions } = await supabase
        .from("chore_completions")
        .select("chore_id")
        .in("chore_id", choreIds)
        .gte("completed_at", startOfDay.toISOString());

      const completedIds = new Set(
        (completions ?? []).map((c: { chore_id: string }) => c.chore_id)
      );

      // Filter: due today + not completed
      const nextTasks = chores
        .filter((c: { id: string; recurrence: Record<string, unknown> }) => {
          if (completedIds.has(c.id)) return false;
          return isDueToday(c.recurrence ?? {});
        })
        .slice(0, limit);

      // Resolve assignee names
      const assigneeIds = nextTasks
        .map((c: { assigned_to: string | null }) => c.assigned_to)
        .filter(Boolean);

      let assigneeMap: Record<string, string> = {};
      if (assigneeIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, display_name")
          .in("id", assigneeIds);
        assigneeMap = Object.fromEntries(
          (profiles ?? []).map((p: { id: string; display_name: string }) => [
            p.id,
            p.display_name,
          ])
        );
      }

      results[hId] = nextTasks.map(
        (c: {
          id: string;
          title: string;
          recurrence: Record<string, unknown>;
          assigned_to: string | null;
          category: string;
        }) => ({
          id: c.id,
          title: c.title,
          time: (c.recurrence as Record<string, string>)?.time ?? null,
          category: c.category,
          assignee_name: c.assigned_to
            ? assigneeMap[c.assigned_to] ?? null
            : null,
        })
      );
    }

    return new Response(JSON.stringify({ tasks: results }), {
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
