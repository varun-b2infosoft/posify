import React, { useCallback, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { Notification, getNotifications, getUnreadCount, markAllRead, markRead, subscribeNotifications } from "@/store/notifications";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotificationsScreen() {
  const colors  = useColors();
  const insets  = useSafeAreaInsets();
  const topPad  = Platform.OS === "web" ? 67 : insets.top;
  const botPad  = Platform.OS === "web" ? 24 : insets.bottom + 16;

  const [notifs,  setNotifs]  = useState<Notification[]>(() => getNotifications());
  const [unread,  setUnread]  = useState(() => getUnreadCount());

  useFocusEffect(useCallback(() => {
    setNotifs(getNotifications());
    setUnread(getUnreadCount());
    return subscribeNotifications(() => {
      setNotifs(getNotifications());
      setUnread(getUnreadCount());
    });
  }, []));

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: "#4F46E5", paddingTop: topPad }]}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
          <Feather name="arrow-left" size={20} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { fontFamily: "Inter_700Bold" }]}>Notifications</Text>
          <Text style={[styles.headerSub, { fontFamily: "Inter_400Regular" }]}>{unread > 0 ? `${unread} unread` : "All caught up"}</Text>
        </View>
        {unread > 0 && (
          <TouchableOpacity
            style={[styles.markAllBtn, { backgroundColor: "#ffffff20" }]}
            onPress={() => markAllRead()}
          >
            <Text style={[styles.markAllText, { fontFamily: "Inter_600SemiBold" }]}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: botPad + 24 }}>
        {notifs.length === 0 && (
          <View style={{ alignItems: "center", paddingTop: 80 }}>
            <Feather name="bell-off" size={40} color={colors.mutedForeground} />
            <Text style={{ color: colors.mutedForeground, marginTop: 12, fontFamily: "Inter_400Regular" }}>No notifications</Text>
          </View>
        )}
        {notifs.map((n, i) => (
          <TouchableOpacity
            key={n.id}
            style={[styles.item, {
              backgroundColor: n.read ? colors.background : n.color + "08",
              borderBottomColor: colors.border,
              borderBottomWidth: i < notifs.length - 1 ? 1 : 0,
            }]}
            onPress={() => { if (!n.read) markRead(n.id); }}
            activeOpacity={0.75}
          >
            <View style={[styles.iconWrap, { backgroundColor: n.color + "18" }]}>
              <Feather name={n.icon as any} size={18} color={n.color} />
            </View>
            <View style={{ flex: 1, gap: 3 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Text style={[styles.notifTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]} numberOfLines={1}>{n.title}</Text>
                {!n.read && <View style={[styles.unreadDot, { backgroundColor: "#4F46E5" }]} />}
              </View>
              <Text style={[styles.notifBody, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]} numberOfLines={2}>{n.body}</Text>
              <Text style={[styles.notifTime, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{timeAgo(n.date)}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:        { flex: 1 },
  header:      { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingBottom: 16 },
  headerTitle: { fontSize: 20, color: "#fff" },
  headerSub:   { fontSize: 12, color: "#c7d2fe", marginTop: 1 },
  markAllBtn:  { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  markAllText: { color: "#fff", fontSize: 12 },
  item:        { flexDirection: "row", alignItems: "flex-start", gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  iconWrap:    { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center", marginTop: 2 },
  notifTitle:  { fontSize: 14, flex: 1 },
  unreadDot:   { width: 7, height: 7, borderRadius: 4 },
  notifBody:   { fontSize: 13, lineHeight: 18 },
  notifTime:   { fontSize: 11, marginTop: 1 },
});
