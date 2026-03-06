import { useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";
import { useBabies, useLatestSleep } from "../../lib/queries";
import { TimePicker } from "./TimePicker";

const LOCATIONS = [
  { key: "crib", label: "Crib" },
  { key: "bassinet", label: "Bassinet" },
  { key: "stroller", label: "Stroller" },
  { key: "car", label: "Car" },
  { key: "arms", label: "Arms" },
] as const;

type SleepLocation = (typeof LOCATIONS)[number]["key"];

interface SleepLoggerProps {
  onSuccess?: () => void;
}

export function SleepLogger({ onSuccess }: SleepLoggerProps) {
  const { data: babies } = useBabies();
  const baby = babies?.[0];
  const { data: latestSleep } = useLatestSleep(baby?.id);
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [sleepTime, setSleepTime] = useState(() => new Date());
  const [wakeTime, setWakeTime] = useState(() => new Date());

  const isSleeping = latestSleep && !latestSleep.ended_at;

  async function logWakeUp() {
    if (!latestSleep) return;
    setSaving(true);

    const { error } = await supabase
      .from("sleep_logs")
      .update({ ended_at: wakeTime.toISOString() })
      .eq("id", latestSleep.id);

    setSaving(false);
    if (error) {
      Alert.alert("Error", error.message);
    } else {
      queryClient.invalidateQueries({ queryKey: ["latest-sleep"] });
      queryClient.invalidateQueries({ queryKey: ["recent-activity"] });
      onSuccess ? onSuccess() : router.back();
    }
  }

  async function logFellAsleep(location: SleepLocation) {
    if (!baby) return;
    setSaving(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setSaving(false);
      Alert.alert("Error", "Not signed in");
      return;
    }

    const { error } = await supabase.from("sleep_logs").insert({
      baby_id: baby.id,
      logged_by: session.user.id,
      started_at: sleepTime.toISOString(),
      location,
    });

    setSaving(false);
    if (error) {
      Alert.alert("Error", error.message);
    } else {
      queryClient.invalidateQueries({ queryKey: ["latest-sleep"] });
      queryClient.invalidateQueries({ queryKey: ["recent-activity"] });
      onSuccess ? onSuccess() : router.back();
    }
  }

  if (isSleeping) {
    const sleepStart = new Date(latestSleep.started_at);
    const mins = Math.floor((Date.now() - sleepStart.getTime()) / 60000);

    return (
      <View className="items-center">
        <Text className="text-ash mb-2">Currently sleeping</Text>
        <Text className="text-4xl font-mono-bold text-white mb-1" style={{ letterSpacing: -1 }}>
          {Math.floor(mins / 60)}h {mins % 60}m
        </Text>
        <Text className="text-ash mb-4">
          in {latestSleep.location}
        </Text>

        <View className="w-full mb-4">
          <TimePicker value={wakeTime} onChange={setWakeTime} label="Woke up at" />
        </View>

        <TouchableOpacity
          className="bg-amber rounded-2xl py-4 px-8"
          onPress={logWakeUp}
          disabled={saving}
        >
          <Text className="text-midnight font-body-semibold text-base">
            {saving ? "Saving..." : "Woke Up"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View>
      <TimePicker value={sleepTime} onChange={setSleepTime} label="Fell asleep at" />

      <Text className="text-ash mb-4">Where did they fall asleep?</Text>
      <View className="flex-row flex-wrap gap-3">
        {LOCATIONS.map((loc) => (
          <TouchableOpacity
            key={loc.key}
            className="bg-navy-card border border-navy-border rounded-2xl px-6 py-5 items-center flex-1 min-w-[140px]"
            onPress={() => logFellAsleep(loc.key)}
            disabled={saving}
          >
            <Text className="text-amber font-body-semibold text-base">
              {loc.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
