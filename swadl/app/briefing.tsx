import { useState } from "react";
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
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="text-gray-500 mt-4">Loading today's summary...</Text>
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
    <ScrollView className="flex-1 bg-white">
      <View className="px-6 pt-16 pb-10">
        <TouchableOpacity onPress={() => router.back()} className="mb-4">
          <Text className="text-blue-600 text-base">Back</Text>
        </TouchableOpacity>

        <Text className="text-2xl font-bold mb-1">Daily Briefing</Text>
        <Text className="text-gray-500 mb-6">
          {baby?.name}'s day so far
        </Text>

        {totals && (
          <View className="bg-gray-50 rounded-xl p-4 mb-5">
            {/* Feeds */}
            <View>
              <Text className="text-xs text-gray-500 uppercase tracking-wide">
                Feeding
              </Text>
              <Text className="text-2xl font-bold mt-1">{totals.feeds}</Text>
              <Text className="text-sm text-gray-500 mt-0.5">
                {totals.feedBreakdown}
                {totals.totalOz > 0 ? ` · ${displayVolume(totals.totalOz, unit)}` : ""}
                {totals.totalFeedMin > 0 ? ` · ${totals.totalFeedMin} min` : ""}
              </Text>
            </View>

            {/* Diapers */}
            <View className="mt-4 pt-4 border-t border-gray-200">
              <Text className="text-xs text-gray-500 uppercase tracking-wide">
                Diapers
              </Text>
              <Text className="text-2xl font-bold mt-1">{totals.diapers}</Text>
              <Text className="text-sm text-gray-500 mt-0.5">
                {totals.diaperBreakdown}
              </Text>
            </View>

            {/* Sleep */}
            <View className="mt-4 pt-4 border-t border-gray-200">
              <Text className="text-xs text-gray-500 uppercase tracking-wide">
                Sleep
              </Text>
              <Text className="text-2xl font-bold mt-1">
                {totals.naps} nap{totals.naps !== 1 ? "s" : ""}
              </Text>
              <Text className="text-sm text-gray-500 mt-0.5">
                ~{totals.totalSleepMin} min total
                {totals.currentlySleeping ? " · Currently sleeping" : ""}
              </Text>
            </View>

            {/* Pumping */}
            {totals.pumpSessions > 0 && (
              <View className="mt-4 pt-4 border-t border-gray-200">
                <Text className="text-xs text-gray-500 uppercase tracking-wide">
                  Pumping
                </Text>
                <Text className="text-2xl font-bold mt-1">
                  {totals.pumpSessions} session{totals.pumpSessions !== 1 ? "s" : ""}
                </Text>
                <Text className="text-sm text-gray-500 mt-0.5">
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
          <Text className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">
            Remaining Tasks
          </Text>
          {nextTasks && nextTasks.length > 0 ? (
            nextTasks.map((task) => {
              const recurrence = task.recurrence as Record<string, any>;
              return (
                <View
                  key={task.id}
                  className="flex-row items-center bg-gray-50 rounded-lg p-3 mb-2"
                >
                  <TouchableOpacity
                    className="w-6 h-6 rounded-full border-2 border-gray-300 mr-3 items-center justify-center"
                    onPress={() => completeChore.mutate(task.id)}
                  />
                  <View className="flex-1">
                    <Text className="text-base font-medium">{task.title}</Text>
                    {recurrence?.time && (
                      <Text className="text-sm text-gray-400">
                        {recurrence.time}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })
          ) : (
            <View className="bg-gray-50 rounded-lg p-4 items-center">
              <Text className="text-gray-400">All caught up!</Text>
            </View>
          )}
        </View>

        {/* Share */}
        <View className="mt-8">
          <TouchableOpacity
            className="rounded-lg py-4 border border-gray-300"
            onPress={handleShare}
          >
            <Text className="text-center font-semibold text-base text-gray-700">
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
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="text-gray-500 mt-4">Generating briefing...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="px-6 pt-16 pb-10">
        <TouchableOpacity onPress={() => router.back()} className="mb-4">
          <Text className="text-blue-600 text-base">Back</Text>
        </TouchableOpacity>

        <Text className="text-2xl font-bold mb-1">Shift Change</Text>
        <Text className="text-gray-500 mb-6">
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
          <Text className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">
            Next Tasks
          </Text>
          {briefing?.nextTasks && briefing.nextTasks.length > 0 ? (
            briefing.nextTasks.map((task, i) => (
              <View
                key={i}
                className="flex-row items-center bg-gray-50 rounded-lg p-3 mb-2"
              >
                <View className="w-6 h-6 rounded-full border-2 border-gray-300 mr-3" />
                <View className="flex-1">
                  <Text className="text-base font-medium">{task.title}</Text>
                  {task.time && (
                    <Text className="text-sm text-gray-400">{task.time}</Text>
                  )}
                </View>
              </View>
            ))
          ) : (
            <View className="bg-gray-50 rounded-lg p-4 items-center">
              <Text className="text-gray-400">All caught up!</Text>
            </View>
          )}
        </View>

        <View className="mt-8 gap-3">
          {!started ? (
            <TouchableOpacity
              className={`rounded-lg py-4 ${startShift.isPending ? "bg-gray-400" : "bg-blue-600"}`}
              onPress={handleStartShift}
              disabled={startShift.isPending}
            >
              <Text className="text-white text-center font-semibold text-base">
                {startShift.isPending ? "Starting..." : "Start My Shift"}
              </Text>
            </TouchableOpacity>
          ) : (
            <View className="bg-green-50 rounded-lg py-4 px-4">
              <Text className="text-green-700 text-center font-semibold text-base">
                You're on shift, {profile?.display_name}!
              </Text>
            </View>
          )}

          <TouchableOpacity
            className="rounded-lg py-4 border border-gray-300"
            onPress={handleShare}
          >
            <Text className="text-center font-semibold text-base text-gray-700">
              Share Summary
            </Text>
          </TouchableOpacity>

          {started && (
            <TouchableOpacity className="py-3" onPress={() => router.back()}>
              <Text className="text-blue-600 text-center text-base">
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
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (careMode === "together") {
    return <DailyBriefingView />;
  }

  return <ShiftHandoffView />;
}
