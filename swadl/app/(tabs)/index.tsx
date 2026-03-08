import { useCallback, useState } from "react";
import { View, Text, ScrollView, Pressable, Modal, FlatList, RefreshControl, Alert, ActionSheetIOS, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { StatusCard } from "../../components/StatusCard";
import { LogHistoryModal } from "../../components/LogHistoryModal";
import { ActivityFeed } from "../../components/ActivityFeed";
import { NurseryBackground } from "../../components/NurseryBackground";
import { NurseryMobileArt } from "../../components/NurseryMobileArt";
import { BabyAvatar } from "../../components/BabyAvatar";
import { BottleIcon } from "../../components/icons/BottleIcon";
import { DiaperIcon } from "../../components/icons/DiaperIcon";
import { MoonIcon } from "../../components/icons/MoonIcon";
import { PumpIcon } from "../../components/icons/PumpIcon";
import {
  useProfile,
  useBabies,
  useLatestFeed,
  useLatestDiaper,
  useLatestSleep,
  useLatestPump,
  useActiveShift,
  useDashboardRealtime,
  useEnsureTogetherShift,
  useUploadBabyAvatar,
} from "../../lib/queries";
import { useCareMode } from "../../lib/careMode";
import { shadows, colors } from "../../constants/theme";
import { useThemeColors } from "../../lib/theme";
import { ChevronDown, ChevronRight } from "lucide-react-native";

function timeAgo(dateStr: string | undefined | null): string {
  if (!dateStr) return "No data";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;
  if (hours < 24) return remMins > 0 ? `${hours}h ${remMins}m ago` : `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const ACTION_GRID = [
  { label: 'Feed', route: '/log/feed', bg: colors.feedBg, border: colors.feedBorder, color: colors.feedPrimary, Icon: BottleIcon, darkBg: 'rgba(224,138,48,0.1)', darkBorder: 'rgba(224,138,48,0.18)' },
  { label: 'Diaper', route: '/log/diaper', bg: colors.diaperBg, border: colors.diaperBorder, color: colors.diaperPrimary, Icon: DiaperIcon, darkBg: 'rgba(88,180,120,0.08)', darkBorder: 'rgba(88,180,120,0.14)' },
  { label: 'Sleep', route: '/log/sleep', bg: colors.sleepBg, border: colors.sleepBorder, color: colors.sleepPrimary, Icon: MoonIcon, darkBg: 'rgba(120,140,210,0.08)', darkBorder: 'rgba(120,140,210,0.14)' },
  { label: 'Pump', route: '/log/pump', bg: colors.pumpBg, border: colors.pumpBorder, color: colors.pumpPrimary, Icon: PumpIcon, darkBg: 'rgba(200,100,105,0.08)', darkBorder: 'rgba(200,100,105,0.14)' },
];

export default function Dashboard() {
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();
  const { data: babies } = useBabies();
  const [selectedBabyId, setSelectedBabyId] = useState<string | null>(null);
  const [babyPickerVisible, setBabyPickerVisible] = useState(false);
  const [historyKind, setHistoryKind] = useState<"feed" | "diaper" | "sleep" | "pump" | null>(null);
  const tc = useThemeColors();
  const insets = useSafeAreaInsets();

  // Default to first baby if no selection has been made (or if selected baby no longer exists)
  const resolvedBabyId = selectedBabyId && babies?.some((b) => b.id === selectedBabyId)
    ? selectedBabyId
    : babies?.[0]?.id ?? null;
  const baby = babies?.find((b) => b.id === resolvedBabyId) ?? null;
  const hasMultipleBabies = (babies?.length ?? 0) > 1;

  const { data: latestFeed } = useLatestFeed(resolvedBabyId ?? undefined);
  const { data: latestDiaper } = useLatestDiaper(resolvedBabyId ?? undefined);
  const { data: latestSleep } = useLatestSleep(resolvedBabyId ?? undefined);
  const { data: latestPump } = useLatestPump(resolvedBabyId ?? undefined);
  const { careMode } = useCareMode();
  const { data: activeShift } = useActiveShift();

  const [refreshing, setRefreshing] = useState(false);
  const uploadAvatar = useUploadBabyAvatar();

  const pickAndUpload = useCallback(async (source: "camera" | "library") => {
    if (!resolvedBabyId) return;

    // Ensure permissions before launching picker
    if (source === "camera") {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Needed", "Camera access is required to take a photo.");
        return;
      }
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Needed", "Photo library access is required to choose a photo.");
        return;
      }
    }

    const opts: ImagePicker.ImagePickerOptions = {
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    };

    const result = source === "camera"
      ? await ImagePicker.launchCameraAsync(opts)
      : await ImagePicker.launchImageLibraryAsync(opts);

    if (result.canceled || !result.assets?.[0]) return;

    uploadAvatar.mutate(
      { babyId: resolvedBabyId, uri: result.assets[0].uri },
      {
        onError: (err) => {
          Alert.alert("Upload Failed", (err as Error).message);
        },
      }
    );
  }, [resolvedBabyId, uploadAvatar]);

  const handleAvatarPress = useCallback(() => {
    if (!resolvedBabyId) return;

    // Pre-request library permissions so picker opens faster on subsequent taps
    ImagePicker.requestMediaLibraryPermissionsAsync();

    const options = ["Take Photo", "Choose from Library", "Cancel"];
    const cancelIndex = 2;

    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        { options, cancelButtonIndex: cancelIndex },
        (index) => {
          if (index === 0) pickAndUpload("camera");
          else if (index === 1) pickAndUpload("library");
        }
      );
    } else {
      Alert.alert("Update Photo", undefined, [
        { text: "Take Photo", onPress: () => pickAndUpload("camera") },
        { text: "Choose from Library", onPress: () => pickAndUpload("library") },
        { text: "Cancel", style: "cancel" },
      ]);
    }
  }, [resolvedBabyId, pickAndUpload]);

  useDashboardRealtime();
  useEnsureTogetherShift(careMode.mode);

  const invalidateDashboard = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["latest-feed"] });
    queryClient.invalidateQueries({ queryKey: ["latest-diaper"] });
    queryClient.invalidateQueries({ queryKey: ["latest-sleep"] });
    queryClient.invalidateQueries({ queryKey: ["latest-pump"] });
    queryClient.invalidateQueries({ queryKey: ["recent-activity"] });
    queryClient.invalidateQueries({ queryKey: ["log-history"] });
  }, [queryClient]);

  // Refetch dashboard data whenever screen comes into focus (e.g. returning from a logger)
  useFocusEffect(invalidateDashboard);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    invalidateDashboard();
    // Give queries a moment to refetch
    await new Promise((r) => setTimeout(r, 800));
    setRefreshing(false);
  }, [invalidateDashboard]);

  const isTogether = careMode.isTogether;
  const caregiverName = activeShift?.caregiver_display_name;

  return (
    <View style={{ flex: 1 }}>
      <NurseryBackground theme={tc.mode} />
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.feedPrimary}
            colors={[colors.feedPrimary]}
            progressViewOffset={insets.top}
          />
        }
      >
        <View style={{ paddingHorizontal: 24, paddingTop: insets.top + 16, paddingBottom: 32 }}>
          <View style={{ position: 'absolute', right: -24, top: insets.top + 10 }} pointerEvents="none">
            <NurseryMobileArt theme={tc.mode} screen="home" />
          </View>
          {/* Header: avatar + baby name */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <BabyAvatar
              avatarUrl={baby?.avatar_url}
              babyName={baby?.name}
              theme={tc.mode}
              onPress={handleAvatarPress}
              loading={uploadAvatar.isPending}
            />
            <View>
              {hasMultipleBabies ? (
                <Pressable
                  style={{ flexDirection: 'row', alignItems: 'center' }}
                  onPress={() => setBabyPickerVisible(true)}
                >
                  <Text style={{ fontSize: 34, letterSpacing: -0.5, fontFamily: 'Baloo2_800ExtraBold', color: tc.textPrimary }}>
                    {baby ? baby.name : "Dashboard"}
                  </Text>
                  <ChevronDown size={20} color={colors.feedPrimary} style={{ marginLeft: 6, marginTop: 2 }} />
                </Pressable>
              ) : (
                <Text style={{ fontSize: 34, letterSpacing: -0.5, fontFamily: 'Baloo2_800ExtraBold', color: tc.textPrimary }}>
                  {baby ? baby.name : "Dashboard"}
                </Text>
              )}
            </View>
          </View>

          {/* Baby Picker Modal */}
          <Modal
            visible={babyPickerVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setBabyPickerVisible(false)}
          >
            <Pressable
              className="flex-1 justify-center items-center px-6"
              style={{ backgroundColor: 'rgba(26,22,18,0.5)' }}
              onPress={() => setBabyPickerVisible(false)}
            >
              <View
                style={{ backgroundColor: tc.cardBg, borderWidth: 1, borderColor: tc.border, borderRadius: 16, width: '100%', overflow: 'hidden' }}
                onStartShouldSetResponder={() => true}
              >
                <Text
                  style={{ fontSize: 11, color: tc.textSecondary, fontFamily: 'Baloo2_700Bold', letterSpacing: 2, textTransform: 'uppercase', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 }}
                >
                  Select Baby
                </Text>
                <FlatList
                  data={babies}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => {
                    const isSelected = item.id === resolvedBabyId;
                    return (
                      <Pressable
                        style={{ paddingHorizontal: 20, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: isSelected ? `${tc.raisedBg}80` : 'transparent' }}
                        onPress={() => {
                          setSelectedBabyId(item.id);
                          setBabyPickerVisible(false);
                        }}
                      >
                        <Text
                          style={{ fontSize: 16, fontFamily: 'Nunito_500Medium', color: isSelected ? colors.feedPrimary : tc.textPrimary }}
                        >
                          {item.name}
                        </Text>
                        {isSelected && (
                          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.feedPrimary }} />
                        )}
                      </Pressable>
                    );
                  }}
                  ItemSeparatorComponent={() => (
                    <View style={{ height: 1, backgroundColor: tc.border, marginHorizontal: 20 }} />
                  )}
                />
                <View style={{ paddingHorizontal: 20, paddingBottom: 16, paddingTop: 8 }}>
                  <Pressable
                    style={{ alignItems: 'center', paddingVertical: 10 }}
                    onPress={() => setBabyPickerVisible(false)}
                  >
                    <Text style={{ color: tc.textSecondary, fontSize: 14, fontFamily: 'Nunito_600SemiBold' }}>Cancel</Text>
                  </Pressable>
                </View>
              </View>
            </Pressable>
          </Modal>

          {/* Quick Log buttons — 2x2 action grid */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
            {ACTION_GRID.map((item) => (
              <Pressable
                key={item.label}
                style={{
                  backgroundColor: tc.mode === 'dark' ? item.darkBg : item.bg,
                  borderWidth: 1.5,
                  borderColor: tc.mode === 'dark' ? item.darkBorder : item.border,
                  borderRadius: 16,
                  paddingTop: 10,
                  paddingBottom: 8,
                  paddingHorizontal: 4,
                  alignItems: 'center',
                  width: '48%',
                  flexGrow: 1,
                }}
                onPress={() => router.push(item.route as any)}
              >
                <item.Icon size={36} theme={tc.mode} />
                <Text style={{ fontFamily: 'Baloo2_700Bold', fontSize: 12, color: item.color, letterSpacing: 0.3, marginTop: 3 }}>
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Together mode: Activity Feed | Shifts/Nanny mode: Shift Banner */}
          {isTogether ? (
            <View className="mb-5">
              <View className="flex-row items-center justify-between mb-2">
                <Text style={{ fontSize: 11, color: tc.textMuted, fontFamily: 'Baloo2_700Bold', letterSpacing: 2, textTransform: 'uppercase' }}>
                  Recent Activity
                </Text>
                <Pressable style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }} onPress={() => router.push("/briefing")}>
                  <Text style={{ fontSize: 12, color: colors.feedPrimary, fontFamily: 'Nunito_800ExtraBold' }}>Daily Briefing</Text>
                  <ChevronRight size={12} color={colors.feedPrimary} strokeWidth={3} />
                </Pressable>
              </View>
              <ActivityFeed babyId={resolvedBabyId ?? undefined} />
            </View>
          ) : (
            <Pressable
              style={{ backgroundColor: tc.cardBg, borderWidth: 1, borderColor: tc.border, borderRadius: 16, padding: 20, marginBottom: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', ...shadows.sm }}
              onPress={() => router.push("/briefing")}
            >
              <View>
                <Text style={{ fontSize: 11, color: colors.feedPrimary, fontFamily: 'Baloo2_700Bold', letterSpacing: 2, textTransform: 'uppercase' }}>
                  On Shift
                </Text>
                <Text style={{ fontSize: 16, fontFamily: 'Nunito_600SemiBold', color: tc.textPrimary, marginTop: 2 }}>
                  {caregiverName ?? "No one"}
                </Text>
              </View>
              <View style={{ backgroundColor: colors.feedPrimary, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 8 }}>
                <Text style={{ color: colors.charcoal, fontSize: 14, fontFamily: 'Nunito_600SemiBold' }}>Hand Off</Text>
              </View>
            </Pressable>
          )}

          {/* Status Cards — 2×2 grid */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
            <View style={{ width: '48%', flexGrow: 1 }}>
              <StatusCard
                type="feed"
                label="Last Fed"
                value={timeAgo(latestFeed?.started_at)}
                onPress={() => setHistoryKind("feed")}
              />
            </View>
            <View style={{ width: '48%', flexGrow: 1 }}>
              <StatusCard
                type="diaper"
                label="Last Diaper"
                value={timeAgo(latestDiaper?.logged_at)}
                onPress={() => setHistoryKind("diaper")}
              />
            </View>
            <View style={{ width: '48%', flexGrow: 1 }}>
              <StatusCard
                type="pump"
                label="Last Pumped"
                value={timeAgo(latestPump?.started_at)}
                onPress={() => setHistoryKind("pump")}
              />
            </View>
            <View style={{ width: '48%', flexGrow: 1 }}>
              <StatusCard
                type="sleep"
                label="Last Sleep"
                value={
                  latestSleep?.started_at && !latestSleep?.ended_at
                    ? "Sleeping"
                    : timeAgo(latestSleep?.ended_at ?? latestSleep?.started_at)
                }
                onPress={() => setHistoryKind("sleep")}
              />
            </View>
          </View>



        </View>
      </ScrollView>

      <LogHistoryModal
        kind={historyKind}
        babyId={resolvedBabyId ?? undefined}
        visible={!!historyKind}
        onClose={() => setHistoryKind(null)}
      />
    </View>
  );
}
