import { useRef, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { FeedLogger } from "../../components/log/FeedLogger";
import { DiaperLogger } from "../../components/log/DiaperLogger";
import { SleepLogger } from "../../components/log/SleepLogger";
import { PumpLogger } from "../../components/log/PumpLogger";
import {
  LogConfirmation,
  type LogConfirmationRef,
} from "../../components/LogConfirmation";

const TITLES: Record<string, string> = {
  feed: "Log Feed",
  diaper: "Log Diaper",
  sleep: "Log Sleep",
  pump: "Log Pump",
};

export default function QuickLog() {
  const { type } = useLocalSearchParams<{ type: string }>();
  const confirmRef = useRef<LogConfirmationRef>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  function handleLogSuccess() {
    setShowConfirm(true);
    confirmRef.current?.fire();
  }

  function handleDone() {
    router.back();
  }

  return (
    <View className="flex-1 bg-midnight pt-16 px-6">
      <TouchableOpacity onPress={() => router.back()} className="mb-4">
        <Text className="text-amber text-base font-body-medium">Back</Text>
      </TouchableOpacity>

      <Text
        className="text-2xl font-display text-white mb-6"
        style={{ letterSpacing: -1 }}
      >
        {TITLES[type ?? ""] ?? "Log"}
      </Text>

      {type === "feed" && <FeedLogger onSuccess={handleLogSuccess} />}
      {type === "diaper" && <DiaperLogger onSuccess={handleLogSuccess} />}
      {type === "sleep" && <SleepLogger onSuccess={handleLogSuccess} />}
      {type === "pump" && <PumpLogger onSuccess={handleLogSuccess} />}

      {showConfirm && (
        <LogConfirmation ref={confirmRef} onDone={handleDone} />
      )}
    </View>
  );
}
