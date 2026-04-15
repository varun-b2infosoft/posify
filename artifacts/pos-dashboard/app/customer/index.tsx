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
  getCustomerProfile,
  getPendingOrders,
  subscribeCustomerApp,
  CustomerProfile,
  CustomerOrder,
} from "@/store/customerApp";

const QUICK_ACTIONS = [
  { icon: "shopping-bag", label: "Order Now",    route: "/customer/shops"    },
  { icon: "package",      label: "My Orders",    route: "/customer/orders"   },
  { icon: "credit-card",  label: "Wallet",       route: "/customer/wallet"   },
  { icon: "star",         label: "Loyalty Pts",  route: "/customer/loyalty"  },
];

const FREQUENT_ITEMS = [
  { id: "16", name: "Basmati Rice",   price: 89,   icon: "🌾", color: "#FEF3C7" },
  { id: "17", name: "Olive Oil",      price: 450,  icon: "🫒", color: "#D1FAE5" },
  { id: "8",  name: "Face Cream",     price: 1199, icon: "🧴", color: "#FCE7F3" },
  { id: "11", name: "Espresso Pods",  price: 349,  icon: "☕", color: "#FEF3C7" },
  { id: "5",  name: "Python Book",    price: 799,  icon: "📘", color: "#DBEAFE" },
  { id: "7",  name: "Fitness Gloves", price: 549,  icon: "🥊", color: "#EDE9FE" },
];

function greetingWord(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function fmt(n: number) {
  if (n >= 1000) return "₹" + (n / 1000).toFixed(1) + "k";
  return "₹" + n;
}

export default function CustomerHomeScreen() {
  const colors  = useColors();
  const insets  = useSafeAreaInsets();
  const topPad  = Platform.OS === "web" ? 60 : insets.top;

  const [profile, setProfile]   = useState<CustomerProfile>(getCustomerProfile());
  const [pending, setPending]   = useState<CustomerOrder[]>(getPendingOrders());

  useEffect(() => {
    return subscribeCustomerApp(() => {
      setProfile(getCustomerProfile());
      setPending(getPendingOrders());
    });
  }, []);

  const stats = [
    { label: "Total Spent", value: fmt(profile.totalSpent),    icon: "trending-up", color: CUSTOMER_PRIMARY,  bg: CUSTOMER_PRIMARY + "15" },
    { label: "Wallet",      value: "₹" + profile.walletBalance, icon: "credit-card", color: "#3B82F6",          bg: "#3B82F615"              },
    { label: "Points ⭐",   value: profile.loyaltyPoints + "",  icon: "star",        color: CUSTOMER_AMBER,     bg: CUSTOMER_AMBER + "20"    },
    { label: "Pending",     value: pending.length + " orders",  icon: "clock",       color: "#EF4444",          bg: "#EF444415"              },
  ];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: CUSTOMER_PRIMARY, paddingTop: topPad + 10 }]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.greeting, { fontFamily: "Inter_400Regular" }]}>
            {greetingWord()}, 👋
          </Text>
          <Text style={[styles.name, { fontFamily: "Inter_700Bold" }]}>
            {profile.name}
          </Text>
          <TouchableOpacity style={styles.locationPill} activeOpacity={0.7}>
            <Feather name="map-pin" size={12} color="rgba(255,255,255,0.8)" />
            <Text style={[styles.locationText, { fontFamily: "Inter_400Regular" }]}>
              {profile.location}
            </Text>
            <Feather name="chevron-down" size={12} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
        </View>
        <View style={styles.avatarWrap}>
          <Text style={styles.avatarText}>
            {profile.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Stat cards */}
        <View style={styles.statsGrid}>
          {stats.map((s) => (
            <View
              key={s.label}
              style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={[styles.statIcon, { backgroundColor: s.bg }]}>
                <Feather name={s.icon as any} size={18} color={s.color} />
              </View>
              <Text style={[styles.statValue, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                {s.value}
              </Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                {s.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Quick actions */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            Quick Actions
          </Text>
          <View style={styles.actionsRow}>
            {QUICK_ACTIONS.map((a) => (
              <TouchableOpacity
                key={a.label}
                style={styles.actionItem}
                onPress={() => router.push(a.route as any)}
                activeOpacity={0.7}
              >
                <View style={[styles.actionIcon, { backgroundColor: CUSTOMER_PRIMARY + "18" }]}>
                  <Feather name={a.icon as any} size={22} color={CUSTOMER_PRIMARY} />
                </View>
                <Text style={[styles.actionLabel, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
                  {a.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Active orders */}
        {pending.length > 0 && (
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                Active Orders
              </Text>
              <TouchableOpacity onPress={() => router.push("/customer/orders" as any)}>
                <Text style={[styles.seeAll, { color: CUSTOMER_PRIMARY, fontFamily: "Inter_600SemiBold" }]}>
                  See all
                </Text>
              </TouchableOpacity>
            </View>
            {pending.map((order) => {
              const statusLabel: Record<string, string> = {
                placed:           "Order Placed",
                preparing:        "Preparing",
                out_for_delivery: "Out for Delivery",
              };
              const statusColor: Record<string, string> = {
                placed:           "#3B82F6",
                preparing:        CUSTOMER_AMBER,
                out_for_delivery: CUSTOMER_PRIMARY,
              };
              return (
                <TouchableOpacity
                  key={order.id}
                  style={[styles.orderCard, { borderColor: colors.border }]}
                  onPress={() => router.push(("/customer/track?id=" + order.id) as any)}
                  activeOpacity={0.8}
                >
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={[styles.orderNo, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                      {order.orderNo}
                    </Text>
                    <Text style={[styles.orderShop, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                      {order.shopName} · {order.items.length} items · ₹{order.total}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: (statusColor[order.status] || "#6B7280") + "18" }]}>
                    <Text style={[styles.statusText, { color: statusColor[order.status] || "#6B7280", fontFamily: "Inter_600SemiBold" }]}>
                      {statusLabel[order.status] || order.status}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Frequently ordered */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
              Order Again
            </Text>
            <Text style={[styles.seeAll, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Frequently bought
            </Text>
          </View>
          <View style={styles.frequentGrid}>
            {FREQUENT_ITEMS.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.frequentCard, { backgroundColor: item.color }]}
                onPress={() => router.push("/customer/shops" as any)}
                activeOpacity={0.8}
              >
                <Text style={styles.frequentIcon}>{item.icon}</Text>
                <Text style={[styles.frequentName, { fontFamily: "Inter_600SemiBold" }]}>
                  {item.name}
                </Text>
                <Text style={[styles.frequentPrice, { fontFamily: "Inter_700Bold" }]}>
                  ₹{item.price}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Referral banner */}
        <TouchableOpacity
          style={[styles.referralBanner, { backgroundColor: CUSTOMER_PRIMARY }]}
          onPress={() => router.push("/customer/referral" as any)}
          activeOpacity={0.85}
        >
          <View>
            <Text style={[styles.referralTitle, { fontFamily: "Inter_700Bold" }]}>
              🎁 Invite friends, earn ₹50 each!
            </Text>
            <Text style={[styles.referralSub, { fontFamily: "Inter_400Regular" }]}>
              Your code: {profile.referralCode}
            </Text>
          </View>
          <Feather name="share-2" size={20} color="#fff" />
        </TouchableOpacity>
      </ScrollView>

      <CustomerBottomNav activeTab="home" />
    </View>
  );
}

const styles = StyleSheet.create({
  root:           { flex: 1 },
  header:         { paddingHorizontal: 20, paddingBottom: 20, flexDirection: "row", alignItems: "flex-end" },
  greeting:       { color: "rgba(255,255,255,0.8)", fontSize: 13 },
  name:           { color: "#fff", fontSize: 22, marginTop: 2 },
  locationPill:   { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 8, backgroundColor: "rgba(255,255,255,0.18)", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, alignSelf: "flex-start" },
  locationText:   { color: "rgba(255,255,255,0.9)", fontSize: 12 },
  avatarWrap:     { width: 52, height: 52, borderRadius: 26, backgroundColor: "rgba(255,255,255,0.25)", alignItems: "center", justifyContent: "center", marginLeft: 12 },
  avatarText:     { color: "#fff", fontSize: 18, fontWeight: "700" },
  content:        { padding: 16, gap: 16 },
  statsGrid:      { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statCard:       { width: "47%", borderRadius: 14, borderWidth: 1, padding: 14, gap: 6, alignItems: "center" },
  statIcon:       { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  statValue:      { fontSize: 18, textAlign: "center" },
  statLabel:      { fontSize: 11, textAlign: "center" },
  section:        { borderRadius: 16, borderWidth: 1, padding: 16, gap: 12 },
  sectionHeader:  { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sectionTitle:   { fontSize: 16 },
  seeAll:         { fontSize: 13 },
  actionsRow:     { flexDirection: "row", justifyContent: "space-between" },
  actionItem:     { alignItems: "center", gap: 8, flex: 1 },
  actionIcon:     { width: 52, height: 52, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  actionLabel:    { fontSize: 11, textAlign: "center" },
  orderCard:      { flexDirection: "row", alignItems: "center", paddingTop: 10, borderTopWidth: 1 },
  orderNo:        { fontSize: 14 },
  orderShop:      { fontSize: 12 },
  statusBadge:    { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  statusText:     { fontSize: 11 },
  frequentGrid:   { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  frequentCard:   { width: "30%", borderRadius: 14, padding: 12, gap: 4, alignItems: "center" },
  frequentIcon:   { fontSize: 24 },
  frequentName:   { fontSize: 11, textAlign: "center", color: "#1F2937" },
  frequentPrice:  { fontSize: 12, color: "#1F2937" },
  referralBanner: { borderRadius: 16, padding: 18, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  referralTitle:  { color: "#fff", fontSize: 15, marginBottom: 4 },
  referralSub:    { color: "rgba(255,255,255,0.85)", fontSize: 13 },
});
