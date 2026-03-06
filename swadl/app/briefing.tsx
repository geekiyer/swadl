import { useState } from "react";
import { colors } from "../constants/theme";
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
  const { data: babies } = useBabies();
  const baby = babies?.[0];
  const unit = useUnitStore((s) => s.unit);
  const { data: totals, isLoading } = useDailyTotals(baby?.id);
  const { data: nextTasks } = useNextTasks(5);
  const completeChore = useCompleteChore();

  if (isLoading) {
    return (
      <View className="flex-1 bg-midnight justify-center items-center">
        <ActivityIndicator size="large" color={colors.amber} />
        <Text className="text-ash mt-4">Loading today's summary...</Text>
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
    <ScrollView className="flex-1 bg-midnight">
      <View className="px-6 pt-16 pb-10">
        <TouchableOpacity onPress={() => router.back()} className="mb-4">
          <Text className="text-amber text-base font-body-medium">Back</Text>
        </TouchableOpacity>

        <Text className="text-2xl text-white font-display mb-1">Daily Briefing</Text>
        <Text className="text-ash mb-6">
          {baby?.name}'s day so far
        </Text>

        {totals && (
          <View className="bg-navy-card border border-navy-border rounded-2xl p-4 mb-5">
            {/* Feeds */}
            <View>
              <Text className="text-[11px] text-ash uppercase font-body-semibold tracking-[1.5px]">
                Feeding
              </Text>
              <Text className="text-2xl text-white font-display mt-1">{totals.feeds}</Text>
              <Text className="text-sm text-ash mt-0.5">
                {totals.feedBreakdown}
                {totals.totalOz > 0 ? ` · ${displayVolume(totals.totalOz, unit)}` : ""}
                {totals.totalFeedMin > 0 ? ` · ${totals.totalFeedMin} min` : ""}
              </Text>
            </View>

            {/* Diapers */}
            <View className="mt-4 pt-4 border-t border-navy-border">
              <Text className="text-[11px] text-ash uppercase font-body-semibold tracking-[1.5px]">
                Diapers
              </Text>
              <Text className="text-2xl text-white font-display mt-1">{totals.diapers}</Text>
              <Text className="text-sm text-ash mt-0.5">
                {totals.diaperBreakdown}
              </Text>
            </View>

            {/* Sleep */}
            <View className="mt-4 pt-4 border-t border-navy-border">
              <Text className="text-[11px] text-ash uppercase font-body-semibold tracking-[1.5px]">
                Sleep
              </Text>
              <Text className="text-2xl text-white font-display mt-1">
                {totals.naps} nap{totals.naps !== 1 ? "s" : ""}
              </Text>
              <Text className="text-sm text-ash mt-0.5">
                ~{totals.totalSleepMin} min total
                {totals.currentlySleeping ? " · Currently sleeping" : ""}
              </Text>
            </View>

            {/* Pumping */}
            {totals.pumpSessions > 0 && (
              <View className="mt-4 pt-4 border-t border-navy-border">
                <Text className="text-[11px] text-ash uppercase font-body-semibold tracking-[1.5px]">
                  Pumping
                </Text>
                <Text className="text-2xl text-white font-display mt-1">
                  {totals.pumpSessions} session{totals.pumpSessions !== 1 ? "s" : ""}
                </Text>
                <Text className="text-sm text-ash mt-0.5">
                  {totals.pumpTotalOz > 0 ? displayVolume(totals.pumpTotalOz, unit) : ""}
                  {totals.pumpTotalOz > 0 && totals.pumpTotalMin > 0 ? " · " : ""}
                  {totals.pumpTotalMin > 0 ? `${totals.pumpTotalMin} min` : ""}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Next Tasks */}
        <View>
          <Text className="text-[11px] text-ash uppercase font-body-semibold tracking-[1.5px] mb-2">
            Remaining Tasks
          </Text>
          {nextTasks && nextTasks.length > 0 ? (
            nextTasks.map((task) => {
              const recurrence = task.recurrence as Record<string, any>;
              return (
                <View
                  key={task.id}
                  className="flex-row items-center bg-navy-raise border border-navy-border rounded-xl p-3 mb-2"
                >
                  <TouchableOpacity
                    className="w-6 h-6 rounded-full border-2 border-navy-border mr-3 items-center justify-center"
                    onPress={() => completeChore.mutate(task.id)}
                  />
                  <View className="flex-1">
                    <Text className="text-base font-body-medium text-white">{task.title}</Text>
                    {recurrence?.time && (
                      <Text className="text-sm text-ash">
                        {recurrence.time}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })
          ) : (
            <View className="bg-navy-card border border-navy-border rounded-2xl p-4 items-center">
              <Text className="text-ash">All caught up!</Text>
            </View>
          )}
        </View>

        {/* Share */}
        <View className="mt-8">
          <TouchableOpacity
            className="rounded-2xl py-4 border border-navy-border"
            onPress={handleShare}
          >
            <Text className="text-center font-body-semibold text-base text-ash">
              Share Summary
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

function ShiftHandoffView() {
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
      <View className="flex-1 bg-midnight justify-center items-center">
        <ActivityIndicator size="large" color={colors.amber} />
        <Text className="text-ash mt-4">Generating briefing...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-midnight">
      <View className="px-6 pt-16 pb-10">
        <TouchableOpacity onPress={() => router.back()} className="mb-4">
          <Text className="text-amber text-base font-body-medium">Back</Text>
        </TouchableOpacity>

        <Text className="text-2xl text-white font-display mb-1">Shift Change</Text>
        <Text className="text-ash mb-6">
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
          <Text className="text-[11px] text-ash uppercase font-body-semibold tracking-[1.5px] mb-2">
            Next Tasks
          </Text>
          {briefing?.nextTasks && briefing.nextTasks.length > 0 ? (
            briefing.nextTasks.map((task, i) => (
              <View
                key={i}
                className="flex-row items-center bg-navy-raise border border-navy-border rounded-xl p-3 mb-2"
              >
                <View className="w-6 h-6 rounded-full border-2 border-navy-border mr-3" />
                <View className="flex-1">
                  <Text className="text-base font-body-medium text-white">{task.title}</Text>
                  {task.time && (
                    <Text className="text-sm text-ash">{task.time}</Text>
                  )}
                </View>
              </View>
            ))
          ) : (
            <View className="bg-navy-card border border-navy-border rounded-2xl p-4 items-center">
              <Text className="text-ash">All caught up!</Text>
            </View>
          )}
        </View>

        <View className="mt-8 gap-3">
          {!started ? (
            <TouchableOpacity
              className={`rounded-2xl py-4 ${startShift.isPending ? "bg-navy-raise" : "bg-amber"}`}
              onPress={handleStartShift}
              disabled={startShift.isPending}
            >
              <Text className={`text-center font-body-semibold text-base ${startShift.isPending ? "text-ash" : "text-midnight"}`}>
                {startShift.isPending ? "Starting..." : "Start My Shift"}
              </Text>
            </TouchableOpacity>
          ) : (
            <View className="bg-navy-raise border border-success rounded-2xl py-4 px-4">
              <Text className="text-success text-center font-body-semibold text-base">
                You're on shift, {profile?.display_name}!
              </Text>
            </View>
          )}

          <TouchableOpacity
            className="rounded-2xl py-4 border border-navy-border"
            onPress={handleShare}
          >
            <Text className="text-center font-body-semibold text-base text-ash">
              Share Summary
            </Text>
          </TouchableOpacity>

          {started && (
            <TouchableOpacity className="py-3" onPress={() => router.back()}>
              <Text className="text-amber text-center text-base">
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
  const { data: careMode, isLoading } = useCareMode();

  if (isLoading) {
    return (
      <View className="flex-1 bg-midnight justify-center items-center">
        <ActivityIndicator size="large" color={colors.amber} />
      </View>
    );
  }

  if (careMode === "together") {
    return <DailyBriefingView />;
  }

  return <ShiftHandoffView />;
}
