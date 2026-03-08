import "../global.css";
import { useEffect, useState } from "react";
import { View, Text, Image } from "react-native";
import Animated, { FadeOut } from "react-native-reanimated";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../lib/store";
import { useFonts } from "expo-font";
import {
  Baloo2_400Regular,
  Baloo2_500Medium,
  Baloo2_600SemiBold,
  Baloo2_700Bold,
  Baloo2_800ExtraBold,
} from "@expo-google-fonts/baloo-2";
import {
  Nunito_400Regular,
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
} from "@expo-google-fonts/nunito";
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_700Bold,
} from "@expo-google-fonts/jetbrains-mono";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useOfflineSync } from "../hooks/useOfflineSync";
import { usePushNotifications } from "../hooks/usePushNotifications";
import { useThemeStore } from "../lib/theme";
import { colors } from "../constants/theme";

SplashScreen.preventAutoHideAsync();

function BackgroundProviders() {
  useOfflineSync();
  usePushNotifications();
  return null;
}

/** Wraps children with the NativeWind dark class without re-rendering the root layout */
function ThemeProvider({ children }: { children: React.ReactNode }) {
  const themeMode = useThemeStore((s) => s.mode);
  return (
    <View className={themeMode === "dark" ? "dark flex-1" : "flex-1"}>
      <StatusBar style={themeMode === "dark" ? "light" : "dark"} />
      {children}
    </View>
  );
}

const queryClient = new QueryClient();

export default function RootLayout() {
  const setSession = useAuthStore((s) => s.setSession);
  const [ready, setReady] = useState(false);

  const [fontsLoaded] = useFonts({
    Baloo2_400Regular,
    Baloo2_500Medium,
    Baloo2_600SemiBold,
    Baloo2_700Bold,
    Baloo2_800ExtraBold,
    Nunito_400Regular,
    Nunito_500Medium,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
    JetBrainsMono_400Regular,
    JetBrainsMono_700Bold,
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setReady(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [setSession]);

  const [showBrandedSplash, setShowBrandedSplash] = useState(true);

  useEffect(() => {
    if (ready && fontsLoaded) {
      // Hide the plain native splash immediately — our branded overlay is already visible
      SplashScreen.hideAsync();
      const timer = setTimeout(() => setShowBrandedSplash(false), 800);
      return () => clearTimeout(timer);
    }
  }, [ready, fontsLoaded]);

  if (!ready || !fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <BackgroundProviders />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(onboarding)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="log" options={{ presentation: "modal" }} />
            <Stack.Screen name="briefing" options={{ presentation: "modal" }} />
            <Stack.Screen name="privacy" options={{ presentation: "modal" }} />
            <Stack.Screen name="terms" options={{ presentation: "modal" }} />
          </Stack>
        </QueryClientProvider>
      </ThemeProvider>
      {showBrandedSplash && (
        <Animated.View
          exiting={FadeOut.duration(400)}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: colors.cream,
            alignItems: "center",
            justifyContent: "center",
          }}
          pointerEvents="none"
        >
          <Image
            source={require("../assets/splash-icon.png")}
            style={{ width: 120, height: 120, marginBottom: 12 }}
            resizeMode="contain"
          />
          <Text
            style={{
              fontFamily: "Baloo2_800ExtraBold",
              fontSize: 42,
              color: colors.charcoal,
              letterSpacing: -1,
            }}
          >
            Swadl
          </Text>
          <Text
            style={{
              fontFamily: "Nunito_500Medium",
              fontSize: 14,
              color: colors.textSecondary,
              marginTop: 4,
            }}
          >
            Parenting, coordinated.
          </Text>
        </Animated.View>
      )}
    </GestureHandlerRootView>
  );
}
