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
import { useUnitStore, useFormulaBrandStore, parseInputToOz } from "../../lib/store";
import { UnitToggle } from "../UnitToggle";
import { TimePicker } from "./TimePicker";
import { colors } from "../../constants/theme";

type FeedCategory = "breastfeed" | "bottle";
type BreastSide = "breast_left" | "breast_right";
type BottleContent = "formula" | "breastmilk";

interface FeedLoggerProps {
  onSuccess?: () => void;
}

export function FeedLogger({ onSuccess }: FeedLoggerProps) {
  const { data: babies } = useBabies();
  const baby = babies?.[0];
  const queryClient = useQueryClient();

  const [category, setCategory] = useState<FeedCategory | null>(null);

  // Breastfeed state
  const [side, setSide] = useState<BreastSide | null>(null);
  const [timing, setTiming] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const startTime = useRef<Date | null>(null);
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

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  function startTimer() {
    startTime.current = new Date();
    setTiming(true);
    setElapsed(0);
    timerRef.current = setInterval(() => {
      if (startTime.current) {
        setElapsed(
          Math.floor((Date.now() - startTime.current.getTime()) / 1000)
        );
      }
    }, 1000);
  }

  function stopTimer() {
    if (timerRef.current) clearInterval(timerRef.current);
    setTiming(false);
  }

  function formatElapsed(secs: number) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }

  function resetAll() {
    stopTimer();
    setCategory(null);
    setSide(null);
    setBottleContent(null);
    setFormulaBrand(null);
    setBrandSearch("");
    setAmountOz("");
    setElapsed(0);
    setBottleTime(new Date());
  }

  async function saveBreast() {
    if (!baby || !side) return;
    setSaving(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      setSaving(false);
      Alert.alert("Error", "Not signed in");
      return;
    }

    const { error } = await supabase.from("feed_logs").insert({
      baby_id: baby.id,
      logged_by: session.user.id,
      type: side,
      duration_min: elapsed > 0 ? Math.ceil(elapsed / 60) : null,
      started_at: startTime.current?.toISOString() ?? new Date().toISOString(),
    });

    setSaving(false);
    if (error) {
      Alert.alert("Error", error.message);
    } else {
      queryClient.invalidateQueries({ queryKey: ["latest-feed"] });
      queryClient.invalidateQueries({ queryKey: ["recent-activity"] });
      onSuccess ? onSuccess() : router.back();
    }
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
      queryClient.invalidateQueries({ queryKey: ["latest-feed"] });
      queryClient.invalidateQueries({ queryKey: ["recent-activity"] });
      onSuccess ? onSuccess() : router.back();
    }
  }

  // Step 1: Breastfeed or Bottle
  if (!category) {
    return (
      <View className="gap-3">
        <TouchableOpacity
          className="bg-navy-card border border-navy-border rounded-2xl px-6 py-6 items-center"
          onPress={() => setCategory("breastfeed")}
        >
          <Text className="text-amber font-body-bold text-lg">Breastfeed</Text>
          <Text className="text-ash text-sm mt-1">
            Timer for left or right
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-navy-card border border-navy-border rounded-2xl px-6 py-6 items-center"
          onPress={() => setCategory("bottle")}
        >
          <Text className="text-ember font-body-bold text-lg">Bottle</Text>
          <Text className="text-ash text-sm mt-1">
            Formula or breastmilk
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Breastfeed flow
  if (category === "breastfeed") {
    // Pick side
    if (!side) {
      return (
        <View>
          <Text className="text-ash mb-4">Which side?</Text>
          <View className="flex-row gap-3">
            <TouchableOpacity
              className="bg-navy-card border border-navy-border rounded-2xl px-6 py-5 items-center flex-1"
              onPress={() => {
                setSide("breast_left");
                startTimer();
              }}
            >
              <Text className="text-amber font-body-semibold text-base">
                Left
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-navy-card border border-navy-border rounded-2xl px-6 py-5 items-center flex-1"
              onPress={() => {
                setSide("breast_right");
                startTimer();
              }}
            >
              <Text className="text-amber font-body-semibold text-base">
                Right
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity className="mt-4 py-3" onPress={resetAll}>
            <Text className="text-ash text-center">Back</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Timer running
    return (
      <View>
        <View className="items-center">
          <Text className="text-5xl mb-2 font-mono-bold text-white" style={{ letterSpacing: -1, lineHeight: 60 }}>
            {formatElapsed(elapsed)}
          </Text>
          <Text className="text-ash mb-6">
            {side === "breast_left" ? "Left breast" : "Right breast"}
          </Text>

          {timing ? (
            <TouchableOpacity
              className="bg-ember rounded-2xl px-8 py-4 mb-4"
              onPress={stopTimer}
            >
              <Text className="text-white font-body-semibold text-base">
                Stop Timer
              </Text>
            </TouchableOpacity>
          ) : elapsed > 0 ? (
            <TouchableOpacity
              className="bg-amber rounded-xl py-4 px-8 mb-4"
              onPress={saveBreast}
              disabled={saving}
            >
              <Text className="text-midnight font-body-semibold text-base">
                {saving ? "Saving..." : "Save"}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
        <TouchableOpacity className="mt-2 py-3" onPress={resetAll}>
          <Text className="text-ash text-center">Cancel</Text>
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
          <Text className="text-ash mb-4">What's in the bottle?</Text>
          <View className="flex-row gap-3 mb-4">
            <TouchableOpacity
              className="bg-navy-card border border-navy-border rounded-2xl px-6 py-5 items-center flex-1"
              onPress={() => setBottleContent("formula")}
            >
              <Text className="text-ember font-body-semibold text-base">
                Formula
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-navy-card border border-navy-border rounded-2xl px-6 py-5 items-center flex-1"
              onPress={() => setBottleContent("breastmilk")}
            >
              <Text className="text-ember font-body-semibold text-base">
                Breastmilk
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity className="mt-2 py-3" onPress={resetAll}>
            <Text className="text-ash text-center">Back</Text>
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
          <Text className="text-ash mb-3">Type to search formula brand</Text>
          <TextInput
            className="border border-navy-border bg-navy-raise rounded-xl px-4 py-3 mb-3 text-base text-white"
            placeholder="Start typing brand name..."
            placeholderTextColor={colors.ash}
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
                  className="py-3 px-2 border-b border-navy-border"
                  onPress={() => {
                    setFormulaBrand(item);
                    setLastBrand(item);
                    setBrandSearch("");
                  }}
                >
                  <Text className="text-base text-white">{item}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text className="text-ash text-center py-4">
                  No brands found
                </Text>
              }
            />
          )}
          <TouchableOpacity
            className="mt-3 py-3"
            onPress={() => setBottleContent(null)}
          >
            <Text className="text-ash text-center">Back</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Step B3: Enter amount + time
    return (
      <View>
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-sm text-ash">
            {bottleContent === "formula"
              ? `Formula - ${formulaBrand}`
              : "Breastmilk"}{" "}
            bottle
          </Text>
          <UnitToggle />
        </View>

        <Text className="text-[11px] font-body-bold text-ash uppercase mb-2">
          Amount ({unit})
        </Text>
        <TextInput
          className="border border-navy-border bg-navy-raise rounded-xl px-4 py-3 mb-4 text-base text-white"
          placeholder={unit === "oz" ? "e.g. 4" : "e.g. 120"}
          placeholderTextColor={colors.ash}
          value={amountOz}
          onChangeText={setAmountOz}
          keyboardType="decimal-pad"
          autoFocus
        />

        <TimePicker value={bottleTime} onChange={setBottleTime} />

        <TouchableOpacity
          className={`rounded-xl py-4 ${amountOz ? "bg-amber" : "bg-navy-raise border border-navy-border"}`}
          onPress={saveBottle}
          disabled={!amountOz || saving}
        >
          <Text className={`text-center font-body-semibold text-base ${amountOz ? "text-midnight" : "text-ash"}`}>
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
          <Text className="text-ash text-center">
            {bottleContent === "formula" ? "Change brand" : "Change type"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return null;
}
