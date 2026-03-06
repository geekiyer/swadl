import { useCallback } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import Animated from "react-native-reanimated";
import { router, useFocusEffect } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { StatusCard } from "../../components/StatusCard";
import { MoodPicker } from "../../components/MoodPicker";
import { TaskItem } from "../../components/TaskItem";
import { ActivityFeed } from "../../components/ActivityFeed";
import {
  useProfile,
  useBabies,
  useLatestFeed,
  useLatestDiaper,
  useLatestSleep,
  useLatestPump,
  useActiveShift,
  useNextTasks,
  useCompleteChore,
  useDashboardRealtime,
} from "../../lib/queries";
import { useCareMode } from "../../lib/careMode";
import { useUnitStore, displayVolume } from "../../lib/store";
import { usePressSpring } from "../../hooks/usePressSpring";
import { shadows } from "../../constants/theme";

function timeAgo(dateStr: string | undefined | null): string {
  if (!dateStr) return "No data";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function Dashboard() {
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();
  const { data: babies } = useBabies();
  const baby = babies?.[0]; // Default to first baby (multi-baby selector in header for Phase 2)

  const { data: latestFeed } = useLatestFeed(baby?.id);
  const { data: latestDiaper } = useLatestDiaper(baby?.id);
  const { data: latestSleep } = useLatestSleep(baby?.id);
  const { data: latestPump } = useLatestPump(baby?.id);
  const { data: careMode } = useCareMode();
  const { data: activeShift } = useActiveShift();
  const { data: nextTasks } = useNextTasks(3);
  const completeChore = useCompleteChore();

  const unit = useUnitStore((s) => s.unit);
  useDashboardRealtime();

  // Refetch dashboard data whenever screen comes into focus (e.g. returning from a logger)
  useFocusEffect(
    useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ["latest-feed"] });
      queryClient.invalidateQueries({ queryKey: ["latest-diaper"] });
      queryClient.invalidateQueries({ queryKey: ["latest-sleep"] });
      queryClient.invalidateQueries({ queryKey: ["latest-pump"] });
      queryClient.invalidateQueries({ queryKey: ["recent-activity"] });
      queryClient.invalidateQueries({ queryKey: ["next-tasks"] });
    }, [queryClient])
  );

  const isTogether = careMode === "together";
  const caregiverName = activeShift?.caregiver_display_name;

  return (
    <ScrollView className="flex-1 bg-midnight">
      <View className="px-4 pt-4 pb-8">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-2xl text-white font-display" style={{ letterSpacing: -1 }}>
            {baby ? baby.name : "Dashboard"}
          </Text>
          <Text className="text-ash text-sm mt-0.5 font-body">
            Hi, {profile?.display_name ?? "there"}
          </Text>
        </View>

        {/* Quick Log buttons — above the fold for one-handed access */}
        <View className="flex-row justify-between mb-5 gap-2">
          <Pressable
            className="bg-amber rounded-xl px-4 py-3 flex-1 items-center"
            onPress={() => router.push("/log/feed")}
            style={shadows.amber}
          >
            <Text className="text-midnight font-body-semibold">Feed</Text>
          </Pressable>
          <Pressable
            className="bg-honey rounded-xl px-4 py-3 flex-1 items-center"
            onPress={() => router.push("/log/diaper")}
          >
            <Text className="text-midnight font-body-semibold">Diaper</Text>
          </Pressable>
          <Pressable
            className="bg-info rounded-xl px-4 py-3 flex-1 items-center"
            onPress={() => router.push("/log/sleep")}
          >
            <Text className="text-midnight font-body-semibold">Sleep</Text>
          </Pressable>
          <Pressable
            className="bg-ember rounded-xl px-4 py-3 flex-1 items-center"
            onPress={() => router.push("/log/pump")}
          >
            <Text className="text-white font-body-semibold">Pump</Text>
          </Pressable>
        </View>

        {/* Together mode: Activity Feed | Shifts/Nanny mode: Shift Banner */}
        {isTogether ? (
          <View className="mb-5">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-[11px] text-ash uppercase font-body-semibold" style={{ letterSpacing: 2.5 }}>
                Recent Activity
              </Text>
              <Pressable onPress={() => router.push("/briefing")}>
                <Text className="text-sm text-amber font-body-semibold">Daily Briefing</Text>
              </Pressable>
            </View>
            <ActivityFeed babyId={baby?.id} />
          </View>
        ) : (
          <Pressable
            className="bg-navy-card border border-navy-border rounded-2xl p-5 mb-5 flex-row items-center justify-between"
            onPress={() => router.push("/briefing")}
            style={shadows.sm}
          >
            <View>
              <Text className="text-[11px] text-amber uppercase font-body-bold" style={{ letterSpacing: 2 }}>
                On Shift
              </Text>
              <Text className="text-base font-body-semibold text-white mt-0.5">
                {caregiverName ?? "No one"}
              </Text>
            </View>
            <View className="bg-amber rounded-xl px-4 py-2">
              <Text className="text-midnight text-sm font-body-semibold">Hand Off</Text>
            </View>
          </Pressable>
        )}

        {/* Status Cards */}
        <View className="flex-row mb-3">
          <StatusCard
            title="Last Fed"
            value={timeAgo(latestFeed?.started_at)}
            subtitle={latestFeed?.type?.replace("_", " ") ?? undefined}
            onPress={() => router.push("/log/feed")}
          />
          <StatusCard
            title="Last Sleep"
            value={
              latestSleep?.ended_at
                ? timeAgo(latestSleep.ended_at)
                : latestSleep?.started_at
                  ? "Sleeping"
                  : "No data"
            }
            subtitle={latestSleep?.location ?? undefined}
            onPress={() => router.push("/log/sleep")}
          />
        </View>
        <View className="flex-row mb-5">
          <StatusCard
            title="Last Diaper"
            value={timeAgo(latestDiaper?.logged_at)}
            subtitle={latestDiaper?.type ?? undefined}
            onPress={() => router.push("/log/diaper")}
          />
          <StatusCard
            title="Last Pump"
            value={
              latestPump?.ended_at
                ? timeAgo(latestPump.ended_at)
                : latestPump?.started_at
                  ? "Pumping"
                  : "No data"
            }
            subtitle={
              latestPump?.amount_oz
                ? displayVolume(latestPump.amount_oz, unit)
                : latestPump?.pump_type?.replace("_", " ") ?? undefined
            }
            onPress={() => router.push("/log/pump")}
          />
        </View>

        {/* Mood Picker */}
        <View className="mb-5">
          <Text className="text-[11px] text-ash uppercase font-body-bold mb-2">
            Current Mood
          </Text>
          <MoodPicker />
        </View>

        {/* Next Tasks */}
        <View>
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-[11px] text-ash uppercase font-body-bold">
              Next Tasks
            </Text>
            <Pressable onPress={() => router.push("/(tabs)/chores")}>
              <Text className="text-sm text-amber font-body-semibold">View All</Text>
            </Pressable>
          </View>

          {nextTasks && nextTasks.length > 0 ? (
            nextTasks.map((task) => {
              const recurrence = task.recurrence as Record<string, any>;
              return (
                <TaskItem
                  key={task.id}
                  title={task.title}
                  time={recurrence?.time ?? undefined}
                  assignee={task.assignee_name ?? undefined}
                  onComplete={() => completeChore.mutate(task.id)}
                />
              );
            })
          ) : (
            <View className="bg-navy-card border border-navy-border rounded-2xl p-4 items-center">
              <Text className="text-ash">All caught up!</Text>
            </View>
          )}
        </View>

      </View>
    </ScrollView>
  );
}
