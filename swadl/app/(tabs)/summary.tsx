import { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Share,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { useBabies, useSummary, type SummaryData } from "../../lib/queries";
import { colors } from "../../constants/theme";
import { useUnitStore, displayVolume } from "../../lib/store";
import { UnitToggle } from "../../components/UnitToggle";

type ViewMode = "day" | "week";

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function displayDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function displayDateRange(start: string, end: string): string {
  const s = new Date(start + "T12:00:00");
  const e = new Date(end + "T12:00:00");
  const sStr = s.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  const eStr = e.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  return `${sStr} - ${eStr}`;
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function getWeekStart(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  return formatDate(d);
}

function getWeekEnd(weekStartStr: string): string {
  const d = new Date(weekStartStr + "T12:00:00");
  d.setDate(d.getDate() + 6);
  return formatDate(d);
}

const DOT_COLORS: Record<string, string> = {
  feed: colors.amber,
  diaper: colors.honey,
  sleep: colors.info,
  pump: colors.ember,
};

export default function Summary() {
  const queryClient = useQueryClient();
  const { data: babies } = useBabies();
  const baby = babies?.[0];

  const params = useLocalSearchParams<{ date?: string }>();
  const unit = useUnitStore((s) => s.unit);
  const [refreshing, setRefreshing] = useState(false);
  const [date, setDate] = useState(() => params.date ?? formatDate(new Date()));
  const [viewMode, setViewMode] = useState<ViewMode>("day");

  const weekStart = getWeekStart(date);
  const weekEnd = getWeekEnd(weekStart);

  const { data: summary, isLoading } = useSummary(
    baby?.id,
    viewMode === "day" ? date : weekStart,
    viewMode === "week" ? weekEnd : undefined
  );

  function shiftDate(offset: number) {
    const d = new Date(date + "T12:00:00");
    if (viewMode === "week") {
      d.setDate(d.getDate() + offset * 7);
    } else {
      d.setDate(d.getDate() + offset);
    }
    setDate(formatDate(d));
  }

  const today = formatDate(new Date());
  const isToday = viewMode === "day" ? date === today : weekStart <= today && weekEnd >= today;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ["summary"] });
    setRefreshing(false);
  }, [queryClient]);

  function buildShareText(s: SummaryData): string {
    const header = viewMode === "day"
      ? `${baby?.name ?? "Baby"} - ${displayDate(date)}`
      : `${baby?.name ?? "Baby"} - ${displayDateRange(weekStart, weekEnd)}`;
    const lines = [
      header,
      "",
      "FEEDING",
      `${s.feedCount} feeds · ${displayVolume(s.feedTotalOz, unit)} · ${s.feedTotalMin} min`,
      ...Object.entries(s.feedByType).map(
        ([type, count]) => `  ${type}: ${count}`
      ),
      s.avgTimeBetweenFeeds != null
        ? `  Avg ${s.avgTimeBetweenFeeds} min between feeds`
        : "",
      s.avgOzPerBottle != null ? `  Avg ${displayVolume(s.avgOzPerBottle, unit)}/bottle` : "",
      "",
      "PUMPING",
      `${s.pumpCount} sessions · ${displayVolume(s.pumpTotalOz, unit)} · ${s.pumpTotalMin} min`,
      "",
      "DIAPERS",
      `${s.diaperCount} changes`,
      ...Object.entries(s.diaperByType).map(
        ([type, count]) => `  ${type}: ${count}`
      ),
      s.lowWetWarning ? "  Warning: Low wet diaper count" : "",
      "",
      "SLEEP",
      `${Math.round(s.sleepTotalMin / 60 * 10) / 10} hrs total · ${s.napCount} nap(s)`,
      `  Longest stretch: ${Math.round(s.longestStretchMin)} min`,
      `  Night: ${Math.round(s.nightSleepMin)} min · Day: ${Math.round(s.daySleepMin)} min`,
      "",
      "Sent from Swadl",
    ];
    return lines.filter(Boolean).join("\n");
  }

  async function handleShare() {
    if (!summary) return;
    try {
      await Share.share({ message: buildShareText(summary) });
    } catch {
      // cancelled
    }
  }

  return (
    <ScrollView
      className="flex-1 bg-midnight"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.amber}
          colors={[colors.amber]}
        />
      }
    >
      <View className="px-4 pt-4 pb-10">
        <View className="flex-row items-center justify-between mb-3">
          <View />
          <UnitToggle />
        </View>

        {/* Day / Week Toggle */}
        <View className="flex-row bg-navy-card border border-navy-border rounded-xl p-1 mb-4">
          <TouchableOpacity
            className={`flex-1 py-2 rounded-lg items-center ${
              viewMode === "day" ? "bg-amber" : ""
            }`}
            onPress={() => setViewMode("day")}
          >
            <Text
              className={`text-sm font-body-semibold ${
                viewMode === "day" ? "text-midnight" : "text-ash"
              }`}
            >
              Day
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-2 rounded-lg items-center ${
              viewMode === "week" ? "bg-amber" : ""
            }`}
            onPress={() => setViewMode("week")}
          >
            <Text
              className={`text-sm font-body-semibold ${
                viewMode === "week" ? "text-midnight" : "text-ash"
              }`}
            >
              Week
            </Text>
          </TouchableOpacity>
        </View>

        {/* Date Picker */}
        <View className="flex-row items-center justify-between mb-5">
          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-navy-raise items-center justify-center"
            onPress={() => shiftDate(-1)}
          >
            <Text className="text-lg text-ash">{"\u2039"}</Text>
          </TouchableOpacity>
          <Text className="text-base font-body-semibold text-white">
            {viewMode === "day"
              ? isToday
                ? "Today"
                : displayDate(date)
              : displayDateRange(weekStart, weekEnd)}
          </Text>
          <TouchableOpacity
            className={`w-10 h-10 rounded-full items-center justify-center ${
              isToday ? "bg-navy-card" : "bg-navy-raise"
            }`}
            onPress={() => shiftDate(1)}
            disabled={isToday}
          >
            <Text
              className={`text-lg ${isToday ? "text-navy-border" : "text-ash"}`}
            >
              {"\u203A"}
            </Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View className="py-20 items-center">
            <ActivityIndicator size="large" color={colors.amber} />
          </View>
        ) : summary ? (
          <>
            {/* Feeding Summary */}
            <View className="bg-navy-card border border-navy-border rounded-2xl p-4 mb-4">
              <Text className="text-[11px] text-ash uppercase font-body-bold mb-2" style={{ letterSpacing: 2 }}>
                Feeding
              </Text>
              <View className="flex-row justify-between mb-2">
                <View className="items-center flex-1">
                  <Text className="text-2xl text-white font-mono-bold">{summary.feedCount}</Text>
                  <Text className="text-xs text-ash font-body">feeds</Text>
                </View>
                <View className="items-center flex-1">
                  <Text className="text-2xl text-white font-mono-bold">
                    {displayVolume(summary.feedTotalOz, unit).split(" ")[0]}
                  </Text>
                  <Text className="text-xs text-ash font-body">{unit}</Text>
                </View>
                <View className="items-center flex-1">
                  <Text className="text-2xl text-white font-mono-bold">
                    {summary.feedTotalMin}
                  </Text>
                  <Text className="text-xs text-ash font-body">min</Text>
                </View>
              </View>
              <View className="border-t border-navy-border pt-2 mt-1">
                {Object.entries(summary.feedByType).map(([type, count]) => (
                  <Text key={type} className="text-sm text-ash font-body">
                    {type}: {count}
                  </Text>
                ))}
                {summary.avgTimeBetweenFeeds != null && (
                  <Text className="text-sm text-ash font-body">
                    Avg {summary.avgTimeBetweenFeeds} min between feeds
                  </Text>
                )}
                {summary.avgOzPerBottle != null && (
                  <Text className="text-sm text-ash font-body">
                    Avg {displayVolume(summary.avgOzPerBottle, unit)} per bottle
                  </Text>
                )}
              </View>
            </View>

            {/* Pump Summary */}
            {summary.pumpCount > 0 && (
              <View className="bg-navy-card border border-navy-border rounded-2xl p-4 mb-4">
                <Text className="text-[11px] text-ash uppercase font-body-bold mb-2" style={{ letterSpacing: 2 }}>
                  Pumping
                </Text>
                <View className="flex-row justify-between">
                  <View className="items-center flex-1">
                    <Text className="text-2xl text-white font-mono-bold">
                      {summary.pumpCount}
                    </Text>
                    <Text className="text-xs text-ash font-body">sessions</Text>
                  </View>
                  <View className="items-center flex-1">
                    <Text className="text-2xl text-white font-mono-bold">
                      {displayVolume(summary.pumpTotalOz, unit).split(" ")[0]}
                    </Text>
                    <Text className="text-xs text-ash font-body">{unit}</Text>
                  </View>
                  <View className="items-center flex-1">
                    <Text className="text-2xl text-white font-mono-bold">
                      {summary.pumpTotalMin}
                    </Text>
                    <Text className="text-xs text-ash font-body">min</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Diaper Summary */}
            <View className="bg-navy-card border border-navy-border rounded-2xl p-4 mb-4">
              <Text className="text-[11px] text-ash uppercase font-body-bold mb-2" style={{ letterSpacing: 2 }}>
                Diapers
              </Text>
              <Text className="text-2xl text-white font-mono-bold mb-1">
                {summary.diaperCount}
              </Text>
              <View className="flex-row flex-wrap gap-x-4">
                {Object.entries(summary.diaperByType).map(([type, count]) => (
                  <Text key={type} className="text-sm text-ash font-body">
                    {type}: {count}
                  </Text>
                ))}
              </View>
              {summary.lowWetWarning && (
                <View className="bg-navy-raise rounded-lg p-2 mt-2 border-l-[3px] border-amber">
                  <Text className="text-sm text-amber font-body">
                    Fewer than 6 wet diapers — consider checking hydration
                  </Text>
                </View>
              )}
            </View>

            {/* Sleep Summary */}
            <View className="bg-navy-card border border-navy-border rounded-2xl p-4 mb-4">
              <Text className="text-[11px] text-ash uppercase font-body-bold mb-2" style={{ letterSpacing: 2 }}>
                Sleep
              </Text>
              <View className="flex-row justify-between mb-2">
                <View className="items-center flex-1">
                  <Text className="text-2xl text-white font-mono-bold">
                    {Math.round((summary.sleepTotalMin / 60) * 10) / 10}
                  </Text>
                  <Text className="text-xs text-ash font-body">hours</Text>
                </View>
                <View className="items-center flex-1">
                  <Text className="text-2xl text-white font-mono-bold">{summary.napCount}</Text>
                  <Text className="text-xs text-ash font-body">naps</Text>
                </View>
                <View className="items-center flex-1">
                  <Text className="text-2xl text-white font-mono-bold">
                    {summary.longestStretchMin}
                  </Text>
                  <Text className="text-xs text-ash font-body">min longest</Text>
                </View>
              </View>
              <View className="border-t border-navy-border pt-2 mt-1">
                <Text className="text-sm text-ash font-body">
                  Night (7PM-7AM): {Math.round(summary.nightSleepMin)} min
                </Text>
                <Text className="text-sm text-ash font-body">
                  Day (7AM-7PM): {Math.round(summary.daySleepMin)} min
                </Text>
              </View>
            </View>

            {/* Activity Log */}
            <View className="mb-4">
              <Text className="text-[11px] text-ash uppercase font-body-bold mb-2" style={{ letterSpacing: 2 }}>
                Activity Log
              </Text>
              {summary.activityLog.length > 0 ? (
                <View className="bg-navy-card border border-navy-border rounded-2xl overflow-hidden">
                  {summary.activityLog.map((item, i) => (
                    <View
                      key={item.id}
                      className={`flex-row items-center px-4 py-3 ${
                        i > 0 ? "border-t border-navy-border" : ""
                      }`}
                    >
                      <View
                        className="w-2 h-2 rounded-full mr-3"
                        style={{ backgroundColor: DOT_COLORS[item.kind] ?? colors.ash }}
                      />
                      <View className="flex-1">
                        <Text className="text-sm font-body-medium text-white">
                          {item.label}
                        </Text>
                        <Text className="text-xs text-ash font-body">
                          {item.loggedBy}
                          {item.detail ? ` \u00B7 ${item.detail}` : ""}
                        </Text>
                      </View>
                      <Text className="text-xs text-ash font-mono">
                        {formatTime(item.timestamp)}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <View className="bg-navy-card border border-navy-border rounded-2xl p-4 items-center">
                  <Text className="text-ash font-body">No activity logged</Text>
                </View>
              )}
            </View>

            {/* Share */}
            <TouchableOpacity
              className="border border-navy-border rounded-2xl py-4"
              onPress={handleShare}
            >
              <Text className="text-center font-body-semibold text-base text-ash">
                Share for Pediatrician
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <View className="py-20 items-center">
            <Text className="text-ash font-body">No data available</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
