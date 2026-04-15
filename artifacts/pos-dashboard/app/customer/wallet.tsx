import React, { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
} from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import CustomerBottomNav from "@/components/CustomerBottomNav";
import {
  CUSTOMER_PRIMARY,
  getCustomerProfile,
  getWalletTransactions,
  addWalletFunds,
  subscribeCustomerApp,
  CustomerProfile,
  WalletTx,
  WalletTxType,
} from "@/store/customerApp";

const TX_ICON: Record<WalletTxType, string> = {
  added:    "plus-circle",
  used:     "minus-circle",
  cashback: "gift",
  refund:   "rotate-ccw",
};
const TX_COLOR: Record<WalletTxType, string> = {
  added:    "#10B981",
  used:     "#EF4444",
  cashback: "#F59E0B",
  refund:   "#3B82F6",
};
const TX_LABEL: Record<WalletTxType, string> = {
  added:    "Added",
  used:     "Used",
  cashback: "Cashback",
  refund:   "Refund",
};

const QUICK_AMOUNTS = [100, 200, 500, 1000];

export default function CustomerWalletScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 60 : insets.top;

  const [profile, setProfile] = useState<CustomerProfile>(getCustomerProfile());
  const [txns, setTxns]       = useState<WalletTx[]>(getWalletTransactions());
  const [showAdd, setShowAdd] = useState(false);
  const [amount, setAmount]   = useState("");
  const [custom, setCustom]   = useState("");

  useEffect(() => {
    return subscribeCustomerApp(() => {
      setProfile(getCustomerProfile());
      setTxns(getWalletTransactions());
    });
  }, []);

  const handleAdd = () => {
    const val = parseInt(amount || custom, 10);
    if (!val || val < 10) {
      Alert.alert("Invalid", "Enter amount ≥ ₹10");
      return;
    }
    addWalletFunds(val);
    setShowAdd(false);
    setAmount("");
    setCustom("");
    Alert.alert("Success", `₹${val} added to your wallet!`);
  };

  const income  = txns.filter(t => t.type === "added"  || t.type === "cashback" || t.type === "refund").reduce((s, t) => s + t.amount, 0);
  const expense = txns.filter(t => t.type === "used").reduce((s, t) => s + t.amount, 0);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: CUSTOMER_PRIMARY, paddingTop: topPad + 10 }]}>
        <TouchableOpacity onPress={() => router.push("/customer" as any)} style={{ padding: 4 }}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { fontFamily: "Inter_700Bold" }]}>My Wallet</Text>
      </View>

      {/* Balance card */}
      <View style={[styles.balanceCard, { backgroundColor: CUSTOMER_PRIMARY }]}>
        <Text style={[styles.balanceLabel, { fontFamily: "Inter_400Regular" }]}>Wallet Balance</Text>
        <Text style={[styles.balanceAmt, { fontFamily: "Inter_700Bold" }]}>
          ₹{profile.walletBalance}
        </Text>

        <View style={styles.balanceMeta}>
          <View style={styles.metaItem}>
            <Feather name="trending-up" size={14} color="rgba(255,255,255,0.8)" />
            <Text style={[styles.metaText, { fontFamily: "Inter_400Regular" }]}>
              +₹{income} added
            </Text>
          </View>
          <View style={styles.metaDivider} />
          <View style={styles.metaItem}>
            <Feather name="trending-down" size={14} color="rgba(255,255,255,0.8)" />
            <Text style={[styles.metaText, { fontFamily: "Inter_400Regular" }]}>
              ₹{expense} used
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setShowAdd(true)}
          activeOpacity={0.85}
        >
          <Feather name="plus" size={16} color={CUSTOMER_PRIMARY} />
          <Text style={[styles.addBtnText, { color: CUSTOMER_PRIMARY, fontFamily: "Inter_700Bold" }]}>
            Add Money
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* UPI options info */}
        <View style={[styles.upiRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {["UPI", "Card", "Net Banking"].map((m) => (
            <View key={m} style={[styles.upiChip, { backgroundColor: CUSTOMER_PRIMARY + "12" }]}>
              <Feather name="credit-card" size={12} color={CUSTOMER_PRIMARY} />
              <Text style={[styles.upiText, { color: CUSTOMER_PRIMARY, fontFamily: "Inter_600SemiBold" }]}>
                {m}
              </Text>
            </View>
          ))}
        </View>

        {/* Transaction history */}
        <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
          Transaction History
        </Text>

        {txns.map((tx) => (
          <View
            key={tx.id}
            style={[styles.txCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={[styles.txIcon, { backgroundColor: TX_COLOR[tx.type] + "18" }]}>
              <Feather name={TX_ICON[tx.type] as any} size={20} color={TX_COLOR[tx.type]} />
            </View>
            <View style={{ flex: 1, gap: 3 }}>
              <Text style={[styles.txNote, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                {tx.note}
              </Text>
              <Text style={[styles.txDate, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                {TX_LABEL[tx.type]} · {tx.date}
              </Text>
            </View>
            <Text
              style={[
                styles.txAmt,
                {
                  color:      TX_COLOR[tx.type],
                  fontFamily: "Inter_700Bold",
                },
              ]}
            >
              {tx.type === "used" ? "-" : "+"}₹{tx.amount}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Add Money Modal */}
      <Modal visible={showAdd} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                Add Money to Wallet
              </Text>
              <TouchableOpacity onPress={() => setShowAdd(false)}>
                <Feather name="x" size={22} color={colors.foreground} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.quickLabel, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>
              Quick Add
            </Text>
            <View style={styles.quickRow}>
              {QUICK_AMOUNTS.map((a) => (
                <TouchableOpacity
                  key={a}
                  style={[
                    styles.quickChip,
                    {
                      backgroundColor: amount === String(a) ? CUSTOMER_PRIMARY : colors.background,
                      borderColor:     amount === String(a) ? CUSTOMER_PRIMARY : colors.border,
                    },
                  ]}
                  onPress={() => { setAmount(String(a)); setCustom(""); }}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.quickChipText,
                      {
                        color:      amount === String(a) ? "#fff" : colors.foreground,
                        fontFamily: "Inter_700Bold",
                      },
                    ]}
                  >
                    ₹{a}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.quickLabel, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>
              Or enter custom amount
            </Text>
            <View style={[styles.customInput, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Text style={[styles.rupeeSymbol, { color: colors.mutedForeground, fontFamily: "Inter_700Bold" }]}>₹</Text>
              <TextInput
                style={[styles.customField, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
                placeholder="Enter amount"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="number-pad"
                value={custom}
                onChangeText={(t) => { setCustom(t.replace(/\D/g, "")); setAmount(""); }}
              />
            </View>

            <TouchableOpacity
              style={[styles.confirmBtn, { backgroundColor: CUSTOMER_PRIMARY }]}
              onPress={handleAdd}
              activeOpacity={0.85}
            >
              <Text style={[styles.confirmBtnText, { fontFamily: "Inter_700Bold" }]}>
                Add ₹{amount || custom || "0"} to Wallet
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <CustomerBottomNav activeTab="wallet" />
    </View>
  );
}

const styles = StyleSheet.create({
  root:           { flex: 1 },
  header:         { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingBottom: 18 },
  headerTitle:    { color: "#fff", fontSize: 18, fontWeight: "700" },
  balanceCard:    { margin: 16, borderRadius: 20, padding: 24, alignItems: "center", gap: 8 },
  balanceLabel:   { color: "rgba(255,255,255,0.8)", fontSize: 14 },
  balanceAmt:     { color: "#fff", fontSize: 40 },
  balanceMeta:    { flexDirection: "row", alignItems: "center", gap: 16, marginTop: 4 },
  metaItem:       { flexDirection: "row", alignItems: "center", gap: 5 },
  metaText:       { color: "rgba(255,255,255,0.85)", fontSize: 12 },
  metaDivider:    { width: 1, height: 14, backgroundColor: "rgba(255,255,255,0.3)" },
  addBtn:         { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#fff", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, marginTop: 8 },
  addBtnText:     { fontSize: 15 },
  upiRow:         { flexDirection: "row", gap: 10, padding: 14, borderRadius: 14, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  upiChip:        { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  upiText:        { fontSize: 12 },
  sectionTitle:   { fontSize: 16 },
  txCard:         { flexDirection: "row", alignItems: "center", gap: 14, padding: 14, borderRadius: 14, borderWidth: 1 },
  txIcon:         { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  txNote:         { fontSize: 13 },
  txDate:         { fontSize: 11 },
  txAmt:          { fontSize: 16 },
  modalOverlay:   { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  modalContent:   { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, gap: 16 },
  modalHeader:    { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  modalTitle:     { fontSize: 18 },
  quickLabel:     { fontSize: 12 },
  quickRow:       { flexDirection: "row", gap: 10 },
  quickChip:      { flex: 1, alignItems: "center", paddingVertical: 12, borderRadius: 12, borderWidth: 1 },
  quickChipText:  { fontSize: 15 },
  customInput:    { flexDirection: "row", alignItems: "center", borderRadius: 12, borderWidth: 1, height: 50, paddingHorizontal: 14 },
  rupeeSymbol:    { fontSize: 18 },
  customField:    { flex: 1, fontSize: 18, paddingLeft: 4 },
  confirmBtn:     { height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  confirmBtnText: { color: "#fff", fontSize: 16 },
});
