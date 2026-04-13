import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useTheme } from "@/hooks/useTheme";
import { ThemeMode } from "@/store/theme";

type SyncStatus = "synced" | "pending" | "syncing" | "error";
const STATUS_COLORS: Record<SyncStatus, string> = {
  synced:  "#10B981",
  pending: "#F59E0B",
  syncing: "#4F46E5",
  error:   "#EF4444",
};
const STATUS_ICONS: Record<SyncStatus, string> = {
  synced:  "check-circle",
  pending: "clock",
  syncing: "refresh-cw",
  error:   "alert-circle",
};
const STATUS_LABELS: Record<SyncStatus, string> = {
  synced:  "Synced ✓",
  pending: "Pending ⚠",
  syncing: "Syncing...",
  error:   "Sync Failed",
};

const THEME_OPTIONS: { value: ThemeMode; label: string; icon: string }[] = [
  { value: "light",  label: "Light",  icon: "sun"     },
  { value: "dark",   label: "Dark",   icon: "moon"    },
  { value: "system", label: "System", icon: "monitor" },
];

export default function SettingsScreen() {
  const colors  = useColors();
  const { mode, setMode } = useTheme();
  const insets  = useSafeAreaInsets();
  const topPad  = Platform.OS === "web" ? 67 : insets.top;
  const botPad  = Platform.OS === "web" ? 24 : insets.bottom + 16;

  const [autoBackup, setAutoBackup] = useState(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("synced");
  const [lastBackup] = useState("Today, 2:00 AM");

  const handleManualBackup = () => {
    Alert.alert("Manual Backup", "Backup started. This may take a few seconds.", [{ text: "OK" }]);
  };

  const handleRetrySync = () => {
    setSyncStatus("syncing");
    setTimeout(() => setSyncStatus("synced"), 2000);
  };

  const ACCOUNT_ITEMS = [
    { icon: "user",     label: "Profile",       sub: "Arjun Kumar · arjun@posify.in" },
    { icon: "shield",   label: "Security",       sub: "PIN lock, biometrics", onPress: () => router.push("/security" as any) },
    { icon: "bell",     label: "Notifications",  sub: "Alerts & reminders", onPress: () => router.push("/notifications" as any) },
    { icon: "help-circle", label: "Help & Support", sub: "FAQs & contact us", onPress: () => router.push("/help" as any) },
    { icon: "log-out",  label: "Logout",         sub: "Sign out of this device", destructive: true },
  ];
  const APP_ITEMS = [
    { icon: "home",        label: "Store Settings",    sub: "Name, address, currency", onPress: () => router.push("/store-settings" as any) },
    { icon: "credit-card", label: "Payment Methods",   sub: "Cash, UPI, Card, Credit" },
    { icon: "printer",     label: "Receipt Settings",  sub: "Configure print layout", onPress: () => router.push("/receipt-settings" as any) },
    { icon: "tag",         label: "Tax & GST",         sub: "Set tax rates per category" },
    { icon: "globe",       label: "Language",          sub: "English (India)" },
  ];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.headerBg, paddingTop: topPad }]}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
          <Feather name="arrow-left" size={20} color={colors.headerFg} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.headerFg, fontFamily: "Inter_700Bold" }]}>Settings & Backup</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: botPad + 24 }}>

        {/* ── Appearance ── */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIcon, { backgroundColor: colors.primary + "18" }]}>
              <Feather name="eye" size={16} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Appearance</Text>
              <Text style={[styles.cardSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Choose your preferred color scheme</Text>
            </View>
          </View>

          <View style={[styles.segmentContainer, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            {THEME_OPTIONS.map(({ value, label, icon }) => {
              const active = mode === value;
              return (
                <TouchableOpacity
                  key={value}
                  style={[
                    styles.segmentBtn,
                    active && { backgroundColor: colors.card, shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
                  ]}
                  onPress={() => setMode(value)}
                  activeOpacity={0.7}
                >
                  <Feather
                    name={icon as any}
                    size={14}
                    color={active ? colors.primary : colors.mutedForeground}
                  />
                  <Text style={[
                    styles.segmentLabel,
                    { fontFamily: active ? "Inter_700Bold" : "Inter_400Regular" },
                    { color: active ? colors.primary : colors.mutedForeground },
                  ]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={[styles.appearanceHint, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            {mode === "system"
              ? "Follows your device's system appearance"
              : mode === "dark"
              ? "Dark mode is on — easier on the eyes at night"
              : "Light mode is on — bright and clear"}
          </Text>
        </View>

        {/* ── Backup ── */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIcon, { backgroundColor: colors.primary + "18" }]}>
              <Feather name="cloud" size={16} color={colors.primary} />
            </View>
            <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Backup</Text>
          </View>
          <View style={[styles.statusRow, { backgroundColor: "#10B98110", borderRadius: 10 }]}>
            <Feather name="check-circle" size={16} color="#10B981" />
            <View style={{ flex: 1 }}>
              <Text style={[styles.statusLabel, { color: "#065F46", fontFamily: "Inter_600SemiBold" }]}>Last backup: {lastBackup}</Text>
              <Text style={[styles.statusSub, { color: "#047857", fontFamily: "Inter_400Regular" }]}>All data is safely stored in cloud</Text>
            </View>
          </View>
          <View style={styles.toggleRow}>
            <View>
              <Text style={[styles.toggleLabel, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>Auto Backup</Text>
              <Text style={[styles.toggleSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Backup automatically every night at 2 AM</Text>
            </View>
            <Switch
              value={autoBackup}
              onValueChange={setAutoBackup}
              trackColor={{ true: colors.primary, false: colors.border }}
              thumbColor="#fff"
            />
          </View>
          <TouchableOpacity style={[styles.outlineBtn, { borderColor: colors.primary }]} onPress={handleManualBackup}>
            <Feather name="upload-cloud" size={15} color={colors.primary} />
            <Text style={[styles.outlineBtnText, { color: colors.primary, fontFamily: "Inter_600SemiBold" }]}>Backup Now</Text>
          </TouchableOpacity>
        </View>

        {/* ── Sync ── */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIcon, { backgroundColor: "#10B98118" }]}>
              <Feather name="refresh-cw" size={16} color="#10B981" />
            </View>
            <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Sync</Text>
          </View>
          <View style={[styles.statusRow, { backgroundColor: STATUS_COLORS[syncStatus] + "12", borderRadius: 10 }]}>
            <Feather name={STATUS_ICONS[syncStatus] as any} size={16} color={STATUS_COLORS[syncStatus]} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.statusLabel, { color: STATUS_COLORS[syncStatus], fontFamily: "Inter_600SemiBold" }]}>{STATUS_LABELS[syncStatus]}</Text>
              <Text style={[styles.statusSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Last synced: Today, 8:15 AM</Text>
            </View>
            <TouchableOpacity onPress={handleRetrySync}>
              <Text style={{ color: colors.primary, fontFamily: "Inter_600SemiBold", fontSize: 12 }}>Retry</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.syncStats}>
            {[
              { label: "Invoices",  val: "248", color: colors.primary },
              { label: "Products",  val: "42",  color: colors.success },
              { label: "Customers", val: "8",   color: colors.warning },
            ].map((s, i, arr) => (
              <React.Fragment key={s.label}>
                <View style={{ flex: 1, alignItems: "center" }}>
                  <Text style={[styles.syncVal, { color: s.color, fontFamily: "Inter_700Bold" }]}>{s.val}</Text>
                  <Text style={[styles.syncLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{s.label}</Text>
                </View>
                {i < arr.length - 1 && <View style={[styles.syncDiv, { backgroundColor: colors.border }]} />}
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* ── Account ── */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>ACCOUNT</Text>
        <View style={[styles.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {ACCOUNT_ITEMS.map((item, i) => (
            <TouchableOpacity
              key={item.label}
              style={[styles.listRow, { borderTopColor: colors.border, borderTopWidth: i === 0 ? 0 : 1 }]}
              onPress={(item as any).onPress ?? (() => Alert.alert(item.label, "Coming soon"))}
            >
              <View style={[styles.listIcon, { backgroundColor: ((item as any).destructive ? colors.destructive : colors.primary) + "12" }]}>
                <Feather name={item.icon as any} size={15} color={(item as any).destructive ? colors.destructive : colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.listLabel, { color: (item as any).destructive ? colors.destructive : colors.foreground, fontFamily: "Inter_600SemiBold" }]}>{item.label}</Text>
                <Text style={[styles.listSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{item.sub}</Text>
              </View>
              <Feather name="chevron-right" size={15} color={colors.mutedForeground} />
            </TouchableOpacity>
          ))}
        </View>

        {/* ── App Settings ── */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>APP SETTINGS</Text>
        <View style={[styles.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {APP_ITEMS.map((item, i) => (
            <TouchableOpacity
              key={item.label}
              style={[styles.listRow, { borderTopColor: colors.border, borderTopWidth: i === 0 ? 0 : 1 }]}
              onPress={() => Alert.alert(item.label, "Coming soon")}
            >
              <View style={[styles.listIcon, { backgroundColor: colors.primary + "12" }]}>
                <Feather name={item.icon as any} size={15} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.listLabel, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>{item.label}</Text>
                <Text style={[styles.listSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{item.sub}</Text>
              </View>
              <Feather name="chevron-right" size={15} color={colors.mutedForeground} />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[{ color: colors.mutedForeground, fontSize: 11, textAlign: "center", fontFamily: "Inter_400Regular" }]}>
          POSify v2.0.0 · Data stored securely
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:            { flex: 1 },
  header:          { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingBottom: 16 },
  headerTitle:     { fontSize: 20 },
  card:            { borderRadius: 14, borderWidth: 1, padding: 14, gap: 12 },
  cardHeader:      { flexDirection: "row", alignItems: "center", gap: 10 },
  cardIcon:        { width: 32, height: 32, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  cardTitle:       { fontSize: 15 },
  cardSub:         { fontSize: 12, marginTop: 1 },

  segmentContainer: {
    flexDirection: "row",
    borderRadius: 12,
    borderWidth: 1,
    padding: 4,
    gap: 4,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 9,
  },
  segmentLabel:    { fontSize: 13 },
  appearanceHint:  { fontSize: 12, textAlign: "center" },

  statusRow:       { flexDirection: "row", alignItems: "center", gap: 10, padding: 12 },
  statusLabel:     { fontSize: 13 },
  statusSub:       { fontSize: 11 },
  toggleRow:       { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  toggleLabel:     { fontSize: 14 },
  toggleSub:       { fontSize: 11, marginTop: 1 },
  outlineBtn:      { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 11, borderRadius: 10, borderWidth: 1.5 },
  outlineBtnText:  { fontSize: 14 },
  syncStats:       { flexDirection: "row" },
  syncVal:         { fontSize: 18 },
  syncLabel:       { fontSize: 11 },
  syncDiv:         { width: 1, marginVertical: 4 },
  sectionLabel:    { fontSize: 11, letterSpacing: 1, marginBottom: -8 },
  listCard:        { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  listRow:         { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  listIcon:        { width: 34, height: 34, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  listLabel:       { fontSize: 14 },
  listSub:         { fontSize: 11, marginTop: 1 },
});
