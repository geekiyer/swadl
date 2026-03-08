import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import Constants from "expo-constants";
import { supabase } from "../lib/supabase";

let Notifications: typeof import("expo-notifications") | null = null;
try {
  Notifications = require("expo-notifications");
  Notifications?.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
} catch {
  // expo-notifications not available (Expo Go SDK 53+)
}

async function registerForPushNotifications(): Promise<string | null> {
  if (!Notifications) return null;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const { status: existingStatus } =
    await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    return null;
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;

  if (!projectId) {
    console.warn("No EAS project ID found — push tokens require EAS builds");
    return null;
  }

  const { data: tokenData } = await Notifications.getExpoPushTokenAsync({
    projectId,
  });

  return tokenData;
}

async function savePushToken(token: string) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return;

  await supabase
    .from("profiles")
    .update({ push_token: token })
    .eq("id", session.user.id);
}

export function usePushNotifications() {
  const notificationListener = useRef<{ remove(): void } | undefined>();
  const responseListener = useRef<{ remove(): void } | undefined>();

  useEffect(() => {
    if (!Notifications) return;

    registerForPushNotifications().then((token) => {
      if (token) {
        savePushToken(token);
      }
    });

    notificationListener.current =
      Notifications.addNotificationReceivedListener((_notification) => {
        // Could update React Query cache here if needed
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((_response) => {
        // Could navigate to relevant screen based on response.notification.request.content.data
      });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);
}
