import { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuthStore } from "../lib/store";
import { supabase } from "../lib/supabase";

type RouteStatus = "loading" | "login" | "onboarding" | "tabs";

export default function Index() {
  const session = useAuthStore((s) => s.session);
  const [status, setStatus] = useState<RouteStatus>("loading");

  useEffect(() => {
    if (!session) {
      setStatus("login");
      return;
    }

    checkProfileOrInvite();

    async function checkProfileOrInvite() {
      // 1. Check if user already has a profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", session!.user.id)
        .single();

      if (profile) {
        setStatus("tabs");
        return;
      }

      // 2. No profile — check if there's a pending invite for this email
      const email = session!.user.email?.toLowerCase();
      if (email) {
        const { data: invite } = await supabase
          .from("household_invites")
          .select("*")
          .eq("email", email)
          .limit(1)
          .maybeSingle();

        if (invite) {
          // Auto-create profile in the invited household
          const { error: profileErr } = await supabase
            .from("profiles")
            .insert({
              id: session!.user.id,
              household_id: invite.household_id,
              display_name:
                session!.user.user_metadata?.display_name ?? session!.user.email?.split("@")[0] ?? "Caregiver",
              role: invite.role ?? "caregiver",
            });

          if (!profileErr) {
            // Clean up the invite
            await supabase
              .from("household_invites")
              .delete()
              .eq("id", invite.id);

            setStatus("tabs");
            return;
          }
        }
      }

      // 3. No profile, no invite — go to onboarding
      setStatus("onboarding");
    }
  }, [session]);

  if (status === "loading") {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "white" }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (status === "login") {
    return <Redirect href="/(auth)/login" />;
  }

  if (status === "onboarding") {
    return <Redirect href="/(onboarding)/baby-info" />;
  }

  return <Redirect href="/(tabs)" />;
}
