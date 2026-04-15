import React, { useCallback, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { useColors } from "@/hooks/useColors";
import {
  DeliveryOrder,
  DeliveryStatus,
  getDeliveryOrders,
  subscribeDeliveryOrders,
  pendingDeliveryCount,
} from "@/store/deliveryOrders";

const STATUS_CONFIG: Record<DeliveryStatus, { label: string; color: string; bg: string; icon: string }> = {
  pending:   { label: "Pending",   color: "#D97706", bg: "#F59E0B18", icon: "clock"        },
  completed: { label: "Delivered", color: "#059669", bg: "#10B98118", icon: "check-circle"  },
  cancelled: { label: "Cancelled", color: "#DC2626", bg: "#EF444418", icon: "x-circle"      },
};

function formatTime(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function isOldPending(order: DeliveryOrder): boolean {
  return order.status === "pending" && Date.now() - order.createdAt > 2 * 60 * 60 * 1000;
}

const FILTERS: Array<{ key: DeliveryStatus | "all"; label: string }> = [
  { key: "all",       label: "All"       },
  { key: "pending",   label: "Pending"   },
  { key: "completed", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
];

export default function DeliveryListScreen() {
  const colors  = useColors();
  const insets  = useSafeAreaInsets();
  const topPad  = Platform.OS === "web" ? 67 : insets.top;
  const botPad  = Platform.OS === "web" ? 0  : insets.bottom;
  const TAB_H   = Platform.OS === "web" ? 84 : 49;

  const [orders,  setOrders]  = useState<DeliveryOrder[]>(() => getDeliveryOrders());
  const [search,  setSearch]  = useState("");
  const [filter,  setFilter]  = useState<DeliveryStatus | "all">("all");

  useFocusEffect(useCallback(() => {
    setOrders(getDeliveryOrders());
    return subscribeDeliveryOrders(() => setOrders(getDeliveryOrders()));
  }, []));

  const filtered = orders.filter((o) => {
    if (filter !== "all" && o.status !== filter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      o.customer.name.toLowerCase().includes(q) ||
      o.customer.phone.includes(q) ||
      o.orderNo.toLowerCase().includes(q)
    );
  });

  const pendingCount = orders.filter(o => o.status === "pending").length;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { fontFamily: "Inter_700Bold" }]}>Delivery Orders</Text>
          {pendingCount > 0 && (
            <Text style={[styles.headerSub, { fontFamily: "Inter_400Regular" }]}>
              {pendingCount} pending delivery{pendingCount !== 1 ? "s" : ""}
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={[styles.posBtn, { backgroundColor: "rgba(255,255,255,0.18)" }]}
          onPress={() => router.push("/(tabs)/pos" as any)}
        >
          <Feather name="shopping-cart" size={15} color="#fff" />
          <Text style={[styles.posBtnText, { fontFamily: "Inter_600SemiBold" }]}>POS</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={[styles.searchRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Feather name="search" size={15} color={colors.mutedForeground} />
        <TextInput
          style={[styles.searchInput, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
          placeholder="Search by name, phone, order no…"
          placeholderTextColor={colors.mutedForeground}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Feather name="x" size={14} color={colors.mutedForeground} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {FILTERS.map((f) => {
          const active = filter === f.key;
          const cnt = f.key === "all" ? orders.length : orders.filter(o => o.status === f.key).length;
          return (
            <TouchableOpacity
              key={f.key}
              onPress={() => setFilter(f.key)}
              style={[
                styles.filterTab,
                { backgroundColor: active ? colors.primary : colors.card, borderColor: active ? colors.primary : colors.border },
              ]}
            >
              <Text style={[styles.filterLabel, {
                color: active ? "#fff" : colors.foreground,
                fontFamily: active ? "Inter_600SemiBold" : "Inter_400Regular",
              }]}>
                {f.label}
              </Text>
              <View style={[styles.filterBadge, { backgroundColor: active ? "rgba(255,255,255,0.25)" : colors.secondary }]}>
                <Text style={[styles.filterBadgeText, { color: active ? "#fff" : colors.mutedForeground, fontFamily: "Inter_700Bold" }]}>
                  {cnt}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* List */}
      <ScrollView
        contentContainerStyle={[styles.list, { paddingBottom: TAB_H + botPad + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Feather name="truck" size={40} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
              No delivery orders
            </Text>
            <Text style={[styles.emptySub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Mark orders as "Delivery Order" during POS checkout.
            </Text>
          </View>
        ) : (
          filtered.map((order) => {
            const st    = STATUS_CONFIG[order.status];
            const old   = isOldPending(order);
            const large = order.total >= 2000;
            return (
              <TouchableOpacity
                key={order.id}
                style={[
                  styles.card,
                  {
                    backgroundColor: colors.card,
                    borderColor: old ? "#EF444430" : colors.border,
                    borderLeftWidth: 3,
                    borderLeftColor: old ? "#EF4444" : large && order.status === "pending" ? "#F59E0B" : st.color,
                  },
                ]}
                onPress={() => router.push(`/delivery/${order.id}` as any)}
                activeOpacity={0.85}
              >
                {/* Top row */}
                <View style={styles.cardTop}>
                  <Text style={[styles.orderNo, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>
                    {order.orderNo}
                  </Text>
                  <View style={[styles.statusBadge, { backgroundColor: st.bg }]}>
                    <Feather name={st.icon as any} size={11} color={st.color} />
                    <Text style={[styles.statusText, { color: st.color, fontFamily: "Inter_600SemiBold" }]}>
                      {st.label}
                    </Text>
                  </View>
                  {old && (
                    <View style={[styles.alertBadge, { backgroundColor: "#EF444415" }]}>
                      <Feather name="clock" size={10} color="#EF4444" />
                      <Text style={[styles.alertText, { color: "#EF4444", fontFamily: "Inter_600SemiBold" }]}>Waiting</Text>
                    </View>
                  )}
                </View>

                {/* Customer row */}
                <View style={styles.customerRow}>
                  <View style={[styles.avatar, { backgroundColor: colors.primary + "20" }]}>
                    <Text style={[styles.avatarText, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>
                      {order.customer.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.customerName, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                      {order.customer.name}
                    </Text>
                    <Text style={[styles.customerPhone, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                      {order.customer.phone}
                    </Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={[styles.totalAmt, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>
                      ₹{order.total.toLocaleString()}
                    </Text>
                    <Text style={[styles.itemCount, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                      {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                    </Text>
                  </View>
                </View>

                {/* Address + time row */}
                {order.customer.address ? (
                  <View style={styles.metaRow}>
                    <Feather name="map-pin" size={11} color={colors.mutedForeground} />
                    <Text style={[styles.metaText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]} numberOfLines={1}>
                      {order.customer.address}
                    </Text>
                  </View>
                ) : null}

                {/* Due + time */}
                <View style={[styles.bottomRow]}>
                  {order.dueAmount > 0 ? (
                    <View style={[styles.dueBadge, { backgroundColor: "#EF444412" }]}>
                      <Text style={[styles.dueText, { color: "#EF4444", fontFamily: "Inter_600SemiBold" }]}>
                        Due ₹{order.dueAmount.toLocaleString()}
                      </Text>
                    </View>
                  ) : order.status === "completed" ? (
                    <View style={[styles.dueBadge, { backgroundColor: "#10B98112" }]}>
                      <Text style={[styles.dueText, { color: "#10B981", fontFamily: "Inter_600SemiBold" }]}>Fully Paid</Text>
                    </View>
                  ) : (
                    <View />
                  )}
                  <Text style={[styles.timeText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                    {formatTime(order.createdAt)}
                  </Text>
                </View>

                {/* Action row */}
                {order.status === "pending" && (
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={[styles.viewBtn, { borderColor: colors.border }]}
                      onPress={() => router.push(`/delivery/${order.id}` as any)}
                    >
                      <Feather name="eye" size={13} color={colors.foreground} />
                      <Text style={[styles.viewBtnText, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>View</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.deliverBtn, { backgroundColor: colors.primary }]}
                      onPress={() => router.push(`/delivery/${order.id}` as any)}
                    >
                      <Feather name="truck" size={13} color="#fff" />
                      <Text style={[styles.deliverBtnText, { fontFamily: "Inter_700Bold" }]}>Deliver</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  header: {
    flexDirection: "row", alignItems: "flex-end",
    paddingHorizontal: 16, paddingBottom: 12, gap: 10,
  },
  backBtn: { padding: 3 },
  headerTitle: { color: "#fff", fontSize: 18 },
  headerSub:   { color: "rgba(255,255,255,0.75)", fontSize: 12 },
  posBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  posBtnText: { color: "#fff", fontSize: 13 },

  searchRow: {
    flexDirection: "row", alignItems: "center", gap: 9,
    marginHorizontal: 12, marginTop: 10, marginBottom: 6,
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9, borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 14 },

  filterRow: { paddingHorizontal: 12, paddingVertical: 6, gap: 7 },
  filterTab: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1 },
  filterLabel: { fontSize: 12 },
  filterBadge: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 8, minWidth: 18, alignItems: "center" },
  filterBadgeText: { fontSize: 10 },

  list: { paddingHorizontal: 12, paddingTop: 10, gap: 10 },

  empty: { alignItems: "center", justifyContent: "center", gap: 12, paddingTop: 80 },
  emptyTitle: { fontSize: 17 },
  emptySub: { fontSize: 13, textAlign: "center" },

  card: {
    borderRadius: 14, borderWidth: 1, padding: 14, gap: 10,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 8 },
  orderNo: { fontSize: 13, flex: 1 },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusText: { fontSize: 11 },
  alertBadge: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  alertText: { fontSize: 10 },

  customerRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 15 },
  customerName: { fontSize: 14 },
  customerPhone: { fontSize: 12, marginTop: 1 },
  totalAmt: { fontSize: 15 },
  itemCount: { fontSize: 11, marginTop: 1 },

  metaRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  metaText: { fontSize: 12, flex: 1 },

  bottomRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  dueBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 7 },
  dueText: { fontSize: 12 },
  timeText: { fontSize: 11 },

  actionRow: { flexDirection: "row", gap: 8, marginTop: 2 },
  viewBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 5, borderWidth: 1, borderRadius: 10, paddingVertical: 9,
  },
  viewBtnText: { fontSize: 13 },
  deliverBtn: {
    flex: 2, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, borderRadius: 10, paddingVertical: 9,
  },
  deliverBtnText: { color: "#fff", fontSize: 13 },
});
