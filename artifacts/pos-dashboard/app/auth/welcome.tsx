import React, { useState } from "react";
import {
  Platform,
  ScrollView,
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
  { icon: "shopping-cart", label: "Fast Billing"  },
  { icon: "bar-chart-2",   label: "Analytics"     },
  { icon: "users",         label: "CRM"            },
  { icon: "file-text",     label: "Invoices"       },
];

type ProfileType = "owner" | "customer";

interface ProfileCard {
  key: ProfileType;
  icon: string;
  title: string;
  subtitle: string;
  color: string;
  bg: string;
}

export default function WelcomeScreen() {
  const colors  = useColors();
  const insets  = useSafeAreaInsets();
  const [selected, setSelected] = useState<ProfileType | null>(null);

  const PROFILES: ProfileCard[] = [
    {
      key:      "owner",
      icon:     "briefcase",
      title:    "Shop Owner / Staff",
      subtitle: "Manage sales, inventory & reports",
      color:    colors.primary,
      bg:       colors.primary + "15",
    },
    {
      key:      "customer",
      icon:     "smile",
      title:    "Customer",
      subtitle: "Browse shops, order & track delivery",
      color:    "#10B981",
      bg:       "#10B98115",
    },
  ];

  const handleContinue = () => {
    if (!selected) return;
    if (selected === "owner") {
      router.push("/auth/login" as any);
    } else {
      router.push("/auth/customer-login" as any);
    }
  };

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={{ flexGrow: 1 }}
      bounces={false}
    >
      {/* Hero */}
      <View
        style={[
          styles.hero,
          {
            backgroundColor: colors.primary,
            paddingTop: (Platform.OS === "web" ? 60 : insets.top) + 20,
          },
        ]}
      >
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

      {/* Profile selection */}
      <View
        style={[
          styles.cta,
          { paddingBottom: (Platform.OS === "web" ? 40 : insets.bottom) + 24 },
        ]}
      >
        <Text style={[styles.ctaTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
          Who are you?
        </Text>
        <Text style={[styles.ctaSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          Select your profile to get started
        </Text>

        {PROFILES.map((p) => {
          const isSelected = selected === p.key;
          return (
            <TouchableOpacity
              key={p.key}
              style={[
                styles.profileCard,
                {
                  backgroundColor: colors.card,
                  borderColor: isSelected ? p.color : colors.border,
                  borderWidth: isSelected ? 2 : 1,
                },
              ]}
              onPress={() => setSelected(p.key)}
              activeOpacity={0.8}
            >
              <View style={[styles.profileIconWrap, { backgroundColor: p.bg }]}>
                <Feather name={p.icon as any} size={24} color={p.color} />
              </View>
              <View style={{ flex: 1, gap: 3 }}>
                <Text
                  style={[
                    styles.profileTitle,
                    {
                      color:      isSelected ? p.color : colors.foreground,
                      fontFamily: "Inter_700Bold",
                    },
                  ]}
                >
                  {p.title}
                </Text>
                <Text style={[styles.profileSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  {p.subtitle}
                </Text>
              </View>
              <View
                style={[
                  styles.radio,
                  {
                    borderColor:     p.color,
                    backgroundColor: isSelected ? p.color : "transparent",
                  },
                ]}
              >
                {isSelected && <Feather name="check" size={12} color="#fff" />}
              </View>
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity
          style={[
            styles.continueBtn,
            {
              backgroundColor: selected === "customer" ? "#10B981" : colors.primary,
              opacity:          selected ? 1 : 0.45,
            },
          ]}
          onPress={handleContinue}
          disabled={!selected}
          activeOpacity={0.85}
        >
          <Text style={[styles.continueBtnText, { fontFamily: "Inter_700Bold" }]}>
            Continue
          </Text>
          <Feather name="arrow-right" size={18} color="#fff" />
        </TouchableOpacity>

        <Text style={[styles.legal, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          By continuing you agree to our Terms & Privacy Policy
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root:           { flex: 1 },
  hero:           { alignItems: "center", paddingBottom: 48, paddingHorizontal: 24 },
  logoWrap:       { alignItems: "center", marginBottom: 16 },
  logoIcon:       { width: 80, height: 80, borderRadius: 24, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  logoText:       { fontSize: 36, color: "#fff", letterSpacing: 1 },
  tagline:        { fontSize: 18, color: "#fff", marginBottom: 8, textAlign: "center" },
  sub:            { fontSize: 14, textAlign: "center", lineHeight: 22 },
  featureRow:     { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 8, marginTop: 20 },
  featurePill:    { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(255,255,255,0.15)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  featureLabel:   { color: "rgba(255,255,255,0.9)", fontSize: 12 },
  waveDivider:    { height: 40, position: "relative" },
  waveBottom:     { position: "absolute", bottom: 0, left: 0, right: 0, height: 40, borderTopLeftRadius: 32, borderTopRightRadius: 32 },
  cta:            { paddingHorizontal: 24, paddingTop: 8, gap: 14 },
  ctaTitle:       { fontSize: 22, textAlign: "center" },
  ctaSub:         { fontSize: 14, textAlign: "center", marginBottom: 4 },
  profileCard:    { flexDirection: "row", alignItems: "center", gap: 14, padding: 16, borderRadius: 16 },
  profileIconWrap:{ width: 52, height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  profileTitle:   { fontSize: 15 },
  profileSub:     { fontSize: 12, lineHeight: 18 },
  radio:          { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  continueBtn:    { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, height: 54, borderRadius: 14, marginTop: 4 },
  continueBtnText:{ color: "#fff", fontSize: 16 },
  legal:          { fontSize: 11, textAlign: "center" },
});
