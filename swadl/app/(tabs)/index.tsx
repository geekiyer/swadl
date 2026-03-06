import { useCallback } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
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
  useActiveShift,
  useNextTasks,
  useCompleteChore,
  useDashboardRealtime,
} from "../../lib/queries";
import { useCareMode } from "../../lib/careMode";
import { shadows, colors } from "../../constants/theme";
import { Baby, Moon, Droplets } from "lucide-react-native";

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

export default function Dashboard() {
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();
  const { data: babies } = useBabies();
  const baby = babies?.[0]; // Default to first baby (multi-baby selector in header for Phase 2)

  const { data: latestFeed } = useLatestFeed(baby?.id);
  const { data: latestDiaper } = useLatestDiaper(baby?.id);
  const { data: latestSleep } = useLatestSleep(baby?.id);
  const { careMode } = useCareMode();
  const { data: activeShift } = useActiveShift();
  const { data: nextTasks } = useNextTasks(3);
  const completeChore = useCompleteChore();

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

  const isTogether = careMode.isTogether;
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

        {/* Status Cards — 3-column: feed, sleep, diaper */}
        <View className="flex-row mb-5">
          <StatusCard
            icon={Baby}
            iconBgColor="rgba(245, 158, 11, 0.15)"
            iconColor={colors.amber}
            label="Last Fed"
            value={latestFeed?.type?.replace("_", " ") ?? "No data"}
            timeAgo={timeAgo(latestFeed?.started_at)}
            onPress={() => router.push("/log/feed")}
          />
          <StatusCard
            icon={Moon}
            iconBgColor="rgba(90, 200, 250, 0.15)"
            iconColor={colors.info}
            label="Last Sleep"
            value={
              latestSleep?.ended_at
                ? latestSleep.location ?? "Awake"
                : latestSleep?.started_at
                  ? "Sleeping"
                  : "No data"
            }
            timeAgo={
              latestSleep?.ended_at
                ? timeAgo(latestSleep.ended_at)
                : latestSleep?.started_at
                  ? timeAgo(latestSleep.started_at)
                  : ""
            }
            onPress={() => router.push("/log/sleep")}
          />
          <StatusCard
            icon={Droplets}
            iconBgColor="rgba(251, 191, 36, 0.15)"
            iconColor={colors.honey}
            label="Last Diaper"
            value={latestDiaper?.type ?? "No data"}
            timeAgo={timeAgo(latestDiaper?.logged_at)}
            onPress={() => router.push("/log/diaper")}
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
