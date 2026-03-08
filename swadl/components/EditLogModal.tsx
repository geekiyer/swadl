import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
  ScrollView,
} from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { colors } from "../constants/theme";
import { useThemeColors } from "../lib/theme";
import { useUnitStore, parseInputToOz, ozToMl } from "../lib/store";
import { UnitToggle } from "./UnitToggle";
import { FORMULA_BRANDS } from "../constants/formula-brands";
import type { ActivityItem } from "../lib/queries";

const TABLE_MAP: Record<ActivityItem["kind"], string> = {
  feed: "feed_logs",
  diaper: "diaper_logs",
  sleep: "sleep_logs",
  pump: "pump_logs",
};

const FEED_TYPES = [
  { key: "breast_left", label: "Breast (Left)" },
  { key: "breast_right", label: "Breast (Right)" },
  { key: "bottle", label: "Bottle" },
  { key: "solids", label: "Solids" },
] as const;

const DIAPER_TYPES = [
  { key: "wet", label: "Wet" },
  { key: "dirty", label: "Dirty" },
  { key: "both", label: "Both" },
  { key: "dry", label: "Dry" },
] as const;

const SLEEP_LOCATIONS = [
  { key: "crib", label: "Crib" },
  { key: "bassinet", label: "Bassinet" },
  { key: "co_sleep", label: "Co-sleep" },
  { key: "stroller", label: "Stroller" },
  { key: "car", label: "Car" },
  { key: "arms", label: "Arms" },
] as const;

interface EditLogModalProps {
  item: ActivityItem | null;
  visible: boolean;
  onClose: () => void;
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

export function EditLogModal({ item, visible, onClose }: EditLogModalProps) {
  const tc = useThemeColors();
  const queryClient = useQueryClient();
  const unit = useUnitStore((s) => s.unit);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Feed fields
  const [feedType, setFeedType] = useState("");
  const [amountOz, setAmountOz] = useState("");
  const [durationMin, setDurationMin] = useState("");
  const [bottleContent, setBottleContent] = useState<"formula" | "breastmilk" | "">("");
  const [formulaBrand, setFormulaBrand] = useState("");
  const [brandSearch, setBrandSearch] = useState("");

  // Diaper fields
  const [diaperType, setDiaperType] = useState("");

  // Sleep fields
  const [sleepLocation, setSleepLocation] = useState("");

  // Pump fields
  const [pumpAmountOz, setPumpAmountOz] = useState("");

  // Common
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!item) return;
    const r = item.raw;

    if (item.kind === "feed") {
      setFeedType((r.type as string) ?? "");
      setAmountOz(
        r.amount_oz != null
          ? unit === "ml"
            ? String(ozToMl(r.amount_oz as number))
            : String(r.amount_oz)
          : ""
      );
      setDurationMin(r.duration_min != null ? String(r.duration_min) : "");
      // Parse notes: handle JSON format with bottle content + brand
      const rawNotes = (r.notes as string) ?? "";
      try {
        const parsed = JSON.parse(rawNotes);
        setBottleContent(parsed.content === "formula" || parsed.content === "breastmilk" ? parsed.content : "");
        setFormulaBrand(parsed.brand ?? "");
        setBrandSearch(parsed.brand ?? "");
        setNotes(parsed.text ?? "");
      } catch {
        setBottleContent("");
        setFormulaBrand("");
        setBrandSearch("");
        setNotes(rawNotes);
      }
    } else if (item.kind === "diaper") {
      setDiaperType((r.type as string) ?? "");
      // Parse diaper notes: handle old JSON format
      const rawNotes = (r.notes as string) ?? "";
      try {
        const parsed = JSON.parse(rawNotes);
        const parts: string[] = [];
        if (parsed.color) parts.push(`Color: ${parsed.color}`);
        if (parsed.consistency) parts.push(parsed.consistency);
        if (parsed.rash) parts.push("Rash");
        if (parsed.blowout) parts.push("Blowout");
        setNotes(parts.join(", "));
      } catch {
        setNotes(rawNotes);
      }
    } else if (item.kind === "sleep") {
      setSleepLocation((r.location as string) ?? "");
    } else if (item.kind === "pump") {
      setPumpAmountOz(
        r.amount_oz != null
          ? unit === "ml"
            ? String(ozToMl(r.amount_oz as number))
            : String(r.amount_oz)
          : ""
      );
      // Parse pump notes: handle old JSON format
      const rawNotes = (r.notes as string) ?? "";
      try {
        const parsed = JSON.parse(rawNotes);
        const parts: string[] = [];
        if (parsed.left_oz) parts.push(`Left: ${parsed.left_oz} oz`);
        if (parsed.right_oz) parts.push(`Right: ${parsed.right_oz} oz`);
        if (parsed.text) parts.push(parsed.text);
        setNotes(parts.join(", "));
      } catch {
        setNotes(rawNotes);
      }
    }
  }, [item, unit]);

  if (!item) return null;

  async function handleSave() {
    if (!item) return;
    setSaving(true);

    const table = TABLE_MAP[item.kind];
    let updates: Record<string, unknown> = {};

    if (item.kind === "feed") {
      // Build structured notes for bottle feeds
      let feedNotes: string | null = null;
      if (feedType === "bottle" && bottleContent) {
        const noteObj: Record<string, string> = { content: bottleContent };
        if (bottleContent === "formula" && formulaBrand) noteObj.brand = formulaBrand;
        if (notes.trim()) noteObj.text = notes.trim();
        feedNotes = JSON.stringify(noteObj);
      } else {
        feedNotes = notes.trim() || null;
      }
      updates = {
        type: feedType,
        amount_oz: amountOz.trim() ? parseInputToOz(amountOz, unit) : null,
        duration_min: durationMin.trim() ? parseInt(durationMin, 10) : null,
        notes: feedNotes,
      };
    } else if (item.kind === "diaper") {
      updates = {
        type: diaperType,
        notes: notes.trim() || null,
      };
    } else if (item.kind === "sleep") {
      updates = {
        location: sleepLocation,
      };
    } else if (item.kind === "pump") {
      updates = {
        amount_oz: pumpAmountOz.trim() ? parseInputToOz(pumpAmountOz, unit) : null,
        notes: notes.trim() || null,
      };
    }

    const { error } = await supabase
      .from(table)
      .update(updates)
      .eq("id", item.id);

    setSaving(false);
    if (error) {
      Alert.alert("Error", error.message);
    } else {
      invalidateAll();
      onClose();
    }
  }

  function handleDelete() {
    if (!item) return;
    Alert.alert("Delete Log", "Are you sure you want to delete this entry?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setDeleting(true);
          const table = TABLE_MAP[item.kind];
          const { error } = await supabase
            .from(table)
            .delete()
            .eq("id", item.id);

          setDeleting(false);
          if (error) {
            Alert.alert("Error", error.message);
          } else {
            invalidateAll();
            onClose();
          }
        },
      },
    ]);
  }

  function invalidateAll() {
    queryClient.invalidateQueries({ queryKey: ["recent-activity"] });
    queryClient.invalidateQueries({ queryKey: ["log-history"] });
    queryClient.invalidateQueries({ queryKey: ["latest-feed"] });
    queryClient.invalidateQueries({ queryKey: ["latest-diaper"] });
    queryClient.invalidateQueries({ queryKey: ["latest-sleep"] });
    queryClient.invalidateQueries({ queryKey: ["latest-pump"] });
  }

  function OptionRow({
    options,
    value,
    onChange,
  }: {
    options: readonly { key: string; label: string }[];
    value: string;
    onChange: (v: string) => void;
  }) {
    return (
      <View className="flex-row flex-wrap gap-2 mb-4">
        {options.map((o) => (
          <TouchableOpacity
            key={o.key}
            className={`px-4 py-2.5 rounded-xl border ${
              value === o.key
                ? "bg-feed-primary border-feed-primary"
                : "bg-card-bg border-border-main"
            }`}
            onPress={() => onChange(o.key)}
          >
            <Text
              className={`text-base font-body-medium ${
                value !== o.key ? "text-text-secondary" : ""
              }`}
              style={value === o.key ? { color: colors.charcoal } : undefined}
            >
              {o.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 justify-end">
        <View className="bg-screen-bg border-t border-border-main rounded-t-3xl px-6 pt-6 pb-10 max-h-[85%]">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-xl font-display text-text-primary">
              Edit {item.kind.charAt(0).toUpperCase() + item.kind.slice(1)} Log
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text className="text-text-secondary text-base">Cancel</Text>
            </TouchableOpacity>
          </View>
          <Text className="text-sm text-text-secondary font-mono mb-5">
            {formatDate(item.timestamp)} at {formatTime(item.timestamp)}
          </Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            {item.kind === "feed" && (
              <>
                <Text className="text-[13px] font-body-bold text-text-secondary uppercase mb-2">
                  Type
                </Text>
                <OptionRow
                  options={FEED_TYPES}
                  value={feedType}
                  onChange={setFeedType}
                />

                {(feedType === "bottle" || feedType === "solids") && (
                  <>
                    <View className="flex-row items-center justify-between mb-1">
                      <Text className="text-[13px] font-body-bold text-text-secondary uppercase">
                        Amount ({unit})
                      </Text>
                      <UnitToggle />
                    </View>
                    <TextInput
                      className="border border-border-main bg-raised-bg rounded-xl px-4 mb-4 text-text-primary"
                      style={{ fontSize: 16, height: 48 }}
                      value={amountOz}
                      onChangeText={setAmountOz}
                      keyboardType="decimal-pad"
                      placeholderTextColor={colors.textPlaceholder}
                      placeholder="e.g. 4"
                    />
                  </>
                )}

                {feedType === "bottle" && (
                  <>
                    <Text className="text-[13px] font-body-bold text-text-secondary uppercase mb-2">
                      Content
                    </Text>
                    <OptionRow
                      options={[
                        { key: "formula", label: "Formula" },
                        { key: "breastmilk", label: "Breastmilk" },
                      ]}
                      value={bottleContent}
                      onChange={(v) => {
                        setBottleContent(v as "formula" | "breastmilk");
                        if (v !== "formula") {
                          setFormulaBrand("");
                          setBrandSearch("");
                        }
                      }}
                    />

                    {bottleContent === "formula" && (
                      <>
                        <Text className="text-[13px] font-body-bold text-text-secondary uppercase mb-1">
                          Formula Brand
                        </Text>
                        <TextInput
                          className="border border-border-main bg-raised-bg rounded-xl px-4 mb-2 text-text-primary"
                          style={{ fontSize: 16, height: 48 }}
                          value={brandSearch}
                          onChangeText={(t) => {
                            setBrandSearch(t);
                            if (!t.trim()) setFormulaBrand("");
                          }}
                          placeholderTextColor={colors.textPlaceholder}
                          placeholder="Search brand..."
                        />
                        {brandSearch.length >= 1 && !formulaBrand && (
                          <View className="border border-border-main bg-raised-bg rounded-xl mb-4 max-h-36 overflow-hidden">
                            <ScrollView nestedScrollEnabled>
                              {FORMULA_BRANDS.filter((b) =>
                                b.toLowerCase().includes(brandSearch.toLowerCase())
                              ).map((brand) => (
                                <TouchableOpacity
                                  key={brand}
                                  className="px-4 py-2.5 border-b border-border-main"
                                  onPress={() => {
                                    setFormulaBrand(brand);
                                    setBrandSearch(brand);
                                  }}
                                >
                                  <Text className="text-text-primary text-base">
                                    {brand}
                                  </Text>
                                </TouchableOpacity>
                              ))}
                            </ScrollView>
                          </View>
                        )}
                        {formulaBrand ? (
                          <TouchableOpacity
                            className="mb-4"
                            onPress={() => {
                              setFormulaBrand("");
                              setBrandSearch("");
                            }}
                          >
                            <Text className="text-feed-primary text-base">
                              Change brand
                            </Text>
                          </TouchableOpacity>
                        ) : null}
                      </>
                    )}
                  </>
                )}

                {(feedType === "breast_left" ||
                  feedType === "breast_right") && (
                  <>
                    <Text className="text-[13px] font-body-bold text-text-secondary uppercase mb-1">
                      Duration (minutes)
                    </Text>
                    <TextInput
                      className="border border-border-main bg-raised-bg rounded-xl px-4 mb-4 text-text-primary"
                      style={{ fontSize: 16, height: 48 }}
                      value={durationMin}
                      onChangeText={setDurationMin}
                      keyboardType="number-pad"
                      placeholderTextColor={colors.textPlaceholder}
                      placeholder="e.g. 15"
                    />
                  </>
                )}

                <Text className="text-[13px] font-body-bold text-text-secondary uppercase mb-1">
                  Notes
                </Text>
                <TextInput
                  className="border border-border-main bg-raised-bg rounded-xl px-4 mb-4 text-text-primary"
                  style={{ fontSize: 16, height: 48 }}
                  value={notes}
                  onChangeText={setNotes}
                  placeholderTextColor={colors.textPlaceholder}
                  placeholder="Optional notes"
                />
              </>
            )}

            {item.kind === "diaper" && (
              <>
                <Text className="text-[13px] font-body-bold text-text-secondary uppercase mb-2">
                  Type
                </Text>
                <OptionRow
                  options={DIAPER_TYPES}
                  value={diaperType}
                  onChange={setDiaperType}
                />
              </>
            )}

            {item.kind === "sleep" && (
              <>
                <Text className="text-[13px] font-body-bold text-text-secondary uppercase mb-2">
                  Location
                </Text>
                <OptionRow
                  options={SLEEP_LOCATIONS}
                  value={sleepLocation}
                  onChange={setSleepLocation}
                />
              </>
            )}

            {item.kind === "pump" && (
              <>
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-[13px] font-body-bold text-text-secondary uppercase">
                    Amount ({unit})
                  </Text>
                  <UnitToggle />
                </View>
                <TextInput
                  className="border border-border-main bg-raised-bg rounded-xl px-4 mb-4 text-text-primary"
                  style={{ fontSize: 16, height: 48 }}
                  value={pumpAmountOz}
                  onChangeText={setPumpAmountOz}
                  keyboardType="decimal-pad"
                  placeholderTextColor={colors.textPlaceholder}
                  placeholder="e.g. 4.5"
                />

                <Text className="text-[13px] font-body-bold text-text-secondary uppercase mb-1">
                  Notes
                </Text>
                <TextInput
                  className="border border-border-main bg-raised-bg rounded-xl px-4 mb-4 text-text-primary"
                  style={{ fontSize: 16, height: 48 }}
                  value={notes}
                  onChangeText={setNotes}
                  placeholderTextColor={colors.textPlaceholder}
                  placeholder="Optional notes"
                />
              </>
            )}

            <TouchableOpacity
              className="bg-feed-primary rounded-2xl py-4 mb-3"
              onPress={handleSave}
              disabled={saving}
            >
              <Text className="text-center font-body-semibold text-base" style={{ color: colors.charcoal }}>
                {saving ? "Saving..." : "Save Changes"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="py-3 mb-4"
              onPress={handleDelete}
              disabled={deleting}
            >
              <Text className="text-danger text-center text-base">
                {deleting ? "Deleting..." : "Delete This Entry"}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
