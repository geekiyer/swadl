import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { router } from "expo-router";
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

  const isTogether = careMode === "together";
  const caregiverName = activeShift?.caregiver_display_name;

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="px-4 pt-4 pb-8">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-2xl font-bold">
            {baby ? baby.name : "Dashboard"}
          </Text>
          <Text className="text-gray-400 text-sm mt-0.5">
            Hi, {profile?.display_name ?? "there"}
          </Text>
        </View>

        {/* Together mode: Activity Feed | Shifts/Nanny mode: Shift Banner */}
        {isTogether ? (
          <View className="mb-5">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                Recent Activity
              </Text>
              <TouchableOpacity onPress={() => router.push("/briefing")}>
                <Text className="text-sm text-blue-600">Daily Briefing</Text>
              </TouchableOpacity>
            </View>
            <ActivityFeed babyId={baby?.id} />
          </View>
        ) : (
          <TouchableOpacity
            className="bg-blue-50 rounded-xl p-4 mb-5 flex-row items-center justify-between"
            onPress={() => router.push("/briefing")}
            activeOpacity={0.7}
          >
            <View>
              <Text className="text-xs text-blue-500 uppercase tracking-wide font-medium">
                On Shift
              </Text>
              <Text className="text-base font-semibold mt-0.5">
                {caregiverName ?? "No one"}
              </Text>
            </View>
            <View className="bg-blue-600 rounded-lg px-3 py-2">
              <Text className="text-white text-sm font-medium">Hand Off</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Status Cards */}
        <View className="flex-row mb-5">
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
          <StatusCard
            title="Last Diaper"
            value={timeAgo(latestDiaper?.logged_at)}
            subtitle={latestDiaper?.type ?? undefined}
            onPress={() => router.push("/log/diaper")}
          />
        </View>
        <View className="flex-row mb-5">
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
          <Text className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">
            Current Mood
          </Text>
          <MoodPicker />
        </View>

        {/* Next Tasks */}
        <View>
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-xs text-gray-500 uppercase tracking-wide font-medium">
              Next Tasks
            </Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/chores")}>
              <Text className="text-sm text-blue-600">View All</Text>
            </TouchableOpacity>
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
            <View className="bg-gray-50 rounded-lg p-4 items-center">
              <Text className="text-gray-400">All caught up!</Text>
            </View>
          )}
        </View>

        {/* Quick Log FAB area */}
        <View className="flex-row flex-wrap justify-around mt-6 pt-4 border-t border-gray-100 gap-y-3">
          <TouchableOpacity
            className="bg-blue-600 rounded-full px-5 py-3"
            onPress={() => router.push("/log/feed")}
          >
            <Text className="text-white font-medium">Log Feed</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-green-600 rounded-full px-5 py-3"
            onPress={() => router.push("/log/diaper")}
          >
            <Text className="text-white font-medium">Log Diaper</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-purple-600 rounded-full px-5 py-3"
            onPress={() => router.push("/log/sleep")}
          >
            <Text className="text-white font-medium">Log Sleep</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-pink-600 rounded-full px-5 py-3"
            onPress={() => router.push("/log/pump")}
          >
            <Text className="text-white font-medium">Log Pump</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
