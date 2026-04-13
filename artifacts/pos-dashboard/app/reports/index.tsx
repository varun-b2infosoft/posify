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
import { getExpenses } from "@/store/expenses";
import { getInvoices } from "@/store/invoices";
import { getProducts } from "@/store/products";

type Period = "Today" | "Week" | "Month";
const PERIODS: Period[] = ["Today", "Week", "Month"];

const DAILY_SALES = [28400, 41200, 35600, 38900, 72400, 52100, 44800];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const CAT_DATA = [
  { label: "Food & Bev",   value: 34, color: "#4F46E5" },
  { label: "Clothing",     value: 22, color: "#10B981" },
  { label: "Electronics",  value: 18, color: "#F59E0B" },
  { label: "Home & Living",value: 14, color: "#EC4899" },
  { label: "Beauty",       value: 8,  color: "#8B5CF6" },
  { label: "Other",        value: 4,  color: "#6B7280" },
];

const BAR_MAX_H = 64;
function MiniBarChart({ data, days, color }: { data: number[]; days: string[]; color: string }) {
  const mx = Math.max(...data);
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 4, height: BAR_MAX_H + 18 }}>
      {data.map((v, i) => {
        const barH = Math.max(4, Math.round((v / mx) * BAR_MAX_H));
        return (
          <View key={i} style={{ flex: 1, alignItems: "center", gap: 4, justifyContent: "flex-end", height: BAR_MAX_H + 18 }}>
            <View style={{ width: "72%", height: barH, backgroundColor: color, borderRadius: 4, opacity: i === data.length - 1 ? 1 : 0.5 }} />
            <Text style={{ fontSize: 9, color: "#6B7280", fontFamily: "Inter_400Regular" }}>{days[i]}</Text>
          </View>
        );
      })}
    </View>
  );
}

function DonutBar({ item }: { item: typeof CAT_DATA[0] }) {
  return (
    <View style={{ gap: 4, marginBottom: 8 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={{ fontSize: 12, color: "#374151", fontFamily: "Inter_500Medium" }}>{item.label}</Text>
        <Text style={{ fontSize: 12, color: item.color, fontFamily: "Inter_700Bold" }}>{item.value}%</Text>
      </View>
      <View style={{ height: 6, backgroundColor: "#F3F4F6", borderRadius: 3 }}>
        <View style={{ height: 6, width: `${item.value}%`, backgroundColor: item.color, borderRadius: 3 }} />
      </View>
    </View>
  );
}

export default function ReportsScreen() {
  const colors  = useColors();
  const insets  = useSafeAreaInsets();
  const topPad  = Platform.OS === "web" ? 67 : insets.top;
  const botPad  = Platform.OS === "web" ? 24 : insets.bottom + 16;

  const [period, setPeriod] = useState<Period>("Month");

  const invoices  = getInvoices();
  const expenses  = getExpenses();
  const products  = getProducts();

  const totalSales = period === "Today"
    ? 72400
    : period === "Week"
    ? 313400
    : 1044800;
  const totalPurchases = period === "Today" ? 14200 : period === "Week" ? 88000 : 312000;
  const totalExpenses  = period === "Today" ? 3200  : period === "Week" ? 18400 : 73200;
  const netProfit      = totalSales - totalPurchases - totalExpenses;

  const topProducts = [
    { name: "Basmati Rice",     sales: 84, revenue: 41916 },
    { name: "iPhone Case Pro",  sales: 62, revenue: 55738 },
    { name: "Linen Kurta Set",  sales: 44, revenue: 57156 },
    { name: "Herbal Face Cream",sales: 38, revenue: 45562 },
    { name: "Mixed Dry Fruits", sales: 31, revenue: 27869 },
  ];
  const leastProducts = [
    { name: "Crystal Candle Set", sales: 4, revenue: 2600 },
    { name: "Travel Pillow",      sales: 6, revenue: 1794 },
    { name: "Wooden Platter",     sales: 7, revenue: 8050 },
  ];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: "#4F46E5", paddingTop: topPad }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { fontFamily: "Inter_700Bold" }]}>Reports & Analytics</Text>
          <Text style={[styles.headerSub, { fontFamily: "Inter_400Regular" }]}>Business performance overview</Text>
        </View>
        <Feather name="download" size={18} color="#fff" />
      </View>

      <View style={[styles.periodBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        {PERIODS.map(p => (
          <TouchableOpacity
            key={p}
            style={[styles.periodBtn, period === p && { backgroundColor: "#4F46E5" }]}
            onPress={() => setPeriod(p)}
          >
            <Text style={[styles.periodText, { fontFamily: "Inter_600SemiBold", color: period === p ? "#fff" : colors.mutedForeground }]}>{p}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: botPad + 24 }}>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Revenue & Profit</Text>
          <View style={styles.profitGrid}>
            {[
              { label: "Total Sales",     val: totalSales,     color: "#4F46E5" },
              { label: "Purchases",       val: totalPurchases, color: "#F59E0B" },
              { label: "Expenses",        val: totalExpenses,  color: "#EF4444" },
              { label: "Net Profit",      val: netProfit,      color: "#10B981", big: true },
            ].map(item => (
              <View key={item.label} style={[styles.profitItem, item.big && { borderWidth: 2, borderColor: "#10B98130", backgroundColor: "#10B98108", borderRadius: 10 }]}>
                <Text style={[styles.profitVal, { color: item.color, fontFamily: "Inter_700Bold", fontSize: item.big ? 20 : 17 }]}>
                  ₹{(item.val / 1000).toFixed(0)}k
                </Text>
                <Text style={[styles.profitLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Sales Trend (Last 7 Days)</Text>
          <MiniBarChart data={DAILY_SALES} days={DAYS} color="#4F46E5" />
          <Text style={[styles.chartSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            Avg ₹{Math.round(DAILY_SALES.reduce((s, v) => s + v, 0) / DAILY_SALES.length / 1000)}k/day
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Category Distribution</Text>
          <View style={{ marginTop: 8 }}>
            {CAT_DATA.map(item => <DonutBar key={item.label} item={item} />)}
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Top Selling Products</Text>
          {topProducts.map((p, i) => (
            <View key={p.name} style={[styles.productRow, { borderTopColor: colors.border, borderTopWidth: i === 0 ? 0 : 1 }]}>
              <View style={[styles.rankBadge, { backgroundColor: i === 0 ? "#F59E0B20" : "#4F46E510" }]}>
                <Text style={[styles.rankText, { color: i === 0 ? "#B45309" : "#4F46E5", fontFamily: "Inter_700Bold" }]}>#{i + 1}</Text>
              </View>
              <Text style={[styles.prodName, { color: colors.foreground, fontFamily: "Inter_500Medium" }]} numberOfLines={1}>{p.name}</Text>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={[styles.prodRev, { color: "#4F46E5", fontFamily: "Inter_700Bold" }]}>₹{(p.revenue / 1000).toFixed(0)}k</Text>
                <Text style={[styles.prodSales, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{p.sales} sold</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Least Selling Products</Text>
          {leastProducts.map((p, i) => (
            <View key={p.name} style={[styles.productRow, { borderTopColor: colors.border, borderTopWidth: i === 0 ? 0 : 1 }]}>
              <View style={[styles.rankBadge, { backgroundColor: "#EF444410" }]}>
                <Feather name="trending-down" size={12} color="#EF4444" />
              </View>
              <Text style={[styles.prodName, { color: colors.foreground, fontFamily: "Inter_500Medium" }]} numberOfLines={1}>{p.name}</Text>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={[styles.prodRev, { color: "#EF4444", fontFamily: "Inter_700Bold" }]}>₹{(p.revenue / 1000).toFixed(1)}k</Text>
                <Text style={[styles.prodSales, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{p.sales} sold</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Shop Performance</Text>
          {[
            { name: "Main Store",   sales: 72400,  pct: 50, color: "#4F46E5" },
            { name: "North Branch", sales: 38200,  pct: 26, color: "#10B981" },
            { name: "East Outlet",  sales: 21500,  pct: 15, color: "#F59E0B" },
            { name: "Airport Kiosk",sales: 12800,  pct: 9,  color: "#EF4444" },
          ].map((s, i) => (
            <View key={s.name} style={[styles.shopRow, { borderTopColor: colors.border, borderTopWidth: i === 0 ? 0 : 1 }]}>
              <View style={[styles.shopDot, { backgroundColor: s.color }]} />
              <Text style={[styles.shopName, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>{s.name}</Text>
              <Text style={[styles.shopSales, { color: s.color, fontFamily: "Inter_700Bold" }]}>₹{(s.sales / 1000).toFixed(0)}k</Text>
              <Text style={[styles.shopPct, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{s.pct}%</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:        { flex: 1 },
  header:      { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingBottom: 16 },
  backBtn:     { padding: 4 },
  headerTitle: { fontSize: 20, color: "#fff" },
  headerSub:   { fontSize: 12, color: "#c7d2fe", marginTop: 1 },
  periodBar:   { flexDirection: "row", paddingHorizontal: 16, paddingVertical: 10, gap: 8, borderBottomWidth: 1 },
  periodBtn:   { flex: 1, paddingVertical: 7, borderRadius: 20, alignItems: "center" },
  periodText:  { fontSize: 13 },
  card:        { borderRadius: 14, borderWidth: 1, padding: 16, gap: 12 },
  cardTitle:   { fontSize: 15, marginBottom: 0 },
  chartSub:    { fontSize: 11, textAlign: "center", marginTop: 4 },
  profitGrid:  { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  profitItem:  { width: "47%", padding: 10, alignItems: "center", gap: 3 },
  profitVal:   { fontSize: 17 },
  profitLabel: { fontSize: 11, textAlign: "center" },
  productRow:  { flexDirection: "row", alignItems: "center", paddingVertical: 10, gap: 10 },
  rankBadge:   { width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  rankText:    { fontSize: 11 },
  prodName:    { flex: 1, fontSize: 13 },
  prodRev:     { fontSize: 13 },
  prodSales:   { fontSize: 11 },
  shopRow:     { flexDirection: "row", alignItems: "center", paddingVertical: 10, gap: 10 },
  shopDot:     { width: 10, height: 10, borderRadius: 5 },
  shopName:    { flex: 1, fontSize: 13 },
  shopSales:   { fontSize: 13 },
  shopPct:     { fontSize: 12, minWidth: 30, textAlign: "right" },
});
