import React, { useState } from "react";
import {
  Alert,
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
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

// ─── Types ───────────────────────────────────────────────────────────────────

type Template   = "classic" | "modern" | "thermal" | "detailed";
type PaperSize  = "58mm" | "80mm" | "A5" | "A4";
type FontSize   = "small" | "medium" | "large";
type PrinterConn= "none" | "bluetooth" | "wifi" | "usb";

// ─── Mini Receipt Preview ─────────────────────────────────────────────────────

function ReceiptPreview({
  template, showLogo, showGst, showCustomer, showCashier,
  showDateTime, showPayMode, showQr, showThankYou,
  headerMsg, footerMsg, paperSize, fontSize, colors,
}: {
  template: Template; showLogo: boolean; showGst: boolean;
  showCustomer: boolean; showCashier: boolean; showDateTime: boolean;
  showPayMode: boolean; showQr: boolean; showThankYou: boolean;
  headerMsg: string; footerMsg: string; paperSize: PaperSize;
  fontSize: FontSize; colors: any;
}) {
  const isModern   = template === "modern";
  const isThermal  = template === "thermal";
  const isDetailed = template === "detailed";

  const bodyFs  = fontSize === "small" ? 8 : fontSize === "large" ? 11 : 9.5;
  const titleFs = fontSize === "small" ? 10 : fontSize === "large" ? 14 : 12;
  const width   = paperSize === "58mm" ? 160 : paperSize === "A4" ? 230 : paperSize === "A5" ? 200 : 190;

  const divider = isThermal
    ? <Text style={{ fontSize: bodyFs, color: "#9CA3AF", letterSpacing: 1, textAlign: "center" }}>- - - - - - - - - - -</Text>
    : <View style={{ height: 1, backgroundColor: isModern ? "#4F46E520" : "#E5E7EB", marginVertical: 5 }} />;

  return (
    <View style={[
      styles.previewOuter,
      { width, backgroundColor: isModern ? "#FAFAFA" : "#fff", borderColor: isModern ? "#4F46E530" : "#E5E7EB" },
    ]}>
      {/* Shadow line for modern */}
      {isModern && <View style={{ height: 4, backgroundColor: "#4F46E5", borderTopLeftRadius: 6, borderTopRightRadius: 6 }} />}

      <View style={{ padding: 10, gap: 4 }}>
        {/* Logo / Store Name */}
        {showLogo && (
          <View style={{ alignItems: isModern ? "center" : "flex-start", marginBottom: 2 }}>
            <View style={[styles.previewLogo, { backgroundColor: isModern ? "#4F46E5" : "#EEF2FF" }]}>
              <Text style={{ fontSize: 9, color: isModern ? "#fff" : "#4F46E5", fontFamily: "Inter_700Bold" }}>AK</Text>
            </View>
          </View>
        )}

        <Text style={[
          styles.previewShopName,
          { fontSize: titleFs, textAlign: isModern ? "center" : "left", color: isModern ? "#4F46E5" : "#111827", fontFamily: "Inter_700Bold" },
        ]}>Arjun General Store</Text>

        {showGst && (
          <Text style={[styles.previewMeta, { fontSize: bodyFs, textAlign: isModern ? "center" : "left", color: "#6B7280" }]}>
            GSTIN: 27AAPFU0939F1ZV
          </Text>
        )}

        {headerMsg ? (
          <Text style={[styles.previewMeta, { fontSize: bodyFs - 0.5, textAlign: "center", color: "#9CA3AF", fontStyle: "italic" }]}>
            {headerMsg}
          </Text>
        ) : null}

        {divider}

        {showDateTime && (
          <Text style={[styles.previewMeta, { fontSize: bodyFs, color: "#6B7280" }]}>Date: 13 Apr 2026, 10:32 AM</Text>
        )}
        {showCustomer && (
          <Text style={[styles.previewMeta, { fontSize: bodyFs, color: "#374151" }]}>Customer: Ramesh Gupta</Text>
        )}
        {showCashier && (
          <Text style={[styles.previewMeta, { fontSize: bodyFs, color: "#374151" }]}>Cashier: Arjun Kumar</Text>
        )}
        {showPayMode && (
          <Text style={[styles.previewMeta, { fontSize: bodyFs, color: "#374151" }]}>Payment: UPI</Text>
        )}

        {divider}

        {/* Items */}
        <View style={{ gap: 3 }}>
          {[
            { name: "Basmati Rice",    qty: "5 kg",  amt: "₹2,495" },
            { name: "Mixed Dry Fruits",qty: "500 g",  amt: "₹450"   },
          ].map((item) => (
            <View key={item.name} style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.previewMeta, { fontSize: bodyFs, color: "#111827", fontFamily: "Inter_500Medium" }]} numberOfLines={1}>{item.name}</Text>
                {isDetailed && (
                  <Text style={[styles.previewMeta, { fontSize: bodyFs - 1, color: "#9CA3AF" }]}>{item.qty} × ₹499</Text>
                )}
              </View>
              <Text style={[styles.previewMeta, { fontSize: bodyFs, color: "#111827", fontFamily: "Inter_600SemiBold" }]}>{item.amt}</Text>
            </View>
          ))}
        </View>

        {divider}

        {/* Totals */}
        <View style={{ gap: 2 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={[styles.previewMeta, { fontSize: bodyFs, color: "#6B7280" }]}>Subtotal</Text>
            <Text style={[styles.previewMeta, { fontSize: bodyFs, color: "#374151" }]}>₹2,945</Text>
          </View>
          {showGst && (
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={[styles.previewMeta, { fontSize: bodyFs, color: "#6B7280" }]}>GST (5%)</Text>
              <Text style={[styles.previewMeta, { fontSize: bodyFs, color: "#F59E0B" }]}>₹147</Text>
            </View>
          )}
          {isDetailed && (
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={[styles.previewMeta, { fontSize: bodyFs, color: "#6B7280" }]}>  CGST 2.5%</Text>
              <Text style={[styles.previewMeta, { fontSize: bodyFs, color: "#F59E0B" }]}>₹74</Text>
            </View>
          )}
          {isDetailed && (
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={[styles.previewMeta, { fontSize: bodyFs, color: "#6B7280" }]}>  SGST 2.5%</Text>
              <Text style={[styles.previewMeta, { fontSize: bodyFs, color: "#F59E0B" }]}>₹73</Text>
            </View>
          )}
        </View>

        <View style={[styles.previewTotal, {
          backgroundColor: isModern ? "#4F46E508" : isThermal ? "transparent" : "#F9FAFB",
          borderColor: isModern ? "#4F46E520" : "#E5E7EB",
          borderTopWidth: isThermal ? 0 : 1,
          marginTop: 4, paddingTop: 6,
        }]}>
          <Text style={[styles.previewMeta, { fontSize: bodyFs + 1, color: "#111827", fontFamily: "Inter_700Bold" }]}>TOTAL</Text>
          <Text style={[styles.previewMeta, { fontSize: bodyFs + 2, color: "#4F46E5", fontFamily: "Inter_700Bold" }]}>₹3,092</Text>
        </View>

        {/* QR code placeholder */}
        {showQr && (
          <View style={{ alignItems: "center", marginTop: 4 }}>
            <View style={styles.previewQr}>
              {[0, 1, 2].map(r => (
                <View key={r} style={{ flexDirection: "row", gap: 1 }}>
                  {[0, 1, 2, 3, 4, 5].map(c => (
                    <View key={c} style={{ width: 4, height: 4, backgroundColor: Math.random() > 0.4 ? "#111827" : "#fff" }} />
                  ))}
                </View>
              ))}
              <View style={{ width: 28, height: 28, position: "absolute", backgroundColor: "#fff", top: 8, left: 8, borderWidth: 1, borderColor: "#111827" }} />
            </View>
            <Text style={[styles.previewMeta, { fontSize: 7, color: "#9CA3AF", marginTop: 2 }]}>Scan to verify</Text>
          </View>
        )}

        {/* Thank you */}
        {showThankYou && (
          <Text style={[styles.previewMeta, { fontSize: bodyFs, textAlign: "center", color: "#6B7280", fontStyle: "italic", marginTop: 2 }]}>
            Thank you for shopping!
          </Text>
        )}

        {footerMsg ? (
          <Text style={[styles.previewMeta, { fontSize: bodyFs - 0.5, textAlign: "center", color: "#9CA3AF" }]}>
            {footerMsg}
          </Text>
        ) : null}

        {/* Powered by strip */}
        <Text style={[styles.previewMeta, { fontSize: 7, textAlign: "center", color: "#D1D5DB", marginTop: 4 }]}>
          Powered by POSify
        </Text>
      </View>
    </View>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────

function SectionCard({ icon, iconColor = "#4F46E5", title, children }: {
  icon: string; iconColor?: string; title: string; children: React.ReactNode;
}) {
  const colors = useColors();
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.cardHeader}>
        <View style={[styles.cardIconBox, { backgroundColor: iconColor + "18" }]}>
          <Feather name={icon as any} size={15} color={iconColor} />
        </View>
        <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>{title}</Text>
      </View>
      <View style={{ gap: 0 }}>{children}</View>
    </View>
  );
}

function ToggleRow({ label, sub, value, onValueChange, colors }: {
  label: string; sub?: string; value: boolean;
  onValueChange: (v: boolean) => void; colors: any;
}) {
  return (
    <View style={[styles.toggleRow, { borderTopColor: colors.border }]}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.toggleLabel, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>{label}</Text>
        {sub && <Text style={[styles.toggleSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{sub}</Text>}
      </View>
      <Switch value={value} onValueChange={onValueChange}
        trackColor={{ true: "#4F46E5", false: colors.border }} thumbColor="#fff" />
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

const TEMPLATES: { id: Template; label: string; desc: string; icon: string; color: string }[] = [
  { id: "classic",  label: "Classic",  desc: "Clean & minimal",      icon: "file-text",  color: "#6B7280" },
  { id: "modern",   label: "Modern",   desc: "Logo & coloured header",icon: "layout",     color: "#4F46E5" },
  { id: "thermal",  label: "Thermal",  desc: "Dotted dividers",       icon: "printer",    color: "#10B981" },
  { id: "detailed", label: "Detailed", desc: "Full GST breakdown",    icon: "list",       color: "#F59E0B" },
];

const PAPER_SIZES: PaperSize[] = ["58mm", "80mm", "A5", "A4"];
const PAPER_DESCS: Record<PaperSize, string> = {
  "58mm": "Small thermal",
  "80mm": "Std thermal",
  "A5":   "Half A4",
  "A4":   "Full page",
};

const FONT_SIZES: { id: FontSize; label: string }[] = [
  { id: "small",  label: "Small"  },
  { id: "medium", label: "Medium" },
  { id: "large",  label: "Large"  },
];

const PRINTER_CONNS: { id: PrinterConn; label: string; icon: string; color: string }[] = [
  { id: "none",      label: "None (Digital)",  icon: "smartphone",  color: "#6B7280" },
  { id: "bluetooth", label: "Bluetooth",       icon: "bluetooth",   color: "#4F46E5" },
  { id: "wifi",      label: "Wi-Fi / LAN",     icon: "wifi",        color: "#10B981" },
  { id: "usb",       label: "USB",             icon: "hard-drive",  color: "#8B5CF6" },
];

export default function ReceiptSettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 24 : insets.bottom + 16;

  // Template
  const [template,   setTemplate]   = useState<Template>("modern");
  // Paper & font
  const [paperSize,  setPaperSize]  = useState<PaperSize>("80mm");
  const [fontSize,   setFontSize]   = useState<FontSize>("medium");
  // Content toggles
  const [showLogo,     setShowLogo]     = useState(true);
  const [showGst,      setShowGst]      = useState(true);
  const [showCustomer, setShowCustomer] = useState(true);
  const [showCashier,  setShowCashier]  = useState(false);
  const [showDateTime, setShowDateTime] = useState(true);
  const [showPayMode,  setShowPayMode]  = useState(true);
  const [showQr,       setShowQr]       = useState(false);
  const [showThankYou, setShowThankYou] = useState(true);
  // Messages
  const [headerMsg, setHeaderMsg] = useState("Quality you can trust");
  const [footerMsg, setFooterMsg] = useState("Visit again · Powered by POSify");
  // Copies
  const [copies, setCopies] = useState(1);
  // Printer
  const [printerConn, setPrinterConn] = useState<PrinterConn>("bluetooth");
  const [btDevice,    setBtDevice]    = useState("Epson TM-T20III");
  const [wifiIp,      setWifiIp]      = useState("192.168.1.100");
  const [wifiPort,    setWifiPort]    = useState("9100");
  // Digital
  const [autoWhatsApp, setAutoWhatsApp] = useState(false);
  const [autoEmail,    setAutoEmail]    = useState(false);
  const [autoPrint,    setAutoPrint]    = useState(true);

  const handleTestPrint = () => {
    Alert.alert("Test Print", `Sending test print via ${printerConn === "bluetooth" ? `Bluetooth (${btDevice})` : printerConn === "wifi" ? `Wi-Fi ${wifiIp}:${wifiPort}` : printerConn}…`, [{ text: "OK" }]);
  };

  const handleSave = () => {
    Alert.alert("Saved", "Receipt settings updated successfully.", [{ text: "OK" }]);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={[styles.root, { backgroundColor: colors.background }]}>

        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.primary, paddingTop: topPad + 8 }]}>
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
            <Feather name="arrow-left" size={20} color="#fff" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, { fontFamily: "Inter_700Bold" }]}>Receipt Settings</Text>
            <Text style={[styles.headerSub, { fontFamily: "Inter_400Regular" }]}>Template, printer & content</Text>
          </View>
          <TouchableOpacity onPress={handleSave} style={[styles.saveBtn, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
            <Text style={[styles.saveBtnText, { fontFamily: "Inter_700Bold" }]}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: botPad + 40 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          {/* ── Live Preview ── */}
          <View style={[styles.previewSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIconBox, { backgroundColor: "#4F46E518" }]}>
                <Feather name="eye" size={15} color="#4F46E5" />
              </View>
              <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Live Preview</Text>
              <View style={[styles.liveDot, { backgroundColor: "#10B981" }]} />
              <Text style={[styles.liveText, { color: "#10B981", fontFamily: "Inter_500Medium" }]}>Live</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={{ justifyContent: "center", paddingVertical: 8 }}>
              <ReceiptPreview
                template={template} showLogo={showLogo} showGst={showGst}
                showCustomer={showCustomer} showCashier={showCashier}
                showDateTime={showDateTime} showPayMode={showPayMode}
                showQr={showQr} showThankYou={showThankYou}
                headerMsg={headerMsg} footerMsg={footerMsg}
                paperSize={paperSize} fontSize={fontSize} colors={colors}
              />
            </ScrollView>
          </View>

          {/* ── Template Selector ── */}
          <SectionCard icon="layout" iconColor="#8B5CF6" title="Receipt Template">
            <View style={{ gap: 10, paddingTop: 4 }}>
              {TEMPLATES.map(t => (
                <TouchableOpacity
                  key={t.id}
                  style={[
                    styles.templateRow,
                    {
                      backgroundColor: template === t.id ? t.color + "10" : colors.background,
                      borderColor:     template === t.id ? t.color : colors.border,
                    },
                  ]}
                  onPress={() => setTemplate(t.id)}
                  activeOpacity={0.75}
                >
                  <View style={[styles.templateIcon, { backgroundColor: t.color + "18" }]}>
                    <Feather name={t.icon as any} size={16} color={t.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.templateLabel, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>{t.label}</Text>
                    <Text style={[styles.templateDesc, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{t.desc}</Text>
                  </View>
                  <View style={[styles.radioOuter, { borderColor: template === t.id ? t.color : colors.border }]}>
                    {template === t.id && <View style={[styles.radioInner, { backgroundColor: t.color }]} />}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </SectionCard>

          {/* ── Paper Size & Font ── */}
          <SectionCard icon="maximize" iconColor="#06B6D4" title="Paper Size & Font">
            {/* Paper size */}
            <View style={{ gap: 6, paddingTop: 4, marginBottom: 14 }}>
              <Text style={[styles.subLabel, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>Paper Width</Text>
              <View style={styles.chipRow}>
                {PAPER_SIZES.map(p => (
                  <TouchableOpacity
                    key={p}
                    style={[
                      styles.paperChip,
                      { backgroundColor: paperSize === p ? "#06B6D4" : colors.muted, borderColor: paperSize === p ? "#06B6D4" : colors.border },
                    ]}
                    onPress={() => setPaperSize(p)}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.paperChipSize, { color: paperSize === p ? "#fff" : colors.foreground, fontFamily: "Inter_700Bold" }]}>{p}</Text>
                    <Text style={[styles.paperChipDesc, { color: paperSize === p ? "rgba(255,255,255,0.8)" : colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{PAPER_DESCS[p]}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Font size */}
            <View style={{ gap: 6, marginBottom: 4 }}>
              <Text style={[styles.subLabel, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>Font Size</Text>
              <View style={[styles.segmentBar, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                {FONT_SIZES.map(f => (
                  <TouchableOpacity
                    key={f.id}
                    style={[styles.segment, fontSize === f.id && { backgroundColor: colors.card }]}
                    onPress={() => setFontSize(f.id)}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.segmentText, {
                      color: fontSize === f.id ? colors.primary : colors.mutedForeground,
                      fontFamily: fontSize === f.id ? "Inter_700Bold" : "Inter_400Regular",
                      fontSize: f.id === "small" ? 11 : f.id === "large" ? 15 : 13,
                    }]}>{f.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Copies */}
            <View style={[styles.toggleRow, { borderTopColor: colors.border, marginTop: 10 }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.toggleLabel, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>Print Copies</Text>
                <Text style={[styles.toggleSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Number of copies per sale</Text>
              </View>
              <View style={[styles.stepperRow, { borderColor: colors.border }]}>
                <TouchableOpacity style={styles.stepperBtn} onPress={() => setCopies(Math.max(1, copies - 1))}>
                  <Feather name="minus" size={14} color={copies > 1 ? colors.primary : colors.mutedForeground} />
                </TouchableOpacity>
                <Text style={[styles.stepperVal, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>{copies}</Text>
                <TouchableOpacity style={styles.stepperBtn} onPress={() => setCopies(Math.min(5, copies + 1))}>
                  <Feather name="plus" size={14} color={copies < 5 ? colors.primary : colors.mutedForeground} />
                </TouchableOpacity>
              </View>
            </View>
          </SectionCard>

          {/* ── Content Toggles ── */}
          <SectionCard icon="sliders" iconColor="#EC4899" title="Receipt Content">
            {[
              { label: "Store Logo",      sub: "Show logo at top of receipt",         val: showLogo,     set: setShowLogo     },
              { label: "GST Number",      sub: "Print GSTIN on receipt",              val: showGst,      set: setShowGst      },
              { label: "Customer Name",   sub: "Personalise with buyer's name",       val: showCustomer, set: setShowCustomer },
              { label: "Cashier Name",    sub: "Name of staff who processed sale",    val: showCashier,  set: setShowCashier  },
              { label: "Date & Time",     sub: "Transaction date and time",           val: showDateTime, set: setShowDateTime },
              { label: "Payment Mode",    sub: "Cash / UPI / Card / Credit",          val: showPayMode,  set: setShowPayMode  },
              { label: "QR Code",         sub: "QR for digital verification",         val: showQr,       set: setShowQr       },
              { label: "Thank You Note",  sub: "Print thank you at the bottom",       val: showThankYou, set: setShowThankYou },
            ].map(item => (
              <ToggleRow key={item.label} label={item.label} sub={item.sub}
                value={item.val} onValueChange={item.set} colors={colors} />
            ))}
          </SectionCard>

          {/* ── Header & Footer Text ── */}
          <SectionCard icon="edit-3" iconColor="#F59E0B" title="Header & Footer Text">
            <View style={{ gap: 12, paddingTop: 6 }}>
              <View style={{ gap: 6 }}>
                <Text style={[styles.subLabel, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>Header Message</Text>
                <TextInput
                  style={[styles.textField, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground, fontFamily: "Inter_400Regular" }]}
                  value={headerMsg}
                  onChangeText={setHeaderMsg}
                  placeholder="Tagline printed under store name"
                  placeholderTextColor={colors.mutedForeground}
                  maxLength={80}
                />
              </View>
              <View style={{ gap: 6 }}>
                <Text style={[styles.subLabel, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>Footer Message</Text>
                <TextInput
                  style={[styles.textField, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground, fontFamily: "Inter_400Regular", height: 60, textAlignVertical: "top", paddingTop: 10 }]}
                  value={footerMsg}
                  onChangeText={setFooterMsg}
                  placeholder="Message at the very bottom"
                  placeholderTextColor={colors.mutedForeground}
                  multiline
                  maxLength={120}
                />
                <Text style={[styles.charCount, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{footerMsg.length}/120</Text>
              </View>
            </View>
          </SectionCard>

          {/* ── Printer Connection ── */}
          <SectionCard icon="printer" iconColor="#4F46E5" title="Printer Connection">
            <View style={{ gap: 8, paddingTop: 4, marginBottom: 10 }}>
              {PRINTER_CONNS.map(pc => (
                <TouchableOpacity
                  key={pc.id}
                  style={[
                    styles.printerRow,
                    { backgroundColor: printerConn === pc.id ? pc.color + "10" : colors.background, borderColor: printerConn === pc.id ? pc.color : colors.border },
                  ]}
                  onPress={() => setPrinterConn(pc.id)}
                  activeOpacity={0.75}
                >
                  <View style={[styles.printerIcon, { backgroundColor: pc.color + "18" }]}>
                    <Feather name={pc.icon as any} size={15} color={pc.color} />
                  </View>
                  <Text style={[styles.printerLabel, { color: colors.foreground, fontFamily: printerConn === pc.id ? "Inter_700Bold" : "Inter_500Medium" }]}>{pc.label}</Text>
                  <View style={[styles.radioOuter, { borderColor: printerConn === pc.id ? pc.color : colors.border }]}>
                    {printerConn === pc.id && <View style={[styles.radioInner, { backgroundColor: pc.color }]} />}
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Bluetooth config */}
            {printerConn === "bluetooth" && (
              <View style={[styles.connConfig, { backgroundColor: "#4F46E508", borderColor: "#4F46E520" }]}>
                <Feather name="bluetooth" size={13} color="#4F46E5" />
                <Text style={[styles.connConfigTitle, { color: "#4F46E5", fontFamily: "Inter_600SemiBold" }]}>Paired Device</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.connConfigVal, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>{btDevice || "No device paired"}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.connBtn, { backgroundColor: "#4F46E5" }]}
                  onPress={() => Alert.alert("Scan Devices", "Bluetooth scanning is available on mobile devices.")}
                >
                  <Text style={[styles.connBtnText, { fontFamily: "Inter_700Bold" }]}>Scan</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Wi-Fi config */}
            {printerConn === "wifi" && (
              <View style={[styles.connConfig, { backgroundColor: "#10B98108", borderColor: "#10B98120", flexDirection: "column", alignItems: "stretch", gap: 8 }]}>
                <Text style={[styles.connConfigTitle, { color: "#10B981", fontFamily: "Inter_600SemiBold" }]}>Printer IP Address</Text>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <TextInput
                    style={[styles.textField, { flex: 2, backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground, fontFamily: "Inter_400Regular" }]}
                    value={wifiIp}
                    onChangeText={setWifiIp}
                    placeholder="192.168.1.100"
                    placeholderTextColor={colors.mutedForeground}
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={[styles.textField, { flex: 1, backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground, fontFamily: "Inter_400Regular" }]}
                    value={wifiPort}
                    onChangeText={setWifiPort}
                    placeholder="9100"
                    placeholderTextColor={colors.mutedForeground}
                    keyboardType="numeric"
                  />
                </View>
                <TouchableOpacity
                  style={[styles.connBtn, { backgroundColor: "#10B981", alignSelf: "flex-start", paddingHorizontal: 16 }]}
                  onPress={() => Alert.alert("Testing Connection", `Pinging ${wifiIp}:${wifiPort}…`)}
                >
                  <Text style={[styles.connBtnText, { fontFamily: "Inter_700Bold" }]}>Test Connection</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* USB placeholder */}
            {printerConn === "usb" && (
              <View style={[styles.connConfig, { backgroundColor: "#8B5CF608", borderColor: "#8B5CF620" }]}>
                <Feather name="hard-drive" size={13} color="#8B5CF6" />
                <Text style={[styles.connConfigVal, { color: "#8B5CF6", fontFamily: "Inter_500Medium" }]}>Connect via USB cable and enable printing in device settings.</Text>
              </View>
            )}

            {/* Test Print */}
            {printerConn !== "none" && (
              <TouchableOpacity
                style={[styles.testPrintBtn, { backgroundColor: colors.muted, borderColor: colors.border }]}
                onPress={handleTestPrint}
                activeOpacity={0.75}
              >
                <Feather name="printer" size={15} color={colors.primary} />
                <Text style={[styles.testPrintText, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>Send Test Print</Text>
              </TouchableOpacity>
            )}
          </SectionCard>

          {/* ── Digital & Auto-Send ── */}
          <SectionCard icon="send" iconColor="#10B981" title="Digital Receipt & Auto-Send">
            <ToggleRow
              label="Auto-Print on Sale" sub="Print receipt automatically after each sale"
              value={autoPrint} onValueChange={setAutoPrint} colors={colors}
            />
            <ToggleRow
              label="WhatsApp Receipt" sub="Send digital receipt via WhatsApp"
              value={autoWhatsApp} onValueChange={setAutoWhatsApp} colors={colors}
            />
            <ToggleRow
              label="Email Receipt" sub="Send PDF receipt to customer email"
              value={autoEmail} onValueChange={setAutoEmail} colors={colors}
            />
          </SectionCard>

          {/* Save button */}
          <TouchableOpacity
            style={[styles.saveLargeBtn, { backgroundColor: colors.primary }]}
            onPress={handleSave}
            activeOpacity={0.85}
          >
            <Feather name="check" size={18} color="#fff" />
            <Text style={[styles.saveLargeBtnText, { fontFamily: "Inter_700Bold" }]}>Save Receipt Settings</Text>
          </TouchableOpacity>

          <Text style={[styles.hint, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            Settings apply to all new sales receipts
          </Text>

        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root:          { flex: 1 },
  header:        { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 14, gap: 12 },
  headerTitle:   { color: "#fff", fontSize: 20 },
  headerSub:     { color: "rgba(255,255,255,0.75)", fontSize: 12, marginTop: 1 },
  saveBtn:       { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10 },
  saveBtnText:   { color: "#fff", fontSize: 14 },

  content:       { padding: 16, gap: 16 },

  card:          { borderRadius: 14, borderWidth: 1, padding: 14, gap: 12 },
  cardHeader:    { flexDirection: "row", alignItems: "center", gap: 10 },
  cardIconBox:   { width: 30, height: 30, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  cardTitle:     { fontSize: 15, flex: 1 },
  liveDot:       { width: 7, height: 7, borderRadius: 4 },
  liveText:      { fontSize: 12 },

  previewSection:{ borderRadius: 14, borderWidth: 1, padding: 14, gap: 8 },

  previewOuter:  { borderRadius: 6, borderWidth: 1, overflow: "hidden", shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  previewShopName:{ marginBottom: 1 },
  previewMeta:   { lineHeight: 14 },
  previewLogo:   { width: 22, height: 22, borderRadius: 5, alignItems: "center", justifyContent: "center" },
  previewQr:     { width: 44, height: 44, backgroundColor: "#fff", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 2, overflow: "hidden", padding: 2, gap: 1 },
  previewTotal:  { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 4 },

  subLabel:      { fontSize: 12 },
  chipRow:       { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  paperChip:     { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, alignItems: "center", minWidth: 64 },
  paperChipSize: { fontSize: 13 },
  paperChipDesc: { fontSize: 10, marginTop: 2 },

  segmentBar:    { flexDirection: "row", borderRadius: 10, borderWidth: 1, padding: 3, gap: 3 },
  segment:       { flex: 1, paddingVertical: 9, alignItems: "center", borderRadius: 8 },
  segmentText:   {},

  toggleRow:     { flexDirection: "row", alignItems: "center", gap: 12, borderTopWidth: 1, paddingVertical: 12 },
  toggleLabel:   { fontSize: 14 },
  toggleSub:     { fontSize: 12, marginTop: 1 },

  stepperRow:    { flexDirection: "row", alignItems: "center", borderRadius: 10, borderWidth: 1, overflow: "hidden" },
  stepperBtn:    { paddingHorizontal: 10, paddingVertical: 7 },
  stepperVal:    { fontSize: 15, paddingHorizontal: 10 },

  templateRow:   { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 12, borderWidth: 1.5, padding: 12 },
  templateIcon:  { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  templateLabel: { fontSize: 14 },
  templateDesc:  { fontSize: 12, marginTop: 1 },
  radioOuter:    { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  radioInner:    { width: 10, height: 10, borderRadius: 5 },

  printerRow:    { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 10, borderWidth: 1.5, paddingHorizontal: 12, paddingVertical: 10 },
  printerIcon:   { width: 32, height: 32, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  printerLabel:  { flex: 1, fontSize: 14 },

  connConfig:    { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 10, borderWidth: 1, padding: 12, marginTop: 4 },
  connConfigTitle:{ fontSize: 12, marginRight: 4 },
  connConfigVal: { fontSize: 13 },
  connBtn:       { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  connBtnText:   { color: "#fff", fontSize: 12 },

  testPrintBtn:  { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 10, borderWidth: 1, paddingVertical: 12, marginTop: 8 },
  testPrintText: { fontSize: 14 },

  textField:     { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  charCount:     { fontSize: 11, textAlign: "right" },

  saveLargeBtn:      { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, height: 54, borderRadius: 14 },
  saveLargeBtnText:  { color: "#fff", fontSize: 16 },
  hint:              { fontSize: 12, textAlign: "center" },
});
