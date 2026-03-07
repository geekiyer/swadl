// Edge function: send-invite
// POST /functions/v1/send-invite
// Body: { email, household_name, invited_by_name, role? }
// Uses Supabase Auth admin API to send an invite email.
// If the user already exists, just inserts into household_invites.
// If the user doesn't exist, sends a magic link invite email via Supabase Auth.
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
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabase = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const normalizedEmail = email.trim().toLowerCase();
    const inviteRole = role ?? "caregiver";

    // Insert into household_invites (so auto-join works on signup)
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
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user already exists in auth
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(
      (u) => u.email?.toLowerCase() === normalizedEmail
    );

    if (existingUser) {
      // User exists — they'll be auto-joined on next login via the household_invites row
      return new Response(
        JSON.stringify({
          sent: true,
          method: "existing_user",
          message: "User already has an account. They will be added to your household on next login.",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // User doesn't exist — send invite email via Supabase Auth
    const senderName = invited_by_name ?? "Someone";
    const familyName = household_name ?? "their family";

    const { error: authErr } = await supabase.auth.admin.inviteUserByEmail(
      normalizedEmail,
      {
        redirectTo: `swadl://`,
        data: {
          household_id,
          invited_role: inviteRole,
          invite_message: `${senderName} invited you to join ${familyName} on Swadl.`,
        },
      }
    );

    if (authErr) {
      // If invite fails (e.g. email already invited via auth), still succeed
      // since we already have the household_invites row
      if (authErr.message?.includes("already been invited")) {
        return new Response(
          JSON.stringify({
            sent: true,
            method: "already_invited",
            message: "Invite email was already sent previously.",
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: authErr.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        sent: true,
        method: "email_invite",
        message: `Invite email sent to ${normalizedEmail}`,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
