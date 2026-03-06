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
    <ScrollView className="flex-1 bg-white">
      <View className="px-4 pt-4 pb-10">
        <View className="flex-row items-center justify-between mb-3">
          <View />
          <UnitToggle />
        </View>

        {/* Date Picker */}
        <View className="flex-row items-center justify-between mb-5">
          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
            onPress={() => shiftDate(-1)}
          >
            <Text className="text-lg text-gray-600">{"\u2039"}</Text>
          </TouchableOpacity>
          <Text className="text-base font-semibold">
            {isToday ? "Today" : displayDate(date)}
          </Text>
          <TouchableOpacity
            className={`w-10 h-10 rounded-full items-center justify-center ${
              isToday ? "bg-gray-50" : "bg-gray-100"
            }`}
            onPress={() => shiftDate(1)}
            disabled={isToday}
          >
            <Text
              className={`text-lg ${isToday ? "text-gray-300" : "text-gray-600"}`}
            >
              {"\u203A"}
            </Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View className="py-20 items-center">
            <ActivityIndicator size="large" color="#2563eb" />
          </View>
        ) : summary ? (
          <>
            {/* Feeding Summary */}
            <View className="bg-gray-50 rounded-xl p-4 mb-4">
              <Text className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">
                Feeding
              </Text>
              <View className="flex-row justify-between mb-2">
                <View className="items-center flex-1">
                  <Text className="text-2xl font-bold">{summary.feedCount}</Text>
                  <Text className="text-xs text-gray-400">feeds</Text>
                </View>
                <View className="items-center flex-1">
                  <Text className="text-2xl font-bold">
                    {displayVolume(summary.feedTotalOz, unit).split(" ")[0]}
                  </Text>
                  <Text className="text-xs text-gray-400">{unit}</Text>
                </View>
                <View className="items-center flex-1">
                  <Text className="text-2xl font-bold">
                    {summary.feedTotalMin}
                  </Text>
                  <Text className="text-xs text-gray-400">min</Text>
                </View>
              </View>
              <View className="border-t border-gray-200 pt-2 mt-1">
                {Object.entries(summary.feedByType).map(([type, count]) => (
                  <Text key={type} className="text-sm text-gray-600">
                    {type}: {count}
                  </Text>
                ))}
                {summary.avgTimeBetweenFeeds != null && (
                  <Text className="text-sm text-gray-600">
                    Avg {summary.avgTimeBetweenFeeds} min between feeds
                  </Text>
                )}
                {summary.avgOzPerBottle != null && (
                  <Text className="text-sm text-gray-600">
                    Avg {displayVolume(summary.avgOzPerBottle, unit)} per bottle
                  </Text>
                )}
              </View>
            </View>

            {/* Pump Summary */}
            {summary.pumpCount > 0 && (
              <View className="bg-gray-50 rounded-xl p-4 mb-4">
                <Text className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">
                  Pumping
                </Text>
                <View className="flex-row justify-between">
                  <View className="items-center flex-1">
                    <Text className="text-2xl font-bold">
                      {summary.pumpCount}
                    </Text>
                    <Text className="text-xs text-gray-400">sessions</Text>
                  </View>
                  <View className="items-center flex-1">
                    <Text className="text-2xl font-bold">
                      {displayVolume(summary.pumpTotalOz, unit).split(" ")[0]}
                    </Text>
                    <Text className="text-xs text-gray-400">{unit}</Text>
                  </View>
                  <View className="items-center flex-1">
                    <Text className="text-2xl font-bold">
                      {summary.pumpTotalMin}
                    </Text>
                    <Text className="text-xs text-gray-400">min</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Diaper Summary */}
            <View className="bg-gray-50 rounded-xl p-4 mb-4">
              <Text className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">
                Diapers
              </Text>
              <Text className="text-2xl font-bold mb-1">
                {summary.diaperCount}
              </Text>
              <View className="flex-row flex-wrap gap-x-4">
                {Object.entries(summary.diaperByType).map(([type, count]) => (
                  <Text key={type} className="text-sm text-gray-600">
                    {type}: {count}
                  </Text>
                ))}
              </View>
              {summary.lowWetWarning && (
                <View className="bg-yellow-50 rounded-lg p-2 mt-2">
                  <Text className="text-sm text-yellow-700">
                    {"\u26A0\uFE0F"} Fewer than 4 wet diapers — consider
                    checking hydration
                  </Text>
                </View>
              )}
            </View>

            {/* Sleep Summary */}
            <View className="bg-gray-50 rounded-xl p-4 mb-4">
              <Text className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">
                Sleep
              </Text>
              <View className="flex-row justify-between mb-2">
                <View className="items-center flex-1">
                  <Text className="text-2xl font-bold">
                    {Math.round((summary.sleepTotalMin / 60) * 10) / 10}
                  </Text>
                  <Text className="text-xs text-gray-400">hours</Text>
                </View>
                <View className="items-center flex-1">
                  <Text className="text-2xl font-bold">{summary.napCount}</Text>
                  <Text className="text-xs text-gray-400">naps</Text>
                </View>
                <View className="items-center flex-1">
                  <Text className="text-2xl font-bold">
                    {summary.longestStretchMin}
                  </Text>
                  <Text className="text-xs text-gray-400">min longest</Text>
                </View>
              </View>
              <View className="border-t border-gray-200 pt-2 mt-1">
                <Text className="text-sm text-gray-600">
                  Night (7PM-7AM): {Math.round(summary.nightSleepMin)} min
                </Text>
                <Text className="text-sm text-gray-600">
                  Day (7AM-7PM): {Math.round(summary.daySleepMin)} min
                </Text>
              </View>
            </View>

            {/* Activity Log */}
            <View className="mb-4">
              <Text className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">
                Activity Log
              </Text>
              {summary.activityLog.length > 0 ? (
                <View className="bg-gray-50 rounded-xl overflow-hidden">
                  {summary.activityLog.map((item, i) => (
                    <View
                      key={item.id}
                      className={`flex-row items-center px-4 py-3 ${
                        i > 0 ? "border-t border-gray-200" : ""
                      }`}
                    >
                      <Text className="text-base mr-3">
                        {ICONS[item.kind]}
                      </Text>
                      <View className="flex-1">
                        <Text className="text-sm font-medium">
                          {item.label}
                        </Text>
                        <Text className="text-xs text-gray-400">
                          {item.loggedBy}
                          {item.detail ? ` \u00B7 ${item.detail}` : ""}
                        </Text>
                      </View>
                      <Text className="text-xs text-gray-400">
                        {formatTime(item.timestamp)}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <View className="bg-gray-50 rounded-xl p-4 items-center">
                  <Text className="text-gray-400">No activity logged</Text>
                </View>
              )}
            </View>

            {/* Share */}
            <TouchableOpacity
              className="border border-gray-300 rounded-xl py-4"
              onPress={handleShare}
            >
              <Text className="text-center font-semibold text-base text-gray-700">
                Share Summary
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <View className="py-20 items-center">
            <Text className="text-gray-400">No data available</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
