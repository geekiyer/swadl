import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SectionList,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  Pressable,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { Swipeable } from "react-native-gesture-handler";
import { Springs } from "../../constants/animation";
import { Check, Plus } from "lucide-react-native";
import {
  useAllChores,
  useCompleteChore,
  useAssignChore,
  useCreateChore,
  useDeleteChore,
  useUpdateChore,
  useHouseholdMembers,
  useProfile,
  type ChoreWithStatus,
} from "../../lib/queries";
import { useCareMode } from "../../lib/careMode";
import { usePressSpring } from "../../hooks/usePressSpring";
import { shadows, colors } from "../../constants/theme";

const CATEGORIES = [
  { key: "feeding_prep", label: "Feeding Prep" },
  { key: "sanitation", label: "Sanitation" },
  { key: "laundry", label: "Laundry" },
  { key: "diaper_bag", label: "Diaper Bag" },
  { key: "safety", label: "Safety" },
  { key: "other", label: "Other" },
] as const;

const RECURRENCE_OPTIONS = [
  { key: "daily", label: "Daily" },
  { key: "every-x-days", label: "Every X Days" },
  { key: "weekly", label: "Weekly" },
  { key: "one-time", label: "One-time" },
] as const;

function categoryLabel(key: string) {
  return CATEGORIES.find((c) => c.key === key)?.label ?? key;
}

interface ChoreRowProps {
  item: ChoreWithStatus;
  isTogether: boolean;
  isOwnChore: boolean;
  onComplete: (item: ChoreWithStatus) => void;
  onSelfClaim: (item: ChoreWithStatus) => void;
  onAssign: (item: ChoreWithStatus) => void;
  onLongPress: (item: ChoreWithStatus) => void;
  renderRightActions: (item: ChoreWithStatus) => React.ReactNode;
}

function ChoreRow({
  item,
  isTogether,
  isOwnChore,
  onComplete,
  onSelfClaim,
  onAssign,
  onLongPress,
  renderRightActions,
}: ChoreRowProps) {
  const checkProgress = useSharedValue(item.completed_today ? 1 : 0);
  const rowOpacity = useSharedValue(1);

  const recurrence = item.recurrence as Record<string, string>;

  function fireComplete() {
    onComplete(item);
  }

  function handleTapComplete() {
    if (item.completed_today) return;
    checkProgress.value = withSpring(1, Springs.microFeedback);
    rowOpacity.value = withTiming(0.4, { duration: 400 }, () => {
      runOnJS(fireComplete)();
    });
  }

  const circleStyle = useAnimatedStyle(() => ({
    backgroundColor:
      checkProgress.value > 0
        ? `rgba(52, 199, 89, ${checkProgress.value})`
        : "transparent",
    borderColor:
      checkProgress.value > 0.5 ? colors.success : colors.navyBorder,
  }));

  const checkmarkStyle = useAnimatedStyle(() => ({
    opacity: checkProgress.value,
    transform: [{ scale: checkProgress.value }],
  }));

  const rowStyle = useAnimatedStyle(() => ({
    opacity: rowOpacity.value,
  }));

  return (
    <Swipeable renderRightActions={() => renderRightActions(item)}>
      <Animated.View style={rowStyle}>
        <Pressable
          onLongPress={() => onLongPress(item)}
          className="flex-row items-center bg-navy-card border-b border-navy-border px-4 py-3"
        >
          {/* Animated complete button */}
          <Pressable onPress={handleTapComplete} hitSlop={8} disabled={item.completed_today}>
            <Animated.View
              className="w-7 h-7 rounded-full border-2 mr-3 items-center justify-center"
              style={circleStyle}
            >
              <Animated.View style={checkmarkStyle}>
                <Check size={14} strokeWidth={2.5} color={colors.white} />
              </Animated.View>
            </Animated.View>
          </Pressable>

          {/* Content */}
          <View className="flex-1">
            <Text
              className={`text-base ${
                item.completed_today
                  ? "text-ash line-through"
                  : "font-body-medium text-white"
              }`}
            >
              {item.title}
            </Text>
            <View className="flex-row items-center mt-0.5">
              <Text className="text-xs text-ash">
                {recurrence?.type === "daily"
                  ? "Daily"
                  : recurrence?.type === "every-x-days"
                    ? `Every ${recurrence.interval_days} days`
                    : recurrence?.type === "weekly"
                      ? "Weekly"
                      : "One-time"}
                {recurrence?.time ? ` at ${recurrence.time}` : ""}
              </Text>
              {item.assignee_name && (
                <Text className="text-xs text-honey ml-2">
                  {item.assignee_name}
                </Text>
              )}
            </View>
          </View>

          {/* Assign / Claim button */}
          {isTogether ? (
            <TouchableOpacity
              className="px-3 py-1.5 rounded-md bg-navy-raise"
              onPress={() => onSelfClaim(item)}
              disabled={isOwnChore}
            >
              <Text
                className={`text-xs font-body-medium ${
                  isOwnChore ? "text-success" : "text-amber"
                }`}
              >
                {isOwnChore ? "Mine" : "I got it"}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              className="px-3 py-1.5 rounded-md bg-navy-raise"
              onPress={() => onAssign(item)}
            >
              <Text className="text-xs text-ash">Assign</Text>
            </TouchableOpacity>
          )}
        </Pressable>
      </Animated.View>
    </Swipeable>
  );
}

export default function Chores() {
  const { data: chores } = useAllChores();
  const { data: members } = useHouseholdMembers();
  const { data: profile } = useProfile();
  const { careMode } = useCareMode();
  const completeChore = useCompleteChore();
  const assignChore = useAssignChore();
  const createChore = useCreateChore();
  const deleteChore = useDeleteChore();
  const updateChore = useUpdateChore();

  const isTogether = careMode.isTogether;
  const { animStyle: fabAnimStyle, handlers: fabHandlers } = usePressSpring();

  const [tab, setTab] = useState<"today" | "all">("today");
  const [showAdd, setShowAdd] = useState(false);
  const [assigningChore, setAssigningChore] = useState<ChoreWithStatus | null>(
    null
  );
  const [editingChore, setEditingChore] = useState<ChoreWithStatus | null>(null);

  // Add chore form state
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("other");
  const [newRecurrence, setNewRecurrence] = useState("daily");
  const [newIntervalDays, setNewIntervalDays] = useState("");
  const [newTime, setNewTime] = useState("");

  // Edit chore form state
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState("other");
  const [editRecurrence, setEditRecurrence] = useState("daily");
  const [editIntervalDays, setEditIntervalDays] = useState("");
  const [editTime, setEditTime] = useState("");

  const todayChores = chores?.filter((c) => !c.completed_today) ?? [];
  const completedToday = chores?.filter((c) => c.completed_today) ?? [];

  // Group "all" chores by category
  const allByCategory = CATEGORIES.map((cat) => ({
    title: cat.label,
    data: (chores ?? []).filter((c) => c.category === cat.key),
  })).filter((section) => section.data.length > 0);

  // Group "today" into incomplete + completed
  const todaySections = [
    ...(todayChores.length > 0
      ? [{ title: "To Do", data: todayChores }]
      : []),
    ...(completedToday.length > 0
      ? [{ title: "Completed", data: completedToday }]
      : []),
  ];

  function handleComplete(chore: ChoreWithStatus) {
    if (chore.completed_today) return;
    completeChore.mutate(chore.id);
  }

  function handleAssign(choreId: string, profileId: string | null) {
    assignChore.mutate({ choreId, assignTo: profileId });
    setAssigningChore(null);
  }

  function handleAddChore() {
    if (!newTitle.trim()) return;
    if (newRecurrence === "every-x-days" && !newIntervalDays) return;

    let recurrence: Record<string, unknown>;
    if (newRecurrence === "one-time") {
      recurrence = { type: "one-time" };
    } else if (newRecurrence === "every-x-days") {
      recurrence = {
        type: "every-x-days",
        interval_days: parseInt(newIntervalDays, 10),
        ...(newTime ? { time: newTime } : {}),
      };
    } else {
      recurrence = { type: newRecurrence, ...(newTime ? { time: newTime } : {}) };
    }

    createChore.mutate(
      {
        title: newTitle.trim(),
        category: newCategory,
        recurrence,
      },
      {
        onSuccess: () => {
          setShowAdd(false);
          setNewTitle("");
          setNewCategory("other");
          setNewRecurrence("daily");
          setNewIntervalDays("");
          setNewTime("");
        },
        onError: (err) => Alert.alert("Error", err.message),
      }
    );
  }

  function handleSelfClaim(chore: ChoreWithStatus) {
    if (!profile) return;
    assignChore.mutate({ choreId: chore.id, assignTo: profile.id });
  }

  function openEditChore(chore: ChoreWithStatus) {
    const rec = chore.recurrence as Record<string, string>;
    setEditTitle(chore.title);
    setEditCategory(chore.category);
    setEditRecurrence(rec?.type ?? "daily");
    setEditIntervalDays(rec?.interval_days ?? "");
    setEditTime(rec?.time ?? "");
    setEditingChore(chore);
  }

  function handleSaveEdit() {
    if (!editingChore || !editTitle.trim()) return;
    if (editRecurrence === "every-x-days" && !editIntervalDays) return;

    let recurrence: Record<string, unknown>;
    if (editRecurrence === "one-time") {
      recurrence = { type: "one-time" };
    } else if (editRecurrence === "every-x-days") {
      recurrence = {
        type: "every-x-days",
        interval_days: parseInt(editIntervalDays, 10),
        ...(editTime ? { time: editTime } : {}),
      };
    } else {
      recurrence = { type: editRecurrence, ...(editTime ? { time: editTime } : {}) };
    }

    updateChore.mutate(
      {
        id: editingChore.id,
        title: editTitle.trim(),
        category: editCategory,
        recurrence,
      },
      {
        onSuccess: () => setEditingChore(null),
        onError: (err) => Alert.alert("Error", err.message),
      }
    );
  }

  function handleDelete(chore: ChoreWithStatus) {
    Alert.alert("Delete Chore", `Delete "${chore.title}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteChore.mutate(chore.id),
      },
    ]);
  }

  function renderRightActions(item: ChoreWithStatus) {
    if (isTogether) {
      return (
        <View className="flex-row">
          <TouchableOpacity
            className="bg-amber justify-center px-5"
            onPress={() => handleSelfClaim(item)}
          >
            <Text className="text-midnight font-body-semibold text-sm">I got it</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-danger justify-center px-5"
            onPress={() => handleDelete(item)}
          >
            <Text className="text-white font-body-semibold text-sm">Delete</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <TouchableOpacity
        className="bg-danger justify-center px-6"
        onPress={() => handleDelete(item)}
      >
        <Text className="text-white font-body-semibold text-sm">Delete</Text>
      </TouchableOpacity>
    );
  }

  function renderChoreItem({ item }: { item: ChoreWithStatus }) {
    return (
      <ChoreRow
        item={item}
        isTogether={isTogether}
        isOwnChore={item.assigned_to === profile?.id}
        onComplete={handleComplete}
        onSelfClaim={handleSelfClaim}
        onAssign={setAssigningChore}
        onLongPress={openEditChore}
        renderRightActions={renderRightActions}
      />
    );
  }

  return (
    <View className="flex-1 bg-midnight">
      {/* Tab Bar */}
      <View className="flex-row border-b border-navy-border px-4">
        <TouchableOpacity
          className={`py-3 mr-6 ${tab === "today" ? "border-b-2 border-amber" : ""}`}
          onPress={() => setTab("today")}
        >
          <Text
            className={`text-base font-body-medium ${tab === "today" ? "text-amber" : "text-ash"}`}
          >
            Today
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`py-3 ${tab === "all" ? "border-b-2 border-amber" : ""}`}
          onPress={() => setTab("all")}
        >
          <Text
            className={`text-base font-body-medium ${tab === "all" ? "text-amber" : "text-ash"}`}
          >
            All Chores
          </Text>
        </TouchableOpacity>
      </View>

      {/* Chore List */}
      <SectionList
        sections={tab === "today" ? todaySections : allByCategory}
        keyExtractor={(item) => item.id}
        renderItem={renderChoreItem}
        renderSectionHeader={({ section: { title } }) => (
          <View className="bg-navy-deep px-4 py-2">
            <Text className="text-[11px] text-ash uppercase font-body-bold" style={{ letterSpacing: 2 }}>
              {title}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center py-20">
            <Text className="text-ash text-base">
              {tab === "today" ? "All done for today!" : "No chores yet"}
            </Text>
          </View>
        }
      />

      {/* Add Button */}
      <Animated.View
        style={[
          fabAnimStyle,
          shadows.amber,
          { position: "absolute", bottom: 24, right: 24 },
        ]}
      >
        <Pressable
          onPressIn={fabHandlers.onPressIn}
          onPressOut={fabHandlers.onPressOut}
          onPress={() => setShowAdd(true)}
          className="bg-amber w-14 h-14 rounded-full items-center justify-center"
        >
          <Plus size={26} strokeWidth={1.5} color={colors.midnight} />
        </Pressable>
      </Animated.View>

      {/* Assign Modal */}
      <Modal
        visible={!!assigningChore}
        transparent
        animationType="slide"
        onRequestClose={() => setAssigningChore(null)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/40 justify-end"
          activeOpacity={1}
          onPress={() => setAssigningChore(null)}
        >
          <View className="bg-navy-card rounded-t-2xl px-6 pt-6 pb-10">
            <Text className="text-lg font-body-bold text-white mb-4">
              Assign: {assigningChore?.title}
            </Text>

            <TouchableOpacity
              className="py-3 border-b border-navy-border"
              onPress={() =>
                assigningChore && handleAssign(assigningChore.id, null)
              }
            >
              <Text className="text-base text-ash">Unassigned</Text>
            </TouchableOpacity>

            {members?.map((member) => (
              <TouchableOpacity
                key={member.id}
                className="py-3 border-b border-navy-border"
                onPress={() =>
                  assigningChore && handleAssign(assigningChore.id, member.id)
                }
              >
                <Text className="text-base text-white">
                  {member.display_name}
                  {assigningChore?.assigned_to === member.id ? " (current)" : ""}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              className="mt-4 py-3"
              onPress={() => setAssigningChore(null)}
            >
              <Text className="text-ash text-center">Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Add Chore Modal */}
      <Modal
        visible={showAdd}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAdd(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/40 justify-end"
          activeOpacity={1}
          onPress={() => setShowAdd(false)}
        >
          <TouchableOpacity activeOpacity={1}>
            <ScrollView className="bg-navy-card rounded-t-2xl px-6 pt-6 pb-10 max-h-[85%]">
              <Text className="text-lg font-body-bold text-white mb-4">Add Chore</Text>

              {/* Title */}
              <Text className="text-xs font-body-bold text-ash uppercase mb-1" style={{ letterSpacing: 2 }}>
                Title
              </Text>
              <TextInput
                className="border border-navy-border bg-navy-raise rounded-xl px-4 py-3 mb-4 text-base text-white"
                placeholder="e.g. Sanitize bottles"
                placeholderTextColor={colors.ash}
                value={newTitle}
                onChangeText={setNewTitle}
                autoFocus
              />

              {/* Category */}
              <Text className="text-xs font-body-bold text-ash uppercase mb-2" style={{ letterSpacing: 2 }}>
                Category
              </Text>
              <View className="flex-row flex-wrap gap-2 mb-4">
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.key}
                    className={`px-3 py-2 rounded-xl border ${
                      newCategory === cat.key
                        ? "bg-amber border-amber"
                        : "border-navy-border bg-navy-raise"
                    }`}
                    onPress={() => setNewCategory(cat.key)}
                  >
                    <Text
                      className={`text-sm ${
                        newCategory === cat.key
                          ? "text-midnight font-body-medium"
                          : "text-ash"
                      }`}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Recurrence */}
              <Text className="text-xs font-body-bold text-ash uppercase mb-2" style={{ letterSpacing: 2 }}>
                Recurrence
              </Text>
              <View className="flex-row gap-2 mb-4">
                {RECURRENCE_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.key}
                    className={`px-4 py-2 rounded-xl border flex-1 items-center ${
                      newRecurrence === opt.key
                        ? "bg-amber border-amber"
                        : "border-navy-border bg-navy-raise"
                    }`}
                    onPress={() => setNewRecurrence(opt.key)}
                  >
                    <Text
                      className={`text-sm ${
                        newRecurrence === opt.key
                          ? "text-midnight font-body-medium"
                          : "text-ash"
                      }`}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Interval days (for every-x-days) */}
              {newRecurrence === "every-x-days" && (
                <>
                  <Text className="text-xs font-body-bold text-ash uppercase mb-1" style={{ letterSpacing: 2 }}>
                    Every how many days?
                  </Text>
                  <TextInput
                    className="border border-navy-border bg-navy-raise rounded-xl px-4 py-3 mb-4 text-base text-white"
                    placeholder="e.g. 3"
                    placeholderTextColor={colors.ash}
                    value={newIntervalDays}
                    onChangeText={setNewIntervalDays}
                    keyboardType="number-pad"
                  />
                </>
              )}

              {/* Time (optional) */}
              {newRecurrence !== "one-time" && (
                <>
                  <Text className="text-xs font-body-bold text-ash uppercase mb-1" style={{ letterSpacing: 2 }}>
                    Time (optional)
                  </Text>
                  <TextInput
                    className="border border-navy-border bg-navy-raise rounded-xl px-4 py-3 mb-4 text-base text-white"
                    placeholder="e.g. 20:00"
                    placeholderTextColor={colors.ash}
                    value={newTime}
                    onChangeText={setNewTime}
                  />
                </>
              )}

              {/* Save */}
              <TouchableOpacity
                className={`rounded-2xl py-4 mb-3 ${
                  newTitle.trim() ? "bg-amber" : "bg-navy-raise border border-navy-border"
                }`}
                onPress={handleAddChore}
                disabled={!newTitle.trim() || createChore.isPending}
              >
                <Text className={`text-center font-body-semibold text-base ${newTitle.trim() ? "text-midnight" : "text-ash"}`}>
                  {createChore.isPending ? "Adding..." : "Add Chore"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="py-3 mb-4"
                onPress={() => setShowAdd(false)}
              >
                <Text className="text-ash text-center">Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Edit Chore Modal */}
      <Modal
        visible={!!editingChore}
        transparent
        animationType="slide"
        onRequestClose={() => setEditingChore(null)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/40 justify-end"
          activeOpacity={1}
          onPress={() => setEditingChore(null)}
        >
          <TouchableOpacity activeOpacity={1}>
            <ScrollView className="bg-navy-card rounded-t-2xl px-6 pt-6 pb-10 max-h-[85%]">
              <Text className="text-lg font-body-bold text-white mb-4">Edit Chore</Text>

              <Text className="text-xs font-body-bold text-ash uppercase mb-1" style={{ letterSpacing: 2 }}>
                Title
              </Text>
              <TextInput
                className="border border-navy-border bg-navy-raise rounded-xl px-4 py-3 mb-4 text-base text-white"
                value={editTitle}
                onChangeText={setEditTitle}
              />

              <Text className="text-xs font-body-bold text-ash uppercase mb-2" style={{ letterSpacing: 2 }}>
                Category
              </Text>
              <View className="flex-row flex-wrap gap-2 mb-4">
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.key}
                    className={`px-3 py-2 rounded-xl border ${
                      editCategory === cat.key
                        ? "bg-amber border-amber"
                        : "border-navy-border bg-navy-raise"
                    }`}
                    onPress={() => setEditCategory(cat.key)}
                  >
                    <Text
                      className={`text-sm ${
                        editCategory === cat.key
                          ? "text-midnight font-body-medium"
                          : "text-ash"
                      }`}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text className="text-xs font-body-bold text-ash uppercase mb-2" style={{ letterSpacing: 2 }}>
                Recurrence
              </Text>
              <View className="flex-row gap-2 mb-4">
                {RECURRENCE_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.key}
                    className={`px-4 py-2 rounded-xl border flex-1 items-center ${
                      editRecurrence === opt.key
                        ? "bg-amber border-amber"
                        : "border-navy-border bg-navy-raise"
                    }`}
                    onPress={() => setEditRecurrence(opt.key)}
                  >
                    <Text
                      className={`text-sm ${
                        editRecurrence === opt.key
                          ? "text-midnight font-body-medium"
                          : "text-ash"
                      }`}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {editRecurrence === "every-x-days" && (
                <>
                  <Text className="text-xs font-body-bold text-ash uppercase mb-1" style={{ letterSpacing: 2 }}>
                    Every how many days?
                  </Text>
                  <TextInput
                    className="border border-navy-border bg-navy-raise rounded-xl px-4 py-3 mb-4 text-base text-white"
                    value={editIntervalDays}
                    onChangeText={setEditIntervalDays}
                    keyboardType="number-pad"
                  />
                </>
              )}

              {editRecurrence !== "one-time" && (
                <>
                  <Text className="text-xs font-body-bold text-ash uppercase mb-1" style={{ letterSpacing: 2 }}>
                    Time (optional)
                  </Text>
                  <TextInput
                    className="border border-navy-border bg-navy-raise rounded-xl px-4 py-3 mb-4 text-base text-white"
                    value={editTime}
                    onChangeText={setEditTime}
                    placeholder="e.g. 20:00"
                    placeholderTextColor={colors.ash}
                  />
                </>
              )}

              <TouchableOpacity
                className={`rounded-2xl py-4 mb-3 ${
                  editTitle.trim() ? "bg-amber" : "bg-navy-raise border border-navy-border"
                }`}
                onPress={handleSaveEdit}
                disabled={!editTitle.trim() || updateChore.isPending}
              >
                <Text className={`text-center font-body-semibold text-base ${editTitle.trim() ? "text-midnight" : "text-ash"}`}>
                  {updateChore.isPending ? "Saving..." : "Save Changes"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="py-3 mb-4"
                onPress={() => setEditingChore(null)}
              >
                <Text className="text-ash text-center">Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
