import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Session } from "@supabase/supabase-js";

interface AuthState {
  session: Session | null;
  setSession: (session: Session | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      setSession: (session) => set({ session }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

interface OnboardingState {
  babyName: string;
  dateOfBirth: string;
  feedingMethod: "breast" | "bottle" | "combo" | "solids" | "";
  partnerEmail: string;
  careMode: "together" | "shifts" | "nanny";
  setBabyInfo: (name: string, dob: string, method: string) => void;
  setPartnerEmail: (email: string) => void;
  setCareMode: (mode: "together" | "shifts" | "nanny") => void;
  reset: () => void;
}

// ============================================================
// Unit Preference (oz / ml)
// ============================================================

export type VolumeUnit = "oz" | "ml";

interface UnitState {
  unit: VolumeUnit;
  toggleUnit: () => void;
}

export const useUnitStore = create<UnitState>()(
  persist(
    (set, get) => ({
      unit: "oz",
      toggleUnit: () => set({ unit: get().unit === "oz" ? "ml" : "oz" }),
    }),
    {
      name: "unit-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Conversion helpers — DB always stores oz
export function ozToMl(oz: number): number {
  return Math.round(oz * 29.5735 * 10) / 10;
}

export function mlToOz(ml: number): number {
  return Math.round((ml / 29.5735) * 10) / 10;
}

export function displayVolume(oz: number, unit: VolumeUnit): string {
  if (unit === "ml") return `${ozToMl(oz)} ml`;
  return `${Math.round(oz * 10) / 10} oz`;
}

export function parseInputToOz(value: string, unit: VolumeUnit): number {
  const num = parseFloat(value);
  if (isNaN(num)) return 0;
  return unit === "ml" ? mlToOz(num) : num;
}

// ============================================================
// Last Used Formula Brand
// ============================================================

interface FormulaBrandState {
  lastBrand: string | null;
  setLastBrand: (brand: string) => void;
}

export const useFormulaBrandStore = create<FormulaBrandState>()(
  persist(
    (set) => ({
      lastBrand: null,
      setLastBrand: (brand) => set({ lastBrand: brand }),
    }),
    {
      name: "formula-brand-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// ============================================================
// Offline Queue
// ============================================================

export interface QueuedLogEntry {
  id: string;
  table: "feed_logs" | "diaper_logs" | "sleep_logs" | "pump_logs";
  payload: Record<string, unknown>;
  createdAt: string;
}

interface OfflineQueueState {
  queue: QueuedLogEntry[];
  push: (entry: QueuedLogEntry) => void;
  remove: (id: string) => void;
  clear: () => void;
}

export const useOfflineQueue = create<OfflineQueueState>()(
  persist(
    (set) => ({
      queue: [],
      push: (entry) =>
        set((state) => ({ queue: [...state.queue, entry] })),
      remove: (id) =>
        set((state) => ({ queue: state.queue.filter((e) => e.id !== id) })),
      clear: () => set({ queue: [] }),
    }),
    {
      name: "offline-queue",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// ============================================================
// Onboarding
// ============================================================

export const useOnboardingStore = create<OnboardingState>((set) => ({
  babyName: "",
  dateOfBirth: "",
  feedingMethod: "",
  partnerEmail: "",
  careMode: "together",
  setBabyInfo: (name, dob, method) =>
    set({
      babyName: name,
      dateOfBirth: dob,
      feedingMethod: method as OnboardingState["feedingMethod"],
    }),
  setPartnerEmail: (email) => set({ partnerEmail: email }),
  setCareMode: (mode) => set({ careMode: mode }),
  reset: () =>
    set({
      babyName: "",
      dateOfBirth: "",
      feedingMethod: "",
      partnerEmail: "",
      careMode: "together",
    }),
}));
