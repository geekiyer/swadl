import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Pressable, Alert } from "react-native";
import { Link, router } from "expo-router";
import { supabase } from "../../lib/supabase";
import { colors } from "../../constants/theme";
import { useThemeColors } from "../../lib/theme";
import { Eye, EyeOff } from "lucide-react-native";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetSending, setResetSending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const tc = useThemeColors();

  async function handleLogin() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);

    if (error) {
      if (error.message.toLowerCase().includes("email not confirmed")) {
        Alert.alert(
          "Email Not Confirmed",
          "Please check your email and click the confirmation link before signing in.",
          [
            { text: "OK", style: "cancel" },
            {
              text: "Resend Email",
              onPress: async () => {
                const { error: resendErr } = await supabase.auth.resend({
                  type: "signup",
                  email,
                });
                if (resendErr) {
                  Alert.alert("Error", resendErr.message);
                } else {
                  Alert.alert("Sent", "Confirmation email resent. Check your inbox.");
                }
              },
            },
          ]
        );
      } else {
        Alert.alert("Error", error.message);
      }
      return;
    }

    router.replace("/");
  }

  async function handleForgotPassword() {
    if (!email.trim()) {
      Alert.alert("Enter Email", "Please enter your email address first, then tap Forgot Password.");
      return;
    }

    setResetSending(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
    setResetSending(false);

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert(
        "Reset Link Sent",
        "Check your email for a password reset link."
      );
    }
  }

  return (
    <View className="flex-1 justify-center px-6 bg-screen-bg">
      <Text className="text-5xl text-center mb-1 text-text-primary font-display-black" style={{ letterSpacing: -2 }}>
        swad<Text className="text-feed-primary">l</Text>
      </Text>
      <Text className="text-sm text-text-secondary text-center mb-8 font-body-semibold uppercase" style={{ letterSpacing: 4 }}>
        Parenting, coordinated
      </Text>

      <TextInput
        className="border border-border-main bg-raised-bg rounded-xl px-4 mb-4 text-text-primary"
        style={{ fontSize: 16, height: 48 }}
        placeholder="Email"
        placeholderTextColor={tc.textPlaceholder}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <View className="flex-row items-center border border-border-main bg-raised-bg rounded-xl mb-2" style={{ height: 48 }}>
        <TextInput
          className="flex-1 px-4 text-text-primary"
          style={{ fontSize: 16, height: 48 }}
          placeholder="Password"
          placeholderTextColor={tc.textPlaceholder}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <Pressable onPress={() => setShowPassword(!showPassword)} className="px-3">
          {showPassword ? (
            <EyeOff size={20} color={tc.textSecondary} />
          ) : (
            <Eye size={20} color={tc.textSecondary} />
          )}
        </Pressable>
      </View>

      <TouchableOpacity
        className="self-end mb-6"
        onPress={handleForgotPassword}
        disabled={resetSending}
      >
        <Text className="text-text-secondary text-base">
          {resetSending ? "Sending..." : "Forgot password?"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="bg-feed-primary rounded-2xl py-4 mb-4"
        onPress={handleLogin}
        disabled={loading}
      >
        <Text className="text-center font-body-semibold text-base" style={{ color: colors.charcoal }}>
          {loading ? "Signing in..." : "Sign In"}
        </Text>
      </TouchableOpacity>

      <Link href="/(auth)/signup" asChild>
        <TouchableOpacity>
          <Text className="text-feed-primary text-center text-base">
            Don't have an account? Sign Up
          </Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}
