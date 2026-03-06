import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "./supabase";
import type { Database } from "../types/database";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Baby = Database["public"]["Tables"]["babies"]["Row"];
type FeedLog = Database["public"]["Tables"]["feed_logs"]["Row"];
type DiaperLog = Database["public"]["Tables"]["diaper_logs"]["Row"];
type SleepLog = Database["public"]["Tables"]["sleep_logs"]["Row"];
type Chore = Database["public"]["Tables"]["chores"]["Row"];
type PumpLog = Database["public"]["Tables"]["pump_logs"]["Row"];
type CaregiverShift = Database["public"]["Tables"]["caregiver_shifts"]["Row"];

// ============================================================
// Profile & Household
// ============================================================

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();
      if (error) throw error;
      return data as Profile;
    },
  });
}

export function useHouseholdMembers() {
  const { data: profile } = useProfile();
  return useQuery({
    queryKey: ["household-members", profile?.household_id],
    enabled: !!profile?.household_id,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("household_id", profile!.household_id);
      return (data as Profile[]) ?? [];
    },
  });
}

// ============================================================
// Babies
// ============================================================

export function useBabies() {
  const { data: profile } = useProfile();
  return useQuery({
    queryKey: ["babies", profile?.household_id],
    enabled: !!profile?.household_id,
    queryFn: async () => {
      const { data } = await supabase
        .from("babies")
        .select("*")
        .eq("household_id", profile!.household_id);
      return (data as Baby[]) ?? [];
    },
  });
}

// ============================================================
// Latest Logs (for Dashboard StatusCards)
// ============================================================

export function useLatestFeed(babyId: string | undefined) {
  return useQuery({
    queryKey: ["latest-feed", babyId],
    enabled: !!babyId,
    queryFn: async () => {
      const { data } = await supabase
        .from("feed_logs")
        .select("*")
        .eq("baby_id", babyId!)
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data as FeedLog | null;
    },
  });
}

export function useLatestDiaper(babyId: string | undefined) {
  return useQuery({
    queryKey: ["latest-diaper", babyId],
    enabled: !!babyId,
    queryFn: async () => {
      const { data } = await supabase
        .from("diaper_logs")
        .select("*")
        .eq("baby_id", babyId!)
        .order("logged_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data as DiaperLog | null;
    },
  });
}

export function useLatestSleep(babyId: string | undefined) {
  return useQuery({
    queryKey: ["latest-sleep", babyId],
    enabled: !!babyId,
    queryFn: async () => {
      const { data } = await supabase
        .from("sleep_logs")
        .select("*")
        .eq("baby_id", babyId!)
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data as SleepLog | null;
    },
  });
}

// ============================================================
// Latest Pump (for Dashboard)
// ============================================================

export function useLatestPump(babyId: string | undefined) {
  return useQuery({
    queryKey: ["latest-pump", babyId],
    enabled: !!babyId,
    queryFn: async () => {
      const { data } = await supabase
        .from("pump_logs")
        .select("*")
        .eq("baby_id", babyId!)
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data as PumpLog | null;
    },
  });
}

// ============================================================
// Daily Totals (for "together" mode Daily Briefing)
// ============================================================

export interface DailyTotals {
  feeds: number;
  feedBreakdown: string;
  totalOz: number;
  totalFeedMin: number;
  diapers: number;
  diaperBreakdown: string;
  naps: number;
  totalSleepMin: number;
  currentlySleeping: boolean;
  pumpSessions: number;
  pumpTotalOz: number;
  pumpTotalMin: number;
}

export function useDailyTotals(babyId: string | undefined) {
  return useQuery({
    queryKey: ["daily-totals", babyId],
    enabled: !!babyId,
    queryFn: async () => {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const since = startOfDay.toISOString();

      const [{ data: feeds }, { data: diapers }, { data: sleeps }, { data: pumps }] =
        await Promise.all([
          supabase
            .from("feed_logs")
            .select("*")
            .eq("baby_id", babyId!)
            .gte("started_at", since)
            .order("started_at", { ascending: false }),
          supabase
            .from("diaper_logs")
            .select("*")
            .eq("baby_id", babyId!)
            .gte("logged_at", since)
            .order("logged_at", { ascending: false }),
          supabase
            .from("sleep_logs")
            .select("*")
            .eq("baby_id", babyId!)
            .gte("started_at", since)
            .order("started_at", { ascending: false }),
          supabase
            .from("pump_logs")
            .select("*")
            .eq("baby_id", babyId!)
            .gte("started_at", since)
            .order("started_at", { ascending: false }),
        ]);

      const feedList = (feeds as FeedLog[]) ?? [];
      const diaperList = (diapers as DiaperLog[]) ?? [];
      const sleepList = (sleeps as SleepLog[]) ?? [];
      const pumpList = (pumps as PumpLog[]) ?? [];

      // Feed breakdown
      const breast = feedList.filter(
        (f) => f.type === "breast_left" || f.type === "breast_right"
      ).length;
      const bottle = feedList.filter((f) => f.type === "bottle").length;
      const solids = feedList.filter((f) => f.type === "solids").length;
      const parts: string[] = [];
      if (breast > 0) parts.push(`${breast} breast`);
      if (bottle > 0) parts.push(`${bottle} bottle`);
      if (solids > 0) parts.push(`${solids} solids`);

      const totalOz = feedList.reduce((s, f) => s + (f.amount_oz ?? 0), 0);
      const totalFeedMin = feedList.reduce(
        (s, f) => s + (f.duration_min ?? 0),
        0
      );

      // Diaper breakdown
      const wet = diaperList.filter(
        (d) => d.type === "wet" || d.type === "both"
      ).length;
      const dirty = diaperList.filter(
        (d) => d.type === "dirty" || d.type === "both"
      ).length;

      // Sleep
      const currentlySleeping = sleepList.some((s) => !s.ended_at);
      const totalSleepMin = sleepList.reduce((sum, s) => {
        const end = s.ended_at ? new Date(s.ended_at).getTime() : Date.now();
        return sum + (end - new Date(s.started_at).getTime()) / 60000;
      }, 0);

      // Pump
      const pumpTotalOz = pumpList.reduce((s, p) => s + (p.amount_oz ?? 0), 0);
      const pumpTotalMin = pumpList.reduce((s, p) => {
        if (!p.ended_at) return s;
        return s + (new Date(p.ended_at).getTime() - new Date(p.started_at).getTime()) / 60000;
      }, 0);

      return {
        feeds: feedList.length,
        feedBreakdown: parts.join(", ") || "None",
        totalOz: Math.round(totalOz * 10) / 10,
        totalFeedMin: Math.round(totalFeedMin),
        diapers: diaperList.length,
        diaperBreakdown: `${wet} wet, ${dirty} dirty`,
        naps: sleepList.length,
        totalSleepMin: Math.round(totalSleepMin),
        currentlySleeping,
        pumpSessions: pumpList.length,
        pumpTotalOz: Math.round(pumpTotalOz * 10) / 10,
        pumpTotalMin: Math.round(pumpTotalMin),
      } as DailyTotals;
    },
  });
}

// ============================================================
// Active Shift
// ============================================================

interface ShiftWithCaregiver extends CaregiverShift {
  caregiver_display_name?: string;
}

export function useActiveShift() {
  const { data: profile } = useProfile();
  return useQuery({
    queryKey: ["active-shift", profile?.household_id],
    enabled: !!profile?.household_id,
    queryFn: async () => {
      const { data: shift } = await supabase
        .from("caregiver_shifts")
        .select("*")
        .eq("household_id", profile!.household_id)
        .is("ended_at", null)
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!shift) return null;

      // Get caregiver name separately
      const { data: caregiver } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", (shift as CaregiverShift).caregiver_id)
        .single();

      return {
        ...(shift as CaregiverShift),
        caregiver_display_name: caregiver?.display_name,
      } as ShiftWithCaregiver;
    },
  });
}

// ============================================================
// Next Tasks (upcoming chores)
// ============================================================

interface ChoreWithAssignee extends Chore {
  assignee_name?: string;
}

export function useNextTasks(limit = 3) {
  const { data: profile } = useProfile();
  return useQuery({
    queryKey: ["next-tasks", profile?.household_id, limit],
    enabled: !!profile?.household_id,
    queryFn: async () => {
      const { data: chores } = await supabase
        .from("chores")
        .select("*")
        .eq("household_id", profile!.household_id)
        .order("created_at", { ascending: true });

      if (!chores || chores.length === 0) return [];

      // Get today's completions
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const choreIds = (chores as Chore[]).map((c) => c.id);
      const { data: completions } = await supabase
        .from("chore_completions")
        .select("chore_id")
        .in("chore_id", choreIds)
        .gte("completed_at", startOfDay.toISOString());

      const completedIds = new Set(completions?.map((c) => c.chore_id) ?? []);

      // Get assignee names for assigned chores
      const incomplete = (chores as Chore[])
        .filter((c) => !completedIds.has(c.id))
        .slice(0, limit);

      const assigneeIds = incomplete
        .map((c) => c.assigned_to)
        .filter((id): id is string => !!id);

      let assigneeMap: Record<string, string> = {};
      if (assigneeIds.length > 0) {
        const { data: assignees } = await supabase
          .from("profiles")
          .select("id, display_name")
          .in("id", assigneeIds);
        assigneeMap = Object.fromEntries(
          (assignees as Pick<Profile, "id" | "display_name">[])?.map((a) => [
            a.id,
            a.display_name,
          ]) ?? []
        );
      }

      return incomplete.map(
        (c): ChoreWithAssignee => ({
          ...c,
          assignee_name: c.assigned_to
            ? assigneeMap[c.assigned_to]
            : undefined,
        })
      );
    },
  });
}

// ============================================================
// Complete a chore
// ============================================================

export function useCompleteChore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (choreId: string) => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");
      const { error } = await supabase.from("chore_completions").insert({
        chore_id: choreId,
        completed_by: session.user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["next-tasks"] });
    },
  });
}

// ============================================================
// All Chores (for Chore Manager)
// ============================================================

export function useAllChores() {
  const { data: profile } = useProfile();
  return useQuery({
    queryKey: ["all-chores", profile?.household_id],
    enabled: !!profile?.household_id,
    queryFn: async () => {
      const { data: chores } = await supabase
        .from("chores")
        .select("*")
        .eq("household_id", profile!.household_id)
        .order("category", { ascending: true })
        .order("title", { ascending: true });

      if (!chores || chores.length === 0) return [];

      // Get today's completions
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const choreIds = (chores as Chore[]).map((c) => c.id);
      const { data: completions } = await supabase
        .from("chore_completions")
        .select("chore_id")
        .in("chore_id", choreIds)
        .gte("completed_at", startOfDay.toISOString());

      const completedIds = new Set(completions?.map((c) => c.chore_id) ?? []);

      // Get assignee names
      const assigneeIds = (chores as Chore[])
        .map((c) => c.assigned_to)
        .filter((id): id is string => !!id);

      let assigneeMap: Record<string, string> = {};
      if (assigneeIds.length > 0) {
        const { data: assignees } = await supabase
          .from("profiles")
          .select("id, display_name")
          .in("id", [...new Set(assigneeIds)]);
        assigneeMap = Object.fromEntries(
          (assignees as Pick<Profile, "id" | "display_name">[])?.map((a) => [
            a.id,
            a.display_name,
          ]) ?? []
        );
      }

      return (chores as Chore[]).map((c) => ({
        ...c,
        assignee_name: c.assigned_to ? assigneeMap[c.assigned_to] : undefined,
        completed_today: completedIds.has(c.id),
      }));
    },
  });
}

export type ChoreWithStatus = NonNullable<
  ReturnType<typeof useAllChores>["data"]
>[number];

// ============================================================
// Assign Chore
// ============================================================

export function useAssignChore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      choreId,
      assignTo,
    }: {
      choreId: string;
      assignTo: string | null;
    }) => {
      const { error } = await supabase
        .from("chores")
        .update({ assigned_to: assignTo })
        .eq("id", choreId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-chores"] });
      queryClient.invalidateQueries({ queryKey: ["next-tasks"] });
    },
  });
}

// ============================================================
// Create Chore
// ============================================================

export function useCreateChore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (chore: {
      title: string;
      category: string;
      recurrence: Record<string, unknown>;
      assigned_to?: string | null;
      description?: string;
    }) => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { data: profile } = await supabase
        .from("profiles")
        .select("household_id")
        .eq("id", session.user.id)
        .single();

      if (!profile) throw new Error("No profile found");

      const { error } = await supabase.from("chores").insert({
        household_id: (profile as Profile).household_id,
        title: chore.title,
        category: chore.category as Chore["category"],
        recurrence: chore.recurrence,
        assigned_to: chore.assigned_to ?? null,
        description: chore.description ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-chores"] });
      queryClient.invalidateQueries({ queryKey: ["next-tasks"] });
    },
  });
}

// ============================================================
// Handoff Briefing
// ============================================================

export interface HandoffData {
  currentMood: string | null;
  feedSummary: string;
  sleepSummary: string;
  diaperSummary: string;
  nextTasks: { title: string; time?: string }[];
  previousCaregiver: string | null;
}

export function useHandoffBriefing() {
  const { data: profile } = useProfile();
  return useQuery({
    queryKey: ["handoff-briefing", profile?.household_id],
    enabled: !!profile?.household_id,
    queryFn: async () => {
      const fourHoursAgo = new Date(
        Date.now() - 4 * 60 * 60 * 1000
      ).toISOString();

      // Get babies
      const { data: babies } = await supabase
        .from("babies")
        .select("*")
        .eq("household_id", profile!.household_id);

      const baby = (babies as Baby[])?.[0];
      if (!baby) return null;

      // Feed logs last 4 hours
      const { data: feeds } = await supabase
        .from("feed_logs")
        .select("*")
        .eq("baby_id", baby.id)
        .gte("started_at", fourHoursAgo)
        .order("started_at", { ascending: false });

      const feedList = (feeds as FeedLog[]) ?? [];
      let feedSummary = "No feeds in the last 4 hours.";
      if (feedList.length > 0) {
        const feedDescs = feedList.map((f) => {
          const time = new Date(f.started_at).toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
          });
          const type = f.type.replace("_", " ");
          const detail = f.amount_oz
            ? ` (${f.amount_oz} oz)`
            : f.duration_min
              ? ` (${f.duration_min} min)`
              : "";
          return `${type}${detail} at ${time}`;
        });
        feedSummary = `${feedList.length} feed(s): ${feedDescs.join(", ")}`;
      }

      // Sleep logs last 4 hours
      const { data: sleeps } = await supabase
        .from("sleep_logs")
        .select("*")
        .eq("baby_id", baby.id)
        .gte("started_at", fourHoursAgo)
        .order("started_at", { ascending: false });

      const sleepList = (sleeps as SleepLog[]) ?? [];
      let sleepSummary = "No sleep logged in the last 4 hours.";
      if (sleepList.length > 0) {
        const current = sleepList.find((s) => !s.ended_at);
        if (current) {
          const mins = Math.floor(
            (Date.now() - new Date(current.started_at).getTime()) / 60000
          );
          sleepSummary = `Currently sleeping in ${current.location} (${mins} min). ${sleepList.length - 1} other nap(s).`;
        } else {
          const totalMins = sleepList.reduce((sum, s) => {
            if (s.ended_at) {
              return (
                sum +
                (new Date(s.ended_at).getTime() -
                  new Date(s.started_at).getTime()) /
                  60000
              );
            }
            return sum;
          }, 0);
          sleepSummary = `${sleepList.length} nap(s), ~${Math.round(totalMins)} min total.`;
        }
      }

      // Diaper logs last 4 hours
      const { data: diapers } = await supabase
        .from("diaper_logs")
        .select("*")
        .eq("baby_id", baby.id)
        .gte("logged_at", fourHoursAgo)
        .order("logged_at", { ascending: false });

      const diaperList = (diapers as DiaperLog[]) ?? [];
      let diaperSummary = "No diaper changes in the last 4 hours.";
      if (diaperList.length > 0) {
        const wet = diaperList.filter(
          (d) => d.type === "wet" || d.type === "both"
        ).length;
        const dirty = diaperList.filter(
          (d) => d.type === "dirty" || d.type === "both"
        ).length;
        diaperSummary = `${diaperList.length} change(s): ${wet} wet, ${dirty} dirty.`;
      }

      // Next tasks
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const { data: chores } = await supabase
        .from("chores")
        .select("*")
        .eq("household_id", profile!.household_id)
        .order("created_at", { ascending: true });

      const choreList = (chores as Chore[]) ?? [];
      const choreIds = choreList.map((c) => c.id);

      let completedIds = new Set<string>();
      if (choreIds.length > 0) {
        const { data: completions } = await supabase
          .from("chore_completions")
          .select("chore_id")
          .in("chore_id", choreIds)
          .gte("completed_at", startOfDay.toISOString());
        completedIds = new Set(completions?.map((c) => c.chore_id) ?? []);
      }

      const nextTasks = choreList
        .filter((c) => !completedIds.has(c.id))
        .slice(0, 3)
        .map((c) => ({
          title: c.title,
          time: (c.recurrence as Record<string, string>)?.time,
        }));

      // Active shift / previous caregiver
      const { data: activeShift } = await supabase
        .from("caregiver_shifts")
        .select("*")
        .eq("household_id", profile!.household_id)
        .is("ended_at", null)
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      let previousCaregiver: string | null = null;
      if (activeShift) {
        const { data: cg } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("id", (activeShift as CaregiverShift).caregiver_id)
          .single();
        previousCaregiver = (cg as Profile)?.display_name ?? null;
      }

      return {
        currentMood: null,
        feedSummary,
        sleepSummary,
        diaperSummary,
        nextTasks,
        previousCaregiver,
      } as HandoffData;
    },
  });
}

// ============================================================
// Start Shift (end previous, start new)
// ============================================================

export function useStartShift() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { data: profile } = await supabase
        .from("profiles")
        .select("household_id")
        .eq("id", session.user.id)
        .single();

      if (!profile) throw new Error("No profile");
      const householdId = (profile as Profile).household_id;

      // End any active shifts
      await supabase
        .from("caregiver_shifts")
        .update({ ended_at: new Date().toISOString() })
        .eq("household_id", householdId)
        .is("ended_at", null);

      // Start new shift
      const { error } = await supabase.from("caregiver_shifts").insert({
        household_id: householdId,
        caregiver_id: session.user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active-shift"] });
      queryClient.invalidateQueries({ queryKey: ["handoff-briefing"] });
    },
  });
}

// ============================================================
// Delete Chore
// ============================================================

export function useDeleteChore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (choreId: string) => {
      const { error } = await supabase
        .from("chores")
        .delete()
        .eq("id", choreId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-chores"] });
      queryClient.invalidateQueries({ queryKey: ["next-tasks"] });
    },
  });
}

// ============================================================
// Update Baby
// ============================================================

export function useUpdateBaby() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: {
      id: string;
      name?: string;
      date_of_birth?: string;
      feeding_method?: Baby["feeding_method"];
    }) => {
      const { error } = await supabase
        .from("babies")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["babies"] });
    },
  });
}

// ============================================================
// Update Profile
// ============================================================

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: {
      id: string;
      display_name?: string;
      role?: Profile["role"];
    }) => {
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["household-members"] });
    },
  });
}

// ============================================================
// Summary Data (for Summary screen)
// ============================================================

export interface SummaryData {
  // Feeding
  feedCount: number;
  feedTotalOz: number;
  feedTotalMin: number;
  feedByType: Record<string, number>;
  avgTimeBetweenFeeds: number | null; // minutes
  avgOzPerBottle: number | null;
  // Pumping
  pumpCount: number;
  pumpTotalOz: number;
  pumpTotalMin: number;
  // Diapers
  diaperCount: number;
  diaperByType: Record<string, number>;
  lowWetWarning: boolean;
  // Sleep
  sleepTotalMin: number;
  napCount: number;
  longestStretchMin: number;
  nightSleepMin: number;
  daySleepMin: number;
  // Activity log
  activityLog: {
    id: string;
    kind: "feed" | "diaper" | "sleep" | "pump";
    timestamp: string;
    label: string;
    detail: string;
    loggedBy: string;
  }[];
}

export function useSummary(
  babyId: string | undefined,
  dateStr: string // YYYY-MM-DD
) {
  return useQuery({
    queryKey: ["summary", babyId, dateStr],
    enabled: !!babyId,
    queryFn: async () => {
      const dayStart = new Date(`${dateStr}T00:00:00`);
      const dayEnd = new Date(`${dateStr}T23:59:59.999`);
      const since = dayStart.toISOString();
      const until = dayEnd.toISOString();

      const [{ data: feeds }, { data: diapers }, { data: sleeps }, { data: pumps }] =
        await Promise.all([
          supabase
            .from("feed_logs")
            .select("*")
            .eq("baby_id", babyId!)
            .gte("started_at", since)
            .lte("started_at", until)
            .order("started_at", { ascending: true }),
          supabase
            .from("diaper_logs")
            .select("*")
            .eq("baby_id", babyId!)
            .gte("logged_at", since)
            .lte("logged_at", until)
            .order("logged_at", { ascending: true }),
          supabase
            .from("sleep_logs")
            .select("*")
            .eq("baby_id", babyId!)
            .gte("started_at", since)
            .lte("started_at", until)
            .order("started_at", { ascending: true }),
          supabase
            .from("pump_logs")
            .select("*")
            .eq("baby_id", babyId!)
            .gte("started_at", since)
            .lte("started_at", until)
            .order("started_at", { ascending: true }),
        ]);

      const feedList = (feeds as FeedLog[]) ?? [];
      const diaperList = (diapers as DiaperLog[]) ?? [];
      const sleepList = (sleeps as SleepLog[]) ?? [];
      const pumpList = (pumps as PumpLog[]) ?? [];

      // Resolve names
      const profileIds = new Set<string>();
      feedList.forEach((f) => profileIds.add(f.logged_by));
      diaperList.forEach((d) => profileIds.add(d.logged_by));
      sleepList.forEach((s) => profileIds.add(s.logged_by));
      pumpList.forEach((p) => profileIds.add(p.logged_by));
      let nameMap: Record<string, string> = {};
      if (profileIds.size > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, display_name")
          .in("id", [...profileIds]);
        nameMap = Object.fromEntries(
          (profiles as Pick<Profile, "id" | "display_name">[])?.map((p) => [
            p.id,
            p.display_name,
          ]) ?? []
        );
      }

      // Feed metrics
      const feedByType: Record<string, number> = {};
      let feedTotalOz = 0;
      let feedTotalMin = 0;
      let bottleCount = 0;
      let bottleTotalOz = 0;
      feedList.forEach((f) => {
        const t = f.type.replace("_", " ");
        feedByType[t] = (feedByType[t] ?? 0) + 1;
        feedTotalOz += f.amount_oz ?? 0;
        feedTotalMin += f.duration_min ?? 0;
        if (f.type === "bottle") {
          bottleCount++;
          bottleTotalOz += f.amount_oz ?? 0;
        }
      });

      let avgTimeBetweenFeeds: number | null = null;
      if (feedList.length >= 2) {
        const first = new Date(feedList[0].started_at).getTime();
        const last = new Date(
          feedList[feedList.length - 1].started_at
        ).getTime();
        avgTimeBetweenFeeds = Math.round(
          (last - first) / (feedList.length - 1) / 60000
        );
      }

      // Diaper metrics
      const diaperByType: Record<string, number> = {};
      let wetCount = 0;
      diaperList.forEach((d) => {
        diaperByType[d.type] = (diaperByType[d.type] ?? 0) + 1;
        if (d.type === "wet" || d.type === "both") wetCount++;
      });

      // Sleep metrics
      const nightStart = 19; // 7 PM
      const nightEnd = 7; // 7 AM
      let sleepTotalMin = 0;
      let longestStretchMin = 0;
      let nightSleepMin = 0;
      let daySleepMin = 0;

      sleepList.forEach((s) => {
        const start = new Date(s.started_at);
        const end = s.ended_at ? new Date(s.ended_at) : new Date();
        const durMin = (end.getTime() - start.getTime()) / 60000;
        sleepTotalMin += durMin;
        if (durMin > longestStretchMin) longestStretchMin = durMin;

        const hour = start.getHours();
        if (hour >= nightStart || hour < nightEnd) {
          nightSleepMin += durMin;
        } else {
          daySleepMin += durMin;
        }
      });

      // Activity log
      const activityLog: SummaryData["activityLog"] = [];
      feedList.forEach((f) => {
        const type = f.type.replace("_", " ");
        activityLog.push({
          id: f.id,
          kind: "feed",
          timestamp: f.started_at,
          label: `Fed (${type})`,
          detail: f.amount_oz
            ? `${f.amount_oz} oz`
            : f.duration_min
              ? `${f.duration_min} min`
              : "",
          loggedBy: nameMap[f.logged_by] ?? "Unknown",
        });
      });
      diaperList.forEach((d) => {
        activityLog.push({
          id: d.id,
          kind: "diaper",
          timestamp: d.logged_at,
          label: `Diaper (${d.type})`,
          detail: "",
          loggedBy: nameMap[d.logged_by] ?? "Unknown",
        });
      });
      sleepList.forEach((s) => {
        const dur = s.ended_at
          ? `${Math.round((new Date(s.ended_at).getTime() - new Date(s.started_at).getTime()) / 60000)} min`
          : "ongoing";
        activityLog.push({
          id: s.id,
          kind: "sleep",
          timestamp: s.started_at,
          label: `Sleep (${s.location})`,
          detail: dur,
          loggedBy: nameMap[s.logged_by] ?? "Unknown",
        });
      });
      // Pump metrics
      let pumpTotalOz = 0;
      let pumpTotalMin = 0;
      pumpList.forEach((p) => {
        pumpTotalOz += p.amount_oz ?? 0;
        if (p.ended_at) {
          pumpTotalMin +=
            (new Date(p.ended_at).getTime() -
              new Date(p.started_at).getTime()) /
            60000;
        }
      });

      pumpList.forEach((p) => {
        const pType = p.pump_type.replace("_", " ");
        const dur = p.ended_at
          ? `${Math.round((new Date(p.ended_at).getTime() - new Date(p.started_at).getTime()) / 60000)} min`
          : "ongoing";
        const detail = [
          dur,
          p.amount_oz ? `${p.amount_oz} oz` : "",
        ]
          .filter(Boolean)
          .join(" · ");
        activityLog.push({
          id: p.id,
          kind: "pump",
          timestamp: p.started_at,
          label: `Pump (${pType})`,
          detail,
          loggedBy: nameMap[p.logged_by] ?? "Unknown",
        });
      });

      activityLog.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      return {
        feedCount: feedList.length,
        feedTotalOz: Math.round(feedTotalOz * 10) / 10,
        feedTotalMin: Math.round(feedTotalMin),
        feedByType,
        avgTimeBetweenFeeds,
        avgOzPerBottle:
          bottleCount > 0
            ? Math.round((bottleTotalOz / bottleCount) * 10) / 10
            : null,
        pumpCount: pumpList.length,
        pumpTotalOz: Math.round(pumpTotalOz * 10) / 10,
        pumpTotalMin: Math.round(pumpTotalMin),
        diaperCount: diaperList.length,
        diaperByType,
        lowWetWarning: wetCount < 4,
        sleepTotalMin: Math.round(sleepTotalMin),
        napCount: sleepList.length,
        longestStretchMin: Math.round(longestStretchMin),
        nightSleepMin: Math.round(nightSleepMin),
        daySleepMin: Math.round(daySleepMin),
        activityLog,
      } as SummaryData;
    },
  });
}

// ============================================================
// Trends Data (for Trends screen)
// ============================================================

export interface TrendDay {
  date: string; // YYYY-MM-DD
  feedCount: number;
  feedOz: number;
  diaperCount: number;
  diaperWet: number;
  diaperDirty: number;
  nightSleepHrs: number;
  napHrs: number;
  pumpCount: number;
  pumpOz: number;
}

export function useTrends(babyId: string | undefined, days: number) {
  return useQuery({
    queryKey: ["trends", babyId, days],
    enabled: !!babyId,
    queryFn: async () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      startDate.setHours(0, 0, 0, 0);

      const [{ data: feeds }, { data: diapers }, { data: sleeps }, { data: pumps }] =
        await Promise.all([
          supabase
            .from("feed_logs")
            .select("*")
            .eq("baby_id", babyId!)
            .gte("started_at", startDate.toISOString())
            .order("started_at", { ascending: true }),
          supabase
            .from("diaper_logs")
            .select("*")
            .eq("baby_id", babyId!)
            .gte("logged_at", startDate.toISOString())
            .order("logged_at", { ascending: true }),
          supabase
            .from("sleep_logs")
            .select("*")
            .eq("baby_id", babyId!)
            .gte("started_at", startDate.toISOString())
            .order("started_at", { ascending: true }),
          supabase
            .from("pump_logs")
            .select("*")
            .eq("baby_id", babyId!)
            .gte("started_at", startDate.toISOString())
            .order("started_at", { ascending: true }),
        ]);

      const feedList = (feeds as FeedLog[]) ?? [];
      const diaperList = (diapers as DiaperLog[]) ?? [];
      const sleepList = (sleeps as SleepLog[]) ?? [];
      const pumpList = (pumps as PumpLog[]) ?? [];

      // Build day buckets
      const dayMap = new Map<string, TrendDay>();
      for (let i = 0; i < days; i++) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        dayMap.set(key, {
          date: key,
          feedCount: 0,
          feedOz: 0,
          diaperCount: 0,
          diaperWet: 0,
          diaperDirty: 0,
          nightSleepHrs: 0,
          napHrs: 0,
          pumpCount: 0,
          pumpOz: 0,
        });
      }

      feedList.forEach((f) => {
        const key = f.started_at.slice(0, 10);
        const day = dayMap.get(key);
        if (day) {
          day.feedCount++;
          day.feedOz += f.amount_oz ?? 0;
        }
      });

      diaperList.forEach((d) => {
        const key = d.logged_at.slice(0, 10);
        const day = dayMap.get(key);
        if (day) {
          day.diaperCount++;
          if (d.type === "wet" || d.type === "both") day.diaperWet++;
          if (d.type === "dirty" || d.type === "both") day.diaperDirty++;
        }
      });

      sleepList.forEach((s) => {
        const key = s.started_at.slice(0, 10);
        const day = dayMap.get(key);
        if (day) {
          const start = new Date(s.started_at);
          const end = s.ended_at ? new Date(s.ended_at) : new Date();
          const hrs = (end.getTime() - start.getTime()) / 3600000;
          const hour = start.getHours();
          if (hour >= 19 || hour < 7) {
            day.nightSleepHrs += hrs;
          } else {
            day.napHrs += hrs;
          }
        }
      });

      pumpList.forEach((p) => {
        const key = p.started_at.slice(0, 10);
        const day = dayMap.get(key);
        if (day) {
          day.pumpCount++;
          day.pumpOz += p.amount_oz ?? 0;
        }
      });

      return [...dayMap.values()];
    },
  });
}

// ============================================================
// Recent Activity Feed (for "together" mode)
// ============================================================

export interface ActivityItem {
  id: string;
  kind: "feed" | "diaper" | "sleep" | "pump";
  timestamp: string;
  label: string;
  detail: string;
  loggedBy: string;
}

export function useRecentActivity(babyId: string | undefined, limit = 10) {
  return useQuery({
    queryKey: ["recent-activity", babyId, limit],
    enabled: !!babyId,
    queryFn: async () => {
      const [{ data: feeds }, { data: diapers }, { data: sleeps }, { data: pumps }] =
        await Promise.all([
          supabase
            .from("feed_logs")
            .select("*")
            .eq("baby_id", babyId!)
            .order("started_at", { ascending: false })
            .limit(limit),
          supabase
            .from("diaper_logs")
            .select("*")
            .eq("baby_id", babyId!)
            .order("logged_at", { ascending: false })
            .limit(limit),
          supabase
            .from("sleep_logs")
            .select("*")
            .eq("baby_id", babyId!)
            .order("started_at", { ascending: false })
            .limit(limit),
          supabase
            .from("pump_logs")
            .select("*")
            .eq("baby_id", babyId!)
            .order("started_at", { ascending: false })
            .limit(limit),
        ]);

      // Collect all unique profile IDs
      const profileIds = new Set<string>();
      (feeds as FeedLog[] | null)?.forEach((f) => profileIds.add(f.logged_by));
      (diapers as DiaperLog[] | null)?.forEach((d) =>
        profileIds.add(d.logged_by)
      );
      (sleeps as SleepLog[] | null)?.forEach((s) =>
        profileIds.add(s.logged_by)
      );
      (pumps as PumpLog[] | null)?.forEach((p) =>
        profileIds.add(p.logged_by)
      );

      let nameMap: Record<string, string> = {};
      if (profileIds.size > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, display_name")
          .in("id", [...profileIds]);
        nameMap = Object.fromEntries(
          (profiles as Pick<Profile, "id" | "display_name">[])?.map((p) => [
            p.id,
            p.display_name,
          ]) ?? []
        );
      }

      const items: ActivityItem[] = [];

      (feeds as FeedLog[] | null)?.forEach((f) => {
        const type = f.type.replace("_", " ");
        const detail = f.amount_oz
          ? `${f.amount_oz} oz`
          : f.duration_min
            ? `${f.duration_min} min`
            : "";
        items.push({
          id: f.id,
          kind: "feed",
          timestamp: f.started_at,
          label: `Fed (${type})`,
          detail,
          loggedBy: nameMap[f.logged_by] ?? "Unknown",
        });
      });

      (diapers as DiaperLog[] | null)?.forEach((d) => {
        items.push({
          id: d.id,
          kind: "diaper",
          timestamp: d.logged_at,
          label: `Diaper (${d.type})`,
          detail: "",
          loggedBy: nameMap[d.logged_by] ?? "Unknown",
        });
      });

      (sleeps as SleepLog[] | null)?.forEach((s) => {
        const duration = s.ended_at
          ? `${Math.round((new Date(s.ended_at).getTime() - new Date(s.started_at).getTime()) / 60000)} min`
          : "ongoing";
        items.push({
          id: s.id,
          kind: "sleep",
          timestamp: s.started_at,
          label: `Sleep (${s.location})`,
          detail: duration,
          loggedBy: nameMap[s.logged_by] ?? "Unknown",
        });
      });

      (pumps as PumpLog[] | null)?.forEach((p) => {
        const pType = p.pump_type.replace("_", " ");
        const dur = p.ended_at
          ? `${Math.round((new Date(p.ended_at).getTime() - new Date(p.started_at).getTime()) / 60000)} min`
          : "ongoing";
        const detail = [dur, p.amount_oz ? `${p.amount_oz} oz` : ""]
          .filter(Boolean)
          .join(" · ");
        items.push({
          id: p.id,
          kind: "pump",
          timestamp: p.started_at,
          label: `Pump (${pType})`,
          detail,
          loggedBy: nameMap[p.logged_by] ?? "Unknown",
        });
      });

      items.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      return items.slice(0, limit);
    },
  });
}

// ============================================================
// Realtime subscriptions
// ============================================================

export function useDashboardRealtime() {
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();

  useEffect(() => {
    if (!profile?.household_id) return;

    const channel = supabase
      .channel("dashboard-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "feed_logs" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["latest-feed"] });
          queryClient.invalidateQueries({ queryKey: ["recent-activity"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "diaper_logs" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["latest-diaper"] });
          queryClient.invalidateQueries({ queryKey: ["recent-activity"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "sleep_logs" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["latest-sleep"] });
          queryClient.invalidateQueries({ queryKey: ["recent-activity"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pump_logs" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["latest-pump"] });
          queryClient.invalidateQueries({ queryKey: ["recent-activity"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "caregiver_shifts" },
        () => queryClient.invalidateQueries({ queryKey: ["active-shift"] })
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "chores" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["all-chores"] });
          queryClient.invalidateQueries({ queryKey: ["next-tasks"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "chore_completions" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["next-tasks"] });
          queryClient.invalidateQueries({ queryKey: ["all-chores"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.household_id, queryClient]);
}
