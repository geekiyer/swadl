import { useQuery } from "@tanstack/react-query";
import { supabase } from "./supabase";
import type { Database } from "../types/database";

type CareMode = Database["public"]["Enums"]["care_mode"];

interface CareModeResult {
  mode: CareMode;
  isTogether: boolean;
  isShiftBased: boolean;
  isNanny: boolean;
}

export function useCareMode() {
  const query = useQuery({
    queryKey: ["careMode"],
    queryFn: async (): Promise<CareMode> => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return "together";

      const { data: profile } = await supabase
        .from("profiles")
        .select("household_id")
        .eq("id", session.user.id)
        .single();

      if (!profile) return "together";

      const { data, error } = await supabase
        .from("households")
        .select("care_mode")
        .eq("id", profile.household_id)
        .single();

      if (error) throw error;
      return (data?.care_mode ?? "together") as CareMode;
    },
  });

  const mode = query.data ?? "together";
  const careMode: CareModeResult = {
    mode,
    isTogether: mode === "together",
    isShiftBased: mode === "shifts" || mode === "nanny",
    isNanny: mode === "nanny",
  };

  return { ...query, careMode };
}
