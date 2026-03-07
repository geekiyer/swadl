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
import { colors } from "../../constants/theme";

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
    <View className="flex-1 bg-midnight px-6 pt-16">
      <Text className="text-xs text-amber font-body-semibold mb-2 uppercase" style={{ letterSpacing: 3 }}>
        Step 1 of 3
      </Text>
      <Text className="text-2xl text-white font-display mb-2" style={{ letterSpacing: -0.5 }}>
        Tell us about your baby
      </Text>
      <Text className="text-ash font-body mb-8">
        We'll use this to personalize your experience.
      </Text>

      <Text className="text-xs font-body-semibold text-ash uppercase mb-1" style={{ letterSpacing: 2 }}>
        Baby's Name
      </Text>
      <TextInput
        className="border border-navy-border bg-navy-raise rounded-xl px-4 mb-4 text-white font-body"
        style={{ fontSize: 16, height: 48 }}
        placeholder="e.g. Emma"
        placeholderTextColor={colors.ash}
        value={name}
        onChangeText={setName}
        autoFocus
      />

      <Text className="text-xs font-body-semibold text-ash uppercase mb-1" style={{ letterSpacing: 2 }}>
        Date of Birth
      </Text>
      <TextInput
        className="border border-navy-border bg-navy-raise rounded-xl px-4 mb-6 text-white font-mono"
        style={{ fontSize: 16, height: 48 }}
        placeholder="YYYY-MM-DD"
        placeholderTextColor={colors.ash}
        value={dob}
        onChangeText={setDob}
        keyboardType={Platform.OS === "ios" ? "numbers-and-punctuation" : "default"}
      />

      <Text className="text-xs font-body-semibold text-ash uppercase mb-2" style={{ letterSpacing: 2 }}>
        Feeding Method
      </Text>
      <View className="flex-row flex-wrap gap-2 mb-8">
        {FEEDING_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.key}
            className={`px-4 py-3 rounded-xl border ${
              feedingMethod === option.key
                ? "bg-amber border-amber"
                : "bg-navy-card border-navy-border"
            }`}
            onPress={() => setFeedingMethod(option.key)}
          >
            <Text
              className={`font-body-semibold ${
                feedingMethod === option.key ? "text-midnight" : "text-ash"
              }`}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        className={`rounded-2xl py-4 ${isValid ? "bg-amber" : "bg-navy-raise border border-navy-border"}`}
        onPress={handleNext}
        disabled={!isValid}
      >
        <Text className={`text-center font-body-semibold text-base ${isValid ? "text-midnight" : "text-ash"}`}>
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
        <Text className="text-ash text-center text-sm font-body">
          Sign out
        </Text>
      </TouchableOpacity>
    </View>
  );
}
