import { useQuery } from "@tanstack/react-query";
import { supabase } from "./supabase";
import type { Database } from "../types/database";

type CareMode = Database["public"]["Enums"]["care_mode"];

export function useCareMode() {
  return useQuery({
    queryKey: ["careMode"],
    queryFn: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return null;

      const { data: profile } = await supabase
        .from("profiles")
        .select("household_id")
        .eq("id", session.user.id)
        .single();

      if (!profile) return null;

      const { data, error } = await supabase
        .from("households")
        .select("care_mode")
        .eq("id", profile.household_id)
        .single();

      if (error) throw error;
      return (data?.care_mode ?? "together") as CareMode;
    },
  });
}
