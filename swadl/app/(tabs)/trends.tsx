import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import { useBabies, useTrends, type TrendDay } from "../../lib/queries";

const RANGES = [
  { key: 7, label: "7 days" },
  { key: 14, label: "14 days" },
  { key: 30, label: "30 days" },
] as const;

const CHART_HEIGHT = 140;
const screenWidth = Dimensions.get("window").width;

function shortDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

// Simple bar component
function Bar({
  height,
  color,
  maxHeight,
}: {
  height: number;
  color: string;
  maxHeight: number;
}) {
  const h = maxHeight > 0 ? Math.max(2, (height / maxHeight) * CHART_HEIGHT) : 2;
  return (
    <View
      style={{ height: h, backgroundColor: color, borderRadius: 2, flex: 1 }}
    />
  );
}

// Stacked bar
function StackedBar({
  bottom,
  top,
  bottomColor,
  topColor,
  maxHeight,
}: {
  bottom: number;
  top: number;
  bottomColor: string;
  topColor: string;
  maxHeight: number;
}) {
  const total = bottom + top;
  const totalH =
    maxHeight > 0 ? Math.max(2, (total / maxHeight) * CHART_HEIGHT) : 2;
  const bottomH = total > 0 ? (bottom / total) * totalH : 1;
  const topH = total > 0 ? (top / total) * totalH : 1;

  return (
    <View style={{ height: totalH, flex: 1, borderRadius: 2, overflow: "hidden" }}>
      <View style={{ height: topH, backgroundColor: topColor }} />
      <View style={{ height: bottomH, backgroundColor: bottomColor }} />
    </View>
  );
}

function FeedingChart({ data }: { data: TrendDay[] }) {
  const hasOz = data.some((d) => d.feedOz > 0);
  const maxVal = Math.max(
    ...data.map((d) => (hasOz ? d.feedOz : d.feedCount)),
    1
  );

  // Rolling average
  const values = data.map((d) => (hasOz ? d.feedOz : d.feedCount));
  const avgValues = values.map((_, i) => {
    const start = Math.max(0, i - 2);
    const slice = values.slice(start, i + 1);
    return slice.reduce((s, v) => s + v, 0) / slice.length;
  });
  const avgMax = Math.max(...avgValues, 1);

  return (
    <View className="bg-gray-50 rounded-xl p-4 mb-4">
      <Text className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
        Feeding Trend
      </Text>
      <Text className="text-xs text-gray-400 mb-3">
        Daily {hasOz ? "oz (bottle)" : "feed count"}
      </Text>

      <View style={{ height: CHART_HEIGHT }} className="flex-row items-end gap-0.5">
        {data.map((day) => (
          <Bar
            key={day.date}
            height={hasOz ? day.feedOz : day.feedCount}
            color="#3b82f6"
            maxHeight={maxVal}
          />
        ))}
      </View>

      {/* Dotted avg line overlay */}
      <View className="flex-row items-end gap-0.5 -mt-1" style={{ height: 2 }}>
        {avgValues.map((val, i) => (
          <View
            key={i}
            style={{
              flex: 1,
              height: 2,
              backgroundColor: "#ef4444",
              opacity: 0.6,
              borderRadius: 1,
            }}
          />
        ))}
      </View>

      {/* X-axis labels */}
      <View className="flex-row mt-1">
        {data.map((day, i) => {
          const show =
            data.length <= 7 ||
            (data.length <= 14 && i % 2 === 0) ||
            (data.length > 14 && i % 5 === 0);
          return (
            <View key={day.date} style={{ flex: 1, alignItems: "center" }}>
              <Text className="text-[9px] text-gray-400">
                {show ? shortDate(day.date) : ""}
              </Text>
            </View>
          );
        })}
      </View>

      <View className="flex-row items-center mt-2 gap-3">
        <View className="flex-row items-center gap-1">
          <View className="w-3 h-3 rounded-sm bg-blue-500" />
          <Text className="text-xs text-gray-500">Daily</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <View className="w-3 h-1 rounded-sm bg-red-500 opacity-60" />
          <Text className="text-xs text-gray-500">Rolling avg</Text>
        </View>
      </View>
    </View>
  );
}

function SleepChart({ data }: { data: TrendDay[] }) {
  const maxHrs = Math.max(
    ...data.map((d) => d.nightSleepHrs + d.napHrs),
    1
  );

  return (
    <View className="bg-gray-50 rounded-xl p-4 mb-4">
      <Text className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
        Sleep Trend
      </Text>
      <Text className="text-xs text-gray-400 mb-3">
        Night vs. nap hours per day
      </Text>

      <View style={{ height: CHART_HEIGHT }} className="flex-row items-end gap-0.5">
        {data.map((day) => (
          <StackedBar
            key={day.date}
            bottom={day.nightSleepHrs}
            top={day.napHrs}
            bottomColor="#1e40af"
            topColor="#93c5fd"
            maxHeight={maxHrs}
          />
        ))}
      </View>

      {/* X-axis labels */}
      <View className="flex-row mt-1">
        {data.map((day, i) => {
          const show =
            data.length <= 7 ||
            (data.length <= 14 && i % 2 === 0) ||
            (data.length > 14 && i % 5 === 0);
          return (
            <View key={day.date} style={{ flex: 1, alignItems: "center" }}>
              <Text className="text-[9px] text-gray-400">
                {show ? shortDate(day.date) : ""}
              </Text>
            </View>
          );
        })}
      </View>

      <View className="flex-row items-center mt-2 gap-3">
        <View className="flex-row items-center gap-1">
          <View className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#1e40af" }} />
          <Text className="text-xs text-gray-500">Night</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <View className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#93c5fd" }} />
          <Text className="text-xs text-gray-500">Naps</Text>
        </View>
      </View>
    </View>
  );
}

function DiaperChart({ data }: { data: TrendDay[] }) {
  const maxCount = Math.max(...data.map((d) => d.diaperCount), 1);

  return (
    <View className="bg-gray-50 rounded-xl p-4 mb-4">
      <Text className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
        Diaper Trend
      </Text>
      <Text className="text-xs text-gray-400 mb-3">Daily diaper count</Text>

      <View style={{ height: CHART_HEIGHT }} className="flex-row items-end gap-0.5">
        {data.map((day) => {
          const total = day.diaperCount;
          const totalH =
            maxCount > 0
              ? Math.max(2, (total / maxCount) * CHART_HEIGHT)
              : 2;
          const wetH = total > 0 ? (day.diaperWet / total) * totalH : 1;
          const dirtyH = total > 0 ? (day.diaperDirty / total) * totalH : 1;
          // Overlap for "both" — just stack wet then dirty
          return (
            <StackedBar
              key={day.date}
              bottom={day.diaperWet}
              top={day.diaperDirty}
              bottomColor="#eab308"
              topColor="#92400e"
              maxHeight={maxCount}
            />
          );
        })}
      </View>

      {/* X-axis labels */}
      <View className="flex-row mt-1">
        {data.map((day, i) => {
          const show =
            data.length <= 7 ||
            (data.length <= 14 && i % 2 === 0) ||
            (data.length > 14 && i % 5 === 0);
          return (
            <View key={day.date} style={{ flex: 1, alignItems: "center" }}>
              <Text className="text-[9px] text-gray-400">
                {show ? shortDate(day.date) : ""}
              </Text>
            </View>
          );
        })}
      </View>

      <View className="flex-row items-center mt-2 gap-3">
        <View className="flex-row items-center gap-1">
          <View className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#eab308" }} />
          <Text className="text-xs text-gray-500">Wet</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <View className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#92400e" }} />
          <Text className="text-xs text-gray-500">Dirty</Text>
        </View>
      </View>
    </View>
  );
}

function PumpChart({ data }: { data: TrendDay[] }) {
  const hasData = data.some((d) => d.pumpOz > 0 || d.pumpCount > 0);
  if (!hasData) return null;

  const hasOz = data.some((d) => d.pumpOz > 0);
  const maxVal = Math.max(
    ...data.map((d) => (hasOz ? d.pumpOz : d.pumpCount)),
    1
  );

  return (
    <View className="bg-gray-50 rounded-xl p-4 mb-4">
      <Text className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
        Pump Trend
      </Text>
      <Text className="text-xs text-gray-400 mb-3">
        Daily {hasOz ? "oz pumped" : "pump sessions"}
      </Text>

      <View style={{ height: CHART_HEIGHT }} className="flex-row items-end gap-0.5">
        {data.map((day) => (
          <Bar
            key={day.date}
            height={hasOz ? day.pumpOz : day.pumpCount}
            color="#ec4899"
            maxHeight={maxVal}
          />
        ))}
      </View>

      <View className="flex-row mt-1">
        {data.map((day, i) => {
          const show =
            data.length <= 7 ||
            (data.length <= 14 && i % 2 === 0) ||
            (data.length > 14 && i % 5 === 0);
          return (
            <View key={day.date} style={{ flex: 1, alignItems: "center" }}>
              <Text className="text-[9px] text-gray-400">
                {show ? shortDate(day.date) : ""}
              </Text>
            </View>
          );
        })}
      </View>

      <View className="flex-row items-center mt-2 gap-3">
        <View className="flex-row items-center gap-1">
          <View className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#ec4899" }} />
          <Text className="text-xs text-gray-500">Daily</Text>
        </View>
      </View>
    </View>
  );
}

export default function Trends() {
  const { data: babies } = useBabies();
  const baby = babies?.[0];

  const [range, setRange] = useState<7 | 14 | 30>(7);
  const { data: trendData, isLoading } = useTrends(baby?.id, range);

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="px-4 pt-4 pb-10">
        {/* Range Selector */}
        <View className="flex-row bg-gray-100 rounded-lg p-1 mb-5">
          {RANGES.map((r) => (
            <TouchableOpacity
              key={r.key}
              className={`flex-1 py-2 rounded-md items-center ${
                range === r.key ? "bg-white shadow-sm" : ""
              }`}
              onPress={() => setRange(r.key as 7 | 14 | 30)}
            >
              <Text
                className={`text-sm font-medium ${
                  range === r.key ? "text-blue-600" : "text-gray-500"
                }`}
              >
                {r.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {isLoading ? (
          <View className="py-20 items-center">
            <ActivityIndicator size="large" color="#2563eb" />
          </View>
        ) : trendData && trendData.length > 0 ? (
          <>
            <FeedingChart data={trendData} />
            <PumpChart data={trendData} />
            <SleepChart data={trendData} />
            <DiaperChart data={trendData} />

            <Text className="text-xs text-gray-400 text-center mt-2">
              Tap a bar to view that day's summary (coming soon)
            </Text>
          </>
        ) : (
          <View className="py-20 items-center">
            <Text className="text-gray-400">
              No data yet. Start logging to see trends!
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
