import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  FlatList,
} from "react-native";
import { router } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";
import { useBabies } from "../../lib/queries";
import { FORMULA_BRANDS } from "../../constants/formula-brands";
import {
  useUnitStore,
  useFormulaBrandStore,
  useBreastSessionStore,
  parseInputToOz,
  type BreastSide,
} from "../../lib/store";
import { UnitToggle } from "../UnitToggle";
import { TimePicker } from "./TimePicker";
import { colors } from "../../constants/theme";
import { useThemeColors } from "../../lib/theme";

type FeedCategory = "breastfeed" | "bottle";
type BottleContent = "formula" | "breastmilk";

interface FeedLoggerProps {
  onSuccess?: () => void;
}

export function FeedLogger({ onSuccess }: FeedLoggerProps) {
  const tc = useThemeColors();
  const { data: babies } = useBabies();
  const baby = babies?.[0];
  const queryClient = useQueryClient();

  // Persisted breastfeed session
  const breastSession = useBreastSessionStore((s) => s.session);
  const startBreastSession = useBreastSessionStore((s) => s.start);
  const switchBreastSide = useBreastSessionStore((s) => s.switchSide);
  const clearBreastSession = useBreastSessionStore((s) => s.clear);

  // Auto-resume: if there's an active breast session, go straight to breastfeed
  const [category, setCategory] = useState<FeedCategory | null>(
    breastSession ? "breastfeed" : null
  );

  // Breastfeed timer (derived from persisted session)
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Bottle state
  const [bottleContent, setBottleContent] = useState<BottleContent | null>(null);
  const lastBrand = useFormulaBrandStore((s) => s.lastBrand);
  const setLastBrand = useFormulaBrandStore((s) => s.setLastBrand);
  const [formulaBrand, setFormulaBrand] = useState<string | null>(lastBrand);
  const [brandSearch, setBrandSearch] = useState("");
  const [amountOz, setAmountOz] = useState("");
  const [bottleTime, setBottleTime] = useState(() => new Date());

  const unit = useUnitStore((s) => s.unit);
  const [saving, setSaving] = useState(false);

  // Keep timer in sync with persisted session
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    if (breastSession) {
      const startMs = new Date(breastSession.startedAt).getTime();
      setElapsed(Math.floor((Date.now() - startMs) / 1000));
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startMs) / 1000));
      }, 1000);
    } else {
      setElapsed(0);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [breastSession?.startedAt]);

  function formatElapsed(secs: number) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }

  function resetAll() {
    clearBreastSession();
    setCategory(null);
    setBottleContent(null);
    setFormulaBrand(null);
    setBrandSearch("");
    setAmountOz("");
    setElapsed(0);
    setBottleTime(new Date());
  }

  async function saveBreast() {
    if (!baby || !breastSession) return;
    setSaving(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      setSaving(false);
      Alert.alert("Error", "Not signed in");
      return;
    }

    const durationSec = Math.floor(
      (Date.now() - new Date(breastSession.startedAt).getTime()) / 1000
    );

    const { error } = await supabase.from("feed_logs").insert({
      baby_id: baby.id,
      logged_by: session.user.id,
      type: breastSession.side,
      duration_min: durationSec > 0 ? Math.ceil(durationSec / 60) : null,
      started_at: breastSession.startedAt,
    });

    setSaving(false);
    if (error) {
      Alert.alert("Error", error.message);
    } else {
      clearBreastSession();
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["latest-feed"] }),
        queryClient.invalidateQueries({ queryKey: ["recent-activity"] }),
        queryClient.invalidateQueries({ queryKey: ["log-history"] }),
      ]);
      onSuccess ? onSuccess() : router.back();
    }
  }

  function handleDiscardSession() {
    Alert.alert(
      "Discard Session",
      "This will discard the current breastfeeding timer. Are you sure?",
      [
        { text: "Keep Timing", style: "cancel" },
        { text: "Discard", style: "destructive", onPress: resetAll },
      ]
    );
  }

  async function saveBottle() {
    if (!baby || !bottleContent) return;
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
    if (bottleContent === "formula") {
      noteParts.push(formulaBrand ? `Formula: ${formulaBrand}` : "Formula");
    } else {
      noteParts.push("Breastmilk");
    }

    const { error } = await supabase.from("feed_logs").insert({
      baby_id: baby.id,
      logged_by: session.user.id,
      type: "bottle",
      amount_oz: amountOz ? parseInputToOz(amountOz, unit) : null,
      started_at: bottleTime.toISOString(),
      notes: noteParts.join(""),
    });

    setSaving(false);
    if (error) {
      Alert.alert("Error", error.message);
    } else {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["latest-feed"] }),
        queryClient.invalidateQueries({ queryKey: ["recent-activity"] }),
        queryClient.invalidateQueries({ queryKey: ["log-history"] }),
      ]);
      onSuccess ? onSuccess() : router.back();
    }
  }

  // Step 1: Breastfeed or Bottle
  if (!category) {
    return (
      <View className="gap-3">
        <TouchableOpacity
          className="bg-card-bg border border-border-main rounded-2xl px-6 py-6 items-center"
          onPress={() => setCategory("breastfeed")}
        >
          <Text className="text-feed-primary font-body-bold text-lg">Breastfeed</Text>
          <Text className="text-text-secondary text-base mt-1">
            Timer for left or right
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-card-bg border border-border-main rounded-2xl px-6 py-6 items-center"
          onPress={() => setCategory("bottle")}
        >
          <Text className="text-pump-primary font-body-bold text-lg">Bottle</Text>
          <Text className="text-text-secondary text-base mt-1">
            Formula or breastmilk
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Breastfeed flow — single screen with Left/Right toggle + timer
  if (category === "breastfeed") {
    const activeSide = breastSession?.side ?? null;
    const isTimerRunning = !!breastSession;

    return (
      <View>
        {/* Side selector */}
        <Text className="text-text-secondary mb-3">
          {isTimerRunning ? "Feeding on" : "Which side?"}
        </Text>
        <View className="flex-row gap-3 mb-6">
          <TouchableOpacity
            className={`rounded-2xl px-6 py-4 items-center flex-1 border ${
              activeSide === "breast_left"
                ? "bg-feed-primary border-feed-primary"
                : "bg-card-bg border-border-main"
            }`}
            onPress={() => {
              if (isTimerRunning) {
                switchBreastSide("breast_left");
              } else {
                startBreastSession("breast_left");
              }
            }}
          >
            <Text
              className={`font-body-semibold text-base ${
                activeSide === "breast_left" ? "" : "text-text-secondary"
              }`}
              style={activeSide === "breast_left" ? { color: colors.textDark } : undefined}
            >
              Left
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`rounded-2xl px-6 py-4 items-center flex-1 border ${
              activeSide === "breast_right"
                ? "bg-feed-primary border-feed-primary"
                : "bg-card-bg border-border-main"
            }`}
            onPress={() => {
              if (isTimerRunning) {
                switchBreastSide("breast_right");
              } else {
                startBreastSession("breast_right");
              }
            }}
          >
            <Text
              className={`font-body-semibold text-base ${
                activeSide === "breast_right" ? "" : "text-text-secondary"
              }`}
              style={activeSide === "breast_right" ? { color: colors.textDark } : undefined}
            >
              Right
            </Text>
          </TouchableOpacity>
        </View>

        {/* Timer display */}
        <View className="items-center mb-6">
          <Text className="text-5xl mb-2 font-mono-bold text-text-primary" style={{ letterSpacing: -1, lineHeight: 60 }}>
            {formatElapsed(elapsed)}
          </Text>
          {isTimerRunning && (
            <Text className="text-text-secondary">
              {activeSide === "breast_left" ? "Left breast" : "Right breast"}
            </Text>
          )}
        </View>

        {/* Save button (only when timer is running) */}
        {isTimerRunning && (
          <TouchableOpacity
            className="bg-feed-primary rounded-2xl py-4 mb-3"
            onPress={saveBreast}
            disabled={saving}
          >
            <Text className="text-center font-body-semibold text-base" style={{ color: colors.textDark }}>
              {saving ? "Saving..." : `Save — ${formatElapsed(elapsed)}`}
            </Text>
          </TouchableOpacity>
        )}

        {/* Discard / Back */}
        <TouchableOpacity className="py-3" onPress={isTimerRunning ? handleDiscardSession : resetAll}>
          <Text className="text-text-secondary text-center">
            {isTimerRunning ? "Discard" : "Back"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Bottle flow
  if (category === "bottle") {
    // Step B1: Pick content type
    if (!bottleContent) {
      return (
        <View>
          <Text className="text-text-secondary mb-4">What's in the bottle?</Text>
          <View className="flex-row gap-3 mb-4">
            <TouchableOpacity
              className="bg-card-bg border border-border-main rounded-2xl px-6 py-5 items-center flex-1"
              onPress={() => setBottleContent("formula")}
            >
              <Text className="text-pump-primary font-body-semibold text-base">
                Formula
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-card-bg border border-border-main rounded-2xl px-6 py-5 items-center flex-1"
              onPress={() => setBottleContent("breastmilk")}
            >
              <Text className="text-pump-primary font-body-semibold text-base">
                Breastmilk
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity className="mt-2 py-3" onPress={resetAll}>
            <Text className="text-text-secondary text-center">Back</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Step B2: Pick formula brand (formula only)
    if (bottleContent === "formula" && !formulaBrand) {
      const filtered = brandSearch.length >= 1
        ? FORMULA_BRANDS.filter((b) =>
            b.toLowerCase().includes(brandSearch.toLowerCase())
          )
        : [];

      return (
        <View className="flex-1">
          <Text className="text-text-secondary mb-3">Type to search formula brand</Text>
          <TextInput
            className="border border-border-main bg-raised-bg rounded-xl px-4 py-3 mb-3 text-base text-text-primary"
            placeholder="Start typing brand name..."
            placeholderTextColor={tc.textSecondary}
            value={brandSearch}
            onChangeText={setBrandSearch}
            autoFocus
          />
          {brandSearch.length >= 1 && (
            <FlatList
              data={filtered}
              keyExtractor={(item) => item}
              keyboardShouldPersistTaps="handled"
              style={{ maxHeight: 350 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className="py-3 px-2 border-b border-border-main"
                  onPress={() => {
                    setFormulaBrand(item);
                    setLastBrand(item);
                    setBrandSearch("");
                  }}
                >
                  <Text className="text-base text-text-primary">{item}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text className="text-text-secondary text-center py-4">
                  No brands found
                </Text>
              }
            />
          )}
          <TouchableOpacity
            className="mt-3 py-3"
            onPress={() => setBottleContent(null)}
          >
            <Text className="text-text-secondary text-center">Back</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Step B3: Enter amount + time
    return (
      <View>
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-base text-text-secondary">
            {bottleContent === "formula"
              ? `Formula - ${formulaBrand}`
              : "Breastmilk"}{" "}
            bottle
          </Text>
          <UnitToggle />
        </View>

        <Text className="text-[13px] font-body-bold text-text-secondary uppercase mb-2">
          Amount ({unit})
        </Text>
        <TextInput
          className="border border-border-main bg-raised-bg rounded-xl px-4 py-3 mb-4 text-base text-text-primary"
          placeholder={unit === "oz" ? "e.g. 4" : "e.g. 120"}
          placeholderTextColor={tc.textSecondary}
          value={amountOz}
          onChangeText={setAmountOz}
          keyboardType="decimal-pad"
          autoFocus
        />

        <TimePicker value={bottleTime} onChange={setBottleTime} />

        <TouchableOpacity
          className={`rounded-xl py-4 ${amountOz ? "bg-feed-primary" : "bg-raised-bg border border-border-main"}`}
          onPress={saveBottle}
          disabled={!amountOz || saving}
        >
          <Text
            className={`text-center font-body-semibold text-base ${amountOz ? "" : "text-text-secondary"}`}
            style={amountOz ? { color: colors.textDark } : undefined}
          >
            {saving ? "Saving..." : "Save"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="mt-4 py-3"
          onPress={() => {
            if (bottleContent === "formula") {
              setFormulaBrand(null);
            } else {
              setBottleContent(null);
            }
            setAmountOz("");
          }}
        >
          <Text className="text-text-secondary text-center">
            {bottleContent === "formula" ? "Change brand" : "Change type"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return null;
}
