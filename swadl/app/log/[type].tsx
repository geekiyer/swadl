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
    <View className="flex-1 bg-white pt-16 px-6">
      <TouchableOpacity onPress={() => router.back()} className="mb-4">
        <Text className="text-blue-600 text-base">Back</Text>
      </TouchableOpacity>

      <Text className="text-2xl font-bold mb-6">
        {TITLES[type ?? ""] ?? "Log"}
      </Text>

      {type === "feed" && <FeedLogger />}
      {type === "diaper" && <DiaperLogger />}
      {type === "sleep" && <SleepLogger />}
      {type === "pump" && <PumpLogger />}
    </View>
  );
}
