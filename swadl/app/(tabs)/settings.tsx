import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  Switch,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { supabase } from "../../lib/supabase";
import {
  useProfile,
  useBabies,
  useHouseholdMembers,
  useUpdateBaby,
  useUpdateProfile,
  useUpdateCareMode,
} from "../../lib/queries";
import { useCareMode } from "../../lib/careMode";
import { useAuthStore } from "../../lib/store";
import { useThemeStore, useThemeColors } from "../../lib/theme";
import { colors } from "../../constants/theme";


const FEEDING_OPTIONS = [
  { key: "breast", label: "Breast" },
  { key: "bottle", label: "Bottle" },
  { key: "combo", label: "Combo" },
  { key: "solids", label: "Solids" },
] as const;

const ROLES = [
  { key: "admin", label: "Admin", desc: "Full access" },
  { key: "caregiver", label: "Caregiver", desc: "Log & manage chores" },
  { key: "restricted", label: "Restricted", desc: "Log only" },
] as const;

const CARE_MODES = [
  { key: "together", label: "Together", desc: "We parent together" },
  { key: "shifts", label: "Shifts", desc: "We take turns / shifts" },
  { key: "nanny", label: "Nanny", desc: "We have a nanny or caregiver" },
] as const;

export default function Settings() {
  const insets = useSafeAreaInsets();
  const { data: profile } = useProfile();
  const { data: babies } = useBabies();
  const { data: members } = useHouseholdMembers();
  const updateBaby = useUpdateBaby();
  const updateProfile = useUpdateProfile();
  const updateCareMode = useUpdateCareMode();
  const { careMode } = useCareMode();
  const setSession = useAuthStore((s) => s.setSession);
  const themeMode = useThemeStore((s) => s.mode);
  const toggleTheme = useThemeStore((s) => s.toggleMode);
  const tc = useThemeColors();

  const [deleting, setDeleting] = useState(false);

  // Notification preferences (local for now — Phase 2 syncs to server)
  const [notifyAssignments, setNotifyAssignments] = useState(true);
  const [notifyReminders, setNotifyReminders] = useState(true);
  const [notifyShiftChanges, setNotifyShiftChanges] = useState(true);

  const baby = babies?.[0];
  const isAdmin = profile?.role === "admin";

  // Edit baby modal
  const [editBaby, setEditBaby] = useState(false);
  const [babyName, setBabyName] = useState("");
  const [babyDob, setBabyDob] = useState("");
  const [babyFeeding, setBabyFeeding] = useState("");

  // Edit display name modal
  const [editName, setEditName] = useState(false);
  const [displayName, setDisplayName] = useState("");

  // Invite modal
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "caregiver" | "restricted">("caregiver");

  // Role change modal
  const [editingMember, setEditingMember] = useState<{
    id: string;
    display_name: string;
    role: string;
  } | null>(null);

  function openEditBaby() {
    if (!baby) return;
    setBabyName(baby.name);
    setBabyDob(baby.date_of_birth);
    setBabyFeeding(baby.feeding_method);
    setEditBaby(true);
  }

  function saveBaby() {
    if (!baby || !babyName.trim()) return;
    updateBaby.mutate(
      {
        id: baby.id,
        name: babyName.trim(),
        date_of_birth: babyDob,
        feeding_method: babyFeeding as any,
      },
      {
        onSuccess: () => setEditBaby(false),
        onError: (err) => Alert.alert("Error", err.message),
      }
    );
  }

  function openEditName() {
    if (!profile) return;
    setDisplayName(profile.display_name);
    setEditName(true);
  }

  function saveName() {
    if (!profile || !displayName.trim()) return;
    updateProfile.mutate(
      { id: profile.id, display_name: displayName.trim() },
      {
        onSuccess: () => setEditName(false),
        onError: (err) => Alert.alert("Error", err.message),
      }
    );
  }

  function handleRoleChange(memberId: string, newRole: string) {
    updateProfile.mutate(
      { id: memberId, role: newRole as any },
      {
        onSuccess: () => setEditingMember(null),
        onError: (err) => Alert.alert("Error", err.message),
      }
    );
  }

  async function handleInvite() {
    if (!inviteEmail.trim() || !profile) return;
    try {
      const { data: result, error } = await supabase.functions.invoke("send-invite", {
        body: {
          email: inviteEmail.trim(),
          household_id: profile.household_id,
          household_name: baby ? `${baby.name}'s Family` : "the household",
          invited_by_name: profile.display_name,
          invited_by: profile.id,
          role: inviteRole,
        },
      });
      if (error) throw error;
      if (result?.error) {
        if (result.error.includes("duplicate") || result.error.includes("already")) {
          Alert.alert("Already Invited", "This email has already been invited.");
        } else {
          throw new Error(result.error);
        }
        return;
      }
      Alert.alert(
        "Invite Saved",
        result?.message ?? `Ask your partner to download Swadl and sign up with ${inviteEmail.trim()}. They'll automatically join your household.`
      );
      setInviteEmail("");
      setInviteRole("caregiver");
      setShowInvite(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to send invite";
      Alert.alert("Error", message);
    }
  }

  async function handleDeleteAccount() {
    Alert.alert(
      "Delete Account",
      "This will permanently delete your account and all your data. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setDeleting(true);
            try {
              const { data: { session } } = await supabase.auth.getSession();
              if (!session) return;

              const userId = session.user.id;

              // Try edge function first, fall back to client-side deletion
              let edgeFnOk = false;
              try {
                const { data, error } = await supabase.functions.invoke("delete-account", {
                  body: { user_id: userId },
                });
                if (!error && !data?.error) edgeFnOk = true;
              } catch {
                // Edge function not deployed — fall back
              }

              if (!edgeFnOk) {
                // Client-side deletion: delete user's data then profile
                const { data: prof } = await supabase
                  .from("profiles")
                  .select("household_id")
                  .eq("id", userId)
                  .single();

                if (prof) {
                  await supabase.from("feed_logs").delete().eq("logged_by", userId);
                  await supabase.from("diaper_logs").delete().eq("logged_by", userId);
                  await supabase.from("sleep_logs").delete().eq("logged_by", userId);
                  await supabase.from("pump_logs").delete().eq("logged_by", userId);
                  await supabase.from("chore_completions").delete().eq("completed_by", userId);
                  await supabase.from("caregiver_shifts").delete().eq("caregiver_id", userId);
                  await supabase.from("household_invites").delete().eq("invited_by", userId);
                  await supabase.from("profiles").delete().eq("id", userId);
                }
              }

              await supabase.auth.signOut();
              setSession(null);
              router.replace("/(auth)/login");
            } catch (err: unknown) {
              const message = err instanceof Error ? err.message : "Failed to delete account";
              Alert.alert("Error", message);
              setDeleting(false);
            }
          },
        },
      ]
    );
  }

  async function handleSignOut() {
    Alert.alert("Sign Out", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await supabase.auth.signOut();
          setSession(null);
          router.replace("/(auth)/login");
        },
      },
    ]);
  }

  return (
    <View style={{ flex: 1 }} className="bg-screen-bg">

      <ScrollView style={{ flex: 1 }}>
      <View style={{ paddingHorizontal: 24, paddingTop: insets.top + 16, paddingBottom: 40 }}>
        {/* Baby Profile */}
        <Text className="text-[11px] text-text-secondary uppercase font-body-bold mb-2 mt-4" style={{ letterSpacing: 2 }}>
          Baby Profile
        </Text>
        <TouchableOpacity
          className="bg-card-bg border border-border-main rounded-2xl p-4 mb-6"
          onPress={openEditBaby}
        >
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-lg font-body-semibold text-text-primary">
                {baby?.name ?? "—"}
              </Text>
              <Text className="text-sm text-text-secondary mt-0.5">
                Born {baby?.date_of_birth ?? "—"} ·{" "}
                {baby?.feeding_method ?? "—"}
              </Text>
            </View>
            <Text className="text-feed-primary text-sm">Edit</Text>
          </View>
        </TouchableOpacity>

        {/* Your Profile */}
        <Text className="text-[11px] text-text-secondary uppercase font-body-bold mb-2" style={{ letterSpacing: 2 }}>
          Your Profile
        </Text>
        <TouchableOpacity
          className="bg-card-bg border border-border-main rounded-2xl p-4 mb-6"
          onPress={openEditName}
        >
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-base font-body-medium text-text-primary">
                {profile?.display_name ?? "—"}
              </Text>
              <Text className="text-sm text-text-secondary mt-0.5">
                Role: {profile?.role ?? "—"}
              </Text>
            </View>
            <Text className="text-feed-primary text-sm">Edit</Text>
          </View>
        </TouchableOpacity>

        {/* Household Members */}
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-[11px] text-text-secondary uppercase font-body-bold" style={{ letterSpacing: 2 }}>
            Household Members
          </Text>
          {isAdmin && (
            <TouchableOpacity onPress={() => setShowInvite(true)}>
              <Text className="text-feed-primary text-sm">+ Invite</Text>
            </TouchableOpacity>
          )}
        </View>
        <View className="bg-card-bg border border-border-main rounded-2xl mb-6 overflow-hidden">
          {members?.map((member, i) => (
            <TouchableOpacity
              key={member.id}
              className={`flex-row justify-between items-center p-4 ${
                i > 0 ? "border-t border-border-main" : ""
              }`}
              onPress={() =>
                isAdmin && member.id !== profile?.id
                  ? setEditingMember(member)
                  : undefined
              }
              disabled={!isAdmin || member.id === profile?.id}
            >
              <View>
                <Text className="text-base font-body-medium text-text-primary">
                  {member.display_name}
                  {member.id === profile?.id ? " (you)" : ""}
                </Text>
                <Text className="text-sm text-text-secondary mt-0.5">
                  {member.role}
                </Text>
              </View>
              {isAdmin && member.id !== profile?.id && (
                <Text className="text-feed-primary text-sm">Change role</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Appearance */}
        <Text className="text-[11px] text-text-secondary uppercase font-body-bold mb-2" style={{ letterSpacing: 2 }}>
          Appearance
        </Text>
        <View className="bg-card-bg border border-border-main rounded-2xl p-4 mb-6">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-base font-body-medium text-text-primary">Dark Mode</Text>
              <Text className="text-sm text-text-secondary mt-0.5">
                {themeMode === "dark" ? "On" : "Off"}
              </Text>
            </View>
            <TouchableOpacity
              className={`w-12 h-7 rounded-full justify-center ${
                themeMode === "dark" ? "bg-feed-primary" : "bg-raised-bg"
              }`}
              onPress={toggleTheme}
            >
              <View
                className={`w-5 h-5 rounded-full mx-1 ${
                  themeMode === "dark" ? "self-end" : "self-start"
                }`}
                style={{ backgroundColor: "#FFFFFF" }}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Care Mode */}
        {isAdmin && (
          <>
            <Text className="text-[11px] text-text-secondary uppercase font-body-bold mb-2" style={{ letterSpacing: 2 }}>
              Care Mode
            </Text>
            <View className="bg-card-bg border border-border-main rounded-2xl overflow-hidden mb-6">
              {CARE_MODES.map((cm, i) => (
                <TouchableOpacity
                  key={cm.key}
                  className={`flex-row justify-between items-center p-4 ${
                    i > 0 ? "border-t border-border-main" : ""
                  }`}
                  onPress={() => updateCareMode.mutate(cm.key)}
                  disabled={updateCareMode.isPending}
                >
                  <View>
                    <Text className="text-base font-body-medium text-text-primary">
                      {cm.label}
                    </Text>
                    <Text className="text-sm text-text-secondary mt-0.5">
                      {cm.desc}
                    </Text>
                  </View>
                  {careMode.mode === cm.key && (
                    <View className="w-5 h-5 rounded-full bg-feed-primary items-center justify-center">
                      <Text className="text-xs font-body-bold" style={{ color: colors.charcoal }}>
                        {"\u2713"}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* Notification Preferences */}
        <Text className="text-[11px] text-text-secondary uppercase font-body-bold mb-2" style={{ letterSpacing: 2 }}>
          Notifications
        </Text>
        <View className="bg-card-bg border border-border-main rounded-2xl p-4 mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <View>
              <Text className="text-base font-body-medium text-text-primary">Chore Assignments</Text>
              <Text className="text-sm text-text-secondary">When a chore is assigned to you</Text>
            </View>
            <Switch
              value={notifyAssignments}
              onValueChange={setNotifyAssignments}
              trackColor={{ false: tc.border, true: colors.feedPrimary }}
              thumbColor="#FFFFFF"
            />
          </View>
          <View className="flex-row items-center justify-between mb-3">
            <View>
              <Text className="text-base font-body-medium text-text-primary">Chore Reminders</Text>
              <Text className="text-sm text-text-secondary">Upcoming chore due reminders</Text>
            </View>
            <Switch
              value={notifyReminders}
              onValueChange={setNotifyReminders}
              trackColor={{ false: tc.border, true: colors.feedPrimary }}
              thumbColor="#FFFFFF"
            />
          </View>
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-base font-body-medium text-text-primary">Shift Changes</Text>
              <Text className="text-sm text-text-secondary">When a caregiver starts or ends a shift</Text>
            </View>
            <Switch
              value={notifyShiftChanges}
              onValueChange={setNotifyShiftChanges}
              trackColor={{ false: tc.border, true: colors.feedPrimary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Legal */}
        <Text className="text-[11px] text-text-secondary uppercase font-body-bold mb-2" style={{ letterSpacing: 2 }}>
          Legal
        </Text>
        <View className="bg-card-bg border border-border-main rounded-2xl overflow-hidden mb-6">
          <TouchableOpacity
            className="flex-row justify-between items-center p-4"
            onPress={() => router.push("/privacy")}
          >
            <Text className="text-base font-body-medium text-text-primary">Privacy Policy</Text>
            <Text className="text-text-secondary text-sm">→</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-row justify-between items-center p-4 border-t border-border-main"
            onPress={() => router.push("/terms")}
          >
            <Text className="text-base font-body-medium text-text-primary">Terms of Service</Text>
            <Text className="text-text-secondary text-sm">→</Text>
          </TouchableOpacity>
        </View>

        {/* Sign Out */}
        <TouchableOpacity
          className="border border-danger rounded-2xl py-4 mt-4"
          onPress={handleSignOut}
        >
          <Text className="text-danger text-center font-body-semibold text-base">
            Sign Out
          </Text>
        </TouchableOpacity>

        {/* Delete Account */}
        <TouchableOpacity
          className="py-4 mt-3"
          onPress={handleDeleteAccount}
          disabled={deleting}
        >
          {deleting ? (
            <View className="flex-row items-center justify-center">
              <ActivityIndicator size="small" color={tc.textSecondary} />
              <Text className="text-text-secondary text-center text-sm ml-2">Deleting account...</Text>
            </View>
          ) : (
            <Text className="text-text-secondary text-center text-sm">
              Delete Account
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Edit Baby Modal */}
      <Modal
        visible={editBaby}
        transparent
        animationType="slide"
        onRequestClose={() => setEditBaby(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/40 justify-end"
          activeOpacity={1}
          onPress={() => setEditBaby(false)}
        >
          <TouchableOpacity activeOpacity={1}>
            <View className="bg-card-bg rounded-t-2xl px-6 pt-6 pb-10">
              <Text className="text-lg font-body-bold text-text-primary mb-4">Edit Baby Profile</Text>

              <Text className="text-xs text-text-secondary uppercase font-body-bold mb-1" style={{ letterSpacing: 2 }}>
                Name
              </Text>
              <TextInput
                className="border border-border-main bg-raised-bg rounded-xl px-4 mb-4 text-text-primary"
                style={{ fontSize: 16, height: 48 }}
                value={babyName}
                onChangeText={setBabyName}
              />

              <Text className="text-xs text-text-secondary uppercase font-body-bold mb-1" style={{ letterSpacing: 2 }}>
                Date of Birth
              </Text>
              <TextInput
                className="border border-border-main bg-raised-bg rounded-xl px-4 mb-4 text-text-primary"
                style={{ fontSize: 16, height: 48 }}
                value={babyDob}
                onChangeText={setBabyDob}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={tc.textSecondary}
              />

              <Text className="text-xs text-text-secondary uppercase font-body-bold mb-2" style={{ letterSpacing: 2 }}>
                Feeding Method
              </Text>
              <View className="flex-row flex-wrap gap-2 mb-6">
                {FEEDING_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.key}
                    className={`px-4 py-2.5 rounded-xl border ${
                      babyFeeding === opt.key
                        ? "bg-feed-primary border-feed-primary"
                        : "border-border-main bg-raised-bg"
                    }`}
                    onPress={() => setBabyFeeding(opt.key)}
                  >
                    <Text
                      className={`text-sm ${
                        babyFeeding === opt.key
                          ? "font-body-medium"
                          : "text-text-secondary"
                      }`}
                      style={babyFeeding === opt.key ? { color: colors.charcoal } : undefined}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                className="bg-feed-primary rounded-2xl py-4 mb-3"
                onPress={saveBaby}
                disabled={updateBaby.isPending}
              >
                <Text className="text-center font-body-semibold text-base" style={{ color: colors.charcoal }}>
                  {updateBaby.isPending ? "Saving..." : "Save"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="py-3"
                onPress={() => setEditBaby(false)}
              >
                <Text className="text-text-secondary text-center">Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Edit Display Name Modal */}
      <Modal
        visible={editName}
        transparent
        animationType="slide"
        onRequestClose={() => setEditName(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/40 justify-end"
          activeOpacity={1}
          onPress={() => setEditName(false)}
        >
          <TouchableOpacity activeOpacity={1}>
            <View className="bg-card-bg rounded-t-2xl px-6 pt-6 pb-10">
              <Text className="text-lg font-body-bold text-text-primary mb-4">Edit Your Name</Text>
              <TextInput
                className="border border-border-main bg-raised-bg rounded-xl px-4 mb-6 text-text-primary"
                style={{ fontSize: 16, height: 48 }}
                value={displayName}
                onChangeText={setDisplayName}
                autoFocus
              />
              <TouchableOpacity
                className="bg-feed-primary rounded-2xl py-4 mb-3"
                onPress={saveName}
                disabled={updateProfile.isPending}
              >
                <Text className="text-center font-body-semibold text-base" style={{ color: colors.charcoal }}>
                  {updateProfile.isPending ? "Saving..." : "Save"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="py-3"
                onPress={() => setEditName(false)}
              >
                <Text className="text-text-secondary text-center">Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Role Change Modal */}
      <Modal
        visible={!!editingMember}
        transparent
        animationType="slide"
        onRequestClose={() => setEditingMember(null)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/40 justify-end"
          activeOpacity={1}
          onPress={() => setEditingMember(null)}
        >
          <View className="bg-card-bg rounded-t-2xl px-6 pt-6 pb-10">
            <Text className="text-lg font-body-bold text-text-primary mb-4">
              Change Role: {editingMember?.display_name}
            </Text>

            {ROLES.map((role) => (
              <TouchableOpacity
                key={role.key}
                className={`flex-row justify-between items-center p-4 rounded-xl mb-2 border ${
                  editingMember?.role === role.key
                    ? "border-feed-primary bg-raised-bg"
                    : "border-border-main"
                }`}
                onPress={() =>
                  editingMember &&
                  handleRoleChange(editingMember.id, role.key)
                }
              >
                <View>
                  <Text className="text-base font-body-medium text-text-primary">{role.label}</Text>
                  <Text className="text-sm text-text-secondary">{role.desc}</Text>
                </View>
                {editingMember?.role === role.key && (
                  <Text className="text-feed-primary text-sm font-body-medium">
                    Current
                  </Text>
                )}
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              className="mt-2 py-3"
              onPress={() => setEditingMember(null)}
            >
              <Text className="text-text-secondary text-center">Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Invite Modal */}
      <Modal
        visible={showInvite}
        transparent
        animationType="slide"
        onRequestClose={() => setShowInvite(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/40 justify-end"
          activeOpacity={1}
          onPress={() => setShowInvite(false)}
        >
          <TouchableOpacity activeOpacity={1}>
            <View className="bg-card-bg rounded-t-2xl px-6 pt-6 pb-10">
              <Text className="text-lg font-body-bold text-text-primary mb-2">Invite Member</Text>
              <Text className="text-text-secondary mb-4">
                They'll join your household when they sign up.
              </Text>
              <TextInput
                className="border border-border-main bg-raised-bg rounded-xl px-4 mb-4 text-text-primary"
                style={{ fontSize: 16, height: 48 }}
                placeholder="Email address"
                placeholderTextColor={tc.textSecondary}
                value={inviteEmail}
                onChangeText={setInviteEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoFocus
              />

              <Text className="text-xs text-text-secondary uppercase font-body-bold mb-2" style={{ letterSpacing: 2 }}>
                Role
              </Text>
              <View className="mb-6">
                {ROLES.map((role) => (
                  <TouchableOpacity
                    key={role.key}
                    className={`flex-row items-center p-3 rounded-xl mb-1.5 border ${
                      inviteRole === role.key
                        ? "border-feed-primary bg-raised-bg"
                        : "border-border-main"
                    }`}
                    onPress={() => setInviteRole(role.key)}
                  >
                    <View className={`w-4 h-4 rounded-full border-2 mr-3 items-center justify-center ${
                      inviteRole === role.key ? "border-feed-primary" : "border-border-main"
                    }`}>
                      {inviteRole === role.key && (
                        <View className="w-2 h-2 rounded-full bg-feed-primary" />
                      )}
                    </View>
                    <View>
                      <Text className="text-sm font-body-medium text-text-primary">{role.label}</Text>
                      <Text className="text-xs text-text-secondary">{role.desc}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                className={`rounded-2xl py-4 mb-3 ${
                  inviteEmail.trim() ? "bg-feed-primary" : "bg-raised-bg border border-border-main"
                }`}
                onPress={handleInvite}
                disabled={!inviteEmail.trim()}
              >
                <Text className={`text-center font-body-semibold text-base ${inviteEmail.trim() ? "" : "text-text-secondary"}`} style={inviteEmail.trim() ? { color: colors.charcoal } : undefined}>
                  Send Invite
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="py-3"
                onPress={() => setShowInvite(false)}
              >
                <Text className="text-text-secondary text-center">Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
    </View>
  );
}
