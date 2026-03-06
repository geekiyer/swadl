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
      // Generate household ID client-side to avoid needing .select() after insert
      // (.select() triggers a SELECT RLS policy, which fails before the profile exists)
      const householdId = randomUUID();

      // 1. Create household
      const { error: householdErr } = await supabase
        .from("households")
        .insert({ id: householdId, name: `${babyName}'s Family`, care_mode: careMode });

      if (householdErr) throw householdErr;

      // 2. Create profile for current user (must happen before baby/chores due to RLS)
      const { error: profileErr } = await supabase.from("profiles").insert({
        id: session.user.id,
        household_id: householdId,
        display_name: session.user.email?.split("@")[0] ?? "Parent",
        role: "admin",
      });

      if (profileErr) throw profileErr;

      // 3. Create baby
      const { error: babyErr } = await supabase.from("babies").insert({
        household_id: householdId,
        name: babyName,
        date_of_birth: dateOfBirth,
        feeding_method: feedingMethod as "breast" | "bottle" | "combo" | "solids",
      });

      if (babyErr) throw babyErr;

      // 4. Seed chores based on feeding method
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

      // 5. If partner email provided, send invite (stored for later)
      // In a full implementation this would trigger an edge function to send an email.
      // For MVP, we just log it.
      if (partnerEmail) {
        console.log(`Invite to be sent to: ${partnerEmail}`);
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

      // Get the user's household
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
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="text-gray-500 mt-4">Setting up your household...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white px-6 pt-16">
      <Text className="text-sm text-blue-600 font-medium mb-2">
        Step 3 of 3
      </Text>
      <Text className="text-2xl font-bold mb-2">You're all set!</Text>
      <Text className="text-gray-500 mb-6">
        We've created {chores.length} recurring tasks based on {babyName}'s
        needs. Here's what's on your plate:
      </Text>

      <FlatList
        data={chores}
        keyExtractor={(item) => item.title}
        className="flex-1 mb-4"
        renderItem={({ item }) => (
          <View className="flex-row items-center bg-gray-50 rounded-lg p-3 mb-2">
            <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center mr-3">
              <Text className="text-blue-600 text-xs font-bold">
                {item.category.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-base font-medium">{item.title}</Text>
              <Text className="text-sm text-gray-400">
                {item.recurrence.type === "daily" ? "Daily" : "Weekly"}
                {item.recurrence.time ? ` at ${item.recurrence.time}` : ""}
              </Text>
            </View>
          </View>
        )}
      />

      <TouchableOpacity
        className={`rounded-lg py-4 mb-8 ${starting ? "bg-gray-400" : "bg-blue-600"}`}
        onPress={handleStartShift}
        disabled={starting}
      >
        <Text className="text-white text-center font-semibold text-base">
          {starting ? "Starting..." : "Start My First Shift"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
