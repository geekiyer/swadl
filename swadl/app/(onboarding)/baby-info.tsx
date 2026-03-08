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
import { useThemeColors } from "../../lib/theme";

const FEEDING_OPTIONS = [
  { key: "breast", label: "Breastfeeding" },
  { key: "bottle", label: "Bottle" },
  { key: "combo", label: "Combo" },
  { key: "solids", label: "Solids" },
] as const;

export default function BabyInfo() {
  const { setBabyInfo } = useOnboardingStore();
  const setSession = useAuthStore((s) => s.setSession);
  const tc = useThemeColors();
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
    <View className="flex-1 bg-screen-bg px-6 pt-16">
      <Text className="text-xs text-feed-primary font-body-semibold mb-2 uppercase" style={{ letterSpacing: 3 }}>
        Step 1 of 3
      </Text>
      <Text className="text-2xl text-text-primary font-display mb-2" style={{ letterSpacing: -0.5 }}>
        Tell us about your baby
      </Text>
      <Text className="text-text-secondary font-body mb-8">
        We'll use this to personalize your experience.
      </Text>

      <Text className="text-xs font-body-semibold text-text-secondary uppercase mb-1" style={{ letterSpacing: 2 }}>
        Baby's Name
      </Text>
      <TextInput
        className="border border-border-main bg-raised-bg rounded-xl px-4 mb-4 text-text-primary font-body"
        style={{ fontSize: 16, height: 48 }}
        placeholder="e.g. Emma"
        placeholderTextColor={tc.textPlaceholder}
        value={name}
        onChangeText={setName}
        autoFocus
      />

      <Text className="text-xs font-body-semibold text-text-secondary uppercase mb-1" style={{ letterSpacing: 2 }}>
        Date of Birth
      </Text>
      <TextInput
        className="border border-border-main bg-raised-bg rounded-xl px-4 mb-6 text-text-primary font-mono"
        style={{ fontSize: 16, height: 48 }}
        placeholder="YYYY-MM-DD"
        placeholderTextColor={tc.textPlaceholder}
        value={dob}
        onChangeText={setDob}
        keyboardType={Platform.OS === "ios" ? "numbers-and-punctuation" : "default"}
      />

      <Text className="text-xs font-body-semibold text-text-secondary uppercase mb-2" style={{ letterSpacing: 2 }}>
        Feeding Method
      </Text>
      <View className="flex-row flex-wrap gap-2 mb-8">
        {FEEDING_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.key}
            className={`px-4 py-3 rounded-xl border ${
              feedingMethod === option.key
                ? "bg-feed-primary border-feed-primary"
                : "bg-card-bg border-border-main"
            }`}
            onPress={() => setFeedingMethod(option.key)}
          >
            <Text
              className={`font-body-semibold ${
                feedingMethod === option.key ? "" : "text-text-secondary"
              }`}
              style={feedingMethod === option.key ? { color: colors.charcoal } : undefined}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        className={`rounded-2xl py-4 ${isValid ? "bg-feed-primary" : "bg-raised-bg border border-border-main"}`}
        onPress={handleNext}
        disabled={!isValid}
      >
        <Text
          className={`text-center font-body-semibold text-base ${isValid ? "" : "text-text-secondary"}`}
          style={isValid ? { color: colors.charcoal } : undefined}
        >
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
        <Text className="text-text-secondary text-center text-sm font-body">
          Sign out
        </Text>
      </TouchableOpacity>
    </View>
  );
}
