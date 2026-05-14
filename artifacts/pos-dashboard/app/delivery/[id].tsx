import React, { useCallback, useState } from "react";
import {
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useLayout } from "@/hooks/useLayout";
import {
  DeliveryOrder,
  DeliveryStatus,
  getDeliveryOrderById,
  subscribeDeliveryOrders,
  completeDeliveryOrder,
  cancelDeliveryOrder,
  setEditingDeliveryOrder,
} from "@/store/deliveryOrders";

const STATUS_CONFIG: Record<DeliveryStatus, { label: string; color: string; bg: string }> = {
  pending:   { label: "Pending Delivery", color: "#D97706", bg: "#F59E0B18" },
  completed: { label: "Delivered",        color: "#059669", bg: "#10B98118" },
  cancelled: { label: "Cancelled",        color: "#DC2626", bg: "#EF444418" },
};

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function DeliveryDetailScreen() {
  const { id }  = useLocalSearchParams<{ id: string }>();
  const colors  = useColors();
  const insets  = useSafeAreaInsets();
  const layout  = useLayout();
  const topPad  = Platform.OS === "web" ? 67 : insets.top;
  const botPad  = Platform.OS === "web" ? 24 : insets.bottom + 8;

  const [order,        setOrder]        = useState<DeliveryOrder | undefined>(() => getDeliveryOrderById(id));
  const [deliverModal, setDeliverModal] = useState(false);
  const [cancelDialog, setCancelDialog] = useState(false);
  const [amountInput,  setAmountInput]  = useState("");

  useFocusEffect(useCallback(() => {
    setOrder(getDeliveryOrderById(id));
    return subscribeDeliveryOrders(() => setOrder(getDeliveryOrderById(id)));
  }, [id]));

  if (!order) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background, justifyContent: "center", alignItems: "center" }]}>
        <Feather name="inbox" size={40} color={colors.mutedForeground} />
        <Text style={[styles.notFoundText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          Order not found
        </Text>
      </View>
    );
  }

  const st        = STATUS_CONFIG[order.status];
  const isPending = order.status === "pending";

  const amountReceived = Math.max(0, parseInt(amountInput || "0", 10));
  const totalCollected = order.amountPaid + amountReceived;
  const balance        = totalCollected - order.total;
  const stillDue       = balance < 0 ? -balance : 0;
  const walletAdded    = balance > 0 ? balance  : 0;

  function handleEditOrder() {
    setEditingDeliveryOrder(order!.id);
    router.push("/(tabs)/pos" as any);
  }

  function handleDeliverConfirm() {
    completeDeliveryOrder({ id: order!.id, amountReceived });
    setDeliverModal(false);
    setAmountInput("");
  }

  function handleCancelConfirm() {
    cancelDeliveryOrder(order!.id);
    setCancelDialog(false);
  }

  /* ── Shared content blocks ── */
  const customerBlock = (
    <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.sectionTitle, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>CUSTOMER</Text>
      <View style={styles.customerRow}>
        <View style={[styles.avatar, { backgroundColor: colors.primary + "20" }]}>
          <Text style={[styles.avatarText, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>
            {order.customer.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.customerName, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
            {order.customer.name}
          </Text>
          <Text style={[styles.customerPhone, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            {order.customer.phone}
          </Text>
          {order.customer.address ? (
            <View style={styles.addressRow}>
              <Feather name="map-pin" size={11} color={colors.mutedForeground} />
              <Text style={[styles.addressText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                {order.customer.address}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );

  const itemsBlock = (
    <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.sectionTitle, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>
        ITEMS ({order.items.length})
      </Text>
      {order.items.map((item, i) => (
        <View
          key={item.id}
          style={[styles.itemRow, i < order.items.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}
        >
          <View style={[styles.itemDot, { backgroundColor: colors.primary }]} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.itemName, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>{item.name}</Text>
            <Text style={[styles.itemUnit, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              ₹{item.price}/{item.unit}
            </Text>
          </View>
          <Text style={[styles.itemQty, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            ×{item.qty}
          </Text>
          <Text style={[styles.itemTotal, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
            ₹{(item.price * item.qty).toLocaleString()}
          </Text>
        </View>
      ))}
    </View>
  );

  const paymentBlock = (
    <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.sectionTitle, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>PAYMENT</Text>
      <View style={styles.summaryRow}>
        <Text style={[styles.summaryLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Subtotal</Text>
        <Text style={[styles.summaryVal, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>₹{order.subtotal.toLocaleString()}</Text>
      </View>
      <View style={styles.summaryRow}>
        <Text style={[styles.summaryLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>GST</Text>
        <Text style={[styles.summaryVal, { color: "#F59E0B", fontFamily: "Inter_500Medium" }]}>₹{order.gst.toLocaleString()}</Text>
      </View>
      <View style={[styles.summaryRow, styles.totalRow, { borderTopColor: colors.border }]}>
        <Text style={[styles.totalLabel, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Total</Text>
        <Text style={[styles.totalVal, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>₹{order.total.toLocaleString()}</Text>
      </View>
      {order.amountPaid > 0 && (
        <View style={[styles.summaryRow, { marginTop: 4 }]}>
          <Text style={[styles.summaryLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Advance Paid</Text>
          <Text style={[styles.summaryVal, { color: "#10B981", fontFamily: "Inter_600SemiBold" }]}>₹{order.amountPaid.toLocaleString()}</Text>
        </View>
      )}
      {order.dueAmount > 0 && (
        <View style={[styles.dueRow, { backgroundColor: "#EF444410" }]}>
          <Feather name="alert-circle" size={14} color="#EF4444" />
          <Text style={[styles.dueLabel, { color: "#EF4444", fontFamily: "Inter_600SemiBold" }]}>Due (Collect on Delivery)</Text>
          <Text style={[styles.dueVal, { color: "#EF4444", fontFamily: "Inter_700Bold" }]}>₹{order.dueAmount.toLocaleString()}</Text>
        </View>
      )}
      {order.status === "completed" && order.dueAmount === 0 && (
        <View style={[styles.dueRow, { backgroundColor: "#10B98112" }]}>
          <Feather name="check-circle" size={14} color="#10B981" />
          <Text style={[styles.dueLabel, { color: "#10B981", fontFamily: "Inter_600SemiBold" }]}>Fully Paid</Text>
        </View>
      )}
    </View>
  );

  const timestampsBlock = (
    <>
      {order.deliveredAt && (
        <View style={[styles.timestampRow, { backgroundColor: "#10B98112" }]}>
          <Feather name="check-circle" size={13} color="#10B981" />
          <Text style={[styles.timestampText, { color: "#10B981", fontFamily: "Inter_400Regular" }]}>
            Delivered on {formatDate(order.deliveredAt)}
          </Text>
        </View>
      )}
      {order.cancelledAt && (
        <View style={[styles.timestampRow, { backgroundColor: "#EF444412" }]}>
          <Feather name="x-circle" size={13} color="#EF4444" />
          <Text style={[styles.timestampText, { color: "#EF4444", fontFamily: "Inter_400Regular" }]}>
            Cancelled on {formatDate(order.cancelledAt)}
          </Text>
        </View>
      )}
    </>
  );

  /* ── Collect payment modal (centered on desktop, bottom sheet on mobile) ── */
  const collectModal = (
    <Modal
      visible={deliverModal}
      transparent
      animationType={layout.isWide ? "fade" : "slide"}
      onRequestClose={() => setDeliverModal(false)}
    >
      <View style={layout.isWide ? styles.dialogOverlay : styles.modalOverlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setDeliverModal(false)} activeOpacity={1} />
        <View style={[
          layout.isWide ? styles.deskModal : styles.modalSheet,
          { backgroundColor: colors.card },
        ]}>
          {!layout.isWide && <View style={styles.modalHandle} />}

          <View style={styles.modalHeader}>
            <View style={[styles.modalIconBox, { backgroundColor: colors.primary + "18" }]}>
              <Feather name="truck" size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.modalTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                Collect Payment
              </Text>
              <Text style={[styles.modalSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                {order.orderNo} · {order.customer.name}
              </Text>
            </View>
            {layout.isWide && (
              <TouchableOpacity onPress={() => setDeliverModal(false)} style={[styles.modalCloseBtn, { backgroundColor: colors.secondary }]}>
                <Feather name="x" size={16} color={colors.foreground} />
              </TouchableOpacity>
            )}
          </View>

          {/* Summary */}
          <View style={[styles.collectSummary, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
            <View style={styles.collectRow}>
              <Text style={[styles.collectLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Order Total</Text>
              <Text style={[styles.collectVal, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>₹{order.total.toLocaleString()}</Text>
            </View>
            {order.amountPaid > 0 && (
              <View style={styles.collectRow}>
                <Text style={[styles.collectLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Advance</Text>
                <Text style={[styles.collectVal, { color: "#10B981", fontFamily: "Inter_600SemiBold" }]}>−₹{order.amountPaid.toLocaleString()}</Text>
              </View>
            )}
            <View style={[styles.collectRow, styles.collectTotalRow, { borderTopColor: colors.border }]}>
              <Text style={[styles.collectTotalLabel, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Collect</Text>
              <Text style={[styles.collectTotalVal, { color: "#EF4444", fontFamily: "Inter_700Bold" }]}>₹{order.dueAmount.toLocaleString()}</Text>
            </View>
          </View>

          {/* Amount input */}
          <View style={styles.amountSection}>
            <Text style={[styles.amountLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>AMOUNT RECEIVED</Text>
            <View style={[styles.amountWrap, { backgroundColor: colors.secondary, borderColor: amountReceived > 0 ? colors.primary : colors.border }]}>
              <Text style={[styles.rupee, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>₹</Text>
              <TextInput
                style={[styles.amountInput, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}
                keyboardType="numeric"
                value={amountInput}
                onChangeText={setAmountInput}
                placeholder={order.dueAmount.toString()}
                placeholderTextColor={colors.mutedForeground}
                autoFocus
              />
            </View>
            {amountReceived > 0 && (
              <View style={[styles.balanceRow, { backgroundColor: stillDue > 0 ? "#EF444410" : "#10B98110" }]}>
                <Feather name={stillDue > 0 ? "alert-circle" : "check-circle"} size={14} color={stillDue > 0 ? "#EF4444" : "#10B981"} />
                <Text style={[styles.balanceText, { color: stillDue > 0 ? "#EF4444" : "#10B981", fontFamily: "Inter_600SemiBold", flex: 1 }]}>
                  {stillDue > 0 ? `Due (Udhaar) ₹${stillDue.toLocaleString()}` : walletAdded > 0 ? `Extra → Wallet ₹${walletAdded.toLocaleString()}` : "Paid in Full"}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity style={[styles.modalCancel, { borderColor: colors.border }]} onPress={() => setDeliverModal(false)}>
              <Text style={[styles.modalCancelText, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalConfirm, { backgroundColor: colors.primary }]} onPress={handleDeliverConfirm}>
              <Feather name="check-circle" size={16} color="#fff" />
              <Text style={[styles.modalConfirmText, { fontFamily: "Inter_700Bold" }]}>Collect & Complete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  /* ── Cancel dialog (always centered) ── */
  const cancelDialogEl = (
    <Modal visible={cancelDialog} transparent animationType="fade" onRequestClose={() => setCancelDialog(false)}>
      <View style={styles.dialogOverlay}>
        <View style={[styles.dialog, { backgroundColor: colors.card }]}>
          <View style={[styles.dialogIcon, { backgroundColor: "#EF444415" }]}>
            <Feather name="x-circle" size={24} color="#EF4444" />
          </View>
          <Text style={[styles.dialogTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Cancel order?</Text>
          <Text style={[styles.dialogSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            This will cancel {order.orderNo} for {order.customer.name}. Stock will not be affected.
          </Text>
          <View style={styles.dialogActions}>
            <TouchableOpacity style={[styles.dialogCancel, { borderColor: colors.border }]} onPress={() => setCancelDialog(false)}>
              <Text style={[styles.dialogCancelText, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.dialogConfirm, { backgroundColor: "#EF4444" }]} onPress={handleCancelConfirm}>
              <Text style={[styles.dialogConfirmText, { fontFamily: "Inter_700Bold" }]}>Cancel Order</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  /* ─────────── DESKTOP LAYOUT ─────────── */
  if (layout.isWide) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.deskHeader, { paddingTop: topPad, backgroundColor: colors.primary }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={20} color="#fff" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={[styles.deskHeaderTitle, { fontFamily: "Inter_700Bold" }]}>{order.orderNo}</Text>
            <Text style={[styles.deskHeaderSub, { fontFamily: "Inter_400Regular" }]}>{formatDate(order.createdAt)}</Text>
          </View>
          <View style={[styles.statusPill, { backgroundColor: st.bg }]}>
            <Text style={[styles.statusPillText, { color: st.color, fontFamily: "Inter_600SemiBold" }]}>{st.label}</Text>
          </View>
        </View>

        {/* Two-column body */}
        <View style={styles.deskBody}>
          {/* Left panel — customer + items + timestamps */}
          <ScrollView
            style={[styles.deskLeft, { borderRightColor: colors.border }]}
            contentContainerStyle={{ padding: 24, gap: 14 }}
            showsVerticalScrollIndicator={false}
          >
            {customerBlock}
            {itemsBlock}
            {timestampsBlock}
          </ScrollView>

          {/* Right panel — payment + actions */}
          <ScrollView
            style={[styles.deskRight, { backgroundColor: colors.secondary }]}
            contentContainerStyle={{ padding: 24, gap: 14, paddingBottom: 32 }}
            showsVerticalScrollIndicator={false}
          >
            {paymentBlock}

            {isPending && (
              <View style={[styles.deskActionsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.sectionTitle, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>ACTIONS</Text>

                <TouchableOpacity
                  style={[styles.deskActionBtn, { borderColor: colors.border }]}
                  onPress={handleEditOrder}
                >
                  <Feather name="edit-2" size={16} color={colors.foreground} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.deskActionTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>Edit Order</Text>
                    <Text style={[styles.deskActionSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Modify items in POS</Text>
                  </View>
                  <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.deskDeliverBtn, { backgroundColor: colors.primary }]}
                  onPress={() => { setAmountInput(order.dueAmount.toString()); setDeliverModal(true); }}
                >
                  <Feather name="truck" size={18} color="#fff" />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.deskDeliverTitle, { fontFamily: "Inter_700Bold" }]}>Mark as Delivered</Text>
                    {order.dueAmount > 0 && (
                      <Text style={[styles.deskDeliverSub, { fontFamily: "Inter_400Regular" }]}>
                        Collect ₹{order.dueAmount.toLocaleString()} on delivery
                      </Text>
                    )}
                  </View>
                  <Feather name="chevron-right" size={16} color="rgba(255,255,255,0.7)" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.deskCancelBtn, { borderColor: "#EF444430", backgroundColor: "#EF444408" }]}
                  onPress={() => setCancelDialog(true)}
                >
                  <Feather name="x-circle" size={15} color="#EF4444" />
                  <Text style={[styles.deskCancelText, { color: "#EF4444", fontFamily: "Inter_600SemiBold" }]}>Cancel Order</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>

        {collectModal}
        {cancelDialogEl}
      </View>
    );
  }

  /* ─────────── MOBILE LAYOUT ─────────── */
  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { fontFamily: "Inter_700Bold" }]}>{order.orderNo}</Text>
          <Text style={[styles.headerSub, { fontFamily: "Inter_400Regular" }]}>{formatDate(order.createdAt)}</Text>
        </View>
        <View style={[styles.statusPill, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
          <Text style={[styles.statusPillText, { color: "#fff", fontFamily: "Inter_600SemiBold" }]}>{st.label}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.body, { paddingBottom: botPad + (isPending ? 100 : 32) }]}
        showsVerticalScrollIndicator={false}
      >
        {customerBlock}
        {itemsBlock}
        {paymentBlock}
        {timestampsBlock}
      </ScrollView>

      {/* Sticky actions */}
      {isPending && (
        <View style={[styles.stickyActions, { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: botPad }]}>
          <TouchableOpacity style={[styles.editBtn, { borderColor: colors.border }]} onPress={handleEditOrder}>
            <Feather name="edit-2" size={14} color={colors.foreground} />
            <Text style={[styles.editBtnText, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.cancelBtn, { borderColor: "#EF444430", backgroundColor: "#EF444408" }]}
            onPress={() => setCancelDialog(true)}
          >
            <Feather name="x" size={14} color="#EF4444" />
            <Text style={[styles.cancelBtnText, { fontFamily: "Inter_600SemiBold" }]}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.deliverBtn, { backgroundColor: colors.primary }]}
            onPress={() => { setAmountInput(order.dueAmount.toString()); setDeliverModal(true); }}
          >
            <Feather name="truck" size={15} color="#fff" />
            <Text style={[styles.deliverBtnText, { fontFamily: "Inter_700Bold" }]}>Mark Delivered</Text>
          </TouchableOpacity>
        </View>
      )}

      {collectModal}
      {cancelDialogEl}
    </View>
  );
}

const styles = StyleSheet.create({
  root:         { flex: 1 },
  notFoundText: { marginTop: 12, fontSize: 15 },

  /* Mobile header */
  header: {
    flexDirection: "row", alignItems: "flex-end",
    paddingHorizontal: 16, paddingBottom: 12, gap: 10,
  },
  backBtn:     { padding: 3 },
  headerTitle: { color: "#fff", fontSize: 18 },
  headerSub:   { color: "rgba(255,255,255,0.7)", fontSize: 12, marginTop: 1 },
  statusPill:     { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  statusPillText: { fontSize: 12 },

  /* Desktop header */
  deskHeader: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 24, paddingBottom: 16, gap: 14,
  },
  deskHeaderTitle: { color: "#fff", fontSize: 22 },
  deskHeaderSub:   { color: "rgba(255,255,255,0.7)", fontSize: 13, marginTop: 2 },

  /* Desktop two-col */
  deskBody:  { flex: 1, flexDirection: "row" },
  deskLeft:  { flex: 3, borderRightWidth: 1 },
  deskRight: { flex: 2 },

  /* Desktop actions card */
  deskActionsCard: { borderRadius: 14, borderWidth: 1, padding: 16, gap: 10 },

  deskActionBtn: {
    flexDirection: "row", alignItems: "center", gap: 12,
    borderWidth: 1, borderRadius: 12, padding: 14,
  },
  deskActionTitle: { fontSize: 14 },
  deskActionSub:   { fontSize: 12, marginTop: 1 },

  deskDeliverBtn: {
    flexDirection: "row", alignItems: "center", gap: 12,
    borderRadius: 12, padding: 14,
  },
  deskDeliverTitle: { color: "#fff", fontSize: 15 },
  deskDeliverSub:   { color: "rgba(255,255,255,0.75)", fontSize: 12, marginTop: 2 },

  deskCancelBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 7, borderWidth: 1, borderRadius: 12, paddingVertical: 11,
  },
  deskCancelText: { fontSize: 13 },

  /* Shared section */
  body:         { paddingHorizontal: 14, paddingTop: 14, gap: 12 },
  section:      { borderRadius: 14, borderWidth: 1, padding: 14, gap: 10 },
  sectionTitle: { fontSize: 10, letterSpacing: 0.9, marginBottom: 2 },

  customerRow:  { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  avatar:       { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  avatarText:   { fontSize: 18 },
  customerName: { fontSize: 15 },
  customerPhone:{ fontSize: 13, marginTop: 2 },
  addressRow:   { flexDirection: "row", gap: 4, alignItems: "flex-start", marginTop: 4 },
  addressText:  { fontSize: 12, flex: 1, lineHeight: 17 },

  itemRow:   { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 9 },
  itemDot:   { width: 6, height: 6, borderRadius: 3 },
  itemName:  { fontSize: 14 },
  itemUnit:  { fontSize: 11, marginTop: 1 },
  itemQty:   { fontSize: 13, minWidth: 28, textAlign: "center" },
  itemTotal: { fontSize: 14, minWidth: 60, textAlign: "right" },

  summaryRow:  { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  summaryLabel:{ fontSize: 13 },
  summaryVal:  { fontSize: 13 },
  totalRow:    { borderTopWidth: 1, paddingTop: 8, marginTop: 4 },
  totalLabel:  { fontSize: 16 },
  totalVal:    { fontSize: 16 },
  dueRow:      { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 10, padding: 10, marginTop: 6 },
  dueLabel:    { flex: 1, fontSize: 13 },
  dueVal:      { fontSize: 15 },

  timestampRow: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 10, padding: 11 },
  timestampText:{ fontSize: 13 },

  /* Mobile sticky actions */
  stickyActions: {
    position: "absolute", left: 0, right: 0, bottom: 0,
    flexDirection: "row", gap: 8, padding: 12, borderTopWidth: 1,
  },
  editBtn:      { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, borderWidth: 1.5, borderRadius: 11, paddingVertical: 12 },
  editBtnText:  { fontSize: 13 },
  cancelBtn:    { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, borderWidth: 1, borderRadius: 11, paddingVertical: 12 },
  cancelBtnText:{ color: "#EF4444", fontSize: 13 },
  deliverBtn:   { flex: 2, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 11, paddingVertical: 12 },
  deliverBtnText:{ color: "#fff", fontSize: 14 },

  /* Collect modal — mobile bottom sheet */
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "flex-end" },
  modalSheet:   { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, gap: 14, paddingBottom: 36 },
  modalHandle:  { width: 40, height: 4, borderRadius: 2, backgroundColor: "#D1D5DB", alignSelf: "center", marginBottom: 4 },

  /* Collect modal — desktop centered */
  deskModal: {
    borderRadius: 20, padding: 24, gap: 16,
    width: "100%", maxWidth: 480,
    shadowColor: "#000", shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25, shadowRadius: 40, elevation: 30,
  },
  modalCloseBtn: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },

  modalHeader:  { flexDirection: "row", alignItems: "center", gap: 12 },
  modalIconBox: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  modalTitle:   { fontSize: 17 },
  modalSub:     { fontSize: 12, marginTop: 2 },

  collectSummary:    { borderRadius: 12, borderWidth: 1, padding: 12, gap: 8 },
  collectRow:        { flexDirection: "row", justifyContent: "space-between" },
  collectLabel:      { fontSize: 13 },
  collectVal:        { fontSize: 13 },
  collectTotalRow:   { borderTopWidth: 1, paddingTop: 8, marginTop: 2 },
  collectTotalLabel: { fontSize: 15 },
  collectTotalVal:   { fontSize: 15 },

  amountSection: { gap: 8 },
  amountLabel:   { fontSize: 10, letterSpacing: 0.9 },
  amountWrap:    { flexDirection: "row", alignItems: "center", borderRadius: 12, borderWidth: 1.5, paddingHorizontal: 14 },
  rupee:         { fontSize: 22, marginRight: 4 },
  amountInput:   { flex: 1, fontSize: 28, paddingVertical: 10 },
  balanceRow:    { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9 },
  balanceText:   { fontSize: 13 },

  modalActions:     { flexDirection: "row", gap: 10 },
  modalCancel:      { flex: 1, borderWidth: 1.5, borderRadius: 13, paddingVertical: 13, alignItems: "center" },
  modalCancelText:  { fontSize: 14 },
  modalConfirm:     { flex: 2, borderRadius: 13, paddingVertical: 13, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  modalConfirmText: { color: "#fff", fontSize: 14 },

  /* Cancel dialog */
  dialogOverlay:  { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "center", alignItems: "center", padding: 24 },
  dialog:         { borderRadius: 20, padding: 22, width: "100%", maxWidth: 340, alignItems: "center", gap: 10 },
  dialogIcon:     { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  dialogTitle:    { fontSize: 17 },
  dialogSub:      { fontSize: 13, textAlign: "center", lineHeight: 19 },
  dialogActions:  { flexDirection: "row", gap: 10, marginTop: 6, width: "100%" },
  dialogCancel:   { flex: 1, borderWidth: 1.5, borderRadius: 12, paddingVertical: 12, alignItems: "center" },
  dialogCancelText: { fontSize: 14 },
  dialogConfirm:    { flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: "center" },
  dialogConfirmText:{ color: "#fff", fontSize: 14 },
});
