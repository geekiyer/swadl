// Generated types for the Supabase database schema.
// Will be auto-generated from Supabase after migrations are applied (Step 2).

export type Database = {
  public: {
    Tables: {
      households: {
        Row: {
          id: string;
          name: string;
          timezone: string;
          care_mode: "together" | "shifts" | "nanny";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          timezone?: string;
          care_mode?: "together" | "shifts" | "nanny";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          timezone?: string;
          care_mode?: "together" | "shifts" | "nanny";
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          household_id: string;
          display_name: string;
          role: "admin" | "caregiver" | "restricted";
          avatar_url: string | null;
          push_token: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          household_id: string;
          display_name: string;
          role?: "admin" | "caregiver" | "restricted";
          avatar_url?: string | null;
          push_token?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          household_id?: string;
          display_name?: string;
          role?: "admin" | "caregiver" | "restricted";
          avatar_url?: string | null;
          push_token?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_household_id_fkey";
            columns: ["household_id"];
            referencedRelation: "households";
            referencedColumns: ["id"];
          },
        ];
      };
      babies: {
        Row: {
          id: string;
          household_id: string;
          name: string;
          date_of_birth: string;
          feeding_method: "breast" | "bottle" | "combo" | "solids";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          household_id: string;
          name: string;
          date_of_birth: string;
          feeding_method: "breast" | "bottle" | "combo" | "solids";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          date_of_birth?: string;
          feeding_method?: "breast" | "bottle" | "combo" | "solids";
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "babies_household_id_fkey";
            columns: ["household_id"];
            referencedRelation: "households";
            referencedColumns: ["id"];
          },
        ];
      };
      feed_logs: {
        Row: {
          id: string;
          baby_id: string;
          logged_by: string;
          type: "breast_left" | "breast_right" | "bottle" | "solids";
          amount_oz: number | null;
          duration_min: number | null;
          started_at: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          baby_id: string;
          logged_by: string;
          type: "breast_left" | "breast_right" | "bottle" | "solids";
          amount_oz?: number | null;
          duration_min?: number | null;
          started_at: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          type?: "breast_left" | "breast_right" | "bottle" | "solids";
          amount_oz?: number | null;
          duration_min?: number | null;
          started_at?: string;
          notes?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "feed_logs_baby_id_fkey";
            columns: ["baby_id"];
            referencedRelation: "babies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "feed_logs_logged_by_fkey";
            columns: ["logged_by"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      diaper_logs: {
        Row: {
          id: string;
          baby_id: string;
          logged_by: string;
          type: "wet" | "dirty" | "both" | "dry";
          logged_at: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          baby_id: string;
          logged_by: string;
          type: "wet" | "dirty" | "both" | "dry";
          logged_at: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          type?: "wet" | "dirty" | "both" | "dry";
          logged_at?: string;
          notes?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "diaper_logs_baby_id_fkey";
            columns: ["baby_id"];
            referencedRelation: "babies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "diaper_logs_logged_by_fkey";
            columns: ["logged_by"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      sleep_logs: {
        Row: {
          id: string;
          baby_id: string;
          logged_by: string;
          started_at: string;
          ended_at: string | null;
          location: "crib" | "bassinet" | "stroller" | "car" | "arms";
          created_at: string;
        };
        Insert: {
          id?: string;
          baby_id: string;
          logged_by: string;
          started_at: string;
          ended_at?: string | null;
          location: "crib" | "bassinet" | "stroller" | "car" | "arms";
          created_at?: string;
        };
        Update: {
          started_at?: string;
          ended_at?: string | null;
          location?: "crib" | "bassinet" | "stroller" | "car" | "arms";
        };
        Relationships: [
          {
            foreignKeyName: "sleep_logs_baby_id_fkey";
            columns: ["baby_id"];
            referencedRelation: "babies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "sleep_logs_logged_by_fkey";
            columns: ["logged_by"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      pump_logs: {
        Row: {
          id: string;
          baby_id: string;
          logged_by: string;
          started_at: string;
          ended_at: string | null;
          amount_oz: number | null;
          pump_type: "manual" | "electric_single" | "electric_double" | "haakaa";
          side: "left" | "right" | "both";
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          baby_id: string;
          logged_by: string;
          started_at?: string;
          ended_at?: string | null;
          amount_oz?: number | null;
          pump_type: "manual" | "electric_single" | "electric_double" | "haakaa";
          side?: "left" | "right" | "both";
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          ended_at?: string | null;
          amount_oz?: number | null;
          pump_type?: "manual" | "electric_single" | "electric_double" | "haakaa";
          side?: "left" | "right" | "both";
          notes?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "pump_logs_baby_id_fkey";
            columns: ["baby_id"];
            referencedRelation: "babies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "pump_logs_logged_by_fkey";
            columns: ["logged_by"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      chores: {
        Row: {
          id: string;
          household_id: string;
          title: string;
          description: string | null;
          recurrence: Record<string, unknown>;
          assigned_to: string | null;
          category:
            | "feeding_prep"
            | "sanitation"
            | "laundry"
            | "diaper_bag"
            | "safety"
            | "other";
          is_template: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          household_id: string;
          title: string;
          description?: string | null;
          recurrence?: Record<string, unknown>;
          assigned_to?: string | null;
          category?:
            | "feeding_prep"
            | "sanitation"
            | "laundry"
            | "diaper_bag"
            | "safety"
            | "other";
          is_template?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          description?: string | null;
          recurrence?: Record<string, unknown>;
          assigned_to?: string | null;
          category?:
            | "feeding_prep"
            | "sanitation"
            | "laundry"
            | "diaper_bag"
            | "safety"
            | "other";
          is_template?: boolean;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "chores_household_id_fkey";
            columns: ["household_id"];
            referencedRelation: "households";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "chores_assigned_to_fkey";
            columns: ["assigned_to"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      chore_completions: {
        Row: {
          id: string;
          chore_id: string;
          completed_by: string;
          completed_at: string;
        };
        Insert: {
          id?: string;
          chore_id: string;
          completed_by: string;
          completed_at?: string;
        };
        Update: {
          completed_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "chore_completions_chore_id_fkey";
            columns: ["chore_id"];
            referencedRelation: "chores";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "chore_completions_completed_by_fkey";
            columns: ["completed_by"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      caregiver_shifts: {
        Row: {
          id: string;
          household_id: string;
          caregiver_id: string;
          started_at: string;
          ended_at: string | null;
          handoff_summary: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          household_id: string;
          caregiver_id: string;
          started_at?: string;
          ended_at?: string | null;
          handoff_summary?: Record<string, unknown> | null;
          created_at?: string;
        };
        Update: {
          ended_at?: string | null;
          handoff_summary?: Record<string, unknown> | null;
        };
        Relationships: [
          {
            foreignKeyName: "caregiver_shifts_household_id_fkey";
            columns: ["household_id"];
            referencedRelation: "households";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "caregiver_shifts_caregiver_id_fkey";
            columns: ["caregiver_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
      household_invites: {
        Row: {
          id: string;
          household_id: string;
          email: string;
          role: "admin" | "caregiver" | "restricted";
          invited_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          household_id: string;
          email: string;
          role?: "admin" | "caregiver" | "restricted";
          invited_by: string;
          created_at?: string;
        };
        Update: {
          role?: "admin" | "caregiver" | "restricted";
        };
        Relationships: [
          {
            foreignKeyName: "household_invites_household_id_fkey";
            columns: ["household_id"];
            referencedRelation: "households";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "household_invites_invited_by_fkey";
            columns: ["invited_by"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      care_mode: "together" | "shifts" | "nanny";
      profile_role: "admin" | "caregiver" | "restricted";
      feeding_method: "breast" | "bottle" | "combo" | "solids";
      feed_type: "breast_left" | "breast_right" | "bottle" | "solids";
      diaper_type: "wet" | "dirty" | "both" | "dry";
      sleep_location: "crib" | "bassinet" | "stroller" | "car" | "arms";
      pump_type: "manual" | "electric_single" | "electric_double" | "haakaa";
      pump_side: "left" | "right" | "both";
      chore_category:
        | "feeding_prep"
        | "sanitation"
        | "laundry"
        | "diaper_bag"
        | "safety"
        | "other";
    };
  };
};
