import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from "react-native-reanimated";
import { router } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { useBabies, useTrends, type TrendDay } from "../../lib/queries";
import { colors } from "../../constants/theme";
import { Timings, STAGGER_MS } from "../../constants/animation";

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

// Animated bar component with staggered reveal
function Bar({
  height,
  color,
  maxHeight,
  index,
  revealKey,
  onPress,
}: {
  height: number;
  color: string;
  maxHeight: number;
  index: number;
  revealKey: string;
  onPress?: () => void;
}) {
  const targetH = height > 0 && maxHeight > 0
    ? Math.max(2, (height / maxHeight) * CHART_HEIGHT)
    : 0;
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = 0;
    if (targetH > 0) {
      scale.value = withDelay(
        index * STAGGER_MS,
        withTiming(1, Timings.chart)
      );
    }
  }, [revealKey]);

  const animStyle = useAnimatedStyle(() => ({
    height: targetH * scale.value,
    backgroundColor: color,
    borderRadius: 2,
  }));

  if (targetH === 0) {
    return <View style={{ flex: 1 }} />;
  }

  return (
    <TouchableOpacity
      style={{ flex: 1, justifyContent: "flex-end" }}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Animated.View style={animStyle} />
    </TouchableOpacity>
  );
}

// Animated stacked bar with staggered reveal
function StackedBar({
  bottom,
  top,
  bottomColor,
  topColor,
  maxHeight,
  index,
  revealKey,
  onPress,
}: {
  bottom: number;
  top: number;
  bottomColor: string;
  topColor: string;
  maxHeight: number;
  index: number;
  revealKey: string;
  onPress?: () => void;
}) {
  const total = bottom + top;
  const totalH =
    total > 0 && maxHeight > 0
      ? Math.max(2, (total / maxHeight) * CHART_HEIGHT)
      : 0;
  // Use flex proportions so they scale correctly inside the animated container
  const topFlex = total > 0 ? top / total : 0;
  const bottomFlex = total > 0 ? bottom / total : 0;

  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = 0;
    if (totalH > 0) {
      scale.value = withDelay(
        index * STAGGER_MS,
        withTiming(1, Timings.chart)
      );
    }
  }, [revealKey]);

  const animStyle = useAnimatedStyle(() => ({
    height: totalH * scale.value,
    borderRadius: 2,
    overflow: "hidden" as const,
  }));

  if (totalH === 0) {
    return <View style={{ flex: 1 }} />;
  }

  return (
    <TouchableOpacity
      style={{ flex: 1, justifyContent: "flex-end" }}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Animated.View style={animStyle}>
        <View style={{ flex: topFlex, backgroundColor: topColor }} />
        <View style={{ flex: bottomFlex, backgroundColor: bottomColor }} />
      </Animated.View>
    </TouchableOpacity>
  );
}

function navigateToDay(dateStr: string) {
  router.push({ pathname: "/(tabs)/summary", params: { date: dateStr } });
}

function FeedingChart({ data, revealKey }: { data: TrendDay[]; revealKey: string }) {
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

      <View style={{ height: CHART_HEIGHT, position: "relative" }}>
        {/* Bars */}
        <View style={{ height: CHART_HEIGHT, flexDirection: "row", alignItems: "flex-end", gap: 2 }}>
          {data.map((day, i) => (
            <Bar
              key={day.date}
              height={hasOz ? day.feedOz : day.feedCount}
              color={colors.amber}
              maxHeight={maxVal}
              index={i}
              revealKey={revealKey}
              onPress={() => navigateToDay(day.date)}
            />
          ))}
        </View>

        {/* Rolling average dots overlay */}
        <View style={{ position: "absolute", top: 0, left: 0, right: 0, height: CHART_HEIGHT, flexDirection: "row", alignItems: "flex-end", gap: 2 }}>
          {avgValues.map((val, i) => {
            const dotBottom = maxVal > 0 ? (val / maxVal) * (CHART_HEIGHT - 6) : 0;
            return (
              <View key={i} style={{ flex: 1, alignItems: "center" }}>
                <View style={{ position: "absolute", bottom: dotBottom, width: 5, height: 5, borderRadius: 3, backgroundColor: colors.ember, opacity: 0.8 }} />
              </View>
            );
          })}
        </View>
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

function SleepChart({ data, revealKey }: { data: TrendDay[]; revealKey: string }) {
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
        {data.map((day, i) => (
          <StackedBar
            key={day.date}
            bottom={day.nightSleepHrs}
            top={day.napHrs}
            bottomColor={colors.navyBorder}
            topColor={colors.honey}
            maxHeight={maxHrs}
            index={i}
            revealKey={revealKey}
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

function DiaperChart({ data, revealKey }: { data: TrendDay[]; revealKey: string }) {
  const maxCount = Math.max(...data.map((d) => d.diaperCount), 1);

  return (
    <View className="bg-navy-card border border-navy-border rounded-2xl p-4 mb-4">
      <Text className="text-[11px] text-ash uppercase font-body-bold mb-1">
        Diaper Trend
      </Text>
      <Text className="text-xs text-ash mb-3">Daily diaper count</Text>

      <View style={{ height: CHART_HEIGHT }} className="flex-row items-end gap-0.5">
        {data.map((day, i) => {
          return (
            <StackedBar
              key={day.date}
              bottom={day.diaperWet}
              top={day.diaperDirty}
              bottomColor={colors.honey}
              topColor="#92400e"
              maxHeight={maxCount}
              index={i}
              revealKey={revealKey}
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

function PumpChart({ data, revealKey }: { data: TrendDay[]; revealKey: string }) {
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
        {data.map((day, i) => (
          <Bar
            key={day.date}
            height={hasOz ? day.pumpOz : day.pumpCount}
            color={colors.ember}
            maxHeight={maxVal}
            index={i}
            revealKey={revealKey}
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
  const queryClient = useQueryClient();
  const { data: babies } = useBabies();
  const baby = babies?.[0];

  const [range, setRange] = useState<7 | 14 | 30>(7);
  const [refreshing, setRefreshing] = useState(false);

  // Pre-fetch all ranges so switching is instant
  const trends7 = useTrends(baby?.id, 7);
  const trends14 = useTrends(baby?.id, 14);
  const trends30 = useTrends(baby?.id, 30);

  const trendsMap = { 7: trends7, 14: trends14, 30: trends30 } as const;
  const { data: trendData, isLoading } = trendsMap[range];

  // revealKey changes when range or data changes, triggering bar animations
  const revealKey = `${range}-${trendData?.length ?? 0}`;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ["trends"] });
    setRefreshing(false);
  }, [queryClient]);

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
            <FeedingChart data={trendData} revealKey={revealKey} />
            <PumpChart data={trendData} revealKey={revealKey} />
            <SleepChart data={trendData} revealKey={revealKey} />
            <DiaperChart data={trendData} revealKey={revealKey} />

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
