import { useRef, useState, useCallback } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Baby, Droplets, Moon, Heart } from "lucide-react-native";
import { FeedLogger } from "../../components/log/FeedLogger";
import { DiaperLogger } from "../../components/log/DiaperLogger";
import { SleepLogger } from "../../components/log/SleepLogger";
import { PumpLogger } from "../../components/log/PumpLogger";
import {
  LogConfirmation,
  type LogConfirmationRef,
} from "../../components/LogConfirmation";
import { colors } from "../../constants/theme";
import type { LucideIcon } from "lucide-react-native";

const LOG_META: Record<string, { title: string; subtitle: string; icon: LucideIcon; color: string }> = {
  feed: { title: "Feed", subtitle: "Log a feeding session", icon: Baby, color: colors.amber },
  diaper: { title: "Diaper", subtitle: "Log a diaper change", icon: Droplets, color: colors.honey },
  sleep: { title: "Sleep", subtitle: "Log a sleep session", icon: Moon, color: colors.info },
  pump: { title: "Pump", subtitle: "Log a pump session", icon: Heart, color: colors.ember },
};

export default function QuickLog() {
  const { type } = useLocalSearchParams<{ type: string }>();
  const confirmRef = useRef<LogConfirmationRef>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigated = useRef(false);

  const meta = LOG_META[type ?? ""];
  const Icon = meta?.icon ?? Baby;

  function goBack() {
    if (navigated.current) return;
    navigated.current = true;
    router.back();
  }

  function handleLogSuccess() {
    setShowConfirm(true);
    setTimeout(goBack, 2000);
  }

  const handleConfirmReady = useCallback(() => {
    confirmRef.current?.fire();
  }, []);

  return (
    <View className="flex-1 bg-midnight pt-16 px-6">
      <TouchableOpacity onPress={() => router.back()} className="mb-6">
        <Text className="text-ash text-base font-body-medium">Cancel</Text>
      </TouchableOpacity>

      <View className="flex-row items-center mb-6">
        <View
          className="w-10 h-10 rounded-xl items-center justify-center mr-3"
          style={{ backgroundColor: `${meta?.color ?? colors.amber}22` }}
        >
          <Icon size={20} strokeWidth={1.5} color={meta?.color ?? colors.amber} />
        </View>
        <View>
          <Text
            className="text-2xl font-display text-white"
            style={{ letterSpacing: -1 }}
          >
            {meta?.title ?? "Log"}
          </Text>
          <Text className="text-sm text-ash font-body">
            {meta?.subtitle ?? ""}
          </Text>
        </View>
      </View>

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
