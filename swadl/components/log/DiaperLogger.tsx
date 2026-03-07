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
import { TimePicker } from "./TimePicker";
import { useThemeColors } from "../../lib/theme";

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

interface DiaperLoggerProps {
  onSuccess?: () => void;
}

export function DiaperLogger({ onSuccess }: DiaperLoggerProps) {
  const tc = useThemeColors();
  const { data: babies } = useBabies();
  const baby = babies?.[0];
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);

  const [diaperType, setDiaperType] = useState<DiaperType | null>(null);
  const [logTime, setLogTime] = useState(() => new Date());
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
    if (!session) {
      setSaving(false);
      Alert.alert("Error", "Not signed in");
      return;
    }

    const noteParts: string[] = [];
    if (details?.color) noteParts.push(`Color: ${details.color}`);
    if (details?.consistency) noteParts.push(details.consistency);
    if (details?.rash) noteParts.push("Rash");
    if (details?.blowout) noteParts.push("Blowout");
    const notes = noteParts.length > 0 ? noteParts.join(", ") : null;

    const { error } = await supabase.from("diaper_logs").insert({
      baby_id: baby.id,
      logged_by: session.user.id,
      type,
      logged_at: logTime.toISOString(),
      notes,
    });

    setSaving(false);
    if (error) {
      Alert.alert("Error", error.message);
    } else {
      queryClient.invalidateQueries({ queryKey: ["latest-diaper"] });
      queryClient.invalidateQueries({ queryKey: ["recent-activity"] });
      onSuccess ? onSuccess() : router.back();
    }
  }

  // Step 1: Pick diaper type
  if (!diaperType) {
    return (
      <View>
        <TimePicker value={logTime} onChange={setLogTime} />

        <Text className="text-ash mb-4">What kind of diaper?</Text>
        <View className="flex-row flex-wrap gap-3">
          <TouchableOpacity
            className="bg-navy-card border border-navy-border rounded-2xl px-6 py-5 items-center flex-1 min-w-[140px]"
            onPress={() => logDiaper("wet")}
            disabled={saving}
          >
            <Text className="text-amber font-body-semibold text-base">Wet</Text>
            <Text className="text-ash text-xs mt-1">Pee only</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-navy-card border border-navy-border rounded-2xl px-6 py-5 items-center flex-1 min-w-[140px]"
            onPress={() => setDiaperType("dirty")}
            disabled={saving}
          >
            <Text className="text-honey font-body-semibold text-base">
              Dirty
            </Text>
            <Text className="text-ash text-xs mt-1">Poop</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-navy-card border border-navy-border rounded-2xl px-6 py-5 items-center flex-1 min-w-[140px]"
            onPress={() => setDiaperType("both")}
            disabled={saving}
          >
            <Text className="text-ember font-body-semibold text-base">
              Both
            </Text>
            <Text className="text-ash text-xs mt-1">Wet + Poop</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-navy-card border border-navy-border rounded-2xl px-6 py-5 items-center flex-1 min-w-[140px]"
            onPress={() => logDiaper("dry")}
            disabled={saving}
          >
            <Text className="text-ash font-body-semibold text-base">Dry</Text>
            <Text className="text-ash text-xs mt-1">Just a check</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Step 2: Poop details (for dirty or both)
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Text className="text-ash mb-4">
        {diaperType === "dirty" ? "Dirty diaper" : "Wet + dirty diaper"} —
        optional details
      </Text>

      {/* Poop Color */}
      <Text className="text-[11px] font-body-bold text-ash uppercase mb-2">
        Poop Color
      </Text>
      <View className="flex-row flex-wrap gap-2 mb-5">
        {POOP_COLORS.map((c) => (
          <TouchableOpacity
            key={c.key}
            className={`rounded-xl px-4 py-2.5 flex-row items-center border ${
              poopColor === c.key ? "border-amber bg-navy-raise" : "border-navy-border bg-navy-card"
            }`}
            onPress={() => setPoopColor(poopColor === c.key ? null : c.key)}
          >
            <View
              className="w-4 h-4 rounded-full mr-2"
              style={{ backgroundColor: c.color }}
            />
            <Text
              className={`text-sm ${poopColor === c.key ? "text-amber font-body-medium" : "text-ash"}`}
            >
              {c.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Consistency */}
      <Text className="text-[11px] font-body-bold text-ash uppercase mb-2">
        Consistency
      </Text>
      <View className="flex-row flex-wrap gap-2 mb-5">
        {CONSISTENCIES.map((c) => (
          <TouchableOpacity
            key={c.key}
            className={`rounded-xl px-4 py-2.5 border ${
              consistency === c.key
                ? "border-amber bg-navy-raise"
                : "border-navy-border bg-navy-card"
            }`}
            onPress={() =>
              setConsistency(consistency === c.key ? null : c.key)
            }
          >
            <Text
              className={`text-sm ${consistency === c.key ? "text-amber font-body-medium" : "text-ash"}`}
            >
              {c.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Flags */}
      <View className="bg-navy-card border border-navy-border rounded-2xl p-4 mb-5">
        <View className="flex-row items-center justify-between mb-3">
          <View>
            <Text className="text-base font-body-medium text-white">Diaper Rash</Text>
            <Text className="text-sm text-ash">
              Redness or irritation
            </Text>
          </View>
          <Switch
            value={hasRash}
            onValueChange={setHasRash}
            trackColor={{ false: tc.navyBorder, true: tc.amber }}
            thumbColor="#FFFFFF"
          />
        </View>
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-base font-body-medium text-white">Blowout</Text>
            <Text className="text-sm text-ash">
              Leaked out of the diaper
            </Text>
          </View>
          <Switch
            value={isBlowout}
            onValueChange={setIsBlowout}
            trackColor={{ false: tc.navyBorder, true: tc.amber }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      {/* Save */}
      <TouchableOpacity
        className="bg-amber rounded-2xl py-4 mb-3"
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
        <Text className="text-midnight text-center font-body-semibold text-base">
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
        <Text className="text-ash text-center">Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
