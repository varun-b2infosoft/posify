import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { CUSTOMER_PRIMARY, CUSTOMER_SHOPS, setCartShop, CustomerShop } from "@/store/customerApp";

function StarRow({ rating }: { rating: number }) {
  return (
    <View style={{ flexDirection: "row", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Feather
          key={s}
          name="star"
          size={10}
          color={s <= Math.round(rating) ? "#F59E0B" : "#D1D5DB"}
        />
      ))}
    </View>
  );
}

export default function ShopsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 60 : insets.top;
  const [query, setQuery] = useState("");

  const filtered = CUSTOMER_SHOPS.filter(s =>
    s.name.toLowerCase().includes(query.toLowerCase()) ||
    s.address.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelectShop = (shop: CustomerShop) => {
    setCartShop(shop.id, shop.name);
    router.push(("/customer/browse?shopId=" + shop.id + "&shopName=" + encodeURIComponent(shop.name)) as any);
  };

  const CATEGORY_COLORS: Record<string, string> = {
    General: CUSTOMER_PRIMARY,
    Specialty: "#8B5CF6",
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: CUSTOMER_PRIMARY, paddingTop: topPad + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { fontFamily: "Inter_700Bold" }]}>Select a Shop</Text>
          <Text style={[styles.headerSub, { fontFamily: "Inter_400Regular" }]}>Nearby shops open for orders</Text>
        </View>
      </View>

      {/* Search bar */}
      <View style={[styles.searchWrap, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
            placeholder="Search shops or area..."
            placeholderTextColor={colors.mutedForeground}
            value={query}
            onChangeText={setQuery}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }} showsVerticalScrollIndicator={false}>
        {/* Nearest shops banner */}
        <View style={[styles.nearestBanner, { backgroundColor: CUSTOMER_PRIMARY + "12" }]}>
          <Feather name="map-pin" size={16} color={CUSTOMER_PRIMARY} />
          <Text style={[styles.nearestText, { color: CUSTOMER_PRIMARY, fontFamily: "Inter_500Medium" }]}>
            Showing shops near Koramangala, Bengaluru
          </Text>
        </View>

        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Feather name="search" size={40} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              No shops found for "{query}"
            </Text>
          </View>
        ) : (
          filtered.map((shop) => (
            <TouchableOpacity
              key={shop.id}
              style={[
                styles.shopCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  opacity: shop.isOpen ? 1 : 0.65,
                },
              ]}
              onPress={() => shop.isOpen && handleSelectShop(shop)}
              activeOpacity={shop.isOpen ? 0.8 : 1}
            >
              {/* Shop icon */}
              <View style={[styles.shopIcon, { backgroundColor: CUSTOMER_PRIMARY + "18" }]}>
                <Feather name="shopping-bag" size={28} color={CUSTOMER_PRIMARY} />
              </View>

              <View style={{ flex: 1, gap: 5 }}>
                <View style={styles.shopNameRow}>
                  <Text style={[styles.shopName, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                    {shop.name}
                  </Text>
                  <View style={[styles.categoryBadge, { backgroundColor: (CATEGORY_COLORS[shop.category] || "#6B7280") + "18" }]}>
                    <Text style={[styles.categoryText, { color: CATEGORY_COLORS[shop.category] || "#6B7280", fontFamily: "Inter_600SemiBold" }]}>
                      {shop.category}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.shopAddress, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  {shop.address}
                </Text>
                <View style={styles.shopMeta}>
                  <StarRow rating={shop.rating} />
                  <Text style={[styles.metaText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                    {shop.rating}
                  </Text>
                  <View style={styles.metaDot} />
                  <Feather name="map-pin" size={11} color={colors.mutedForeground} />
                  <Text style={[styles.metaText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                    {shop.distance}
                  </Text>
                </View>
              </View>

              <View style={{ alignItems: "flex-end", gap: 8 }}>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: shop.isOpen ? CUSTOMER_PRIMARY + "18" : "#EF444418" },
                  ]}
                >
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: shop.isOpen ? CUSTOMER_PRIMARY : "#EF4444" },
                    ]}
                  />
                  <Text
                    style={[
                      styles.statusText,
                      {
                        color:      shop.isOpen ? CUSTOMER_PRIMARY : "#EF4444",
                        fontFamily: "Inter_600SemiBold",
                      },
                    ]}
                  >
                    {shop.isOpen ? "Open" : "Closed"}
                  </Text>
                </View>
                {shop.isOpen && (
                  <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:          { flex: 1 },
  header:        { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingBottom: 18 },
  headerTitle:   { color: "#fff", fontSize: 18, fontWeight: "700" },
  headerSub:     { color: "rgba(255,255,255,0.8)", fontSize: 12 },
  searchWrap:    { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  searchBar:     { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, height: 44, borderRadius: 12, borderWidth: 1 },
  searchInput:   { flex: 1, fontSize: 14 },
  nearestBanner: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: 12 },
  nearestText:   { fontSize: 13 },
  empty:         { alignItems: "center", gap: 12, paddingVertical: 60 },
  emptyText:     { fontSize: 14, textAlign: "center" },
  shopCard:      { flexDirection: "row", alignItems: "flex-start", gap: 14, padding: 16, borderRadius: 16, borderWidth: 1 },
  shopIcon:      { width: 56, height: 56, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  shopNameRow:   { flexDirection: "row", alignItems: "center", gap: 8 },
  shopName:      { fontSize: 15 },
  categoryBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  categoryText:  { fontSize: 10 },
  shopAddress:   { fontSize: 12, lineHeight: 18 },
  shopMeta:      { flexDirection: "row", alignItems: "center", gap: 5 },
  metaText:      { fontSize: 11 },
  metaDot:       { width: 3, height: 3, borderRadius: 2, backgroundColor: "#9CA3AF" },
  statusBadge:   { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  statusDot:     { width: 6, height: 6, borderRadius: 3 },
  statusText:    { fontSize: 11 },
});
