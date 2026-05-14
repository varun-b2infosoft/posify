import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useLayout } from "@/hooks/useLayout";
import { DashboardHeader } from "@/components/DashboardHeader";
import { StatCard } from "@/components/StatCard";
import { RevenueChart } from "@/components/RevenueChart";
import { CategorySection } from "@/components/CategorySection";
import { ProductRow } from "@/components/ProductRow";
import { LowStockAlert } from "@/components/LowStockAlert";
import { Sidebar } from "@/components/Sidebar";

type DateRange = "Today" | "Week" | "Month";

const TOP_PRODUCTS = [
  { name: "Café Americano", category: "Food & Bev", unitsSold: 847, revenue: "₹42.3K" },
  { name: "iPhone Case Pro", category: "Electronics", unitsSold: 312, revenue: "₹28.1K" },
  { name: "Linen Kurta Set", category: "Clothing", unitsSold: 229, revenue: "₹22.9K" },
  { name: "Wooden Platter", category: "Home & Living", unitsSold: 183, revenue: "₹18.3K" },
  { name: "Python Handbook", category: "Books", unitsSold: 156, revenue: "₹14.0K" },
];

const LEAST_PRODUCTS = [
  { name: "Crystal Candle Set", category: "Home & Living", unitsSold: 3, revenue: "₹1.8K" },
  { name: "Fitness Gloves", category: "Sports", unitsSold: 5, revenue: "₹2.5K" },
  { name: "Herbal Face Cream", category: "Beauty", unitsSold: 7, revenue: "₹3.5K" },
  { name: "Desk Calendar 2026", category: "Stationery", unitsSold: 9, revenue: "₹1.4K" },
  { name: "Travel Pillow", category: "Accessories", unitsSold: 11, revenue: "₹3.3K" },
];

const LOW_STOCK = [
  { name: "Café Americano Blend", qty: 2, unit: "kg", critical: true },
  { name: "iPhone Case (Black)", qty: 4, unit: "pcs", critical: true },
  { name: "Linen Kurta (M)", qty: 6, unit: "pcs", critical: false },
  { name: "A4 Paper Ream", qty: 8, unit: "pcs", critical: false },
  { name: "Wooden Platter (L)", qty: 3, unit: "pcs", critical: true },
];

const QUICK_ACTIONS = [
  { icon: "shopping-cart", label: "New Sale", color: "#4F46E5", tab: "pos" },
  { icon: "plus-square", label: "Add Product", color: "#06B6D4", tab: "products" },
  { icon: "file-text", label: "View Orders", color: "#8B5CF6", tab: "purchases" },
  { icon: "alert-triangle", label: "Low Stock", color: "#F59E0B", tab: "index" },
];

const NAV_ITEMS = [
  { icon: "grid", label: "Dashboard",   key: "index",     route: "/(tabs)/" },
  { icon: "shopping-cart", label: "POS",key: "pos",       route: "/(tabs)/pos" },
  { icon: "package",  label: "Products",key: "products",  route: "/(tabs)/products" },
  { icon: "truck",    label: "Purchases",key: "purchases", route: "/(tabs)/purchases" },
  { icon: "bar-chart-2",label:"Reports", key: "reports",  route: "/reports" },
  { icon: "users",    label: "Customers",key: "customers", route: "/customers" },
  { icon: "credit-card",label:"Expenses",key: "expenses", route: "/expenses" },
  { icon: "user",     label: "Profile",  key: "profile",  route: "/(tabs)/profile" },
];

const STAT_ITEMS_BY_RANGE = {
  Today: {
    today:   { val: "₹72,400", trend: 12.4, sub: "vs yesterday" },
    weekly:  { val: "₹3.95L",  trend: 8.2,  sub: "this week" },
    monthly: { val: "₹14.2L",  trend: -3.1, sub: "this month" },
    total:   { val: "₹1.24Cr", trend: 22.7, sub: "all time" },
  },
  Week: {
    today:   { val: "₹3.95L",  trend: 8.2,  sub: "vs last week" },
    weekly:  { val: "₹14.2L",  trend: -3.1, sub: "last 4 weeks" },
    monthly: { val: "₹58.4L",  trend: 15.3, sub: "this quarter" },
    total:   { val: "₹1.24Cr", trend: 22.7, sub: "all time" },
  },
  Month: {
    today:   { val: "₹14.2L",  trend: -3.1, sub: "vs last month" },
    weekly:  { val: "₹58.4L",  trend: 15.3, sub: "this quarter" },
    monthly: { val: "₹2.31Cr", trend: 18.9, sub: "last 6 months" },
    total:   { val: "₹1.24Cr", trend: 22.7, sub: "all time" },
  },
};

const STAT_LABELS: Record<DateRange, [string, string, string, string]> = {
  Today:  ["Today's Sales", "Weekly Sales",  "Monthly Sales",  "Total Sales"],
  Week:   ["This Week",     "Last 4 Weeks",  "Quarter Sales",  "All-Time"],
  Month:  ["This Month",    "Quarter Sales", "6-Month Sales",  "All-Time"],
};

export default function DashboardScreen() {
  const colors     = useColors();
  const layout     = useLayout();
  const insets     = useSafeAreaInsets();
  const topPad     = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad  = Platform.OS === "web" ? 34 : insets.bottom;
  const [range, setRange]       = useState<DateRange>("Today");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const stats  = STAT_ITEMS_BY_RANGE[range];
  const labels = STAT_LABELS[range];

  const TAB_ROUTES: Record<string, string> = {
    index:     "/(tabs)/",
    pos:       "/(tabs)/pos",
    products:  "/(tabs)/products",
    purchases: "/(tabs)/purchases",
    profile:   "/(tabs)/profile",
  };

  const handleNavigate = (screen: string) => {
    const route = TAB_ROUTES[screen];
    if (route) router.push(route as any);
  };

  // ─── DESKTOP LAYOUT ────────────────────────────────────────────────────────
  if (layout.isWide) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background, flexDirection: "row" }]}>

        {/* ── LEFT NAV SIDEBAR ── */}
        <View style={dk.navSidebar}>
          {/* Brand */}
          <View style={[dk.brand, { paddingTop: topPad + 8 }]}>
            <View style={dk.brandIconWrap}>
              <Feather name="shopping-bag" size={18} color="#fff" />
            </View>
            <View>
              <Text style={[dk.brandName, { fontFamily: "Inter_700Bold" }]}>IPOS</Text>
              <Text style={[dk.brandTagline, { fontFamily: "Inter_400Regular" }]}>Management Suite</Text>
            </View>
          </View>

          {/* Nav items */}
          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 8 }}>
            <Text style={[dk.navSection, { fontFamily: "Inter_600SemiBold" }]}>NAVIGATION</Text>
            {NAV_ITEMS.map(item => {
              const isActive = item.key === "index";
              return (
                <TouchableOpacity
                  key={item.key}
                  style={[dk.navItem, isActive && dk.navItemActive]}
                  onPress={() => router.push(item.route as any)}
                  activeOpacity={0.75}
                >
                  <View style={[dk.navIcon, { backgroundColor: isActive ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.07)" }]}>
                    <Feather name={item.icon as any} size={15} color={isActive ? "#fff" : "rgba(255,255,255,0.6)"} />
                  </View>
                  <Text style={[dk.navLabel, { fontFamily: isActive ? "Inter_600SemiBold" : "Inter_400Regular", color: isActive ? "#fff" : "rgba(255,255,255,0.65)" }]}>
                    {item.label}
                  </Text>
                  {isActive && <View style={dk.navActiveBar} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Bottom: Start Selling CTA */}
          <View style={dk.navBottom}>
            <TouchableOpacity
              style={dk.newSaleBtn}
              onPress={() => router.push("/(tabs)/pos" as any)}
              activeOpacity={0.88}
            >
              <Feather name="shopping-cart" size={15} color="#fff" />
              <Text style={[dk.newSaleBtnText, { fontFamily: "Inter_700Bold" }]}>New Sale</Text>
            </TouchableOpacity>
            <View style={dk.userRow}>
              <View style={dk.avatarCircle}>
                <Text style={[dk.avatarText, { fontFamily: "Inter_700Bold" }]}>A</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[dk.userName, { fontFamily: "Inter_600SemiBold" }]}>Admin</Text>
                <Text style={[dk.userRole, { fontFamily: "Inter_400Regular" }]}>Shop Owner</Text>
              </View>
              <TouchableOpacity onPress={() => router.push("/(tabs)/profile" as any)}>
                <Feather name="settings" size={15} color="rgba(255,255,255,0.5)" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ── MAIN CONTENT ── */}
        <View style={{ flex: 1, flexDirection: "column", overflow: "hidden" }}>

          {/* Top header bar */}
          <View style={[dk.topBar, { paddingTop: topPad + 4, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
            <View style={{ flex: 1 }}>
              <Text style={[dk.pageTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Dashboard</Text>
              <Text style={[dk.pageSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                ₹72,400 in sales today · 284 orders · 3 critical alerts
              </Text>
            </View>

            {/* Range picker */}
            <View style={[dk.rangePicker, { backgroundColor: colors.secondary }]}>
              {(["Today", "Week", "Month"] as DateRange[]).map(r => (
                <TouchableOpacity
                  key={r}
                  onPress={() => setRange(r)}
                  style={[dk.rangeBtn, r === range && { backgroundColor: colors.primary }]}
                >
                  <Text style={[dk.rangeText, { fontFamily: r === range ? "Inter_600SemiBold" : "Inter_400Regular", color: r === range ? "#fff" : colors.mutedForeground }]}>
                    {r}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Actions */}
            <View style={dk.topActions}>
              <TouchableOpacity style={[dk.topIconBtn, { backgroundColor: colors.secondary }]} onPress={() => router.push("/notifications" as any)}>
                <Feather name="bell" size={17} color={colors.foreground} />
                <View style={dk.notifDot} />
              </TouchableOpacity>
              <TouchableOpacity style={[dk.topIconBtn, { backgroundColor: colors.secondary }]} onPress={() => router.push("/settings" as any)}>
                <Feather name="settings" size={17} color={colors.foreground} />
              </TouchableOpacity>
              <View style={[dk.avatarCircleSm, { backgroundColor: colors.primary }]}>
                <Text style={[dk.avatarTextSm, { fontFamily: "Inter_700Bold" }]}>A</Text>
              </View>
            </View>
          </View>

          {/* Scrollable body */}
          <ScrollView
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 22, paddingBottom: 40, gap: 18 }}
          >
            {/* ── STAT CARDS ROW ── */}
            <View style={dk.statsRow}>
              <StatCard title={labels[0]} value={stats.today.val}   trend={stats.today.trend}   subtext={stats.today.sub}   icon="dollar-sign"   accentColor="#4F46E5" style={{ flex: 1, minWidth: 0 }} />
              <StatCard title={labels[1]} value={stats.weekly.val}  trend={stats.weekly.trend}  subtext={stats.weekly.sub}  icon="bar-chart-2"   accentColor="#06B6D4" style={{ flex: 1, minWidth: 0 }} />
              <StatCard title={labels[2]} value={stats.monthly.val} trend={stats.monthly.trend} subtext={stats.monthly.sub} icon="trending-up"   accentColor="#8B5CF6" style={{ flex: 1, minWidth: 0 }} />
              <StatCard title={labels[3]} value={stats.total.val}   trend={stats.total.trend}   subtext={stats.total.sub}   icon="layers"        accentColor="#10B981" style={{ flex: 1, minWidth: 0 }} />
            </View>

            {/* ── MAIN 2-COLUMN GRID ── */}
            <View style={dk.twoCol}>

              {/* LEFT: Chart + Products tables */}
              <View style={dk.leftCol}>
                {/* Revenue chart */}
                <RevenueChart />

                {/* Top & Least products side by side */}
                <View style={dk.productsRow}>
                  {/* Top selling */}
                  <View style={[dk.productCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={dk.cardHeader}>
                      <View style={dk.cardTitleRow}>
                        <View style={[dk.cardTitleIcon, { backgroundColor: "#4F46E518" }]}>
                          <Feather name="award" size={13} color="#4F46E5" />
                        </View>
                        <Text style={[dk.cardTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>Top Selling</Text>
                      </View>
                      <TouchableOpacity onPress={() => router.push("/reports" as any)}>
                        <Text style={[dk.seeAll, { color: colors.primary, fontFamily: "Inter_500Medium" }]}>See all</Text>
                      </TouchableOpacity>
                    </View>
                    {TOP_PRODUCTS.map((p, idx) => (
                      <ProductRow key={p.name} rank={idx + 1} name={p.name} category={p.category} unitsSold={p.unitsSold} revenue={p.revenue} isTop={true} isFirst={idx === 0} />
                    ))}
                  </View>

                  {/* Least selling */}
                  <View style={[dk.productCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={dk.cardHeader}>
                      <View style={dk.cardTitleRow}>
                        <View style={[dk.cardTitleIcon, { backgroundColor: "#F59E0B18" }]}>
                          <Feather name="trending-down" size={13} color="#D97706" />
                        </View>
                        <Text style={[dk.cardTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>Least Selling</Text>
                      </View>
                      <TouchableOpacity onPress={() => router.push("/reports" as any)}>
                        <Text style={[dk.seeAll, { color: colors.primary, fontFamily: "Inter_500Medium" }]}>See all</Text>
                      </TouchableOpacity>
                    </View>
                    {LEAST_PRODUCTS.map((p, idx) => (
                      <ProductRow key={p.name} rank={idx + 1} name={p.name} category={p.category} unitsSold={p.unitsSold} revenue={p.revenue} isTop={false} isFirst={false} />
                    ))}
                  </View>
                </View>
              </View>

              {/* RIGHT: Quick actions + Category + Low stock */}
              <View style={dk.rightCol}>
                {/* Quick actions 2x2 */}
                <View style={[dk.rightCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={dk.cardHeader}>
                    <View style={dk.cardTitleRow}>
                      <View style={[dk.cardTitleIcon, { backgroundColor: colors.primary + "18" }]}>
                        <Feather name="zap" size={13} color={colors.primary} />
                      </View>
                      <Text style={[dk.cardTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>Quick Actions</Text>
                    </View>
                  </View>
                  <View style={dk.qaGrid}>
                    {QUICK_ACTIONS.map(action => (
                      <TouchableOpacity
                        key={action.label}
                        style={[dk.qaBtn, { backgroundColor: action.color + "10", borderColor: action.color + "30" }]}
                        onPress={() => handleNavigate(action.tab)}
                        activeOpacity={0.78}
                      >
                        <View style={[dk.qaIcon, { backgroundColor: action.color + "20" }]}>
                          <Feather name={action.icon as any} size={18} color={action.color} />
                        </View>
                        <Text style={[dk.qaLabel, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>{action.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* KPI mini-stats */}
                <View style={[dk.rightCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={dk.cardHeader}>
                    <View style={dk.cardTitleRow}>
                      <View style={[dk.cardTitleIcon, { backgroundColor: "#10B98118" }]}>
                        <Feather name="activity" size={13} color="#10B981" />
                      </View>
                      <Text style={[dk.cardTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>Today's KPIs</Text>
                    </View>
                  </View>
                  {[
                    { label: "Orders Completed",  val: "284",    icon: "check-circle", color: "#10B981" },
                    { label: "Avg Order Value",    val: "₹255",   icon: "tag",          color: "#4F46E5" },
                    { label: "New Customers",      val: "17",     icon: "user-plus",    color: "#06B6D4" },
                    { label: "Returns / Refunds",  val: "3",      icon: "rotate-ccw",   color: "#EF4444" },
                    { label: "Pending Deliveries", val: "8",      icon: "truck",        color: "#F59E0B" },
                  ].map((kpi, idx, arr) => (
                    <View key={kpi.label} style={[dk.kpiRow, { borderBottomColor: colors.border }, idx < arr.length - 1 && { borderBottomWidth: 1 }]}>
                      <View style={[dk.kpiIcon, { backgroundColor: kpi.color + "15" }]}>
                        <Feather name={kpi.icon as any} size={13} color={kpi.color} />
                      </View>
                      <Text style={[dk.kpiLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{kpi.label}</Text>
                      <Text style={[dk.kpiVal, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>{kpi.val}</Text>
                    </View>
                  ))}
                </View>

                {/* Category breakdown */}
                <CategorySection />

                {/* Low stock alerts */}
                <LowStockAlert items={LOW_STOCK} />
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    );
  }

  // ─── MOBILE LAYOUT ─────────────────────────────────────────────────────────
  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Sidebar
        visible={sidebarOpen}
        activeScreen="index"
        onClose={() => setSidebarOpen(false)}
        onNavigate={handleNavigate}
      />

      <DashboardHeader
        selectedRange={range}
        onRangeChange={setRange}
        notifCount={LOW_STOCK.filter((i) => i.critical).length}
        onMenuPress={() => setSidebarOpen(true)}
      />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: bottomPad + 100 },
          layout.isWide && { maxWidth: layout.maxContentWidth, alignSelf: "center", width: "100%" },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={[styles.startSellingBtn, { backgroundColor: colors.success }]}
          onPress={() => router.push("/(tabs)/pos" as any)}
          activeOpacity={0.85}
        >
          <View style={styles.startSellingLeft}>
            <Feather name="shopping-cart" size={22} color="#fff" />
            <View>
              <Text style={[styles.startSellingTitle, { fontFamily: "Inter_700Bold" }]}>Start Selling</Text>
              <Text style={[styles.startSellingSubtitle, { fontFamily: "Inter_400Regular" }]}>
                Open POS · 1 tap to sell
              </Text>
            </View>
          </View>
          <Feather name="arrow-right" size={22} color="#fff" />
        </TouchableOpacity>

        <View style={styles.quickActionsRow}>
          {QUICK_ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.label}
              style={[styles.quickActionBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => handleNavigate(action.tab)}
              activeOpacity={0.7}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: action.color + "18" }]}>
                <Feather name={action.icon as any} size={18} color={action.color} />
              </View>
              <Text style={[styles.quickActionLabel, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.statsGrid, layout.isWide && { flexWrap: "nowrap" }]}>
          <StatCard title="Today Sales"   value={STAT_ITEMS_BY_RANGE[range].today.val}   trend={STAT_ITEMS_BY_RANGE[range].today.trend}   subtext={STAT_ITEMS_BY_RANGE[range].today.sub}   icon="dollar-sign" accentColor="#4F46E5" style={layout.isWide ? { flex: 1, minWidth: 0 } : undefined} />
          <StatCard title="Weekly Sales"  value={STAT_ITEMS_BY_RANGE[range].weekly.val}  trend={STAT_ITEMS_BY_RANGE[range].weekly.trend}  subtext={STAT_ITEMS_BY_RANGE[range].weekly.sub}  icon="bar-chart-2" accentColor="#06B6D4" style={layout.isWide ? { flex: 1, minWidth: 0 } : undefined} />
          <StatCard title="Monthly Sales" value={STAT_ITEMS_BY_RANGE[range].monthly.val} trend={STAT_ITEMS_BY_RANGE[range].monthly.trend} subtext={STAT_ITEMS_BY_RANGE[range].monthly.sub} icon="trending-up" accentColor="#8B5CF6" style={layout.isWide ? { flex: 1, minWidth: 0 } : undefined} />
          <StatCard title="Total Sales"   value={STAT_ITEMS_BY_RANGE[range].total.val}   trend={STAT_ITEMS_BY_RANGE[range].total.trend}   subtext={STAT_ITEMS_BY_RANGE[range].total.sub}   icon="layers"      accentColor="#10B981" style={layout.isWide ? { flex: 1, minWidth: 0 } : undefined} />
        </View>

        <RevenueChart />
        <CategorySection />

        <View style={[styles.productCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Feather name="award" size={15} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>Top Selling</Text>
            </View>
            <TouchableOpacity><Text style={[styles.seeAll, { color: colors.primary, fontFamily: "Inter_500Medium" }]}>See all</Text></TouchableOpacity>
          </View>
          {TOP_PRODUCTS.map((p, idx) => (
            <ProductRow key={p.name} rank={idx + 1} name={p.name} category={p.category} unitsSold={p.unitsSold} revenue={p.revenue} isTop={true} isFirst={idx === 0} />
          ))}
        </View>

        <View style={[styles.productCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Feather name="trending-down" size={15} color={colors.warning} />
              <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>Least Selling</Text>
            </View>
            <TouchableOpacity><Text style={[styles.seeAll, { color: colors.primary, fontFamily: "Inter_500Medium" }]}>See all</Text></TouchableOpacity>
          </View>
          {LEAST_PRODUCTS.map((p, idx) => (
            <ProductRow key={p.name} rank={idx + 1} name={p.name} category={p.category} unitsSold={p.unitsSold} revenue={p.revenue} isTop={false} isFirst={false} />
          ))}
        </View>

        <LowStockAlert items={LOW_STOCK} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 14, gap: 14 },
  startSellingBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    borderRadius: 16, paddingHorizontal: 20, paddingVertical: 16,
  },
  startSellingLeft: { flexDirection: "row", alignItems: "center", gap: 14 },
  startSellingTitle:    { color: "#fff", fontSize: 18 },
  startSellingSubtitle: { color: "rgba(255,255,255,0.8)", fontSize: 12 },
  quickActionsRow: { flexDirection: "row", gap: 8 },
  quickActionBtn: {
    flex: 1, alignItems: "center", gap: 6, paddingVertical: 12, borderRadius: 12, borderWidth: 1,
  },
  quickActionIcon:  { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  quickActionLabel: { fontSize: 10, textAlign: "center" },
  statsGrid:    { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  productCard:  { borderRadius: 14, padding: 14, borderWidth: 1 },
  sectionHeader:{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  sectionTitle: { fontSize: 16 },
  seeAll:       { fontSize: 13 },
});

const dk = StyleSheet.create({
  // ── Left nav sidebar ──
  navSidebar: {
    width: 220, backgroundColor: "#3730A3", flexDirection: "column",
  },
  brand: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 16, paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.12)",
  },
  brandIconWrap: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center", justifyContent: "center",
  },
  brandName:    { color: "#fff", fontSize: 17 },
  brandTagline: { color: "rgba(255,255,255,0.5)", fontSize: 9, marginTop: 1 },

  navSection: {
    color: "rgba(255,255,255,0.38)", fontSize: 9, letterSpacing: 1.2,
    paddingHorizontal: 16, paddingTop: 14, paddingBottom: 4,
  },
  navItem: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 12, paddingVertical: 9, marginHorizontal: 8,
    borderRadius: 10, position: "relative",
  },
  navItemActive: { backgroundColor: "rgba(255,255,255,0.14)" },
  navIcon: {
    width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center",
  },
  navLabel:     { fontSize: 13, flex: 1 },
  navActiveBar: {
    position: "absolute", right: 0, top: "25%", bottom: "25%",
    width: 3, borderRadius: 2, backgroundColor: "#fff",
  },

  navBottom: {
    borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.12)",
    padding: 12, gap: 10,
  },
  newSaleBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, backgroundColor: "#4F46E5", borderRadius: 12, paddingVertical: 11,
  },
  newSaleBtnText: { color: "#fff", fontSize: 14 },
  userRow: {
    flexDirection: "row", alignItems: "center", gap: 9,
  },
  avatarCircle: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 1.5, borderColor: "rgba(255,255,255,0.35)",
    alignItems: "center", justifyContent: "center",
  },
  avatarText:  { color: "#fff", fontSize: 14 },
  userName:    { color: "#fff", fontSize: 13 },
  userRole:    { color: "rgba(255,255,255,0.5)", fontSize: 10, marginTop: 1 },

  // ── Top header bar ──
  topBar: {
    flexDirection: "row", alignItems: "center", gap: 16,
    paddingHorizontal: 22, paddingBottom: 12,
    borderBottomWidth: 1,
  },
  pageTitle: { fontSize: 20 },
  pageSub:   { fontSize: 11, marginTop: 1 },

  rangePicker: {
    flexDirection: "row", borderRadius: 9, padding: 3, gap: 3,
  },
  rangeBtn: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 7,
  },
  rangeText: { fontSize: 12 },

  topActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  topIconBtn: {
    width: 34, height: 34, borderRadius: 9,
    alignItems: "center", justifyContent: "center",
    position: "relative",
  },
  notifDot: {
    position: "absolute", top: 7, right: 7,
    width: 7, height: 7, borderRadius: 4, backgroundColor: "#EF4444",
  },
  avatarCircleSm: {
    width: 34, height: 34, borderRadius: 17,
    alignItems: "center", justifyContent: "center",
  },
  avatarTextSm: { color: "#fff", fontSize: 13 },

  // ── Content grid ──
  statsRow: { flexDirection: "row", gap: 12 },

  twoCol: { flexDirection: "row", gap: 18 },

  leftCol:  { flex: 3, gap: 16 },
  rightCol: { flex: 2, gap: 14 },

  productsRow: { flexDirection: "row", gap: 14 },
  productCard: { flex: 1, borderRadius: 14, padding: 14, borderWidth: 1 },

  rightCard: { borderRadius: 14, padding: 14, borderWidth: 1 },

  cardHeader:   { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  cardTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  cardTitleIcon:{ width: 26, height: 26, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  cardTitle:    { fontSize: 14 },
  seeAll:       { fontSize: 12 },

  // Quick actions grid
  qaGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  qaBtn: {
    width: "47%", borderRadius: 12, padding: 14, gap: 8,
    borderWidth: 1, alignItems: "flex-start",
  },
  qaIcon:  { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  qaLabel: { fontSize: 12 },

  // KPI rows
  kpiRow:  { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8 },
  kpiIcon: { width: 26, height: 26, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  kpiLabel:{ flex: 1, fontSize: 12 },
  kpiVal:  { fontSize: 14 },
});
