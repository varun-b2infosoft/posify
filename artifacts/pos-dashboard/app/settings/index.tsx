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

export default function SettingsScreen() {
  const colors  = useColors();
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
    { icon: "shield",   label: "Security",       sub: "PIN lock, biometrics" },
    { icon: "bell",     label: "Notifications",  sub: "Alerts & reminders", onPress: () => router.push("/notifications" as any) },
    { icon: "log-out",  label: "Logout",         sub: "Sign out of this device", destructive: true },
  ];
  const APP_ITEMS = [
    { icon: "home",        label: "Store Settings",    sub: "Name, address, currency" },
    { icon: "credit-card", label: "Payment Methods",   sub: "Cash, UPI, Card, Credit" },
    { icon: "printer",     label: "Receipt Settings",  sub: "Configure print layout" },
    { icon: "tag",         label: "Tax & GST",         sub: "Set tax rates per category" },
    { icon: "globe",       label: "Language",          sub: "English (India)" },
  ];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: "#4F46E5", paddingTop: topPad }]}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
          <Feather name="arrow-left" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { fontFamily: "Inter_700Bold" }]}>Settings & Backup</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: botPad + 24 }}>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIcon, { backgroundColor: "#4F46E510" }]}>
              <Feather name="cloud" size={16} color="#4F46E5" />
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
              trackColor={{ true: "#4F46E5", false: "#D1D5DB" }}
              thumbColor="#fff"
            />
          </View>
          <TouchableOpacity style={[styles.outlineBtn, { borderColor: "#4F46E5" }]} onPress={handleManualBackup}>
            <Feather name="upload-cloud" size={15} color="#4F46E5" />
            <Text style={[styles.outlineBtnText, { color: "#4F46E5", fontFamily: "Inter_600SemiBold" }]}>Backup Now</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIcon, { backgroundColor: "#10B98110" }]}>
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
              <Text style={{ color: "#4F46E5", fontFamily: "Inter_600SemiBold", fontSize: 12 }}>Retry</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.syncStats}>
            {[
              { label: "Invoices",  val: "248", color: "#4F46E5" },
              { label: "Products",  val: "42",  color: "#10B981" },
              { label: "Customers", val: "8",   color: "#F59E0B" },
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

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>ACCOUNT</Text>
        <View style={[styles.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {ACCOUNT_ITEMS.map((item, i) => (
            <TouchableOpacity
              key={item.label}
              style={[styles.listRow, { borderTopColor: colors.border, borderTopWidth: i === 0 ? 0 : 1 }]}
              onPress={item.onPress ?? (() => Alert.alert(item.label, "Coming soon"))}
            >
              <View style={[styles.listIcon, { backgroundColor: (item.destructive ? "#EF4444" : "#4F46E5") + "12" }]}>
                <Feather name={item.icon as any} size={15} color={item.destructive ? "#EF4444" : "#4F46E5"} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.listLabel, { color: item.destructive ? "#EF4444" : colors.foreground, fontFamily: "Inter_600SemiBold" }]}>{item.label}</Text>
                <Text style={[styles.listSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{item.sub}</Text>
              </View>
              <Feather name="chevron-right" size={15} color={colors.mutedForeground} />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>APP SETTINGS</Text>
        <View style={[styles.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {APP_ITEMS.map((item, i) => (
            <TouchableOpacity
              key={item.label}
              style={[styles.listRow, { borderTopColor: colors.border, borderTopWidth: i === 0 ? 0 : 1 }]}
              onPress={() => Alert.alert(item.label, "Coming soon")}
            >
              <View style={[styles.listIcon, { backgroundColor: "#4F46E512" }]}>
                <Feather name={item.icon as any} size={15} color="#4F46E5" />
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
  root:         { flex: 1 },
  header:       { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingBottom: 16 },
  headerTitle:  { fontSize: 20, color: "#fff" },
  card:         { borderRadius: 14, borderWidth: 1, padding: 14, gap: 12 },
  cardHeader:   { flexDirection: "row", alignItems: "center", gap: 8 },
  cardIcon:     { width: 32, height: 32, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  cardTitle:    { fontSize: 15 },
  statusRow:    { flexDirection: "row", alignItems: "center", gap: 10, padding: 12 },
  statusLabel:  { fontSize: 13 },
  statusSub:    { fontSize: 11 },
  toggleRow:    { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  toggleLabel:  { fontSize: 14 },
  toggleSub:    { fontSize: 11, marginTop: 1 },
  outlineBtn:   { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 11, borderRadius: 10, borderWidth: 1.5 },
  outlineBtnText:{ fontSize: 14 },
  syncStats:    { flexDirection: "row" },
  syncVal:      { fontSize: 18 },
  syncLabel:    { fontSize: 11 },
  syncDiv:      { width: 1, marginVertical: 4 },
  sectionLabel: { fontSize: 11, letterSpacing: 1, marginBottom: -8 },
  listCard:     { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  listRow:      { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  listIcon:     { width: 34, height: 34, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  listLabel:    { fontSize: 14 },
  listSub:      { fontSize: 11, marginTop: 1 },
});
