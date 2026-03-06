import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { Link, router } from "expo-router";
import { supabase } from "../../lib/supabase";
import { colors } from "../../constants/theme";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      // Route through root index which checks for pending invites
      router.replace("/");
    }
  }

  return (
    <View className="flex-1 justify-center px-6 bg-midnight">
      <Text className="text-3xl text-center mb-8 text-white font-display" style={{ letterSpacing: -1 }}>
        Create Account
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
        onPress={handleSignup}
        disabled={loading}
      >
        <Text className="text-midnight text-center font-body-semibold text-base">
          {loading ? "Creating account..." : "Sign Up"}
        </Text>
      </TouchableOpacity>

      <Link href="/(auth)/login" asChild>
        <TouchableOpacity>
          <Text className="text-amber text-center text-base">
            Already have an account? Sign In
          </Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}
