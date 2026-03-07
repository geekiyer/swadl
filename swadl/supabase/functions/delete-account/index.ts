// Edge function: delete-account
// POST /functions/v1/delete-account
// Body: { user_id }
// Deletes all user data and the auth account.
// Must be called by the authenticated user themselves (validated via JWT).
//
// Deletion order:
// 1. All log entries by this user (feed_logs, diaper_logs, sleep_logs, pump_logs)
// 2. Chore completions by this user
// 3. Chore assignments (nullify assigned_to)
// 4. Caregiver shifts
// 5. Household invites sent by this user
// 6. Profile
// 7. If user was the last member of the household: household, babies, chores, remaining invites
// 8. Auth user (via admin API)

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { user_id } = await req.json();

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: "user_id is required" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the caller is the user being deleted (check JWT)
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify JWT belongs to the user_id
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller } } = await userClient.auth.getUser();

    if (!caller || caller.id !== user_id) {
      return new Response(
        JSON.stringify({ error: "You can only delete your own account" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service role for all deletions
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Get the user's profile to find their household
    const { data: profile } = await supabase
      .from("profiles")
      .select("household_id")
      .eq("id", user_id)
      .single();

    if (!profile) {
      // No profile — just delete the auth user
      await supabase.auth.admin.deleteUser(user_id);
      return new Response(
        JSON.stringify({ deleted: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const householdId = profile.household_id;

    // Get all baby IDs for this household (needed for log deletion)
    const { data: babies } = await supabase
      .from("babies")
      .select("id")
      .eq("household_id", householdId);
    const babyIds = babies?.map((b) => b.id) ?? [];

    // 1. Delete logs by this user
    if (babyIds.length > 0) {
      await supabase.from("feed_logs").delete().eq("logged_by", user_id);
      await supabase.from("diaper_logs").delete().eq("logged_by", user_id);
      await supabase.from("sleep_logs").delete().eq("logged_by", user_id);
      await supabase.from("pump_logs").delete().eq("logged_by", user_id);
    }

    // 2. Delete chore completions by this user
    await supabase.from("chore_completions").delete().eq("completed_by", user_id);

    // 3. Nullify chore assignments to this user
    await supabase
      .from("chores")
      .update({ assigned_to: null })
      .eq("assigned_to", user_id);

    // 4. Delete caregiver shifts
    await supabase.from("caregiver_shifts").delete().eq("caregiver_id", user_id);

    // 5. Delete invites sent by this user
    await supabase.from("household_invites").delete().eq("invited_by", user_id);

    // 6. Delete profile
    await supabase.from("profiles").delete().eq("id", user_id);

    // 7. Check if household is now empty — if so, clean it up
    const { count } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("household_id", householdId);

    if (count === 0) {
      // Last member — delete entire household and its data
      if (babyIds.length > 0) {
        for (const babyId of babyIds) {
          await supabase.from("feed_logs").delete().eq("baby_id", babyId);
          await supabase.from("diaper_logs").delete().eq("baby_id", babyId);
          await supabase.from("sleep_logs").delete().eq("baby_id", babyId);
          await supabase.from("pump_logs").delete().eq("baby_id", babyId);
        }
        await supabase.from("babies").delete().eq("household_id", householdId);
      }

      // Delete all chores and completions for the household
      const { data: chores } = await supabase
        .from("chores")
        .select("id")
        .eq("household_id", householdId);
      if (chores && chores.length > 0) {
        const choreIds = chores.map((c) => c.id);
        for (const choreId of choreIds) {
          await supabase.from("chore_completions").delete().eq("chore_id", choreId);
        }
        await supabase.from("chores").delete().eq("household_id", householdId);
      }

      await supabase.from("caregiver_shifts").delete().eq("household_id", householdId);
      await supabase.from("household_invites").delete().eq("household_id", householdId);
      await supabase.from("households").delete().eq("id", householdId);
    }

    // 8. Delete auth user
    const { error: authDeleteErr } = await supabase.auth.admin.deleteUser(user_id);
    if (authDeleteErr) {
      return new Response(
        JSON.stringify({ error: `Data deleted but auth removal failed: ${authDeleteErr.message}` }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ deleted: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
