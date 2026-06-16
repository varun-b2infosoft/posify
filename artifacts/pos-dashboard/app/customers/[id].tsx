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
import { useLayout } from "@/hooks/useLayout";
import { Customer, getCustomer, getCreditTransactions, subscribeCustomers } from "@/store/customers";
import { getInvoices } from "@/store/invoices";

function initials(name: string) { return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase(); }

export default function CustomerDetailScreen() {
  const { id }  = useLocalSearchParams<{ id: string }>();
  const colors  = useColors();
  const insets  = useSafeAreaInsets();
  const topPad  = Platform.OS === "web" ? 67 : insets.top;
  const botPad  = Platform.OS === "web" ? 24 : insets.bottom + 16;
  const layout  = useLayout();

  const [customer, setCustomer] = useState<Customer | undefined>(() => getCustomer(id));
  const creditTxs = getCreditTransactions(id);
  const invoices  = getInvoices().filter(inv => inv.customerId === id).slice(0, 5);

  useFocusEffect(useCallback(() => {
    setCustomer(getCustomer(id));
    return subscribeCustomers(() => setCustomer(getCustomer(id)));
  }, [id]));

  if (!customer) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background, paddingTop: topPad, alignItems: "center", justifyContent: "center" }]}>
        <Feather name="user-x" size={44} color={colors.mutedForeground} />
        <Text style={{ color: colors.mutedForeground, marginTop: 12, fontFamily: "Inter_400Regular" }}>Customer not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: "#4F46E5", fontFamily: "Inter_600SemiBold" }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statItems = [
    { label: "Total Spent",    val: `₹${(customer.totalPurchases / 1000).toFixed(1)}k`, color: "#4F46E5" },
    { label: "Outstanding",    val: customer.creditBalance > 0 ? `₹${(customer.creditBalance / 1000).toFixed(1)}k` : "Nil", color: customer.creditBalance > 0 ? "#EF4444" : "#10B981" },
    { label: "Invoices",       val: invoices.length,   color: "#8B5CF6" },
    { label: "Credit Entries", val: creditTxs.length,  color: "#F59E0B" },
  ];

  /* ═══════════════════ DESKTOP ═══════════════════ */
  if (layout.isWide) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        {/* Desktop header */}
        <View style={[dk.header, { backgroundColor: "#4F46E5", paddingTop: topPad }]}>
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
            <Feather name="arrow-left" size={20} color="#fff" />
          </TouchableOpacity>
          <View style={[dk.avatarCircle, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
            <Text style={[dk.avatarText, { fontFamily: "Inter_700Bold" }]}>{initials(customer.name)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[dk.headerTitle, { fontFamily: "Inter_700Bold" }]}>{customer.name}</Text>
            <Text style={[dk.headerSub, { fontFamily: "Inter_400Regular" }]}>
              Customer since {new Date(customer.joinedDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
            </Text>
          </View>
          <TouchableOpacity
            style={[dk.udharBtn, { backgroundColor: "rgba(255,255,255,0.2)" }]}
            onPress={() => router.push(`/credit/${customer.id}` as any)}
          >
            <Feather name="credit-card" size={14} color="#fff" />
            <Text style={[dk.udharText, { fontFamily: "Inter_600SemiBold" }]}>View Udhaar</Text>
          </TouchableOpacity>
        </View>

        {/* 2-column body */}
        <ScrollView contentContainerStyle={[dk.body, { paddingBottom: botPad + 24 }]}>

          {/* ── Left column ── */}
          <View style={dk.leftCol}>
            {/* Profile info card */}
            <View style={[dk.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[dk.profileAvatar, { backgroundColor: "#4F46E515" }]}>
                <Text style={[dk.profileInitials, { color: "#4F46E5", fontFamily: "Inter_700Bold" }]}>{initials(customer.name)}</Text>
              </View>
              <Text style={[dk.profileName, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>{customer.name}</Text>
              {customer.phone && (
                <View style={dk.infoRow}>
                  <Feather name="phone" size={13} color="#6B7280" />
                  <Text style={[dk.infoText, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>{customer.phone}</Text>
                </View>
              )}
              {customer.email && (
                <View style={dk.infoRow}>
                  <Feather name="mail" size={13} color="#6B7280" />
                  <Text style={[dk.infoText, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>{customer.email}</Text>
                </View>
              )}
              {customer.address && (
                <View style={dk.infoRow}>
                  <Feather name="map-pin" size={13} color="#6B7280" />
                  <Text style={[dk.infoText, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>{customer.address}</Text>
                </View>
              )}
            </View>

            {/* Stats grid 2×2 */}
            <View style={dk.statsGrid}>
              {statItems.map(s => (
                <View key={s.label} style={[dk.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[dk.statVal, { color: s.color, fontFamily: "Inter_700Bold" }]}>{s.val}</Text>
                  <Text style={[dk.statLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{s.label}</Text>
                </View>
              ))}
            </View>

            {/* Quick Udhaar action */}
            {customer.creditBalance > 0 && (
              <TouchableOpacity
                style={[dk.udhaarCard, { backgroundColor: "#FEF2F2", borderColor: "#FECACA" }]}
                onPress={() => router.push(`/credit/${customer.id}` as any)}
                activeOpacity={0.82}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[{ color: "#B91C1C", fontFamily: "Inter_700Bold", fontSize: 22 }]}>₹{customer.creditBalance.toLocaleString()}</Text>
                  <Text style={[{ color: "#B91C1C", fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 }]}>Outstanding balance</Text>
                </View>
                <View style={[dk.udhaarBtn, { backgroundColor: "#EF4444" }]}>
                  <Feather name="arrow-right" size={14} color="#fff" />
                  <Text style={[{ color: "#fff", fontFamily: "Inter_600SemiBold", fontSize: 12 }]}>Record Payment</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>

          {/* ── Right column ── */}
          <View style={dk.rightCol}>

            {/* Credit transactions */}
            {creditTxs.length > 0 && (
              <View style={[dk.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <Text style={[dk.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Credit / Udhaar</Text>
                  <TouchableOpacity onPress={() => router.push(`/credit/${customer.id}` as any)}>
                    <Text style={{ color: "#4F46E5", fontFamily: "Inter_600SemiBold", fontSize: 12 }}>View All →</Text>
                  </TouchableOpacity>
                </View>
                {creditTxs.slice(0, 6).map((tx, i) => (
                  <View key={tx.id} style={[styles.txRow, { borderTopColor: colors.border, borderTopWidth: i === 0 ? 0 : 1 }]}>
                    <View style={[styles.txIcon, { backgroundColor: tx.type === "sale" ? "#FEE2E2" : "#D1FAE5" }]}>
                      <Feather name={tx.type === "sale" ? "arrow-up-right" : "arrow-down-left"} size={13} color={tx.type === "sale" ? "#EF4444" : "#10B981"} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.txNote, { color: colors.foreground, fontFamily: "Inter_500Medium" }]} numberOfLines={1}>
                        {tx.note || (tx.type === "sale" ? "Credit Sale" : "Payment Received")}
                      </Text>
                      <Text style={[styles.txDate, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                        {new Date(tx.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </Text>
                    </View>
                    <Text style={[styles.txAmount, { color: tx.type === "sale" ? "#EF4444" : "#10B981", fontFamily: "Inter_700Bold" }]}>
                      {tx.type === "sale" ? "+" : "-"}₹{tx.amount.toLocaleString()}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Recent invoices */}
            {invoices.length > 0 && (
              <View style={[dk.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <Text style={[dk.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Recent Invoices</Text>
                  <TouchableOpacity onPress={() => router.push("/invoices" as any)}>
                    <Text style={{ color: "#4F46E5", fontFamily: "Inter_600SemiBold", fontSize: 12 }}>View All →</Text>
                  </TouchableOpacity>
                </View>
                {invoices.map((inv, i) => (
                  <TouchableOpacity
                    key={inv.id}
                    style={[styles.invRow, { borderTopColor: colors.border, borderTopWidth: i === 0 ? 0 : 1 }]}
                    onPress={() => router.push(`/invoices/${inv.id}` as any)}
                  >
                    <Feather name="file-text" size={14} color="#4F46E5" />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.invNo, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>{inv.invoiceNo}</Text>
                      <Text style={[styles.invDate, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                        {new Date(inv.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </Text>
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                      <Text style={[styles.invTotal, { color: "#4F46E5", fontFamily: "Inter_700Bold" }]}>₹{inv.total.toLocaleString()}</Text>
                      <View style={[styles.invBadge, { backgroundColor: inv.paid ? "#D1FAE5" : "#FEF3C7" }]}>
                        <Text style={[styles.invBadgeText, { color: inv.paid ? "#065F46" : "#92400E", fontFamily: "Inter_600SemiBold" }]}>
                          {inv.paid ? "Paid" : "Pending"}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {creditTxs.length === 0 && invoices.length === 0 && (
              <View style={[dk.card, { backgroundColor: colors.card, borderColor: colors.border, alignItems: "center", paddingVertical: 40 }]}>
                <Feather name="inbox" size={36} color={colors.mutedForeground} />
                <Text style={{ color: colors.mutedForeground, marginTop: 12, fontFamily: "Inter_400Regular" }}>No activity yet</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    );
  }

  /* ═══════════════════ MOBILE ═══════════════════ */
  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: "#4F46E5", paddingTop: topPad }]}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
          <Feather name="arrow-left" size={20} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { fontFamily: "Inter_700Bold" }]}>{customer.name}</Text>
          <Text style={[styles.headerSub, { fontFamily: "Inter_400Regular" }]}>
            Customer since {new Date(customer.joinedDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.creditBtn, { backgroundColor: "#ffffff20" }]}
          onPress={() => router.push(`/credit/${customer.id}` as any)}
        >
          <Feather name="credit-card" size={14} color="#fff" />
          <Text style={[styles.creditBtnText, { fontFamily: "Inter_600SemiBold" }]}>Udhaar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: botPad + 24 }}>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
            <View style={[styles.avatar, { backgroundColor: "#4F46E520" }]}>
              <Text style={[styles.avatarText, { color: "#4F46E5", fontFamily: "Inter_700Bold" }]}>{initials(customer.name)}</Text>
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              {customer.phone   && <View style={styles.infoRow}><Feather name="phone"   size={13} color="#6B7280" /><Text style={[styles.infoText, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>{customer.phone}</Text></View>}
              {customer.email   && <View style={styles.infoRow}><Feather name="mail"    size={13} color="#6B7280" /><Text style={[styles.infoText, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>{customer.email}</Text></View>}
              {customer.address && <View style={styles.infoRow}><Feather name="map-pin" size={13} color="#6B7280" /><Text style={[styles.infoText, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>{customer.address}</Text></View>}
            </View>
          </View>
        </View>

        <View style={styles.statsGrid}>
          {statItems.map(s => (
            <View key={s.label} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.statVal, { color: s.color, fontFamily: "Inter_700Bold" }]}>{s.val}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        {creditTxs.length > 0 && (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Credit / Udhaar</Text>
              <TouchableOpacity onPress={() => router.push(`/credit/${customer.id}` as any)}>
                <Text style={{ color: "#4F46E5", fontFamily: "Inter_600SemiBold", fontSize: 12 }}>View All →</Text>
              </TouchableOpacity>
            </View>
            {creditTxs.slice(0, 4).map((tx, i) => (
              <View key={tx.id} style={[styles.txRow, { borderTopColor: colors.border, borderTopWidth: i === 0 ? 0 : 1 }]}>
                <View style={[styles.txIcon, { backgroundColor: tx.type === "sale" ? "#FEE2E2" : "#D1FAE5" }]}>
                  <Feather name={tx.type === "sale" ? "arrow-up-right" : "arrow-down-left"} size={13} color={tx.type === "sale" ? "#EF4444" : "#10B981"} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.txNote, { color: colors.foreground, fontFamily: "Inter_500Medium" }]} numberOfLines={1}>
                    {tx.note || (tx.type === "sale" ? "Credit Sale" : "Payment Received")}
                  </Text>
                  <Text style={[styles.txDate, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                    {new Date(tx.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </Text>
                </View>
                <Text style={[styles.txAmount, { color: tx.type === "sale" ? "#EF4444" : "#10B981", fontFamily: "Inter_700Bold" }]}>
                  {tx.type === "sale" ? "+" : "-"}₹{tx.amount.toLocaleString()}
                </Text>
              </View>
            ))}
          </View>
        )}

        {invoices.length > 0 && (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Recent Invoices</Text>
              <TouchableOpacity onPress={() => router.push("/invoices" as any)}>
                <Text style={{ color: "#4F46E5", fontFamily: "Inter_600SemiBold", fontSize: 12 }}>View All →</Text>
              </TouchableOpacity>
            </View>
            {invoices.map((inv, i) => (
              <TouchableOpacity
                key={inv.id}
                style={[styles.invRow, { borderTopColor: colors.border, borderTopWidth: i === 0 ? 0 : 1 }]}
                onPress={() => router.push(`/invoices/${inv.id}` as any)}
              >
                <Feather name="file-text" size={14} color="#4F46E5" />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.invNo, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>{inv.invoiceNo}</Text>
                  <Text style={[styles.invDate, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                    {new Date(inv.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={[styles.invTotal, { color: "#4F46E5", fontFamily: "Inter_700Bold" }]}>₹{inv.total.toLocaleString()}</Text>
                  <View style={[styles.invBadge, { backgroundColor: inv.paid ? "#D1FAE5" : "#FEF3C7" }]}>
                    <Text style={[styles.invBadgeText, { color: inv.paid ? "#065F46" : "#92400E", fontFamily: "Inter_600SemiBold" }]}>
                      {inv.paid ? "Paid" : "Pending"}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const dk = StyleSheet.create({
  header:          { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 24, paddingBottom: 16 },
  headerTitle:     { fontSize: 20, color: "#fff" },
  headerSub:       { fontSize: 12, color: "#c7d2fe", marginTop: 1 },
  avatarCircle:    { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  avatarText:      { fontSize: 14, color: "#fff" },
  udharBtn:        { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  udharText:       { fontSize: 13, color: "#fff" },
  body:            { flexDirection: "row", padding: 20, gap: 16, alignItems: "flex-start" },
  leftCol:         { flex: 4, gap: 14 },
  rightCol:        { flex: 6, gap: 14 },
  card:            { borderRadius: 14, borderWidth: 1, padding: 16, gap: 12 },
  profileAvatar:   { width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center", alignSelf: "center" },
  profileInitials: { fontSize: 22 },
  profileName:     { fontSize: 18, textAlign: "center" },
  infoRow:         { flexDirection: "row", alignItems: "center", gap: 8 },
  infoText:        { fontSize: 13 },
  statsGrid:       { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statBox:         { width: "47%", borderRadius: 12, borderWidth: 1, padding: 14, gap: 4 },
  statVal:         { fontSize: 20 },
  statLabel:       { fontSize: 11 },
  sectionTitle:    { fontSize: 15 },
  udhaarCard:      { flexDirection: "row", alignItems: "center", borderRadius: 14, borderWidth: 1, padding: 16, gap: 12 },
  udhaarBtn:       { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10 },
});

const styles = StyleSheet.create({
  root:         { flex: 1 },
  header:       { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingBottom: 16 },
  headerTitle:  { fontSize: 19, color: "#fff" },
  headerSub:    { fontSize: 12, color: "#c7d2fe", marginTop: 1 },
  creditBtn:    { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 11, paddingVertical: 6, borderRadius: 10 },
  creditBtnText:{ fontSize: 12, color: "#fff" },
  card:         { borderRadius: 14, borderWidth: 1, padding: 14, gap: 10 },
  avatar:       { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center" },
  avatarText:   { fontSize: 18 },
  infoRow:      { flexDirection: "row", alignItems: "center", gap: 6 },
  infoText:     { fontSize: 13 },
  statsGrid:    { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statCard:     { width: "47%", borderRadius: 12, borderWidth: 1, padding: 12, gap: 3 },
  statVal:      { fontSize: 18 },
  statLabel:    { fontSize: 11 },
  sectionTitle: { fontSize: 15 },
  txRow:        { flexDirection: "row", alignItems: "center", paddingVertical: 10, gap: 10 },
  txIcon:       { width: 30, height: 30, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  txNote:       { fontSize: 13 },
  txDate:       { fontSize: 11 },
  txAmount:     { fontSize: 14 },
  invRow:       { flexDirection: "row", alignItems: "center", paddingVertical: 10, gap: 10 },
  invNo:        { fontSize: 13 },
  invDate:      { fontSize: 11 },
  invTotal:     { fontSize: 13 },
  invBadge:     { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, marginTop: 2 },
  invBadgeText: { fontSize: 10 },
});
