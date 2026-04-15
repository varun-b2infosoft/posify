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
  getCustomerOrders,
  getLoyaltyByShop,
  subscribeCustomerApp,
} from "@/store/customerApp";

type Period = "month" | "3month" | "year";

const CATEGORY_DATA = [
  { name: "Food & Bev",    amount: 4200, color: "#10B981", pct: 34 },
  { name: "Beauty",        amount: 3120, color: "#F472B6", pct: 25 },
  { name: "Clothing",      amount: 2860, color: "#8B5CF6", pct: 23 },
  { name: "Electronics",   amount: 1450, color: "#3B82F6", pct: 12 },
  { name: "Other",         amount:  870, color: "#9CA3AF", pct:  7 },
];

const MONTHLY_BAR = [
  { month: "Nov", amt: 1400 },
  { month: "Dec", amt: 2200 },
  { month: "Jan", amt: 1800 },
  { month: "Feb", amt: 2600 },
  { month: "Mar", amt: 1950 },
  { month: "Apr", amt: 2550 },
];

const TOP_PRODUCTS = [
  { name: "Basmati Rice Premium", amt: 890,  shop: "Main Store",    icon: "🌾" },
  { name: "Herbal Face Cream",    amt: 1199, shop: "Main Store",    icon: "🧴" },
  { name: "Espresso Pods",        amt: 698,  shop: "Main Store",    icon: "☕" },
  { name: "Linen Kurta Set",      amt: 1299, shop: "North Branch",  icon: "👕" },
];

export default function CustomerAnalyticsScreen() {
  const colors  = useColors();
  const insets  = useSafeAreaInsets();
  const topPad  = Platform.OS === "web" ? 60 : insets.top;

  const [period, setPeriod]   = useState<Period>("month");
  const [profile, setProfile] = useState(getCustomerProfile());
  const [orders, setOrders]   = useState(getCustomerOrders());
  const [loyalty, setLoyalty] = useState(getLoyaltyByShop());

  useEffect(() => {
    return subscribeCustomerApp(() => {
      setProfile(getCustomerProfile());
      setOrders(getCustomerOrders());
      setLoyalty(getLoyaltyByShop());
    });
  }, []);

  const maxBar = Math.max(...MONTHLY_BAR.map(b => b.amt));
  const delivered = orders.filter(o => o.status === "delivered");
  const topShop   = loyalty.sort((a, b) => b.totalSpent - a.totalSpent)[0];

  const PERIOD_LABELS: Record<Period, string> = {
    month:  "This Month",
    "3month": "Last 3 Months",
    year:   "This Year",
  };

  const PERIOD_MULT: Record<Period, number> = {
    month: 1, "3month": 3, year: 12,
  };

  const periodSpend  = Math.round(profile.totalSpent / 12 * PERIOD_MULT[period]);
  const periodOrders = Math.round(delivered.length / 12 * PERIOD_MULT[period]);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: "#3B82F6", paddingTop: topPad + 10 }]}>
        <TouchableOpacity onPress={() => router.push("/customer" as any)} style={{ padding: 4 }}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { fontFamily: "Inter_700Bold" }]}>Spending Analytics</Text>
          <Text style={[styles.headerSub, { fontFamily: "Inter_400Regular" }]}>
            Understand your shopping patterns
          </Text>
        </View>
      </View>

      {/* Period filter */}
      <View style={[styles.filterRow, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        {(["month", "3month", "year"] as Period[]).map((p) => {
          const active = period === p;
          return (
            <TouchableOpacity
              key={p}
              style={[
                styles.filterChip,
                { backgroundColor: active ? "#3B82F6" : colors.card, borderColor: active ? "#3B82F6" : colors.border },
              ]}
              onPress={() => setPeriod(p)}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterText, { color: active ? "#fff" : colors.foreground, fontFamily: active ? "Inter_700Bold" : "Inter_400Regular" }]}>
                {PERIOD_LABELS[p]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* Summary cards */}
        <View style={styles.summaryRow}>
          {[
            { label: "Total Spent",    value: "₹" + periodSpend.toLocaleString(),      icon: "trending-up",  color: "#3B82F6" },
            { label: "Orders Placed",  value: String(periodOrders),                     icon: "package",      color: CUSTOMER_PRIMARY },
            { label: "Loyalty Points", value: "⭐ " + profile.loyaltyPoints,            icon: "star",         color: CUSTOMER_AMBER },
            { label: "Top Shop",       value: topShop?.shopName?.split(" ")[0] || "—", icon: "shopping-bag", color: "#8B5CF6" },
          ].map((s) => (
            <View key={s.label} style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.summaryIcon, { backgroundColor: s.color + "15" }]}>
                <Feather name={s.icon as any} size={16} color={s.color} />
              </View>
              <Text style={[styles.summaryVal, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                {s.value}
              </Text>
              <Text style={[styles.summaryLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                {s.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Monthly bar chart */}
        <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            Monthly Spending
          </Text>
          <View style={styles.barChart}>
            {MONTHLY_BAR.map((b) => {
              const height = (b.amt / maxBar) * 120;
              const isLast = b.month === MONTHLY_BAR[MONTHLY_BAR.length - 1].month;
              return (
                <View key={b.month} style={styles.barWrap}>
                  <Text style={[styles.barAmt, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                    {b.amt >= 1000 ? (b.amt / 1000).toFixed(1) + "k" : b.amt}
                  </Text>
                  <View
                    style={[
                      styles.bar,
                      {
                        height,
                        backgroundColor: isLast ? "#3B82F6" : "#3B82F640",
                      },
                    ]}
                  />
                  <Text style={[styles.barLabel, { color: isLast ? colors.foreground : colors.mutedForeground, fontFamily: isLast ? "Inter_700Bold" : "Inter_400Regular" }]}>
                    {b.month}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Category breakdown */}
        <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            Spending by Category
          </Text>
          <View style={{ gap: 10 }}>
            {CATEGORY_DATA.map((cat) => (
              <View key={cat.name} style={styles.catRow}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, width: 130 }}>
                  <View style={[styles.catDot, { backgroundColor: cat.color }]} />
                  <Text style={[styles.catName, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
                    {cat.name}
                  </Text>
                </View>
                <View style={[styles.catBarBg, { backgroundColor: colors.border }]}>
                  <View
                    style={[
                      styles.catBar,
                      { width: cat.pct + "%", backgroundColor: cat.color },
                    ]}
                  />
                </View>
                <Text style={[styles.catAmt, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                  ₹{cat.amount.toLocaleString()}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Most bought products */}
        <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            Most Bought Products
          </Text>
          {TOP_PRODUCTS.map((p, i) => (
            <View key={p.name} style={[styles.topRow, i > 0 && { borderTopColor: colors.border, borderTopWidth: 1 }]}>
              <View style={[styles.topRank, { backgroundColor: i === 0 ? CUSTOMER_AMBER + "20" : colors.background }]}>
                <Text style={styles.topRankEmoji}>{p.icon}</Text>
              </View>
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={[styles.topName, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                  {p.name}
                </Text>
                <Text style={[styles.topShop, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  {p.shop}
                </Text>
              </View>
              <Text style={[styles.topAmt, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                ₹{p.amt.toLocaleString()}
              </Text>
            </View>
          ))}
        </View>

        {/* Shops comparison */}
        <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            Shop Performance
          </Text>
          {loyalty.sort((a, b) => b.totalSpent - a.totalSpent).map((shop, i) => {
            const maxSpent = loyalty.reduce((m, l) => Math.max(m, l.totalSpent), 0);
            const pct = maxSpent > 0 ? (shop.totalSpent / maxSpent) * 100 : 0;
            return (
              <View key={shop.shopId} style={[styles.shopRow, i > 0 && { borderTopColor: colors.border, borderTopWidth: 1 }]}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <View style={[styles.shopIcon, { backgroundColor: CUSTOMER_PRIMARY + "18" }]}>
                    <Feather name="shopping-bag" size={14} color={CUSTOMER_PRIMARY} />
                  </View>
                  <Text style={[styles.shopName, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                    {shop.shopName}
                  </Text>
                  <Text style={[styles.shopAmt, { color: CUSTOMER_PRIMARY, fontFamily: "Inter_700Bold" }]}>
                    ₹{shop.totalSpent.toLocaleString()}
                  </Text>
                </View>
                <View style={[styles.shopBarBg, { backgroundColor: colors.border }]}>
                  <View style={[styles.shopBar, { width: pct + "%", backgroundColor: CUSTOMER_PRIMARY }]} />
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <CustomerBottomNav activeTab="profile" />
    </View>
  );
}

const styles = StyleSheet.create({
  root:         { flex: 1 },
  header:       { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingBottom: 18 },
  headerTitle:  { color: "#fff", fontSize: 18 },
  headerSub:    { color: "rgba(255,255,255,0.85)", fontSize: 12 },
  filterRow:    { flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1 },
  filterChip:   { flex: 1, alignItems: "center", paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  filterText:   { fontSize: 12 },
  summaryRow:   { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  summaryCard:  { width: "47%", borderRadius: 14, borderWidth: 1, padding: 14, gap: 6, alignItems: "center" },
  summaryIcon:  { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  summaryVal:   { fontSize: 15, textAlign: "center" },
  summaryLabel: { fontSize: 11, textAlign: "center" },
  chartCard:    { borderRadius: 16, borderWidth: 1, padding: 16, gap: 14 },
  cardTitle:    { fontSize: 15 },
  barChart:     { flexDirection: "row", alignItems: "flex-end", gap: 6, height: 160, paddingTop: 20 },
  barWrap:      { flex: 1, alignItems: "center", gap: 4 },
  bar:          { width: "100%", borderRadius: 6, minHeight: 4 },
  barAmt:       { fontSize: 10 },
  barLabel:     { fontSize: 11 },
  catRow:       { flexDirection: "row", alignItems: "center", gap: 10 },
  catDot:       { width: 10, height: 10, borderRadius: 5 },
  catName:      { fontSize: 12 },
  catBarBg:     { flex: 1, height: 8, borderRadius: 4, overflow: "hidden" },
  catBar:       { height: 8, borderRadius: 4 },
  catAmt:       { fontSize: 12, minWidth: 50, textAlign: "right" },
  topRow:       { flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 10 },
  topRank:      { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  topRankEmoji: { fontSize: 20 },
  topName:      { fontSize: 13 },
  topShop:      { fontSize: 11 },
  topAmt:       { fontSize: 14 },
  shopRow:      { paddingTop: 10, gap: 4 },
  shopIcon:     { width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  shopName:     { flex: 1, fontSize: 13 },
  shopAmt:      { fontSize: 13 },
  shopBarBg:    { height: 8, borderRadius: 4, overflow: "hidden" },
  shopBar:      { height: 8, borderRadius: 4 },
});
