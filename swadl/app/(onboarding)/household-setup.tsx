import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { router } from "expo-router";
import { useOnboardingStore } from "../../lib/store";

const CARE_MODES = [
  { key: "together", label: "We parent together", desc: "Both caregivers share all duties equally" },
  { key: "shifts", label: "We take turns", desc: "Caregivers alternate shifts throughout the day" },
  { key: "nanny", label: "We have a nanny", desc: "A dedicated caregiver handles day-to-day tasks" },
] as const;

export default function HouseholdSetup() {
  const { setPartnerEmail, setCareMode, careMode } = useOnboardingStore();
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
    <ScrollView className="flex-1 bg-white" contentContainerClassName="px-6 pt-16 pb-10">
      <Text className="text-sm text-blue-600 font-medium mb-2">
        Step 2 of 3
      </Text>
      <Text className="text-2xl font-bold mb-2">Who else helps?</Text>
      <Text className="text-gray-500 mb-6">
        Tell us how your household manages baby care.
      </Text>

      {/* Care Mode Selector */}
      <Text className="text-sm font-medium text-gray-700 mb-2">
        Care Mode
      </Text>
      <View className="mb-6">
        {CARE_MODES.map((mode) => (
          <TouchableOpacity
            key={mode.key}
            className={`flex-row items-center p-4 rounded-xl mb-2 border ${
              selectedMode === mode.key
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 bg-gray-50"
            }`}
            onPress={() => setSelectedMode(mode.key)}
          >
            <View className={`w-5 h-5 rounded-full border-2 mr-3 items-center justify-center ${
              selectedMode === mode.key ? "border-blue-600" : "border-gray-300"
            }`}>
              {selectedMode === mode.key && (
                <View className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              )}
            </View>
            <View className="flex-1">
              <Text className="text-base font-medium">{mode.label}</Text>
              <Text className="text-sm text-gray-400 mt-0.5">{mode.desc}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Partner Email */}
      <Text className="text-sm font-medium text-gray-700 mb-1">
        Partner / Caregiver Email
      </Text>
      <TextInput
        className="border border-gray-300 rounded-lg px-4 py-3 mb-8 text-base"
        placeholder="partner@email.com"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TouchableOpacity
        className="bg-blue-600 rounded-lg py-4 mb-3"
        onPress={handleNext}
      >
        <Text className="text-white text-center font-semibold text-base">
          {email.trim() ? "Send Invite & Continue" : "Continue"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleSkip} className="py-3">
        <Text className="text-gray-500 text-center text-base">
          Skip for now
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
