import React, { useCallback, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { getInvoices, markReturned, subscribeInvoices } from "@/store/invoices";
import type { Invoice } from "@/store/invoices";

const TAB_BAR_H = 84;

export default function ReturnsScreen() {
  const colors  = useColors();
  const insets  = useSafeAreaInsets();
  const topPad  = Platform.OS === "web" ? 67 : insets.top;
  const botPad  = Platform.OS === "web" ? 0  : insets.bottom;

  const [invoices, setInvoices] = useState<Invoice[]>(() => getInvoices());
  const [query,    setQuery]    = useState("");
  const [filter,   setFilter]   = useState<"all" | "returnable" | "returned">("returnable");

  useFocusEffect(useCallback(() => {
    const unsub = subscribeInvoices(() => setInvoices(getInvoices()));
    setInvoices(getInvoices());
    return unsub;
  }, []));

  const filtered = invoices.filter(inv => {
    if (filter === "returnable") return !inv.returned && !inv.paid === false || (!inv.returned && inv.paid);
    if (filter === "returned")   return inv.returned;
    return true;
  }).filter(inv =>
    inv.customerName.toLowerCase().includes(query.toLowerCase()) ||
    inv.invoiceNumber.toLowerCase().includes(query.toLowerCase())
  );

  const returnedCount   = invoices.filter(i => i.returned).length;
  const returnableCount = invoices.filter(i => !i.returned).length;
  const returnedValue   = invoices.filter(i => i.returned).reduce((s, i) => s + i.total, 0);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 10, backgroundColor: "#EF4444" }]}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { fontFamily: "Inter_700Bold" }]}>Returns</Text>
          <Text style={[styles.headerSub, { fontFamily: "Inter_400Regular" }]}>
            {returnedCount} returned · ₹{(returnedValue / 1000).toFixed(1)}k value
          </Text>
        </View>
      </View>

      {/* Summary strip */}
      <View style={[styles.summaryRow, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryVal, { color: "#EF4444", fontFamily: "Inter_700Bold" }]}>{returnedCount}</Text>
          <Text style={[styles.summaryLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Returned</Text>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryVal, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>{returnableCount}</Text>
          <Text style={[styles.summaryLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Returnable</Text>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryVal, { color: "#EF4444", fontFamily: "Inter_700Bold" }]}>
            ₹{(returnedValue / 1000).toFixed(1)}k
          </Text>
          <Text style={[styles.summaryLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Loss</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: botPad + TAB_BAR_H + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Search */}
        <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="search" size={15} color={colors.mutedForeground} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search invoice or customer…"
            placeholderTextColor={colors.mutedForeground}
            style={[styles.searchInput, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")}>
              <Feather name="x" size={15} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter chips */}
        <View style={styles.chips}>
          {(["returnable", "all", "returned"] as const).map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.chip, filter === f && { backgroundColor: "#EF4444" }, filter !== f && { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.chipText, { fontFamily: "Inter_600SemiBold", color: filter === f ? "#fff" : colors.mutedForeground }]}>
                {f === "returnable" ? "Returnable" : f === "all" ? "All" : "Returned"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Invoice list */}
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Feather name="rotate-ccw" size={40} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              No returns found
            </Text>
          </View>
        ) : (
          filtered.map(inv => (
            <ReturnRow
              key={inv.id}
              inv={inv}
              colors={colors}
              onReturn={() => {
                markReturned(inv.id);
                setInvoices([...getInvoices()]);
              }}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

function ReturnRow({ inv, colors, onReturn }: { inv: Invoice; colors: any; onReturn: () => void }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <TouchableOpacity style={styles.cardHeader} onPress={() => setExpanded(e => !e)} activeOpacity={0.8}>
        <View style={[styles.invIcon, { backgroundColor: inv.returned ? "#EF444415" : colors.primary + "15" }]}>
          <Feather name={inv.returned ? "rotate-ccw" : "file-text"} size={16} color={inv.returned ? "#EF4444" : colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.invNum, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
            {inv.invoiceNumber}
          </Text>
          <Text style={[styles.invCustomer, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            {inv.customerName} · {new Date(inv.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
          </Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={[styles.invAmt, { color: inv.returned ? "#EF4444" : colors.foreground, fontFamily: "Inter_700Bold" }]}>
            {inv.returned ? "-" : ""}₹{inv.total.toLocaleString("en-IN")}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: inv.returned ? "#EF444420" : "#10B98120" }]}>
            <Text style={[styles.statusText, { color: inv.returned ? "#EF4444" : "#10B981", fontFamily: "Inter_600SemiBold" }]}>
              {inv.returned ? "Returned" : inv.paid ? "Paid" : "Pending"}
            </Text>
          </View>
        </View>
        <Feather name={expanded ? "chevron-up" : "chevron-down"} size={16} color={colors.mutedForeground} style={{ marginLeft: 6 }} />
      </TouchableOpacity>

      {expanded && (
        <View style={[styles.expandBody, { borderTopColor: colors.border }]}>
          {/* Items */}
          {inv.items.map((item, idx) => (
            <View key={idx} style={styles.itemRow}>
              <Text style={[styles.itemName, { color: colors.foreground, fontFamily: "Inter_400Regular", flex: 1 }]}>
                {item.name}
              </Text>
              <Text style={[styles.itemQty, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                ×{item.qty}
              </Text>
              <Text style={[styles.itemAmt, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
                ₹{item.total.toLocaleString("en-IN")}
              </Text>
            </View>
          ))}

          {/* Return reason (mock) */}
          {inv.returned && (
            <View style={[styles.reasonBox, { backgroundColor: "#EF444410", borderColor: "#EF444430" }]}>
              <Text style={[styles.reasonLabel, { color: "#EF4444", fontFamily: "Inter_600SemiBold" }]}>Return Reason</Text>
              <Text style={[styles.reasonText, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>
                Customer request — defective product
              </Text>
            </View>
          )}

          {/* Action */}
          {!inv.returned && (
            <TouchableOpacity
              style={[styles.returnBtn, { backgroundColor: "#EF444415", borderColor: "#EF444440" }]}
              onPress={onReturn}
              activeOpacity={0.7}
            >
              <Feather name="rotate-ccw" size={14} color="#EF4444" />
              <Text style={[styles.returnBtnText, { color: "#EF4444", fontFamily: "Inter_600SemiBold" }]}>
                Mark as Returned
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 14 },
  headerTitle: { color: "#fff", fontSize: 20 },
  headerSub:   { color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 2 },

  summaryRow: { flexDirection: "row", paddingVertical: 14, borderBottomWidth: 1 },
  summaryItem:  { flex: 1, alignItems: "center" },
  summaryVal:   { fontSize: 18, marginBottom: 2 },
  summaryLabel: { fontSize: 11 },
  divider:      { width: 1, marginVertical: 4 },

  content:    { padding: 14, gap: 10 },

  searchBox: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1 },
  searchInput: { flex: 1, fontSize: 14 },

  chips:     { flexDirection: "row", gap: 8 },
  chip:      { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  chipText:  { fontSize: 13 },

  empty:     { alignItems: "center", justifyContent: "center", paddingVertical: 60, gap: 10 },
  emptyText: { fontSize: 14 },

  card:       { borderRadius: 12, borderWidth: 1, overflow: "hidden" },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14 },
  invIcon:    { width: 34, height: 34, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  invNum:     { fontSize: 14, marginBottom: 2 },
  invCustomer:{ fontSize: 12 },
  invAmt:     { fontSize: 15, marginBottom: 4 },
  statusBadge:{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusText: { fontSize: 11 },

  expandBody: { borderTopWidth: 1, padding: 14, gap: 8 },
  itemRow:    { flexDirection: "row", alignItems: "center", gap: 8 },
  itemName:   { fontSize: 13 },
  itemQty:    { fontSize: 13 },
  itemAmt:    { fontSize: 13, minWidth: 60, textAlign: "right" },

  reasonBox:   { borderRadius: 8, padding: 10, borderWidth: 1, gap: 4, marginTop: 4 },
  reasonLabel: { fontSize: 12 },
  reasonText:  { fontSize: 13 },

  returnBtn:     { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 8, paddingVertical: 10, borderWidth: 1, marginTop: 4 },
  returnBtnText: { fontSize: 13 },
});
