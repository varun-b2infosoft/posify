import React from "react";
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const FEATURES = [
  { icon: "shopping-cart", label: "Fast Billing" },
  { icon: "bar-chart-2",  label: "Analytics"   },
  { icon: "users",        label: "CRM"          },
  { icon: "file-text",    label: "Invoices"     },
];

export default function WelcomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Hero */}
      <View style={[styles.hero, { backgroundColor: colors.primary, paddingTop: (Platform.OS === "web" ? 60 : insets.top) + 20 }]}>
        <View style={styles.logoWrap}>
          <View style={[styles.logoIcon, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
            <Feather name="shopping-bag" size={36} color="#fff" />
          </View>
          <Text style={[styles.logoText, { fontFamily: "Inter_700Bold" }]}>POSify</Text>
        </View>
        <Text style={[styles.tagline, { fontFamily: "Inter_400Regular" }]}>
          Smart POS for Growing Businesses
        </Text>
        <Text style={[styles.sub, { fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.75)" }]}>
          Sell, manage inventory, track customers{"\n"}and grow — all in one place.
        </Text>

        {/* Feature pills */}
        <View style={styles.featureRow}>
          {FEATURES.map((f) => (
            <View key={f.label} style={styles.featurePill}>
              <Feather name={f.icon as any} size={13} color="rgba(255,255,255,0.9)" />
              <Text style={[styles.featureLabel, { fontFamily: "Inter_500Medium" }]}>{f.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Wave divider */}
      <View style={[styles.waveDivider, { backgroundColor: colors.primary }]}>
        <View style={[styles.waveBottom, { backgroundColor: colors.background }]} />
      </View>

      {/* CTA area */}
      <View style={[styles.cta, { paddingBottom: (Platform.OS === "web" ? 40 : insets.bottom) + 24 }]}>
        <Text style={[styles.ctaTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
          Get started today
        </Text>
        <Text style={[styles.ctaSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          Join thousands of businesses using POSify
        </Text>

        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
          onPress={() => router.push("/auth/register" as any)}
          activeOpacity={0.85}
        >
          <Feather name="user-plus" size={18} color="#fff" />
          <Text style={[styles.primaryBtnText, { fontFamily: "Inter_700Bold" }]}>Create Account</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.outlineBtn, { borderColor: colors.primary }]}
          onPress={() => router.push("/auth/login" as any)}
          activeOpacity={0.85}
        >
          <Feather name="log-in" size={18} color={colors.primary} />
          <Text style={[styles.outlineBtnText, { color: colors.primary, fontFamily: "Inter_600SemiBold" }]}>Sign In</Text>
        </TouchableOpacity>

        <Text style={[styles.legal, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          By continuing you agree to our Terms & Privacy Policy
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root:        { flex: 1 },
  hero:        { alignItems: "center", paddingBottom: 48, paddingHorizontal: 24 },
  logoWrap:    { alignItems: "center", marginBottom: 16 },
  logoIcon:    { width: 80, height: 80, borderRadius: 24, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  logoText:    { fontSize: 36, color: "#fff", letterSpacing: 1 },
  tagline:     { fontSize: 18, color: "#fff", marginBottom: 8, textAlign: "center" },
  sub:         { fontSize: 14, textAlign: "center", lineHeight: 22 },
  featureRow:  { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 8, marginTop: 20 },
  featurePill: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(255,255,255,0.15)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  featureLabel:{ color: "rgba(255,255,255,0.9)", fontSize: 12 },

  waveDivider: { height: 40, position: "relative" },
  waveBottom:  { position: "absolute", bottom: 0, left: 0, right: 0, height: 40, borderTopLeftRadius: 32, borderTopRightRadius: 32 },

  cta:         { flex: 1, paddingHorizontal: 24, paddingTop: 8, gap: 12 },
  ctaTitle:    { fontSize: 22, textAlign: "center" },
  ctaSub:      { fontSize: 14, textAlign: "center", marginBottom: 4 },

  primaryBtn:  { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, height: 54, borderRadius: 14 },
  primaryBtnText: { color: "#fff", fontSize: 16 },
  outlineBtn:  { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, height: 54, borderRadius: 14, borderWidth: 1.5 },
  outlineBtnText: { fontSize: 16 },
  legal:       { fontSize: 11, textAlign: "center" },
});
