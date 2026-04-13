import React, { useCallback, useState } from "react";
import {
  Alert,
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
import { Shop, deleteShop, getShops, getStaff, subscribeShops } from "@/store/shops";

function ShopCard({ shop, onPress, onEdit, onDelete }: {
  shop: Shop;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const colors = useColors();
  const staffCount = getStaff(shop.id).length;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.82}
    >
      <View style={styles.cardTop}>
        <View style={[styles.shopIcon, { backgroundColor: shop.color + "18" }]}>
          <Feather name="shopping-bag" size={22} color={shop.color} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.nameRow}>
            <Text style={[styles.shopName, { color: colors.foreground, fontFamily: "Inter_700Bold" }]} numberOfLines={1}>
              {shop.name}
            </Text>
            {!shop.active && (
              <View style={[styles.inactiveBadge, { backgroundColor: "#FEE2E2" }]}>
                <Text style={[styles.inactiveText, { color: "#B91C1C", fontFamily: "Inter_600SemiBold" }]}>Inactive</Text>
              </View>
            )}
          </View>
          <Text style={[styles.shopAddress, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]} numberOfLines={1}>
            {shop.address}
          </Text>
        </View>
        <View style={{ flexDirection: "row", gap: 4 }}>
          <TouchableOpacity style={[styles.actionBtn, { borderColor: colors.border }]} onPress={onEdit}>
            <Feather name="edit-2" size={13} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { borderColor: colors.border }]} onPress={onDelete}>
            <Feather name="trash-2" size={13} color={colors.destructive} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.cardStats, { borderTopColor: colors.border }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>
            ₹{Math.round(shop.todaySales / 1000)}k
          </Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Today Sales</Text>
        </View>
        <View style={[styles.statDiv, { backgroundColor: colors.border }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            ₹{Math.round(shop.stockValue / 1000)}k
          </Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Stock Value</Text>
        </View>
        <View style={[styles.statDiv, { backgroundColor: colors.border }]} />
        <TouchableOpacity style={styles.statItem} onPress={onPress}>
          <Text style={[styles.statValue, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>{staffCount}</Text>
          <Text style={[styles.statLabel, { color: colors.primary, fontFamily: "Inter_500Medium" }]}>
            Staff →
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

export default function ShopsScreen() {
  const colors    = useColors();
  const insets    = useSafeAreaInsets();
  const topPad    = Platform.OS === "web" ? 67 : insets.top;
  const botPad    = Platform.OS === "web" ? 24 : insets.bottom + 16;

  const [shops, setShops] = useState(() => getShops());

  useFocusEffect(useCallback(() => {
    setShops(getShops());
    return subscribeShops(() => setShops(getShops()));
  }, []));

  const totalSales  = shops.reduce((s, sh) => s + sh.todaySales, 0);
  const totalStock  = shops.reduce((s, sh) => s + sh.stockValue, 0);
  const activeCount = shops.filter(sh => sh.active).length;

  const handleDelete = (shop: Shop) => {
    Alert.alert("Delete Shop", `Remove "${shop.name}" and all its staff?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteShop(shop.id) },
    ]);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: "#4F46E5" }]}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 2 }}>
          <Feather name="arrow-left" size={20} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { fontFamily: "Inter_700Bold" }]}>Manage Shops</Text>
          <Text style={[styles.headerSub, { fontFamily: "Inter_400Regular" }]}>
            {activeCount} active · {shops.length} total
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/shops/edit" as any)}
          style={[styles.addBtn, { backgroundColor: "rgba(255,255,255,0.2)" }]}
        >
          <Feather name="plus" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: botPad + 80 }]}
      >
        {/* Summary */}
        <View style={[styles.summaryRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {[
            { label: "Total Shops",    value: String(shops.length),             color: colors.foreground },
            { label: "Today Sales",    value: `₹${Math.round(totalSales / 1000)}k`,  color: "#10B981" },
            { label: "Stock Value",    value: `₹${Math.round(totalStock / 1000)}k`,  color: "#4F46E5" },
          ].map((s, i, arr) => (
            <React.Fragment key={s.label}>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, { color: s.color, fontFamily: "Inter_700Bold" }]}>{s.value}</Text>
                <Text style={[styles.summaryLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{s.label}</Text>
              </View>
              {i < arr.length - 1 && <View style={[styles.summaryDiv, { backgroundColor: colors.border }]} />}
            </React.Fragment>
          ))}
        </View>

        {shops.map(shop => (
          <ShopCard
            key={shop.id}
            shop={shop}
            onPress={() => router.push(`/shops/${shop.id}` as any)}
            onEdit={() => router.push(`/shops/edit?id=${shop.id}` as any)}
            onDelete={() => handleDelete(shop)}
          />
        ))}
      </ScrollView>

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: "#4F46E5", bottom: botPad + 16 }]}
        onPress={() => router.push("/shops/edit" as any)}
      >
        <Feather name="plus" size={20} color="#fff" />
        <Text style={[styles.fabText, { fontFamily: "Inter_700Bold" }]}>Add Shop</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "flex-end", gap: 12,
    paddingHorizontal: 16, paddingBottom: 12,
  },
  headerTitle: { color: "#fff", fontSize: 20 },
  headerSub:   { color: "rgba(255,255,255,0.75)", fontSize: 12, marginTop: 1 },
  addBtn: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },

  content: { padding: 12, gap: 10 },

  summaryRow: {
    flexDirection: "row", alignItems: "center", borderRadius: 12, borderWidth: 1, padding: 12,
  },
  summaryItem:  { flex: 1, alignItems: "center", gap: 2 },
  summaryValue: { fontSize: 16 },
  summaryLabel: { fontSize: 11 },
  summaryDiv:   { width: 1, height: 28 },

  card: {
    borderRadius: 14, borderWidth: 1, overflow: "hidden",
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 10, padding: 13 },
  shopIcon: { width: 48, height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  nameRow:  { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2 },
  shopName: { fontSize: 15 },
  inactiveBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  inactiveText:  { fontSize: 10 },
  shopAddress: { fontSize: 12 },
  actionBtn: { width: 30, height: 30, borderRadius: 8, borderWidth: 1, alignItems: "center", justifyContent: "center" },

  cardStats: {
    flexDirection: "row", borderTopWidth: 1, paddingVertical: 10, paddingHorizontal: 8,
  },
  statItem:  { flex: 1, alignItems: "center", gap: 2 },
  statValue: { fontSize: 14 },
  statLabel: { fontSize: 11 },
  statDiv:   { width: 1, marginVertical: 2 },

  fab: {
    position: "absolute", right: 16,
    flexDirection: "row", alignItems: "center", gap: 7,
    paddingHorizontal: 18, paddingVertical: 13, borderRadius: 28,
    shadowColor: "#4F46E5", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 10, elevation: 8,
  },
  fabText: { color: "#fff", fontSize: 15 },
});
