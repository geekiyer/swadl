import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors } from "../constants/theme";

export type ThemeMode = "dark" | "light";

interface ThemeState {
  mode: ThemeMode;
  toggleMode: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: "light",
      toggleMode: () => set({ mode: get().mode === "dark" ? "light" : "dark" }),
    }),
    {
      name: "theme-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export function useThemeColors() {
  const mode = useThemeStore((s) => s.mode);

  if (mode === "light") {
    return {
      // Backgrounds
      screenBg: colors.cream,
      cardBg: colors.cardWhite,
      raisedBg: colors.creamWarm,
      border: colors.borderSoft,
      borderStrong: colors.borderWarm,
      // Text
      textPrimary: colors.textDark,
      textBody: colors.textBody,
      textSecondary: colors.textSecondary,
      textMuted: colors.textMuted,
      textPlaceholder: colors.textPlaceholder,
      textDetail: colors.textDetail,
      // Category icons
      feedIcon: colors.feedIcon,
      diaperIcon: colors.diaperIcon,
      sleepIcon: colors.sleepIcon,
      pumpIcon: colors.pumpIcon,
      growthIcon: colors.growthIcon,
      routineIcon: colors.routineIcon,
      // Category fills
      feedFill: colors.feedFill,
      diaperFill: colors.diaperFill,
      sleepFill: colors.sleepFill,
      pumpFill: colors.pumpFill,
      growthFill: colors.growthFill,
      routineFill: colors.routineFill,
      // Pattern
      patternColor: colors.patternLight,
      patternOpacity: 0.03,
      // Gradient
      gradientStart: colors.creamGold,
      // Mode
      mode: "light" as const,
    };
  }

  return {
    // Backgrounds
    screenBg: colors.charcoal,
    cardBg: colors.charcoalCard,
    raisedBg: colors.charcoalRaise,
    border: colors.charcoalBorder,
    borderStrong: colors.charcoalBorder,
    // Text
    textPrimary: colors.textLightPrimary,
    textBody: colors.textLightBody,
    textSecondary: colors.textLightSecondary,
    textMuted: colors.textLightMuted,
    textPlaceholder: colors.textLightPlaceholder,
    textDetail: colors.textDetailDark,
    // Category icons
    feedIcon: colors.feedIconDark,
    diaperIcon: colors.diaperIconDark,
    sleepIcon: colors.sleepIconDark,
    pumpIcon: colors.pumpIconDark,
    growthIcon: colors.growthIconDark,
    routineIcon: colors.routineIconDark,
    // Category fills
    feedFill: colors.feedFillDark,
    diaperFill: colors.diaperFillDark,
    sleepFill: colors.sleepFillDark,
    pumpFill: colors.pumpFillDark,
    growthFill: colors.growthFillDark,
    routineFill: colors.routineFillDark,
    // Pattern
    patternColor: colors.patternDark,
    patternOpacity: 0.04,
    // Gradient
    gradientStart: '#28201A',
    // Mode
    mode: "dark" as const,
  };
}
