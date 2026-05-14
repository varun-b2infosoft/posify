import React, { useCallback, useState } from "react";
import {
  Modal,
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
import { Invoice, getInvoice, markReturned, subscribeInvoices } from "@/store/invoices";

const SHOP_NAME = "IPOS Main Store";
const SHOP_ADDR = "12, MG Road, Bengaluru";
const GST_NO    = "29AABCP1234Q1Z5";

export default function InvoiceDetailScreen() {
  const { id }  = useLocalSearchParams<{ id: string }>();
  const colors  = useColors();
  const insets  = useSafeAreaInsets();
  const topPad  = Platform.OS === "web" ? 67 : insets.top;
  const botPad  = Platform.OS === "web" ? 24 : insets.bottom + 16;
  const layout  = useLayout();

  const [invoice, setInvoice] = useState<Invoice | undefined>(() => getInvoice(id));
  const [confirmReturn, setConfirmReturn] = useState(false);

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
    if (layout.isWide) { setConfirmReturn(true); return; }
    setConfirmReturn(true);
  };

  const modeColor: Record<string, string> = {
    Cash: "#10B981", UPI: "#4F46E5", Card: "#8B5CF6", Credit: "#EF4444",
  };

  const ReceiptCard = () => (
    <View style={[styles.invoiceCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.shopHeader}>
        <View style={[styles.shopIcon, { backgroundColor: "#4F46E510" }]}>
          <Feather name="shopping-bag" size={20} color="#4F46E5" />
        </View>
        <View>
          <Text style={[styles.shopName, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>{SHOP_NAME}</Text>
          <Text style={[styles.shopAddr, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{SHOP_ADDR}</Text>
          <Text style={[styles.gstNo,   { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>GSTIN: {GST_NO}</Text>
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
        { label: "Subtotal",              val: invoice.subtotal, color: colors.foreground },
        { label: `GST (${invoice.gstRate}%)`, val: invoice.gst, color: "#F59E0B" },
      ].map(r => (
        <View key={r.label} style={styles.totalRow}>
          <Text style={[styles.totalLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{r.label}</Text>
          <Text style={[styles.totalVal,   { color: r.color,               fontFamily: "Inter_600SemiBold" }]}>₹{r.val.toLocaleString()}</Text>
        </View>
      ))}
      <View style={[styles.grandRow, { borderTopColor: colors.border }]}>
        <Text style={[styles.grandLabel, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>TOTAL</Text>
        <Text style={[styles.grandVal,   { color: "#4F46E5",         fontFamily: "Inter_700Bold" }]}>₹{invoice.total.toLocaleString()}</Text>
      </View>

      {(invoice.amountPaid !== undefined || invoice.dueAmount || invoice.walletAdded || invoice.walletUsed) && (
        <View style={{ gap: 6, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.border + "60", marginTop: 4 }}>
          {invoice.walletUsed !== undefined && invoice.walletUsed > 0 && (
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: "#10B981", fontFamily: "Inter_500Medium" }]}>Wallet Applied</Text>
              <Text style={[styles.totalVal,   { color: "#10B981", fontFamily: "Inter_600SemiBold" }]}>−₹{invoice.walletUsed.toLocaleString()}</Text>
            </View>
          )}
          {invoice.amountPaid !== undefined && (
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Amount Paid</Text>
              <Text style={[styles.totalVal,   { color: "#10B981",              fontFamily: "Inter_600SemiBold" }]}>₹{invoice.amountPaid.toLocaleString()}</Text>
            </View>
          )}
          {invoice.dueAmount !== undefined && invoice.dueAmount > 0 && (
            <View style={[styles.totalRow, { backgroundColor: "#FEF2F2", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 }]}>
              <Text style={[styles.totalLabel, { color: "#EF4444", fontFamily: "Inter_600SemiBold" }]}>Due (Udhaar)</Text>
              <Text style={[styles.totalVal,   { color: "#EF4444", fontFamily: "Inter_700Bold"    }]}>₹{invoice.dueAmount.toLocaleString()}</Text>
            </View>
          )}
          {invoice.walletAdded !== undefined && invoice.walletAdded > 0 && (
            <View style={[styles.totalRow, { backgroundColor: "#F0FDF4", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 }]}>
              <Text style={[styles.totalLabel, { color: "#10B981", fontFamily: "Inter_600SemiBold" }]}>Added to Wallet</Text>
              <Text style={[styles.totalVal,   { color: "#10B981", fontFamily: "Inter_700Bold"    }]}>+₹{invoice.walletAdded.toLocaleString()}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );

  const ConfirmReturnModal = () => (
    <Modal visible={confirmReturn} transparent animationType="fade" onRequestClose={() => setConfirmReturn(false)}>
      <View style={styles.modalOverlay}>
        <View style={[styles.confirmBox, { backgroundColor: colors.card }]}>
          <View style={[styles.confirmIcon, { backgroundColor: "#FEF2F2" }]}>
            <Feather name="rotate-ccw" size={24} color="#EF4444" />
          </View>
          <Text style={[styles.confirmTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Process Return?</Text>
          <Text style={[styles.confirmSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            Mark invoice {invoice.invoiceNo} as returned? Stock will be adjusted.
          </Text>
          <View style={{ flexDirection: "row", gap: 10, marginTop: 4 }}>
            <TouchableOpacity
              style={[styles.confirmCancel, { borderColor: colors.border }]}
              onPress={() => setConfirmReturn(false)}
            >
              <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmDelete, { backgroundColor: "#EF4444" }]}
              onPress={() => { markReturned(invoice.id); setConfirmReturn(false); }}
            >
              <Text style={{ color: "#fff", fontFamily: "Inter_700Bold" }}>Confirm Return</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  /* ═══════════════════ DESKTOP ═══════════════════ */
  if (layout.isWide) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <View style={[dk.header, { backgroundColor: "#4F46E5", paddingTop: topPad }]}>
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
            <Feather name="arrow-left" size={20} color="#fff" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={[dk.headerTitle, { fontFamily: "Inter_700Bold" }]}>{invoice.invoiceNo}</Text>
            <Text style={[dk.headerSub, { fontFamily: "Inter_400Regular" }]}>
              {new Date(invoice.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </Text>
          </View>
          {invoice.returned && (
            <View style={[styles.returnedBadge, { backgroundColor: "#FEE2E2" }]}>
              <Text style={[styles.returnedText, { color: "#B91C1C", fontFamily: "Inter_700Bold" }]}>RETURNED</Text>
            </View>
          )}
          {!invoice.returned && (
            <TouchableOpacity
              style={[dk.returnBtn, { backgroundColor: "#FEE2E2" }]}
              onPress={handleReturn}
            >
              <Feather name="rotate-ccw" size={14} color="#EF4444" />
              <Text style={[dk.returnBtnText, { color: "#EF4444", fontFamily: "Inter_600SemiBold" }]}>Return</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView contentContainerStyle={[dk.body, { paddingBottom: botPad + 24 }]}>
          {/* Left: invoice receipt */}
          <View style={{ flex: 6 }}>
            <ReceiptCard />
          </View>

          {/* Right: summary + actions */}
          <View style={{ flex: 4, gap: 14 }}>
            {/* Status card */}
            <View style={[dk.sideCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[dk.sideTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Invoice Status</Text>
              <View style={[dk.statusBadge, { backgroundColor: invoice.returned ? "#FEF2F2" : invoice.paid ? "#D1FAE5" : "#FEF3C7" }]}>
                <Feather
                  name={invoice.returned ? "rotate-ccw" : invoice.paid ? "check-circle" : "clock"}
                  size={16}
                  color={invoice.returned ? "#EF4444" : invoice.paid ? "#10B981" : "#F59E0B"}
                />
                <Text style={[dk.statusText, {
                  color: invoice.returned ? "#EF4444" : invoice.paid ? "#065F46" : "#92400E",
                  fontFamily: "Inter_700Bold"
                }]}>
                  {invoice.returned ? "Returned" : invoice.paid ? "Paid" : "Pending"}
                </Text>
              </View>
              <View style={{ gap: 8 }}>
                {[
                  { label: "Invoice No",  val: invoice.invoiceNo },
                  { label: "Customer",    val: invoice.customerName },
                  { label: "Date",        val: new Date(invoice.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) },
                  { label: "Payment",     val: invoice.paymentMode },
                  { label: "Items",       val: `${invoice.items.length} item${invoice.items.length !== 1 ? "s" : ""}` },
                  { label: "GST Rate",    val: `${invoice.gstRate}%` },
                ].map(r => (
                  <View key={r.label} style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 12 }}>{r.label}</Text>
                    <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold", fontSize: 12 }}>{r.val}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Total summary */}
            <View style={[dk.sideCard, { backgroundColor: "#4F46E508", borderColor: "#4F46E530" }]}>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 13 }}>Subtotal</Text>
                <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold", fontSize: 13 }}>₹{invoice.subtotal.toLocaleString()}</Text>
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 13 }}>GST ({invoice.gstRate}%)</Text>
                <Text style={{ color: "#F59E0B", fontFamily: "Inter_600SemiBold", fontSize: 13 }}>₹{invoice.gst.toLocaleString()}</Text>
              </View>
              <View style={{ height: 1, backgroundColor: "#4F46E530" }} />
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ color: "#4F46E5", fontFamily: "Inter_700Bold", fontSize: 17 }}>Total</Text>
                <Text style={{ color: "#4F46E5", fontFamily: "Inter_700Bold", fontSize: 20 }}>₹{invoice.total.toLocaleString()}</Text>
              </View>
            </View>

            {/* Action buttons */}
            <View style={{ gap: 10 }}>
              <TouchableOpacity style={[dk.actionRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Feather name="share-2" size={17} color="#4F46E5" />
                <Text style={{ color: "#4F46E5", fontFamily: "Inter_600SemiBold", fontSize: 14, flex: 1 }}>Share Invoice</Text>
                <Feather name="chevron-right" size={15} color={colors.mutedForeground} />
              </TouchableOpacity>
              <TouchableOpacity style={[dk.actionRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Feather name="printer" size={17} color="#10B981" />
                <Text style={{ color: "#10B981", fontFamily: "Inter_600SemiBold", fontSize: 14, flex: 1 }}>Print Invoice</Text>
                <Feather name="chevron-right" size={15} color={colors.mutedForeground} />
              </TouchableOpacity>
              {!invoice.returned && (
                <TouchableOpacity
                  style={[dk.actionRow, { backgroundColor: "#FEF2F2", borderColor: "#EF444430" }]}
                  onPress={handleReturn}
                >
                  <Feather name="rotate-ccw" size={17} color="#EF4444" />
                  <Text style={{ color: "#EF4444", fontFamily: "Inter_600SemiBold", fontSize: 14, flex: 1 }}>Process Return</Text>
                  <Feather name="chevron-right" size={15} color="#EF4444" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>

        <ConfirmReturnModal />
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
        <ReceiptCard />
        <View style={{ flexDirection: "row", gap: 10 }}>
          <TouchableOpacity
            style={[styles.actionBtn, { borderColor: colors.border, backgroundColor: colors.card, flex: 1 }]}
          >
            <Feather name="share-2" size={16} color="#4F46E5" />
            <Text style={[styles.actionText, { color: "#4F46E5", fontFamily: "Inter_600SemiBold" }]}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { borderColor: colors.border, backgroundColor: colors.card, flex: 1 }]}
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

      <ConfirmReturnModal />
    </View>
  );
}

const dk = StyleSheet.create({
  header:      { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 24, paddingBottom: 16 },
  headerTitle: { fontSize: 20, color: "#fff" },
  headerSub:   { fontSize: 12, color: "#c7d2fe", marginTop: 1 },
  returnBtn:   { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10 },
  returnBtnText: { fontSize: 13 },
  body:        { flexDirection: "row", padding: 24, gap: 20, alignItems: "flex-start" },
  sideCard:    { borderRadius: 14, borderWidth: 1, padding: 16, gap: 12 },
  sideTitle:   { fontSize: 15 },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: 12 },
  statusText:  { fontSize: 14 },
  actionRow:   { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 12, borderWidth: 1 },
});

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
  modalOverlay:  { flex: 1, backgroundColor: "#00000060", alignItems: "center", justifyContent: "center", padding: 24 },
  confirmBox:    { width: "100%", maxWidth: 400, borderRadius: 20, padding: 24, gap: 14, alignItems: "center" },
  confirmIcon:   { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center" },
  confirmTitle:  { fontSize: 18, textAlign: "center" },
  confirmSub:    { fontSize: 13, textAlign: "center", lineHeight: 20 },
  confirmCancel: { flex: 1, paddingVertical: 13, borderRadius: 12, borderWidth: 1, alignItems: "center" },
  confirmDelete: { flex: 1, paddingVertical: 13, borderRadius: 12, alignItems: "center" },
});
