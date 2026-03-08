import { useState } from "react";
import { colors } from "../constants/theme";
import { useThemeColors } from "../lib/theme";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Share,
} from "react-native";
import { router } from "expo-router";
import { Baby, Moon, Droplets, Heart, CheckCircle, Clock } from "lucide-react-native";
import { HandoffBriefing } from "../components/HandoffBriefing";
import {
  useHandoffBriefing,
  useStartShift,
  useProfile,
  useBabies,
  useDailyTotals,
  useNextTasks,
  useCompleteChore,
} from "../lib/queries";
import { useCareMode } from "../lib/careMode";
import { useUnitStore, displayVolume } from "../lib/store";

function DailyBriefingView() {
  const tc = useThemeColors();
  const { data: babies } = useBabies();
  const baby = babies?.[0];
  const unit = useUnitStore((s) => s.unit);
  const { data: totals, isLoading } = useDailyTotals(baby?.id);
  const { data: nextTasks } = useNextTasks(5);
  const completeChore = useCompleteChore();

  if (isLoading) {
    return (
      <View className="flex-1 bg-screen-bg justify-center items-center">
        <ActivityIndicator size="large" color={colors.feedPrimary} />
        <Text className="text-text-secondary mt-4">Loading today's summary...</Text>
      </View>
    );
  }

  function buildShareText() {
    if (!totals) return "";
    const lines = [
      `Daily Briefing - ${new Date().toLocaleDateString()}`,
      "",
      "FEEDING",
      `${totals.feeds} feeds today (${totals.feedBreakdown})`,
      totals.totalOz > 0 ? `Total: ${displayVolume(totals.totalOz, unit)}` : "",
      totals.totalFeedMin > 0 ? `Total: ${totals.totalFeedMin} min` : "",
      "",
      "PUMPING",
      totals.pumpSessions > 0
        ? `${totals.pumpSessions} session(s), ${displayVolume(totals.pumpTotalOz, unit)}, ${totals.pumpTotalMin} min`
        : "No pump sessions",
      "",
      "DIAPERS",
      `${totals.diapers} changes (${totals.diaperBreakdown})`,
      "",
      "SLEEP",
      `${totals.naps} nap(s), ~${totals.totalSleepMin} min total`,
      totals.currentlySleeping ? "Currently sleeping" : "",
      "",
      "Sent from Swadl",
    ];
    return lines.filter(Boolean).join("\n");
  }

  async function handleShare() {
    try {
      await Share.share({ message: buildShareText() });
    } catch {
      // User cancelled
    }
  }

  return (
    <ScrollView className="flex-1 bg-screen-bg">
      <View className="px-6 pt-16 pb-10">
        <TouchableOpacity onPress={() => router.back()} className="mb-4">
          <Text className="text-feed-primary text-base font-body-medium">Back</Text>
        </TouchableOpacity>

        <Text className="text-2xl text-text-primary font-display mb-1">Daily Briefing</Text>
        <Text className="text-text-secondary mb-6">
          {baby?.name}'s day so far
        </Text>

        {totals && (
          <View className="gap-3 mb-5">
            {/* Feeds */}
            <View className="bg-card-bg border border-border-main rounded-2xl p-4 flex-row items-start">
              <View
                className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                style={{ backgroundColor: `${colors.feedPrimary}22` }}
              >
                <Baby size={20} strokeWidth={1.5} color={colors.feedPrimary} />
              </View>
              <View className="flex-1">
                <Text className="text-[11px] text-text-secondary uppercase font-body-bold" style={{ letterSpacing: 2 }}>
                  Feeding
                </Text>
                <Text className="text-2xl text-text-primary font-display mt-0.5" style={{ letterSpacing: -1 }}>
                  {totals.feeds} feed{totals.feeds !== 1 ? "s" : ""}
                </Text>
                <Text className="text-sm text-text-secondary mt-0.5">
                  {totals.feedBreakdown}
                  {totals.totalOz > 0 ? ` · ${displayVolume(totals.totalOz, unit)}` : ""}
                  {totals.totalFeedMin > 0 ? ` · ${totals.totalFeedMin} min` : ""}
                </Text>
              </View>
            </View>

            {/* Sleep */}
            <View className="bg-card-bg border border-border-main rounded-2xl p-4 flex-row items-start">
              <View
                className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                style={{ backgroundColor: `${colors.sleepPrimary}22` }}
              >
                <Moon size={20} strokeWidth={1.5} color={colors.sleepPrimary} />
              </View>
              <View className="flex-1">
                <Text className="text-[11px] text-text-secondary uppercase font-body-bold" style={{ letterSpacing: 2 }}>
                  Sleep
                </Text>
                <Text className="text-2xl text-text-primary font-display mt-0.5" style={{ letterSpacing: -1 }}>
                  {totals.naps} nap{totals.naps !== 1 ? "s" : ""}
                </Text>
                <Text className="text-sm text-text-secondary mt-0.5">
                  ~{totals.totalSleepMin} min total
                  {totals.currentlySleeping ? " · Currently sleeping" : ""}
                </Text>
              </View>
            </View>

            {/* Diapers */}
            <View className="bg-card-bg border border-border-main rounded-2xl p-4 flex-row items-start">
              <View
                className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                style={{ backgroundColor: `${colors.diaperPrimary}22` }}
              >
                <Droplets size={20} strokeWidth={1.5} color={colors.diaperPrimary} />
              </View>
              <View className="flex-1">
                <Text className="text-[11px] text-text-secondary uppercase font-body-bold" style={{ letterSpacing: 2 }}>
                  Diapers
                </Text>
                <Text className="text-2xl text-text-primary font-display mt-0.5" style={{ letterSpacing: -1 }}>
                  {totals.diapers} change{totals.diapers !== 1 ? "s" : ""}
                </Text>
                <Text className="text-sm text-text-secondary mt-0.5">
                  {totals.diaperBreakdown}
                </Text>
              </View>
            </View>

            {/* Pumping */}
            {totals.pumpSessions > 0 && (
              <View className="bg-card-bg border border-border-main rounded-2xl p-4 flex-row items-start">
                <View
                  className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                  style={{ backgroundColor: `${colors.pumpPrimary}22` }}
                >
                  <Heart size={20} strokeWidth={1.5} color={colors.pumpPrimary} />
                </View>
                <View className="flex-1">
                  <Text className="text-[11px] text-text-secondary uppercase font-body-bold" style={{ letterSpacing: 2 }}>
                    Pumping
                  </Text>
                  <Text className="text-2xl text-text-primary font-display mt-0.5" style={{ letterSpacing: -1 }}>
                    {totals.pumpSessions} session{totals.pumpSessions !== 1 ? "s" : ""}
                  </Text>
                  <Text className="text-sm text-text-secondary mt-0.5">
                    {totals.pumpTotalOz > 0 ? displayVolume(totals.pumpTotalOz, unit) : ""}
                    {totals.pumpTotalOz > 0 && totals.pumpTotalMin > 0 ? " · " : ""}
                    {totals.pumpTotalMin > 0 ? `${totals.pumpTotalMin} min` : ""}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Next Tasks */}
        <View>
          <Text className="text-[11px] text-text-secondary uppercase font-body-bold mb-2" style={{ letterSpacing: 2 }}>
            Remaining Tasks
          </Text>
          {nextTasks && nextTasks.length > 0 ? (
            nextTasks.map((task) => {
              const recurrence = task.recurrence as Record<string, unknown>;
              return (
                <View
                  key={task.id}
                  className="flex-row items-center bg-card-bg border border-border-main rounded-xl p-3 mb-2"
                >
                  <TouchableOpacity
                    className="w-7 h-7 rounded-full border-2 border-border-main mr-3 items-center justify-center"
                    onPress={() => completeChore.mutate(task.id)}
                  >
                    <CheckCircle size={14} strokeWidth={1.5} color={colors.textSecondary} />
                  </TouchableOpacity>
                  <View className="flex-1">
                    <Text className="text-base font-body-medium text-text-primary">{task.title}</Text>
                    {recurrence?.time && (
                      <View className="flex-row items-center mt-0.5">
                        <Clock size={12} strokeWidth={1.5} color={colors.textSecondary} />
                        <Text className="text-sm text-text-secondary ml-1">
                          {recurrence.time as string}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })
          ) : (
            <View className="bg-card-bg border border-border-main rounded-2xl p-4 items-center">
              <Text className="text-text-secondary font-body-medium">All caught up!</Text>
            </View>
          )}
        </View>

        {/* Share */}
        <View className="mt-8">
          <TouchableOpacity
            className="rounded-2xl py-4 border border-feed-primary"
            onPress={handleShare}
          >
            <Text className="text-center font-body-semibold text-base text-feed-primary">
              Share Summary
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

function ShiftHandoffView() {
  const tc = useThemeColors();
  const { data: briefing, isLoading } = useHandoffBriefing();
  const { data: profile } = useProfile();
  const startShift = useStartShift();
  const [started, setStarted] = useState(false);

  function handleStartShift() {
    startShift.mutate(undefined, {
      onSuccess: () => setStarted(true),
      onError: (err) => Alert.alert("Error", err.message),
    });
  }

  function buildShareText() {
    if (!briefing) return "";
    const lines = [
      `Shift Change - ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`,
      "",
      `Taking over from: ${briefing.previousCaregiver ?? "Unknown"}`,
      "",
      "FEEDING",
      briefing.feedSummary,
      "",
      "SLEEP",
      briefing.sleepSummary,
      "",
      "DIAPERS",
      briefing.diaperSummary,
      "",
      "NEXT TASKS",
      ...briefing.nextTasks.map(
        (t) => `- ${t.title}${t.time ? ` (${t.time})` : ""}`
      ),
    ];
    if (briefing.nextTasks.length === 0) lines.push("All caught up!");
    lines.push("", "Sent from Swadl");
    return lines.join("\n");
  }

  async function handleShare() {
    try {
      await Share.share({ message: buildShareText() });
    } catch {
      // User cancelled
    }
  }

  if (isLoading) {
    return (
      <View className="flex-1 bg-screen-bg justify-center items-center">
        <ActivityIndicator size="large" color={colors.feedPrimary} />
        <Text className="text-text-secondary mt-4">Generating briefing...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-screen-bg">
      <View className="px-6 pt-16 pb-10">
        <TouchableOpacity onPress={() => router.back()} className="mb-4">
          <Text className="text-feed-primary text-base font-body-medium">Back</Text>
        </TouchableOpacity>

        <Text className="text-2xl text-text-primary font-display mb-1">Shift Change</Text>
        <Text className="text-text-secondary mb-6">
          {briefing?.previousCaregiver
            ? `Taking over from ${briefing.previousCaregiver}`
            : "Starting a new shift"}
        </Text>

        {briefing && (
          <HandoffBriefing
            points={[
              { label: "Feeding (last 4 hrs)", summary: briefing.feedSummary },
              { label: "Sleep (last 4 hrs)", summary: briefing.sleepSummary },
              { label: "Diapers (last 4 hrs)", summary: briefing.diaperSummary },
            ]}
          />
        )}

        <View className="mt-5">
          <Text className="text-[11px] text-text-secondary uppercase font-body-semibold tracking-[1.5px] mb-2">
            Next Tasks
          </Text>
          {briefing?.nextTasks && briefing.nextTasks.length > 0 ? (
            briefing.nextTasks.map((task, i) => (
              <View
                key={i}
                className="flex-row items-center bg-raised-bg border border-border-main rounded-xl p-3 mb-2"
              >
                <View className="w-6 h-6 rounded-full border-2 border-border-main mr-3" />
                <View className="flex-1">
                  <Text className="text-base font-body-medium text-text-primary">{task.title}</Text>
                  {task.time && (
                    <Text className="text-sm text-text-secondary">{task.time}</Text>
                  )}
                </View>
              </View>
            ))
          ) : (
            <View className="bg-card-bg border border-border-main rounded-2xl p-4 items-center">
              <Text className="text-text-secondary">All caught up!</Text>
            </View>
          )}
        </View>

        <View className="mt-8 gap-3">
          {!started ? (
            <TouchableOpacity
              className={`rounded-2xl py-4 ${startShift.isPending ? "bg-raised-bg" : "bg-feed-primary"}`}
              onPress={handleStartShift}
              disabled={startShift.isPending}
            >
              <Text
                className={`text-center font-body-semibold text-base ${startShift.isPending ? "text-text-secondary" : ""}`}
                style={startShift.isPending ? undefined : { color: colors.charcoal }}
              >
                {startShift.isPending ? "Starting..." : "Start My Shift"}
              </Text>
            </TouchableOpacity>
          ) : (
            <View className="bg-raised-bg border border-success rounded-2xl py-4 px-4">
              <Text className="text-success text-center font-body-semibold text-base">
                You're on shift, {profile?.display_name}!
              </Text>
            </View>
          )}

          <TouchableOpacity
            className="rounded-2xl py-4 border border-border-main"
            onPress={handleShare}
          >
            <Text className="text-center font-body-semibold text-base text-text-secondary">
              Share Summary
            </Text>
          </TouchableOpacity>

          {started && (
            <TouchableOpacity className="py-3" onPress={() => router.back()}>
              <Text className="text-feed-primary text-center text-base">
                Go to Dashboard
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

export default function Briefing() {
  const { careMode, isLoading } = useCareMode();

  if (isLoading) {
    return (
      <View className="flex-1 bg-screen-bg justify-center items-center">
        <ActivityIndicator size="large" color={colors.feedPrimary} />
      </View>
    );
  }

  if (careMode.isTogether) {
    return <DailyBriefingView />;
  }

  return <ShiftHandoffView />;
}
