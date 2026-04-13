import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import {
  CATEGORIES,
  CATEGORY_COLORS,
  CATEGORY_ICONS,
  Product,
  deleteProduct,
  getProducts,
  subscribeProducts,
} from "@/store/products";

const FILTER_CATS = ["All", ...CATEGORIES];
const STOCK_FILTERS = ["All Stock", "Low Stock", "In Stock"];

function stockStyle(item: Product) {
  if (item.stock === 0) return { bg: "#FEE2E2", text: "#B91C1C", label: "Out of stock" };
  if (item.stock <= item.lowStockThreshold) return { bg: "#FEF3C7", text: "#92400E", label: `${item.stock} ${item.unit}` };
  return { bg: "#D1FAE5", text: "#065F46", label: `${item.stock} ${item.unit}` };
}

function ProductRow({ item, onPress, onLongPress }: { item: Product; onPress: () => void; onLongPress: () => void }) {
  const colors   = useColors();
  const catColor = CATEGORY_COLORS[item.category] ?? CATEGORY_COLORS.default;
  const catIcon  = CATEGORY_ICONS[item.category]  ?? CATEGORY_ICONS.default;
  const stock    = stockStyle(item);

  return (
    <TouchableOpacity
      style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.78}
    >
      {/* Category icon */}
      <View style={[styles.iconBox, { backgroundColor: catColor + "18" }]}>
        <Feather name={catIcon as any} size={22} color={catColor} />
      </View>

      {/* Info */}
      <View style={{ flex: 1, gap: 3 }}>
        <Text style={[styles.rowName, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={[styles.rowMeta, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          {item.sku} · {item.category}
        </Text>
      </View>

      {/* Right: price + stock */}
      <View style={{ alignItems: "flex-end", gap: 5 }}>
        <Text style={[styles.rowPrice, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>
          ₹{item.price.toLocaleString()}
        </Text>
        <View style={[styles.stockPill, { backgroundColor: stock.bg }]}>
          <View style={[styles.stockDot, { backgroundColor: stock.text }]} />
          <Text style={[styles.stockLabel, { color: stock.text, fontFamily: "Inter_600SemiBold" }]}>
            {stock.label}
          </Text>
        </View>
      </View>

      <Feather name="chevron-right" size={16} color={colors.mutedForeground} style={{ marginLeft: 4 }} />
    </TouchableOpacity>
  );
}

export default function ProductsScreen() {
  const colors    = useColors();
  const insets    = useSafeAreaInsets();
  const topPad    = Platform.OS === "web" ? 67 : insets.top;
  const TAB_BAR_H = Platform.OS === "web" ? 84 : 49;
  const bottomPad = TAB_BAR_H + (Platform.OS === "web" ? 0 : insets.bottom);

  const [products,      setProducts]      = useState(() => getProducts());
  const [search,        setSearch]        = useState("");
  const [activeCat,     setActiveCat]     = useState("All");
  const [stockFilter,   setStockFilter]   = useState("All Stock");
  const [showFilters,   setShowFilters]   = useState(false);

  useFocusEffect(useCallback(() => {
    setProducts(getProducts());
    const unsub = subscribeProducts(() => setProducts(getProducts()));
    return unsub;
  }, []));

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch = p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
    const matchCat = activeCat === "All" || p.category === activeCat;
    const matchStock =
      stockFilter === "All Stock" ? true :
      stockFilter === "Low Stock" ? p.stock <= p.lowStockThreshold :
      p.stock > p.lowStockThreshold;
    return matchSearch && matchCat && matchStock;
  });

  const lowCount = products.filter((p) => p.stock <= p.lowStockThreshold).length;

  const handleLongPress = (item: Product) => {
    Alert.alert(item.name, "Choose an action", [
      { text: "Edit", onPress: () => router.push(`/product/edit?id=${item.id}` as any) },
      {
        text: "Delete", style: "destructive",
        onPress: () => Alert.alert("Delete Product", `Are you sure you want to delete "${item.name}"?`, [
          { text: "Cancel", style: "cancel" },
          { text: "Delete", style: "destructive", onPress: () => deleteProduct(item.id) },
        ]),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.primary }]}>
        <View>
          <Text style={[styles.headerTitle, { fontFamily: "Inter_700Bold" }]}>Products</Text>
          <Text style={[styles.headerSub, { fontFamily: "Inter_400Regular" }]}>
            {products.length} items · {lowCount > 0 ? `${lowCount} low stock` : "all stocked"}
          </Text>
        </View>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <TouchableOpacity
            onPress={() => setShowFilters((v) => !v)}
            style={[styles.headerBtn, { backgroundColor: showFilters ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.2)" }]}
          >
            <Feather name="sliders" size={17} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("/product/edit" as any)}
            style={[styles.headerBtn, { backgroundColor: "rgba(255,255,255,0.2)" }]}
          >
            <Feather name="plus" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search */}
      <View style={[styles.searchWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Feather name="search" size={15} color={colors.mutedForeground} />
        <TextInput
          style={[styles.searchInput, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
          placeholder="Search by name or SKU..."
          placeholderTextColor={colors.mutedForeground}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Feather name="x" size={15} color={colors.mutedForeground} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter panel */}
      {showFilters && (
        <View style={[styles.filterPanel, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.filterLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>Stock</Text>
          <View style={{ flexDirection: "row", gap: 6 }}>
            {STOCK_FILTERS.map((f) => (
              <TouchableOpacity
                key={f}
                onPress={() => setStockFilter(f)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: stockFilter === f ? colors.primary : colors.secondary,
                    borderColor: stockFilter === f ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text style={[styles.filterChipText, {
                  color: stockFilter === f ? "#fff" : colors.mutedForeground,
                  fontFamily: "Inter_500Medium",
                }]}>
                  {f}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Category tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0, flexShrink: 0 }}
        contentContainerStyle={styles.catTabs}
      >
        {FILTER_CATS.map((cat) => {
          const active = activeCat === cat;
          const catColor = CATEGORY_COLORS[cat] ?? null;
          return (
            <TouchableOpacity
              key={cat}
              onPress={() => setActiveCat(cat)}
              style={[
                styles.catChip,
                {
                  backgroundColor: active ? (catColor ?? colors.primary) : colors.card,
                  borderColor: active ? (catColor ?? colors.primary) : colors.border,
                },
              ]}
            >
              {cat !== "All" && (
                <Feather
                  name={(CATEGORY_ICONS[cat] ?? "box") as any}
                  size={11}
                  color={active ? "#fff" : (catColor ?? colors.primary)}
                />
              )}
              <Text style={[styles.catChipText, {
                color: active ? "#fff" : colors.mutedForeground,
                fontFamily: active ? "Inter_600SemiBold" : "Inter_400Regular",
              }]}>
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Product list */}
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.list, { paddingBottom: bottomPad + 80 }]}
      >
        {/* Summary bar */}
        <View style={[styles.summaryBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>{filtered.length}</Text>
            <Text style={[styles.summaryKey, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Showing</Text>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: "#F59E0B", fontFamily: "Inter_700Bold" }]}>{lowCount}</Text>
            <Text style={[styles.summaryKey, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Low stock</Text>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
              ₹{Math.round(filtered.reduce((s, p) => s + p.price * p.stock, 0) / 1000)}k
            </Text>
            <Text style={[styles.summaryKey, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Inventory value</Text>
          </View>
        </View>

        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <View style={[styles.emptyCircle, { backgroundColor: colors.secondary }]}>
              <Feather name="package" size={32} color={colors.mutedForeground} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>No products found</Text>
            <Text style={[styles.emptySub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Try adjusting your search or filters
            </Text>
          </View>
        ) : (
          filtered.map((item) => (
            <ProductRow
              key={item.id}
              item={item}
              onPress={() => router.push(`/product/${item.id}` as any)}
              onLongPress={() => handleLongPress(item)}
            />
          ))
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary, bottom: bottomPad + 16 }]}
        onPress={() => router.push("/product/edit" as any)}
        activeOpacity={0.85}
      >
        <Feather name="plus" size={22} color="#fff" />
        <Text style={[styles.fabText, { fontFamily: "Inter_700Bold" }]}>Add Product</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerTitle: { color: "#fff", fontSize: 22 },
  headerSub:   { color: "rgba(255,255,255,0.75)", fontSize: 12, marginTop: 1 },
  headerBtn: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
  },

  searchWrap: {
    flexDirection: "row", alignItems: "center", gap: 10,
    margin: 12, marginBottom: 6, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 14 },

  filterPanel: {
    marginHorizontal: 12, marginBottom: 6,
    borderRadius: 12, borderWidth: 1,
    padding: 12, gap: 8,
  },
  filterLabel:    { fontSize: 11 },
  filterChip: {
    paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 16, borderWidth: 1,
  },
  filterChipText: { fontSize: 12 },

  catTabs: { paddingHorizontal: 12, paddingVertical: 7, gap: 6 },
  catChip: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 16, borderWidth: 1,
  },
  catChipText: { fontSize: 12 },

  list: { paddingHorizontal: 12, paddingTop: 8, gap: 8 },

  summaryBar: {
    flexDirection: "row", borderRadius: 12,
    borderWidth: 1, padding: 12, marginBottom: 4,
  },
  summaryItem:    { flex: 1, alignItems: "center", gap: 2 },
  summaryValue:   { fontSize: 16 },
  summaryKey:     { fontSize: 11 },
  summaryDivider: { width: 1, marginVertical: 2 },

  row: {
    flexDirection: "row", alignItems: "center", gap: 12,
    borderRadius: 14, padding: 13, borderWidth: 1,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  iconBox: {
    width: 52, height: 52, borderRadius: 13,
    alignItems: "center", justifyContent: "center",
  },
  rowName:    { fontSize: 14 },
  rowMeta:    { fontSize: 12 },
  rowPrice:   { fontSize: 16 },
  stockPill: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
  },
  stockDot:   { width: 6, height: 6, borderRadius: 3 },
  stockLabel: { fontSize: 11 },

  empty:       { alignItems: "center", gap: 10, paddingTop: 60 },
  emptyCircle: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center" },
  emptyTitle:  { fontSize: 16 },
  emptySub:    { fontSize: 13, textAlign: "center" },

  fab: {
    position: "absolute", right: 16,
    flexDirection: "row", alignItems: "center", gap: 7,
    paddingHorizontal: 18, paddingVertical: 13,
    borderRadius: 28,
    shadowColor: "#4F46E5", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 10, elevation: 8,
  },
  fabText: { color: "#fff", fontSize: 15 },
});
