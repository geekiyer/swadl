import { useRef, useState, useCallback } from "react";
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
  const navigated = useRef(false);

  function goBack() {
    if (navigated.current) return;
    navigated.current = true;
    router.back();
  }

  function handleLogSuccess() {
    setShowConfirm(true);
    // Safety fallback: navigate back after 2s even if animation callback doesn't fire
    setTimeout(goBack, 2000);
  }

  const handleConfirmReady = useCallback(() => {
    confirmRef.current?.fire();
  }, []);

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
        <LogConfirmation
          ref={confirmRef}
          onDone={goBack}
          onReady={handleConfirmReady}
        />
      )}
    </View>
  );
}
