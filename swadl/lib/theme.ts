import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors as darkColors } from "../constants/theme";

export type ThemeMode = "dark" | "light";

const lightOverrides = {
  midnight: "#F8F9FB",
  navyDeep: "#F8F9FB",
  navyCard: "#FFFFFF",
  navyRaise: "#F1F3F7",
  navyBorder: "#E2E6ED",
  white: "#0F1D32",
  ash: "#4A5568",
  fog: "#9BA3B5",
} as const;

interface ThemeState {
  mode: ThemeMode;
  toggleMode: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: "dark",
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
  if (mode === "dark") return darkColors;
  return { ...darkColors, ...lightOverrides };
}
