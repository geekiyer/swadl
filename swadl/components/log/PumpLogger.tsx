import { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, TextInput, Alert } from "react-native";
import { router } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";
import { useBabies, useLatestPump } from "../../lib/queries";
import { useUnitStore, parseInputToOz } from "../../lib/store";
import { UnitToggle } from "../UnitToggle";
import { colors } from "../../constants/theme";
import { useThemeColors } from "../../lib/theme";

const PUMP_TYPES = [
  { key: "manual", label: "Manual" },
  { key: "electric_single", label: "Electric (Single)" },
  { key: "electric_double", label: "Electric (Double)" },
  { key: "haakaa", label: "Haakaa" },
] as const;

const SIDES = [
  { key: "left", label: "Left" },
  { key: "right", label: "Right" },
  { key: "both", label: "Both" },
] as const;

type PumpType = (typeof PUMP_TYPES)[number]["key"];
type Side = (typeof SIDES)[number]["key"];

interface PumpLoggerProps {
  onSuccess?: () => void;
}

export function PumpLogger({ onSuccess }: PumpLoggerProps) {
  const tc = useThemeColors();
  const { data: babies } = useBabies();
  const baby = babies?.[0];
  const { data: latestPump } = useLatestPump(baby?.id);
  const queryClient = useQueryClient();
  const unit = useUnitStore((s) => s.unit);
  const [saving, setSaving] = useState(false);

  // Setup flow
  const [step, setStep] = useState<"setup" | "pumping" | "done">("setup");
  const [pumpType, setPumpType] = useState<PumpType>("electric_double");
  const [side, setSide] = useState<Side>("both");

  // Timer
  const [elapsed, setElapsed] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // End form — separate left/right amounts
  const [leftAmount, setLeftAmount] = useState("");
  const [rightAmount, setRightAmount] = useState("");
  const [notes, setNotes] = useState("");

  // Check for active pump session
  const isActivePump = latestPump && !latestPump.ended_at;

  useEffect(() => {
    if (isActivePump && step === "setup") {
      setSessionId(latestPump.id);
      setPumpType(latestPump.pump_type);
      setSide(latestPump.side);
      setStep("pumping");
    }
  }, [isActivePump]);

  // Timer effect
  useEffect(() => {
    if (step === "pumping") {
      const startTime = isActivePump
        ? new Date(latestPump.started_at).getTime()
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
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  async function startPumping() {
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

    const { data, error } = await supabase
      .from("pump_logs")
      .insert({
        baby_id: baby.id,
        logged_by: session.user.id,
        started_at: new Date().toISOString(),
        pump_type: pumpType,
        side,
      })
      .select("id")
      .single();

    setSaving(false);
    if (error) {
      Alert.alert("Error", error.message);
    } else {
      setSessionId(data.id);
      setStep("pumping");
    }
  }

  async function stopPumping() {
    setStep("done");
    if (timerRef.current) clearInterval(timerRef.current);
  }

  async function savePumpSession() {
    if (!sessionId) return;
    setSaving(true);

    const leftOz = leftAmount.trim() ? parseInputToOz(leftAmount, unit) : 0;
    const rightOz = rightAmount.trim() ? parseInputToOz(rightAmount, unit) : 0;
    const totalOz = leftOz + rightOz;

    const updates: Record<string, unknown> = {
      ended_at: new Date().toISOString(),
    };
    if (totalOz > 0) {
      updates.amount_oz = Math.round(totalOz * 10) / 10;
    }

    // Store left/right breakdown as readable text
    const noteParts: string[] = [];
    if (leftOz > 0) noteParts.push(`Left: ${Math.round(leftOz * 10) / 10} oz`);
    if (rightOz > 0) noteParts.push(`Right: ${Math.round(rightOz * 10) / 10} oz`);
    if (notes.trim()) noteParts.push(notes.trim());
    if (noteParts.length > 0) {
      updates.notes = noteParts.join(", ");
    }

    const { error } = await supabase
      .from("pump_logs")
      .update(updates)
      .eq("id", sessionId);

    setSaving(false);
    if (error) {
      Alert.alert("Error", error.message);
    } else {
      queryClient.invalidateQueries({ queryKey: ["latest-pump"] });
      queryClient.invalidateQueries({ queryKey: ["recent-activity"] });
      onSuccess ? onSuccess() : router.back();
    }
  }

  // Step 1: Choose pump type and side
  if (step === "setup") {
    return (
      <View>
        <Text className="text-[13px] font-body-bold text-text-secondary uppercase mb-2">
          Pump Type
        </Text>
        <View className="flex-row flex-wrap gap-2 mb-5">
          {PUMP_TYPES.map((pt) => (
            <TouchableOpacity
              key={pt.key}
              className={`px-4 py-3 rounded-2xl border flex-1 min-w-[140px] items-center ${
                pumpType === pt.key
                  ? "bg-pump-primary border-pump-primary"
                  : "bg-card-bg border-border-main"
              }`}
              onPress={() => setPumpType(pt.key)}
            >
              <Text
                className={`text-base font-body-medium ${
                  pumpType === pt.key ? "text-text-primary" : "text-text-secondary"
                }`}
              >
                {pt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text className="text-[13px] font-body-bold text-text-secondary uppercase mb-2">
          Side
        </Text>
        <View className="flex-row gap-2 mb-8">
          {SIDES.map((s) => (
            <TouchableOpacity
              key={s.key}
              className={`px-4 py-3 rounded-2xl border flex-1 items-center ${
                side === s.key
                  ? "bg-pump-primary border-pump-primary"
                  : "bg-card-bg border-border-main"
              }`}
              onPress={() => setSide(s.key)}
            >
              <Text
                className={`text-base font-body-medium ${
                  side === s.key ? "text-text-primary" : "text-text-secondary"
                }`}
              >
                {s.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          className="bg-feed-primary rounded-2xl py-4"
          onPress={startPumping}
          disabled={saving}
        >
          <Text className="text-center font-body-semibold text-base" style={{ color: colors.textDark }}>
            {saving ? "Starting..." : "Start Pumping"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Step 2: Timer running
  if (step === "pumping") {
    return (
      <View className="items-center">
        <Text className="text-text-secondary mb-1">
          {PUMP_TYPES.find((p) => p.key === pumpType)?.label} ·{" "}
          {SIDES.find((s) => s.key === side)?.label}
        </Text>
        <Text className="text-5xl mb-2 font-mono-bold text-text-primary" style={{ letterSpacing: -1, lineHeight: 60 }}>
          {formatTimer(elapsed)}
        </Text>
        <Text className="text-text-secondary mb-8">Pumping...</Text>

        <TouchableOpacity
          className="bg-pump-primary rounded-2xl py-4 px-12"
          onPress={stopPumping}
        >
          <Text className="text-text-primary font-body-semibold text-base">
            Stop Pumping
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="py-3 mt-3"
          onPress={async () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (sessionId) {
              await supabase.from("pump_logs").delete().eq("id", sessionId);
              queryClient.invalidateQueries({ queryKey: ["latest-pump"] });
            }
            router.back();
          }}
        >
          <Text className="text-text-secondary text-center text-base">Discard</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Step 3: Enter amounts and save
  const showBothSides = side === "both";

  return (
    <View>
      <View className="items-center mb-4">
        <Text className="text-text-secondary mb-1">Session Complete</Text>
        <Text className="text-3xl font-mono-bold text-text-primary" style={{ letterSpacing: -1, lineHeight: 40 }}>{formatTimer(elapsed)}</Text>
      </View>

      <UnitToggle />

      {showBothSides ? (
        <View className="flex-row gap-3 mt-3 mb-4">
          <View className="flex-1">
            <Text className="text-[13px] font-body-bold text-text-secondary uppercase mb-1">
              Left ({unit})
            </Text>
            <TextInput
              className="border border-border-main bg-raised-bg rounded-xl px-4 py-3 text-base text-text-primary"
              placeholder="0"
              placeholderTextColor={tc.textSecondary}
              value={leftAmount}
              onChangeText={setLeftAmount}
              keyboardType="decimal-pad"
              autoFocus
            />
          </View>
          <View className="flex-1">
            <Text className="text-[13px] font-body-bold text-text-secondary uppercase mb-1">
              Right ({unit})
            </Text>
            <TextInput
              className="border border-border-main bg-raised-bg rounded-xl px-4 py-3 text-base text-text-primary"
              placeholder="0"
              placeholderTextColor={tc.textSecondary}
              value={rightAmount}
              onChangeText={setRightAmount}
              keyboardType="decimal-pad"
            />
          </View>
        </View>
      ) : (
        <View className="mt-3 mb-4">
          <Text className="text-[13px] font-body-bold text-text-secondary uppercase mb-1">
            Amount ({unit})
          </Text>
          <TextInput
            className="border border-border-main bg-raised-bg rounded-xl px-4 py-3 text-base text-text-primary"
            placeholder="e.g. 4.5"
            placeholderTextColor={tc.textSecondary}
            value={side === "left" ? leftAmount : rightAmount}
            onChangeText={side === "left" ? setLeftAmount : setRightAmount}
            keyboardType="decimal-pad"
            autoFocus
          />
        </View>
      )}

      <Text className="text-[13px] font-body-bold text-text-secondary uppercase mb-1">
        Notes (optional)
      </Text>
      <TextInput
        className="border border-border-main bg-raised-bg rounded-xl px-4 py-3 mb-6 text-base text-text-primary"
        placeholder="e.g. letdown took longer than usual"
        placeholderTextColor={tc.textSecondary}
        value={notes}
        onChangeText={setNotes}
        multiline
      />

      <TouchableOpacity
        className="bg-feed-primary rounded-2xl py-4 mb-3"
        onPress={savePumpSession}
        disabled={saving}
      >
        <Text className="text-center font-body-semibold text-base" style={{ color: colors.textDark }}>
          {saving ? "Saving..." : "Save"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="py-3"
        onPress={async () => {
          if (sessionId) {
            await supabase.from("pump_logs").delete().eq("id", sessionId);
            queryClient.invalidateQueries({ queryKey: ["latest-pump"] });
          }
          router.back();
        }}
      >
        <Text className="text-text-secondary text-center">Discard</Text>
      </TouchableOpacity>
    </View>
  );
}
