import { useState } from "react";
import { View, Text, Modal, Pressable, FlatList } from "react-native";
import { useLogHistory, type ActivityItem } from "../lib/queries";
import { EditLogModal } from "./EditLogModal";
import { useThemeColors } from "../lib/theme";
import { colors, shadows } from "../constants/theme";
import { BottleIcon } from "./icons/BottleIcon";
import { MoonIcon } from "./icons/MoonIcon";
import { DiaperIcon } from "./icons/DiaperIcon";
import { PumpIcon } from "./icons/PumpIcon";

type LogKind = "feed" | "diaper" | "sleep" | "pump";

interface LogHistoryModalProps {
  kind: LogKind | null;
  babyId: string | undefined;
  visible: boolean;
  onClose: () => void;
}

const TITLES: Record<LogKind, string> = {
  feed: "Feed History",
  diaper: "Diaper History",
  sleep: "Sleep History",
  pump: "Pump History",
};

const ICONS: Record<LogKind, typeof BottleIcon> = {
  feed: BottleIcon,
  sleep: MoonIcon,
  diaper: DiaperIcon,
  pump: PumpIcon,
};

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function computeDaySummary(kind: LogKind, items: ActivityItem[]): string {
  if (kind === "feed") {
    let totalOz = 0;
    let totalMin = 0;
    items.forEach((item) => {
      const raw = item.raw;
      if (raw.amount_oz) totalOz += Number(raw.amount_oz);
      if (raw.duration_min) totalMin += Number(raw.duration_min);
    });
    const parts: string[] = [];
    if (totalOz > 0) parts.push(`${totalOz} oz / ${Math.round(totalOz * 29.5735)} ml`);
    if (totalMin > 0) parts.push(`${totalMin} min nursing`);
    parts.push(`${items.length} feed${items.length !== 1 ? "s" : ""}`);
    return parts.join("  ·  ");
  }

  if (kind === "diaper") {
    let wet = 0;
    let dirty = 0;
    items.forEach((item) => {
      const type = item.raw.type as string;
      if (type === "wet") wet++;
      else if (type === "dirty") dirty++;
      else if (type === "both") { wet++; dirty++; }
    });
    const parts: string[] = [];
    parts.push(`${wet} wet`);
    parts.push(`${dirty} dirty`);
    parts.push(`${items.length} total`);
    return parts.join("  ·  ");
  }

  if (kind === "sleep") {
    let totalMin = 0;
    items.forEach((item) => {
      const raw = item.raw;
      if (raw.started_at && raw.ended_at) {
        totalMin += Math.round(
          (new Date(raw.ended_at as string).getTime() - new Date(raw.started_at as string).getTime()) / 60000
        );
      }
    });
    const hours = Math.floor(totalMin / 60);
    const mins = totalMin % 60;
    const timeStr = hours > 0
      ? mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
      : `${mins}m`;
    return `${timeStr} total  ·  ${items.length} nap${items.length !== 1 ? "s" : ""}`;
  }

  if (kind === "pump") {
    let totalOz = 0;
    items.forEach((item) => {
      const raw = item.raw;
      if (raw.amount_oz) totalOz += Number(raw.amount_oz);
    });
    const parts: string[] = [];
    if (totalOz > 0) parts.push(`${totalOz} oz / ${Math.round(totalOz * 29.5735)} ml`);
    parts.push(`${items.length} session${items.length !== 1 ? "s" : ""}`);
    return parts.join("  ·  ");
  }

  return "";
}

export function LogHistoryModal({ kind, babyId, visible, onClose }: LogHistoryModalProps) {
  const tc = useThemeColors();
  const { data: items } = useLogHistory(kind ?? undefined, babyId, 20);
  const [editItem, setEditItem] = useState<ActivityItem | null>(null);

  if (!kind) return null;

  const Icon = ICONS[kind];

  // Group items by date
  const grouped: { date: string; items: ActivityItem[]; summary: string }[] = [];
  items?.forEach((item) => {
    const dateKey = formatDate(item.timestamp);
    const existing = grouped.find((g) => g.date === dateKey);
    if (existing) {
      existing.items.push(item);
    } else {
      grouped.push({ date: dateKey, items: [item], summary: "" });
    }
  });
  // Compute summaries after grouping
  grouped.forEach((g) => {
    g.summary = computeDaySummary(kind, g.items);
  });

  return (
    <>
      <Modal visible={visible && !editItem} animationType="slide" transparent>
        <View style={{ flex: 1, justifyContent: "flex-end" }}>
          <View
            style={{
              backgroundColor: tc.screenBg,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              borderTopWidth: 1,
              borderColor: tc.border,
              maxHeight: "85%",
              paddingBottom: 40,
            }}
          >
            {/* Header */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: 20,
                paddingTop: 20,
                paddingBottom: 12,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Icon size={24} theme={tc.mode} />
                <Text
                  style={{
                    fontSize: 20,
                    fontFamily: "Baloo2_800ExtraBold",
                    color: tc.textPrimary,
                  }}
                >
                  {TITLES[kind]}
                </Text>
              </View>
              <Pressable onPress={onClose} hitSlop={12}>
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: "Nunito_600SemiBold",
                    color: tc.textSecondary,
                  }}
                >
                  Close
                </Text>
              </Pressable>
            </View>

            {/* List */}
            {(!items || items.length === 0) ? (
              <View style={{ padding: 40, alignItems: "center" }}>
                <Text style={{ color: tc.textSecondary, fontFamily: "Nunito_400Regular" }}>
                  No entries yet
                </Text>
              </View>
            ) : (
              <FlatList
                data={grouped}
                keyExtractor={(item) => item.date}
                contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
                renderItem={({ item: group }) => (
                  <View style={{ marginBottom: 16 }}>
                    <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", marginBottom: 6 }}>
                      <Text
                        style={{
                          fontSize: 13,
                          fontFamily: "Baloo2_700Bold",
                          color: tc.textMuted,
                          letterSpacing: 2,
                          textTransform: "uppercase",
                        }}
                      >
                        {group.date}
                      </Text>
                      {group.summary ? (
                        <Text
                          style={{
                            fontSize: 13,
                            fontFamily: "JetBrainsMono_400Regular",
                            color: colors.feedPrimary,
                          }}
                        >
                          {group.summary}
                        </Text>
                      ) : null}
                    </View>
                    <View style={{ gap: 6 }}>
                      {group.items.map((entry) => (
                        <Pressable
                          key={entry.id}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            backgroundColor: tc.cardBg,
                            borderWidth: 1,
                            borderColor: tc.border,
                            borderRadius: 14,
                            paddingVertical: 12,
                            paddingHorizontal: 14,
                            ...shadows.sm,
                          }}
                          onPress={() => setEditItem(entry)}
                        >
                          <View style={{ flex: 1, minWidth: 0 }}>
                            <Text style={{ fontSize: 15, lineHeight: 18 }}>
                              <Text
                                style={{
                                  fontFamily: "Nunito_700Bold",
                                  color: tc.textPrimary,
                                }}
                              >
                                {entry.loggedBy}
                              </Text>
                              <Text
                                style={{
                                  fontFamily: "Nunito_400Regular",
                                  color: tc.textBody,
                                }}
                              >
                                {" "}{entry.label}
                              </Text>
                            </Text>
                            {entry.detail ? (
                              <Text
                                style={{
                                  fontSize: 13,
                                  color: tc.textDetail,
                                  fontFamily: "Nunito_400Regular",
                                  marginTop: 2,
                                }}
                              >
                                {entry.detail}
                              </Text>
                            ) : null}
                          </View>
                          <Text
                            style={{
                              fontSize: 13,
                              color: tc.textPlaceholder,
                              fontFamily: "JetBrainsMono_400Regular",
                              marginLeft: 10,
                            }}
                          >
                            {formatTime(entry.timestamp)}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                )}
              />
            )}
          </View>
        </View>
      </Modal>

      <EditLogModal
        item={editItem}
        visible={!!editItem}
        onClose={() => setEditItem(null)}
      />
    </>
  );
}
