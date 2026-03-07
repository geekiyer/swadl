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
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const senderName = invited_by_name ?? "Someone";
    const familyName = household_name ?? "their family";

    // Send invite email via Supabase Auth admin API.
    // - If user doesn't exist: creates auth user + sends invite email
    // - If user exists but unconfirmed: re-sends invite email
    // - If user exists and confirmed: may error — that's fine, we have the household_invites row
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
      // "already been registered" or "already been invited" means user exists.
      // The household_invites row ensures auto-join on their next login.
      const msg = authErr.message?.toLowerCase() ?? "";
      if (msg.includes("already") || msg.includes("registered") || msg.includes("invited")) {
        return new Response(
          JSON.stringify({
            sent: true,
            method: "existing_user",
            message: "This user already has an account. They will be added to your household on their next login.",
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: authErr.message }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
