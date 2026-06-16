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

const LAST_UPDATED = "1 April 2026";

type Section = { title: string; icon: string; color: string; body: string };

const SECTIONS: Section[] = [
  {
    title: "What Data We Collect",
    icon: "database",
    color: "#4F46E5",
    body:
      "We collect the following categories of data when you use IPOS:\n\n• Account information: name, mobile number, email address, and business details (store name, GSTIN, PAN)\n• Transaction data: sales records, invoice history, payment methods used\n• Inventory data: products, categories, stock levels\n• Customer data: names, phone numbers, and credit balances you record\n• Device information: device model, OS version, app version, and a unique device identifier\n• Usage analytics: screens visited, features used, session duration (anonymised)\n• Crash reports: error logs to help us fix bugs",
  },
  {
    title: "How We Use Your Data",
    icon: "settings",
    color: "#10B981",
    body:
      "Your data is used for the following purposes:\n\n• Providing and improving the IPOS service\n• Generating invoices, reports, and analytics for your business\n• Syncing your data across devices and providing cloud backup\n• Sending transactional notifications (receipts, backup confirmations, payment reminders)\n• Customer support and troubleshooting\n• Detecting and preventing fraud or unauthorised access\n• Complying with legal obligations under Indian law\n\nWe do not use your data for advertising or sell your data to third parties.",
  },
  {
    title: "Data Storage & Security",
    icon: "lock",
    color: "#F59E0B",
    body:
      "All data is stored on secure servers located within India, in compliance with applicable data localisation requirements.\n\nWe implement industry-standard security measures including:\n• AES-256 encryption for data at rest\n• TLS 1.3 encryption for data in transit\n• Role-based access control for our internal teams\n• Regular third-party security audits\n• PIN-based app lock and optional biometric authentication\n\nDespite our best efforts, no system is 100% secure. You are responsible for keeping your device and app credentials safe.",
  },
  {
    title: "Data Sharing",
    icon: "share-2",
    color: "#8B5CF6",
    body:
      "We do not sell, rent, or trade your personal data. We may share data only in the following limited circumstances:\n\n• Service providers: Trusted vendors who help us operate the App (e.g., cloud hosting, SMS gateways, payment processors). They are contractually bound to keep your data confidential and may only use it to provide services to us.\n• Legal requirements: When required by law, court order, or government authority, we may disclose data as required.\n• Business transfers: In the event of a merger, acquisition, or sale of assets, your data may be transferred to the acquiring entity. We will notify you in advance.\n• With your explicit consent: For any other purpose, with your prior written consent.",
  },
  {
    title: "Your Rights",
    icon: "user-check",
    color: "#EC4899",
    body:
      "Under applicable Indian law and global best practices, you have the following rights regarding your data:\n\n• Access: Request a copy of all personal data we hold about you\n• Correction: Request correction of inaccurate or incomplete data\n• Deletion: Request deletion of your account and associated data (subject to legal retention requirements)\n• Portability: Export your business data (products, customers, invoices) in CSV or JSON format\n• Opt-out: Opt out of non-essential communications and analytics collection\n\nTo exercise any of these rights, contact us at privacy@posify.in. We will respond within 30 days.",
  },
  {
    title: "Cookies & Analytics",
    icon: "activity",
    color: "#06B6D4",
    body:
      "The IPOS mobile app does not use browser cookies. On the web version of the App, we use functional cookies necessary for authentication and session management only.\n\nWe use anonymised, aggregated analytics to understand feature usage and improve the App. This data cannot be used to identify individual users. You may opt out of analytics collection in App Settings → Privacy.",
  },
  {
    title: "Third-Party Services",
    icon: "globe",
    color: "#F97316",
    body:
      "The App integrates with third-party services that have their own privacy policies:\n\n• Payment gateways (Razorpay, PayU): transaction processing\n• Twilio / MSG91: SMS OTP delivery\n• Firebase: push notifications and crash reporting\n• Google Analytics (anonymised): app performance\n• Bluetooth/Wi-Fi printer SDKs: receipt printing\n\nWe recommend reviewing the privacy policies of these providers. We are not responsible for their data practices.",
  },
  {
    title: "Data Retention",
    icon: "clock",
    color: "#EF4444",
    body:
      "We retain your data for as long as your account is active and as required by applicable law:\n\n• Transaction records and invoices: 7 years (as required by Indian GST/taxation laws)\n• Customer data: Until you delete it or close your account\n• Usage analytics: 2 years (anonymised after 90 days)\n• Crash logs: 90 days\n\nWhen you delete your account, all personal data is deleted within 30 days, except where we are legally required to retain it.",
  },
  {
    title: "Children's Privacy",
    icon: "shield",
    color: "#1E293B",
    body:
      "IPOS is intended for business use by adults (18 years and older). We do not knowingly collect personal data from individuals under 18 years of age.\n\nIf you believe a minor has provided personal data to us, please contact us at privacy@posify.in and we will promptly delete the information.",
  },
  {
    title: "Changes to This Policy",
    icon: "edit-3",
    color: "#6B7280",
    body:
      "We may update this Privacy Policy from time to time. When we make material changes, we will notify you via an in-app notification or email at least 14 days before the changes take effect.\n\nThe updated policy will always be available within the App under Help & Support → Privacy Policy. The \"Last Updated\" date at the top of this page will reflect the most recent revision.",
  },
  {
    title: "Contact & Grievance Officer",
    icon: "mail",
    color: "#4F46E5",
    body:
      "For privacy-related queries, data requests, or complaints, contact our Grievance Officer as required under the IT Act, 2000:\n\nGrievance Officer: Ms. Priya Sharma\nEmail: privacy@posify.in\nPhone: +91 98765 00002\nAddress: 4th Floor, Tech Park, MG Road, Bengaluru – 560001, Karnataka, India\n\nWe will acknowledge your request within 72 hours and resolve it within 30 days.",
  },
];

export default function PrivacyScreen() {
  const colors  = useColors();
  const insets  = useSafeAreaInsets();
  const topPad  = Platform.OS === "web" ? 67 : insets.top;
  const botPad  = Platform.OS === "web" ? 24 : insets.bottom + 16;
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: "#0F766E", paddingTop: topPad + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
          <Feather name="arrow-left" size={20} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { fontFamily: "Inter_700Bold" }]}>Privacy Policy</Text>
          <Text style={[styles.headerSub,   { fontFamily: "Inter_400Regular" }]}>Last updated {LAST_UPDATED}</Text>
        </View>
        <View style={[styles.headerBadge, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
          <Feather name="shield" size={18} color="#fff" />
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: botPad + 24 }]} showsVerticalScrollIndicator={false}>

        <View style={[styles.banner, { backgroundColor: "#0F766E0D", borderColor: "#0F766E25" }]}>
          <Feather name="lock" size={14} color="#0F766E" />
          <Text style={[styles.bannerText, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>
            Your data is{" "}
            <Text style={{ fontFamily: "Inter_700Bold", color: "#0F766E" }}>never sold</Text>
            {" "}to third parties. We collect only what's necessary to run your business.
          </Text>
        </View>

        {SECTIONS.map((sec, i) => {
          const isOpen = expanded === i;
          return (
            <View key={i} style={[styles.secCard, { backgroundColor: colors.card, borderColor: isOpen ? sec.color + "50" : colors.border, borderWidth: isOpen ? 1.5 : 1 }]}>
              <TouchableOpacity
                style={styles.secHeader}
                onPress={() => setExpanded(isOpen ? null : i)}
                activeOpacity={0.75}
              >
                <View style={[styles.iconBox, { backgroundColor: sec.color + "15" }]}>
                  <Feather name={sec.icon as any} size={15} color={sec.color} />
                </View>
                <Text style={[styles.secTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold", flex: 1 }]}>
                  {sec.title}
                </Text>
                <Feather name={isOpen ? "chevron-up" : "chevron-down"} size={16} color={isOpen ? sec.color : colors.mutedForeground} />
              </TouchableOpacity>
              {isOpen && (
                <View style={[styles.secBody, { borderTopColor: colors.border }]}>
                  <Text style={[styles.secText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                    {sec.body}
                  </Text>
                </View>
              )}
            </View>
          );
        })}

        <View style={[styles.footer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="mail" size={14} color="#0F766E" />
          <Text style={[styles.footerText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            Data requests or concerns? Email{" "}
            <Text style={{ color: "#0F766E", fontFamily: "Inter_600SemiBold" }}>privacy@posify.in</Text>
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:        { flex: 1 },
  header:      { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingBottom: 16 },
  headerTitle: { color: "#fff", fontSize: 20 },
  headerSub:   { color: "rgba(255,255,255,0.75)", fontSize: 12 },
  headerBadge: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  content:     { padding: 16, gap: 10 },
  banner:      { flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 2 },
  bannerText:  { fontSize: 13, flex: 1, lineHeight: 19 },
  secCard:     { borderRadius: 12, overflow: "hidden" },
  secHeader:   { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  iconBox:     { width: 32, height: 32, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  secTitle:    { fontSize: 14 },
  secBody:     { borderTopWidth: 1, padding: 14, paddingTop: 12 },
  secText:     { fontSize: 13, lineHeight: 21 },
  footer:      { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderRadius: 14, borderWidth: 1, marginTop: 4 },
  footerText:  { fontSize: 13, flex: 1 },
});
