import React, { useEffect, useState } from "react";
import {
  Alert,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import {
  CUSTOMER_PRIMARY,
  CUSTOMER_AMBER,
  getCustomerOrder,
  subscribeCustomerApp,
  CustomerOrder,
  OrderStatus,
} from "@/store/customerApp";

const STEPS: { key: OrderStatus; label: string; icon: string }[] = [
  { key: "placed",           label: "Order Placed",     icon: "check-circle"  },
  { key: "preparing",        label: "Preparing",        icon: "clock"         },
  { key: "out_for_delivery", label: "Out for Delivery", icon: "truck"         },
  { key: "delivered",        label: "Delivered",        icon: "home"          },
];

const STATUS_ORDER: OrderStatus[] = ["placed", "preparing", "out_for_delivery", "delivered"];

function fmtTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("en-IN", {
    hour:   "2-digit",
    minute: "2-digit",
  });
}

function fmtDate(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function OrderTrackScreen() {
  const colors  = useColors();
  const insets  = useSafeAreaInsets();
  const topPad  = Platform.OS === "web" ? 60 : insets.top;
  const { id }  = useLocalSearchParams<{ id: string }>();

  const [order, setOrder] = useState<CustomerOrder | undefined>(
    id ? getCustomerOrder(id) : undefined
  );

  useEffect(() => {
    return subscribeCustomerApp(() => {
      if (id) setOrder(getCustomerOrder(id));
    });
  }, [id]);

  if (!order) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background, justifyContent: "center", alignItems: "center" }]}>
        <Feather name="package" size={48} color={colors.mutedForeground} />
        <Text style={[{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginTop: 12 }]}>
          Order not found
        </Text>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: CUSTOMER_PRIMARY, marginTop: 20 }]}
          onPress={() => router.push("/customer/orders" as any)}
        >
          <Text style={[styles.backBtnText, { fontFamily: "Inter_700Bold" }]}>Go to Orders</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentIdx = STATUS_ORDER.indexOf(order.status);
  const isDelivered = order.status === "delivered";
  const isCancelled = order.status === "cancelled";

  const statusTimeMap: Partial<Record<OrderStatus, number>> = {};
  order.statusHistory.forEach(s => { statusTimeMap[s.status] = s.time; });

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: isDelivered ? CUSTOMER_PRIMARY : isCancelled ? "#EF4444" : CUSTOMER_PRIMARY,
            paddingTop: topPad + 10,
          },
        ]}
      >
        <TouchableOpacity onPress={() => router.push("/customer/orders" as any)} style={{ padding: 4 }}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { fontFamily: "Inter_700Bold" }]}>
            Track Order
          </Text>
          <Text style={[styles.headerSub, { fontFamily: "Inter_400Regular" }]}>
            {order.orderNo} · {order.shopName}
          </Text>
        </View>
        {!isDelivered && !isCancelled && (
          <View style={styles.pulseDot} />
        )}
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Status timeline */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            Order Status
          </Text>
          <View style={{ gap: 0 }}>
            {STEPS.map((step, idx) => {
              const done    = idx <= currentIdx && !isCancelled;
              const current = idx === currentIdx && !isCancelled && !isDelivered;
              const time    = statusTimeMap[step.key];
              const isLast  = idx === STEPS.length - 1;

              return (
                <View key={step.key} style={styles.stepRow}>
                  {/* Icon + connector */}
                  <View style={styles.stepLeft}>
                    <View
                      style={[
                        styles.stepCircle,
                        {
                          backgroundColor: done
                            ? CUSTOMER_PRIMARY
                            : colors.background,
                          borderColor: done
                            ? CUSTOMER_PRIMARY
                            : colors.border,
                        },
                      ]}
                    >
                      <Feather
                        name={step.icon as any}
                        size={14}
                        color={done ? "#fff" : colors.mutedForeground}
                      />
                    </View>
                    {!isLast && (
                      <View
                        style={[
                          styles.stepLine,
                          { backgroundColor: idx < currentIdx ? CUSTOMER_PRIMARY : colors.border },
                        ]}
                      />
                    )}
                  </View>

                  {/* Text */}
                  <View style={[styles.stepContent, isLast ? {} : { paddingBottom: 20 }]}>
                    <Text
                      style={[
                        styles.stepLabel,
                        {
                          color:      done ? colors.foreground : colors.mutedForeground,
                          fontFamily: current ? "Inter_700Bold" : "Inter_500Medium",
                        },
                      ]}
                    >
                      {step.label}
                      {current && (
                        <Text style={{ color: CUSTOMER_PRIMARY, fontFamily: "Inter_700Bold" }}>
                          {" "}(Current)
                        </Text>
                      )}
                    </Text>
                    {time ? (
                      <Text style={[styles.stepTime, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                        {fmtDate(time)} at {fmtTime(time)}
                      </Text>
                    ) : (
                      <Text style={[styles.stepTime, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                        Pending
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Order details */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            Order Details
          </Text>
          {order.items.map((item) => (
            <View key={item.id} style={[styles.itemRow, { borderTopColor: colors.border }]}>
              <Text style={[styles.itemName, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
                {item.name}
              </Text>
              <Text style={[styles.itemMeta, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                ×{item.qty} {item.unit}
              </Text>
              <Text style={[styles.itemPrice, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                ₹{item.price * item.qty}
              </Text>
            </View>
          ))}

          <View style={[styles.billRow, { borderTopColor: colors.border }]}>
            <View style={styles.billLine}>
              <Text style={[styles.billLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Subtotal</Text>
              <Text style={[styles.billValue, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>₹{order.subtotal}</Text>
            </View>
            <View style={styles.billLine}>
              <Text style={[styles.billLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>GST (5%)</Text>
              <Text style={[styles.billValue, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>₹{order.gst}</Text>
            </View>
            <View style={styles.billLine}>
              <Text style={[styles.billLabel, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Total</Text>
              <Text style={[styles.billTotal, { color: CUSTOMER_PRIMARY, fontFamily: "Inter_700Bold" }]}>₹{order.total}</Text>
            </View>
          </View>
        </View>

        {/* Delivery info */}
        {order.address && (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
              Delivery Address
            </Text>
            <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
              <Feather name="map-pin" size={16} color={CUSTOMER_PRIMARY} style={{ marginTop: 2 }} />
              <Text style={[styles.addressText, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>
                {order.address}
              </Text>
            </View>
          </View>
        )}

        {/* Payment badge */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.payRow}>
            <View>
              <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                Payment
              </Text>
              <Text style={[styles.payMode, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                {order.paymentMode}
              </Text>
            </View>
            <View
              style={[
                styles.payBadge,
                { backgroundColor: order.paid ? CUSTOMER_PRIMARY + "18" : "#F59E0B18" },
              ]}
            >
              <Feather
                name={order.paid ? "check-circle" : "clock"}
                size={14}
                color={order.paid ? CUSTOMER_PRIMARY : "#F59E0B"}
              />
              <Text
                style={[
                  styles.payBadgeText,
                  {
                    color:      order.paid ? CUSTOMER_PRIMARY : "#F59E0B",
                    fontFamily: "Inter_600SemiBold",
                  },
                ]}
              >
                {order.paid ? "Paid" : "Pay on Delivery"}
              </Text>
            </View>
          </View>
          {order.pointsEarned > 0 && (
            <Text style={[styles.pointsNote, { color: CUSTOMER_AMBER, fontFamily: "Inter_600SemiBold" }]}>
              ⭐ {order.pointsEarned} loyalty points earned on this order
            </Text>
          )}
        </View>

        {/* Actions */}
        <View style={{ flexDirection: "row", gap: 12 }}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: CUSTOMER_PRIMARY + "18", flex: 1 }]}
            onPress={() => Linking.openURL(`tel:${order.shopPhone}`)}
            activeOpacity={0.8}
          >
            <Feather name="phone" size={18} color={CUSTOMER_PRIMARY} />
            <Text style={[styles.actionBtnText, { color: CUSTOMER_PRIMARY, fontFamily: "Inter_700Bold" }]}>
              Call Shop
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: "#3B82F618", flex: 1 }]}
            onPress={() => Alert.alert("Message Shop", "Feature coming soon!")}
            activeOpacity={0.8}
          >
            <Feather name="message-circle" size={18} color="#3B82F6" />
            <Text style={[styles.actionBtnText, { color: "#3B82F6", fontFamily: "Inter_700Bold" }]}>
              Message Shop
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:        { flex: 1 },
  header:      { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingBottom: 18 },
  headerTitle: { color: "#fff", fontSize: 18 },
  headerSub:   { color: "rgba(255,255,255,0.8)", fontSize: 12 },
  pulseDot:    { width: 10, height: 10, borderRadius: 5, backgroundColor: "#fff" },
  backBtn:     { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  backBtnText: { color: "#fff", fontSize: 14 },
  card:        { borderRadius: 16, borderWidth: 1, padding: 16, gap: 12 },
  cardTitle:   { fontSize: 15, marginBottom: 4 },
  stepRow:     { flexDirection: "row", gap: 14 },
  stepLeft:    { alignItems: "center", width: 32 },
  stepCircle:  { width: 32, height: 32, borderRadius: 16, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  stepLine:    { width: 2, flex: 1, marginTop: 4 },
  stepContent: { flex: 1, gap: 3, paddingTop: 4 },
  stepLabel:   { fontSize: 14 },
  stepTime:    { fontSize: 12 },
  itemRow:     { flexDirection: "row", alignItems: "center", paddingTop: 10, borderTopWidth: 1, gap: 4 },
  itemName:    { flex: 1, fontSize: 13 },
  itemMeta:    { fontSize: 12 },
  itemPrice:   { fontSize: 13, minWidth: 60, textAlign: "right" },
  billRow:     { gap: 8, paddingTop: 12, borderTopWidth: 1 },
  billLine:    { flexDirection: "row", justifyContent: "space-between" },
  billLabel:   { fontSize: 13 },
  billValue:   { fontSize: 13 },
  billTotal:   { fontSize: 16 },
  addressText: { flex: 1, fontSize: 14, lineHeight: 22 },
  payRow:      { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  payMode:     { fontSize: 13, marginTop: 3 },
  payBadge:    { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  payBadgeText:{ fontSize: 13 },
  pointsNote:  { fontSize: 13 },
  actionBtn:   { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 14 },
  actionBtnText:{ fontSize: 14 },
});
