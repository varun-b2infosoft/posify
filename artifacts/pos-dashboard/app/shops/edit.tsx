import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { addShop, getShop, updateShop } from "@/store/shops";

const SHOP_COLORS = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4", "#EC4899", "#6366F1"];

export default function ShopEditScreen() {
  const { id }    = useLocalSearchParams<{ id?: string }>();
  const existing  = id ? getShop(id) : undefined;
  const colors    = useColors();
  const insets    = useSafeAreaInsets();
  const topPad    = Platform.OS === "web" ? 67 : insets.top;

  const [name,    setName]    = useState(existing?.name    ?? "");
  const [address, setAddress] = useState(existing?.address ?? "");
  const [phone,   setPhone]   = useState(existing?.phone   ?? "");
  const [manager, setManager] = useState(existing?.manager ?? "");
  const [active,  setActive]  = useState(existing?.active  ?? true);
  const [color,   setColor]   = useState(existing?.color   ?? SHOP_COLORS[0]);
  const [errors,  setErrors]  = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim())    e.name    = "Shop name is required";
    if (!address.trim()) e.address = "Address is required";
    if (!phone.trim())   e.phone   = "Contact number is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    if (existing) {
      updateShop({ ...existing, name: name.trim(), address: address.trim(), phone: phone.trim(), manager: manager.trim(), active, color });
    } else {
      addShop({ name: name.trim(), address: address.trim(), phone: phone.trim(), manager: manager.trim(), active, color });
    }
    router.back();
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: color }]}>
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 2 }}>
            <Feather name="arrow-left" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { fontFamily: "Inter_700Bold" }]}>
            {existing ? "Edit Shop" : "Add New Shop"}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {/* Color picker */}
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>SHOP COLOR</Text>
            <View style={styles.colorRow}>
              {SHOP_COLORS.map(c => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setColor(c)}
                  style={[styles.colorDot, { backgroundColor: c }, color === c && styles.colorDotSelected]}
                />
              ))}
            </View>
          </View>

          {/* Fields */}
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {[
              { label: "Shop Name *", value: name, set: setName, key: "name", icon: "shopping-bag", placeholder: "e.g. Main Store" },
              { label: "Address *",   value: address, set: setAddress, key: "address", icon: "map-pin",      placeholder: "Full address" },
              { label: "Contact Number *", value: phone, set: setPhone, key: "phone", icon: "phone", placeholder: "+91 98765 43210", keyboardType: "phone-pad" },
              { label: "Manager Name", value: manager, set: setManager, key: "manager", icon: "user", placeholder: "Optional" },
            ].map((field, idx, arr) => (
              <React.Fragment key={field.key}>
                <View style={styles.fieldWrap}>
                  <Text style={[styles.fieldLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>{field.label}</Text>
                  <View style={[styles.inputRow, { borderColor: errors[field.key] ? colors.destructive : colors.border, backgroundColor: colors.background }]}>
                    <Feather name={field.icon as any} size={15} color={colors.mutedForeground} />
                    <TextInput
                      style={[styles.input, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
                      value={field.value}
                      onChangeText={field.set}
                      placeholder={field.placeholder}
                      placeholderTextColor={colors.mutedForeground}
                      keyboardType={(field as any).keyboardType}
                    />
                  </View>
                  {errors[field.key] && (
                    <Text style={[styles.errorText, { color: colors.destructive, fontFamily: "Inter_400Regular" }]}>{errors[field.key]}</Text>
                  )}
                </View>
                {idx < arr.length - 1 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
              </React.Fragment>
            ))}

            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.switchRow}>
              <Feather name="toggle-right" size={15} color={colors.mutedForeground} />
              <Text style={[styles.switchLabel, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>Shop is Active</Text>
              <Switch
                value={active}
                onValueChange={setActive}
                trackColor={{ false: colors.border, true: "#4F46E5" }}
                thumbColor="#fff"
              />
            </View>
          </View>

          <TouchableOpacity style={[styles.saveBtn, { backgroundColor: color }]} onPress={handleSave}>
            <Feather name="check-circle" size={18} color="#fff" />
            <Text style={[styles.saveBtnText, { fontFamily: "Inter_700Bold" }]}>
              {existing ? "Save Changes" : "Create Shop"}
            </Text>
          </TouchableOpacity>

          {existing && (
            <TouchableOpacity
              style={[styles.cancelBtn, { borderColor: colors.border }]}
              onPress={() => router.back()}
            >
              <Text style={[styles.cancelBtnText, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>Cancel</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between",
    paddingHorizontal: 16, paddingBottom: 12,
  },
  headerTitle: { color: "#fff", fontSize: 18 },
  content: { padding: 14, gap: 12 },
  section: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 12 },
  sectionLabel: { fontSize: 10, letterSpacing: 0.8 },
  colorRow: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  colorDot: { width: 32, height: 32, borderRadius: 16 },
  colorDotSelected: { borderWidth: 3, borderColor: "#fff", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4 },
  fieldWrap: { gap: 6 },
  fieldLabel: { fontSize: 11, letterSpacing: 0.3 },
  inputRow: { flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  input: { flex: 1, fontSize: 14 },
  errorText: { fontSize: 11 },
  divider: { height: 1 },
  switchRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  switchLabel: { flex: 1, fontSize: 14 },
  saveBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 14, paddingVertical: 14 },
  saveBtnText: { color: "#fff", fontSize: 16 },
  cancelBtn: { borderRadius: 12, paddingVertical: 12, alignItems: "center", borderWidth: 1 },
  cancelBtnText: { fontSize: 14 },
});
