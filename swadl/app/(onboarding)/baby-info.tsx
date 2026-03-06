import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useOnboardingStore, useAuthStore } from "../../lib/store";
import { supabase } from "../../lib/supabase";

const FEEDING_OPTIONS = [
  { key: "breast", label: "Breastfeeding" },
  { key: "bottle", label: "Bottle" },
  { key: "combo", label: "Combo" },
  { key: "solids", label: "Solids" },
] as const;

export default function BabyInfo() {
  const { setBabyInfo } = useOnboardingStore();
  const setSession = useAuthStore((s) => s.setSession);
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [feedingMethod, setFeedingMethod] = useState<string>("");

  function handleNext() {
    if (!name.trim() || !dob.trim() || !feedingMethod) return;
    setBabyInfo(name.trim(), dob.trim(), feedingMethod);
    router.push("/(onboarding)/household-setup");
  }

  const isValid = name.trim() && dob.trim() && feedingMethod;

  return (
    <View className="flex-1 bg-white px-6 pt-16">
      <Text className="text-sm text-blue-600 font-medium mb-2">
        Step 1 of 3
      </Text>
      <Text className="text-2xl font-bold mb-2">Tell us about your baby</Text>
      <Text className="text-gray-500 mb-8">
        We'll use this to personalize your experience.
      </Text>

      <Text className="text-sm font-medium text-gray-700 mb-1">
        Baby's Name
      </Text>
      <TextInput
        className="border border-gray-300 rounded-lg px-4 py-3 mb-4 text-base"
        placeholder="e.g. Emma"
        value={name}
        onChangeText={setName}
        autoFocus
      />

      <Text className="text-sm font-medium text-gray-700 mb-1">
        Date of Birth
      </Text>
      <TextInput
        className="border border-gray-300 rounded-lg px-4 py-3 mb-6 text-base"
        placeholder="YYYY-MM-DD"
        value={dob}
        onChangeText={setDob}
        keyboardType={Platform.OS === "ios" ? "numbers-and-punctuation" : "default"}
      />

      <Text className="text-sm font-medium text-gray-700 mb-2">
        Feeding Method
      </Text>
      <View className="flex-row flex-wrap gap-2 mb-8">
        {FEEDING_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.key}
            className={`px-4 py-3 rounded-lg border ${
              feedingMethod === option.key
                ? "bg-blue-600 border-blue-600"
                : "bg-white border-gray-300"
            }`}
            onPress={() => setFeedingMethod(option.key)}
          >
            <Text
              className={`font-medium ${
                feedingMethod === option.key ? "text-white" : "text-gray-700"
              }`}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        className={`rounded-lg py-4 ${isValid ? "bg-blue-600" : "bg-gray-300"}`}
        onPress={handleNext}
        disabled={!isValid}
      >
        <Text className="text-white text-center font-semibold text-base">
          Next
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="py-4 mt-4"
        onPress={async () => {
          await supabase.auth.signOut();
          setSession(null);
          router.replace("/(auth)/login");
        }}
      >
        <Text className="text-gray-400 text-center text-sm">
          Sign out
        </Text>
      </TouchableOpacity>
    </View>
  );
}
