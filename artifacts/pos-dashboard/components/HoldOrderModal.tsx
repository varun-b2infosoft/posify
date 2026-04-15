import React, { useEffect, useState } from "react";
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
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import type { HeldCartItem } from "@/store/holdOrders";

interface Props {
  visible: boolean;
  items: HeldCartItem[];
  total: number;
  defaultOrderName: string;
  onConfirm: (orderName: string, customerName: string, customerPhone: string) => void;
  onCancel: () => void;
}

export function HoldOrderModal({ visible, items, total, defaultOrderName, onConfirm, onCancel }: Props) {
  const colors  = useColors();
  const insets  = useSafeAreaInsets();
  const botPad  = Platform.OS === "web" ? 24 : insets.bottom + 16;

  const [orderName,     setOrderName]     = useState(defaultOrderName);
  const [customerName,  setCustomerName]  = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  useEffect(() => {
    if (visible) {
      setOrderName(defaultOrderName);
      setCustomerName("");
      setCustomerPhone("");
    }
  }, [visible, defaultOrderName]);

  const itemCount = items.reduce((s, c) => s + (c.weightBased ? 1 : c.qty), 0);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onCancel} activeOpacity={1} />
        <View style={[styles.sheet, { backgroundColor: colors.card, paddingBottom: botPad }]}>
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.iconBox, { backgroundColor: "#F59E0B15" }]}>
              <Feather name="pause-circle" size={22} color="#F59E0B" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                Hold Order
              </Text>
              <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                {itemCount} item{itemCount !== 1 ? "s" : ""} · ₹{total.toLocaleString()}
              </Text>
            </View>
            <TouchableOpacity onPress={onCancel} style={[styles.closeBtn, { backgroundColor: colors.secondary }]}>
              <Feather name="x" size={18} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Order name */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
                ORDER NAME
              </Text>
              <View style={[styles.inputRow, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                <Feather name="tag" size={15} color={colors.mutedForeground} />
                <TextInput
                  style={[styles.input, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}
                  value={orderName}
                  onChangeText={setOrderName}
                  placeholder="e.g. Order-1"
                  placeholderTextColor={colors.mutedForeground}
                  returnKeyType="next"
                />
              </View>
            </View>

            {/* Divider */}
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <Text style={[styles.optionalLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Customer — optional
            </Text>

            {/* Customer name */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
                NAME
              </Text>
              <View style={[styles.inputRow, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                <Feather name="user" size={15} color={colors.mutedForeground} />
                <TextInput
                  style={[styles.input, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
                  value={customerName}
                  onChangeText={setCustomerName}
                  placeholder="Customer name"
                  placeholderTextColor={colors.mutedForeground}
                  returnKeyType="next"
                />
              </View>
            </View>

            {/* Customer phone */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
                PHONE
              </Text>
              <View style={[styles.inputRow, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                <Feather name="phone" size={15} color={colors.mutedForeground} />
                <TextInput
                  style={[styles.input, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
                  value={customerPhone}
                  onChangeText={setCustomerPhone}
                  placeholder="+91 98000 00000"
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType="phone-pad"
                  returnKeyType="done"
                />
              </View>
            </View>

            {/* Info note */}
            <View style={[styles.infoBox, { backgroundColor: "#4F46E510", borderColor: "#4F46E525" }]}>
              <Feather name="info" size={13} color="#4F46E5" />
              <Text style={[styles.infoText, { color: "#4F46E5", fontFamily: "Inter_400Regular" }]}>
                Cart will be cleared so you can start a new sale. Resume anytime from Held Orders.
              </Text>
            </View>
          </ScrollView>

          {/* Action buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.cancelBtn, { borderColor: colors.border }]}
              onPress={onCancel}
            >
              <Text style={[styles.cancelText, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: "#F59E0B" }]}
              onPress={() => onConfirm(orderName, customerName, customerPhone)}
            >
              <Feather name="pause-circle" size={16} color="#fff" />
              <Text style={[styles.saveText, { fontFamily: "Inter_700Bold" }]}>
                Save Hold Order
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "flex-end" },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 18, paddingTop: 10 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#D1D5DB", alignSelf: "center", marginBottom: 14 },

  header: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 18 },
  iconBox: { width: 46, height: 46, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 17 },
  subtitle: { fontSize: 13, marginTop: 1 },
  closeBtn: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },

  fieldGroup: { marginBottom: 12 },
  fieldLabel: { fontSize: 10, letterSpacing: 0.9, marginBottom: 5 },
  inputRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 12,
  },
  input: { flex: 1, fontSize: 15 },

  divider: { height: 1, marginVertical: 14 },
  optionalLabel: { fontSize: 12, marginBottom: 12 },

  infoBox: {
    flexDirection: "row", gap: 8, alignItems: "flex-start",
    borderRadius: 10, borderWidth: 1, padding: 11, marginTop: 6, marginBottom: 18,
  },
  infoText: { flex: 1, fontSize: 12, lineHeight: 17 },

  actions: { flexDirection: "row", gap: 10, marginTop: 8 },
  cancelBtn: {
    flex: 1, borderWidth: 1.5, borderRadius: 13,
    paddingVertical: 13, alignItems: "center",
  },
  cancelText: { fontSize: 15 },
  saveBtn: {
    flex: 2, borderRadius: 13, paddingVertical: 13,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
  },
  saveText: { color: "#fff", fontSize: 15 },
});
