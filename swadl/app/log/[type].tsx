import { View, Text, TouchableOpacity } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { FeedLogger } from "../../components/log/FeedLogger";
import { DiaperLogger } from "../../components/log/DiaperLogger";
import { SleepLogger } from "../../components/log/SleepLogger";
import { PumpLogger } from "../../components/log/PumpLogger";

const TITLES: Record<string, string> = {
  feed: "Log Feed",
  diaper: "Log Diaper",
  sleep: "Log Sleep",
  pump: "Log Pump",
};

export default function QuickLog() {
  const { type } = useLocalSearchParams<{ type: string }>();

  return (
    <View className="flex-1 bg-midnight pt-16 px-6">
      <TouchableOpacity onPress={() => router.back()} className="mb-4">
        <Text className="text-amber text-base font-body-medium">Back</Text>
      </TouchableOpacity>

      <Text className="text-2xl font-display text-white mb-6" style={{ letterSpacing: -1 }}>
        {TITLES[type ?? ""] ?? "Log"}
      </Text>

      {type === "feed" && <FeedLogger />}
      {type === "diaper" && <DiaperLogger />}
      {type === "sleep" && <SleepLogger />}
      {type === "pump" && <PumpLogger />}
    </View>
  );
}
