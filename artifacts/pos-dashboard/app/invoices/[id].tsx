import React, { useCallback, useState } from "react";
import {
  Alert,
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
import { Invoice, getInvoice, markReturned, subscribeInvoices } from "@/store/invoices";

const SHOP_NAME = "POSify Main Store";
const SHOP_ADDR = "12, MG Road, Bengaluru";
const GST_NO    = "29AABCP1234Q1Z5";

export default function InvoiceDetailScreen() {
  const { id }  = useLocalSearchParams<{ id: string }>();
  const colors  = useColors();
  const insets  = useSafeAreaInsets();
  const topPad  = Platform.OS === "web" ? 67 : insets.top;
  const botPad  = Platform.OS === "web" ? 24 : insets.bottom + 16;

  const [invoice, setInvoice] = useState<Invoice | undefined>(() => getInvoice(id));

  useFocusEffect(useCallback(() => {
    setInvoice(getInvoice(id));
    return subscribeInvoices(() => setInvoice(getInvoice(id)));
  }, [id]));

  if (!invoice) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Feather name="file" size={44} color="#6B7280" />
        <Text style={{ color: "#6B7280", marginTop: 12, fontFamily: "Inter_400Regular" }}>Invoice not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: "#4F46E5", fontFamily: "Inter_600SemiBold" }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleReturn = () => {
    Alert.alert(
      "Process Return",
      `Mark invoice ${invoice.invoiceNo} as returned? Stock will be adjusted.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Confirm Return", style: "destructive", onPress: () => markReturned(invoice.id) },
      ]
    );
  };

  const modeColor: Record<string, string> = { Cash: "#10B981", UPI: "#4F46E5", Card: "#8B5CF6", Credit: "#EF4444" };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: "#4F46E5", paddingTop: topPad }]}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
          <Feather name="arrow-left" size={20} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { fontFamily: "Inter_700Bold" }]}>{invoice.invoiceNo}</Text>
          <Text style={[styles.headerSub, { fontFamily: "Inter_400Regular" }]}>
            {new Date(invoice.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
          </Text>
        </View>
        {invoice.returned && (
          <View style={[styles.returnedBadge, { backgroundColor: "#FEE2E2" }]}>
            <Text style={[styles.returnedText, { color: "#B91C1C", fontFamily: "Inter_700Bold" }]}>RETURNED</Text>
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: botPad + 80 }}>
        <View style={[styles.invoiceCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.shopHeader}>
            <View style={[styles.shopIcon, { backgroundColor: "#4F46E510" }]}>
              <Feather name="shopping-bag" size={20} color="#4F46E5" />
            </View>
            <View>
              <Text style={[styles.shopName, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>{SHOP_NAME}</Text>
              <Text style={[styles.shopAddr, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{SHOP_ADDR}</Text>
              <Text style={[styles.gstNo, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>GSTIN: {GST_NO}</Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <View>
              <Text style={[styles.meta, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Billed to</Text>
              <Text style={[styles.metaVal, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>{invoice.customerName}</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={[styles.meta, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Payment</Text>
              <View style={[styles.modeBadge, { backgroundColor: (modeColor[invoice.paymentMode] ?? "#6B7280") + "15" }]}>
                <Text style={[styles.modeText, { color: modeColor[invoice.paymentMode] ?? "#6B7280", fontFamily: "Inter_700Bold" }]}>{invoice.paymentMode}</Text>
              </View>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.itemsHeader}>
            <Text style={[styles.colItem, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>ITEM</Text>
            <Text style={[styles.colQty,  { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>QTY</Text>
            <Text style={[styles.colRate, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>RATE</Text>
            <Text style={[styles.colAmt,  { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>AMT</Text>
          </View>
          {invoice.items.map((item, i) => (
            <View key={i} style={[styles.itemRow, { borderTopColor: colors.border }]}>
              <Text style={[styles.colItem, { color: colors.foreground, fontFamily: "Inter_500Medium" }]} numberOfLines={2}>{item.name}</Text>
              <Text style={[styles.colQty,  { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>{item.qty} {item.unit}</Text>
              <Text style={[styles.colRate, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>₹{item.price}</Text>
              <Text style={[styles.colAmt,  { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>₹{item.total.toLocaleString()}</Text>
            </View>
          ))}

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {[
            { label: "Subtotal",            val: invoice.subtotal, color: colors.foreground },
            { label: `GST (${invoice.gstRate}%)`, val: invoice.gst, color: "#F59E0B" },
          ].map(r => (
            <View key={r.label} style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{r.label}</Text>
              <Text style={[styles.totalVal,   { color: r.color, fontFamily: "Inter_600SemiBold" }]}>₹{r.val.toLocaleString()}</Text>
            </View>
          ))}
          <View style={[styles.grandRow, { borderTopColor: colors.border }]}>
            <Text style={[styles.grandLabel, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>TOTAL</Text>
            <Text style={[styles.grandVal,   { color: "#4F46E5",         fontFamily: "Inter_700Bold" }]}>₹{invoice.total.toLocaleString()}</Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", gap: 10 }}>
          <TouchableOpacity
            style={[styles.actionBtn, { borderColor: colors.border, backgroundColor: colors.card, flex: 1 }]}
            onPress={() => Alert.alert("Share", "WhatsApp & Email sharing coming soon")}
          >
            <Feather name="share-2" size={16} color="#4F46E5" />
            <Text style={[styles.actionText, { color: "#4F46E5", fontFamily: "Inter_600SemiBold" }]}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { borderColor: colors.border, backgroundColor: colors.card, flex: 1 }]}
            onPress={() => Alert.alert("Print", "Printer integration coming soon")}
          >
            <Feather name="printer" size={16} color="#10B981" />
            <Text style={[styles.actionText, { color: "#10B981", fontFamily: "Inter_600SemiBold" }]}>Print</Text>
          </TouchableOpacity>
          {!invoice.returned && (
            <TouchableOpacity
              style={[styles.actionBtn, { borderColor: "#EF444430", backgroundColor: "#FEF2F2", flex: 1 }]}
              onPress={handleReturn}
            >
              <Feather name="rotate-ccw" size={16} color="#EF4444" />
              <Text style={[styles.actionText, { color: "#EF4444", fontFamily: "Inter_600SemiBold" }]}>Return</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:          { flex: 1 },
  header:        { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingBottom: 16 },
  headerTitle:   { fontSize: 18, color: "#fff" },
  headerSub:     { fontSize: 12, color: "#c7d2fe", marginTop: 1 },
  returnedBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  returnedText:  { fontSize: 10 },
  invoiceCard:   { borderRadius: 16, borderWidth: 1, padding: 16, gap: 12 },
  shopHeader:    { flexDirection: "row", alignItems: "center", gap: 12 },
  shopIcon:      { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  shopName:      { fontSize: 15 },
  shopAddr:      { fontSize: 11, marginTop: 1 },
  gstNo:         { fontSize: 10, marginTop: 1 },
  divider:       { height: 1 },
  meta:          { fontSize: 11 },
  metaVal:       { fontSize: 14, marginTop: 2 },
  modeBadge:     { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginTop: 3 },
  modeText:      { fontSize: 11 },
  itemsHeader:   { flexDirection: "row", gap: 4 },
  itemRow:       { flexDirection: "row", gap: 4, paddingTop: 8, borderTopWidth: 1 },
  colItem:       { flex: 2.5, fontSize: 11 },
  colQty:        { flex: 1, fontSize: 11, textAlign: "center" },
  colRate:       { flex: 1, fontSize: 11, textAlign: "right" },
  colAmt:        { flex: 1.2, fontSize: 11, textAlign: "right" },
  totalRow:      { flexDirection: "row", justifyContent: "space-between" },
  totalLabel:    { fontSize: 13 },
  totalVal:      { fontSize: 13 },
  grandRow:      { flexDirection: "row", justifyContent: "space-between", paddingTop: 10, borderTopWidth: 1 },
  grandLabel:    { fontSize: 16 },
  grandVal:      { fontSize: 18 },
  actionBtn:     { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 12, borderRadius: 12, borderWidth: 1 },
  actionText:    { fontSize: 13 },
});
