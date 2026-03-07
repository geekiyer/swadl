import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRecentActivity, type ActivityItem } from "../lib/queries";
import { shadows, colors } from "../constants/theme";
import { EditLogModal } from "./EditLogModal";

const DOT_COLORS: Record<ActivityItem["kind"], string> = {
  feed: colors.amber,
  diaper: colors.honey,
  sleep: colors.info,
  pump: colors.ember,
};

function timeLabel(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;
  if (hours < 24) return remMins > 0 ? `${hours}h ${remMins}m ago` : `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function ActivityFeed({ babyId }: { babyId: string | undefined }) {
  const { data: items } = useRecentActivity(babyId, 8);
  const [editItem, setEditItem] = useState<ActivityItem | null>(null);

  if (!items || items.length === 0) {
    return (
      <View className="bg-navy-card border border-navy-border rounded-2xl p-5 items-center" style={shadows.sm}>
        <Text className="text-ash font-body">No recent activity</Text>
      </View>
    );
  }

  return (
    <>
      <View className="bg-navy-card border border-navy-border rounded-2xl overflow-hidden" style={shadows.sm}>
        {items.map((item, i) => (
          <TouchableOpacity
            key={item.id}
            className={`flex-row items-center px-4 py-3 ${
              i > 0 ? "border-t border-navy-border" : ""
            }`}
            onPress={() => setEditItem(item)}
            activeOpacity={0.6}
          >
            <View
              className="w-2 h-2 rounded-full mr-3"
              style={{ backgroundColor: DOT_COLORS[item.kind] }}
            />
            <View className="flex-1">
              <Text className="text-sm text-white">
                <Text className="font-body-semibold">{item.loggedBy}</Text>
                <Text className="font-body"> {item.label}</Text>
              </Text>
              {item.detail ? (
                <Text className="text-xs text-ash font-body mt-0.5">{item.detail}</Text>
              ) : null}
            </View>
            <Text className="text-xs text-ash font-mono ml-2">{timeLabel(item.timestamp)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <EditLogModal
        item={editItem}
        visible={!!editItem}
        onClose={() => setEditItem(null)}
      />
    </>
  );
}
