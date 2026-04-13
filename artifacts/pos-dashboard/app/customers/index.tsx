import React, { useCallback, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
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
import { Customer, addCustomer, getCustomers, getTotalOutstanding, subscribeCustomers } from "@/store/customers";

function initials(name: string) { return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase(); }
const AVATAR_COLORS = ["#4F46E5", "#10B981", "#F59E0B", "#EC4899", "#8B5CF6", "#06B6D4", "#EF4444", "#6366F1"];

export default function CustomersScreen() {
  const colors  = useColors();
  const insets  = useSafeAreaInsets();
  const topPad  = Platform.OS === "web" ? 67 : insets.top;
  const botPad  = Platform.OS === "web" ? 24 : insets.bottom + 16;

  const [customers, setCustomers] = useState<Customer[]>(() => getCustomers());
  const [search,    setSearch]    = useState("");
  const [modal,     setModal]     = useState(false);
  const [name,      setName]      = useState("");
  const [phone,     setPhone]     = useState("");
  const [email,     setEmail]     = useState("");
  const [errors,    setErrors]    = useState<Record<string, string>>({});

  useFocusEffect(useCallback(() => {
    setCustomers(getCustomers());
    return subscribeCustomers(() => setCustomers(getCustomers()));
  }, []));

  const totalOutstanding = getTotalOutstanding();
  const filtered = customers.filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search));

  const handleAdd = () => {
    const e: Record<string, string> = {};
    if (!name.trim())  e.name  = "Name is required";
    if (!phone.trim()) e.phone = "Phone is required";
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    addCustomer({ name: name.trim(), phone: phone.trim(), email: email.trim(), address: "" });
    setName(""); setPhone(""); setEmail(""); setErrors({});
    setModal(false);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: "#4F46E5", paddingTop: topPad }]}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
          <Feather name="arrow-left" size={20} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { fontFamily: "Inter_700Bold" }]}>Customers</Text>
          <Text style={[styles.headerSub, { fontFamily: "Inter_400Regular" }]}>{customers.length} total · ₹{(totalOutstanding / 1000).toFixed(1)}k outstanding</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModal(true)}>
          <Feather name="user-plus" size={16} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={[styles.statsRow, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        {[
          { label: "Total Customers", val: customers.length,      color: "#4F46E5" },
          { label: "With Balance",    val: customers.filter(c => c.creditBalance > 0).length, color: "#EF4444" },
          { label: "Outstanding",     val: `₹${(totalOutstanding/1000).toFixed(0)}k`, color: "#F59E0B", isStr: true },
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
          placeholder="Search by name or phone..."
          placeholderTextColor={colors.mutedForeground}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Feather name="x" size={14} color={colors.mutedForeground} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={{ padding: 12, gap: 8, paddingBottom: botPad + 24 }}>
        {filtered.length === 0 && (
          <View style={{ alignItems: "center", paddingTop: 60 }}>
            <Feather name="users" size={40} color={colors.mutedForeground} />
            <Text style={{ color: colors.mutedForeground, marginTop: 12, fontFamily: "Inter_400Regular" }}>No customers found</Text>
          </View>
        )}
        {filtered.map((c, idx) => {
          const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];
          return (
            <TouchableOpacity
              key={c.id}
              style={[styles.card, { backgroundColor: colors.card, borderColor: c.creditBalance > 0 ? "#EF444430" : colors.border }]}
              onPress={() => router.push(`/customers/${c.id}` as any)}
              activeOpacity={0.82}
            >
              <View style={[styles.avatar, { backgroundColor: avatarColor + "20" }]}>
                <Text style={[styles.avatarText, { color: avatarColor, fontFamily: "Inter_700Bold" }]}>{initials(c.name)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.custName, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]} numberOfLines={1}>{c.name}</Text>
                <Text style={[styles.custPhone, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{c.phone}</Text>
              </View>
              <View style={{ alignItems: "flex-end", gap: 3 }}>
                <Text style={[styles.custSpent, { color: "#4F46E5", fontFamily: "Inter_700Bold" }]}>₹{(c.totalPurchases / 1000).toFixed(0)}k</Text>
                {c.creditBalance > 0 ? (
                  <View style={[styles.dueBadge, { backgroundColor: "#FEE2E2" }]}>
                    <Text style={[styles.dueText, { color: "#B91C1C", fontFamily: "Inter_700Bold" }]}>Due ₹{(c.creditBalance / 1000).toFixed(1)}k</Text>
                  </View>
                ) : (
                  <View style={[styles.dueBadge, { backgroundColor: "#D1FAE5" }]}>
                    <Text style={[styles.dueText, { color: "#065F46", fontFamily: "Inter_600SemiBold" }]}>Cleared</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Modal visible={modal} animationType="slide" transparent onRequestClose={() => setModal(false)}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ width: "100%" }}>
            <View style={[styles.sheet, { backgroundColor: colors.card }]}>
              <View style={styles.handle} />
              <Text style={[styles.sheetTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Add Customer</Text>

              {[
                { label: "Full Name *", val: name, set: setName, ph: "Ramesh Gupta", key: "name", kb: "default" as const },
                { label: "Phone *",     val: phone, set: setPhone, ph: "+91 98000 00000", key: "phone", kb: "phone-pad" as const },
                { label: "Email",       val: email, set: setEmail, ph: "email@example.com", key: "email", kb: "email-address" as const },
              ].map(f => (
                <View key={f.key}>
                  <Text style={[styles.label, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>{f.label}</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.background, borderColor: errors[f.key] ? "#EF4444" : colors.border, color: colors.foreground, fontFamily: "Inter_400Regular" }]}
                    placeholder={f.ph}
                    placeholderTextColor={colors.mutedForeground}
                    value={f.val}
                    onChangeText={f.set}
                    keyboardType={f.kb}
                  />
                  {errors[f.key] && <Text style={styles.errText}>{errors[f.key]}</Text>}
                </View>
              ))}

              <View style={{ flexDirection: "row", gap: 10, marginTop: 4 }}>
                <TouchableOpacity style={[styles.cancelBtn, { borderColor: colors.border }]} onPress={() => setModal(false)}>
                  <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.saveBtn, { backgroundColor: "#4F46E5" }]} onPress={handleAdd}>
                  <Text style={{ color: "#fff", fontFamily: "Inter_700Bold" }}>Add Customer</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root:       { flex: 1 },
  header:     { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingBottom: 16 },
  headerTitle:{ fontSize: 20, color: "#fff" },
  headerSub:  { fontSize: 12, color: "#c7d2fe", marginTop: 1 },
  addBtn:     { width: 34, height: 34, borderRadius: 10, backgroundColor: "#ffffff30", alignItems: "center", justifyContent: "center" },
  statsRow:   { flexDirection: "row", paddingVertical: 12, borderBottomWidth: 1 },
  statItem:   { flex: 1, alignItems: "center" },
  statVal:    { fontSize: 18 },
  statLabel:  { fontSize: 11, marginTop: 1 },
  statDiv:    { width: 1, marginVertical: 4 },
  searchBox:  { flexDirection: "row", alignItems: "center", gap: 8, margin: 12, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  searchInput:{ flex: 1, fontSize: 14 },
  card:       { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 14, borderWidth: 1, padding: 13 },
  avatar:     { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 15 },
  custName:   { fontSize: 14 },
  custPhone:  { fontSize: 12, marginTop: 1 },
  custSpent:  { fontSize: 14 },
  dueBadge:   { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  dueText:    { fontSize: 10 },
  overlay:    { flex: 1, backgroundColor: "#00000060", justifyContent: "flex-end" },
  sheet:      { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, gap: 10 },
  handle:     { width: 40, height: 4, borderRadius: 2, backgroundColor: "#CBD5E1", alignSelf: "center", marginBottom: 8 },
  sheetTitle: { fontSize: 18, marginBottom: 4 },
  label:      { fontSize: 13, marginBottom: 2 },
  input:      { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  errText:    { color: "#EF4444", fontSize: 11, marginTop: -4 },
  cancelBtn:  { flex: 1, paddingVertical: 13, borderRadius: 12, borderWidth: 1, alignItems: "center" },
  saveBtn:    { flex: 2, paddingVertical: 13, borderRadius: 12, alignItems: "center" },
});
