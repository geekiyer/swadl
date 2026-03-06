import { Stack } from "expo-router";

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="baby-info" />
      <Stack.Screen name="household-setup" />
      <Stack.Screen name="instant-value" />
    </Stack>
  );
}
