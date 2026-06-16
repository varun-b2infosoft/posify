import React, { useEffect, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useLayout } from "@/hooks/useLayout";
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

/* ── Shared order card ── */
function OrderCard({
  order,
  colors,
  onResume,
  onDelete,
}: {
  order: HeldOrder;
  colors: any;
  onResume: () => void;
  onDelete: () => void;
}) {
  const old   = isOld(order.createdAt);
  const large = isLarge(order.total);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor:  colors.card,
          borderColor:      old ? "#EF444430" : colors.border,
          borderLeftWidth:  old || large ? 3 : 1,
          borderLeftColor:  old ? "#EF4444" : large ? "#F59E0B" : colors.border,
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
          onPress={onDelete}
        >
          <Feather name="trash-2" size={14} color="#EF4444" />
          <Text style={[styles.deleteBtnText, { fontFamily: "Inter_600SemiBold" }]}>Delete</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.resumeBtn, { backgroundColor: colors.primary }]}
          onPress={onResume}
        >
          <Feather name="play-circle" size={15} color="#fff" />
          <Text style={[styles.resumeBtnText, { fontFamily: "Inter_700Bold" }]}>Resume</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ── Shared confirmation dialog ── */
function ConfirmDialog({
  visible,
  colors,
  iconName,
  iconBg,
  iconColor,
  title,
  subtitle,
  cancelLabel,
  confirmLabel,
  confirmBg,
  onCancel,
  onConfirm,
}: {
  visible: boolean;
  colors: any;
  iconName: string;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
  cancelLabel: string;
  confirmLabel: string;
  confirmBg: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!visible) return null;
  return (
    <Modal transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.dialogOverlay}>
        <View style={[styles.dialog, { backgroundColor: colors.card }]}>
          <View style={[styles.dialogIconBox, { backgroundColor: iconBg }]}>
            <Feather name={iconName as any} size={22} color={iconColor} />
          </View>
          <Text style={[styles.dialogTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            {title}
          </Text>
          <Text style={[styles.dialogSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            {subtitle}
          </Text>
          <View style={styles.dialogActions}>
            <TouchableOpacity style={[styles.dialogCancel, { borderColor: colors.border }]} onPress={onCancel}>
              <Text style={[styles.dialogCancelText, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                {cancelLabel}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.dialogConfirm, { backgroundColor: confirmBg }]} onPress={onConfirm}>
              <Text style={[styles.dialogConfirmText, { fontFamily: "Inter_700Bold" }]}>{confirmLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function HeldOrdersPanel({ visible, hasActiveCart, onResume, onClose }: Props) {
  const colors = useColors();
  const layout = useLayout();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top + 8;
  const botPad = Platform.OS === "web" ? 24 : insets.bottom + 16;

  const [orders,        setOrders]        = useState<HeldOrder[]>(() => getHeldOrders());
  const [confirmDelete, setConfirmDelete] = useState<HeldOrder | null>(null);
  const [confirmResume, setConfirmResume] = useState<HeldOrder | null>(null);

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

  const totalValue = orders.reduce((s, o) => s + o.total, 0);
  const oldCount   = orders.filter(o => isOld(o.createdAt)).length;

  const dialogs = (
    <>
      <ConfirmDialog
        visible={!!confirmDelete}
        colors={colors}
        iconName="trash-2"
        iconBg="#EF444415"
        iconColor="#EF4444"
        title="Delete held order?"
        subtitle={confirmDelete ? `"${confirmDelete.orderName}" with ${confirmDelete.itemCount} item${confirmDelete.itemCount !== 1 ? "s" : ""} will be permanently removed.` : ""}
        cancelLabel="Cancel"
        confirmLabel="Delete"
        confirmBg="#EF4444"
        onCancel={() => setConfirmDelete(null)}
        onConfirm={handleDeleteConfirm}
      />
      <ConfirmDialog
        visible={!!confirmResume}
        colors={colors}
        iconName="alert-triangle"
        iconBg="#F59E0B15"
        iconColor="#F59E0B"
        title="Replace current cart?"
        subtitle={confirmResume ? `Your active cart has items. Resuming "${confirmResume.orderName}" will replace it. Consider holding your current cart first.` : ""}
        cancelLabel="Cancel"
        confirmLabel="Resume"
        confirmBg={colors.primary}
        onCancel={() => setConfirmResume(null)}
        onConfirm={handleResumeConfirm}
      />
    </>
  );

  /* ─────────── DESKTOP ─────────── */
  if (layout.isWide) {
    // Pair cards for 2-column grid
    const pairs: HeldOrder[][] = [];
    for (let i = 0; i < orders.length; i += 2) pairs.push(orders.slice(i, i + 2));

    return (
      <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
        <View style={desk.overlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

          <View style={[desk.panel, { backgroundColor: colors.background }]}>
            {/* Desktop header */}
            <View style={[desk.header, { backgroundColor: colors.primary }]}>
              <View style={[desk.headerIcon, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
                <Feather name="pause-circle" size={20} color="#fff" />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={[desk.headerTitle, { fontFamily: "Inter_700Bold" }]}>Held Orders</Text>
                <Text style={[desk.headerSub, { fontFamily: "Inter_400Regular" }]}>
                  Resume a saved cart to continue the sale
                </Text>
              </View>

              {/* Stats */}
              <View style={desk.statsRow}>
                <View style={[desk.statChip, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
                  <Text style={[desk.statNum, { fontFamily: "Inter_700Bold" }]}>{orders.length}</Text>
                  <Text style={[desk.statLabel, { fontFamily: "Inter_400Regular" }]}>Orders</Text>
                </View>
                {totalValue > 0 && (
                  <View style={[desk.statChip, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
                    <Text style={[desk.statNum, { fontFamily: "Inter_700Bold" }]}>
                      ₹{totalValue >= 1000 ? `${(totalValue / 1000).toFixed(1)}k` : totalValue}
                    </Text>
                    <Text style={[desk.statLabel, { fontFamily: "Inter_400Regular" }]}>Total</Text>
                  </View>
                )}
                {oldCount > 0 && (
                  <View style={[desk.statChip, { backgroundColor: "#EF444430" }]}>
                    <Feather name="clock" size={12} color="#FCA5A5" />
                    <Text style={[desk.statNum, { fontFamily: "Inter_700Bold", color: "#FCA5A5" }]}>{oldCount}</Text>
                    <Text style={[desk.statLabel, { fontFamily: "Inter_400Regular", color: "#FCA5A5" }]}>Waiting</Text>
                  </View>
                )}
              </View>

              <TouchableOpacity
                onPress={onClose}
                style={[desk.closeBtn, { backgroundColor: "rgba(255,255,255,0.15)" }]}
              >
                <Feather name="x" size={18} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Content */}
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
                contentContainerStyle={[desk.grid, { paddingBottom: 28 }]}
                showsVerticalScrollIndicator={false}
              >
                {pairs.map((pair, pi) => (
                  <View key={pi} style={desk.gridRow}>
                    {pair.map(order => (
                      <View key={order.id} style={desk.cardWrap}>
                        <OrderCard
                          order={order}
                          colors={colors}
                          onResume={() => handleResumePress(order)}
                          onDelete={() => setConfirmDelete(order)}
                        />
                      </View>
                    ))}
                    {pair.length < 2 && <View style={desk.cardWrap} />}
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        </View>

        {dialogs}
      </Modal>
    );
  }

  /* ─────────── MOBILE ─────────── */
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
            {orders.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                colors={colors}
                onResume={() => handleResumePress(order)}
                onDelete={() => setConfirmDelete(order)}
              />
            ))}
          </ScrollView>
        )}
      </View>

      {dialogs}
    </Modal>
  );
}

/* ── Desktop styles ── */
const desk = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  panel: {
    width: "100%",
    maxWidth: 820,
    maxHeight: "88%",
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.22,
    shadowRadius: 40,
    elevation: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 24,
    paddingVertical: 18,
  },
  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { color: "#fff", fontSize: 20 },
  headerSub:   { color: "rgba(255,255,255,0.7)", fontSize: 12, marginTop: 2 },

  statsRow: { flexDirection: "row", gap: 8, flexShrink: 0 },
  statChip: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 16,
  },
  statNum:   { color: "#fff", fontSize: 13 },
  statLabel: { color: "rgba(255,255,255,0.75)", fontSize: 11 },

  closeBtn: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
  },

  grid: { paddingHorizontal: 20, paddingTop: 18, gap: 0 },
  gridRow: { flexDirection: "row", gap: 14, marginBottom: 14 },
  cardWrap: { flex: 1 },
});

/* ── Mobile / shared styles ── */
const styles = StyleSheet.create({
  root: { flex: 1 },

  header: {
    flexDirection: "row", alignItems: "flex-end",
    paddingHorizontal: 16, paddingBottom: 12, gap: 10,
  },
  backBtn:    { padding: 3 },
  headerTitle:{ color: "#fff", fontSize: 18, flex: 1 },
  countBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  countText:  { color: "#fff", fontSize: 13 },

  empty:       { flex: 1, alignItems: "center", justifyContent: "center", gap: 14, padding: 32 },
  emptyIconBox:{ width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center" },
  emptyTitle:  { fontSize: 18 },
  emptySubtext:{ fontSize: 14, textAlign: "center", lineHeight: 21 },

  list: { paddingHorizontal: 14, paddingTop: 14, gap: 12 },

  card: {
    borderRadius: 16, borderWidth: 1, padding: 14, gap: 8,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  cardTop:    { flexDirection: "row", alignItems: "center", gap: 8 },
  queueBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  queueText:  { fontSize: 12 },
  orderName:  { flex: 1, fontSize: 15 },
  alertBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8 },
  alertText:  { fontSize: 10 },

  metaRow:  { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 12 },
  metaDot:  { width: 3, height: 3, borderRadius: 2, backgroundColor: "#D1D5DB" },
  totalText:{ fontSize: 13 },

  customerRow:  { flexDirection: "row", alignItems: "center", gap: 7 },
  avatarCircle: { width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  avatarText:   { fontSize: 11 },
  customerName: { fontSize: 13 },
  customerPhone:{ fontSize: 12 },

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
  dialog:        { borderRadius: 20, padding: 22, width: "100%", maxWidth: 340, alignItems: "center", gap: 10 },
  dialogIconBox: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  dialogTitle:   { fontSize: 17, textAlign: "center" },
  dialogSub:     { fontSize: 13, textAlign: "center", lineHeight: 19 },
  dialogActions: { flexDirection: "row", gap: 10, marginTop: 6, width: "100%" },
  dialogCancel:  { flex: 1, borderWidth: 1.5, borderRadius: 12, paddingVertical: 12, alignItems: "center" },
  dialogCancelText:  { fontSize: 14 },
  dialogConfirm: { flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: "center" },
  dialogConfirmText: { color: "#fff", fontSize: 14 },
});
