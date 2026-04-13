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

type Step = { icon: string; text: string };
type Guide = {
  id: string;
  title: string;
  icon: string;
  color: string;
  description: string;
  duration: string;
  steps: Step[];
};

const GUIDES: Guide[] = [
  {
    id: "first-sale",
    title: "Make Your First Sale",
    icon: "shopping-cart",
    color: "#4F46E5",
    description: "Learn how to process a sale from start to finish using the POS screen.",
    duration: "3 min read",
    steps: [
      { icon: "home",          text: "Tap the POS tab at the bottom of the screen to open the sell screen." },
      { icon: "search",        text: "Search for a product by name or scan its barcode using the search bar at the top." },
      { icon: "plus-circle",   text: "Tap on any product card to add it to your cart. Tap again or use +/− to adjust quantity." },
      { icon: "credit-card",   text: "Tap the cart button at the bottom to open the checkout panel." },
      { icon: "dollar-sign",   text: "Select a payment method: Cash, UPI, Card, or Credit." },
      { icon: "check-circle",  text: "Tap Charge ₹ to complete the sale. A receipt is generated automatically." },
    ],
  },
  {
    id: "add-product",
    title: "Add & Manage Products",
    icon: "package",
    color: "#10B981",
    description: "Add new products, set prices, manage stock and categories.",
    duration: "4 min read",
    steps: [
      { icon: "grid",          text: "Go to the Products tab from the bottom navigation bar." },
      { icon: "plus",          text: "Tap the + button in the top right to open the Add Product form." },
      { icon: "tag",           text: "Enter the product name, price, cost price, and select a category." },
      { icon: "layers",        text: "Set the stock quantity. Enable 'Weight-based pricing' for items sold by kg/g." },
      { icon: "image",         text: "Optionally add a product image by tapping the image placeholder." },
      { icon: "save",          text: "Tap Save. The product is now live in your POS and inventory." },
    ],
  },
  {
    id: "customers-credit",
    title: "Customers & Credit (Udhaar)",
    icon: "users",
    color: "#F59E0B",
    description: "Add customers, record credit sales, and track outstanding balances.",
    duration: "4 min read",
    steps: [
      { icon: "user-plus",     text: "Go to Profile → Customers to view your customer list. Tap + to add a new customer." },
      { icon: "edit-2",        text: "Fill in the customer's name, phone number, and optional address." },
      { icon: "credit-card",   text: "To record a credit sale, select Credit as the payment method during checkout." },
      { icon: "list",          text: "View all credit balances in Profile → Credit / Udhaar. Customers with dues appear at the top." },
      { icon: "check",         text: "When a customer pays, open their ledger and tap 'Record Payment' to clear the balance." },
      { icon: "bell",          text: "POSify reminds you of overdue credit balances via Notifications." },
    ],
  },
  {
    id: "invoices",
    title: "Invoices & Receipts",
    icon: "file-text",
    color: "#EC4899",
    description: "View, share and print invoices. Handle returns and refunds.",
    duration: "3 min read",
    steps: [
      { icon: "file-text",     text: "Every completed sale creates an invoice automatically. Go to Profile → Invoices to view them." },
      { icon: "search",        text: "Search by invoice number, customer name, or filter by status: Paid, Pending, Credit, Returned." },
      { icon: "eye",           text: "Tap any invoice to see the full detail — items, amounts, GST breakdown, and payment info." },
      { icon: "share-2",       text: "From the detail screen, tap Share to send the invoice via WhatsApp, email, or SMS." },
      { icon: "printer",       text: "Tap Print to send the receipt to your connected thermal printer." },
      { icon: "rotate-ccw",    text: "To process a return, tap Return on the invoice detail screen and select the items to return." },
    ],
  },
  {
    id: "reports",
    title: "Reports & Analytics",
    icon: "bar-chart-2",
    color: "#8B5CF6",
    description: "Understand your business performance with daily, weekly and monthly reports.",
    duration: "3 min read",
    steps: [
      { icon: "bar-chart-2",   text: "Go to Profile → Reports to open the analytics dashboard." },
      { icon: "calendar",      text: "Switch between Today, This Week, and This Month using the tabs at the top." },
      { icon: "trending-up",   text: "View Total Sales, Purchases, Expenses, and Net Profit at a glance in the summary cards." },
      { icon: "activity",      text: "The Sales Trend chart shows daily revenue for the last 7 days." },
      { icon: "pie-chart",     text: "Scroll down to see Category Distribution — which product types drive the most revenue." },
      { icon: "download",      text: "Tap the download icon in the header to export a report as PDF or CSV." },
    ],
  },
  {
    id: "settings",
    title: "Store & Receipt Settings",
    icon: "settings",
    color: "#06B6D4",
    description: "Configure your store info, tax details, and receipt layout.",
    duration: "5 min read",
    steps: [
      { icon: "home",          text: "Go to Profile → Store Settings to update your shop name, address, and contact info." },
      { icon: "file-text",     text: "Enter your GSTIN, PAN, and other tax registration numbers for compliant receipts." },
      { icon: "printer",       text: "Go to Profile → Receipt Settings to choose a receipt template (Classic, Modern, Thermal, Detailed)." },
      { icon: "sliders",       text: "Toggle which fields appear on receipts: GST number, customer name, QR code, thank-you note, etc." },
      { icon: "bluetooth",     text: "Connect your Bluetooth or Wi-Fi thermal printer from the Printer Connection section." },
      { icon: "send",          text: "Enable Auto-Send to automatically WhatsApp or email receipts to customers after each sale." },
    ],
  },
  {
    id: "backup",
    title: "Backup & Data Security",
    icon: "shield",
    color: "#EF4444",
    description: "Keep your data safe with automatic backups and PIN lock.",
    duration: "2 min read",
    steps: [
      { icon: "cloud",         text: "Go to Profile → Backup & Sync to set up automatic nightly cloud backups." },
      { icon: "toggle-right",  text: "Enable Auto Backup to run a backup every night at 2 AM automatically." },
      { icon: "upload-cloud",  text: "Tap 'Backup Now' to trigger an immediate manual backup at any time." },
      { icon: "lock",          text: "Go to Profile → Security to set a 4–6 digit PIN to lock the app." },
      { icon: "smartphone",    text: "Enable biometric login (Face ID / Fingerprint) for faster secure access." },
      { icon: "alert-circle",  text: "If you forget your PIN, use 'Forgot PIN' to reset via your registered phone number." },
    ],
  },
];

export default function UserGuideScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 24 : insets.bottom + 16;

  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary, paddingTop: topPad + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
          <Feather name="arrow-left" size={20} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { fontFamily: "Inter_700Bold" }]}>User Guide</Text>
          <Text style={[styles.headerSub, { fontFamily: "Inter_400Regular" }]}>{GUIDES.length} step-by-step tutorials</Text>
        </View>
        <View style={[styles.headerBadge, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
          <Feather name="book-open" size={18} color="#fff" />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: botPad + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Intro card */}
        <View style={[styles.introCard, { backgroundColor: colors.primary + "0D", borderColor: colors.primary + "28" }]}>
          <Feather name="info" size={15} color={colors.primary} />
          <Text style={[styles.introText, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>
            Tap any guide below to expand step-by-step instructions. Follow along in the app as you read.
          </Text>
        </View>

        {/* Guides */}
        {GUIDES.map((guide) => {
          const isOpen = expanded === guide.id;
          return (
            <View key={guide.id} style={[styles.guideCard, { backgroundColor: colors.card, borderColor: isOpen ? guide.color + "50" : colors.border, borderWidth: isOpen ? 1.5 : 1 }]}>
              {/* Header row */}
              <TouchableOpacity
                style={styles.guideHeader}
                onPress={() => setExpanded(isOpen ? null : guide.id)}
                activeOpacity={0.75}
              >
                <View style={[styles.guideIconBox, { backgroundColor: guide.color + "18" }]}>
                  <Feather name={guide.icon as any} size={18} color={guide.color} />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={[styles.guideTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                    {guide.title}
                  </Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Text style={[styles.guideDuration, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                      {guide.duration}
                    </Text>
                    <Text style={[styles.guideStepCount, { color: guide.color, fontFamily: "Inter_600SemiBold", backgroundColor: guide.color + "14", paddingHorizontal: 6, paddingVertical: 1, borderRadius: 6 }]}>
                      {guide.steps.length} steps
                    </Text>
                  </View>
                </View>
                <Feather
                  name={isOpen ? "chevron-up" : "chevron-right"}
                  size={18}
                  color={isOpen ? guide.color : colors.mutedForeground}
                />
              </TouchableOpacity>

              {/* Description */}
              {!isOpen && (
                <Text style={[styles.guideDesc, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  {guide.description}
                </Text>
              )}

              {/* Steps */}
              {isOpen && (
                <View style={[styles.stepsContainer, { borderTopColor: colors.border }]}>
                  {guide.steps.map((step, idx) => (
                    <View key={idx} style={styles.stepRow}>
                      {/* Step number + connector */}
                      <View style={{ alignItems: "center", width: 32 }}>
                        <View style={[styles.stepNumBox, { backgroundColor: guide.color, opacity: 1 }]}>
                          <Text style={[styles.stepNum, { fontFamily: "Inter_700Bold" }]}>{idx + 1}</Text>
                        </View>
                        {idx < guide.steps.length - 1 && (
                          <View style={[styles.stepConnector, { backgroundColor: guide.color + "30" }]} />
                        )}
                      </View>
                      {/* Step content */}
                      <View style={[styles.stepContent, { backgroundColor: colors.background, borderColor: colors.border }]}>
                        <Feather name={step.icon as any} size={14} color={guide.color} style={{ marginTop: 1 }} />
                        <Text style={[styles.stepText, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>
                          {step.text}
                        </Text>
                      </View>
                    </View>
                  ))}

                  {/* Done button */}
                  <TouchableOpacity
                    style={[styles.doneBtn, { backgroundColor: guide.color }]}
                    onPress={() => setExpanded(null)}
                    activeOpacity={0.85}
                  >
                    <Feather name="check" size={14} color="#fff" />
                    <Text style={[styles.doneBtnText, { fontFamily: "Inter_700Bold" }]}>Got it!</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}

        {/* Bottom tip */}
        <View style={[styles.tipCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="message-circle" size={16} color="#10B981" />
          <Text style={[styles.tipText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            Still need help? Our support team replies within 2 hours.{" "}
            <Text style={{ color: "#4F46E5", fontFamily: "Inter_600SemiBold" }}
              onPress={() => router.back()}>Contact us →</Text>
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:           { flex: 1 },
  header:         { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingBottom: 16 },
  headerTitle:    { color: "#fff", fontSize: 20 },
  headerSub:      { color: "rgba(255,255,255,0.8)", fontSize: 12 },
  headerBadge:    { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },

  content:        { padding: 16, gap: 12 },

  introCard:      { flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 12, borderRadius: 12, borderWidth: 1 },
  introText:      { flex: 1, fontSize: 13, lineHeight: 19 },

  guideCard:      { borderRadius: 14, overflow: "hidden" },
  guideHeader:    { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  guideIconBox:   { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  guideTitle:     { fontSize: 15 },
  guideDuration:  { fontSize: 12 },
  guideStepCount: { fontSize: 11 },
  guideDesc:      { fontSize: 12, paddingHorizontal: 14, paddingBottom: 14, lineHeight: 18, marginTop: -4 },

  stepsContainer: { borderTopWidth: 1, paddingHorizontal: 14, paddingTop: 12, paddingBottom: 14, gap: 0 },

  stepRow:        { flexDirection: "row", gap: 10, marginBottom: 8 },
  stepNumBox:     { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  stepNum:        { color: "#fff", fontSize: 11 },
  stepConnector:  { width: 2, flex: 1, minHeight: 8, marginTop: 2 },
  stepContent:    { flex: 1, flexDirection: "row", gap: 10, borderRadius: 10, borderWidth: 1, padding: 10, alignItems: "flex-start" },
  stepText:       { flex: 1, fontSize: 13, lineHeight: 19 },

  doneBtn:        { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 10, marginTop: 8 },
  doneBtnText:    { color: "#fff", fontSize: 14 },

  tipCard:        { flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 14, borderRadius: 14, borderWidth: 1 },
  tipText:        { flex: 1, fontSize: 13, lineHeight: 19 },
});
