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
import { router, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { useColors } from "@/hooks/useColors";
import {
  CATEGORY_COLORS,
  CATEGORY_ICONS,
  Product,
  deleteProduct,
  getProduct,
} from "@/store/products";

function StatCard({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  const colors = useColors();
  return (
    <View style={[statStyles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[statStyles.icon, { backgroundColor: color + "18" }]}>
        <Feather name={icon as any} size={16} color={color} />
      </View>
      <Text style={[statStyles.value, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>{value}</Text>
      <Text style={[statStyles.label, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{label}</Text>
    </View>
  );
}

const statStyles = StyleSheet.create({
  card: { flex: 1, borderRadius: 12, padding: 12, alignItems: "center", gap: 4, borderWidth: 1 },
  icon: { width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  value: { fontSize: 16 },
  label: { fontSize: 11, textAlign: "center" },
});

function InfoRow({ label, value, color }: { label: string; value: string; color?: string }) {
  const colors = useColors();
  return (
    <View style={infoStyles.row}>
      <Text style={[infoStyles.label, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{label}</Text>
      <Text style={[infoStyles.value, { color: color ?? colors.foreground, fontFamily: "Inter_500Medium" }]}>{value}</Text>
    </View>
  );
}

const infoStyles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 9 },
  label: { fontSize: 13 },
  value: { fontSize: 13 },
});

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors  = useColors();
  const insets  = useSafeAreaInsets();
  const topPad  = Platform.OS === "web" ? 67 : insets.top;
  const botPad  = Platform.OS === "web" ? 24 : insets.bottom + 16;

  const [product, setProduct] = useState<Product | undefined>(() => getProduct(id));

  useFocusEffect(useCallback(() => {
    setProduct(getProduct(id));
  }, [id]));

  if (!product) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background, paddingTop: topPad }]}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 16 }}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <View style={styles.notFound}>
          <Feather name="alert-circle" size={40} color={colors.mutedForeground} />
          <Text style={[{ color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Product not found</Text>
        </View>
      </View>
    );
  }

  const catColor = CATEGORY_COLORS[product.category] ?? CATEGORY_COLORS.default;
  const catIcon  = CATEGORY_ICONS[product.category]  ?? CATEGORY_ICONS.default;

  const isOut  = product.stock === 0;
  const isLow  = product.stock <= product.lowStockThreshold;
  const stockStyle = isOut
    ? { bg: "#FEE2E2", text: "#B91C1C", label: "Out of stock" }
    : isLow
    ? { bg: "#FEF3C7", text: "#92400E", label: `${product.stock} ${product.unit} — Low` }
    : { bg: "#D1FAE5", text: "#065F46", label: `${product.stock} ${product.unit}` };

  const handleDelete = () => {
    Alert.alert("Delete Product", `Delete "${product.name}"? This cannot be undone.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: () => { deleteProduct(product.id); router.back(); },
      },
    ]);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: catColor }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { fontFamily: "Inter_600SemiBold" }]} numberOfLines={1}>{product.name}</Text>
        <TouchableOpacity
          onPress={() => router.push(`/product/edit?id=${product.id}` as any)}
          style={styles.editBtn}
        >
          <Feather name="edit-2" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: botPad + 80 }]}>
        {/* Hero image / icon */}
        <View style={[styles.heroCard, { backgroundColor: catColor + "14", borderColor: catColor + "30" }]}>
          <View style={[styles.heroIcon, { backgroundColor: catColor + "25" }]}>
            <Feather name={catIcon as any} size={56} color={catColor} />
          </View>
          <Text style={[styles.heroName, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>{product.name}</Text>
          <Text style={[styles.heroPrice, { color: catColor, fontFamily: "Inter_700Bold" }]}>
            ₹{product.price.toLocaleString()}
          </Text>
          <View style={[styles.stockBadge, { backgroundColor: stockStyle.bg }]}>
            <View style={[styles.stockDot, { backgroundColor: stockStyle.text }]} />
            <Text style={[styles.stockText, { color: stockStyle.text, fontFamily: "Inter_600SemiBold" }]}>
              {stockStyle.label}
            </Text>
          </View>
        </View>

        {/* Analytics */}
        <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>Analytics</Text>
        <View style={styles.statsRow}>
          <StatCard icon="shopping-bag"  label="Total Sold"       value={product.totalSold.toString()} color="#4F46E5" />
          <StatCard icon="trending-up"   label="Revenue"          value={`₹${Math.round(product.revenue / 1000)}k`} color="#10B981" />
          <StatCard icon="clock"         label="Last Sold"        value={product.lastSold}              color="#F59E0B" />
        </View>

        {/* Product info */}
        <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>Details</Text>
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <InfoRow label="SKU"            value={product.sku} />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <InfoRow label="Category"       value={product.category} color={catColor} />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <InfoRow label="Unit"           value={product.unit} />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <InfoRow label="Price"          value={`₹${product.price.toLocaleString()}`} color={colors.primary} />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <InfoRow label="Current Stock"  value={`${product.stock} ${product.unit}`} color={stockStyle.text} />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <InfoRow label="Low Stock Alert" value={`≤ ${product.lowStockThreshold} ${product.unit}`} />
        </View>
      </ScrollView>

      {/* Sticky bottom actions */}
      <View style={[styles.bottomBar, { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: botPad }]}>
        <TouchableOpacity
          style={[styles.deleteBtn, { borderColor: colors.destructive }]}
          onPress={handleDelete}
        >
          <Feather name="trash-2" size={16} color={colors.destructive} />
          <Text style={[styles.deleteBtnText, { color: colors.destructive, fontFamily: "Inter_600SemiBold" }]}>Delete</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.editBtnLarge, { backgroundColor: colors.primary, flex: 1 }]}
          onPress={() => router.push(`/product/edit?id=${product.id}` as any)}
        >
          <Feather name="edit-2" size={16} color="#fff" />
          <Text style={[styles.editBtnText, { fontFamily: "Inter_700Bold" }]}>Edit Product</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  notFound: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },

  header: {
    flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between",
    paddingHorizontal: 16, paddingBottom: 14,
  },
  backBtn:     { padding: 2 },
  headerTitle: { flex: 1, color: "#fff", fontSize: 17, marginHorizontal: 12, textAlign: "center" },
  editBtn:     { padding: 2 },

  content: { paddingHorizontal: 14, paddingTop: 16, gap: 12 },

  heroCard: {
    borderRadius: 18, borderWidth: 1, padding: 24,
    alignItems: "center", gap: 10,
  },
  heroIcon: {
    width: 100, height: 100, borderRadius: 24,
    alignItems: "center", justifyContent: "center",
  },
  heroName:   { fontSize: 20, textAlign: "center" },
  heroPrice:  { fontSize: 26 },
  stockBadge: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20,
  },
  stockDot:  { width: 7, height: 7, borderRadius: 3.5 },
  stockText: { fontSize: 13 },

  sectionTitle: { fontSize: 15, marginTop: 4 },

  statsRow: { flexDirection: "row", gap: 8 },

  infoCard: { borderRadius: 14, borderWidth: 1, paddingHorizontal: 14 },
  divider:  { height: 1 },

  bottomBar: {
    flexDirection: "row", gap: 10, padding: 14, paddingTop: 12,
    borderTopWidth: 1,
  },
  deleteBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 16, paddingVertical: 13,
    borderRadius: 12, borderWidth: 1.5,
  },
  deleteBtnText: { fontSize: 14 },
  editBtnLarge: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7,
    paddingVertical: 13, borderRadius: 12,
  },
  editBtnText: { color: "#fff", fontSize: 15 },
});
