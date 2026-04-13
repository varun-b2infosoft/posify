import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
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
import { useColors } from "@/hooks/useColors";
import { addSupplier, deleteSupplier, getSupplier, updateSupplier } from "@/store/suppliers";

type FormData = {
  name:    string;
  phone:   string;
  email:   string;
  address: string;
  notes:   string;
};

function FormField({
  label, value, onChangeText, placeholder, keyboardType, multiline,
}: {
  label: string; value: string; onChangeText: (v: string) => void;
  placeholder?: string; keyboardType?: "default" | "phone-pad" | "email-address"; multiline?: boolean;
}) {
  const colors = useColors();
  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>{label}</Text>
      <TextInput
        style={[
          styles.fieldInput,
          multiline && { minHeight: 72, textAlignVertical: "top" },
          { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground, fontFamily: "Inter_400Regular" },
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        keyboardType={keyboardType ?? "default"}
        multiline={multiline}
      />
    </View>
  );
}

export default function SupplierEditScreen() {
  const { id }  = useLocalSearchParams<{ id?: string }>();
  const colors  = useColors();
  const insets  = useSafeAreaInsets();
  const topPad  = Platform.OS === "web" ? 67 : insets.top;
  const botPad  = Platform.OS === "web" ? 24 : insets.bottom + 16;
  const isEdit  = Boolean(id);
  const existing = id ? getSupplier(id) : undefined;

  const [form, setForm] = useState<FormData>({
    name:    existing?.name    ?? "",
    phone:   existing?.phone   ?? "",
    email:   existing?.email   ?? "",
    address: existing?.address ?? "",
    notes:   existing?.notes   ?? "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const set = (k: keyof FormData) => (v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const validate = () => {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!form.name.trim()) e.name = "Supplier name is required";
    if (form.phone && !/^\+?[\d\s\-]{7,}$/.test(form.phone)) e.phone = "Enter a valid phone number";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const data = { name: form.name.trim(), phone: form.phone.trim(), email: form.email.trim(), address: form.address.trim(), notes: form.notes.trim() };
    if (isEdit && existing) {
      updateSupplier({ ...existing, ...data });
    } else {
      addSupplier(data);
    }
    router.back();
  };

  const handleDelete = () => {
    Alert.alert("Delete Supplier", `Remove "${existing?.name}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => { deleteSupplier(id!); router.replace("/(tabs)/purchases" as any); } },
    ]);
  };

  const initials = form.name.split(" ").filter(Boolean).map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "?";

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: "#4F46E5" }]}>
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 2 }}>
            <Feather name="arrow-left" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { fontFamily: "Inter_600SemiBold" }]}>
            {isEdit ? "Edit Supplier" : "Add Supplier"}
          </Text>
          <TouchableOpacity onPress={handleSave}>
            <Text style={[styles.saveTop, { fontFamily: "Inter_700Bold" }]}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.content, { paddingBottom: botPad + 90 }]}>
          {/* Avatar preview */}
          <View style={styles.avatarWrap}>
            <View style={[styles.avatar, { backgroundColor: "#4F46E520" }]}>
              <Text style={[styles.avatarText, { color: "#4F46E5", fontFamily: "Inter_700Bold" }]}>{initials}</Text>
            </View>
            <Text style={[styles.avatarHint, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Initials auto-generated from name
            </Text>
          </View>

          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>BASIC INFO</Text>
            <View style={styles.sectionBody}>
              <FormField label="Supplier Name *" value={form.name} onChangeText={set("name")} placeholder="e.g. Metro Wholesale" />
              {errors.name && <Text style={[styles.error, { color: colors.destructive, fontFamily: "Inter_400Regular" }]}>{errors.name}</Text>}
              <FormField label="Phone Number" value={form.phone} onChangeText={set("phone")} placeholder="+91 98765 43210" keyboardType="phone-pad" />
              {errors.phone && <Text style={[styles.error, { color: colors.destructive, fontFamily: "Inter_400Regular" }]}>{errors.phone}</Text>}
              <FormField label="Email" value={form.email} onChangeText={set("email")} placeholder="supplier@example.com" keyboardType="email-address" />
              {errors.email && <Text style={[styles.error, { color: colors.destructive, fontFamily: "Inter_400Regular" }]}>{errors.email}</Text>}
            </View>
          </View>

          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>LOCATION & NOTES</Text>
            <View style={styles.sectionBody}>
              <FormField label="Address" value={form.address} onChangeText={set("address")} placeholder="Street, City, State" multiline />
              <FormField label="Notes" value={form.notes} onChangeText={set("notes")} placeholder="Payment terms, preferences, etc." multiline />
            </View>
          </View>
        </ScrollView>

        <View style={[styles.bottomBar, { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: botPad }]}>
          {isEdit && (
            <TouchableOpacity style={[styles.deleteBtn, { borderColor: colors.destructive }]} onPress={handleDelete}>
              <Feather name="trash-2" size={15} color={colors.destructive} />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={[styles.cancelBtn, { borderColor: colors.border, backgroundColor: colors.secondary }]} onPress={() => router.back()}>
            <Text style={[styles.cancelText, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.saveBtn, { backgroundColor: "#4F46E5", flex: 1 }]} onPress={handleSave}>
            <Feather name="check" size={16} color="#fff" />
            <Text style={[styles.saveBtnText, { fontFamily: "Inter_700Bold" }]}>
              {isEdit ? "Save Changes" : "Add Supplier"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between",
    paddingHorizontal: 16, paddingBottom: 14,
  },
  headerTitle: { flex: 1, color: "#fff", fontSize: 17, textAlign: "center", marginHorizontal: 12 },
  saveTop:     { color: "#fff", fontSize: 15 },

  content: { paddingHorizontal: 14, paddingTop: 16, gap: 14 },

  avatarWrap: { alignItems: "center", gap: 8 },
  avatar:     { width: 70, height: 70, borderRadius: 35, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 24 },
  avatarHint: { fontSize: 12 },

  section: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  sectionTitle: { fontSize: 11, letterSpacing: 0.5, paddingHorizontal: 14, paddingTop: 12, paddingBottom: 4 },
  sectionBody:  { padding: 14, gap: 12 },

  field:       { gap: 5 },
  fieldLabel:  { fontSize: 13 },
  fieldInput: {
    borderRadius: 10, borderWidth: 1,
    paddingHorizontal: 13, paddingVertical: 11, fontSize: 14,
  },
  error: { fontSize: 12, marginTop: -6 },

  bottomBar: {
    flexDirection: "row", gap: 8, padding: 12, paddingTop: 10, borderTopWidth: 1,
  },
  deleteBtn: {
    width: 44, alignItems: "center", justifyContent: "center",
    borderRadius: 10, borderWidth: 1.5,
  },
  cancelBtn: {
    paddingHorizontal: 18, paddingVertical: 13,
    borderRadius: 12, borderWidth: 1,
    alignItems: "center", justifyContent: "center",
  },
  cancelText: { fontSize: 14 },
  saveBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 7, paddingVertical: 13, borderRadius: 12,
  },
  saveBtnText: { color: "#fff", fontSize: 15 },
});
