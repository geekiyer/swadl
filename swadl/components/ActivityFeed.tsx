import { View, Text } from "react-native";
import { useRecentActivity, type ActivityItem } from "../lib/queries";

const ICONS: Record<ActivityItem["kind"], string> = {
  feed: "\u{1F37C}",
  diaper: "\u{1F9F7}",
  sleep: "\u{1F634}",
  pump: "\u{1F95B}",
};

function timeLabel(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function ActivityFeed({ babyId }: { babyId: string | undefined }) {
  const { data: items } = useRecentActivity(babyId, 8);

  if (!items || items.length === 0) {
    return (
      <View className="bg-gray-50 rounded-xl p-4 items-center">
        <Text className="text-gray-400">No recent activity</Text>
      </View>
    );
  }

  return (
    <View className="bg-gray-50 rounded-xl overflow-hidden">
      {items.map((item, i) => (
        <View
          key={item.id}
          className={`flex-row items-center px-4 py-3 ${
            i > 0 ? "border-t border-gray-200" : ""
          }`}
        >
          <Text className="text-lg mr-3">{ICONS[item.kind]}</Text>
          <View className="flex-1">
            <Text className="text-sm font-medium">{item.label}</Text>
            <Text className="text-xs text-gray-400">
              {item.loggedBy}
              {item.detail ? ` · ${item.detail}` : ""}
            </Text>
          </View>
          <Text className="text-xs text-gray-400">{timeLabel(item.timestamp)}</Text>
        </View>
      ))}
    </View>
  );
}
