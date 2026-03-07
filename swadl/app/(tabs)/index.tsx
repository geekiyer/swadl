import { useCallback, useState } from "react";
import { View, Text, ScrollView, Pressable, Modal, FlatList, RefreshControl } from "react-native";
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
  useEnsureTogetherShift,
} from "../../lib/queries";
import { useCareMode } from "../../lib/careMode";
import { shadows, colors } from "../../constants/theme";
import { Baby, Moon, Droplets, ChevronDown } from "lucide-react-native";

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
  const [selectedBabyId, setSelectedBabyId] = useState<string | null>(null);
  const [babyPickerVisible, setBabyPickerVisible] = useState(false);

  // Default to first baby if no selection has been made (or if selected baby no longer exists)
  const resolvedBabyId = selectedBabyId && babies?.some((b) => b.id === selectedBabyId)
    ? selectedBabyId
    : babies?.[0]?.id ?? null;
  const baby = babies?.find((b) => b.id === resolvedBabyId) ?? null;
  const hasMultipleBabies = (babies?.length ?? 0) > 1;

  const { data: latestFeed } = useLatestFeed(resolvedBabyId ?? undefined);
  const { data: latestDiaper } = useLatestDiaper(resolvedBabyId ?? undefined);
  const { data: latestSleep } = useLatestSleep(resolvedBabyId ?? undefined);
  const { careMode } = useCareMode();
  const { data: activeShift } = useActiveShift();
  const { data: nextTasks } = useNextTasks(3);
  const completeChore = useCompleteChore();

  const [refreshing, setRefreshing] = useState(false);

  useDashboardRealtime();
  useEnsureTogetherShift(careMode.mode);

  const invalidateDashboard = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["latest-feed"] });
    queryClient.invalidateQueries({ queryKey: ["latest-diaper"] });
    queryClient.invalidateQueries({ queryKey: ["latest-sleep"] });
    queryClient.invalidateQueries({ queryKey: ["latest-pump"] });
    queryClient.invalidateQueries({ queryKey: ["recent-activity"] });
    queryClient.invalidateQueries({ queryKey: ["next-tasks"] });
  }, [queryClient]);

  // Refetch dashboard data whenever screen comes into focus (e.g. returning from a logger)
  useFocusEffect(invalidateDashboard);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    invalidateDashboard();
    // Give queries a moment to refetch
    await new Promise((r) => setTimeout(r, 800));
    setRefreshing(false);
  }, [invalidateDashboard]);

  const isTogether = careMode.isTogether;
  const caregiverName = activeShift?.caregiver_display_name;

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
      <View className="px-4 pt-4 pb-8">
        {/* Header */}
        <View className="mb-6">
          {hasMultipleBabies ? (
            <Pressable
              className="flex-row items-center"
              onPress={() => setBabyPickerVisible(true)}
            >
              <Text className="text-2xl text-white font-display" style={{ letterSpacing: -1 }}>
                {baby ? baby.name : "Dashboard"}
              </Text>
              <ChevronDown size={20} color={colors.amber} style={{ marginLeft: 6, marginTop: 2 }} />
            </Pressable>
          ) : (
            <Text className="text-2xl text-white font-display" style={{ letterSpacing: -1 }}>
              {baby ? baby.name : "Dashboard"}
            </Text>
          )}
          <Text className="text-ash text-sm mt-0.5 font-body">
            Hi, {profile?.display_name ?? "there"}
          </Text>
        </View>

        {/* Baby Picker Modal */}
        <Modal
          visible={babyPickerVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setBabyPickerVisible(false)}
        >
          <Pressable
            className="flex-1 bg-black/60 justify-center items-center px-6"
            onPress={() => setBabyPickerVisible(false)}
          >
            <View
              className="bg-navy-card border border-navy-border rounded-2xl w-full overflow-hidden"
              onStartShouldSetResponder={() => true}
            >
              <Text
                className="text-[11px] text-ash uppercase font-body-bold px-5 pt-5 pb-2"
                style={{ letterSpacing: 2 }}
              >
                Select Baby
              </Text>
              <FlatList
                data={babies}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                  const isSelected = item.id === resolvedBabyId;
                  return (
                    <Pressable
                      className={`px-5 py-3.5 flex-row items-center justify-between ${
                        isSelected ? "bg-midnight/40" : ""
                      }`}
                      onPress={() => {
                        setSelectedBabyId(item.id);
                        setBabyPickerVisible(false);
                      }}
                    >
                      <Text
                        className={`text-base font-body-medium ${
                          isSelected ? "text-amber" : "text-white"
                        }`}
                      >
                        {item.name}
                      </Text>
                      {isSelected && (
                        <View className="w-2 h-2 rounded-full bg-amber" />
                      )}
                    </Pressable>
                  );
                }}
                ItemSeparatorComponent={() => (
                  <View className="h-px bg-navy-border mx-5" />
                )}
              />
              <View className="px-5 pb-4 pt-2">
                <Pressable
                  className="items-center py-2.5"
                  onPress={() => setBabyPickerVisible(false)}
                >
                  <Text className="text-ash text-sm font-body-semibold">Cancel</Text>
                </Pressable>
              </View>
            </View>
          </Pressable>
        </Modal>

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
            <ActivityFeed babyId={resolvedBabyId ?? undefined} />
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
