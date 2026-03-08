import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { router } from "expo-router";
import { useOnboardingStore } from "../../lib/store";
import { colors } from "../../constants/theme";
import { useThemeColors } from "../../lib/theme";

const CARE_MODES = [
  { key: "together", label: "We parent together", desc: "Both caregivers share all duties equally" },
  { key: "shifts", label: "We take turns", desc: "Caregivers alternate shifts throughout the day" },
  { key: "nanny", label: "We have a nanny", desc: "A dedicated caregiver handles day-to-day tasks" },
] as const;

export default function HouseholdSetup() {
  const { setPartnerEmail, setCareMode, careMode } = useOnboardingStore();
  const tc = useThemeColors();
  const [email, setEmail] = useState("");
  const [selectedMode, setSelectedMode] = useState<"together" | "shifts" | "nanny">(careMode);

  function handleNext() {
    if (email.trim()) {
      setPartnerEmail(email.trim());
    }
    setCareMode(selectedMode);
    router.push("/(onboarding)/instant-value");
  }

  function handleSkip() {
    setCareMode(selectedMode);
    router.push("/(onboarding)/instant-value");
  }

  return (
    <ScrollView className="flex-1 bg-screen-bg" contentContainerClassName="px-6 pt-16 pb-10">
      <Text className="text-xs text-feed-primary font-body-semibold mb-2 uppercase" style={{ letterSpacing: 3 }}>
        Step 2 of 3
      </Text>
      <Text className="text-2xl text-text-primary font-display mb-2" style={{ letterSpacing: -0.5 }}>
        Who else helps?
      </Text>
      <Text className="text-text-secondary font-body mb-6">
        Tell us how your household manages baby care.
      </Text>

      {/* Care Mode Selector */}
      <Text className="text-xs font-body-semibold text-text-secondary uppercase mb-2" style={{ letterSpacing: 2 }}>
        Care Mode
      </Text>
      <View className="mb-6">
        {CARE_MODES.map((mode) => (
          <TouchableOpacity
            key={mode.key}
            className={`flex-row items-center p-4 rounded-xl mb-2 border ${
              selectedMode === mode.key
                ? "border-feed-primary bg-raised-bg"
                : "border-border-main bg-card-bg"
            }`}
            onPress={() => setSelectedMode(mode.key)}
          >
            <View className={`w-5 h-5 rounded-full border-2 mr-3 items-center justify-center ${
              selectedMode === mode.key ? "border-feed-primary" : "border-border-main"
            }`}>
              {selectedMode === mode.key && (
                <View className="w-2.5 h-2.5 rounded-full bg-feed-primary" />
              )}
            </View>
            <View className="flex-1">
              <Text className="text-base font-body-semibold text-text-primary">{mode.label}</Text>
              <Text className="text-sm text-text-secondary font-body mt-0.5">{mode.desc}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Partner Email */}
      <Text className="text-xs font-body-semibold text-text-secondary uppercase mb-1" style={{ letterSpacing: 2 }}>
        Partner / Caregiver Email
      </Text>
      <TextInput
        className="border border-border-main bg-raised-bg rounded-xl px-4 mb-8 text-text-primary font-body"
        style={{ fontSize: 16, height: 48 }}
        placeholder="partner@email.com"
        placeholderTextColor={tc.textPlaceholder}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TouchableOpacity
        className="bg-feed-primary rounded-2xl py-4 mb-3"
        onPress={handleNext}
      >
        <Text className="text-center font-body-semibold text-base" style={{ color: colors.charcoal }}>
          {email.trim() ? "Send Invite & Continue" : "Continue"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleSkip} className="py-3">
        <Text className="text-text-secondary text-center text-base font-body">
          Skip for now
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
