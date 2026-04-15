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
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import {
  Customer, CreditTransaction,
  addCreditTransaction, getCustomer, getCreditTransactions, subscribeCustomers,
} from "@/store/customers";

function initials(name: string) { return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase(); }

export default function CustomerCreditScreen() {
  const { id }  = useLocalSearchParams<{ id: string }>();
  const colors  = useColors();
  const insets  = useSafeAreaInsets();
  const topPad  = Platform.OS === "web" ? 67 : insets.top;
  const botPad  = Platform.OS === "web" ? 24 : insets.bottom + 16;

  const [customer, setCustomer] = useState<Customer | undefined>(() => getCustomer(id));
  const [txs,      setTxs]      = useState<CreditTransaction[]>(() => getCreditTransactions(id));
  const [modal,    setModal]    = useState(false);
  const [txType,   setTxType]   = useState<"sale" | "payment">("payment");
  const [amount,   setAmount]   = useState("");
  const [note,     setNote]     = useState("");
  const [errors,   setErrors]   = useState<Record<string, string>>({});

  useFocusEffect(useCallback(() => {
    setCustomer(getCustomer(id));
    setTxs(getCreditTransactions(id));
    return subscribeCustomers(() => {
      setCustomer(getCustomer(id));
      setTxs(getCreditTransactions(id));
    });
  }, [id]));

  const handleAdd = () => {
    const e: Record<string, string> = {};
    if (!amount.trim() || isNaN(Number(amount)) || Number(amount) <= 0) e.amount = "Enter a valid amount";
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    addCreditTransaction({
      customerId: id,
      type:       txType,
      amount:     Number(amount),
      note:       note.trim(),
      date:       new Date().toISOString().split("T")[0],
    });
    setAmount(""); setNote(""); setErrors({});
    setModal(false);
  };

  let runningBalance = 0;
  const txsWithBalance = [...txs].reverse().map(tx => {
    if (tx.type === "sale")    runningBalance = Math.max(0, runningBalance + tx.amount);
    if (tx.type === "payment") runningBalance = Math.max(0, runningBalance - tx.amount);
    return { ...tx, balance: runningBalance };
  }).reverse();

  const txIcon = (type: string) => {
    if (type === "sale")       return { icon: "arrow-up-right"  as const, bg: "#FEE2E2", color: "#EF4444" };
    if (type === "payment")    return { icon: "arrow-down-left" as const, bg: "#D1FAE5", color: "#10B981" };
    if (type === "wallet_in")  return { icon: "pocket"          as const, bg: "#DBEAFE", color: "#3B82F6" };
    if (type === "wallet_out") return { icon: "shopping-bag"    as const, bg: "#FEF3C7", color: "#F59E0B" };
    return { icon: "circle" as const, bg: "#F3F4F6", color: "#6B7280" };
  };
  const txLabel = (tx: CreditTransaction) => {
    if (tx.note) return tx.note;
    if (tx.type === "sale")       return "Credit Sale";
    if (tx.type === "payment")    return "Payment Received";
    if (tx.type === "wallet_in")  return "Wallet Deposit";
    if (tx.type === "wallet_out") return "Wallet Used";
    return "Transaction";
  };
  const txAmtSign = (type: string) => type === "sale" || type === "wallet_in" ? "+" : "−";
  const txAmtColor = (type: string) => type === "sale" ? "#EF4444" : type === "payment" ? "#10B981" : type === "wallet_in" ? "#3B82F6" : "#F59E0B";

  if (!customer) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: "#6B7280" }}>Customer not found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: "#EF4444", paddingTop: topPad }]}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
          <Feather name="arrow-left" size={20} color="#fff" />
        </TouchableOpacity>
        <View style={[styles.avatar, { backgroundColor: "#ffffff30" }]}>
          <Text style={[styles.avatarText, { fontFamily: "Inter_700Bold" }]}>{initials(customer.name)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { fontFamily: "Inter_700Bold" }]}>{customer.name}</Text>
          <Text style={[styles.headerSub, { fontFamily: "Inter_400Regular" }]}>{customer.phone}</Text>
        </View>
        <TouchableOpacity style={styles.addTxBtn} onPress={() => setModal(true)}>
          <Feather name="plus" size={16} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={[styles.balanceBanner, { backgroundColor: customer.creditBalance > 0 ? "#FEF2F2" : "#F0FDF4", borderColor: customer.creditBalance > 0 ? "#FECACA" : "#BBF7D0" }]}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1 }}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.balanceAmt, { color: customer.creditBalance > 0 ? "#DC2626" : "#15803D", fontFamily: "Inter_700Bold" }]}>
              ₹{customer.creditBalance.toLocaleString()}
            </Text>
            <Text style={[styles.balanceLabel, { color: customer.creditBalance > 0 ? "#B91C1C" : "#166534", fontFamily: "Inter_400Regular" }]}>
              {customer.creditBalance > 0 ? "Outstanding (Due)" : "No dues — all clear!"}
            </Text>
          </View>
          {customer.walletBalance > 0 && (
            <View style={[styles.walletBadge, { backgroundColor: "#DBEAFE", borderColor: "#BFDBFE" }]}>
              <Feather name="pocket" size={12} color="#3B82F6" />
              <View>
                <Text style={[{ color: "#1D4ED8", fontSize: 14, fontFamily: "Inter_700Bold" }]}>₹{customer.walletBalance.toLocaleString()}</Text>
                <Text style={[{ color: "#1D4ED8", fontSize: 10, fontFamily: "Inter_400Regular" }]}>Wallet Balance</Text>
              </View>
            </View>
          )}
        </View>
        {customer.creditBalance > 0 && (
          <TouchableOpacity
            style={[styles.quickPayBtn, { backgroundColor: "#10B981" }]}
            onPress={() => { setTxType("payment"); setModal(true); }}
          >
            <Feather name="check-circle" size={13} color="#fff" />
            <Text style={[styles.quickPayText, { fontFamily: "Inter_700Bold" }]}>Record Payment</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={{ padding: 12, gap: 0, paddingBottom: botPad + 24 }}>
        {txsWithBalance.length === 0 && (
          <View style={{ alignItems: "center", paddingTop: 60 }}>
            <Feather name="credit-card" size={40} color={colors.mutedForeground} />
            <Text style={{ color: colors.mutedForeground, marginTop: 12, fontFamily: "Inter_400Regular" }}>No credit transactions yet</Text>
          </View>
        )}
        {txsWithBalance.map((tx, i) => {
          const ic = txIcon(tx.type);
          const isWallet = tx.type === "wallet_in" || tx.type === "wallet_out";
          return (
            <View
              key={tx.id}
              style={[styles.txRow, { backgroundColor: colors.card, borderColor: colors.border, borderTopWidth: i === 0 ? 1 : 0 }]}
            >
              <View style={[styles.txIcon, { backgroundColor: ic.bg }]}>
                <Feather name={ic.icon} size={14} color={ic.color} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Text style={[styles.txNote, { color: colors.foreground, fontFamily: "Inter_500Medium" }]} numberOfLines={1}>
                    {txLabel(tx)}
                  </Text>
                  {isWallet && (
                    <View style={[{ paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4, backgroundColor: "#DBEAFE" }]}>
                      <Text style={{ color: "#1D4ED8", fontSize: 9, fontFamily: "Inter_600SemiBold" }}>WALLET</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.txDate, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  {new Date(tx.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={[styles.txAmount, { color: txAmtColor(tx.type), fontFamily: "Inter_700Bold" }]}>
                  {txAmtSign(tx.type)}₹{tx.amount.toLocaleString()}
                </Text>
                {!isWallet && (
                  <Text style={[styles.txBalance, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                    Due ₹{tx.balance.toLocaleString()}
                  </Text>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>

      <Modal visible={modal} animationType="slide" transparent onRequestClose={() => setModal(false)}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ width: "100%" }}>
            <View style={[styles.sheet, { backgroundColor: colors.card }]}>
              <View style={styles.handle} />
              <Text style={[styles.sheetTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Add Transaction</Text>

              <View style={{ flexDirection: "row", gap: 8 }}>
                {(["sale", "payment"] as const).map(t => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.typeBtn, { borderColor: txType === t ? (t === "sale" ? "#EF4444" : "#10B981") : colors.border, backgroundColor: txType === t ? (t === "sale" ? "#FEE2E2" : "#D1FAE5") : colors.background }]}
                    onPress={() => setTxType(t)}
                  >
                    <Feather name={t === "sale" ? "arrow-up-right" : "arrow-down-left"} size={14} color={t === "sale" ? "#EF4444" : "#10B981"} />
                    <Text style={[styles.typeBtnText, { color: t === "sale" ? "#EF4444" : "#10B981", fontFamily: "Inter_600SemiBold" }]}>
                      {t === "sale" ? "Credit Sale" : "Record Payment"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.label, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>Amount (₹) *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, borderColor: errors.amount ? "#EF4444" : colors.border, color: colors.foreground, fontFamily: "Inter_400Regular" }]}
                placeholder="Enter amount"
                placeholderTextColor={colors.mutedForeground}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
              />
              {errors.amount && <Text style={styles.errText}>{errors.amount}</Text>}

              <Text style={[styles.label, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>Note (optional)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground, fontFamily: "Inter_400Regular" }]}
                placeholder="e.g. Grocery items, UPI payment..."
                placeholderTextColor={colors.mutedForeground}
                value={note}
                onChangeText={setNote}
              />

              <View style={{ flexDirection: "row", gap: 10, marginTop: 4 }}>
                <TouchableOpacity style={[styles.cancelBtn, { borderColor: colors.border }]} onPress={() => setModal(false)}>
                  <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.saveBtn, { backgroundColor: txType === "sale" ? "#EF4444" : "#10B981" }]} onPress={handleAdd}>
                  <Text style={{ color: "#fff", fontFamily: "Inter_700Bold" }}>Save</Text>
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
  root:          { flex: 1 },
  header:        { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingBottom: 16 },
  avatar:        { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  avatarText:    { fontSize: 12, color: "#fff" },
  headerTitle:   { fontSize: 18, color: "#fff" },
  headerSub:     { fontSize: 12, color: "#fecaca", marginTop: 1 },
  addTxBtn:      { width: 34, height: 34, borderRadius: 10, backgroundColor: "#ffffff25", alignItems: "center", justifyContent: "center" },
  balanceBanner: { margin: 12, borderRadius: 14, borderWidth: 1, padding: 16, alignItems: "center", gap: 6 },
  balanceAmt:    { fontSize: 32 },
  balanceLabel:  { fontSize: 13 },
  quickPayBtn:   { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginTop: 4 },
  walletBadge:   { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  quickPayText:  { color: "#fff", fontSize: 13 },
  txRow:         { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderWidth: 1 },
  txIcon:        { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  txNote:        { fontSize: 13 },
  txDate:        { fontSize: 11 },
  txAmount:      { fontSize: 15 },
  txBalance:     { fontSize: 11 },
  overlay:       { flex: 1, backgroundColor: "#00000060", justifyContent: "flex-end" },
  sheet:         { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, gap: 10 },
  handle:        { width: 40, height: 4, borderRadius: 2, backgroundColor: "#CBD5E1", alignSelf: "center", marginBottom: 8 },
  sheetTitle:    { fontSize: 18, marginBottom: 4 },
  typeBtn:       { flex: 1, flexDirection: "row", alignItems: "center", gap: 6, padding: 10, borderRadius: 10, borderWidth: 1.5 },
  typeBtnText:   { fontSize: 13 },
  label:         { fontSize: 13, marginBottom: 2 },
  input:         { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  errText:       { color: "#EF4444", fontSize: 11 },
  cancelBtn:     { flex: 1, paddingVertical: 13, borderRadius: 12, borderWidth: 1, alignItems: "center" },
  saveBtn:       { flex: 2, paddingVertical: 13, borderRadius: 12, alignItems: "center" },
});
