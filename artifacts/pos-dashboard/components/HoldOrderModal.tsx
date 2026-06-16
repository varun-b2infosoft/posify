import React, { useEffect, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
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
import { useLayout } from "@/hooks/useLayout";
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
  const layout  = useLayout();
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

  const handleSave = () => onConfirm(orderName, customerName, customerPhone);

  if (layout.isWide) {
    return (
      <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
        <View style={d.overlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} />

          <View style={[d.dialog, { backgroundColor: colors.card }]}>
            {/* Header */}
            <View style={d.header}>
              <View style={[d.iconBox, { backgroundColor: "#F59E0B12" }]}>
                <Feather name="pause-circle" size={24} color="#F59E0B" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[d.title, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                  Hold Order
                </Text>
                <Text style={[d.sub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  {itemCount} item{itemCount !== 1 ? "s" : ""} · ₹{total.toLocaleString()} — cart will be cleared
                </Text>
              </View>
              <TouchableOpacity onPress={onCancel} style={[d.closeBtn, { backgroundColor: colors.secondary }]}>
                <Feather name="x" size={18} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>

            <View style={[d.sep, { backgroundColor: colors.border }]} />

            {/* Order name */}
            <View style={d.body}>
              <View style={d.fieldFull}>
                <Text style={[d.label, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
                  ORDER NAME
                </Text>
                <View style={[d.inputRow, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <Feather name="tag" size={15} color={colors.mutedForeground} />
                  <TextInput
                    style={[d.input, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}
                    value={orderName}
                    onChangeText={setOrderName}
                    placeholder="e.g. Order-1"
                    placeholderTextColor={colors.mutedForeground}
                  />
                </View>
              </View>

              <View style={[d.sep2, { backgroundColor: colors.border }]} />
              <Text style={[d.optLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                Customer — optional
              </Text>

              {/* Name + Phone side by side */}
              <View style={d.row2}>
                <View style={[d.field, { flex: 1 }]}>
                  <Text style={[d.label, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
                    NAME
                  </Text>
                  <View style={[d.inputRow, { backgroundColor: colors.background, borderColor: colors.border }]}>
                    <Feather name="user" size={15} color={colors.mutedForeground} />
                    <TextInput
                      style={[d.input, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
                      value={customerName}
                      onChangeText={setCustomerName}
                      placeholder="Customer name"
                      placeholderTextColor={colors.mutedForeground}
                    />
                  </View>
                </View>
                <View style={[d.field, { flex: 1 }]}>
                  <Text style={[d.label, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
                    PHONE
                  </Text>
                  <View style={[d.inputRow, { backgroundColor: colors.background, borderColor: colors.border }]}>
                    <Feather name="phone" size={15} color={colors.mutedForeground} />
                    <TextInput
                      style={[d.input, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
                      value={customerPhone}
                      onChangeText={setCustomerPhone}
                      placeholder="+91 98000 00000"
                      placeholderTextColor={colors.mutedForeground}
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>
              </View>

              <View style={[d.infoBox, { backgroundColor: "#4F46E50C", borderColor: "#4F46E525" }]}>
                <Feather name="info" size={13} color="#4F46E5" />
                <Text style={[d.infoText, { color: "#4F46E5", fontFamily: "Inter_400Regular" }]}>
                  Cart will be cleared so you can start a new sale. Resume anytime from Held Orders.
                </Text>
              </View>
            </View>

            <View style={[d.sep, { backgroundColor: colors.border }]} />

            {/* Actions */}
            <View style={d.actions}>
              <TouchableOpacity style={[d.cancelBtn, { borderColor: colors.border }]} onPress={onCancel}>
                <Text style={[d.cancelText, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={[d.saveBtn, { backgroundColor: "#F59E0B" }]} onPress={handleSave}>
                <Feather name="pause-circle" size={17} color="#fff" />
                <Text style={[d.saveText, { fontFamily: "Inter_700Bold" }]}>Save Hold Order</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <View style={m.overlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onCancel} activeOpacity={1} />
        <View style={[m.sheet, { backgroundColor: colors.card, paddingBottom: botPad }]}>
          <View style={m.handle} />

          <View style={m.header}>
            <View style={[m.iconBox, { backgroundColor: "#F59E0B15" }]}>
              <Feather name="pause-circle" size={22} color="#F59E0B" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[m.title, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                Hold Order
              </Text>
              <Text style={[m.subtitle, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                {itemCount} item{itemCount !== 1 ? "s" : ""} · ₹{total.toLocaleString()}
              </Text>
            </View>
            <TouchableOpacity onPress={onCancel} style={[m.closeBtn, { backgroundColor: colors.secondary }]}>
              <Feather name="x" size={18} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={m.fieldGroup}>
              <Text style={[m.fieldLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>ORDER NAME</Text>
              <View style={[m.inputRow, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                <Feather name="tag" size={15} color={colors.mutedForeground} />
                <TextInput
                  style={[m.input, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}
                  value={orderName}
                  onChangeText={setOrderName}
                  placeholder="e.g. Order-1"
                  placeholderTextColor={colors.mutedForeground}
                />
              </View>
            </View>

            <View style={[m.divider, { backgroundColor: colors.border }]} />
            <Text style={[m.optionalLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Customer — optional
            </Text>

            <View style={m.fieldGroup}>
              <Text style={[m.fieldLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>NAME</Text>
              <View style={[m.inputRow, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                <Feather name="user" size={15} color={colors.mutedForeground} />
                <TextInput
                  style={[m.input, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
                  value={customerName}
                  onChangeText={setCustomerName}
                  placeholder="Customer name"
                  placeholderTextColor={colors.mutedForeground}
                />
              </View>
            </View>

            <View style={m.fieldGroup}>
              <Text style={[m.fieldLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>PHONE</Text>
              <View style={[m.inputRow, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                <Feather name="phone" size={15} color={colors.mutedForeground} />
                <TextInput
                  style={[m.input, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
                  value={customerPhone}
                  onChangeText={setCustomerPhone}
                  placeholder="+91 98000 00000"
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <View style={[m.infoBox, { backgroundColor: "#4F46E510", borderColor: "#4F46E525" }]}>
              <Feather name="info" size={13} color="#4F46E5" />
              <Text style={[m.infoText, { color: "#4F46E5", fontFamily: "Inter_400Regular" }]}>
                Cart will be cleared so you can start a new sale. Resume anytime from Held Orders.
              </Text>
            </View>
          </ScrollView>

          <View style={m.actions}>
            <TouchableOpacity style={[m.cancelBtn, { borderColor: colors.border }]} onPress={onCancel}>
              <Text style={[m.cancelText, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[m.saveBtn, { backgroundColor: "#F59E0B" }]} onPress={handleSave}>
              <Feather name="pause-circle" size={16} color="#fff" />
              <Text style={[m.saveText, { fontFamily: "Inter_700Bold" }]}>Save Hold Order</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const d = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  dialog: {
    width: "100%",
    maxWidth: 520,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 20,
    paddingBottom: 18,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  title:  { fontSize: 18 },
  sub:    { fontSize: 13, marginTop: 2 },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  sep:    { height: 1 },
  sep2:   { height: 1, marginVertical: 14 },
  body:   { padding: 20, gap: 12 },
  fieldFull: { gap: 6 },
  row2:   { flexDirection: "row", gap: 12 },
  field:  { gap: 6 },
  label:  { fontSize: 10, letterSpacing: 0.9 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  input:  { flex: 1, fontSize: 14 },
  optLabel: { fontSize: 12 },
  infoBox: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
    borderRadius: 10,
    borderWidth: 1,
    padding: 11,
    marginTop: 4,
  },
  infoText: { flex: 1, fontSize: 12, lineHeight: 17 },
  actions: {
    flexDirection: "row",
    gap: 10,
    padding: 20,
    paddingTop: 16,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  cancelText: { fontSize: 14 },
  saveBtn: {
    flex: 2,
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  saveText: { color: "#fff", fontSize: 15 },
});

const m = StyleSheet.create({
  overlay:  { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "flex-end" },
  sheet:    { borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 18, paddingTop: 10 },
  handle:   { width: 40, height: 4, borderRadius: 2, backgroundColor: "#D1D5DB", alignSelf: "center", marginBottom: 14 },
  header:   { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 18 },
  iconBox:  { width: 46, height: 46, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  title:    { fontSize: 17 },
  subtitle: { fontSize: 13, marginTop: 1 },
  closeBtn: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  fieldGroup:   { marginBottom: 12 },
  fieldLabel:   { fontSize: 10, letterSpacing: 0.9, marginBottom: 5 },
  inputRow:     { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 12 },
  input:        { flex: 1, fontSize: 15 },
  divider:      { height: 1, marginVertical: 14 },
  optionalLabel:{ fontSize: 12, marginBottom: 12 },
  infoBox:      { flexDirection: "row", gap: 8, alignItems: "flex-start", borderRadius: 10, borderWidth: 1, padding: 11, marginTop: 6, marginBottom: 18 },
  infoText:     { flex: 1, fontSize: 12, lineHeight: 17 },
  actions:      { flexDirection: "row", gap: 10, marginTop: 8 },
  cancelBtn:    { flex: 1, borderWidth: 1.5, borderRadius: 13, paddingVertical: 13, alignItems: "center" },
  cancelText:   { fontSize: 15 },
  saveBtn:      { flex: 2, borderRadius: 13, paddingVertical: 13, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  saveText:     { color: "#fff", fontSize: 15 },
});
