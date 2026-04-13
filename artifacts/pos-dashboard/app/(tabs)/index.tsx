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

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [range, setRange] = useState<DateRange>("Today");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const statsForRange = {
    Today: {
      today: { val: "₹72,400", trend: 12.4, sub: "vs yesterday" },
      weekly: { val: "₹3.95L", trend: 8.2, sub: "this week" },
      monthly: { val: "₹14.2L", trend: -3.1, sub: "this month" },
      total: { val: "₹1.24Cr", trend: 22.7, sub: "all time" },
    },
    Week: {
      today: { val: "₹3.95L", trend: 8.2, sub: "vs last week" },
      weekly: { val: "₹14.2L", trend: -3.1, sub: "last 4 weeks" },
      monthly: { val: "₹58.4L", trend: 15.3, sub: "this quarter" },
      total: { val: "₹1.24Cr", trend: 22.7, sub: "all time" },
    },
    Month: {
      today: { val: "₹14.2L", trend: -3.1, sub: "vs last month" },
      weekly: { val: "₹58.4L", trend: 15.3, sub: "this quarter" },
      monthly: { val: "₹2.31Cr", trend: 18.9, sub: "last 6 months" },
      total: { val: "₹1.24Cr", trend: 22.7, sub: "all time" },
    },
  };

  const stats = statsForRange[range];

  const TAB_ROUTES: Record<string, string> = {
    index: "/(tabs)/",
    pos: "/(tabs)/pos",
    products: "/(tabs)/products",
    purchases: "/(tabs)/purchases",
    profile: "/(tabs)/profile",
  };

  const handleNavigate = (screen: string) => {
    const route = TAB_ROUTES[screen];
    if (route) router.push(route as any);
  };

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
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 100 }]}
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

        <View style={styles.statsGrid}>
          <StatCard
            title="Today Sales"
            value={stats.today.val}
            trend={stats.today.trend}
            subtext={stats.today.sub}
            icon="dollar-sign"
            accentColor="#4F46E5"
          />
          <StatCard
            title="Weekly Sales"
            value={stats.weekly.val}
            trend={stats.weekly.trend}
            subtext={stats.weekly.sub}
            icon="bar-chart-2"
            accentColor="#06B6D4"
          />
          <StatCard
            title="Monthly Sales"
            value={stats.monthly.val}
            trend={stats.monthly.trend}
            subtext={stats.monthly.sub}
            icon="trending-up"
            accentColor="#8B5CF6"
          />
          <StatCard
            title="Total Sales"
            value={stats.total.val}
            trend={stats.total.trend}
            subtext={stats.total.sub}
            icon="layers"
            accentColor="#10B981"
          />
        </View>

        <RevenueChart />

        <CategorySection />

        <View style={[styles.productCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Feather name="award" size={15} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                Top Selling
              </Text>
            </View>
            <TouchableOpacity>
              <Text style={[styles.seeAll, { color: colors.primary, fontFamily: "Inter_500Medium" }]}>See all</Text>
            </TouchableOpacity>
          </View>
          {TOP_PRODUCTS.map((p, idx) => (
            <ProductRow
              key={p.name}
              rank={idx + 1}
              name={p.name}
              category={p.category}
              unitsSold={p.unitsSold}
              revenue={p.revenue}
              isTop={true}
              isFirst={idx === 0}
            />
          ))}
        </View>

        <View style={[styles.productCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Feather name="trending-down" size={15} color={colors.warning} />
              <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                Least Selling
              </Text>
            </View>
            <TouchableOpacity>
              <Text style={[styles.seeAll, { color: colors.primary, fontFamily: "Inter_500Medium" }]}>See all</Text>
            </TouchableOpacity>
          </View>
          {LEAST_PRODUCTS.map((p, idx) => (
            <ProductRow
              key={p.name}
              rank={idx + 1}
              name={p.name}
              category={p.category}
              unitsSold={p.unitsSold}
              revenue={p.revenue}
              isTop={false}
              isFirst={false}
            />
          ))}
        </View>

        <LowStockAlert items={LOW_STOCK} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    padding: 14,
    gap: 14,
  },
  startSellingBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  startSellingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  startSellingTitle: {
    color: "#fff",
    fontSize: 18,
  },
  startSellingSubtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
  },
  quickActionsRow: {
    flexDirection: "row",
    gap: 8,
  },
  quickActionBtn: {
    flex: 1,
    alignItems: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  quickActionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  quickActionLabel: {
    fontSize: 10,
    textAlign: "center",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  productCard: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sectionTitle: {
    fontSize: 16,
  },
  seeAll: {
    fontSize: 13,
  },
});
