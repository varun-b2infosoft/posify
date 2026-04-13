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
import {
  STATUS_META, TransferStatus,
  getTransfer, subscribeTransfers, updateTransferStatus,
  StockTransfer,
} from "@/store/transfers";

const TIMELINE_STATUSES: TransferStatus[] = ["initiated", "in_transit", "completed"];

function Timeline({ status }: { status: TransferStatus }) {
  const colors = useColors();
  const isCancel = status === "cancelled";
  const currentIdx = TIMELINE_STATUSES.indexOf(status);

  if (isCancel) {
    return (
      <View style={[styles.timelineCard, { backgroundColor: "#FEE2E215", borderColor: "#EF444430" }]}>
        <View style={styles.timelineItem}>
          <View style={[styles.timelineNode, { backgroundColor: "#EF4444" }]}>
            <Feather name="x" size={12} color="#fff" />
          </View>
          <View style={styles.timelineContent}>
            <Text style={[styles.timelineLabel, { color: "#EF4444", fontFamily: "Inter_700Bold" }]}>Cancelled</Text>
            <Text style={[styles.timelineSub, { color: "#EF4444", fontFamily: "Inter_400Regular" }]}>This transfer was cancelled</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.timelineCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {TIMELINE_STATUSES.map((s, idx) => {
        const meta    = STATUS_META[s];
        const done    = idx <= currentIdx;
        const current = idx === currentIdx;
        const isLast  = idx === TIMELINE_STATUSES.length - 1;

        return (
          <React.Fragment key={s}>
            <View style={styles.timelineItem}>
              <View style={styles.timelineNodeWrap}>
                <View style={[
                  styles.timelineNode,
                  { backgroundColor: done ? meta.color.replace("065F46", "10B981").replace("1D4ED8", "3B82F6").replace("92400E", "F59E0B") : colors.border },
                ]}>
                  {done
                    ? <Feather name={current && s === "in_transit" ? "truck" : "check"} size={12} color="#fff" />
                    : null
                  }
                </View>
                {!isLast && (
                  <View style={[styles.timelineConnector, { backgroundColor: idx < currentIdx ? "#10B981" : colors.border }]} />
                )}
              </View>
              <View style={[styles.timelineContent, !isLast && { marginBottom: 20 }]}>
                <Text style={[styles.timelineLabel, { color: done ? colors.foreground : colors.mutedForeground, fontFamily: current ? "Inter_700Bold" : "Inter_500Medium" }]}>
                  {meta.label}
                </Text>
                {current && (
                  <Text style={[styles.timelineSub, { color: meta.color.replace("065F46", "10B981").replace("1D4ED8", "3B82F6").replace("92400E", "F59E0B"), fontFamily: "Inter_400Regular" }]}>
                    Current status
                  </Text>
                )}
              </View>
            </View>
          </React.Fragment>
        );
      })}
    </View>
  );
}

export default function TransferDetailScreen() {
  const { id }  = useLocalSearchParams<{ id: string }>();
  const colors  = useColors();
  const insets  = useSafeAreaInsets();
  const topPad  = Platform.OS === "web" ? 67 : insets.top;
  const botPad  = Platform.OS === "web" ? 24 : insets.bottom + 16;

  const [transfer, setTransfer] = useState<StockTransfer | undefined>(() => getTransfer(id));

  useFocusEffect(useCallback(() => {
    setTransfer(getTransfer(id));
    return subscribeTransfers(() => setTransfer(getTransfer(id)));
  }, [id]));

  if (!transfer) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background, paddingTop: topPad }]}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 16 }}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={[{ color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Transfer not found</Text>
        </View>
      </View>
    );
  }

  const meta       = STATUS_META[transfer.status];
  const totalUnits = transfer.items.reduce((s, i) => s + i.qty, 0);
  const isActive   = transfer.status !== "completed" && transfer.status !== "cancelled";

  const handleStatusChange = (newStatus: TransferStatus) => {
    Alert.alert(
      `Mark as ${STATUS_META[newStatus].label}?`,
      newStatus === "completed"
        ? "This will deduct stock from source shop. This cannot be undone."
        : undefined,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Confirm", onPress: () => updateTransferStatus(id, newStatus) },
      ]
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: "#4F46E5" }]}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 2 }}>
          <Feather name="arrow-left" size={20} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { fontFamily: "Inter_700Bold" }]}>{transfer.id}</Text>
          <Text style={[styles.headerSub, { fontFamily: "Inter_400Regular" }]}>{transfer.date}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: meta.bg }]}>
          <Feather name={meta.icon as any} size={12} color={meta.color} />
          <Text style={[styles.statusText, { color: meta.color, fontFamily: "Inter_700Bold" }]}>{meta.label}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: botPad + 80 }]}>
        {/* Route card */}
        <View style={[styles.routeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.shopBox}>
            <Text style={[styles.shopBoxLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>FROM</Text>
            <Text style={[styles.shopBoxName, { color: colors.foreground, fontFamily: "Inter_700Bold" }]} numberOfLines={2}>{transfer.fromShop}</Text>
          </View>
          <View style={{ alignItems: "center", gap: 4 }}>
            <Feather name="truck" size={24} color="#4F46E5" />
            <Text style={[{ fontSize: 10, color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              {totalUnits} units
            </Text>
          </View>
          <View style={[styles.shopBox, { alignItems: "flex-end" }]}>
            <Text style={[styles.shopBoxLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>TO</Text>
            <Text style={[styles.shopBoxName, { color: colors.foreground, fontFamily: "Inter_700Bold", textAlign: "right" }]} numberOfLines={2}>{transfer.toShop}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { label: "Products",   value: String(transfer.items.length), color: "#4F46E5" },
            { label: "Units",      value: String(totalUnits),            color: "#10B981" },
            { label: "Updated",    value: transfer.updatedAt,            color: "#F59E0B" },
          ].map(s => (
            <View key={s.label} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.statValue, { color: s.color, fontFamily: "Inter_700Bold" }]}>{s.value}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Timeline */}
        <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Transfer Status</Text>
        <Timeline status={transfer.status} />

        {/* Items */}
        <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
          Items ({transfer.items.length})
        </Text>
        <View style={[styles.itemsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {transfer.items.map((item, idx) => (
            <React.Fragment key={item.productId}>
              <View style={styles.itemRow}>
                <View style={[styles.itemIcon, { backgroundColor: "#4F46E515" }]}>
                  <Feather name="package" size={14} color="#4F46E5" />
                </View>
                <Text style={[styles.itemName, { color: colors.foreground, fontFamily: "Inter_500Medium" }]} numberOfLines={1}>{item.productName}</Text>
                <View style={[styles.itemQtyBadge, { backgroundColor: "#4F46E515" }]}>
                  <Text style={[styles.itemQtyText, { color: "#4F46E5", fontFamily: "Inter_700Bold" }]}>
                    {item.unit && (item.unit === "kg" || item.unit === "g" || item.unit === "litre" || item.unit === "ml")
                      ? `${item.qty} ${item.unit}`
                      : `×${item.qty}`}
                  </Text>
                </View>
              </View>
              {idx < transfer.items.length - 1 && <View style={[{ height: 1, backgroundColor: colors.border }]} />}
            </React.Fragment>
          ))}
        </View>

        {transfer.notes ? (
          <>
            <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Notes</Text>
            <View style={[styles.notesCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.notesText, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>{transfer.notes}</Text>
            </View>
          </>
        ) : null}

        {/* Status actions */}
        {isActive && (
          <View style={styles.actionsSection}>
            <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Update Status</Text>
            <View style={styles.actionRow}>
              {transfer.status === "initiated" && (
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: "#DBEAFE", borderColor: "#3B82F620" }]}
                  onPress={() => handleStatusChange("in_transit")}
                >
                  <Feather name="truck" size={16} color="#1D4ED8" />
                  <Text style={[styles.actionBtnText, { color: "#1D4ED8", fontFamily: "Inter_700Bold" }]}>Mark In Transit</Text>
                </TouchableOpacity>
              )}
              {(transfer.status === "initiated" || transfer.status === "in_transit") && (
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: "#D1FAE5", borderColor: "#10B98120" }]}
                  onPress={() => handleStatusChange("completed")}
                >
                  <Feather name="check-circle" size={16} color="#065F46" />
                  <Text style={[styles.actionBtnText, { color: "#065F46", fontFamily: "Inter_700Bold" }]}>Mark Completed</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: "#FEE2E2", borderColor: "#EF444420" }]}
                onPress={() => handleStatusChange("cancelled")}
              >
                <Feather name="x-circle" size={16} color="#B91C1C" />
                <Text style={[styles.actionBtnText, { color: "#B91C1C", fontFamily: "Inter_700Bold" }]}>Cancel Transfer</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "flex-end", gap: 12,
    paddingHorizontal: 16, paddingBottom: 12,
  },
  headerTitle: { color: "#fff", fontSize: 17 },
  headerSub:   { color: "rgba(255,255,255,0.75)", fontSize: 12, marginTop: 1 },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 10 },
  statusText:  { fontSize: 12 },
  content: { padding: 12, gap: 12 },

  routeCard: { borderRadius: 14, borderWidth: 1, padding: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  shopBox:   { flex: 1, gap: 4 },
  shopBoxLabel: { fontSize: 10, letterSpacing: 0.5 },
  shopBoxName:  { fontSize: 14 },

  statsRow: { flexDirection: "row", gap: 8 },
  statCard: { flex: 1, borderRadius: 12, borderWidth: 1, padding: 10, alignItems: "center", gap: 3 },
  statValue: { fontSize: 14 },
  statLabel: { fontSize: 11, textAlign: "center" },

  sectionTitle: { fontSize: 16, marginBottom: -4 },

  timelineCard: { borderRadius: 14, borderWidth: 1, padding: 16 },
  timelineItem: { flexDirection: "row", gap: 12 },
  timelineNodeWrap: { alignItems: "center", width: 26 },
  timelineNode: { width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  timelineConnector: { width: 2, flex: 1, minHeight: 16 },
  timelineContent: { flex: 1, paddingTop: 3 },
  timelineLabel: { fontSize: 14 },
  timelineSub:   { fontSize: 12, marginTop: 2 },

  itemsCard: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  itemRow:   { flexDirection: "row", alignItems: "center", gap: 10, padding: 12 },
  itemIcon:  { width: 34, height: 34, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  itemName:  { flex: 1, fontSize: 13 },
  itemQtyBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  itemQtyText:  { fontSize: 12 },

  notesCard: { borderRadius: 12, borderWidth: 1, padding: 12 },
  notesText: { fontSize: 13, lineHeight: 20 },

  actionsSection: { gap: 10 },
  actionRow: { gap: 8 },
  actionBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 12, borderWidth: 1, paddingVertical: 13 },
  actionBtnText: { fontSize: 14 },
});
