import { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SectionList,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  Animated,
} from "react-native";
import {
  Swipeable,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import {
  useAllChores,
  useCompleteChore,
  useAssignChore,
  useCreateChore,
  useDeleteChore,
  useHouseholdMembers,
  useProfile,
  type ChoreWithStatus,
} from "../../lib/queries";
import { useCareMode } from "../../lib/careMode";

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

export default function Chores() {
  const { data: chores } = useAllChores();
  const { data: members } = useHouseholdMembers();
  const { data: profile } = useProfile();
  const { data: careMode } = useCareMode();
  const completeChore = useCompleteChore();
  const assignChore = useAssignChore();
  const createChore = useCreateChore();
  const deleteChore = useDeleteChore();

  const isTogether = careMode === "together";

  const [tab, setTab] = useState<"today" | "all">("today");
  const [showAdd, setShowAdd] = useState(false);
  const [assigningChore, setAssigningChore] = useState<ChoreWithStatus | null>(
    null
  );

  // Add chore form state
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("other");
  const [newRecurrence, setNewRecurrence] = useState("daily");
  const [newIntervalDays, setNewIntervalDays] = useState("");
  const [newTime, setNewTime] = useState("");

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
            className="bg-blue-600 justify-center px-5"
            onPress={() => handleSelfClaim(item)}
          >
            <Text className="text-white font-semibold text-sm">I got it</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-red-500 justify-center px-5"
            onPress={() => handleDelete(item)}
          >
            <Text className="text-white font-semibold text-sm">Delete</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <TouchableOpacity
        className="bg-red-500 justify-center px-6"
        onPress={() => handleDelete(item)}
      >
        <Text className="text-white font-semibold text-sm">Delete</Text>
      </TouchableOpacity>
    );
  }

  function renderChoreItem({ item }: { item: ChoreWithStatus }) {
    const recurrence = item.recurrence as Record<string, string>;
    return (
      <Swipeable renderRightActions={() => renderRightActions(item)}>
        <View className="flex-row items-center bg-white border-b border-gray-100 px-4 py-3">
          {/* Complete button */}
          <TouchableOpacity
            className={`w-7 h-7 rounded-full border-2 mr-3 items-center justify-center ${
              item.completed_today
                ? "bg-green-500 border-green-500"
                : "border-gray-300"
            }`}
            onPress={() => handleComplete(item)}
            disabled={item.completed_today}
          >
            {item.completed_today && (
              <Text className="text-white text-xs font-bold">✓</Text>
            )}
          </TouchableOpacity>

          {/* Content */}
          <View className="flex-1">
            <Text
              className={`text-base ${
                item.completed_today
                  ? "text-gray-400 line-through"
                  : "font-medium"
              }`}
            >
              {item.title}
            </Text>
            <View className="flex-row items-center mt-0.5">
              <Text className="text-xs text-gray-400">
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
                <Text className="text-xs text-blue-500 ml-2">
                  {item.assignee_name}
                </Text>
              )}
            </View>
          </View>

          {/* Assign / Claim button */}
          {isTogether ? (
            <TouchableOpacity
              className={`px-3 py-1.5 rounded-md ${
                item.assigned_to === profile?.id ? "bg-green-100" : "bg-blue-100"
              }`}
              onPress={() => handleSelfClaim(item)}
              disabled={item.assigned_to === profile?.id}
            >
              <Text
                className={`text-xs font-medium ${
                  item.assigned_to === profile?.id ? "text-green-600" : "text-blue-600"
                }`}
              >
                {item.assigned_to === profile?.id ? "Mine" : "I got it"}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              className="px-3 py-1.5 rounded-md bg-gray-100"
              onPress={() => setAssigningChore(item)}
            >
              <Text className="text-xs text-gray-600">Assign</Text>
            </TouchableOpacity>
          )}
        </View>
      </Swipeable>
    );
  }

  return (
    <GestureHandlerRootView className="flex-1 bg-white">
      {/* Tab Bar */}
      <View className="flex-row border-b border-gray-200 px-4">
        <TouchableOpacity
          className={`py-3 mr-6 ${tab === "today" ? "border-b-2 border-blue-600" : ""}`}
          onPress={() => setTab("today")}
        >
          <Text
            className={`text-base font-medium ${tab === "today" ? "text-blue-600" : "text-gray-500"}`}
          >
            Today
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`py-3 ${tab === "all" ? "border-b-2 border-blue-600" : ""}`}
          onPress={() => setTab("all")}
        >
          <Text
            className={`text-base font-medium ${tab === "all" ? "text-blue-600" : "text-gray-500"}`}
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
          <View className="bg-gray-50 px-4 py-2">
            <Text className="text-xs text-gray-500 uppercase tracking-wide font-medium">
              {title}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center py-20">
            <Text className="text-gray-400 text-base">
              {tab === "today" ? "All done for today!" : "No chores yet"}
            </Text>
          </View>
        }
      />

      {/* Add Button */}
      <TouchableOpacity
        className="absolute bottom-6 right-6 bg-blue-600 w-14 h-14 rounded-full items-center justify-center shadow-lg"
        onPress={() => setShowAdd(true)}
      >
        <Text className="text-white text-2xl font-light">+</Text>
      </TouchableOpacity>

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
          <View className="bg-white rounded-t-2xl px-6 pt-6 pb-10">
            <Text className="text-lg font-bold mb-4">
              Assign: {assigningChore?.title}
            </Text>

            <TouchableOpacity
              className="py-3 border-b border-gray-100"
              onPress={() =>
                assigningChore && handleAssign(assigningChore.id, null)
              }
            >
              <Text className="text-base text-gray-500">Unassigned</Text>
            </TouchableOpacity>

            {members?.map((member) => (
              <TouchableOpacity
                key={member.id}
                className="py-3 border-b border-gray-100"
                onPress={() =>
                  assigningChore && handleAssign(assigningChore.id, member.id)
                }
              >
                <Text className="text-base">
                  {member.display_name}
                  {assigningChore?.assigned_to === member.id ? " (current)" : ""}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              className="mt-4 py-3"
              onPress={() => setAssigningChore(null)}
            >
              <Text className="text-gray-500 text-center">Cancel</Text>
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
            <ScrollView className="bg-white rounded-t-2xl px-6 pt-6 pb-10 max-h-[85%]">
              <Text className="text-lg font-bold mb-4">Add Chore</Text>

              {/* Title */}
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Title
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 mb-4 text-base"
                placeholder="e.g. Sanitize bottles"
                value={newTitle}
                onChangeText={setNewTitle}
                autoFocus
              />

              {/* Category */}
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Category
              </Text>
              <View className="flex-row flex-wrap gap-2 mb-4">
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.key}
                    className={`px-3 py-2 rounded-lg border ${
                      newCategory === cat.key
                        ? "bg-blue-600 border-blue-600"
                        : "border-gray-300"
                    }`}
                    onPress={() => setNewCategory(cat.key)}
                  >
                    <Text
                      className={`text-sm ${
                        newCategory === cat.key
                          ? "text-white font-medium"
                          : "text-gray-600"
                      }`}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Recurrence */}
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Recurrence
              </Text>
              <View className="flex-row gap-2 mb-4">
                {RECURRENCE_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.key}
                    className={`px-4 py-2 rounded-lg border flex-1 items-center ${
                      newRecurrence === opt.key
                        ? "bg-blue-600 border-blue-600"
                        : "border-gray-300"
                    }`}
                    onPress={() => setNewRecurrence(opt.key)}
                  >
                    <Text
                      className={`text-sm ${
                        newRecurrence === opt.key
                          ? "text-white font-medium"
                          : "text-gray-600"
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
                  <Text className="text-sm font-medium text-gray-700 mb-1">
                    Every how many days?
                  </Text>
                  <TextInput
                    className="border border-gray-300 rounded-lg px-4 py-3 mb-4 text-base"
                    placeholder="e.g. 3"
                    value={newIntervalDays}
                    onChangeText={setNewIntervalDays}
                    keyboardType="number-pad"
                  />
                </>
              )}

              {/* Time (optional) */}
              {newRecurrence !== "one-time" && (
                <>
                  <Text className="text-sm font-medium text-gray-700 mb-1">
                    Time (optional)
                  </Text>
                  <TextInput
                    className="border border-gray-300 rounded-lg px-4 py-3 mb-4 text-base"
                    placeholder="e.g. 20:00"
                    value={newTime}
                    onChangeText={setNewTime}
                  />
                </>
              )}

              {/* Save */}
              <TouchableOpacity
                className={`rounded-lg py-4 mb-3 ${
                  newTitle.trim() ? "bg-blue-600" : "bg-gray-300"
                }`}
                onPress={handleAddChore}
                disabled={!newTitle.trim() || createChore.isPending}
              >
                <Text className="text-white text-center font-semibold text-base">
                  {createChore.isPending ? "Adding..." : "Add Chore"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="py-3 mb-4"
                onPress={() => setShowAdd(false)}
              >
                <Text className="text-gray-500 text-center">Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </GestureHandlerRootView>
  );
}
