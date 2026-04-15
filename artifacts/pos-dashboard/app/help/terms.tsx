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

type Section = { title: string; body: string };

const LAST_UPDATED = "1 April 2026";
const EFFECTIVE   = "1 April 2026";

const SECTIONS: Section[] = [
  {
    title: "1. Acceptance of Terms",
    body:
      "By downloading, installing, or using the IPOS application (\"App\"), you agree to be bound by these Terms of Service (\"Terms\"). If you do not agree to these Terms, do not use the App.\n\nThese Terms constitute a legally binding agreement between you (\"User\") and IPOS Technologies Pvt. Ltd. (\"Company\", \"we\", \"us\", or \"our\"), a company incorporated under the laws of India.",
  },
  {
    title: "2. Description of Service",
    body:
      "IPOS is a point-of-sale management platform that enables merchants to manage inventory, process sales transactions, generate invoices, track expenses, manage customer credit (Udhaar), and analyse business performance.\n\nThe App is intended for use by registered business owners, shopkeepers, and their authorised staff members. Personal use unrelated to commerce is not the intended purpose of the App.",
  },
  {
    title: "3. Account Registration",
    body:
      "To access full functionality, you must create an account by providing accurate and complete information including your name, mobile number, store name, and business details.\n\nYou are responsible for maintaining the confidentiality of your PIN and login credentials. You agree to notify us immediately of any unauthorised use of your account at support@posify.in.\n\nWe reserve the right to suspend or terminate accounts that provide false information or violate these Terms.",
  },
  {
    title: "4. Subscription & Billing",
    body:
      "IPOS offers free and paid subscription tiers. Paid plans are billed monthly or annually as selected at the time of purchase. All prices are in Indian Rupees (₹) and inclusive of applicable GST.\n\nSubscriptions auto-renew unless cancelled at least 24 hours before the renewal date. No refunds are provided for partial subscription periods except where required by applicable law.\n\nWe reserve the right to modify pricing with 30 days' advance notice to registered users.",
  },
  {
    title: "5. Data & Backups",
    body:
      "You own all business data you input into IPOS including product catalogues, customer records, invoices, and transaction history. We do not claim any ownership over your data.\n\nWhile we provide automatic cloud backup features, it is ultimately your responsibility to maintain adequate backups of your critical business data. We are not liable for data loss arising from device failure, user error, or service interruption.\n\nData is stored on servers located in India in compliance with the Information Technology Act, 2000 and applicable data localisation requirements.",
  },
  {
    title: "6. Acceptable Use",
    body:
      "You agree not to:\n\n• Use the App for any unlawful purpose or in violation of applicable laws\n• Reverse engineer, decompile, or disassemble any part of the App\n• Use automated scripts or bots to access the App\n• Share your account credentials with third parties not authorised by you\n• Attempt to gain unauthorised access to our systems or other users' accounts\n• Upload content that is defamatory, obscene, or infringes on any intellectual property rights\n\nViolation of these terms may result in immediate account termination without refund.",
  },
  {
    title: "7. Intellectual Property",
    body:
      "The App, its design, features, software, logos, and all associated intellectual property are owned by IPOS Technologies Pvt. Ltd. and are protected by applicable intellectual property laws.\n\nYou are granted a limited, non-exclusive, non-transferable licence to use the App solely for your internal business purposes. This licence does not include the right to sublicence, modify, or create derivative works based on the App.",
  },
  {
    title: "8. Third-Party Services",
    body:
      "The App integrates with third-party services including payment gateways, SMS providers, and printer manufacturer APIs. Your use of such services is subject to their respective terms and privacy policies.\n\nWe are not responsible for the availability, accuracy, or security of third-party services. Links or integrations do not constitute endorsement of any third-party service.",
  },
  {
    title: "9. Limitation of Liability",
    body:
      'To the fullest extent permitted by applicable law, IPOS Technologies Pvt. Ltd. shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, loss of data, business interruption, or any other commercial damages or losses.\n\nOur total liability to you for any claims arising under these Terms shall not exceed the amount you paid to us in the 12 months preceding the claim. This limitation applies even if we have been advised of the possibility of such damages.',
  },
  {
    title: "10. Indemnification",
    body:
      "You agree to indemnify, defend, and hold harmless IPOS Technologies Pvt. Ltd. and its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses (including legal fees) arising out of or in any way connected with your access to or use of the App, your violation of these Terms, or your violation of any rights of a third party.",
  },
  {
    title: "11. Termination",
    body:
      "Either party may terminate the agreement at any time. You may terminate by deleting your account from within the App or by contacting support@posify.in.\n\nWe may suspend or terminate your access immediately and without notice if we reasonably believe you have violated these Terms, engaged in fraudulent activity, or pose a security risk to the App or other users.\n\nUpon termination, your right to use the App ceases immediately. You may request an export of your data within 30 days of termination, after which it may be deleted.",
  },
  {
    title: "12. Governing Law & Disputes",
    body:
      "These Terms are governed by and construed in accordance with the laws of India. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts located in Bengaluru, Karnataka, India.\n\nBefore initiating legal proceedings, you agree to attempt to resolve any dispute informally by contacting us at legal@posify.in. We will attempt to resolve the dispute within 30 days.",
  },
  {
    title: "13. Changes to Terms",
    body:
      "We reserve the right to modify these Terms at any time. When we make material changes, we will notify you via the App or by email to your registered address at least 14 days before the changes take effect.\n\nYour continued use of the App after changes take effect constitutes your acceptance of the revised Terms. If you do not agree to the revised Terms, you must stop using the App and may terminate your account.",
  },
  {
    title: "14. Contact Us",
    body:
      "If you have questions about these Terms, please contact us:\n\nIPOS Technologies Pvt. Ltd.\nEmail: legal@posify.in\nPhone: +91 98765 00000\nAddress: 4th Floor, Tech Park, MG Road, Bengaluru – 560001, Karnataka, India",
  },
];

export default function TermsScreen() {
  const colors  = useColors();
  const insets  = useSafeAreaInsets();
  const topPad  = Platform.OS === "web" ? 67 : insets.top;
  const botPad  = Platform.OS === "web" ? 24 : insets.bottom + 16;
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: "#1E293B", paddingTop: topPad + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
          <Feather name="arrow-left" size={20} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { fontFamily: "Inter_700Bold" }]}>Terms of Service</Text>
          <Text style={[styles.headerSub,   { fontFamily: "Inter_400Regular" }]}>Last updated {LAST_UPDATED}</Text>
        </View>
        <View style={[styles.headerBadge, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
          <Feather name="file-text" size={18} color="#fff" />
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: botPad + 24 }]} showsVerticalScrollIndicator={false}>

        {/* Summary banner */}
        <View style={[styles.banner, { backgroundColor: "#1E293B0D", borderColor: "#1E293B25" }]}>
          <Feather name="info" size={14} color="#1E293B" />
          <Text style={[styles.bannerText, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>
            Effective: <Text style={{ fontFamily: "Inter_600SemiBold" }}>{EFFECTIVE}</Text>
            {"  ·  "}
            Sections: <Text style={{ fontFamily: "Inter_600SemiBold" }}>{SECTIONS.length}</Text>
          </Text>
        </View>

        {SECTIONS.map((sec, i) => {
          const isOpen = expanded === i;
          return (
            <View key={i} style={[styles.secCard, { backgroundColor: colors.card, borderColor: isOpen ? "#4F46E550" : colors.border, borderWidth: isOpen ? 1.5 : 1 }]}>
              <TouchableOpacity
                style={styles.secHeader}
                onPress={() => setExpanded(isOpen ? null : i)}
                activeOpacity={0.75}
              >
                <View style={[styles.secNum, { backgroundColor: isOpen ? "#4F46E5" : colors.muted }]}>
                  <Text style={[styles.secNumText, { color: isOpen ? "#fff" : colors.mutedForeground, fontFamily: "Inter_700Bold" }]}>
                    {i + 1}
                  </Text>
                </View>
                <Text style={[styles.secTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold", flex: 1 }]}>
                  {sec.title.replace(/^\d+\.\s/, "")}
                </Text>
                <Feather name={isOpen ? "chevron-up" : "chevron-down"} size={16} color={isOpen ? "#4F46E5" : colors.mutedForeground} />
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
          <Feather name="mail" size={14} color="#4F46E5" />
          <Text style={[styles.footerText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            Questions? Email us at{" "}
            <Text style={{ color: "#4F46E5", fontFamily: "Inter_600SemiBold" }}>legal@posify.in</Text>
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
  banner:      { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 2 },
  bannerText:  { fontSize: 13 },
  secCard:     { borderRadius: 12, overflow: "hidden" },
  secHeader:   { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  secNum:      { width: 26, height: 26, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  secNumText:  { fontSize: 12 },
  secTitle:    { fontSize: 14 },
  secBody:     { borderTopWidth: 1, padding: 14, paddingTop: 12 },
  secText:     { fontSize: 13, lineHeight: 21 },
  footer:      { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderRadius: 14, borderWidth: 1, marginTop: 4 },
  footerText:  { fontSize: 13, flex: 1 },
});
