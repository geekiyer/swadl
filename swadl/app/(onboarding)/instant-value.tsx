import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
} from "react-native";
import { router } from "expo-router";
import { randomUUID } from "expo-crypto";
import { supabase } from "../../lib/supabase";
import { colors } from "../../constants/theme";
import { useOnboardingStore } from "../../lib/store";
import { CHORE_TEMPLATES } from "../../constants/chore-templates";

interface SeededChore {
  title: string;
  category: string;
  recurrence: { type: string; time?: string };
}

export default function InstantValue() {
  const { babyName, dateOfBirth, feedingMethod, partnerEmail, careMode, reset } =
    useOnboardingStore();
  const [loading, setLoading] = useState(true);
  const [chores, setChores] = useState<SeededChore[]>([]);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    setupHousehold();
  }, []);

  async function setupHousehold() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    try {
      const householdId = randomUUID();

      const { error: householdErr } = await supabase
        .from("households")
        .insert({ id: householdId, name: `${babyName}'s Family`, care_mode: careMode });

      if (householdErr) throw householdErr;

      const { error: profileErr } = await supabase.from("profiles").insert({
        id: session.user.id,
        household_id: householdId,
        display_name: session.user.user_metadata?.display_name ?? session.user.email?.split("@")[0] ?? "Parent",
        role: "admin",
      });

      if (profileErr) throw profileErr;

      const { error: babyErr } = await supabase.from("babies").insert({
        household_id: householdId,
        name: babyName,
        date_of_birth: dateOfBirth,
        feeding_method: feedingMethod as "breast" | "bottle" | "combo" | "solids",
      });

      if (babyErr) throw babyErr;

      const applicableChores = CHORE_TEMPLATES.filter(
        (t) => !t.feedingMethods || t.feedingMethods.includes(feedingMethod as any)
      );

      const choreInserts = applicableChores.map((t) => ({
        household_id: householdId,
        title: t.title,
        description: t.description,
        category: t.category,
        recurrence: t.recurrence,
        is_template: true,
      }));

      if (choreInserts.length > 0) {
        const { error: choreErr } = await supabase
          .from("chores")
          .insert(choreInserts);

        if (choreErr) throw choreErr;
      }

      if (partnerEmail) {
        const { data: inviteResult, error: inviteErr } = await supabase.functions.invoke("send-invite", {
          body: {
            email: partnerEmail,
            household_id: householdId,
            household_name: `${babyName}'s Family`,
            invited_by_name: session.user.user_metadata?.display_name ?? session.user.email?.split("@")[0] ?? "Your partner",
            invited_by: session.user.id,
            role: "caregiver",
          },
        });

        if (inviteErr || inviteResult?.error) {
          Alert.alert("Invite Issue", "Household created, but the invite email couldn't be sent. You can resend from Settings.");
        }
      }

      setChores(
        applicableChores.map((t) => ({
          title: t.title,
          category: t.category,
          recurrence: t.recurrence,
        }))
      );
    } catch (err: any) {
      Alert.alert("Setup Error", err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleStartShift() {
    setStarting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("household_id")
        .eq("id", session.user.id)
        .single();

      if (profile) {
        await supabase.from("caregiver_shifts").insert({
          household_id: profile.household_id,
          caregiver_id: session.user.id,
        });
      }

      reset();
      router.replace("/(tabs)");
    } catch (err: any) {
      Alert.alert("Error", err.message);
      setStarting(false);
    }
  }

  if (loading) {
    return (
      <View className="flex-1 bg-midnight justify-center items-center">
        <ActivityIndicator size="large" color={colors.amber} />
        <Text className="text-ash mt-4 font-body">Setting up your household...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-midnight px-6 pt-16">
      <Text className="text-xs text-amber font-body-semibold mb-2 uppercase" style={{ letterSpacing: 3 }}>
        Step 3 of 3
      </Text>
      <Text className="text-2xl text-white font-display mb-2" style={{ letterSpacing: -0.5 }}>
        You're all set!
      </Text>
      <Text className="text-ash font-body mb-6">
        We've created {chores.length} recurring tasks based on {babyName}'s
        needs. Here's what's on your plate:
      </Text>

      <FlatList
        data={chores}
        keyExtractor={(item) => item.title}
        className="flex-1 mb-4"
        renderItem={({ item }) => (
          <View className="flex-row items-center bg-navy-card border border-navy-border rounded-xl p-3 mb-2">
            <View className="w-8 h-8 rounded-lg bg-navy-raise items-center justify-center mr-3">
              <Text className="text-amber text-xs font-body-bold">
                {item.category.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-base font-body-semibold text-white">{item.title}</Text>
              <Text className="text-sm text-ash font-body">
                {item.recurrence.type === "daily" ? "Daily" : "Weekly"}
                {item.recurrence.time ? ` at ${item.recurrence.time}` : ""}
              </Text>
            </View>
          </View>
        )}
      />

      <TouchableOpacity
        className={`rounded-2xl py-4 mb-8 ${starting ? "bg-navy-raise border border-navy-border" : "bg-amber"}`}
        onPress={handleStartShift}
        disabled={starting}
      >
        <Text className={`text-center font-body-semibold text-base ${starting ? "text-ash" : "text-midnight"}`}>
          {starting ? "Starting..." : "Start My First Shift"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
