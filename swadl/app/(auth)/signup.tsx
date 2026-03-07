import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Pressable, Alert } from "react-native";
import { Link } from "expo-router";
import { supabase } from "../../lib/supabase";
import { colors } from "../../constants/theme";
import { Eye, EyeOff } from "lucide-react-native";

export default function Signup() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [resending, setResending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSignup() {
    if (!displayName.trim()) {
      Alert.alert("Error", "Please enter your name.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName.trim() } },
    });
    setLoading(false);

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      setConfirmationSent(true);
    }
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
      <View className="flex-1 justify-center px-6 bg-midnight">
        <Text className="text-3xl text-center mb-4 text-white font-display" style={{ letterSpacing: -1 }}>
          Check Your Email
        </Text>
        <Text className="text-base text-ash text-center mb-2 font-body">
          We sent a confirmation link to
        </Text>
        <Text className="text-base text-amber text-center mb-8 font-body-semibold">
          {email}
        </Text>
        <Text className="text-sm text-ash text-center mb-8 font-body">
          Tap the link in the email to verify your account, then come back and sign in.
        </Text>

        <TouchableOpacity
          className="border border-navy-border rounded-2xl py-4 mb-4"
          onPress={handleResend}
          disabled={resending}
        >
          <Text className="text-amber text-center font-body-semibold text-base">
            {resending ? "Sending..." : "Resend Confirmation Email"}
          </Text>
        </TouchableOpacity>

        <Link href="/(auth)/login" asChild>
          <TouchableOpacity>
            <Text className="text-amber text-center text-base">
              Back to Sign In
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
    );
  }

  return (
    <View className="flex-1 justify-center px-6 bg-midnight">
      <Text className="text-3xl text-center mb-8 text-white font-display" style={{ letterSpacing: -1 }}>
        Create Account
      </Text>

      <TextInput
        className="border border-navy-border bg-navy-raise rounded-xl px-4 mb-4 text-white"
        style={{ fontSize: 16, height: 48 }}
        placeholder="Your Name"
        placeholderTextColor={colors.ash}
        value={displayName}
        onChangeText={setDisplayName}
        autoFocus
      />
      <TextInput
        className="border border-navy-border bg-navy-raise rounded-xl px-4 mb-4 text-white"
        style={{ fontSize: 16, height: 48 }}
        placeholder="Email"
        placeholderTextColor={colors.ash}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <View className="flex-row items-center border border-navy-border bg-navy-raise rounded-xl mb-6" style={{ height: 48 }}>
        <TextInput
          className="flex-1 px-4 text-white"
          style={{ fontSize: 16, height: 48 }}
          placeholder="Password"
          placeholderTextColor={colors.ash}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <Pressable onPress={() => setShowPassword(!showPassword)} className="px-3">
          {showPassword ? (
            <EyeOff size={20} color={colors.ash} />
          ) : (
            <Eye size={20} color={colors.ash} />
          )}
        </Pressable>
      </View>

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
