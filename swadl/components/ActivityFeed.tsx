import { View, Text } from "react-native";
import { useRecentActivity, type ActivityItem } from "../lib/queries";
import { shadows } from "../constants/theme";

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
      <View className="bg-navy-card border border-navy-border rounded-2xl p-5 items-center" style={shadows.sm}>
        <Text className="text-ash font-body">No recent activity</Text>
      </View>
    );
  }

  return (
    <View className="bg-navy-card border border-navy-border rounded-2xl overflow-hidden" style={shadows.sm}>
      {items.map((item, i) => (
        <View
          key={item.id}
          className={`flex-row items-center px-4 py-3 ${
            i > 0 ? "border-t border-navy-border" : ""
          }`}
        >
          <Text className="text-lg mr-3">{ICONS[item.kind]}</Text>
          <View className="flex-1">
            <Text className="text-sm font-body-semibold text-white">{item.label}</Text>
            <Text className="text-xs text-ash font-body">
              {item.loggedBy}
              {item.detail ? ` · ${item.detail}` : ""}
            </Text>
          </View>
          <Text className="text-xs text-ash font-mono">{timeLabel(item.timestamp)}</Text>
        </View>
      ))}
    </View>
  );
}
