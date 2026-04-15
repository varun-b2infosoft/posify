import React, { useEffect, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import CustomerBottomNav from "@/components/CustomerBottomNav";
import {
  CUSTOMER_PRIMARY,
  CUSTOMER_AMBER,
  getCustomerOrders,
  subscribeCustomerApp,
  CustomerOrder,
  OrderStatus,
} from "@/store/customerApp";

type Filter = "all" | "active" | "delivered" | "cancelled";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all",       label: "All"       },
  { key: "active",    label: "Active"    },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
];

const STATUS_LABEL: Record<OrderStatus, string> = {
  placed:           "Order Placed",
  preparing:        "Preparing",
  out_for_delivery: "Out for Delivery",
  delivered:        "Delivered",
  cancelled:        "Cancelled",
};

const STATUS_COLOR: Record<OrderStatus, string> = {
  placed:           "#3B82F6",
  preparing:        CUSTOMER_AMBER,
  out_for_delivery: CUSTOMER_PRIMARY,
  delivered:        CUSTOMER_PRIMARY,
  cancelled:        "#EF4444",
};

function timeAgo(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60)       return "just now";
  if (diff < 3600)     return Math.floor(diff / 60) + "m ago";
  if (diff < 86400)    return Math.floor(diff / 3600) + "h ago";
  return Math.floor(diff / 86400) + "d ago";
}

export default function CustomerOrdersScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 60 : insets.top;

  const [orders, setOrders] = useState<CustomerOrder[]>(getCustomerOrders());
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    return subscribeCustomerApp(() => setOrders(getCustomerOrders()));
  }, []);

  const filtered = orders.filter((o) => {
    if (filter === "active")    return o.status !== "delivered" && o.status !== "cancelled";
    if (filter === "delivered") return o.status === "delivered";
    if (filter === "cancelled") return o.status === "cancelled";
    return true;
  });

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: CUSTOMER_PRIMARY, paddingTop: topPad + 10 }]}>
        <TouchableOpacity onPress={() => router.push("/customer" as any)} style={{ padding: 4 }}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { fontFamily: "Inter_700Bold" }]}>My Orders</Text>
          <Text style={[styles.headerSub, { fontFamily: "Inter_400Regular" }]}>
            {orders.length} orders total
          </Text>
        </View>
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.filterBar, { backgroundColor: colors.background, borderBottomColor: colors.border }]}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10, gap: 8 }}
      >
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              style={[
                styles.chip,
                {
                  backgroundColor: active ? CUSTOMER_PRIMARY : colors.card,
                  borderColor:     active ? CUSTOMER_PRIMARY : colors.border,
                },
              ]}
              onPress={() => setFilter(f.key)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.chipText,
                  {
                    color:      active ? "#fff" : colors.foreground,
                    fontFamily: active ? "Inter_700Bold" : "Inter_400Regular",
                  },
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Feather name="package" size={44} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
              No orders yet
            </Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Start shopping from your favourite shops
            </Text>
            <TouchableOpacity
              style={[styles.shopNowBtn, { backgroundColor: CUSTOMER_PRIMARY }]}
              onPress={() => router.push("/customer/shops" as any)}
            >
              <Feather name="shopping-bag" size={16} color="#fff" />
              <Text style={[styles.shopNowText, { fontFamily: "Inter_700Bold" }]}>Order Now</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filtered.map((order) => {
            const isActive = order.status !== "delivered" && order.status !== "cancelled";
            const color    = STATUS_COLOR[order.status];
            return (
              <TouchableOpacity
                key={order.id}
                style={[styles.orderCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => router.push(("/customer/track?id=" + order.id) as any)}
                activeOpacity={0.8}
              >
                {/* Top row */}
                <View style={styles.cardTop}>
                  <View style={[styles.shopIcon, { backgroundColor: CUSTOMER_PRIMARY + "18" }]}>
                    <Feather name="shopping-bag" size={20} color={CUSTOMER_PRIMARY} />
                  </View>
                  <View style={{ flex: 1, gap: 3 }}>
                    <Text style={[styles.shopName, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                      {order.shopName}
                    </Text>
                    <Text style={[styles.orderMeta, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                      {order.orderNo} · {order.items.length} items · {timeAgo(order.createdAt)}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: color + "18" }]}>
                    <Text style={[styles.statusText, { color, fontFamily: "Inter_600SemiBold" }]}>
                      {STATUS_LABEL[order.status]}
                    </Text>
                  </View>
                </View>

                {/* Items preview */}
                <Text style={[styles.itemsPreview, { color: colors.mutedForeground, fontFamily: "Inter_400Regular", borderTopColor: colors.border }]}>
                  {order.items.map(i => `${i.name} ×${i.qty}`).join("  ·  ")}
                </Text>

                {/* Footer */}
                <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
                  <View style={{ gap: 2 }}>
                    <Text style={[styles.totalAmt, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                      ₹{order.total}
                    </Text>
                    <Text style={[styles.payMode, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                      {order.paymentMode} · {order.deliveryType === "delivery" ? "Delivery" : "Pickup"}
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                    {isActive && (
                      <View style={[styles.trackBtn, { backgroundColor: CUSTOMER_PRIMARY + "18" }]}>
                        <Feather name="map-pin" size={13} color={CUSTOMER_PRIMARY} />
                        <Text style={[styles.trackBtnText, { color: CUSTOMER_PRIMARY, fontFamily: "Inter_600SemiBold" }]}>
                          Track
                        </Text>
                      </View>
                    )}
                    {order.pointsEarned > 0 && (
                      <Text style={[styles.pointsEarned, { color: CUSTOMER_AMBER, fontFamily: "Inter_600SemiBold" }]}>
                        +{order.pointsEarned} ⭐
                      </Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      <CustomerBottomNav activeTab="orders" />
    </View>
  );
}

const styles = StyleSheet.create({
  root:          { flex: 1 },
  header:        { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingBottom: 18 },
  headerTitle:   { color: "#fff", fontSize: 18 },
  headerSub:     { color: "rgba(255,255,255,0.8)", fontSize: 12 },
  filterBar:     { borderBottomWidth: 1 },
  chip:          { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  chipText:      { fontSize: 13 },
  empty:         { alignItems: "center", gap: 12, paddingVertical: 80 },
  emptyTitle:    { fontSize: 18 },
  emptyText:     { fontSize: 14, textAlign: "center" },
  shopNowBtn:    { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, marginTop: 8 },
  shopNowText:   { color: "#fff", fontSize: 14 },
  orderCard:     { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  cardTop:       { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  shopIcon:      { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  shopName:      { fontSize: 14 },
  orderMeta:     { fontSize: 12 },
  statusBadge:   { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText:    { fontSize: 11 },
  itemsPreview:  { fontSize: 12, paddingHorizontal: 14, paddingVertical: 10, borderTopWidth: 1 },
  cardFooter:    { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 12, borderTopWidth: 1 },
  totalAmt:      { fontSize: 16 },
  payMode:       { fontSize: 11 },
  trackBtn:      { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  trackBtnText:  { fontSize: 12 },
  pointsEarned:  { fontSize: 13 },
});
