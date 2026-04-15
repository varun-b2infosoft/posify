import React, { useEffect, useState } from "react";
import {
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import {
  HeldOrder,
  getHeldOrders,
  subscribeHeldOrders,
  deleteHeldOrder,
} from "@/store/holdOrders";

interface Props {
  visible: boolean;
  hasActiveCart: boolean;
  onResume: (order: HeldOrder) => void;
  onClose: () => void;
}

function timeAgo(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

function isOld(ts: number): boolean {
  return Date.now() - ts > 30 * 60 * 1000;
}

function isLarge(total: number): boolean {
  return total >= 2000;
}

export function HeldOrdersPanel({ visible, hasActiveCart, onResume, onClose }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top + 8;
  const botPad = Platform.OS === "web" ? 24 : insets.bottom + 16;

  const [orders,         setOrders]         = useState<HeldOrder[]>(() => getHeldOrders());
  const [confirmDelete,  setConfirmDelete]  = useState<HeldOrder | null>(null);
  const [confirmResume,  setConfirmResume]  = useState<HeldOrder | null>(null);

  useEffect(() => {
    if (visible) setOrders(getHeldOrders());
    return subscribeHeldOrders(() => setOrders(getHeldOrders()));
  }, [visible]);

  function handleResumePress(order: HeldOrder) {
    if (hasActiveCart) {
      setConfirmResume(order);
    } else {
      onResume(order);
    }
  }

  function handleDeleteConfirm() {
    if (confirmDelete) {
      deleteHeldOrder(confirmDelete.id);
      setConfirmDelete(null);
    }
  }

  function handleResumeConfirm() {
    if (confirmResume) {
      onResume(confirmResume);
      setConfirmResume(null);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.root, { backgroundColor: colors.background }]}>

        {/* Header */}
        <View style={[styles.header, { paddingTop: topPad, backgroundColor: colors.primary }]}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn}>
            <Feather name="x" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { fontFamily: "Inter_700Bold" }]}>
            Held Orders
          </Text>
          <View style={[styles.countBadge, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
            <Text style={[styles.countText, { fontFamily: "Inter_700Bold" }]}>{orders.length}</Text>
          </View>
        </View>

        {/* Body */}
        {orders.length === 0 ? (
          <View style={styles.empty}>
            <View style={[styles.emptyIconBox, { backgroundColor: colors.secondary }]}>
              <Feather name="inbox" size={36} color={colors.mutedForeground} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
              No held orders
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Tap "Hold Order" in the cart to save a cart and resume later.
            </Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={[styles.list, { paddingBottom: botPad }]}
            showsVerticalScrollIndicator={false}
          >
            {orders.map((order) => {
              const old   = isOld(order.createdAt);
              const large = isLarge(order.total);
              return (
                <View
                  key={order.id}
                  style={[
                    styles.card,
                    {
                      backgroundColor: colors.card,
                      borderColor: old ? "#EF444430" : colors.border,
                      borderLeftWidth: old || large ? 3 : 1,
                      borderLeftColor: old ? "#EF4444" : large ? "#F59E0B" : colors.border,
                    },
                  ]}
                >
                  {/* Top row */}
                  <View style={styles.cardTop}>
                    <View style={[styles.queueBadge, { backgroundColor: colors.primary + "18" }]}>
                      <Text style={[styles.queueText, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>
                        #{order.queueNumber}
                      </Text>
                    </View>
                    <Text style={[styles.orderName, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                      {order.orderName}
                    </Text>
                    {old && (
                      <View style={[styles.alertBadge, { backgroundColor: "#EF444415" }]}>
                        <Feather name="clock" size={10} color="#EF4444" />
                        <Text style={[styles.alertText, { color: "#EF4444", fontFamily: "Inter_600SemiBold" }]}>Waiting</Text>
                      </View>
                    )}
                    {large && !old && (
                      <View style={[styles.alertBadge, { backgroundColor: "#F59E0B15" }]}>
                        <Feather name="star" size={10} color="#F59E0B" />
                        <Text style={[styles.alertText, { color: "#F59E0B", fontFamily: "Inter_600SemiBold" }]}>Large</Text>
                      </View>
                    )}
                  </View>

                  {/* Meta row */}
                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <Feather name="shopping-bag" size={12} color={colors.mutedForeground} />
                      <Text style={[styles.metaText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                        {order.itemCount} item{order.itemCount !== 1 ? "s" : ""}
                      </Text>
                    </View>
                    <View style={styles.metaDot} />
                    <Text style={[styles.totalText, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>
                      ₹{order.total.toLocaleString()}
                    </Text>
                    <View style={styles.metaDot} />
                    <View style={styles.metaItem}>
                      <Feather name="clock" size={12} color={colors.mutedForeground} />
                      <Text style={[styles.metaText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                        {formatTime(order.createdAt)} · {timeAgo(order.createdAt)}
                      </Text>
                    </View>
                  </View>

                  {/* Customer row */}
                  {order.customerName ? (
                    <View style={styles.customerRow}>
                      <View style={[styles.avatarCircle, { backgroundColor: colors.primary + "20" }]}>
                        <Text style={[styles.avatarText, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>
                          {order.customerName.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <Text style={[styles.customerName, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
                        {order.customerName}
                      </Text>
                      {order.customerPhone ? (
                        <Text style={[styles.customerPhone, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                          {order.customerPhone}
                        </Text>
                      ) : null}
                    </View>
                  ) : null}

                  {/* Items preview */}
                  <Text style={[styles.itemsPreview, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]} numberOfLines={1}>
                    {order.items.slice(0, 4).map(i => i.name).join(", ")}
                    {order.items.length > 4 ? ` +${order.items.length - 4} more` : ""}
                  </Text>

                  {/* Action buttons */}
                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      style={[styles.deleteBtn, { borderColor: "#EF444430", backgroundColor: "#EF444408" }]}
                      onPress={() => setConfirmDelete(order)}
                    >
                      <Feather name="trash-2" size={14} color="#EF4444" />
                      <Text style={[styles.deleteBtnText, { fontFamily: "Inter_600SemiBold" }]}>Delete</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.resumeBtn, { backgroundColor: colors.primary }]}
                      onPress={() => handleResumePress(order)}
                    >
                      <Feather name="play-circle" size={15} color="#fff" />
                      <Text style={[styles.resumeBtnText, { fontFamily: "Inter_700Bold" }]}>Resume</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        )}

        {/* Delete confirmation dialog */}
        {confirmDelete && (
          <Modal transparent animationType="fade" onRequestClose={() => setConfirmDelete(null)}>
            <View style={styles.dialogOverlay}>
              <View style={[styles.dialog, { backgroundColor: colors.card }]}>
                <View style={[styles.dialogIconBox, { backgroundColor: "#EF444415" }]}>
                  <Feather name="trash-2" size={22} color="#EF4444" />
                </View>
                <Text style={[styles.dialogTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                  Delete held order?
                </Text>
                <Text style={[styles.dialogSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  "{confirmDelete.orderName}" with {confirmDelete.itemCount} item{confirmDelete.itemCount !== 1 ? "s" : ""} will be permanently removed.
                </Text>
                <View style={styles.dialogActions}>
                  <TouchableOpacity
                    style={[styles.dialogCancel, { borderColor: colors.border }]}
                    onPress={() => setConfirmDelete(null)}
                  >
                    <Text style={[styles.dialogCancelText, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.dialogConfirm, { backgroundColor: "#EF4444" }]}
                    onPress={handleDeleteConfirm}
                  >
                    <Text style={[styles.dialogConfirmText, { fontFamily: "Inter_700Bold" }]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        )}

        {/* Resume confirmation dialog */}
        {confirmResume && (
          <Modal transparent animationType="fade" onRequestClose={() => setConfirmResume(null)}>
            <View style={styles.dialogOverlay}>
              <View style={[styles.dialog, { backgroundColor: colors.card }]}>
                <View style={[styles.dialogIconBox, { backgroundColor: "#F59E0B15" }]}>
                  <Feather name="alert-triangle" size={22} color="#F59E0B" />
                </View>
                <Text style={[styles.dialogTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                  Replace current cart?
                </Text>
                <Text style={[styles.dialogSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  Your active cart has items. Resuming "{confirmResume.orderName}" will replace it. Consider holding your current cart first.
                </Text>
                <View style={styles.dialogActions}>
                  <TouchableOpacity
                    style={[styles.dialogCancel, { borderColor: colors.border }]}
                    onPress={() => setConfirmResume(null)}
                  >
                    <Text style={[styles.dialogCancelText, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.dialogConfirm, { backgroundColor: colors.primary }]}
                    onPress={handleResumeConfirm}
                  >
                    <Text style={[styles.dialogConfirmText, { fontFamily: "Inter_700Bold" }]}>Resume</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  header: {
    flexDirection: "row", alignItems: "flex-end",
    paddingHorizontal: 16, paddingBottom: 12, gap: 10,
  },
  backBtn: { padding: 3 },
  headerTitle: { color: "#fff", fontSize: 18, flex: 1 },
  countBadge: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 12,
  },
  countText: { color: "#fff", fontSize: 13 },

  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14, padding: 32 },
  emptyIconBox: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontSize: 18 },
  emptySubtext: { fontSize: 14, textAlign: "center", lineHeight: 21 },

  list: { paddingHorizontal: 14, paddingTop: 14, gap: 12 },

  card: {
    borderRadius: 16, borderWidth: 1, padding: 14, gap: 8,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 8 },
  queueBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  queueText: { fontSize: 12 },
  orderName: { flex: 1, fontSize: 15 },
  alertBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8 },
  alertText: { fontSize: 10 },

  metaRow: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 12 },
  metaDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: "#D1D5DB" },
  totalText: { fontSize: 13 },

  customerRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  avatarCircle: { width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 11 },
  customerName: { fontSize: 13 },
  customerPhone: { fontSize: 12 },

  itemsPreview: { fontSize: 12, lineHeight: 17 },

  cardActions: { flexDirection: "row", gap: 8, marginTop: 4 },
  deleteBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, borderWidth: 1, borderRadius: 11, paddingVertical: 10,
  },
  deleteBtnText: { color: "#EF4444", fontSize: 13 },
  resumeBtn: {
    flex: 2, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, borderRadius: 11, paddingVertical: 10,
  },
  resumeBtnText: { color: "#fff", fontSize: 14 },

  dialogOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "center", alignItems: "center", padding: 24 },
  dialog: { borderRadius: 20, padding: 22, width: "100%", maxWidth: 340, alignItems: "center", gap: 10 },
  dialogIconBox: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  dialogTitle: { fontSize: 17, textAlign: "center" },
  dialogSub: { fontSize: 13, textAlign: "center", lineHeight: 19 },
  dialogActions: { flexDirection: "row", gap: 10, marginTop: 6, width: "100%" },
  dialogCancel: { flex: 1, borderWidth: 1.5, borderRadius: 12, paddingVertical: 12, alignItems: "center" },
  dialogCancelText: { fontSize: 14 },
  dialogConfirm: { flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: "center" },
  dialogConfirmText: { color: "#fff", fontSize: 14 },
});
