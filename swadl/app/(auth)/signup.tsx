import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Pressable, Alert } from "react-native";
import { Link, router } from "expo-router";
import { supabase } from "../../lib/supabase";
import { colors } from "../../constants/theme";
import { useThemeColors } from "../../lib/theme";
import { Eye, EyeOff } from "lucide-react-native";

export default function Signup() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [resending, setResending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const tc = useThemeColors();

  async function handleSignup() {
    if (!displayName.trim()) {
      Alert.alert("Error", "Please enter your name.");
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName.trim() } },
    });
    setLoading(false);

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    // Supabase returns a user with no identities if the email already exists
    if (data.user && data.user.identities?.length === 0) {
      Alert.alert(
        "Account Already Exists",
        "An account with this email already exists. Try signing in instead.",
        [
          { text: "OK", style: "cancel" },
          { text: "Go to Sign In", onPress: () => router.replace("/(auth)/login") },
        ]
      );
      return;
    }

    setConfirmationSent(true);
  }

  async function handleResend() {
    setResending(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
    });
    setResending(false);

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert("Sent", "Confirmation email resent. Check your inbox.");
    }
  }

  if (confirmationSent) {
    return (
      <View className="flex-1 justify-center px-6 bg-screen-bg">
        <Text className="text-3xl text-center mb-4 text-text-primary font-display" style={{ letterSpacing: -1 }}>
          Check Your Email
        </Text>
        <Text className="text-base text-text-secondary text-center mb-2 font-body">
          We sent a confirmation link to
        </Text>
        <Text className="text-base text-feed-primary text-center mb-8 font-body-semibold">
          {email}
        </Text>
        <Text className="text-base text-text-secondary text-center mb-8 font-body">
          Tap the link in the email to verify your account, then come back and sign in.
        </Text>

        <TouchableOpacity
          className="border border-border-main rounded-2xl py-4 mb-4"
          onPress={handleResend}
          disabled={resending}
        >
          <Text className="text-feed-primary text-center font-body-semibold text-base">
            {resending ? "Sending..." : "Resend Confirmation Email"}
          </Text>
        </TouchableOpacity>

        <Link href="/(auth)/login" asChild>
          <TouchableOpacity>
            <Text className="text-feed-primary text-center text-base">
              Back to Sign In
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
    );
  }

  return (
    <View className="flex-1 justify-center px-6 bg-screen-bg">
      <Text className="text-3xl text-center mb-8 text-text-primary font-display" style={{ letterSpacing: -1 }}>
        Create Account
      </Text>

      <TextInput
        className="border border-border-main bg-raised-bg rounded-xl px-4 mb-4 text-text-primary"
        style={{ fontSize: 16, height: 48 }}
        placeholder="Your Name"
        placeholderTextColor={tc.textPlaceholder}
        value={displayName}
        onChangeText={setDisplayName}
        autoFocus
      />
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
      <View className="flex-row items-center border border-border-main bg-raised-bg rounded-xl mb-6" style={{ height: 48 }}>
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
        className="bg-feed-primary rounded-2xl py-4 mb-4"
        onPress={handleSignup}
        disabled={loading}
      >
        <Text className="text-center font-body-semibold text-base" style={{ color: colors.charcoal }}>
          {loading ? "Creating account..." : "Sign Up"}
        </Text>
      </TouchableOpacity>

      <Link href="/(auth)/login" asChild>
        <TouchableOpacity>
          <Text className="text-feed-primary text-center text-base">
            Already have an account? Sign In
          </Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}
