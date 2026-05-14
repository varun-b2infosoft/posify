import React, { useState } from "react";
import {
  Alert,
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
import { useLayout } from "@/hooks/useLayout";

type Period = "Today" | "Week" | "Month";
const PERIODS: Period[] = ["Today", "Week", "Month"];

const DAILY_SALES = [28400, 41200, 35600, 38900, 72400, 52100, 44800];
const DAYS        = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const CAT_DATA = [
  { label: "Food & Bev",    value: 34, color: "#4F46E5" },
  { label: "Clothing",      value: 22, color: "#10B981" },
  { label: "Electronics",   value: 18, color: "#F59E0B" },
  { label: "Home & Living", value: 14, color: "#EC4899" },
  { label: "Beauty",        value: 8,  color: "#8B5CF6" },
  { label: "Other",         value: 4,  color: "#6B7280" },
];

function BarChart({ data, days, color, maxH = 80 }: { data: number[]; days: string[]; color: string; maxH?: number }) {
  const mx = Math.max(...data);
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 4, height: maxH + 20 }}>
      {data.map((v, i) => {
        const barH = Math.max(4, Math.round((v / mx) * maxH));
        const isLast = i === data.length - 1;
        return (
          <View key={i} style={{ flex: 1, alignItems: "center", gap: 4, justifyContent: "flex-end", height: maxH + 20 }}>
            {isLast && (
              <Text style={{ fontSize: 9, color, fontFamily: "Inter_700Bold" }}>
                ₹{Math.round(v / 1000)}k
              </Text>
            )}
            <View style={{ width: "70%", height: barH, backgroundColor: color, borderRadius: 4, opacity: isLast ? 1 : 0.45 }} />
            <Text style={{ fontSize: 9, color: "#6B7280", fontFamily: "Inter_400Regular" }}>{days[i]}</Text>
          </View>
        );
      })}
    </View>
  );
}

function DonutBar({ item, colors }: { item: typeof CAT_DATA[0]; colors: any }) {
  return (
    <View style={{ gap: 5, marginBottom: 10 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: item.color }} />
          <Text style={{ fontSize: 12, color: colors.foreground, fontFamily: "Inter_500Medium" }}>{item.label}</Text>
        </View>
        <Text style={{ fontSize: 12, color: item.color, fontFamily: "Inter_700Bold" }}>{item.value}%</Text>
      </View>
      <View style={{ height: 6, backgroundColor: colors.secondary, borderRadius: 3 }}>
        <View style={{ height: 6, width: `${item.value}%`, backgroundColor: item.color, borderRadius: 3 }} />
      </View>
    </View>
  );
}

export default function ReportsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 24 : insets.bottom + 16;
  const layout = useLayout();

  const [period, setPeriod] = useState<Period>("Month");

  const totalSales     = period === "Today" ? 72400  : period === "Week" ? 313400  : 1044800;
  const totalPurchases = period === "Today" ? 14200  : period === "Week" ? 88000   : 312000;
  const totalExpenses  = period === "Today" ? 3200   : period === "Week" ? 18400   : 73200;
  const netProfit      = totalSales - totalPurchases - totalExpenses;

  const profitCards = [
    { label: "Total Sales",  val: totalSales,     color: "#4F46E5", icon: "trending-up"  },
    { label: "Purchases",    val: totalPurchases, color: "#F59E0B", icon: "shopping-cart" },
    { label: "Expenses",     val: totalExpenses,  color: "#EF4444", icon: "minus-circle"  },
    { label: "Net Profit",   val: netProfit,      color: "#10B981", icon: "check-circle", big: true },
  ];

  const topProducts = [
    { name: "Basmati Rice",      sales: 84, revenue: 41916 },
    { name: "iPhone Case Pro",   sales: 62, revenue: 55738 },
    { name: "Linen Kurta Set",   sales: 44, revenue: 57156 },
    { name: "Herbal Face Cream", sales: 38, revenue: 45562 },
    { name: "Mixed Dry Fruits",  sales: 31, revenue: 27869 },
  ];
  const leastProducts = [
    { name: "Crystal Candle Set", sales: 4, revenue: 2600 },
    { name: "Travel Pillow",      sales: 6, revenue: 1794 },
    { name: "Wooden Platter",     sales: 7, revenue: 8050 },
  ];
  const shops = [
    { name: "Main Store",    sales: 72400, pct: 50, color: "#4F46E5" },
    { name: "North Branch",  sales: 38200, pct: 26, color: "#10B981" },
    { name: "East Outlet",   sales: 21500, pct: 15, color: "#F59E0B" },
    { name: "Airport Kiosk", sales: 12800, pct: 9,  color: "#EF4444" },
  ];

  const avgDaily = Math.round(DAILY_SALES.reduce((s, v) => s + v, 0) / DAILY_SALES.length / 1000);

  /* ═══════════════════ DESKTOP ═══════════════════ */
  if (layout.isWide) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>

        {/* Desktop header */}
        <View style={[dk.header, { paddingTop: topPad + 8, backgroundColor: "#4F46E5" }]}>
          <TouchableOpacity onPress={() => router.back()} style={dk.backBtn}>
            <Feather name="arrow-left" size={20} color="#fff" />
          </TouchableOpacity>
          <View style={[dk.headerIcon, { backgroundColor: "rgba(255,255,255,0.18)" }]}>
            <Feather name="bar-chart-2" size={18} color="#fff" />
          </View>
          <View>
            <Text style={[dk.headerTitle, { fontFamily: "Inter_700Bold" }]}>Reports & Analytics</Text>
            <Text style={[dk.headerSub, { fontFamily: "Inter_400Regular" }]}>Business performance overview</Text>
          </View>
          <View style={{ flex: 1 }} />
          {/* Inline period tabs */}
          <View style={[dk.periodPills, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
            {PERIODS.map(p => (
              <TouchableOpacity
                key={p}
                style={[dk.periodPill, period === p && { backgroundColor: "#fff" }]}
                onPress={() => setPeriod(p)}
              >
                <Text style={[dk.periodPillText, { color: period === p ? "#4F46E5" : "#fff", fontFamily: "Inter_600SemiBold" }]}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            style={[dk.exportBtn, { backgroundColor: "rgba(255,255,255,0.18)" }]}
            onPress={() => Alert.alert("Export", "CSV/PDF export coming soon")}
          >
            <Feather name="download" size={15} color="#fff" />
            <Text style={[dk.exportText, { fontFamily: "Inter_600SemiBold" }]}>Export</Text>
          </TouchableOpacity>
        </View>

        {/* 2-column body */}
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <View style={dk.body}>

            {/* ── LEFT column ── */}
            <View style={dk.leftCol}>

              {/* Metric cards 2×2 */}
              <View style={[dk.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[dk.cardTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Revenue & Profit</Text>
                <View style={dk.metricsGrid}>
                  {profitCards.map(item => (
                    <View
                      key={item.label}
                      style={[dk.metricBox, item.big && { borderColor: "#10B98130", borderWidth: 2, backgroundColor: "#10B98108", borderRadius: 12 }]}
                    >
                      <View style={[dk.metricIcon, { backgroundColor: item.color + "18" }]}>
                        <Feather name={item.icon as any} size={15} color={item.color} />
                      </View>
                      <Text style={[dk.metricVal, { color: item.color, fontFamily: "Inter_700Bold", fontSize: item.big ? 24 : 20 }]}>
                        ₹{(item.val / 1000).toFixed(0)}k
                      </Text>
                      <Text style={[dk.metricLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{item.label}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Bar chart */}
              <View style={[dk.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <View>
                    <Text style={[dk.cardTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Sales Trend</Text>
                    <Text style={[dk.cardSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Last 7 days · avg ₹{avgDaily}k/day</Text>
                  </View>
                  <View style={[dk.trendChip, { backgroundColor: "#10B98115" }]}>
                    <Feather name="trending-up" size={12} color="#10B981" />
                    <Text style={[dk.trendText, { color: "#10B981", fontFamily: "Inter_700Bold" }]}>+12.4%</Text>
                  </View>
                </View>
                <BarChart data={DAILY_SALES} days={DAYS} color="#4F46E5" maxH={110} />
              </View>

              {/* Shop performance */}
              <View style={[dk.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[dk.cardTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Shop Performance</Text>
                {shops.map((s, i) => (
                  <View key={s.name} style={[dk.listRow, { borderTopColor: colors.border, borderTopWidth: i === 0 ? 0 : 1 }]}>
                    <View style={[dk.shopDot, { backgroundColor: s.color }]} />
                    <Text style={[dk.listName, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>{s.name}</Text>
                    <View style={{ flex: 1, marginHorizontal: 12 }}>
                      <View style={{ height: 4, backgroundColor: colors.secondary, borderRadius: 2 }}>
                        <View style={{ height: 4, width: `${s.pct}%`, backgroundColor: s.color, borderRadius: 2 }} />
                      </View>
                    </View>
                    <Text style={[dk.shopSales, { color: s.color, fontFamily: "Inter_700Bold" }]}>₹{(s.sales / 1000).toFixed(0)}k</Text>
                    <Text style={[dk.shopPct, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{s.pct}%</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* ── RIGHT column ── */}
            <View style={dk.rightCol}>

              {/* Category breakdown */}
              <View style={[dk.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[dk.cardTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Category Distribution</Text>
                <View style={{ marginTop: 6 }}>
                  {CAT_DATA.map(item => <DonutBar key={item.label} item={item} colors={colors} />)}
                </View>
              </View>

              {/* Top products */}
              <View style={[dk.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[dk.cardTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Top Selling Products</Text>
                {topProducts.map((p, i) => (
                  <View key={p.name} style={[dk.listRow, { borderTopColor: colors.border, borderTopWidth: i === 0 ? 0 : 1 }]}>
                    <View style={[dk.rankBadge, { backgroundColor: i === 0 ? "#F59E0B20" : "#4F46E510" }]}>
                      <Text style={[dk.rankText, { color: i === 0 ? "#B45309" : "#4F46E5", fontFamily: "Inter_700Bold" }]}>#{i + 1}</Text>
                    </View>
                    <Text style={[dk.listName, { color: colors.foreground, fontFamily: "Inter_500Medium" }]} numberOfLines={1}>{p.name}</Text>
                    <View style={{ alignItems: "flex-end" }}>
                      <Text style={[dk.prodRev, { color: "#4F46E5", fontFamily: "Inter_700Bold" }]}>₹{(p.revenue / 1000).toFixed(0)}k</Text>
                      <Text style={[dk.prodSales, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{p.sales} sold</Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* Least selling */}
              <View style={[dk.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[dk.cardTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Needs Attention</Text>
                {leastProducts.map((p, i) => (
                  <View key={p.name} style={[dk.listRow, { borderTopColor: colors.border, borderTopWidth: i === 0 ? 0 : 1 }]}>
                    <View style={[dk.rankBadge, { backgroundColor: "#EF444410" }]}>
                      <Feather name="trending-down" size={12} color="#EF4444" />
                    </View>
                    <Text style={[dk.listName, { color: colors.foreground, fontFamily: "Inter_500Medium" }]} numberOfLines={1}>{p.name}</Text>
                    <View style={{ alignItems: "flex-end" }}>
                      <Text style={[dk.prodRev, { color: "#EF4444", fontFamily: "Inter_700Bold" }]}>₹{(p.revenue / 1000).toFixed(1)}k</Text>
                      <Text style={[dk.prodSales, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{p.sales} sold</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  /* ═══════════════════ MOBILE ═══════════════════ */
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
            {profitCards.map(item => (
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
          <BarChart data={DAILY_SALES} days={DAYS} color="#4F46E5" maxH={64} />
          <Text style={[styles.chartSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            Avg ₹{avgDaily}k/day
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Category Distribution</Text>
          <View style={{ marginTop: 8 }}>
            {CAT_DATA.map(item => <DonutBar key={item.label} item={item} colors={colors} />)}
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
          {shops.map((s, i) => (
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

/* ── Desktop styles ── */
const dk = StyleSheet.create({
  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 24, paddingBottom: 14, gap: 12,
  },
  backBtn:    { padding: 4, marginRight: 4 },
  headerIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  headerTitle:{ color: "#fff", fontSize: 20 },
  headerSub:  { color: "#c7d2fe", fontSize: 12, marginTop: 2 },
  periodPills:{ flexDirection: "row", borderRadius: 10, padding: 3, gap: 2 },
  periodPill: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8 },
  periodPillText: { fontSize: 13 },
  exportBtn:  { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  exportText: { color: "#fff", fontSize: 13 },

  body:     { flexDirection: "row", padding: 20, gap: 16, alignItems: "flex-start" },
  leftCol:  { flex: 6, gap: 16 },
  rightCol: { flex: 4, gap: 16 },

  card:      { borderRadius: 16, borderWidth: 1, padding: 18, gap: 14 },
  cardTitle: { fontSize: 15 },
  cardSub:   { fontSize: 12, marginTop: 1 },

  metricsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  metricBox:   { width: "47%", padding: 14, alignItems: "center", gap: 6 },
  metricIcon:  { width: 34, height: 34, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  metricVal:   { fontSize: 20 },
  metricLabel: { fontSize: 12, textAlign: "center" },

  trendChip: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  trendText: { fontSize: 12 },

  listRow:   { flexDirection: "row", alignItems: "center", paddingVertical: 11, gap: 10 },
  shopDot:   { width: 10, height: 10, borderRadius: 5 },
  listName:  { flex: 1, fontSize: 13 },
  shopSales: { fontSize: 13 },
  shopPct:   { fontSize: 12, minWidth: 30, textAlign: "right" },

  rankBadge: { width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  rankText:  { fontSize: 11 },
  prodRev:   { fontSize: 13 },
  prodSales: { fontSize: 11 },
});

/* ── Mobile styles ── */
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
  cardTitle:   { fontSize: 15 },
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
