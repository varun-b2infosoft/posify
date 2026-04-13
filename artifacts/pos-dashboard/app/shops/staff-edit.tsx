import React, { useState } from "react";
import {
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
import {
  ROLE_COLORS, ROLE_ICONS, PERMISSION_LABELS, ROLES, ROLE_PERMISSIONS,
  StaffRole, Permission,
  addStaff, getShop, getStaffMember, updateStaff,
} from "@/store/shops";

export default function StaffEditScreen() {
  const { shopId, staffId } = useLocalSearchParams<{ shopId: string; staffId?: string }>();
  const existing = staffId ? getStaffMember(staffId) : undefined;
  const shop     = getShop(shopId);
  const colors   = useColors();
  const insets   = useSafeAreaInsets();
  const topPad   = Platform.OS === "web" ? 67 : insets.top;

  const [name,  setName]  = useState(existing?.name  ?? "");
  const [phone, setPhone] = useState(existing?.phone ?? "");
  const [email, setEmail] = useState(existing?.email ?? "");
  const [role,  setRole]  = useState<StaffRole>(existing?.role ?? "Salesman");
  const [perms, setPerms] = useState<Permission>(existing?.permissions ?? { ...ROLE_PERMISSIONS["Salesman"] });
  const [active, setActive] = useState(existing?.active ?? true);
  const [customPerms, setCustomPerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleRoleSelect = (r: StaffRole) => {
    setRole(r);
    if (!customPerms) setPerms({ ...ROLE_PERMISSIONS[r] });
  };

  const togglePerm = (key: keyof Permission) => {
    setCustomPerms(true);
    setPerms(p => ({ ...p, [key]: !p[key] }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim())  e.name  = "Name is required";
    if (!phone.trim()) e.phone = "Phone is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    if (existing) {
      updateStaff({ ...existing, name: name.trim(), phone: phone.trim(), email: email.trim(), role, permissions: perms, active });
    } else {
      addStaff({ shopId, name: name.trim(), phone: phone.trim(), email: email.trim(), role, permissions: perms, active, joinedDate: "Today" });
    }
    router.back();
  };

  const headerColor = ROLE_COLORS[role];

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: headerColor }]}>
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 2 }}>
            <Feather name="arrow-left" size={20} color="#fff" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, { fontFamily: "Inter_700Bold" }]}>
              {existing ? "Edit Staff" : "Add Staff Member"}
            </Text>
            {shop && (
              <Text style={[styles.headerSub, { fontFamily: "Inter_400Regular" }]}>{shop.name}</Text>
            )}
          </View>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {/* Personal info */}
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>STAFF INFO</Text>
            {[
              { label: "Full Name *",   value: name,  set: setName,  key: "name",  icon: "user",  placeholder: "e.g. Rahul Sharma" },
              { label: "Phone *",       value: phone, set: setPhone, key: "phone", icon: "phone", placeholder: "+91 98765 43210", keyboardType: "phone-pad" },
              { label: "Email",         value: email, set: setEmail, key: "email", icon: "mail",  placeholder: "Optional", keyboardType: "email-address" },
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
                      autoCapitalize={field.key === "email" ? "none" : "words"}
                    />
                  </View>
                  {errors[field.key] && <Text style={[styles.errorText, { color: colors.destructive }]}>{errors[field.key]}</Text>}
                </View>
                {idx < arr.length - 1 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
              </React.Fragment>
            ))}
          </View>

          {/* Role picker */}
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>ROLE</Text>
            <View style={styles.rolesRow}>
              {ROLES.map(r => {
                const rc    = ROLE_COLORS[r];
                const ri    = ROLE_ICONS[r];
                const isAct = r === role;
                return (
                  <TouchableOpacity
                    key={r}
                    style={[styles.roleBtn, { borderColor: isAct ? rc : colors.border, backgroundColor: isAct ? rc + "18" : colors.background }]}
                    onPress={() => handleRoleSelect(r)}
                  >
                    <View style={[styles.roleIconWrap, { backgroundColor: isAct ? rc + "30" : colors.secondary }]}>
                      <Feather name={ri as any} size={16} color={isAct ? rc : colors.mutedForeground} />
                    </View>
                    <Text style={[styles.roleName, { color: isAct ? rc : colors.foreground, fontFamily: isAct ? "Inter_700Bold" : "Inter_400Regular" }]}>{r}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Permissions */}
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={[styles.sectionLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>PERMISSIONS</Text>
              <Text style={[{ fontSize: 11, color: customPerms ? headerColor : colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                {customPerms ? "Custom" : `Default (${role})`}
              </Text>
            </View>
            <View style={styles.permsGrid}>
              {(Object.keys(PERMISSION_LABELS) as Array<keyof Permission>).map(key => {
                const granted = perms[key];
                return (
                  <TouchableOpacity
                    key={key}
                    style={[styles.permItem, { borderColor: granted ? headerColor + "50" : colors.border, backgroundColor: granted ? headerColor + "12" : colors.background }]}
                    onPress={() => togglePerm(key)}
                  >
                    <Feather name={granted ? "check-square" : "square"} size={14} color={granted ? headerColor : colors.mutedForeground} />
                    <Text style={[styles.permLabel, { color: granted ? headerColor : colors.mutedForeground, fontFamily: granted ? "Inter_500Medium" : "Inter_400Regular" }]}>
                      {PERMISSION_LABELS[key]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <TouchableOpacity onPress={() => { setCustomPerms(false); setPerms({ ...ROLE_PERMISSIONS[role] }); }}>
              <Text style={[{ color: colors.primary, fontSize: 12, fontFamily: "Inter_500Medium" }]}>Reset to role defaults</Text>
            </TouchableOpacity>
          </View>

          {/* Active toggle */}
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.switchRow}>
              <Feather name="toggle-right" size={15} color={colors.mutedForeground} />
              <Text style={[styles.switchLabel, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>Staff member is Active</Text>
              <Switch
                value={active}
                onValueChange={setActive}
                trackColor={{ false: colors.border, true: headerColor }}
                thumbColor="#fff"
              />
            </View>
          </View>

          <TouchableOpacity style={[styles.saveBtn, { backgroundColor: headerColor }]} onPress={handleSave}>
            <Feather name="check-circle" size={18} color="#fff" />
            <Text style={[styles.saveBtnText, { fontFamily: "Inter_700Bold" }]}>
              {existing ? "Save Changes" : "Add Staff Member"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "flex-end", gap: 12,
    paddingHorizontal: 16, paddingBottom: 12,
  },
  headerTitle: { color: "#fff", fontSize: 18 },
  headerSub:   { color: "rgba(255,255,255,0.75)", fontSize: 12, marginTop: 1 },
  content:    { padding: 14, gap: 12 },
  section:    { borderRadius: 14, borderWidth: 1, padding: 14, gap: 12 },
  sectionLabel: { fontSize: 10, letterSpacing: 0.8 },
  fieldWrap:  { gap: 6 },
  fieldLabel: { fontSize: 11 },
  inputRow:   { flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  input:      { flex: 1, fontSize: 14 },
  errorText:  { fontSize: 11 },
  divider:    { height: 1 },
  rolesRow:   { flexDirection: "row", gap: 8 },
  roleBtn: { flex: 1, alignItems: "center", gap: 8, padding: 12, borderRadius: 12, borderWidth: 1.5 },
  roleIconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  roleName: { fontSize: 12, textAlign: "center" },
  permsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  permItem:  { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 8, borderWidth: 1 },
  permLabel: { fontSize: 12 },
  switchRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  switchLabel: { flex: 1, fontSize: 14 },
  saveBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 14, paddingVertical: 14 },
  saveBtnText: { color: "#fff", fontSize: 16 },
});
