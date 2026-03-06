import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Modal,
} from "react-native";
import { router } from "expo-router";
import { supabase } from "../../lib/supabase";
import {
  useProfile,
  useBabies,
  useHouseholdMembers,
  useUpdateBaby,
  useUpdateProfile,
} from "../../lib/queries";
import { useAuthStore } from "../../lib/store";
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

export default function Settings() {
  const { data: profile } = useProfile();
  const { data: babies } = useBabies();
  const { data: members } = useHouseholdMembers();
  const updateBaby = useUpdateBaby();
  const updateProfile = useUpdateProfile();
  const setSession = useAuthStore((s) => s.setSession);

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
      const { error } = await supabase.from("household_invites").insert({
        household_id: profile.household_id,
        email: inviteEmail.trim().toLowerCase(),
        role: inviteRole,
        invited_by: profile.id,
      });
      if (error) {
        if (error.code === "23505") {
          Alert.alert("Already Invited", "This email has already been invited.");
        } else {
          throw error;
        }
        return;
      }
      Alert.alert(
        "Invite Sent",
        `When ${inviteEmail.trim()} signs up, they'll automatically join your household.`
      );
      setInviteEmail("");
      setInviteRole("caregiver");
      setShowInvite(false);
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
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
    <ScrollView className="flex-1 bg-midnight">
      <View className="px-6 pt-4 pb-10">
        {/* Baby Profile */}
        <Text className="text-[11px] text-ash uppercase font-body-bold mb-2 mt-4" style={{ letterSpacing: 2 }}>
          Baby Profile
        </Text>
        <TouchableOpacity
          className="bg-navy-card border border-navy-border rounded-2xl p-4 mb-6"
          onPress={openEditBaby}
        >
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-lg font-body-semibold text-white">
                {baby?.name ?? "—"}
              </Text>
              <Text className="text-sm text-ash mt-0.5">
                Born {baby?.date_of_birth ?? "—"} ·{" "}
                {baby?.feeding_method ?? "—"}
              </Text>
            </View>
            <Text className="text-amber text-sm">Edit</Text>
          </View>
        </TouchableOpacity>

        {/* Your Profile */}
        <Text className="text-[11px] text-ash uppercase font-body-bold mb-2" style={{ letterSpacing: 2 }}>
          Your Profile
        </Text>
        <TouchableOpacity
          className="bg-navy-card border border-navy-border rounded-2xl p-4 mb-6"
          onPress={openEditName}
        >
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-base font-body-medium text-white">
                {profile?.display_name ?? "—"}
              </Text>
              <Text className="text-sm text-ash mt-0.5">
                Role: {profile?.role ?? "—"}
              </Text>
            </View>
            <Text className="text-amber text-sm">Edit</Text>
          </View>
        </TouchableOpacity>

        {/* Household Members */}
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-[11px] text-ash uppercase font-body-bold" style={{ letterSpacing: 2 }}>
            Household Members
          </Text>
          {isAdmin && (
            <TouchableOpacity onPress={() => setShowInvite(true)}>
              <Text className="text-amber text-sm">+ Invite</Text>
            </TouchableOpacity>
          )}
        </View>
        <View className="bg-navy-card border border-navy-border rounded-2xl mb-6 overflow-hidden">
          {members?.map((member, i) => (
            <TouchableOpacity
              key={member.id}
              className={`flex-row justify-between items-center p-4 ${
                i > 0 ? "border-t border-navy-border" : ""
              }`}
              onPress={() =>
                isAdmin && member.id !== profile?.id
                  ? setEditingMember(member)
                  : undefined
              }
              disabled={!isAdmin || member.id === profile?.id}
            >
              <View>
                <Text className="text-base font-body-medium text-white">
                  {member.display_name}
                  {member.id === profile?.id ? " (you)" : ""}
                </Text>
                <Text className="text-sm text-ash mt-0.5">
                  {member.role}
                </Text>
              </View>
              {isAdmin && member.id !== profile?.id && (
                <Text className="text-amber text-sm">Change role</Text>
              )}
            </TouchableOpacity>
          ))}
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
            <View className="bg-navy-card rounded-t-2xl px-6 pt-6 pb-10">
              <Text className="text-lg font-body-bold text-white mb-4">Edit Baby Profile</Text>

              <Text className="text-xs text-ash uppercase font-body-bold mb-1" style={{ letterSpacing: 2 }}>
                Name
              </Text>
              <TextInput
                className="border border-navy-border bg-navy-raise rounded-xl px-4 py-3 mb-4 text-base text-white"
                value={babyName}
                onChangeText={setBabyName}
              />

              <Text className="text-xs text-ash uppercase font-body-bold mb-1" style={{ letterSpacing: 2 }}>
                Date of Birth
              </Text>
              <TextInput
                className="border border-navy-border bg-navy-raise rounded-xl px-4 py-3 mb-4 text-base text-white"
                value={babyDob}
                onChangeText={setBabyDob}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.ash}
              />

              <Text className="text-xs text-ash uppercase font-body-bold mb-2" style={{ letterSpacing: 2 }}>
                Feeding Method
              </Text>
              <View className="flex-row flex-wrap gap-2 mb-6">
                {FEEDING_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.key}
                    className={`px-4 py-2.5 rounded-xl border ${
                      babyFeeding === opt.key
                        ? "bg-amber border-amber"
                        : "border-navy-border bg-navy-raise"
                    }`}
                    onPress={() => setBabyFeeding(opt.key)}
                  >
                    <Text
                      className={`text-sm ${
                        babyFeeding === opt.key
                          ? "text-midnight font-body-medium"
                          : "text-ash"
                      }`}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                className="bg-amber rounded-2xl py-4 mb-3"
                onPress={saveBaby}
                disabled={updateBaby.isPending}
              >
                <Text className="text-midnight text-center font-body-semibold text-base">
                  {updateBaby.isPending ? "Saving..." : "Save"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="py-3"
                onPress={() => setEditBaby(false)}
              >
                <Text className="text-ash text-center">Cancel</Text>
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
            <View className="bg-navy-card rounded-t-2xl px-6 pt-6 pb-10">
              <Text className="text-lg font-body-bold text-white mb-4">Edit Your Name</Text>
              <TextInput
                className="border border-navy-border bg-navy-raise rounded-xl px-4 py-3 mb-6 text-base text-white"
                value={displayName}
                onChangeText={setDisplayName}
                autoFocus
              />
              <TouchableOpacity
                className="bg-amber rounded-2xl py-4 mb-3"
                onPress={saveName}
                disabled={updateProfile.isPending}
              >
                <Text className="text-midnight text-center font-body-semibold text-base">
                  {updateProfile.isPending ? "Saving..." : "Save"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="py-3"
                onPress={() => setEditName(false)}
              >
                <Text className="text-ash text-center">Cancel</Text>
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
          <View className="bg-navy-card rounded-t-2xl px-6 pt-6 pb-10">
            <Text className="text-lg font-body-bold text-white mb-4">
              Change Role: {editingMember?.display_name}
            </Text>

            {ROLES.map((role) => (
              <TouchableOpacity
                key={role.key}
                className={`flex-row justify-between items-center p-4 rounded-xl mb-2 border ${
                  editingMember?.role === role.key
                    ? "border-amber bg-navy-raise"
                    : "border-navy-border"
                }`}
                onPress={() =>
                  editingMember &&
                  handleRoleChange(editingMember.id, role.key)
                }
              >
                <View>
                  <Text className="text-base font-body-medium text-white">{role.label}</Text>
                  <Text className="text-sm text-ash">{role.desc}</Text>
                </View>
                {editingMember?.role === role.key && (
                  <Text className="text-amber text-sm font-body-medium">
                    Current
                  </Text>
                )}
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              className="mt-2 py-3"
              onPress={() => setEditingMember(null)}
            >
              <Text className="text-ash text-center">Cancel</Text>
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
            <View className="bg-navy-card rounded-t-2xl px-6 pt-6 pb-10">
              <Text className="text-lg font-body-bold text-white mb-2">Invite Member</Text>
              <Text className="text-ash mb-4">
                They'll join your household when they sign up.
              </Text>
              <TextInput
                className="border border-navy-border bg-navy-raise rounded-xl px-4 py-3 mb-4 text-base text-white"
                placeholder="Email address"
                placeholderTextColor={colors.ash}
                value={inviteEmail}
                onChangeText={setInviteEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoFocus
              />

              <Text className="text-xs text-ash uppercase font-body-bold mb-2" style={{ letterSpacing: 2 }}>
                Role
              </Text>
              <View className="mb-6">
                {ROLES.map((role) => (
                  <TouchableOpacity
                    key={role.key}
                    className={`flex-row items-center p-3 rounded-xl mb-1.5 border ${
                      inviteRole === role.key
                        ? "border-amber bg-navy-raise"
                        : "border-navy-border"
                    }`}
                    onPress={() => setInviteRole(role.key)}
                  >
                    <View className={`w-4 h-4 rounded-full border-2 mr-3 items-center justify-center ${
                      inviteRole === role.key ? "border-amber" : "border-navy-border"
                    }`}>
                      {inviteRole === role.key && (
                        <View className="w-2 h-2 rounded-full bg-amber" />
                      )}
                    </View>
                    <View>
                      <Text className="text-sm font-body-medium text-white">{role.label}</Text>
                      <Text className="text-xs text-ash">{role.desc}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                className={`rounded-2xl py-4 mb-3 ${
                  inviteEmail.trim() ? "bg-amber" : "bg-navy-raise border border-navy-border"
                }`}
                onPress={handleInvite}
                disabled={!inviteEmail.trim()}
              >
                <Text className={`text-center font-body-semibold text-base ${inviteEmail.trim() ? "text-midnight" : "text-ash"}`}>
                  Send Invite
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="py-3"
                onPress={() => setShowInvite(false)}
              >
                <Text className="text-ash text-center">Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}
