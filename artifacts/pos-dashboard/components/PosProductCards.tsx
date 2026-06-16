import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useColors } from "@/hooks/useColors";
import {
  isWeightBased,
  formatQty,
  CATEGORY_COLORS,
  CATEGORY_ICONS,
} from "@/store/products";
import type { PosViewMode } from "@/store/posLayout";

export interface StoreProduct {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  unit: string;
  image?: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  unit: string;
  weightBased: boolean;
}

export const VIEW_MODES: Array<{ key: PosViewMode; icon: string; label: string }> = [
  { key: "grid3",    icon: "grid",          label: "3-Col"   },
  { key: "grid4",    icon: "grid",          label: "4-Col"   },
  { key: "gridflat", icon: "layout",        label: "Flat"    },
  { key: "list",     icon: "list",          label: "List"    },
  { key: "listslim", icon: "align-justify", label: "Slim"    },
];

/* ────────────────────────────────────────────────
   ViewModeBar — horizontal pill selector
──────────────────────────────────────────────── */
export function ViewModeBar({
  mode,
  onChange,
}: {
  mode: PosViewMode;
  onChange: (m: PosViewMode) => void;
}) {
  const colors = useColors();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.modeWrap}
      contentContainerStyle={styles.modeBar}
    >
      {VIEW_MODES.map(vm => {
        const active = mode === vm.key;
        return (
          <TouchableOpacity
            key={vm.key}
            style={[
              styles.modeBtn,
              {
                backgroundColor: active ? colors.primary : colors.card,
                borderColor:     active ? colors.primary : colors.border,
              },
            ]}
            onPress={() => onChange(vm.key)}
            activeOpacity={0.8}
          >
            <Feather
              name={vm.icon as any}
              size={12}
              color={active ? "#fff" : colors.mutedForeground}
            />
            {vm.key === "grid3" && (
              <Text style={[styles.modeSuperscript, { color: active ? "rgba(255,255,255,0.75)" : colors.mutedForeground }]}>3</Text>
            )}
            {vm.key === "grid4" && (
              <Text style={[styles.modeSuperscript, { color: active ? "rgba(255,255,255,0.75)" : colors.mutedForeground }]}>4</Text>
            )}
            <Text
              style={[
                styles.modeBtnText,
                {
                  color:      active ? "#fff" : colors.mutedForeground,
                  fontFamily: active ? "Inter_600SemiBold" : "Inter_400Regular",
                },
              ]}
            >
              {vm.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

/* ────────────────────────────────────────────────
   CompactGridTile — grid without images
──────────────────────────────────────────────── */
export function CompactGridTile({
  item,
  cartItem,
  onPress,
}: {
  item: StoreProduct;
  cartItem?: CartItem;
  onPress: () => void;
}) {
  const colors      = useColors();
  const inCart      = !!cartItem;
  const catColor    = CATEGORY_COLORS[item.category] ?? CATEGORY_COLORS.default;
  const catIcon     = CATEGORY_ICONS[item.category]  ?? CATEGORY_ICONS.default;
  const weightItem  = isWeightBased(item.unit);
  const isOut       = item.stock === 0;
  const isLow       = item.stock > 0 && item.stock <= 5;
  const qtyLabel    = cartItem
    ? (weightItem ? formatQty(cartItem.qty, item.unit) : `×${cartItem.qty}`)
    : null;

  return (
    <TouchableOpacity
      style={[
        styles.flatTile,
        {
          backgroundColor: inCart ? colors.primary + "12" : catColor + "0E",
          borderColor:     inCart ? colors.primary : isOut ? "#EF444440" : catColor + "35",
          borderWidth:     inCart ? 1.5 : 1,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.flatTop}>
        <View style={[styles.flatIcon, { backgroundColor: inCart ? colors.primary + "22" : catColor + "1C" }]}>
          <Feather name={catIcon as any} size={15} color={inCart ? colors.primary : catColor} />
        </View>
        <View style={{ flex: 1 }} />
        {inCart ? (
          <View style={[styles.flatBadge, { backgroundColor: colors.primary }]}>
            <Text style={[styles.flatBadgeText, { fontFamily: "Inter_700Bold" }]}>{qtyLabel}</Text>
          </View>
        ) : isOut ? (
          <View style={[styles.flatDot, { backgroundColor: "#EF4444" }]} />
        ) : isLow ? (
          <View style={[styles.flatDot, { backgroundColor: "#F59E0B" }]} />
        ) : null}
      </View>

      <Text
        style={[
          styles.flatName,
          { color: inCart ? colors.primary : colors.foreground, fontFamily: inCart ? "Inter_600SemiBold" : "Inter_500Medium" },
        ]}
        numberOfLines={2}
      >
        {item.name}
      </Text>
      <Text style={[styles.flatPrice, { color: catColor, fontFamily: "Inter_700Bold" }]}>
        ₹{item.price}{weightItem ? `/${item.unit}` : ""}
      </Text>
    </TouchableOpacity>
  );
}

/* ────────────────────────────────────────────────
   ListRow — list view with thumbnail
──────────────────────────────────────────────── */
export function ListRow({
  item,
  cartItem,
  onPress,
}: {
  item: StoreProduct;
  cartItem?: CartItem;
  onPress: () => void;
}) {
  const colors     = useColors();
  const inCart     = !!cartItem;
  const catColor   = CATEGORY_COLORS[item.category] ?? CATEGORY_COLORS.default;
  const catIcon    = CATEGORY_ICONS[item.category]  ?? CATEGORY_ICONS.default;
  const weightItem = isWeightBased(item.unit);
  const isOut      = item.stock === 0;
  const isLow      = item.stock > 0 && item.stock <= 5;
  const qtyLabel   = cartItem
    ? (weightItem ? formatQty(cartItem.qty, item.unit) : `×${cartItem.qty}`)
    : null;

  return (
    <TouchableOpacity
      style={[
        styles.listRow,
        {
          backgroundColor: inCart ? colors.primary + "09" : colors.card,
          borderColor:     inCart ? colors.primary + "50" : colors.border,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.78}
    >
      {/* Thumbnail */}
      <View style={[styles.listThumb, { backgroundColor: catColor + "14" }]}>
        {item.image ? (
          <Image
            source={{ uri: item.image }}
            style={styles.listThumbImg}
            contentFit="cover"
            transition={150}
          />
        ) : (
          <Feather name={catIcon as any} size={22} color={catColor} />
        )}
        {inCart && (
          <View style={[styles.listThumbOverlay, { backgroundColor: colors.primary + "55" }]}>
            <Feather name="check" size={13} color="#fff" />
          </View>
        )}
        {weightItem && (
          <View style={[styles.listWeightTag, { backgroundColor: "rgba(0,0,0,0.55)" }]}>
            <Text style={{ color: "#fff", fontSize: 8, fontFamily: "Inter_600SemiBold" }}>{item.unit}</Text>
          </View>
        )}
      </View>

      {/* Info */}
      <View style={styles.listInfo}>
        <Text
          style={[
            styles.listName,
            { color: inCart ? colors.primary : colors.foreground, fontFamily: inCart ? "Inter_600SemiBold" : "Inter_500Medium" },
          ]}
          numberOfLines={1}
        >
          {item.name}
        </Text>
        <Text style={[styles.listPrice, { color: catColor, fontFamily: "Inter_700Bold" }]}>
          ₹{item.price}{weightItem ? `/${item.unit}` : ""}
        </Text>
        <View style={styles.listMeta}>
          <Text style={[styles.listCat, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            {item.category}
          </Text>
          {isOut && (
            <View style={[styles.stockPill, { backgroundColor: "#EF444415" }]}>
              <Text style={{ color: "#EF4444", fontSize: 9, fontFamily: "Inter_600SemiBold" }}>Out of stock</Text>
            </View>
          )}
          {!isOut && isLow && (
            <View style={[styles.stockPill, { backgroundColor: "#F59E0B15" }]}>
              <Text style={{ color: "#F59E0B", fontSize: 9, fontFamily: "Inter_600SemiBold" }}>Low stock</Text>
            </View>
          )}
        </View>
      </View>

      {/* Right action */}
      {inCart ? (
        <View style={[styles.listQtyBadge, { backgroundColor: colors.primary }]}>
          <Text style={{ color: "#fff", fontSize: 12, fontFamily: "Inter_700Bold" }}>{qtyLabel}</Text>
        </View>
      ) : (
        <View style={[styles.listAddBtn, { backgroundColor: catColor + "18", borderColor: catColor + "35" }]}>
          <Feather name="plus" size={17} color={catColor} />
        </View>
      )}
    </TouchableOpacity>
  );
}

/* ────────────────────────────────────────────────
   SlimListRow — ultra-compact, no image
──────────────────────────────────────────────── */
export function SlimListRow({
  item,
  cartItem,
  onPress,
}: {
  item: StoreProduct;
  cartItem?: CartItem;
  onPress: () => void;
}) {
  const colors     = useColors();
  const inCart     = !!cartItem;
  const catColor   = CATEGORY_COLORS[item.category] ?? CATEGORY_COLORS.default;
  const weightItem = isWeightBased(item.unit);
  const isOut      = item.stock === 0;
  const qtyLabel   = cartItem
    ? (weightItem ? formatQty(cartItem.qty, item.unit) : `×${cartItem.qty}`)
    : null;

  return (
    <TouchableOpacity
      style={[
        styles.slimRow,
        {
          backgroundColor: inCart ? colors.primary + "08" : colors.card,
          borderColor:     inCart ? colors.primary + "50" : colors.border,
          opacity:         isOut && !inCart ? 0.55 : 1,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={[styles.slimBar, { backgroundColor: inCart ? colors.primary : catColor }]} />
      <View style={styles.slimContent}>
        <View style={{ flex: 1 }}>
          <Text
            style={[
              styles.slimName,
              { color: inCart ? colors.primary : colors.foreground, fontFamily: inCart ? "Inter_600SemiBold" : "Inter_400Regular" },
            ]}
            numberOfLines={1}
          >
            {item.name}
          </Text>
          <Text style={[styles.slimCat, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            {item.category}{isOut ? " · Out of stock" : ""}
          </Text>
        </View>
        <Text style={[styles.slimPrice, { color: catColor, fontFamily: "Inter_700Bold" }]}>
          ₹{item.price}{weightItem ? `/${item.unit}` : ""}
        </Text>
        {inCart ? (
          <View style={[styles.slimBadge, { backgroundColor: colors.primary }]}>
            <Text style={{ color: "#fff", fontSize: 11, fontFamily: "Inter_700Bold" }}>{qtyLabel}</Text>
          </View>
        ) : (
          <Feather name="plus" size={14} color={colors.mutedForeground} />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  modeWrap: { flexGrow: 0 },
  modeBar:  { paddingHorizontal: 12, paddingVertical: 6, gap: 6 },
  modeBtn:  {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14, borderWidth: 1,
  },
  modeSuperscript: { fontSize: 9, marginLeft: -2 },
  modeBtnText:     { fontSize: 11 },

  flatTile:  { flex: 1, borderRadius: 10, padding: 9, gap: 3, minHeight: 88 },
  flatTop:   { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  flatIcon:  { width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  flatBadge: { paddingHorizontal: 5, paddingVertical: 2, borderRadius: 6, minWidth: 22, alignItems: "center" },
  flatBadgeText: { color: "#fff", fontSize: 9 },
  flatDot:   { width: 7, height: 7, borderRadius: 4 },
  flatName:  { fontSize: 11, lineHeight: 14 },
  flatPrice: { fontSize: 12 },

  listRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    marginBottom: 6, borderRadius: 12, borderWidth: 1, padding: 10,
  },
  listThumb: {
    width: 62, height: 62, borderRadius: 10,
    overflow: "hidden", alignItems: "center", justifyContent: "center",
    position: "relative", flexShrink: 0,
  },
  listThumbImg:     { width: "100%", height: "100%" },
  listThumbOverlay: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    alignItems: "center", justifyContent: "center",
  },
  listWeightTag: {
    position: "absolute", bottom: 3, right: 3,
    paddingHorizontal: 3, paddingVertical: 1, borderRadius: 4,
  },
  listInfo:     { flex: 1, gap: 2 },
  listName:     { fontSize: 13 },
  listPrice:    { fontSize: 13 },
  listMeta:     { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  listCat:      { fontSize: 11 },
  stockPill:    { paddingHorizontal: 5, paddingVertical: 2, borderRadius: 5 },
  listQtyBadge: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 9, minWidth: 34, alignItems: "center" },
  listAddBtn:   { width: 36, height: 36, borderRadius: 10, borderWidth: 1, alignItems: "center", justifyContent: "center" },

  slimRow: {
    flexDirection: "row", alignItems: "stretch",
    marginBottom: 4, borderRadius: 9, borderWidth: 1, overflow: "hidden", minHeight: 48,
  },
  slimBar:     { width: 4 },
  slimContent: { flex: 1, flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 8, gap: 8 },
  slimName:    { fontSize: 13 },
  slimCat:     { fontSize: 10, marginTop: 1 },
  slimPrice:   { fontSize: 13 },
  slimBadge:   { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 7, minWidth: 30, alignItems: "center" },
});
