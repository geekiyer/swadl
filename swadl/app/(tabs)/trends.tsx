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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { useBabies, useTrends, type TrendDay } from "../../lib/queries";
import { colors } from "../../constants/theme";
import { useThemeColors } from "../../lib/theme";
import { NurseryMobileArt } from "../../components/NurseryMobileArt";
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

function ChartEmpty({ label, hint }: { label: string; hint: string }) {
  // Fake bar heights to suggest a chart silhouette
  const placeholderBars = [0.2, 0.35, 0.15, 0.5, 0.3, 0.45, 0.25];
  const tc = useThemeColors();
  return (
    <View className="bg-card-bg border border-border-main rounded-2xl p-4 mb-4">
      <Text className="text-[11px] text-text-secondary uppercase font-body-bold mb-1">{label}</Text>
      <View style={{ height: CHART_HEIGHT, position: "relative" }}>
        {/* Ghost bars */}
        <View style={{ height: CHART_HEIGHT, flexDirection: "row", alignItems: "flex-end", gap: 4, paddingHorizontal: 8 }}>
          {placeholderBars.map((h, i) => (
            <View
              key={i}
              style={{
                flex: 1,
                height: h * CHART_HEIGHT,
                backgroundColor: tc.border,
                borderRadius: 2,
                opacity: 0.35,
              }}
            />
          ))}
        </View>
        {/* Overlay message */}
        <View
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, justifyContent: "center", alignItems: "center" }}
        >
          <View className="bg-card-bg/90 rounded-xl px-5 py-3 border border-border-main">
            <Text className="text-text-secondary font-body-medium text-sm text-center">{hint}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function FeedingChart({ data, revealKey }: { data: TrendDay[]; revealKey: string }) {
  const hasData = data.some((d) => d.feedOz > 0 || d.feedCount > 0);
  if (!hasData) return <ChartEmpty label="Feeding Trend" hint="Log a feed to see trends" />;

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
    <View className="bg-card-bg border border-border-main rounded-2xl p-4 mb-4">
      <Text className="text-[11px] text-text-secondary uppercase font-body-bold mb-1">
        Feeding Trend
      </Text>
      <Text className="text-xs text-text-secondary mb-3">
        Daily {hasOz ? "oz (bottle)" : "feed count"}
      </Text>

      <View style={{ height: CHART_HEIGHT, position: "relative" }}>
        {/* Bars */}
        <View style={{ height: CHART_HEIGHT, flexDirection: "row", alignItems: "flex-end", gap: 2 }}>
          {data.map((day, i) => (
            <Bar
              key={day.date}
              height={hasOz ? day.feedOz : day.feedCount}
              color={colors.feedPrimary}
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
                <View style={{ position: "absolute", bottom: dotBottom, width: 5, height: 5, borderRadius: 3, backgroundColor: colors.pumpPrimary, opacity: 0.8 }} />
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
              <Text className="text-[9px] text-text-secondary">
                {show ? shortDate(day.date) : ""}
              </Text>
            </View>
          );
        })}
      </View>

      <View className="flex-row items-center mt-2 gap-3">
        <View className="flex-row items-center gap-1">
          <View className="w-3 h-3 rounded-sm bg-feed-primary" />
          <Text className="text-xs text-text-secondary">Daily</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <View className="w-3 h-1 rounded-sm bg-pump-primary opacity-60" />
          <Text className="text-xs text-text-secondary">Rolling avg</Text>
        </View>
      </View>
    </View>
  );
}

function SleepChart({ data, revealKey }: { data: TrendDay[]; revealKey: string }) {
  const hasData = data.some((d) => d.nightSleepHrs > 0 || d.napHrs > 0);
  if (!hasData) return <ChartEmpty label="Sleep Trend" hint="Log sleep to see trends" />;
  const tc = useThemeColors();

  const maxHrs = Math.max(
    ...data.map((d) => d.nightSleepHrs + d.napHrs),
    1
  );

  return (
    <View className="bg-card-bg border border-border-main rounded-2xl p-4 mb-4">
      <Text className="text-[11px] text-text-secondary uppercase font-body-bold mb-1">
        Sleep Trend
      </Text>
      <Text className="text-xs text-text-secondary mb-3">
        Night vs. nap hours per day
      </Text>

      <View style={{ height: CHART_HEIGHT }} className="flex-row items-end gap-0.5">
        {data.map((day, i) => (
          <StackedBar
            key={day.date}
            bottom={day.nightSleepHrs}
            top={day.napHrs}
            bottomColor={tc.border}
            topColor={colors.sleepPrimary}
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
              <Text className="text-[9px] text-text-secondary">
                {show ? shortDate(day.date) : ""}
              </Text>
            </View>
          );
        })}
      </View>

      <View className="flex-row items-center mt-2 gap-3">
        <View className="flex-row items-center gap-1">
          <View className="w-3 h-3 rounded-sm" style={{ backgroundColor: tc.border }} />
          <Text className="text-xs text-text-secondary">Night</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <View className="w-3 h-3 rounded-sm" style={{ backgroundColor: colors.sleepPrimary }} />
          <Text className="text-xs text-text-secondary">Naps</Text>
        </View>
      </View>
    </View>
  );
}

function DiaperChart({ data, revealKey }: { data: TrendDay[]; revealKey: string }) {
  const hasData = data.some((d) => d.diaperCount > 0);
  if (!hasData) return <ChartEmpty label="Diaper Trend" hint="Log a diaper change to see trends" />;

  const maxCount = Math.max(...data.map((d) => d.diaperCount), 1);

  return (
    <View className="bg-card-bg border border-border-main rounded-2xl p-4 mb-4">
      <Text className="text-[11px] text-text-secondary uppercase font-body-bold mb-1">
        Diaper Trend
      </Text>
      <Text className="text-xs text-text-secondary mb-3">Daily diaper count</Text>

      <View style={{ height: CHART_HEIGHT }} className="flex-row items-end gap-0.5">
        {data.map((day, i) => {
          return (
            <StackedBar
              key={day.date}
              bottom={day.diaperWet}
              top={day.diaperDirty}
              bottomColor={colors.diaperPrimary}
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
              <Text className="text-[9px] text-text-secondary">
                {show ? shortDate(day.date) : ""}
              </Text>
            </View>
          );
        })}
      </View>

      <View className="flex-row items-center mt-2 gap-3">
        <View className="flex-row items-center gap-1">
          <View className="w-3 h-3 rounded-sm" style={{ backgroundColor: colors.diaperPrimary }} />
          <Text className="text-xs text-text-secondary">Wet</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <View className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#92400e" }} />
          <Text className="text-xs text-text-secondary">Dirty</Text>
        </View>
      </View>
    </View>
  );
}

function PumpChart({ data, revealKey }: { data: TrendDay[]; revealKey: string }) {
  const hasData = data.some((d) => d.pumpOz > 0 || d.pumpCount > 0);
  if (!hasData) return <ChartEmpty label="Pump Trend" hint="Log a pump session to see trends" />;

  const hasOz = data.some((d) => d.pumpOz > 0);
  const maxVal = Math.max(
    ...data.map((d) => (hasOz ? d.pumpOz : d.pumpCount)),
    1
  );

  return (
    <View className="bg-card-bg border border-border-main rounded-2xl p-4 mb-4">
      <Text className="text-[11px] text-text-secondary uppercase font-body-bold mb-1">
        Pump Trend
      </Text>
      <Text className="text-xs text-text-secondary mb-3">
        Daily {hasOz ? "oz pumped" : "pump sessions"}
      </Text>

      <View style={{ height: CHART_HEIGHT }} className="flex-row items-end gap-0.5">
        {data.map((day, i) => (
          <Bar
            key={day.date}
            height={hasOz ? day.pumpOz : day.pumpCount}
            color={colors.pumpPrimary}
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
              <Text className="text-[9px] text-text-secondary">
                {show ? shortDate(day.date) : ""}
              </Text>
            </View>
          );
        })}
      </View>

      <View className="flex-row items-center mt-2 gap-3">
        <View className="flex-row items-center gap-1">
          <View className="w-3 h-3 rounded-sm" style={{ backgroundColor: colors.pumpPrimary }} />
          <Text className="text-xs text-text-secondary">Daily</Text>
        </View>
      </View>
    </View>
  );
}

export default function Trends() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { data: babies } = useBabies();
  const baby = babies?.[0];
  const tc = useThemeColors();

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
    <View style={{ flex: 1 }} className="bg-screen-bg">
      <ScrollView
        style={{ flex: 1 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.feedPrimary}
          colors={[colors.feedPrimary]}
        />
      }
    >
      <View style={{ paddingHorizontal: 16, paddingTop: insets.top + 16, paddingBottom: 40 }}>
        <View style={{ position: 'relative', minHeight: 60 }}>
          <NurseryMobileArt theme={tc.mode} screen="trends" />
        </View>
        {/* Range Selector */}
        <View className="flex-row bg-raised-bg rounded-lg p-1 mb-5 border border-border-main">
          {RANGES.map((r) => (
            <TouchableOpacity
              key={r.key}
              className={`flex-1 py-2 rounded-md items-center ${
                range === r.key ? "bg-card-bg" : ""
              }`}
              onPress={() => setRange(r.key as 7 | 14 | 30)}
            >
              <Text
                className={`text-sm font-body-medium ${
                  range === r.key ? "text-feed-primary" : "text-text-secondary"
                }`}
              >
                {r.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {isLoading ? (
          <View className="py-20 items-center">
            <ActivityIndicator size="large" color={colors.feedPrimary} />
          </View>
        ) : trendData && trendData.length > 0 ? (
          <>
            <FeedingChart data={trendData} revealKey={revealKey} />
            <PumpChart data={trendData} revealKey={revealKey} />
            <SleepChart data={trendData} revealKey={revealKey} />
            <DiaperChart data={trendData} revealKey={revealKey} />

            <Text className="text-xs text-text-secondary text-center mt-2">
              Tap a bar to view that day's summary
            </Text>
          </>
        ) : (
          <View className="py-20 items-center">
            <Text className="text-text-secondary">
              No data yet. Start logging to see trends!
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
    </View>
  );
}
