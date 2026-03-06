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
import { colors } from "../../constants/theme";

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
  onPress,
}: {
  height: number;
  color: string;
  maxHeight: number;
  onPress?: () => void;
}) {
  const h = maxHeight > 0 ? Math.max(2, (height / maxHeight) * CHART_HEIGHT) : 2;
  return (
    <TouchableOpacity
      style={{ height: h, backgroundColor: color, borderRadius: 2, flex: 1 }}
      onPress={onPress}
      activeOpacity={0.7}
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
  onPress,
}: {
  bottom: number;
  top: number;
  bottomColor: string;
  topColor: string;
  maxHeight: number;
  onPress?: () => void;
}) {
  const total = bottom + top;
  const totalH =
    maxHeight > 0 ? Math.max(2, (total / maxHeight) * CHART_HEIGHT) : 2;
  const bottomH = total > 0 ? (bottom / total) * totalH : 1;
  const topH = total > 0 ? (top / total) * totalH : 1;

  return (
    <TouchableOpacity
      style={{ height: totalH, flex: 1, borderRadius: 2, overflow: "hidden" }}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={{ height: topH, backgroundColor: topColor }} />
      <View style={{ height: bottomH, backgroundColor: bottomColor }} />
    </TouchableOpacity>
  );
}

function navigateToDay(dateStr: string) {
  router.push({ pathname: "/(tabs)/summary", params: { date: dateStr } });
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
    <View className="bg-navy-card border border-navy-border rounded-2xl p-4 mb-4">
      <Text className="text-[11px] text-ash uppercase font-body-bold mb-1">
        Feeding Trend
      </Text>
      <Text className="text-xs text-ash mb-3">
        Daily {hasOz ? "oz (bottle)" : "feed count"}
      </Text>

      <View style={{ height: CHART_HEIGHT }} className="flex-row items-end gap-0.5">
        {data.map((day) => (
          <Bar
            key={day.date}
            height={hasOz ? day.feedOz : day.feedCount}
            color={colors.amber}
            maxHeight={maxVal}
            onPress={() => navigateToDay(day.date)}
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
              backgroundColor: colors.ember,
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
              <Text className="text-[9px] text-ash">
                {show ? shortDate(day.date) : ""}
              </Text>
            </View>
          );
        })}
      </View>

      <View className="flex-row items-center mt-2 gap-3">
        <View className="flex-row items-center gap-1">
          <View className="w-3 h-3 rounded-sm bg-amber" />
          <Text className="text-xs text-ash">Daily</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <View className="w-3 h-1 rounded-sm bg-ember opacity-60" />
          <Text className="text-xs text-ash">Rolling avg</Text>
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
    <View className="bg-navy-card border border-navy-border rounded-2xl p-4 mb-4">
      <Text className="text-[11px] text-ash uppercase font-body-bold mb-1">
        Sleep Trend
      </Text>
      <Text className="text-xs text-ash mb-3">
        Night vs. nap hours per day
      </Text>

      <View style={{ height: CHART_HEIGHT }} className="flex-row items-end gap-0.5">
        {data.map((day) => (
          <StackedBar
            key={day.date}
            bottom={day.nightSleepHrs}
            top={day.napHrs}
            bottomColor={colors.navyBorder}
            topColor={colors.honey}
            maxHeight={maxHrs}
            onPress={() => navigateToDay(day.date)}
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
              <Text className="text-[9px] text-ash">
                {show ? shortDate(day.date) : ""}
              </Text>
            </View>
          );
        })}
      </View>

      <View className="flex-row items-center mt-2 gap-3">
        <View className="flex-row items-center gap-1">
          <View className="w-3 h-3 rounded-sm" style={{ backgroundColor: colors.navyBorder }} />
          <Text className="text-xs text-ash">Night</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <View className="w-3 h-3 rounded-sm" style={{ backgroundColor: colors.honey }} />
          <Text className="text-xs text-ash">Naps</Text>
        </View>
      </View>
    </View>
  );
}

function DiaperChart({ data }: { data: TrendDay[] }) {
  const maxCount = Math.max(...data.map((d) => d.diaperCount), 1);

  return (
    <View className="bg-navy-card border border-navy-border rounded-2xl p-4 mb-4">
      <Text className="text-[11px] text-ash uppercase font-body-bold mb-1">
        Diaper Trend
      </Text>
      <Text className="text-xs text-ash mb-3">Daily diaper count</Text>

      <View style={{ height: CHART_HEIGHT }} className="flex-row items-end gap-0.5">
        {data.map((day) => {
          const total = day.diaperCount;
          const totalH =
            maxCount > 0
              ? Math.max(2, (total / maxCount) * CHART_HEIGHT)
              : 2;
          const wetH = total > 0 ? (day.diaperWet / total) * totalH : 1;
          const dirtyH = total > 0 ? (day.diaperDirty / total) * totalH : 1;
          return (
            <StackedBar
              key={day.date}
              bottom={day.diaperWet}
              top={day.diaperDirty}
              bottomColor={colors.honey}
              topColor="#92400e"
              maxHeight={maxCount}
              onPress={() => navigateToDay(day.date)}
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
              <Text className="text-[9px] text-ash">
                {show ? shortDate(day.date) : ""}
              </Text>
            </View>
          );
        })}
      </View>

      <View className="flex-row items-center mt-2 gap-3">
        <View className="flex-row items-center gap-1">
          <View className="w-3 h-3 rounded-sm" style={{ backgroundColor: colors.honey }} />
          <Text className="text-xs text-ash">Wet</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <View className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#92400e" }} />
          <Text className="text-xs text-ash">Dirty</Text>
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
    <View className="bg-navy-card border border-navy-border rounded-2xl p-4 mb-4">
      <Text className="text-[11px] text-ash uppercase font-body-bold mb-1">
        Pump Trend
      </Text>
      <Text className="text-xs text-ash mb-3">
        Daily {hasOz ? "oz pumped" : "pump sessions"}
      </Text>

      <View style={{ height: CHART_HEIGHT }} className="flex-row items-end gap-0.5">
        {data.map((day) => (
          <Bar
            key={day.date}
            height={hasOz ? day.pumpOz : day.pumpCount}
            color={colors.ember}
            maxHeight={maxVal}
            onPress={() => navigateToDay(day.date)}
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
              <Text className="text-[9px] text-ash">
                {show ? shortDate(day.date) : ""}
              </Text>
            </View>
          );
        })}
      </View>

      <View className="flex-row items-center mt-2 gap-3">
        <View className="flex-row items-center gap-1">
          <View className="w-3 h-3 rounded-sm" style={{ backgroundColor: colors.ember }} />
          <Text className="text-xs text-ash">Daily</Text>
        </View>
      </View>
    </View>
  );
}

export default function Trends() {
  const { data: babies } = useBabies();
  const baby = babies?.[0];

  const [range, setRange] = useState<7 | 14 | 30>(7);

  // Pre-fetch all ranges so switching is instant
  const trends7 = useTrends(baby?.id, 7);
  const trends14 = useTrends(baby?.id, 14);
  const trends30 = useTrends(baby?.id, 30);

  const trendsMap = { 7: trends7, 14: trends14, 30: trends30 } as const;
  const { data: trendData, isLoading } = trendsMap[range];

  return (
    <ScrollView className="flex-1 bg-midnight">
      <View className="px-4 pt-4 pb-10">
        {/* Range Selector */}
        <View className="flex-row bg-navy-raise rounded-lg p-1 mb-5 border border-navy-border">
          {RANGES.map((r) => (
            <TouchableOpacity
              key={r.key}
              className={`flex-1 py-2 rounded-md items-center ${
                range === r.key ? "bg-navy-card" : ""
              }`}
              onPress={() => setRange(r.key as 7 | 14 | 30)}
            >
              <Text
                className={`text-sm font-body-medium ${
                  range === r.key ? "text-amber" : "text-ash"
                }`}
              >
                {r.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {isLoading ? (
          <View className="py-20 items-center">
            <ActivityIndicator size="large" color={colors.amber} />
          </View>
        ) : trendData && trendData.length > 0 ? (
          <>
            <FeedingChart data={trendData} />
            <PumpChart data={trendData} />
            <SleepChart data={trendData} />
            <DiaperChart data={trendData} />

            <Text className="text-xs text-ash text-center mt-2">
              Tap a bar to view that day's summary
            </Text>
          </>
        ) : (
          <View className="py-20 items-center">
            <Text className="text-ash">
              No data yet. Start logging to see trends!
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
