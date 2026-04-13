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
import { router, useFocusEffect } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { Invoice, getInvoices, subscribeInvoices } from "@/store/invoices";

type FilterMode = "All" | "Paid" | "Pending" | "Credit" | "Returned";
const FILTERS: FilterMode[] = ["All", "Paid", "Pending", "Credit", "Returned"];

const MODE_COLORS: Record<string, string> = {
  Cash: "#10B981", UPI: "#4F46E5", Card: "#8B5CF6", Credit: "#EF4444",
};

export default function InvoicesScreen() {
  const colors  = useColors();
  const insets  = useSafeAreaInsets();
  const topPad  = Platform.OS === "web" ? 67 : insets.top;
  const botPad  = Platform.OS === "web" ? 24 : insets.bottom + 16;

  const [invoices, setInvoices] = useState<Invoice[]>(() => getInvoices());
  const [filter,   setFilter]   = useState<FilterMode>("All");
  const [search,   setSearch]   = useState("");

  useFocusEffect(useCallback(() => {
    setInvoices(getInvoices());
    return subscribeInvoices(() => setInvoices(getInvoices()));
  }, []));

  const filtered = invoices.filter(inv => {
    const matchFilter =
      filter === "All"      ? true :
      filter === "Paid"     ? inv.paid && !inv.returned :
      filter === "Pending"  ? !inv.paid && !inv.returned :
      filter === "Credit"   ? inv.paymentMode === "Credit" :
      filter === "Returned" ? inv.returned : true;
    const matchSearch = !search || inv.invoiceNo.toLowerCase().includes(search.toLowerCase()) || inv.customerName.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const totalRevenue = invoices.filter(i => i.paid && !i.returned).reduce((s, i) => s + i.total, 0);
  const pendingAmt   = invoices.filter(i => !i.paid && !i.returned).reduce((s, i) => s + i.total, 0);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: "#4F46E5", paddingTop: topPad }]}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
          <Feather name="arrow-left" size={20} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { fontFamily: "Inter_700Bold" }]}>Invoices</Text>
          <Text style={[styles.headerSub, { fontFamily: "Inter_400Regular" }]}>{invoices.length} total · ₹{(totalRevenue/1000).toFixed(0)}k collected</Text>
        </View>
      </View>

      <View style={[styles.statsRow, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        {[
          { label: "Total",   val: invoices.length,                                    color: "#4F46E5" },
          { label: "Paid",    val: invoices.filter(i => i.paid && !i.returned).length, color: "#10B981" },
          { label: "Pending", val: invoices.filter(i => !i.paid && !i.returned).length,color: "#F59E0B" },
          { label: "Pending ₹", val: `₹${(pendingAmt/1000).toFixed(0)}k`,             color: "#EF4444", isStr: true },
        ].map((s, i, arr) => (
          <React.Fragment key={s.label}>
            <View style={styles.statItem}>
              <Text style={[styles.statVal, { color: s.color, fontFamily: "Inter_700Bold" }]}>{s.val}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{s.label}</Text>
            </View>
            {i < arr.length - 1 && <View style={[styles.statDiv, { backgroundColor: colors.border }]} />}
          </React.Fragment>
        ))}
      </View>

      <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Feather name="search" size={15} color={colors.mutedForeground} />
        <TextInput
          style={[styles.searchInput, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
          placeholder="Search invoice or customer..."
          placeholderTextColor={colors.mutedForeground}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && <TouchableOpacity onPress={() => setSearch("")}><Feather name="x" size={14} color={colors.mutedForeground} /></TouchableOpacity>}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0, flexShrink: 0, borderBottomWidth: 1, borderBottomColor: colors.border }}
        contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 8, gap: 8 }}
      >
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.chip, { borderColor: filter === f ? "#4F46E5" : colors.border, backgroundColor: filter === f ? "#4F46E5" : colors.card }]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.chipText, { fontFamily: "Inter_600SemiBold", color: filter === f ? "#fff" : colors.mutedForeground }]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={{ padding: 12, gap: 8, paddingBottom: botPad + 24 }}>
        {filtered.length === 0 && (
          <View style={{ alignItems: "center", paddingTop: 60 }}>
            <Feather name="file-text" size={40} color={colors.mutedForeground} />
            <Text style={{ color: colors.mutedForeground, marginTop: 12, fontFamily: "Inter_400Regular" }}>No invoices found</Text>
          </View>
        )}
        {filtered.map(inv => {
          const modeColor = MODE_COLORS[inv.paymentMode] ?? "#6B7280";
          return (
            <TouchableOpacity
              key={inv.id}
              style={[styles.card, { backgroundColor: colors.card, borderColor: inv.returned ? "#EF444430" : colors.border }]}
              onPress={() => router.push(`/invoices/${inv.id}` as any)}
              activeOpacity={0.82}
            >
              <View style={[styles.invoiceIcon, { backgroundColor: "#4F46E510" }]}>
                <Feather name="file-text" size={16} color="#4F46E5" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.invoiceNo, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>{inv.invoiceNo}</Text>
                <Text style={[styles.custName, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{inv.customerName}</Text>
                <Text style={[styles.invDate, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  {new Date(inv.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </Text>
              </View>
              <View style={{ alignItems: "flex-end", gap: 4 }}>
                <Text style={[styles.invTotal, { color: "#4F46E5", fontFamily: "Inter_700Bold" }]}>₹{inv.total.toLocaleString()}</Text>
                <View style={[styles.modeBadge, { backgroundColor: modeColor + "15" }]}>
                  <Text style={[styles.modeText, { color: modeColor, fontFamily: "Inter_600SemiBold" }]}>{inv.paymentMode}</Text>
                </View>
                {inv.returned && (
                  <View style={[styles.modeBadge, { backgroundColor: "#FEE2E2" }]}>
                    <Text style={[styles.modeText, { color: "#EF4444", fontFamily: "Inter_600SemiBold" }]}>Returned</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:        { flex: 1 },
  header:      { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingBottom: 16 },
  headerTitle: { fontSize: 20, color: "#fff" },
  headerSub:   { fontSize: 12, color: "#c7d2fe", marginTop: 1 },
  statsRow:    { flexDirection: "row", paddingVertical: 12, borderBottomWidth: 1 },
  statItem:    { flex: 1, alignItems: "center" },
  statVal:     { fontSize: 17 },
  statLabel:   { fontSize: 11, marginTop: 1 },
  statDiv:     { width: 1, marginVertical: 4 },
  searchBox:   { flexDirection: "row", alignItems: "center", gap: 8, margin: 12, marginBottom: 0, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  searchInput: { flex: 1, fontSize: 14 },
  chip:        { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  chipText:    { fontSize: 12 },
  card:        { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 14, borderWidth: 1, padding: 13 },
  invoiceIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  invoiceNo:   { fontSize: 13 },
  custName:    { fontSize: 12, marginTop: 1 },
  invDate:     { fontSize: 11, marginTop: 1 },
  invTotal:    { fontSize: 15 },
  modeBadge:   { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  modeText:    { fontSize: 10 },
});
