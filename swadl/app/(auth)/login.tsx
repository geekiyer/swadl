import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { Link, router } from "expo-router";
import { supabase } from "../../lib/supabase";
import { colors } from "../../constants/theme";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    // Route through root index which checks for profile, invites, or onboarding
    router.replace("/");
  }

  return (
    <View className="flex-1 justify-center px-6 bg-midnight">
      <Text className="text-5xl text-center mb-1 text-white font-display-black" style={{ letterSpacing: -2 }}>
        swad<Text className="text-amber">l</Text>
      </Text>
      <Text className="text-xs text-ash text-center mb-8 font-body-semibold uppercase" style={{ letterSpacing: 4 }}>
        Parenting, coordinated
      </Text>

      <TextInput
        className="border border-navy-border bg-navy-raise rounded-xl px-4 py-3 mb-4 text-base text-white"
        placeholder="Email"
        placeholderTextColor={colors.ash}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        className="border border-navy-border bg-navy-raise rounded-xl px-4 py-3 mb-6 text-base text-white"
        placeholder="Password"
        placeholderTextColor={colors.ash}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        className="bg-amber rounded-2xl py-4 mb-4"
        onPress={handleLogin}
        disabled={loading}
      >
        <Text className="text-midnight text-center font-body-semibold text-base">
          {loading ? "Signing in..." : "Sign In"}
        </Text>
      </TouchableOpacity>

      <Link href="/(auth)/signup" asChild>
        <TouchableOpacity>
          <Text className="text-amber text-center text-base">
            Don't have an account? Sign Up
          </Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}
