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

// ── helpers ──────────────────────────────────────────────────────────────────

function SectionCard({
  icon, iconColor = "#4F46E5", title, children,
}: {
  icon: string; iconColor?: string; title: string; children: React.ReactNode;
}) {
  const colors = useColors();
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.cardHeader}>
        <View style={[styles.cardIcon, { backgroundColor: iconColor + "18" }]}>
          <Feather name={icon as any} size={15} color={iconColor} />
        </View>
        <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>{title}</Text>
      </View>
      <View style={{ gap: 14 }}>{children}</View>
    </View>
  );
}

function Field({
  label, value, onChangeText, placeholder, keyboardType = "default",
  autoCapitalize = "words", multiline = false, maxLength,
}: {
  label: string; value: string; onChangeText: (t: string) => void;
  placeholder: string; keyboardType?: any; autoCapitalize?: any;
  multiline?: boolean; maxLength?: number;
}) {
  const colors = useColors();
  return (
    <View style={{ gap: 6 }}>
      <Text style={[styles.label, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground, fontFamily: "Inter_400Regular" },
          multiline && { height: 80, textAlignVertical: "top", paddingTop: 12 },
        ]}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        multiline={multiline}
        maxLength={maxLength}
      />
    </View>
  );
}

function Row2({ children }: { children: React.ReactNode }) {
  return <View style={styles.row2}>{children}</View>;
}

// ── types ─────────────────────────────────────────────────────────────────────

type DayInfo = { day: string; short: string; open: boolean; from: string; to: string };

const STORE_TYPES = [
  "Retail", "Restaurant", "Pharmacy", "Electronics", "Grocery",
  "Clothing", "Jewellery", "Hardware", "General", "Other",
];

const CURRENCIES = [
  { symbol: "₹", code: "INR", label: "Indian Rupee" },
  { symbol: "$", code: "USD", label: "US Dollar"    },
  { symbol: "€", code: "EUR", label: "Euro"         },
  { symbol: "£", code: "GBP", label: "British Pound"},
];

const DATE_FORMATS = ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"];
const TIME_FORMATS = ["12-hour (AM/PM)", "24-hour"];

const DEFAULT_HOURS: DayInfo[] = [
  { day: "Monday",    short: "Mon", open: true,  from: "09:00", to: "21:00" },
  { day: "Tuesday",   short: "Tue", open: true,  from: "09:00", to: "21:00" },
  { day: "Wednesday", short: "Wed", open: true,  from: "09:00", to: "21:00" },
  { day: "Thursday",  short: "Thu", open: true,  from: "09:00", to: "21:00" },
  { day: "Friday",    short: "Fri", open: true,  from: "09:00", to: "22:00" },
  { day: "Saturday",  short: "Sat", open: true,  from: "10:00", to: "22:00" },
  { day: "Sunday",    short: "Sun", open: false, from: "10:00", to: "18:00" },
];

// ── screen ────────────────────────────────────────────────────────────────────

export default function StoreSettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 24 : insets.bottom + 16;

  // Basic info
  const [storeName,    setStoreName]    = useState("Arjun General Store");
  const [storeType,    setStoreType]    = useState("Retail");
  const [description,  setDescription]  = useState("Your one-stop shop for daily essentials");
  const [tagline,      setTagline]      = useState("Quality you can trust");

  // Contact
  const [phone,        setPhone]        = useState("+91 98765 43210");
  const [email,        setEmail]        = useState("store@posify.in");
  const [website,      setWebsite]      = useState("www.arjunstore.in");

  // Address
  const [address,      setAddress]      = useState("12, MG Road, Shivaji Nagar");
  const [city,         setCity]         = useState("Pune");
  const [stateVal,     setStateVal]     = useState("Maharashtra");
  const [pinCode,      setPinCode]      = useState("411001");
  const [country,      setCountry]      = useState("India");

  // Business
  const [gst,          setGst]          = useState("27AAPFU0939F1ZV");
  const [pan,          setPan]          = useState("AAPFU0939F");
  const [vat,          setVat]          = useState("VAT27123456");
  const [fssai,        setFssai]        = useState("");

  // Regional
  const [currency,     setCurrency]     = useState("INR");
  const [dateFormat,   setDateFormat]   = useState("DD/MM/YYYY");
  const [timeFormat,   setTimeFormat]   = useState("12-hour (AM/PM)");
  const [timezone,     setTimezone]     = useState("Asia/Kolkata (IST +5:30)");

  // Receipt
  const [receiptHeader, setReceiptHeader] = useState("Thank you for shopping with us!");
  const [receiptFooter, setReceiptFooter] = useState("Visit again · Powered by IPOS");
  const [showGst,       setShowGst]       = useState(true);
  const [showLogo,      setShowLogo]      = useState(true);

  // Hours
  const [hours, setHours] = useState<DayInfo[]>(DEFAULT_HOURS);

  const [saved, setSaved] = useState(false);

  const toggleDay = (i: number) => {
    setHours((prev) => prev.map((h, idx) => idx === i ? { ...h, open: !h.open } : h));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    Alert.alert("Saved", "Store settings updated successfully.", [{ text: "OK" }]);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={[styles.root, { backgroundColor: colors.background }]}>

        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.primary, paddingTop: topPad + 8 }]}>
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
            <Feather name="arrow-left" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { fontFamily: "Inter_700Bold" }]}>Store Settings</Text>
          <TouchableOpacity onPress={handleSave} style={[styles.saveBtn, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
            <Text style={[styles.saveBtnText, { fontFamily: "Inter_700Bold" }]}>Save</Text>
          </TouchableOpacity>
        </View>

        {/* Saved banner */}
        {saved && (
          <View style={[styles.savedBanner, { backgroundColor: colors.success }]}>
            <Feather name="check-circle" size={15} color="#fff" />
            <Text style={[styles.savedText, { fontFamily: "Inter_600SemiBold" }]}>Settings saved successfully</Text>
          </View>
        )}

        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: botPad + 40 }]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* ── Logo / Avatar ── */}
          <View style={[styles.logoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.logoCircle, { backgroundColor: colors.primary }]}>
              <Text style={[styles.logoInitials, { fontFamily: "Inter_700Bold" }]}>
                {storeName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
              </Text>
              <TouchableOpacity style={[styles.cameraBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Feather name="camera" size={13} color={colors.primary} />
              </TouchableOpacity>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.logoName, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>{storeName || "Store Name"}</Text>
              <Text style={[styles.logoType, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{storeType} · {city || "City"}</Text>
              <TouchableOpacity onPress={() => Alert.alert("Upload Logo", "Coming soon")} activeOpacity={0.7}>
                <Text style={[styles.uploadLink, { color: colors.primary, fontFamily: "Inter_500Medium" }]}>Upload store logo →</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Basic Info ── */}
          <SectionCard icon="home" title="Store Information">
            <Field label="Store Name *" value={storeName} onChangeText={setStoreName} placeholder="Enter store name" />
            <Field label="Description" value={description} onChangeText={setDescription} placeholder="Brief description of your store" multiline />
            <Field label="Tagline" value={tagline} onChangeText={setTagline} placeholder="Your store's tagline" />

            {/* Store type selector */}
            <View style={{ gap: 6 }}>
              <Text style={[styles.label, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>Store Type</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, flexShrink: 0 }}>
                <View style={{ flexDirection: "row", gap: 8, paddingVertical: 2 }}>
                  {STORE_TYPES.map((t) => (
                    <TouchableOpacity
                      key={t}
                      style={[
                        styles.typePill,
                        {
                          backgroundColor: storeType === t ? colors.primary : colors.muted,
                          borderColor:     storeType === t ? colors.primary : colors.border,
                        },
                      ]}
                      onPress={() => setStoreType(t)}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.typePillText,
                        { color: storeType === t ? "#fff" : colors.mutedForeground, fontFamily: storeType === t ? "Inter_700Bold" : "Inter_400Regular" },
                      ]}>
                        {t}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          </SectionCard>

          {/* ── Contact ── */}
          <SectionCard icon="phone" iconColor="#10B981" title="Contact Information">
            <Field label="Phone Number" value={phone} onChangeText={setPhone} placeholder="+91 00000 00000" keyboardType="phone-pad" autoCapitalize="none" />
            <Field label="Email Address" value={email} onChangeText={setEmail} placeholder="store@example.com" keyboardType="email-address" autoCapitalize="none" />
            <Field label="Website" value={website} onChangeText={setWebsite} placeholder="www.yourstore.com" autoCapitalize="none" />
          </SectionCard>

          {/* ── Address ── */}
          <SectionCard icon="map-pin" iconColor="#EF4444" title="Store Address">
            <Field label="Street Address" value={address} onChangeText={setAddress} placeholder="House No., Street, Area" multiline />
            <Row2>
              <View style={{ flex: 1 }}>
                <Field label="City" value={city} onChangeText={setCity} placeholder="City" />
              </View>
              <View style={{ flex: 1 }}>
                <Field label="Pin Code" value={pinCode} onChangeText={(t) => setPinCode(t.replace(/\D/g, "").slice(0, 6))} placeholder="000000" keyboardType="number-pad" />
              </View>
            </Row2>
            <Row2>
              <View style={{ flex: 1 }}>
                <Field label="State" value={stateVal} onChangeText={setStateVal} placeholder="State" />
              </View>
              <View style={{ flex: 1 }}>
                <Field label="Country" value={country} onChangeText={setCountry} placeholder="Country" />
              </View>
            </Row2>
          </SectionCard>

          {/* ── Business Details ── */}
          <SectionCard icon="briefcase" iconColor="#F59E0B" title="Business & Tax Details">
            <Field label="GST Number" value={gst} onChangeText={(t) => setGst(t.toUpperCase())} placeholder="e.g. 27AAPFU0939F1ZV" autoCapitalize="characters" maxLength={15} />
            <Row2>
              <View style={{ flex: 1 }}>
                <Field label="PAN Number" value={pan} onChangeText={(t) => setPan(t.toUpperCase())} placeholder="e.g. AAPFU0939F" autoCapitalize="characters" maxLength={10} />
              </View>
              <View style={{ flex: 1 }}>
                <Field label="VAT Number" value={vat} onChangeText={setVat} placeholder="e.g. VAT27123456" autoCapitalize="characters" />
              </View>
            </Row2>
            <Field label="FSSAI Number (Food Business)" value={fssai} onChangeText={setFssai} placeholder="14-digit FSSAI licence" keyboardType="number-pad" maxLength={14} />
          </SectionCard>

          {/* ── Currency & Regional ── */}
          <SectionCard icon="globe" iconColor="#06B6D4" title="Currency & Regional">
            {/* Currency chips */}
            <View style={{ gap: 6 }}>
              <Text style={[styles.label, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>Currency</Text>
              <View style={styles.chipRow}>
                {CURRENCIES.map((c) => (
                  <TouchableOpacity
                    key={c.code}
                    style={[styles.chip, { backgroundColor: currency === c.code ? colors.primary : colors.muted, borderColor: currency === c.code ? colors.primary : colors.border }]}
                    onPress={() => setCurrency(c.code)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.chipSymbol, { color: currency === c.code ? "#fff" : colors.foreground, fontFamily: "Inter_700Bold" }]}>{c.symbol}</Text>
                    <Text style={[styles.chipCode, { color: currency === c.code ? "rgba(255,255,255,0.85)" : colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{c.code}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Date format */}
            <View style={{ gap: 6 }}>
              <Text style={[styles.label, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>Date Format</Text>
              <View style={styles.chipRow}>
                {DATE_FORMATS.map((f) => (
                  <TouchableOpacity
                    key={f}
                    style={[styles.chipWide, { backgroundColor: dateFormat === f ? colors.primary : colors.muted, borderColor: dateFormat === f ? colors.primary : colors.border }]}
                    onPress={() => setDateFormat(f)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.chipWideText, { color: dateFormat === f ? "#fff" : colors.mutedForeground, fontFamily: dateFormat === f ? "Inter_700Bold" : "Inter_400Regular" }]}>{f}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Time format */}
            <View style={{ gap: 6 }}>
              <Text style={[styles.label, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>Time Format</Text>
              <View style={[styles.segmentBar, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                {TIME_FORMATS.map((f) => (
                  <TouchableOpacity
                    key={f}
                    style={[styles.segment, timeFormat === f && { backgroundColor: colors.card }]}
                    onPress={() => setTimeFormat(f)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.segmentText, { color: timeFormat === f ? colors.primary : colors.mutedForeground, fontFamily: timeFormat === f ? "Inter_700Bold" : "Inter_400Regular" }]}>{f}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Field label="Time Zone" value={timezone} onChangeText={setTimezone} placeholder="Asia/Kolkata (IST +5:30)" autoCapitalize="none" />
          </SectionCard>

          {/* ── Receipt Settings ── */}
          <SectionCard icon="printer" iconColor="#8B5CF6" title="Receipt Settings">
            <Field label="Receipt Header" value={receiptHeader} onChangeText={setReceiptHeader} placeholder="Message shown at top of receipt" multiline />
            <Field label="Receipt Footer" value={receiptFooter} onChangeText={setReceiptFooter} placeholder="Message shown at bottom" multiline />

            <View style={[styles.toggleRow, { borderTopColor: colors.border, borderTopWidth: 1, paddingTop: 12 }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.toggleLabel, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>Show GST on Receipt</Text>
                <Text style={[styles.toggleSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Print GST breakdown on every bill</Text>
              </View>
              <Switch value={showGst} onValueChange={setShowGst} trackColor={{ true: colors.primary, false: colors.border }} thumbColor="#fff" />
            </View>
            <View style={[styles.toggleRow, { borderTopColor: colors.border, borderTopWidth: 1, paddingTop: 12 }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.toggleLabel, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>Show Store Logo</Text>
                <Text style={[styles.toggleSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Print logo at the top of receipt</Text>
              </View>
              <Switch value={showLogo} onValueChange={setShowLogo} trackColor={{ true: colors.primary, false: colors.border }} thumbColor="#fff" />
            </View>
          </SectionCard>

          {/* ── Operating Hours ── */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIcon, { backgroundColor: "#06B6D418" }]}>
                <Feather name="clock" size={15} color="#06B6D4" />
              </View>
              <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Operating Hours</Text>
            </View>

            {hours.map((h, i) => (
              <View key={h.day} style={[styles.hourRow, { borderTopColor: colors.border, borderTopWidth: i === 0 ? 0 : 1 }]}>
                <View style={styles.hourDay}>
                  <Switch
                    value={h.open}
                    onValueChange={() => toggleDay(i)}
                    trackColor={{ true: colors.primary, false: colors.border }}
                    thumbColor="#fff"
                    style={{ transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }] }}
                  />
                  <Text style={[styles.hourDayText, { color: h.open ? colors.foreground : colors.mutedForeground, fontFamily: h.open ? "Inter_600SemiBold" : "Inter_400Regular" }]}>
                    {h.short}
                  </Text>
                </View>
                {h.open ? (
                  <View style={styles.hourTimes}>
                    <View style={[styles.timeChip, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                      <Feather name="sunrise" size={11} color={colors.mutedForeground} />
                      <Text style={[styles.timeText, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>{h.from}</Text>
                    </View>
                    <Text style={[styles.timeSep, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>–</Text>
                    <View style={[styles.timeChip, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                      <Feather name="sunset" size={11} color={colors.mutedForeground} />
                      <Text style={[styles.timeText, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>{h.to}</Text>
                    </View>
                  </View>
                ) : (
                  <Text style={[styles.closedText, { color: colors.destructive, fontFamily: "Inter_400Regular" }]}>Closed</Text>
                )}
              </View>
            ))}
          </View>

          {/* ── Save button ── */}
          <TouchableOpacity
            style={[styles.saveLargeBtn, { backgroundColor: colors.primary }]}
            onPress={handleSave}
            activeOpacity={0.85}
          >
            <Feather name="check" size={18} color="#fff" />
            <Text style={[styles.saveLargeBtnText, { fontFamily: "Inter_700Bold" }]}>Save Changes</Text>
          </TouchableOpacity>

          <Text style={[styles.hint, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            Changes apply to all new sales and invoices
          </Text>

        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root:          { flex: 1 },
  header:        { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 14, gap: 12 },
  headerTitle:   { color: "#fff", fontSize: 20, flex: 1 },
  saveBtn:       { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10 },
  saveBtnText:   { color: "#fff", fontSize: 14 },

  savedBanner:   { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingVertical: 10 },
  savedText:     { color: "#fff", fontSize: 13 },

  content:       { padding: 16, gap: 16 },

  logoCard:      { flexDirection: "row", alignItems: "center", gap: 16, borderRadius: 14, borderWidth: 1, padding: 14 },
  logoCircle:    { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center", position: "relative" },
  logoInitials:  { color: "#fff", fontSize: 24 },
  cameraBtn:     { position: "absolute", bottom: 0, right: 0, width: 24, height: 24, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  logoName:      { fontSize: 16, marginBottom: 2 },
  logoType:      { fontSize: 12, marginBottom: 4 },
  uploadLink:    { fontSize: 12 },

  card:          { borderRadius: 14, borderWidth: 1, padding: 14, gap: 14 },
  cardHeader:    { flexDirection: "row", alignItems: "center", gap: 10 },
  cardIcon:      { width: 30, height: 30, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  cardTitle:     { fontSize: 15 },

  label:         { fontSize: 12 },
  input:         { borderRadius: 10, borderWidth: 1, height: 46, paddingHorizontal: 12, fontSize: 14 },
  row2:          { flexDirection: "row", gap: 12 },

  typePill:      { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  typePillText:  { fontSize: 13 },

  chipRow:       { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  chip:          { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, borderWidth: 1, alignItems: "center", minWidth: 64 },
  chipSymbol:    { fontSize: 16 },
  chipCode:      { fontSize: 11 },
  chipWide:      { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  chipWideText:  { fontSize: 13 },

  segmentBar:    { flexDirection: "row", borderRadius: 10, borderWidth: 1, padding: 3, gap: 3 },
  segment:       { flex: 1, paddingVertical: 9, alignItems: "center", borderRadius: 8 },
  segmentText:   { fontSize: 13 },

  toggleRow:     { flexDirection: "row", alignItems: "center", gap: 12 },
  toggleLabel:   { fontSize: 14 },
  toggleSub:     { fontSize: 12, marginTop: 1 },

  hourRow:       { flexDirection: "row", alignItems: "center", paddingVertical: 10, gap: 10 },
  hourDay:       { flexDirection: "row", alignItems: "center", gap: 6, width: 80 },
  hourDayText:   { fontSize: 13 },
  hourTimes:     { flex: 1, flexDirection: "row", alignItems: "center", gap: 6 },
  timeChip:      { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1 },
  timeText:      { fontSize: 13 },
  timeSep:       { fontSize: 13 },
  closedText:    { fontSize: 13, flex: 1 },

  saveLargeBtn:  { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, height: 54, borderRadius: 14 },
  saveLargeBtnText: { color: "#fff", fontSize: 16 },
  hint:          { fontSize: 12, textAlign: "center" },
});
