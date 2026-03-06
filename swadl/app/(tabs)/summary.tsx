import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Share,
  ActivityIndicator,
} from "react-native";
import { useBabies, useSummary, type SummaryData } from "../../lib/queries";
import { colors } from "../../constants/theme";
import { useUnitStore, displayVolume } from "../../lib/store";
import { UnitToggle } from "../../components/UnitToggle";

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

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

const ICONS: Record<string, string> = {
  feed: "\u{1F37C}",
  diaper: "\u{1F9F7}",
  sleep: "\u{1F634}",
  pump: "\u{1F95B}",
};

export default function Summary() {
  const { data: babies } = useBabies();
  const baby = babies?.[0];

  const unit = useUnitStore((s) => s.unit);
  const [date, setDate] = useState(() => formatDate(new Date()));
  const { data: summary, isLoading } = useSummary(baby?.id, date);

  function shiftDate(offset: number) {
    const d = new Date(date + "T12:00:00");
    d.setDate(d.getDate() + offset);
    setDate(formatDate(d));
  }

  const isToday = date === formatDate(new Date());

  function buildShareText(s: SummaryData): string {
    const lines = [
      `${baby?.name ?? "Baby"} - ${displayDate(date)}`,
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
      s.lowWetWarning ? "  \u26A0\uFE0F Low wet diaper count" : "",
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
    <ScrollView className="flex-1 bg-midnight">
      <View className="px-4 pt-4 pb-10">
        <View className="flex-row items-center justify-between mb-3">
          <View />
          <UnitToggle />
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
            {isToday ? "Today" : displayDate(date)}
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
                  <Text className="text-2xl text-white font-display">{summary.feedCount}</Text>
                  <Text className="text-xs text-ash">feeds</Text>
                </View>
                <View className="items-center flex-1">
                  <Text className="text-2xl text-white font-display">
                    {displayVolume(summary.feedTotalOz, unit).split(" ")[0]}
                  </Text>
                  <Text className="text-xs text-ash">{unit}</Text>
                </View>
                <View className="items-center flex-1">
                  <Text className="text-2xl text-white font-display">
                    {summary.feedTotalMin}
                  </Text>
                  <Text className="text-xs text-ash">min</Text>
                </View>
              </View>
              <View className="border-t border-navy-border pt-2 mt-1">
                {Object.entries(summary.feedByType).map(([type, count]) => (
                  <Text key={type} className="text-sm text-ash">
                    {type}: {count}
                  </Text>
                ))}
                {summary.avgTimeBetweenFeeds != null && (
                  <Text className="text-sm text-ash">
                    Avg {summary.avgTimeBetweenFeeds} min between feeds
                  </Text>
                )}
                {summary.avgOzPerBottle != null && (
                  <Text className="text-sm text-ash">
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
                    <Text className="text-2xl text-white font-display">
                      {summary.pumpCount}
                    </Text>
                    <Text className="text-xs text-ash">sessions</Text>
                  </View>
                  <View className="items-center flex-1">
                    <Text className="text-2xl text-white font-display">
                      {displayVolume(summary.pumpTotalOz, unit).split(" ")[0]}
                    </Text>
                    <Text className="text-xs text-ash">{unit}</Text>
                  </View>
                  <View className="items-center flex-1">
                    <Text className="text-2xl text-white font-display">
                      {summary.pumpTotalMin}
                    </Text>
                    <Text className="text-xs text-ash">min</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Diaper Summary */}
            <View className="bg-navy-card border border-navy-border rounded-2xl p-4 mb-4">
              <Text className="text-[11px] text-ash uppercase font-body-bold mb-2" style={{ letterSpacing: 2 }}>
                Diapers
              </Text>
              <Text className="text-2xl text-white font-display mb-1">
                {summary.diaperCount}
              </Text>
              <View className="flex-row flex-wrap gap-x-4">
                {Object.entries(summary.diaperByType).map(([type, count]) => (
                  <Text key={type} className="text-sm text-ash">
                    {type}: {count}
                  </Text>
                ))}
              </View>
              {summary.lowWetWarning && (
                <View className="bg-navy-raise rounded-lg p-2 mt-2">
                  <Text className="text-sm text-amber">
                    {"\u26A0\uFE0F"} Fewer than 4 wet diapers — consider
                    checking hydration
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
                  <Text className="text-2xl text-white font-display">
                    {Math.round((summary.sleepTotalMin / 60) * 10) / 10}
                  </Text>
                  <Text className="text-xs text-ash">hours</Text>
                </View>
                <View className="items-center flex-1">
                  <Text className="text-2xl text-white font-display">{summary.napCount}</Text>
                  <Text className="text-xs text-ash">naps</Text>
                </View>
                <View className="items-center flex-1">
                  <Text className="text-2xl text-white font-display">
                    {summary.longestStretchMin}
                  </Text>
                  <Text className="text-xs text-ash">min longest</Text>
                </View>
              </View>
              <View className="border-t border-navy-border pt-2 mt-1">
                <Text className="text-sm text-ash">
                  Night (7PM-7AM): {Math.round(summary.nightSleepMin)} min
                </Text>
                <Text className="text-sm text-ash">
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
                      <Text className="text-base mr-3">
                        {ICONS[item.kind]}
                      </Text>
                      <View className="flex-1">
                        <Text className="text-sm font-body-medium text-white">
                          {item.label}
                        </Text>
                        <Text className="text-xs text-ash">
                          {item.loggedBy}
                          {item.detail ? ` \u00B7 ${item.detail}` : ""}
                        </Text>
                      </View>
                      <Text className="text-xs text-ash">
                        {formatTime(item.timestamp)}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <View className="bg-navy-card border border-navy-border rounded-2xl p-4 items-center">
                  <Text className="text-ash">No activity logged</Text>
                </View>
              )}
            </View>

            {/* Share */}
            <TouchableOpacity
              className="border border-navy-border rounded-2xl py-4"
              onPress={handleShare}
            >
              <Text className="text-center font-body-semibold text-base text-ash">
                Share Summary
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <View className="py-20 items-center">
            <Text className="text-ash">No data available</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
