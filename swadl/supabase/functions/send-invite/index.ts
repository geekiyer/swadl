// Edge function: send-invite
// POST /functions/v1/send-invite
// Body: { email, household_id, household_name, invited_by_name, invited_by, role? }
//
// Simple flow:
// 1. Upsert into household_invites (so auto-join works when partner signs up)
// 2. Return success — the inviter tells their partner to download the app and sign up
// 3. When partner signs up with the same email → confirms → logs in,
//    index.tsx auto-join finds the household_invites row and creates their profile
//
// No confusing emails, no pre-created accounts. Clean signup experience.
//
// Requires: SUPABASE_SERVICE_ROLE_KEY (auto-available in edge functions)

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
    const { email, household_id, household_name, invited_by_name, invited_by, role } =
      await req.json();

    if (!email || !household_id || !invited_by) {
      return new Response(
        JSON.stringify({ error: "email, household_id, and invited_by are required" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabase = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const normalizedEmail = email.trim().toLowerCase();
    const inviteRole = role ?? "caregiver";

    // Upsert household_invites row — this is all we need.
    // When the partner signs up and confirms their email, index.tsx auto-join
    // will find this row and create their profile in the household.
    const { error: inviteErr } = await supabase
      .from("household_invites")
      .upsert(
        {
          household_id,
          email: normalizedEmail,
          role: inviteRole,
          invited_by,
        },
        { onConflict: "household_id,email" }
      );

    if (inviteErr) {
      return new Response(
        JSON.stringify({ error: inviteErr.message }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const senderName = invited_by_name ?? "Someone";
    const familyName = household_name ?? "their family";

    return new Response(
      JSON.stringify({
        sent: true,
        message: `Invite saved! Ask your partner to download Swadl and sign up with ${normalizedEmail}. They'll automatically join ${familyName}.`,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
