import { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Alert, ScrollView } from "react-native";
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

  // Step flow: choose → sleeping (timer) → done (confirm wake)
  const [step, setStep] = useState<"choose" | "sleeping" | "manual">("choose");
  const [location, setLocation] = useState<SleepLocation>("crib");
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Timer
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Manual log times
  const [manualStart, setManualStart] = useState(() => new Date());
  const [manualEnd, setManualEnd] = useState(() => new Date());

  // Check for active sleep session
  const isActiveSleep = latestSleep && !latestSleep.ended_at;

  useEffect(() => {
    if (isActiveSleep && step === "choose") {
      setSessionId(latestSleep.id);
      setLocation(latestSleep.location as SleepLocation);
      setStep("sleeping");
    }
  }, [isActiveSleep]);

  // Timer effect
  useEffect(() => {
    if (step === "sleeping") {
      const startTime = isActiveSleep
        ? new Date(latestSleep.started_at).getTime()
        : Date.now();

      setElapsed(Math.floor((Date.now() - startTime) / 1000));

      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [step, sessionId]);

  function formatTimer(secs: number): string {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  async function startSleep(loc: SleepLocation) {
    if (!baby) {
      Alert.alert("Error", "No baby profile found");
      return;
    }
    setSaving(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setSaving(false);
        Alert.alert("Error", "Not signed in");
        return;
      }

      const { data, error } = await supabase
        .from("sleep_logs")
        .insert({
          baby_id: baby.id,
          logged_by: session.user.id,
          started_at: new Date().toISOString(),
          location: loc,
        })
        .select("id")
        .single();

      setSaving(false);
      if (error) {
        Alert.alert("Error", error.message);
      } else {
        setSessionId(data.id);
        setLocation(loc);
        setStep("sleeping");
      }
    } catch (err: unknown) {
      setSaving(false);
      Alert.alert("Error", err instanceof Error ? err.message : "Unknown error");
    }
  }

  async function stopSleep() {
    if (!sessionId) {
      Alert.alert("Error", "No active sleep session found");
      return;
    }
    setSaving(true);

    try {
      const endedAt = new Date().toISOString();

      const { data, error } = await supabase
        .from("sleep_logs")
        .update({ ended_at: endedAt })
        .eq("id", sessionId)
        .select("id")
        .maybeSingle();

      if (timerRef.current) clearInterval(timerRef.current);
      setSaving(false);

      if (error) {
        Alert.alert("Error", error.message);
      } else if (!data) {
        Alert.alert("Error", "Could not update sleep record. Please try again.");
      } else {
        queryClient.invalidateQueries({ queryKey: ["latest-sleep"] });
        queryClient.invalidateQueries({ queryKey: ["recent-activity"] });
        onSuccess ? onSuccess() : router.back();
      }
    } catch (err: unknown) {
      if (timerRef.current) clearInterval(timerRef.current);
      setSaving(false);
      Alert.alert("Error", err instanceof Error ? err.message : "Unknown error");
    }
  }

  async function saveManualSleep() {
    if (!baby) {
      Alert.alert("Error", "No baby profile found");
      return;
    }
    if (manualEnd <= manualStart) {
      Alert.alert("Error", "End time must be after start time");
      return;
    }
    setSaving(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setSaving(false);
        Alert.alert("Error", "Not signed in");
        return;
      }

      const { error } = await supabase.from("sleep_logs").insert({
        baby_id: baby.id,
        logged_by: session.user.id,
        started_at: manualStart.toISOString(),
        ended_at: manualEnd.toISOString(),
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
    } catch (err: unknown) {
      setSaving(false);
      Alert.alert("Error", err instanceof Error ? err.message : "Unknown error");
    }
  }

  // Step 1: Choose location + start or manual
  if (step === "choose") {
    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text className="text-ash mb-4">Where are they sleeping?</Text>
        <View className="flex-row flex-wrap gap-2 mb-6">
          {LOCATIONS.map((loc) => (
            <TouchableOpacity
              key={loc.key}
              className={`px-4 py-3 rounded-2xl border flex-1 min-w-[90px] items-center ${
                location === loc.key
                  ? "bg-amber border-amber"
                  : "bg-navy-card border-navy-border"
              }`}
              onPress={() => setLocation(loc.key)}
            >
              <Text
                className={`text-sm font-body-medium ${
                  location === loc.key ? "text-midnight" : "text-ash"
                }`}
              >
                {loc.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          className="bg-amber rounded-2xl py-4 mb-4"
          onPress={() => startSleep(location)}
          disabled={saving}
        >
          <Text className="text-midnight text-center font-body-semibold text-base">
            {saving ? "Starting..." : "Start Sleep Timer"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="border border-navy-border rounded-2xl py-4"
          onPress={() => setStep("manual")}
        >
          <Text className="text-ash text-center font-body-medium text-base">
            Log a Past Sleep
          </Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // Step: Manual log (past sleep)
  if (step === "manual") {
    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text className="text-ash mb-4">Where did they sleep?</Text>
        <View className="flex-row flex-wrap gap-2 mb-4">
          {LOCATIONS.map((loc) => (
            <TouchableOpacity
              key={loc.key}
              className={`px-4 py-3 rounded-2xl border flex-1 min-w-[90px] items-center ${
                location === loc.key
                  ? "bg-amber border-amber"
                  : "bg-navy-card border-navy-border"
              }`}
              onPress={() => setLocation(loc.key)}
            >
              <Text
                className={`text-sm font-body-medium ${
                  location === loc.key ? "text-midnight" : "text-ash"
                }`}
              >
                {loc.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TimePicker value={manualStart} onChange={setManualStart} label="Fell asleep at" />
        <TimePicker value={manualEnd} onChange={setManualEnd} label="Woke up at" />

        <TouchableOpacity
          className="bg-amber rounded-2xl py-4 mb-3"
          onPress={saveManualSleep}
          disabled={saving}
        >
          <Text className="text-midnight text-center font-body-semibold text-base">
            {saving ? "Saving..." : "Save Sleep"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity className="py-3" onPress={() => setStep("choose")}>
          <Text className="text-ash text-center">Back</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // Step 2: Timer running
  return (
    <View className="items-center">
      <Text className="text-ash mb-1">
        Sleeping in {LOCATIONS.find((l) => l.key === location)?.label}
      </Text>
      <Text className="text-5xl mb-2 font-mono-bold text-white" style={{ letterSpacing: -1, lineHeight: 60 }}>
        {formatTimer(elapsed)}
      </Text>
      <Text className="text-ash mb-8">Sleeping...</Text>

      <TouchableOpacity
        className="bg-amber rounded-2xl py-4 px-12"
        onPress={stopSleep}
        disabled={saving}
      >
        <Text className="text-midnight font-body-semibold text-base">
          {saving ? "Saving..." : "Woke Up"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
