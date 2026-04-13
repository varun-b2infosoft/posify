import React, { useCallback, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { getPurchase, Purchase } from "@/store/purchases";
import { CATEGORY_COLORS, CATEGORY_ICONS, getProduct } from "@/store/products";

const STATUS_META = {
  delivered: { bg: "#D1FAE5", text: "#065F46", icon: "check-circle", barColor: "#10B981" },
  pending:   { bg: "#FEF3C7", text: "#92400E", icon: "clock",         barColor: "#F59E0B" },
  cancelled: { bg: "#FEE2E2", text: "#B91C1C", icon: "x-circle",      barColor: "#EF4444" },
} as const;

export default function PurchaseDetailScreen() {
  const { id }  = useLocalSearchParams<{ id: string }>();
  const colors  = useColors();
  const insets  = useSafeAreaInsets();
  const topPad  = Platform.OS === "web" ? 67 : insets.top;
  const botPad  = Platform.OS === "web" ? 24 : insets.bottom + 16;

  const [purchase, setPurchase] = useState<Purchase | undefined>(() => getPurchase(id));

  useFocusEffect(useCallback(() => { setPurchase(getPurchase(id)); }, [id]));

  if (!purchase) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background, paddingTop: topPad }]}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 16 }}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <View style={styles.notFound}>
          <Feather name="alert-circle" size={40} color={colors.mutedForeground} />
          <Text style={[{ color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Purchase not found</Text>
        </View>
      </View>
    );
  }

  const sm        = STATUS_META[purchase.status];
  const totalUnits = purchase.items.reduce((s, i) => s + i.qty, 0);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: sm.barColor }]}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 2 }}>
          <Feather name="arrow-left" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { fontFamily: "Inter_600SemiBold" }]}>{purchase.id}</Text>
        <View style={[styles.statusPill, { backgroundColor: "rgba(255,255,255,0.25)" }]}>
          <Text style={[styles.statusText, { fontFamily: "Inter_600SemiBold" }]}>
            {purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1)}
          </Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: botPad + 20 }]}>
        {/* Supplier + date */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <Feather name="truck" size={14} color={colors.mutedForeground} />
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>SUPPLIER</Text>
          </View>
          <View style={styles.suppRow}>
            <View style={[styles.avatar, { backgroundColor: "#4F46E520" }]}>
              <Text style={[styles.avatarText, { color: "#4F46E5", fontFamily: "Inter_700Bold" }]}>
                {purchase.supplierName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={[styles.suppName, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>{purchase.supplierName}</Text>
              <Text style={[styles.suppDate, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                {purchase.date} · {totalUnits} units
              </Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { label: "SKUs",       value: String(purchase.items.length), icon: "box",       color: "#4F46E5" },
            { label: "Units",      value: String(totalUnits),            icon: "layers",     color: "#06B6D4" },
            { label: "Subtotal",   value: `₹${purchase.subtotal.toLocaleString()}`, icon: "dollar-sign", color: "#10B981" },
          ].map((s) => (
            <View key={s.label} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.statIcon, { backgroundColor: s.color + "18" }]}>
                <Feather name={s.icon as any} size={14} color={s.color} />
              </View>
              <Text style={[styles.statValue, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>{s.value}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Items */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <Feather name="shopping-bag" size={14} color={colors.mutedForeground} />
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>LINE ITEMS</Text>
          </View>
          {purchase.items.map((li, idx) => {
            const prod     = getProduct(li.productId);
            const catColor = prod ? (CATEGORY_COLORS[prod.category] ?? "#4F46E5") : "#4F46E5";
            const catIcon  = prod ? (CATEGORY_ICONS[prod.category]  ?? "box")     : "box";
            return (
              <View key={li.productId}>
                {idx > 0 && <View style={[{ height: 1, backgroundColor: colors.border }]} />}
                <View style={styles.lineItem}>
                  <View style={[styles.lineIcon, { backgroundColor: catColor + "18" }]}>
                    <Feather name={catIcon as any} size={16} color={catColor} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.lineName, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]} numberOfLines={1}>
                      {li.productName}
                    </Text>
                    <Text style={[styles.lineMeta, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                      {li.qty} {prod?.unit ?? "pcs"} × ₹{li.costPrice} each
                    </Text>
                  </View>
                  <Text style={[styles.lineAmt, { color: catColor, fontFamily: "Inter_700Bold" }]}>
                    ₹{(li.costPrice * li.qty).toLocaleString()}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Summary */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <Feather name="file-text" size={14} color={colors.mutedForeground} />
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>SUMMARY</Text>
          </View>
          <View style={styles.summaryBody}>
            {[
              { label: "Subtotal", value: `₹${purchase.subtotal.toLocaleString()}` },
              { label: "GST (9%)", value: `₹${purchase.tax.toLocaleString()}` },
            ].map((r) => (
              <View key={r.label} style={styles.summaryLine}>
                <Text style={[styles.summaryLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{r.label}</Text>
                <Text style={[styles.summaryVal,   { color: colors.foreground,      fontFamily: "Inter_500Medium"   }]}>{r.value}</Text>
              </View>
            ))}
            <View style={[styles.summaryLine, styles.totalLine, { borderTopColor: colors.border }]}>
              <Text style={[styles.summaryLabel, { color: colors.foreground, fontFamily: "Inter_700Bold", fontSize: 16 }]}>Total Paid</Text>
              <Text style={[styles.summaryVal,   { color: sm.barColor,       fontFamily: "Inter_700Bold", fontSize: 22 }]}>
                ₹{purchase.total.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        {purchase.notes ? (
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.sectionHeader}>
              <Feather name="message-square" size={14} color={colors.mutedForeground} />
              <Text style={[styles.sectionTitle, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>NOTES</Text>
            </View>
            <Text style={[styles.notes, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>
              {purchase.notes}
            </Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={[styles.newPOBtn, { backgroundColor: "#10B981" }]}
          onPress={() => router.push("/purchase/new" as any)}
        >
          <Feather name="plus" size={16} color="#fff" />
          <Text style={[styles.newPOText, { fontFamily: "Inter_700Bold" }]}>New Purchase Order</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:     { flex: 1 },
  notFound: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },

  header: {
    flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between",
    paddingHorizontal: 16, paddingBottom: 14,
  },
  headerTitle: { flex: 1, color: "#fff", fontSize: 17, marginHorizontal: 12, textAlign: "center" },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: "#fff", fontSize: 12 },

  content: { paddingHorizontal: 14, paddingTop: 16, gap: 12 },

  section: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  sectionHeader: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 14, paddingTop: 12, paddingBottom: 4,
  },
  sectionTitle: { fontSize: 11, letterSpacing: 0.5 },

  suppRow:  { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingBottom: 14, paddingTop: 6 },
  avatar:   { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 15 },
  suppName: { fontSize: 16 },
  suppDate: { fontSize: 12, marginTop: 2 },

  statsRow: { flexDirection: "row", gap: 8 },
  statCard: { flex: 1, borderRadius: 12, borderWidth: 1, padding: 12, alignItems: "center", gap: 4 },
  statIcon: { width: 30, height: 30, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  statValue: { fontSize: 15 },
  statLabel: { fontSize: 10 },

  lineItem: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14 },
  lineIcon: { width: 38, height: 38, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  lineName: { fontSize: 14 },
  lineMeta: { fontSize: 12, marginTop: 2 },
  lineAmt:  { fontSize: 15 },

  summaryBody:  { paddingHorizontal: 14, paddingBottom: 14, paddingTop: 6, gap: 4 },
  summaryLine:  { flexDirection: "row", justifyContent: "space-between", paddingVertical: 5 },
  summaryLabel: { fontSize: 13 },
  summaryVal:   { fontSize: 13 },
  totalLine:    { borderTopWidth: 1, paddingTop: 10, marginTop: 4 },

  notes: { fontSize: 13, paddingHorizontal: 14, paddingBottom: 14, lineHeight: 20 },

  newPOBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    borderRadius: 14, paddingVertical: 14,
  },
  newPOText: { color: "#fff", fontSize: 15 },
});
