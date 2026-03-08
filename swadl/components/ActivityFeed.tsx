import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRecentActivity, type ActivityItem } from "../lib/queries";
import { shadows, colors } from "../constants/theme";
import { EditLogModal } from "./EditLogModal";
import { useThemeColors } from "../lib/theme";
import { BottleIcon } from "./icons/BottleIcon";
import { DiaperIcon } from "./icons/DiaperIcon";
import { MoonIcon } from "./icons/MoonIcon";
import { PumpIcon } from "./icons/PumpIcon";
import { RulerBabyIcon } from "./icons/RulerBabyIcon";
import { ClockRoutineIcon } from "./icons/ClockRoutineIcon";

const CATEGORY_CONFIG: Record<string, {
  Icon: typeof BottleIcon;
  bgLight: string;
  bgDark: string;
}> = {
  feed: { Icon: BottleIcon, bgLight: colors.feedBg, bgDark: 'rgba(224,138,48,0.1)' },
  diaper: { Icon: DiaperIcon, bgLight: colors.diaperBg, bgDark: 'rgba(88,180,120,0.08)' },
  sleep: { Icon: MoonIcon, bgLight: colors.sleepBg, bgDark: 'rgba(120,140,210,0.08)' },
  pump: { Icon: PumpIcon, bgLight: colors.pumpBg, bgDark: 'rgba(200,100,105,0.08)' },
  growth: { Icon: RulerBabyIcon, bgLight: colors.growthBg, bgDark: 'rgba(130,110,200,0.08)' },
  routine: { Icon: ClockRoutineIcon, bgLight: colors.routineBg, bgDark: 'rgba(180,160,60,0.08)' },
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

function CategoryIcon({ kind, theme }: { kind: string; theme: 'light' | 'dark' }) {
  const config = CATEGORY_CONFIG[kind];
  if (!config) return null;
  const bg = theme === 'light' ? config.bgLight : config.bgDark;

  return (
    <View style={{
      width: 38, height: 38, borderRadius: 12,
      backgroundColor: bg,
      alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <config.Icon size={26} theme={theme} />
    </View>
  );
}

export function ActivityFeed({ babyId }: { babyId: string | undefined }) {
  const { data: items } = useRecentActivity(babyId, 8);
  const [editItem, setEditItem] = useState<ActivityItem | null>(null);
  const tc = useThemeColors();

  if (!items || items.length === 0) {
    return (
      <View style={{ backgroundColor: tc.cardBg, borderWidth: 1, borderColor: tc.border, borderRadius: 16, padding: 20, alignItems: 'center', ...shadows.sm }}>
        <Text style={{ color: tc.textSecondary, fontFamily: 'Nunito_400Regular' }}>No recent activity</Text>
      </View>
    );
  }

  return (
    <>
      <View style={{ gap: 5 }}>
        {items.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              paddingVertical: 10,
              paddingHorizontal: 14,
              borderRadius: 16,
              backgroundColor: tc.cardBg,
              borderWidth: 1,
              borderColor: tc.border,
              ...shadows.sm,
            }}
            onPress={() => setEditItem(item)}
            activeOpacity={0.6}
          >
            <CategoryIcon kind={item.kind} theme={tc.mode} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={{ fontSize: 13, lineHeight: 17 }}>
                <Text style={{ fontFamily: 'Nunito_800ExtraBold', color: tc.textPrimary }}>{item.loggedBy}</Text>
                <Text style={{ fontFamily: 'Nunito_400Regular', color: tc.textBody }}> {item.label}</Text>
              </Text>
              {item.detail ? (
                <Text style={{ fontSize: 11, color: tc.textDetail, fontFamily: 'Nunito_400Regular', marginTop: 1 }}>{item.detail}</Text>
              ) : null}
            </View>
            <Text style={{ fontSize: 10, letterSpacing: -0.3, color: tc.textPlaceholder, fontFamily: 'JetBrainsMono_400Regular' }}>{timeLabel(item.timestamp)}</Text>
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
