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
import { Customer, getAllCreditBalances, getTotalOutstanding, subscribeCustomers } from "@/store/customers";

function initials(name: string) { return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase(); }
const AVATAR_COLORS = ["#4F46E5", "#10B981", "#F59E0B", "#EC4899", "#8B5CF6", "#06B6D4", "#EF4444", "#6366F1"];

export default function CreditLedgerScreen() {
  const colors  = useColors();
  const insets  = useSafeAreaInsets();
  const topPad  = Platform.OS === "web" ? 67 : insets.top;
  const botPad  = Platform.OS === "web" ? 24 : insets.bottom + 16;

  const [debtors, setDebtors] = useState<Customer[]>(() => getAllCreditBalances());
  const [search,  setSearch]  = useState("");

  useFocusEffect(useCallback(() => {
    setDebtors(getAllCreditBalances());
    return subscribeCustomers(() => setDebtors(getAllCreditBalances()));
  }, []));

  const total    = getTotalOutstanding();
  const filtered = debtors.filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: "#EF4444", paddingTop: topPad }]}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
          <Feather name="arrow-left" size={20} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { fontFamily: "Inter_700Bold" }]}>Credit / Udhaar</Text>
          <Text style={[styles.headerSub, { fontFamily: "Inter_400Regular" }]}>
            {debtors.length} customers · Total due ₹{(total / 1000).toFixed(1)}k
          </Text>
        </View>
      </View>

      <View style={[styles.totalBanner, { backgroundColor: "#FEF2F2", borderColor: "#FECACA" }]}>
        <View>
          <Text style={[styles.bannerAmt, { color: "#DC2626", fontFamily: "Inter_700Bold" }]}>₹{total.toLocaleString()}</Text>
          <Text style={[styles.bannerLabel, { color: "#B91C1C", fontFamily: "Inter_400Regular" }]}>Total Outstanding Balance</Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={[styles.bannerCount, { color: "#DC2626", fontFamily: "Inter_700Bold" }]}>{debtors.length}</Text>
          <Text style={[styles.bannerLabel, { color: "#B91C1C", fontFamily: "Inter_400Regular" }]}>Customers with dues</Text>
        </View>
      </View>

      <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Feather name="search" size={15} color={colors.mutedForeground} />
        <TextInput
          style={[styles.searchInput, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
          placeholder="Search customer..."
          placeholderTextColor={colors.mutedForeground}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && <TouchableOpacity onPress={() => setSearch("")}><Feather name="x" size={14} color={colors.mutedForeground} /></TouchableOpacity>}
      </View>

      <ScrollView contentContainerStyle={{ padding: 12, gap: 8, paddingBottom: botPad + 24 }}>
        {filtered.length === 0 && (
          <View style={{ alignItems: "center", paddingTop: 60 }}>
            <Feather name="check-circle" size={40} color="#10B981" />
            <Text style={{ color: colors.mutedForeground, marginTop: 12, fontFamily: "Inter_400Regular" }}>
              {debtors.length === 0 ? "No outstanding balances!" : "No results found"}
            </Text>
          </View>
        )}
        {filtered.map((c, idx) => {
          const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];
          const urgency = c.creditBalance > 10000 ? "#EF4444" : c.creditBalance > 5000 ? "#F59E0B" : "#6B7280";
          return (
            <TouchableOpacity
              key={c.id}
              style={[styles.card, { backgroundColor: colors.card, borderColor: urgency + "40" }]}
              onPress={() => router.push(`/credit/${c.id}` as any)}
              activeOpacity={0.82}
            >
              <View style={[styles.avatar, { backgroundColor: avatarColor + "20" }]}>
                <Text style={[styles.avatarText, { color: avatarColor, fontFamily: "Inter_700Bold" }]}>{initials(c.name)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.custName, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]} numberOfLines={1}>{c.name}</Text>
                <Text style={[styles.custPhone, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{c.phone}</Text>
              </View>
              <View style={{ alignItems: "flex-end", gap: 4 }}>
                <Text style={[styles.dueAmt, { color: urgency, fontFamily: "Inter_700Bold" }]}>₹{c.creditBalance.toLocaleString()}</Text>
                <Text style={[styles.dueLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>due</Text>
              </View>
              <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
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
  headerSub:   { fontSize: 12, color: "#fecaca", marginTop: 1 },
  totalBanner: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginHorizontal: 12, marginTop: 12, borderRadius: 12, borderWidth: 1, padding: 14 },
  bannerAmt:   { fontSize: 22 },
  bannerLabel: { fontSize: 11, marginTop: 1 },
  bannerCount: { fontSize: 22 },
  searchBox:   { flexDirection: "row", alignItems: "center", gap: 8, margin: 12, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  searchInput: { flex: 1, fontSize: 14 },
  card:        { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 14, borderWidth: 1.5, padding: 13 },
  avatar:      { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
  avatarText:  { fontSize: 14 },
  custName:    { fontSize: 14 },
  custPhone:   { fontSize: 12, marginTop: 1 },
  dueAmt:      { fontSize: 16 },
  dueLabel:    { fontSize: 10 },
});
