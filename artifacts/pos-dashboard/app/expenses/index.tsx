import React, { useCallback, useState } from "react";
import {
  Alert,
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
import {
  Expense, ExpenseCategory, EXPENSE_CATEGORIES, EXPENSE_CAT_COLORS,
  addExpense, deleteExpense, getExpenses, subscribeExpenses,
} from "@/store/expenses";

function fmt(amount: number) {
  return amount >= 1000 ? `₹${(amount / 1000).toFixed(1)}k` : `₹${amount}`;
}

export default function ExpensesScreen() {
  const colors  = useColors();
  const insets  = useSafeAreaInsets();
  const topPad  = Platform.OS === "web" ? 67 : insets.top;
  const botPad  = Platform.OS === "web" ? 24 : insets.bottom + 16;

  const [expenses, setExpenses] = useState<Expense[]>(() => getExpenses());
  const [filter,   setFilter]   = useState<ExpenseCategory | "All">("All");
  const [modal,    setModal]    = useState(false);

  const [title,    setTitle]    = useState("");
  const [amount,   setAmount]   = useState("");
  const [cat,      setCat]      = useState<ExpenseCategory>("Rent");
  const [notes,    setNotes]    = useState("");
  const [errors,   setErrors]   = useState<Record<string, string>>({});

  useFocusEffect(useCallback(() => {
    setExpenses(getExpenses());
    return subscribeExpenses(() => setExpenses(getExpenses()));
  }, []));

  const now     = new Date();
  const monthly = expenses.filter(e => {
    const d = new Date(e.date);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }).reduce((s, e) => s + e.amount, 0);

  const filtered = filter === "All" ? expenses : expenses.filter(e => e.category === filter);

  const catTotals: Record<ExpenseCategory, number> = {} as any;
  EXPENSE_CATEGORIES.forEach(c => { catTotals[c] = expenses.filter(e => e.category === c).reduce((s, e) => s + e.amount, 0); });

  const handleAdd = () => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = "Title is required";
    if (!amount.trim() || isNaN(Number(amount))) e.amount = "Valid amount required";
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    addExpense({ title: title.trim(), amount: Number(amount), category: cat, date: new Date().toISOString().split("T")[0], notes: notes.trim(), shopId: "SH1" });
    setTitle(""); setAmount(""); setCat("Rent"); setNotes(""); setErrors({});
    setModal(false);
  };

  const handleDelete = (id: string) => {
    Alert.alert("Delete Expense", "Remove this expense record?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteExpense(id) },
    ]);
  };

  const CATS_WITH_ALL: Array<ExpenseCategory | "All"> = ["All", ...EXPENSE_CATEGORIES];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: "#4F46E5", paddingTop: topPad }]}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
          <Feather name="arrow-left" size={20} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { fontFamily: "Inter_700Bold" }]}>Expenses</Text>
          <Text style={[styles.headerSub, { fontFamily: "Inter_400Regular" }]}>This month: {fmt(monthly)}</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModal(true)}>
          <Feather name="plus" size={16} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={[styles.summaryRow, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        {EXPENSE_CATEGORIES.slice(0, 3).map(c => (
          <View key={c} style={styles.summaryItem}>
            <View style={[styles.summaryDot, { backgroundColor: EXPENSE_CAT_COLORS[c] }]} />
            <View>
              <Text style={[styles.summaryVal, { color: EXPENSE_CAT_COLORS[c], fontFamily: "Inter_700Bold" }]}>{fmt(catTotals[c])}</Text>
              <Text style={[styles.summaryCat, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{c}</Text>
            </View>
          </View>
        ))}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0, flexShrink: 0, borderBottomWidth: 1, borderBottomColor: colors.border }}
        contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 10, gap: 8 }}
      >
        {CATS_WITH_ALL.map(c => (
          <TouchableOpacity
            key={c}
            style={[styles.chip, { borderColor: filter === c ? (c === "All" ? "#4F46E5" : EXPENSE_CAT_COLORS[c as ExpenseCategory]) : colors.border, backgroundColor: filter === c ? (c === "All" ? "#4F46E5" : EXPENSE_CAT_COLORS[c as ExpenseCategory]) : colors.card }]}
            onPress={() => setFilter(c)}
          >
            <Text style={[styles.chipText, { fontFamily: "Inter_600SemiBold", color: filter === c ? "#fff" : colors.mutedForeground }]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={{ padding: 12, gap: 8, paddingBottom: botPad + 24 }}>
        {filtered.length === 0 && (
          <View style={{ alignItems: "center", paddingTop: 60 }}>
            <Feather name="file-text" size={40} color={colors.mutedForeground} />
            <Text style={{ color: colors.mutedForeground, marginTop: 12, fontFamily: "Inter_400Regular" }}>No expenses found</Text>
          </View>
        )}
        {filtered.map(e => {
          const catColor = EXPENSE_CAT_COLORS[e.category];
          return (
            <View key={e.id} style={[styles.item, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.itemDot, { backgroundColor: catColor + "20" }]}>
                <Feather name="tag" size={14} color={catColor} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.itemTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]} numberOfLines={1}>{e.title}</Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 }}>
                  <View style={[styles.catBadge, { backgroundColor: catColor + "15" }]}>
                    <Text style={[styles.catBadgeText, { color: catColor, fontFamily: "Inter_600SemiBold" }]}>{e.category}</Text>
                  </View>
                  <Text style={[styles.itemDate, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                    {new Date(e.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </Text>
                </View>
                {e.notes ? <Text style={[styles.itemNotes, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]} numberOfLines={1}>{e.notes}</Text> : null}
              </View>
              <View style={{ alignItems: "flex-end", gap: 6 }}>
                <Text style={[styles.itemAmount, { color: "#EF4444", fontFamily: "Inter_700Bold" }]}>-{fmt(e.amount)}</Text>
                <TouchableOpacity onPress={() => handleDelete(e.id)}>
                  <Feather name="trash-2" size={14} color={colors.mutedForeground} />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <Modal visible={modal} animationType="slide" transparent onRequestClose={() => setModal(false)}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ width: "100%" }}>
            <View style={[styles.modalSheet, { backgroundColor: colors.card }]}>
              <View style={styles.modalHandle} />
              <Text style={[styles.modalTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Add Expense</Text>

              <Text style={[styles.label, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>Title *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, borderColor: errors.title ? "#EF4444" : colors.border, color: colors.foreground, fontFamily: "Inter_400Regular" }]}
                placeholder="e.g. Shop Rent – April"
                placeholderTextColor={colors.mutedForeground}
                value={title}
                onChangeText={setTitle}
              />
              {errors.title && <Text style={styles.error}>{errors.title}</Text>}

              <Text style={[styles.label, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>Amount (₹) *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, borderColor: errors.amount ? "#EF4444" : colors.border, color: colors.foreground, fontFamily: "Inter_400Regular" }]}
                placeholder="18000"
                placeholderTextColor={colors.mutedForeground}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
              />
              {errors.amount && <Text style={styles.error}>{errors.amount}</Text>}

              <Text style={[styles.label, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={{ gap: 8, paddingBottom: 8 }}>
                {EXPENSE_CATEGORIES.map(c => (
                  <TouchableOpacity
                    key={c}
                    style={[styles.chip, { borderColor: cat === c ? EXPENSE_CAT_COLORS[c] : colors.border, backgroundColor: cat === c ? EXPENSE_CAT_COLORS[c] : colors.background }]}
                    onPress={() => setCat(c)}
                  >
                    <Text style={[styles.chipText, { fontFamily: "Inter_600SemiBold", color: cat === c ? "#fff" : colors.mutedForeground }]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={[styles.label, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>Notes (optional)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground, fontFamily: "Inter_400Regular" }]}
                placeholder="Any additional info"
                placeholderTextColor={colors.mutedForeground}
                value={notes}
                onChangeText={setNotes}
              />

              <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
                <TouchableOpacity style={[styles.cancelBtn, { borderColor: colors.border }]} onPress={() => setModal(false)}>
                  <Text style={[{ color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.saveBtn, { backgroundColor: "#4F46E5" }]} onPress={handleAdd}>
                  <Text style={[{ color: "#fff", fontFamily: "Inter_700Bold" }]}>Add Expense</Text>
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
  root:         { flex: 1 },
  header:       { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingBottom: 16 },
  headerTitle:  { fontSize: 20, color: "#fff" },
  headerSub:    { fontSize: 12, color: "#c7d2fe", marginTop: 1 },
  addBtn:       { width: 34, height: 34, borderRadius: 10, backgroundColor: "#ffffff30", alignItems: "center", justifyContent: "center" },
  summaryRow:   { flexDirection: "row", paddingHorizontal: 16, paddingVertical: 12, gap: 12, borderBottomWidth: 1 },
  summaryItem:  { flex: 1, flexDirection: "row", alignItems: "center", gap: 6 },
  summaryDot:   { width: 8, height: 8, borderRadius: 4 },
  summaryVal:   { fontSize: 14 },
  summaryCat:   { fontSize: 11 },
  chip:         { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  chipText:     { fontSize: 12 },
  item:         { flexDirection: "row", alignItems: "flex-start", gap: 10, borderRadius: 12, borderWidth: 1, padding: 12 },
  itemDot:      { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  itemTitle:    { fontSize: 14 },
  itemDate:     { fontSize: 11 },
  itemNotes:    { fontSize: 11, marginTop: 2 },
  itemAmount:   { fontSize: 15 },
  catBadge:     { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  catBadgeText: { fontSize: 10 },
  modalOverlay: { flex: 1, backgroundColor: "#00000060", justifyContent: "flex-end" },
  modalSheet:   { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, gap: 10 },
  modalHandle:  { width: 40, height: 4, borderRadius: 2, backgroundColor: "#CBD5E1", alignSelf: "center", marginBottom: 8 },
  modalTitle:   { fontSize: 18, marginBottom: 4 },
  label:        { fontSize: 13, marginBottom: 2 },
  input:        { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  error:        { color: "#EF4444", fontSize: 11, marginTop: -6 },
  cancelBtn:    { flex: 1, paddingVertical: 13, borderRadius: 12, borderWidth: 1, alignItems: "center" },
  saveBtn:      { flex: 2, paddingVertical: 13, borderRadius: 12, alignItems: "center" },
});
