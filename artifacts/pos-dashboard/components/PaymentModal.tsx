import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";

type PaymentMethod = "cash" | "upi" | "card";

interface PaymentModalProps {
  visible: boolean;
  total: number;
  onClose: () => void;
  onSuccess: (method: PaymentMethod) => void;
}

export function PaymentModal({ visible, total, onClose, onSuccess }: PaymentModalProps) {
  const colors = useColors();
  const slideAnim = useRef(new Animated.Value(400)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [cashInput, setCashInput] = useState("");

  const cashReceived = parseInt(cashInput || "0", 10);
  const change = cashReceived - total;

  useEffect(() => {
    if (visible) {
      setCashInput("");
      setMethod("cash");
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 400,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handlePay = () => {
    if (method === "cash" && cashReceived < total) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onSuccess(method);
  };

  const canPay = method !== "cash" || cashReceived >= total;

  const QUICK_AMOUNTS = [total, total + 50, total + 100, Math.ceil(total / 100) * 100].filter(
    (v, i, a) => a.indexOf(v) === i
  );

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Animated.View style={[styles.overlay, { opacity: overlayAnim }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        <Animated.View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.card,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.handle} />

          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
              Payment
            </Text>
            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: colors.muted }]}>
              <Feather name="x" size={18} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          <View style={[styles.totalCard, { backgroundColor: colors.primary }]}>
            <Text style={[styles.totalLabel, { fontFamily: "Inter_400Regular" }]}>Amount Due</Text>
            <Text style={[styles.totalAmt, { fontFamily: "Inter_700Bold" }]}>
              ₹{total.toLocaleString()}
            </Text>
          </View>

          <Text style={[styles.sectionLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
            Payment Method
          </Text>
          <View style={styles.methodRow}>
            {([
              { key: "cash", icon: "dollar-sign", label: "Cash" },
              { key: "upi", icon: "smartphone", label: "UPI" },
              { key: "card", icon: "credit-card", label: "Card" },
            ] as { key: PaymentMethod; icon: string; label: string }[]).map((m) => (
              <TouchableOpacity
                key={m.key}
                style={[
                  styles.methodBtn,
                  {
                    backgroundColor: method === m.key ? colors.primary : colors.background,
                    borderColor: method === m.key ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setMethod(m.key)}
                activeOpacity={0.8}
              >
                <Feather name={m.icon as any} size={20} color={method === m.key ? "#fff" : colors.mutedForeground} />
                <Text
                  style={[
                    styles.methodLabel,
                    {
                      color: method === m.key ? "#fff" : colors.foreground,
                      fontFamily: method === m.key ? "Inter_600SemiBold" : "Inter_400Regular",
                    },
                  ]}
                >
                  {m.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {method === "cash" && (
            <View style={styles.cashSection}>
              <Text style={[styles.sectionLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
                Cash Received
              </Text>
              <View style={[styles.cashInputWrap, { borderColor: cashReceived >= total && cashReceived > 0 ? colors.success : colors.border, backgroundColor: colors.background }]}>
                <Text style={[styles.rupee, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>₹</Text>
                <TextInput
                  style={[styles.cashInput, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}
                  keyboardType="numeric"
                  value={cashInput}
                  onChangeText={setCashInput}
                  placeholder={total.toString()}
                  placeholderTextColor={colors.mutedForeground}
                  autoFocus
                />
              </View>

              <View style={styles.quickAmts}>
                {QUICK_AMOUNTS.map((amt) => (
                  <TouchableOpacity
                    key={amt}
                    style={[styles.quickAmt, { backgroundColor: colors.secondary, borderColor: colors.border }]}
                    onPress={() => setCashInput(amt.toString())}
                  >
                    <Text style={[styles.quickAmtText, { color: colors.primary, fontFamily: "Inter_600SemiBold" }]}>
                      ₹{amt.toLocaleString()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {cashReceived > 0 && (
                <View style={[
                  styles.changeRow,
                  { backgroundColor: change >= 0 ? colors.success + "18" : colors.destructive + "18" },
                ]}>
                  <Text style={[styles.changeLabel, { color: change >= 0 ? colors.success : colors.destructive, fontFamily: "Inter_500Medium" }]}>
                    {change >= 0 ? "Return Change" : "Amount Short"}
                  </Text>
                  <Text style={[styles.changeAmt, { color: change >= 0 ? colors.success : colors.destructive, fontFamily: "Inter_700Bold" }]}>
                    ₹{Math.abs(change).toLocaleString()}
                  </Text>
                </View>
              )}
            </View>
          )}

          {method === "upi" && (
            <View style={[styles.upiSection, { backgroundColor: colors.secondary }]}>
              <Feather name="smartphone" size={36} color={colors.primary} />
              <Text style={[styles.upiText, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                Show UPI QR code to customer
              </Text>
              <Text style={[styles.upiSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                Tap Collect once payment is received
              </Text>
            </View>
          )}

          {method === "card" && (
            <View style={[styles.upiSection, { backgroundColor: colors.secondary }]}>
              <Feather name="credit-card" size={36} color={colors.primary} />
              <Text style={[styles.upiText, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                Swipe or tap card on terminal
              </Text>
              <Text style={[styles.upiSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                Tap Collect once approved
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.payBtn,
              { backgroundColor: canPay ? colors.success : colors.muted },
            ]}
            onPress={handlePay}
            disabled={!canPay}
            activeOpacity={0.85}
          >
            <Feather name="check-circle" size={20} color={canPay ? "#fff" : colors.mutedForeground} />
            <Text style={[
              styles.payBtnText,
              {
                color: canPay ? "#fff" : colors.mutedForeground,
                fontFamily: "Inter_700Bold",
              },
            ]}>
              {method === "cash" ? "Collect Cash" : method === "upi" ? "Collect UPI" : "Collect Payment"}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: Platform.OS === "web" ? 40 : 34,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 24,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D1D5DB",
    alignSelf: "center",
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  totalCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    alignItems: "center",
  },
  totalLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    marginBottom: 4,
  },
  totalAmt: {
    color: "#fff",
    fontSize: 36,
  },
  sectionLabel: {
    fontSize: 12,
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  methodRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  methodBtn: {
    flex: 1,
    alignItems: "center",
    gap: 6,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  methodLabel: {
    fontSize: 13,
  },
  cashSection: {
    marginBottom: 16,
  },
  cashInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 10,
  },
  rupee: {
    fontSize: 22,
    marginRight: 4,
  },
  cashInput: {
    flex: 1,
    fontSize: 28,
  },
  quickAmts: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  quickAmt: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  quickAmtText: {
    fontSize: 13,
  },
  changeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  changeLabel: {
    fontSize: 14,
  },
  changeAmt: {
    fontSize: 18,
  },
  upiSection: {
    borderRadius: 14,
    padding: 24,
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  upiText: {
    fontSize: 15,
    textAlign: "center",
  },
  upiSub: {
    fontSize: 13,
    textAlign: "center",
  },
  payBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 14,
    paddingVertical: 17,
  },
  payBtnText: {
    fontSize: 18,
  },
});
