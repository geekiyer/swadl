import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  Switch,
} from "react-native";
import { router } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";
import { useBabies } from "../../lib/queries";

type DiaperType = "wet" | "dirty" | "both" | "dry";

const POOP_COLORS = [
  { key: "yellow", label: "Yellow", color: "#CA8A04" },
  { key: "brown", label: "Brown", color: "#78350F" },
  { key: "green", label: "Green", color: "#15803D" },
  { key: "black", label: "Black", color: "#1C1917" },
  { key: "red", label: "Red", color: "#DC2626" },
  { key: "white", label: "White/Pale", color: "#D1D5DB" },
] as const;

const CONSISTENCIES = [
  { key: "liquid", label: "Liquid" },
  { key: "mushy", label: "Mushy" },
  { key: "soft", label: "Soft" },
  { key: "formed", label: "Formed" },
  { key: "hard", label: "Hard" },
] as const;

export function DiaperLogger() {
  const { data: babies } = useBabies();
  const baby = babies?.[0];
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);

  // For wet/dry, save immediately. For dirty/both, show details.
  const [diaperType, setDiaperType] = useState<DiaperType | null>(null);
  const [poopColor, setPoopColor] = useState<string | null>(null);
  const [consistency, setConsistency] = useState<string | null>(null);
  const [hasRash, setHasRash] = useState(false);
  const [isBlowout, setIsBlowout] = useState(false);

  async function logDiaper(
    type: DiaperType,
    details?: {
      color?: string;
      consistency?: string;
      rash?: boolean;
      blowout?: boolean;
    }
  ) {
    if (!baby) return;
    setSaving(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;

    const notes = details
      ? JSON.stringify({
          ...(details.color && { color: details.color }),
          ...(details.consistency && { consistency: details.consistency }),
          ...(details.rash && { rash: true }),
          ...(details.blowout && { blowout: true }),
        })
      : null;

    const { error } = await supabase.from("diaper_logs").insert({
      baby_id: baby.id,
      logged_by: session.user.id,
      type,
      logged_at: new Date().toISOString(),
      notes,
    });

    setSaving(false);
    if (error) {
      Alert.alert("Error", error.message);
    } else {
      queryClient.invalidateQueries({ queryKey: ["latest-diaper"] });
      router.back();
    }
  }

  // Step 1: Pick diaper type
  if (!diaperType) {
    return (
      <View>
        <Text className="text-gray-500 mb-4">What kind of diaper?</Text>
        <View className="flex-row flex-wrap gap-3">
          <TouchableOpacity
            className="bg-blue-50 rounded-xl px-6 py-5 items-center flex-1 min-w-[140px]"
            onPress={() => logDiaper("wet")}
            disabled={saving}
          >
            <Text className="text-blue-600 font-semibold text-base">Wet</Text>
            <Text className="text-blue-400 text-xs mt-1">Pee only</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-amber-50 rounded-xl px-6 py-5 items-center flex-1 min-w-[140px]"
            onPress={() => setDiaperType("dirty")}
            disabled={saving}
          >
            <Text className="text-amber-700 font-semibold text-base">
              Dirty
            </Text>
            <Text className="text-amber-500 text-xs mt-1">Poop</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-orange-50 rounded-xl px-6 py-5 items-center flex-1 min-w-[140px]"
            onPress={() => setDiaperType("both")}
            disabled={saving}
          >
            <Text className="text-orange-600 font-semibold text-base">
              Both
            </Text>
            <Text className="text-orange-400 text-xs mt-1">Wet + Poop</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-gray-50 rounded-xl px-6 py-5 items-center flex-1 min-w-[140px]"
            onPress={() => logDiaper("dry")}
            disabled={saving}
          >
            <Text className="text-gray-600 font-semibold text-base">Dry</Text>
            <Text className="text-gray-400 text-xs mt-1">Just a check</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Step 2: Poop details (for dirty or both)
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Text className="text-gray-500 mb-4">
        {diaperType === "dirty" ? "Dirty diaper" : "Wet + dirty diaper"} —
        optional details
      </Text>

      {/* Poop Color */}
      <Text className="text-sm font-medium text-gray-700 mb-2">
        Poop Color
      </Text>
      <View className="flex-row flex-wrap gap-2 mb-5">
        {POOP_COLORS.map((c) => (
          <TouchableOpacity
            key={c.key}
            className={`rounded-lg px-4 py-2.5 flex-row items-center border ${
              poopColor === c.key ? "border-blue-500 bg-blue-50" : "border-gray-200"
            }`}
            onPress={() => setPoopColor(poopColor === c.key ? null : c.key)}
          >
            <View
              className="w-4 h-4 rounded-full mr-2"
              style={{ backgroundColor: c.color }}
            />
            <Text
              className={`text-sm ${poopColor === c.key ? "text-blue-600 font-medium" : "text-gray-600"}`}
            >
              {c.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Consistency */}
      <Text className="text-sm font-medium text-gray-700 mb-2">
        Consistency
      </Text>
      <View className="flex-row flex-wrap gap-2 mb-5">
        {CONSISTENCIES.map((c) => (
          <TouchableOpacity
            key={c.key}
            className={`rounded-lg px-4 py-2.5 border ${
              consistency === c.key
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200"
            }`}
            onPress={() =>
              setConsistency(consistency === c.key ? null : c.key)
            }
          >
            <Text
              className={`text-sm ${consistency === c.key ? "text-blue-600 font-medium" : "text-gray-600"}`}
            >
              {c.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Flags */}
      <View className="bg-gray-50 rounded-xl p-4 mb-5">
        <View className="flex-row items-center justify-between mb-3">
          <View>
            <Text className="text-base font-medium">Diaper Rash</Text>
            <Text className="text-sm text-gray-400">
              Redness or irritation
            </Text>
          </View>
          <Switch value={hasRash} onValueChange={setHasRash} />
        </View>
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-base font-medium">Blowout</Text>
            <Text className="text-sm text-gray-400">
              Leaked out of the diaper
            </Text>
          </View>
          <Switch value={isBlowout} onValueChange={setIsBlowout} />
        </View>
      </View>

      {/* Save */}
      <TouchableOpacity
        className="bg-green-600 rounded-lg py-4 mb-3"
        onPress={() =>
          logDiaper(diaperType, {
            color: poopColor ?? undefined,
            consistency: consistency ?? undefined,
            rash: hasRash || undefined,
            blowout: isBlowout || undefined,
          })
        }
        disabled={saving}
      >
        <Text className="text-white text-center font-semibold text-base">
          {saving ? "Saving..." : "Save"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="py-3 mb-8"
        onPress={() => {
          setDiaperType(null);
          setPoopColor(null);
          setConsistency(null);
          setHasRash(false);
          setIsBlowout(false);
        }}
      >
        <Text className="text-gray-500 text-center">Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
