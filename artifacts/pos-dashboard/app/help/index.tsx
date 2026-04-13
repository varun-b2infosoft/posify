import React, { useState } from "react";
import {
  Alert,
  Linking,
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

const FAQS = [
  {
    q: "How do I add a new product?",
    a: "Go to the Products tab and tap the + button in the top right corner. Fill in the product details like name, price, category and stock quantity, then tap Save.",
  },
  {
    q: "How do I process a sale?",
    a: "Tap the POS tab at the bottom. Search or scan a product, add it to the cart, select a payment method, and tap Charge to complete the sale.",
  },
  {
    q: "Can I manage multiple shops?",
    a: "Yes! Go to Profile → Manage Shops to add and switch between multiple shop locations. Each shop has its own inventory and sales data.",
  },
  {
    q: "How does the Credit / Udhaar system work?",
    a: "Go to Profile → Credit / Udhaar. You can record credit given to customers and mark payments as received. Outstanding balances appear on the customer's profile.",
  },
  {
    q: "How do I generate an invoice?",
    a: "Invoices are automatically created after each POS sale. You can view all invoices in Profile → Invoices, where you can also share or print them.",
  },
  {
    q: "How do I backup my data?",
    a: "Go to Settings (Profile → Backup & Sync). Enable Auto Backup for nightly cloud backups, or tap 'Backup Now' for an immediate backup.",
  },
  {
    q: "How do I set up or change my PIN?",
    a: "Go to Settings → Security. If no PIN is set, tap 'Set up PIN'. If a PIN is active, tap 'Change PIN' to create a new one.",
  },
  {
    q: "How do I add staff members?",
    a: "Go to Profile → Manage Shops, select a shop, and tap 'Add Staff'. You can assign roles and set permissions for each staff member.",
  },
];

const CONTACT_ITEMS = [
  {
    icon: "mail"      as const,
    label: "Email Support",
    sub:   "support@posify.in",
    color: "#4F46E5",
    onPress: () => Linking.openURL("mailto:support@posify.in"),
  },
  {
    icon: "phone"     as const,
    label: "Call Us",
    sub:   "+91 98765 00000  (Mon–Sat, 9 AM–6 PM)",
    color: "#10B981",
    onPress: () => Linking.openURL("tel:+919876500000"),
  },
  {
    icon: "message-circle" as const,
    label: "WhatsApp",
    sub:   "+91 98765 00001",
    color: "#25D366",
    onPress: () => Linking.openURL("https://wa.me/919876500001"),
  },
];

const RESOURCE_ITEMS = [
  { icon: "book-open" as const, label: "User Guide",       sub: "Step-by-step tutorials" },
  { icon: "video"     as const, label: "Video Tutorials",  sub: "Watch how-to videos" },
  { icon: "globe"     as const, label: "Visit Website",    sub: "www.posify.in" },
];

export default function HelpScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 24 : insets.bottom + 16;

  const [expanded, setExpanded] = useState<number | null>(null);

  const toggle = (i: number) => setExpanded((prev) => (prev === i ? null : i));

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary, paddingTop: topPad + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
          <Feather name="arrow-left" size={20} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { fontFamily: "Inter_700Bold" }]}>Help & Support</Text>
          <Text style={[styles.headerSub, { fontFamily: "Inter_400Regular" }]}>We're here to help you</Text>
        </View>
        <View style={[styles.headerIcon, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
          <Feather name="help-circle" size={20} color="#fff" />
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: botPad + 24 }]} showsVerticalScrollIndicator={false}>

        {/* Quick contact strip */}
        <View style={[styles.contactStrip, { backgroundColor: colors.primary + "0C", borderColor: colors.primary + "30" }]}>
          <Feather name="headphones" size={16} color={colors.primary} />
          <Text style={[styles.contactStripText, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>
            Average response time: <Text style={{ fontFamily: "Inter_700Bold", color: colors.primary }}>under 2 hours</Text>
          </Text>
        </View>

        {/* ── FAQ ── */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>FREQUENTLY ASKED QUESTIONS</Text>
        <View style={[styles.faqCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {FAQS.map((faq, i) => (
            <View key={i} style={[styles.faqItem, i > 0 && { borderTopColor: colors.border, borderTopWidth: 1 }]}>
              <TouchableOpacity
                style={styles.faqQuestion}
                onPress={() => toggle(i)}
                activeOpacity={0.7}
              >
                <View style={[styles.faqNum, { backgroundColor: colors.primary + "12" }]}>
                  <Text style={[styles.faqNumText, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>{i + 1}</Text>
                </View>
                <Text style={[styles.faqQ, { color: colors.foreground, fontFamily: "Inter_500Medium", flex: 1 }]}>
                  {faq.q}
                </Text>
                <Feather
                  name={expanded === i ? "chevron-up" : "chevron-down"}
                  size={16}
                  color={colors.mutedForeground}
                />
              </TouchableOpacity>
              {expanded === i && (
                <View style={[styles.faqAnswer, { backgroundColor: colors.muted }]}>
                  <Text style={[styles.faqA, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                    {faq.a}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* ── Contact Us ── */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>CONTACT US</Text>
        <View style={[styles.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {CONTACT_ITEMS.map((item, i) => (
            <TouchableOpacity
              key={item.label}
              style={[styles.listRow, { borderTopColor: colors.border, borderTopWidth: i === 0 ? 0 : 1 }]}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={[styles.listIcon, { backgroundColor: item.color + "15" }]}>
                <Feather name={item.icon} size={16} color={item.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.listLabel, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>{item.label}</Text>
                <Text style={[styles.listSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{item.sub}</Text>
              </View>
              <Feather name="external-link" size={14} color={colors.mutedForeground} />
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Resources ── */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>RESOURCES</Text>
        <View style={[styles.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {RESOURCE_ITEMS.map((item, i) => (
            <TouchableOpacity
              key={item.label}
              style={[styles.listRow, { borderTopColor: colors.border, borderTopWidth: i === 0 ? 0 : 1 }]}
              onPress={() => Alert.alert(item.label, "Coming soon")}
              activeOpacity={0.7}
            >
              <View style={[styles.listIcon, { backgroundColor: colors.primary + "12" }]}>
                <Feather name={item.icon} size={16} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.listLabel, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>{item.label}</Text>
                <Text style={[styles.listSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{item.sub}</Text>
              </View>
              <Feather name="chevron-right" size={15} color={colors.mutedForeground} />
            </TouchableOpacity>
          ))}
        </View>

        {/* ── About ── */}
        <View style={[styles.aboutCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.aboutLogo, { backgroundColor: colors.primary + "18" }]}>
            <Feather name="shopping-bag" size={22} color={colors.primary} />
          </View>
          <Text style={[styles.aboutName, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>POSify</Text>
          <Text style={[styles.aboutVersion, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Version 2.0.0 · Build 20250413</Text>

          <View style={styles.aboutLinks}>
            {[
              { label: "Terms of Service", onPress: () => Alert.alert("Terms", "Coming soon") },
              { label: "Privacy Policy",   onPress: () => Alert.alert("Privacy", "Coming soon") },
              { label: "Licenses",         onPress: () => Alert.alert("Licenses", "Coming soon") },
            ].map((link) => (
              <TouchableOpacity key={link.label} onPress={link.onPress} activeOpacity={0.7}>
                <Text style={[styles.aboutLink, { color: colors.primary, fontFamily: "Inter_500Medium" }]}>{link.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.copyright, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            © 2025 POSify Technologies Pvt. Ltd.{"\n"}All rights reserved.
          </Text>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:         { flex: 1 },
  header:       { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingBottom: 16 },
  headerTitle:  { color: "#fff", fontSize: 20 },
  headerSub:    { color: "rgba(255,255,255,0.8)", fontSize: 12 },
  headerIcon:   { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  content:      { padding: 16, gap: 16 },

  contactStrip: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 12, borderWidth: 1 },
  contactStripText: { fontSize: 13, flex: 1 },

  sectionLabel: { fontSize: 11, letterSpacing: 1 },

  faqCard:      { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  faqItem:      {},
  faqQuestion:  { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  faqNum:       { width: 26, height: 26, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  faqNumText:   { fontSize: 12 },
  faqQ:         { fontSize: 14 },
  faqAnswer:    { marginHorizontal: 14, marginBottom: 14, borderRadius: 10, padding: 12 },
  faqA:         { fontSize: 13, lineHeight: 20 },

  listCard:     { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  listRow:      { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  listIcon:     { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  listLabel:    { fontSize: 14 },
  listSub:      { fontSize: 12, marginTop: 1 },

  aboutCard:    { borderRadius: 14, borderWidth: 1, padding: 20, alignItems: "center", gap: 8 },
  aboutLogo:    { width: 56, height: 56, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  aboutName:    { fontSize: 20 },
  aboutVersion: { fontSize: 12 },
  aboutLinks:   { flexDirection: "row", gap: 16, marginTop: 4, flexWrap: "wrap", justifyContent: "center" },
  aboutLink:    { fontSize: 12 },
  copyright:    { fontSize: 11, textAlign: "center", lineHeight: 18, marginTop: 4 },
});
