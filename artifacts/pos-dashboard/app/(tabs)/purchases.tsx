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
import {
  Purchase,
  getPurchases,
  subscribePurchases,
} from "@/store/purchases";
import {
  Supplier,
  deleteSupplier,
  getSuppliers,
  subscribeSuppliers,
} from "@/store/suppliers";

type Tab = "orders" | "suppliers";

const STATUS_META = {
  delivered: { bg: "#D1FAE5", text: "#065F46", icon: "check-circle" },
  pending:   { bg: "#FEF3C7", text: "#92400E", icon: "clock"        },
  cancelled: { bg: "#FEE2E2", text: "#B91C1C", icon: "x-circle"     },
} as const;

const ORDER_FILTERS = ["All", "Delivered", "Pending", "Cancelled"] as const;

function PurchaseCard({ item, onPress }: { item: Purchase; onPress: () => void }) {
  const colors = useColors();
  const sm = STATUS_META[item.status];
  const itemQty = item.items.reduce((s, i) => s + i.qty, 0);
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.cardTop}>
        <View style={[styles.vendorAvatar, { backgroundColor: "#4F46E518" }]}>
          <Feather name="truck" size={20} color="#4F46E5" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.cardSupplier, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]} numberOfLines={1}>
            {item.supplierName}
          </Text>
          <Text style={[styles.cardMeta, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            {item.id} · {item.items.length} SKU · {itemQty} units · {item.date}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: sm.bg }]}>
          <Feather name={sm.icon as any} size={10} color={sm.text} />
          <Text style={[styles.statusText, { color: sm.text, fontFamily: "Inter_600SemiBold" }]}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>
      <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
        <View style={styles.itemPills}>
          {item.items.slice(0, 2).map((li, idx) => (
            <View key={idx} style={[styles.itemPill, { backgroundColor: colors.secondary }]}>
              <Text style={[styles.itemPillText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]} numberOfLines={1}>
                {li.productName} ×{li.qty}
              </Text>
            </View>
          ))}
          {item.items.length > 2 && (
            <View style={[styles.itemPill, { backgroundColor: colors.secondary }]}>
              <Text style={[styles.itemPillText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                +{item.items.length - 2} more
              </Text>
            </View>
          )}
        </View>
        <Text style={[styles.cardTotal, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>
          ₹{item.total.toLocaleString()}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function SupplierCard({ item, onEdit, onDelete }: { item: Supplier; onEdit: () => void; onDelete: () => void }) {
  const colors = useColors();
  const initials = item.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <View style={[styles.suppCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.suppRow}>
        <View style={[styles.suppAvatar, { backgroundColor: "#4F46E520" }]}>
          <Text style={[styles.suppInitials, { color: "#4F46E5", fontFamily: "Inter_700Bold" }]}>{initials}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.suppName, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={[styles.suppContact, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]} numberOfLines={1}>
            {item.phone}
          </Text>
        </View>
        <View style={{ flexDirection: "row", gap: 4 }}>
          <TouchableOpacity style={[styles.suppAction, { borderColor: colors.border }]} onPress={onEdit}>
            <Feather name="edit-2" size={14} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.suppAction, { borderColor: colors.border }]} onPress={onDelete}>
            <Feather name="trash-2" size={14} color={colors.destructive} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={[styles.suppStats, { borderTopColor: colors.border }]}>
        <View style={styles.suppStat}>
          <Text style={[styles.suppStatVal, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>{item.totalOrders}</Text>
          <Text style={[styles.suppStatKey, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Orders</Text>
        </View>
        <View style={[styles.suppStatDiv, { backgroundColor: colors.border }]} />
        <View style={styles.suppStat}>
          <Text style={[styles.suppStatVal, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>
            ₹{Math.round(item.totalSpend / 1000)}k
          </Text>
          <Text style={[styles.suppStatKey, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Spend</Text>
        </View>
        <View style={[styles.suppStatDiv, { backgroundColor: colors.border }]} />
        <View style={styles.suppStat}>
          <Text style={[styles.suppStatVal, { color: colors.foreground, fontFamily: "Inter_700Bold" }]} numberOfLines={1}>
            {item.lastPurchase}
          </Text>
          <Text style={[styles.suppStatKey, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Last order</Text>
        </View>
      </View>
    </View>
  );
}

export default function PurchasesScreen() {
  const colors    = useColors();
  const insets    = useSafeAreaInsets();
  const topPad    = Platform.OS === "web" ? 67 : insets.top;
  const TAB_BAR_H = Platform.OS === "web" ? 84 : 49;
  const botPad    = TAB_BAR_H + (Platform.OS === "web" ? 0 : insets.bottom);

  const [tab,          setTab]          = useState<Tab>("orders");
  const [orderFilter,  setOrderFilter]  = useState<string>("All");
  const [purchases,    setPurchases]    = useState(() => getPurchases());
  const [suppliers,    setSuppliers]    = useState(() => getSuppliers());

  useFocusEffect(useCallback(() => {
    setPurchases(getPurchases());
    setSuppliers(getSuppliers());
    const u1 = subscribePurchases(() => setPurchases(getPurchases()));
    const u2 = subscribeSuppliers(() => setSuppliers(getSuppliers()));
    return () => { u1(); u2(); };
  }, []));

  const filteredOrders = purchases.filter((p) =>
    orderFilter === "All" || p.status === orderFilter.toLowerCase()
  );

  const totalSpend = purchases
    .filter((p) => p.status === "delivered")
    .reduce((s, p) => s + p.total, 0);

  const handleDeleteSupplier = (s: Supplier) => {
    Alert.alert("Delete Supplier", `Remove "${s.name}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteSupplier(s.id) },
    ]);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.primary }]}>
        <View>
          <Text style={[styles.headerTitle, { fontFamily: "Inter_700Bold" }]}>Purchases</Text>
          <Text style={[styles.headerSub, { fontFamily: "Inter_400Regular" }]}>
            ₹{Math.round(totalSpend / 1000)}k total spend · {suppliers.length} suppliers
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/purchase/new" as any)}
          style={[styles.headerNewBtn, { backgroundColor: "#10B981" }]}
        >
          <Feather name="plus" size={16} color="#fff" />
          <Text style={[styles.headerNewText, { fontFamily: "Inter_700Bold" }]}>New PO</Text>
        </TouchableOpacity>
      </View>

      {/* Tab toggle */}
      <View style={[styles.tabRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {(["orders", "suppliers"] as Tab[]).map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            style={[styles.tabBtn, tab === t && { backgroundColor: colors.primary }]}
          >
            <Feather
              name={t === "orders" ? "shopping-bag" : "users"}
              size={14}
              color={tab === t ? "#fff" : colors.mutedForeground}
            />
            <Text style={[styles.tabBtnText, {
              color: tab === t ? "#fff" : colors.mutedForeground,
              fontFamily: tab === t ? "Inter_600SemiBold" : "Inter_400Regular",
            }]}>
              {t === "orders" ? `Orders (${purchases.length})` : `Suppliers (${suppliers.length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === "orders" ? (
        <>
          {/* Order filter chips */}
          <ScrollView
            horizontal showsHorizontalScrollIndicator={false}
            style={{ flexGrow: 0, flexShrink: 0 }}
            contentContainerStyle={styles.filterChips}
          >
            {ORDER_FILTERS.map((f) => (
              <TouchableOpacity
                key={f}
                onPress={() => setOrderFilter(f)}
                style={[styles.filterChip, {
                  backgroundColor: orderFilter === f ? colors.primary : colors.card,
                  borderColor: orderFilter === f ? colors.primary : colors.border,
                }]}
              >
                <Text style={[styles.filterChipText, {
                  color: orderFilter === f ? "#fff" : colors.mutedForeground,
                  fontFamily: orderFilter === f ? "Inter_600SemiBold" : "Inter_400Regular",
                }]}>{f}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Stats bar */}
          <View style={[styles.statsBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {[
              { label: "Total POs",   value: String(purchases.length), color: colors.foreground },
              { label: "Delivered",   value: String(purchases.filter(p => p.status === "delivered").length), color: "#10B981" },
              { label: "Pending",     value: String(purchases.filter(p => p.status === "pending").length),   color: "#F59E0B" },
            ].map((s, i, arr) => (
              <React.Fragment key={s.label}>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: s.color, fontFamily: "Inter_700Bold" }]}>{s.value}</Text>
                  <Text style={[styles.statLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{s.label}</Text>
                </View>
                {i < arr.length - 1 && <View style={[styles.statDiv, { backgroundColor: colors.border }]} />}
              </React.Fragment>
            ))}
          </View>

          <ScrollView
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.list, { paddingBottom: botPad + 20 }]}
          >
            {filteredOrders.length === 0 ? (
              <View style={styles.empty}>
                <Feather name="package" size={36} color={colors.mutedForeground} />
                <Text style={[styles.emptyText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  No purchase orders
                </Text>
              </View>
            ) : (
              filteredOrders.map((item) => (
                <PurchaseCard
                  key={item.id}
                  item={item}
                  onPress={() => router.push(`/purchase/${item.id}` as any)}
                />
              ))
            )}
          </ScrollView>
        </>
      ) : (
        <>
          <ScrollView
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.list, { paddingBottom: botPad + 80 }]}
          >
            {suppliers.map((s) => (
              <SupplierCard
                key={s.id}
                item={s}
                onEdit={() => router.push(`/suppliers/edit?id=${s.id}` as any)}
                onDelete={() => handleDeleteSupplier(s)}
              />
            ))}
          </ScrollView>

          {/* Supplier FAB */}
          <TouchableOpacity
            style={[styles.fab, { backgroundColor: colors.primary, bottom: botPad + 16 }]}
            onPress={() => router.push("/suppliers/edit" as any)}
          >
            <Feather name="user-plus" size={18} color="#fff" />
            <Text style={[styles.fabText, { fontFamily: "Inter_700Bold" }]}>Add Supplier</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  header: {
    flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between",
    paddingHorizontal: 16, paddingBottom: 12,
  },
  headerTitle: { color: "#fff", fontSize: 22 },
  headerSub:   { color: "rgba(255,255,255,0.75)", fontSize: 12, marginTop: 1 },
  headerNewBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10,
  },
  headerNewText: { color: "#fff", fontSize: 13 },

  tabRow: {
    flexDirection: "row", margin: 12, marginBottom: 6,
    borderRadius: 12, padding: 4, gap: 4, borderWidth: 1,
  },
  tabBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, paddingVertical: 8, borderRadius: 9,
  },
  tabBtnText: { fontSize: 13 },

  filterChips: { paddingHorizontal: 12, paddingVertical: 6, gap: 7 },
  filterChip: {
    paddingHorizontal: 13, paddingVertical: 5,
    borderRadius: 16, borderWidth: 1,
  },
  filterChipText: { fontSize: 12 },

  statsBar: {
    flexDirection: "row", alignItems: "center",
    marginHorizontal: 12, marginBottom: 8,
    borderRadius: 12, borderWidth: 1, padding: 12,
  },
  statItem:  { flex: 1, alignItems: "center", gap: 2 },
  statValue: { fontSize: 16 },
  statLabel: { fontSize: 11 },
  statDiv:   { width: 1, height: 28, marginHorizontal: 4 },

  list: { paddingHorizontal: 12, paddingTop: 4, gap: 10 },

  card: {
    borderRadius: 14, borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12 },
  vendorAvatar: {
    width: 44, height: 44, borderRadius: 11,
    alignItems: "center", justifyContent: "center",
  },
  cardSupplier: { fontSize: 14, marginBottom: 2 },
  cardMeta:     { fontSize: 11 },
  statusBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8,
  },
  statusText: { fontSize: 10 },
  cardFooter: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 12, paddingVertical: 9, borderTopWidth: 1,
    gap: 8,
  },
  itemPills:    { flexDirection: "row", flexWrap: "wrap", gap: 5, flex: 1 },
  itemPill:     { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6, maxWidth: 140 },
  itemPillText: { fontSize: 11 },
  cardTotal:    { fontSize: 16 },

  suppCard: {
    borderRadius: 14, borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  suppRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12 },
  suppAvatar: {
    width: 46, height: 46, borderRadius: 23,
    alignItems: "center", justifyContent: "center",
  },
  suppInitials: { fontSize: 15 },
  suppName:     { fontSize: 14, marginBottom: 2 },
  suppContact:  { fontSize: 12 },
  suppAction: {
    width: 32, height: 32, borderRadius: 8, borderWidth: 1,
    alignItems: "center", justifyContent: "center",
  },
  suppStats: {
    flexDirection: "row", borderTopWidth: 1, padding: 10,
  },
  suppStat:    { flex: 1, alignItems: "center", gap: 2 },
  suppStatVal: { fontSize: 14 },
  suppStatKey: { fontSize: 10 },
  suppStatDiv: { width: 1, marginVertical: 2 },

  empty:     { alignItems: "center", gap: 10, paddingTop: 60 },
  emptyText: { fontSize: 14 },

  fab: {
    position: "absolute", right: 16,
    flexDirection: "row", alignItems: "center", gap: 7,
    paddingHorizontal: 18, paddingVertical: 13,
    borderRadius: 28,
    shadowColor: "#4F46E5", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 10, elevation: 8,
  },
  fabText: { color: "#fff", fontSize: 15 },
});
