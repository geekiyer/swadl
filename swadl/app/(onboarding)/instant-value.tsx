import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
} from "react-native";
import { router } from "expo-router";
import { randomUUID } from "expo-crypto";
import { supabase } from "../../lib/supabase";
import { colors } from "../../constants/theme";
import { useThemeColors } from "../../lib/theme";
import { useOnboardingStore } from "../../lib/store";
import { CHORE_TEMPLATES } from "../../constants/chore-templates";

interface EditableChore {
  id: string;
  title: string;
  description: string;
  category: string;
  recurrence: { type: string; days?: number[]; time?: string };
  enabled: boolean;
}

export default function InstantValue() {
  const { babyName, dateOfBirth, feedingMethod, partnerEmail, careMode, reset } =
    useOnboardingStore();
  const tc = useThemeColors();
  const [loading, setLoading] = useState(true);
  const [chores, setChores] = useState<EditableChore[]>([]);
  const [starting, setStarting] = useState(false);
  const [householdId, setHouseholdId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    setupHousehold();
  }, []);

  async function setupHousehold() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    try {
      const hId = randomUUID();

      const { error: householdErr } = await supabase
        .from("households")
        .insert({ id: hId, name: `${babyName}'s Family`, care_mode: careMode });

      if (householdErr) throw householdErr;

      const { error: profileErr } = await supabase.from("profiles").insert({
        id: session.user.id,
        household_id: hId,
        display_name: session.user.user_metadata?.display_name ?? session.user.email?.split("@")[0] ?? "Parent",
        role: "admin",
      });

      if (profileErr) throw profileErr;

      const { error: babyErr } = await supabase.from("babies").insert({
        household_id: hId,
        name: babyName,
        date_of_birth: dateOfBirth,
        feeding_method: feedingMethod as "breast" | "bottle" | "combo" | "solids",
      });

      if (babyErr) throw babyErr;

      if (partnerEmail) {
        const { data: inviteResult, error: inviteErr } = await supabase.functions.invoke("send-invite", {
          body: {
            email: partnerEmail,
            household_id: hId,
            household_name: `${babyName}'s Family`,
            invited_by_name: session.user.user_metadata?.display_name ?? session.user.email?.split("@")[0] ?? "Your partner",
            invited_by: session.user.id,
            role: "caregiver",
          },
        });

        if (inviteErr || inviteResult?.error) {
          Alert.alert("Invite Issue", "Household created, but the invite couldn't be saved. You can retry from Settings.");
        }
      }

      setHouseholdId(hId);

      // Prepare editable chores (not inserted yet)
      const applicableChores = CHORE_TEMPLATES.filter(
        (t) => !t.feedingMethods || t.feedingMethods.includes(feedingMethod as any)
      );

      setChores(
        applicableChores.map((t) => ({
          id: randomUUID(),
          title: t.title,
          description: t.description,
          category: t.category,
          recurrence: t.recurrence,
          enabled: true,
        }))
      );
    } catch (err: any) {
      Alert.alert("Setup Error", err.message);
    } finally {
      setLoading(false);
    }
  }

  function toggleChore(id: string) {
    setChores((prev) =>
      prev.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c))
    );
  }

  function updateTitle(id: string, title: string) {
    setChores((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title } : c))
    );
  }

  async function handleStartShift() {
    if (!householdId) return;
    setStarting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Insert only enabled chores
      const enabledChores = chores.filter((c) => c.enabled && c.title.trim());
      if (enabledChores.length > 0) {
        const choreInserts = enabledChores.map((c) => ({
          household_id: householdId,
          title: c.title.trim(),
          description: c.description,
          category: c.category,
          recurrence: c.recurrence,
          is_template: true,
        }));

        const { error: choreErr } = await supabase
          .from("chores")
          .insert(choreInserts);

        if (choreErr) throw choreErr;
      }

      // Start first shift
      await supabase.from("caregiver_shifts").insert({
        household_id: householdId,
        caregiver_id: session.user.id,
      });

      reset();
      router.replace("/(tabs)");
    } catch (err: any) {
      Alert.alert("Error", err.message);
      setStarting(false);
    }
  }

  const enabledCount = chores.filter((c) => c.enabled).length;

  if (loading) {
    return (
      <View className="flex-1 bg-screen-bg justify-center items-center">
        <ActivityIndicator size="large" color={colors.feedPrimary} />
        <Text className="text-text-secondary mt-4 font-body">Setting up your household...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-screen-bg px-6 pt-16">
      <Text className="text-sm text-feed-primary font-body-semibold mb-2 uppercase" style={{ letterSpacing: 3 }}>
        Step 3 of 3
      </Text>
      <Text className="text-2xl text-text-primary font-display mb-2" style={{ letterSpacing: -0.5 }}>
        Customize your chores
      </Text>
      <Text className="text-text-secondary font-body mb-6">
        We've suggested {chores.length} recurring tasks for {babyName}.
        Toggle off any you don't need, or tap to rename.
      </Text>

      <FlatList
        data={chores}
        keyExtractor={(item) => item.id}
        className="flex-1 mb-4"
        renderItem={({ item }) => (
          <View
            className={`flex-row items-center bg-card-bg border rounded-xl p-3 mb-2 ${
              item.enabled ? "border-border-main" : "border-border-main opacity-50"
            }`}
          >
            {/* Toggle */}
            <TouchableOpacity
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                borderWidth: 2,
                borderColor: item.enabled ? colors.feedPrimary : tc.border,
                backgroundColor: item.enabled ? colors.feedPrimary : "transparent",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
              onPress={() => toggleChore(item.id)}
            >
              {item.enabled && (
                <Text style={{ color: colors.charcoal, fontSize: 14, fontFamily: "Nunito_700Bold" }}>
                  ✓
                </Text>
              )}
            </TouchableOpacity>

            {/* Title (tappable to edit) */}
            <View className="flex-1">
              {editingId === item.id ? (
                <TextInput
                  className="text-text-primary font-body-semibold"
                  style={{ fontSize: 16, height: 28, padding: 0 }}
                  value={item.title}
                  onChangeText={(t) => updateTitle(item.id, t)}
                  onBlur={() => setEditingId(null)}
                  autoFocus
                  selectTextOnFocus
                />
              ) : (
                <TouchableOpacity onPress={() => setEditingId(item.id)}>
                  <Text className="text-base font-body-semibold text-text-primary">{item.title}</Text>
                </TouchableOpacity>
              )}
              <Text className="text-base text-text-secondary font-body">
                {item.recurrence.type === "daily" ? "Daily" : "Weekly"}
                {item.recurrence.time ? ` at ${item.recurrence.time}` : ""}
              </Text>
            </View>
          </View>
        )}
      />

      <TouchableOpacity
        className={`rounded-2xl py-4 mb-8 ${starting ? "bg-raised-bg border border-border-main" : "bg-feed-primary"}`}
        onPress={handleStartShift}
        disabled={starting}
      >
        <Text
          className={`text-center font-body-semibold text-base ${starting ? "text-text-secondary" : ""}`}
          style={!starting ? { color: colors.charcoal } : undefined}
        >
          {starting
            ? "Starting..."
            : enabledCount > 0
              ? `Start with ${enabledCount} chore${enabledCount === 1 ? "" : "s"}`
              : "Start without chores"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
