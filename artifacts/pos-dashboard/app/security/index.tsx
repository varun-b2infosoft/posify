import React, { useCallback, useState } from "react";
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
import { router, useFocusEffect } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { getAuthState, removePin, subscribeAuth } from "@/store/auth";

export default function SecurityScreen() {
  const colors  = useColors();
  const insets  = useSafeAreaInsets();
  const topPad  = Platform.OS === "web" ? 67 : insets.top;
  const botPad  = Platform.OS === "web" ? 24 : insets.bottom + 16;

  const [hasPinSetup, setHasPinSetup] = useState(() => getAuthState().hasPinSetup);
  const [biometrics, setBiometrics]   = useState(false);
  const [autoLock, setAutoLock]       = useState(true);

  useFocusEffect(useCallback(() => {
    // Sync with auth store whenever screen is focused (e.g. after PIN change)
    setHasPinSetup(getAuthState().hasPinSetup);
    return subscribeAuth(() => setHasPinSetup(getAuthState().hasPinSetup));
  }, []));

  const handleSetPin = () => {
    router.push("/auth/pin-setup?from=security" as any);
  };

  const handleChangePin = () => {
    router.push("/auth/pin-setup?from=security" as any);
  };

  const handleRemovePin = () => {
    Alert.alert(
      "Remove PIN",
      "Are you sure? Your app will no longer be protected by a PIN lock.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove PIN",
          style: "destructive",
          onPress: () => removePin(),
        },
      ]
    );
  };

  const handleBiometrics = (value: boolean) => {
    if (value && !hasPinSetup) {
      Alert.alert("Set up PIN first", "Please enable PIN lock before using biometrics.", [{ text: "OK" }]);
      return;
    }
    setBiometrics(value);
  };

  const SESSION_ITEMS = [
    { label: "Current device",  sub: "Android · Active now",      icon: "smartphone", active: true },
    { label: "iPad (Store)",     sub: "iOS · Last seen 2 hours ago", icon: "tablet",     active: false },
  ];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary, paddingTop: topPad + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
          <Feather name="arrow-left" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { fontFamily: "Inter_700Bold" }]}>Security</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: botPad + 24 }]} showsVerticalScrollIndicator={false}>

        {/* ── PIN Lock ── */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIcon, { backgroundColor: colors.primary + "18" }]}>
              <Feather name="lock" size={16} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>PIN Lock</Text>
              <Text style={[styles.cardSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                Secure your app with a 4-digit PIN
              </Text>
            </View>
            {/* Status badge */}
            <View style={[styles.statusBadge, { backgroundColor: hasPinSetup ? colors.success + "18" : colors.muted }]}>
              <View style={[styles.statusDot, { backgroundColor: hasPinSetup ? colors.success : colors.mutedForeground }]} />
              <Text style={[styles.statusText, { color: hasPinSetup ? colors.success : colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>
                {hasPinSetup ? "Active" : "Off"}
              </Text>
            </View>
          </View>

          {hasPinSetup ? (
            <>
              {/* PIN active state */}
              <View style={[styles.infoRow, { backgroundColor: colors.success + "10", borderRadius: 10 }]}>
                <Feather name="shield" size={16} color={colors.success} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.infoLabel, { color: colors.success, fontFamily: "Inter_600SemiBold" }]}>PIN is enabled</Text>
                  <Text style={[styles.infoSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                    Your app is protected. PIN is required on every launch.
                  </Text>
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              <TouchableOpacity style={styles.actionRow} onPress={handleChangePin} activeOpacity={0.7}>
                <View style={[styles.actionIcon, { backgroundColor: colors.primary + "12" }]}>
                  <Feather name="refresh-cw" size={15} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.actionLabel, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>Change PIN</Text>
                  <Text style={[styles.actionSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Update your 4-digit PIN</Text>
                </View>
                <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionRow} onPress={handleRemovePin} activeOpacity={0.7}>
                <View style={[styles.actionIcon, { backgroundColor: colors.destructive + "12" }]}>
                  <Feather name="unlock" size={15} color={colors.destructive} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.actionLabel, { color: colors.destructive, fontFamily: "Inter_600SemiBold" }]}>Remove PIN</Text>
                  <Text style={[styles.actionSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Disable PIN lock for this app</Text>
                </View>
                <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={[styles.infoRow, { backgroundColor: colors.warning + "10", borderRadius: 10 }]}>
                <Feather name="alert-triangle" size={16} color={colors.warning} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.infoLabel, { color: colors.warning, fontFamily: "Inter_600SemiBold" }]}>PIN not configured</Text>
                  <Text style={[styles.infoSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                    Set a PIN to prevent unauthorised access to your data.
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.setupBtn, { backgroundColor: colors.primary }]}
                onPress={handleSetPin}
                activeOpacity={0.85}
              >
                <Feather name="lock" size={16} color="#fff" />
                <Text style={[styles.setupBtnText, { fontFamily: "Inter_700Bold" }]}>Set up PIN</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* ── Auto-lock timing ── */}
        {hasPinSetup && (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.toggleRow}>
              <View style={[styles.cardIcon, { backgroundColor: "#06B6D418" }]}>
                <Feather name="clock" size={16} color="#06B6D4" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Auto-Lock</Text>
                <Text style={[styles.cardSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  {autoLock ? "Locks after 5 minutes in background" : "App stays unlocked"}
                </Text>
              </View>
              <Switch
                value={autoLock}
                onValueChange={setAutoLock}
                trackColor={{ true: colors.primary, false: colors.border }}
                thumbColor="#fff"
              />
            </View>
          </View>
        )}

        {/* ── Biometrics ── */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.toggleRow}>
            <View style={[styles.cardIcon, { backgroundColor: "#8B5CF618" }]}>
              <Feather name="activity" size={16} color="#8B5CF6" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Biometrics</Text>
              <Text style={[styles.cardSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                {biometrics ? "Face ID / Fingerprint enabled" : "Use Face ID or Fingerprint to unlock"}
              </Text>
            </View>
            <Switch
              value={biometrics}
              onValueChange={handleBiometrics}
              trackColor={{ true: colors.primary, false: colors.border }}
              thumbColor="#fff"
            />
          </View>
          {!hasPinSetup && (
            <View style={[styles.infoRow, { backgroundColor: colors.muted, borderRadius: 8 }]}>
              <Feather name="info" size={13} color={colors.mutedForeground} />
              <Text style={[styles.infoSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                Requires PIN lock to be enabled first
              </Text>
            </View>
          )}
        </View>

        {/* ── Active Sessions ── */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>ACTIVE SESSIONS</Text>
        <View style={[styles.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {SESSION_ITEMS.map((item, i) => (
            <View
              key={item.label}
              style={[styles.sessionRow, { borderTopColor: colors.border, borderTopWidth: i === 0 ? 0 : 1 }]}
            >
              <View style={[styles.sessionIcon, { backgroundColor: item.active ? colors.success + "18" : colors.muted }]}>
                <Feather name={item.icon as any} size={15} color={item.active ? colors.success : colors.mutedForeground} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.sessionLabel, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>{item.label}</Text>
                <Text style={[styles.sessionSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{item.sub}</Text>
              </View>
              {item.active && (
                <View style={[styles.activePill, { backgroundColor: colors.success + "18" }]}>
                  <Text style={[styles.activePillText, { color: colors.success, fontFamily: "Inter_700Bold" }]}>This device</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        <TouchableOpacity activeOpacity={0.7} onPress={() => Alert.alert("Sign Out All Devices", "Coming soon")}>
          <Text style={[styles.signOutAll, { color: colors.destructive, fontFamily: "Inter_500Medium" }]}>
            Sign out all other devices
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:          { flex: 1 },
  header:        { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingBottom: 16 },
  headerTitle:   { color: "#fff", fontSize: 20, flex: 1 },
  content:       { padding: 16, gap: 16 },

  card:          { borderRadius: 14, borderWidth: 1, padding: 14, gap: 12 },
  cardHeader:    { flexDirection: "row", alignItems: "center", gap: 10 },
  cardIcon:      { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  cardTitle:     { fontSize: 15 },
  cardSub:       { fontSize: 12, marginTop: 1 },

  statusBadge:   { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  statusDot:     { width: 7, height: 7, borderRadius: 4 },
  statusText:    { fontSize: 12 },

  infoRow:       { flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 10 },
  infoLabel:     { fontSize: 13 },
  infoSub:       { fontSize: 12, marginTop: 1, lineHeight: 17 },

  divider:       { height: 1, marginHorizontal: -14 },

  actionRow:     { flexDirection: "row", alignItems: "center", gap: 12 },
  actionIcon:    { width: 32, height: 32, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  actionLabel:   { fontSize: 14 },
  actionSub:     { fontSize: 12, marginTop: 1 },

  setupBtn:      { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 13, borderRadius: 12 },
  setupBtnText:  { color: "#fff", fontSize: 15 },

  toggleRow:     { flexDirection: "row", alignItems: "center", gap: 12 },

  sectionLabel:  { fontSize: 11, letterSpacing: 1 },
  listCard:      { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  sessionRow:    { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  sessionIcon:   { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  sessionLabel:  { fontSize: 14 },
  sessionSub:    { fontSize: 12, marginTop: 1 },
  activePill:    { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  activePillText:{ fontSize: 11 },

  signOutAll:    { fontSize: 13, textAlign: "center" },
});
