// Edge function: send-push
// POST /functions/v1/send-push
// Body: { user_id, title, body, data? }
// Sends a push notification via Expo Push Notification Service.
// Typically triggered by a DB webhook when chores.assigned_to changes.
//
// Requires:
// - EXPO_ACCESS_TOKEN env var (set in Supabase dashboard)
// - profiles table must have a push_token column (see migration below)
//
// Migration to add push_token (run once):
//   ALTER TABLE public.profiles ADD COLUMN push_token text;

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

interface ExpoPushMessage {
  to: string;
  title: string;
  body: string;
  sound?: "default" | null;
  data?: Record<string, unknown>;
  channelId?: string;
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
    const { user_id, title, body, data } = await req.json();

    if (!user_id || !title || !body) {
      return new Response(
        JSON.stringify({
          error: "user_id, title, and body are required",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Look up the user's push token
    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("push_token, display_name")
      .eq("id", user_id)
      .single();

    if (profileErr || !profile) {
      return new Response(
        JSON.stringify({ error: "User profile not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!profile.push_token) {
      return new Response(
        JSON.stringify({
          skipped: true,
          reason: "No push token registered for user",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Build Expo push message
    const message: ExpoPushMessage = {
      to: profile.push_token,
      title,
      body,
      sound: "default",
      data: data ?? {},
      channelId: "default",
    };

    // Send via Expo Push API
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    const expoAccessToken = Deno.env.get("EXPO_ACCESS_TOKEN");
    if (expoAccessToken) {
      headers["Authorization"] = `Bearer ${expoAccessToken}`;
    }

    const pushResponse = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(message),
    });

    const pushResult = await pushResponse.json();

    if (!pushResponse.ok) {
      return new Response(
        JSON.stringify({ error: "Expo push failed", details: pushResult }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check for ticket-level errors
    const ticket = pushResult?.data;
    if (ticket?.status === "error") {
      // If token is invalid, clear it from the profile
      if (
        ticket.details?.error === "DeviceNotRegistered" ||
        ticket.details?.error === "InvalidCredentials"
      ) {
        await supabase
          .from("profiles")
          .update({ push_token: null })
          .eq("id", user_id);
      }

      return new Response(
        JSON.stringify({
          error: "Push delivery failed",
          ticket_error: ticket.message,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ sent: true, ticket_id: ticket?.id }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
