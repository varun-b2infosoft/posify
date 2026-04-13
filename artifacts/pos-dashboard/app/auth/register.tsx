import React, { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { loginUser, AuthUser } from "@/store/auth";

const DEMO_OTP = "1234";

type Step = "phone" | "otp" | "details";

const STEP_LABELS: Record<Step, string> = {
  phone:   "Mobile Verification",
  otp:     "Verify OTP",
  details: "Business Details",
};

function OtpBoxes({ value, onPress }: { value: string; onPress: () => void }) {
  const colors = useColors();
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={1}>
      <View style={styles.otpRow}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={[
              styles.otpBox,
              {
                borderColor: value.length === i ? colors.primary : value.length > i ? colors.primary : colors.border,
                backgroundColor: colors.card,
              },
            ]}
          >
            <Text style={[styles.otpDigit, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
              {value[i] ? "●" : ""}
            </Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
}

function FieldInput({
  label, placeholder, value, onChangeText, keyboardType = "default", autoCapitalize = "words",
}: {
  label: string; placeholder: string; value: string;
  onChangeText: (t: string) => void; keyboardType?: any; autoCapitalize?: any;
}) {
  const colors = useColors();
  return (
    <View style={{ gap: 6 }}>
      <Text style={[styles.fieldLabel, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>{label}</Text>
      <View style={[styles.fieldInput, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <TextInput
          style={[styles.fieldText, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
          placeholder={placeholder}
          placeholderTextColor={colors.mutedForeground}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
        />
      </View>
    </View>
  );
}

export default function RegisterScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 60 : insets.top;
  const botPad = Platform.OS === "web" ? 24 : insets.bottom;

  const [step, setStep]     = useState<Step>("phone");
  const [phone, setPhone]   = useState("");
  const [otp, setOtp]       = useState("");
  const [timer, setTimer]   = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [error, setError]   = useState("");
  const hiddenRef = useRef<TextInput>(null);

  // Details form fields
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [address,  setAddress]  = useState("");
  const [state,    setState]    = useState("");
  const [district, setDistrict] = useState("");
  const [city,     setCity]     = useState("");
  const [shopName, setShopName] = useState("");
  const [gst,      setGst]      = useState("");
  const [pan,      setPan]      = useState("");
  const [vat,      setVat]      = useState("");

  const stepIndex: Record<Step, number> = { phone: 0, otp: 1, details: 2 };

  useEffect(() => {
    if (step !== "otp") return;
    setTimer(30); setCanResend(false);
    const id = setInterval(() => {
      setTimer((t) => { if (t <= 1) { clearInterval(id); setCanResend(true); return 0; } return t - 1; });
    }, 1000);
    return () => clearInterval(id);
  }, [step]);

  const handleSendOtp = () => {
    if (phone.replace(/\D/g, "").length < 10) { setError("Enter a valid 10-digit mobile number"); return; }
    setError(""); setOtp(""); setStep("otp");
    setTimeout(() => hiddenRef.current?.focus(), 200);
  };

  const handleVerifyOtp = () => {
    if (otp !== DEMO_OTP) { setError("Incorrect OTP. Use: " + DEMO_OTP); return; }
    setError(""); setStep("details");
  };

  const handleResend = () => {
    setOtp(""); setError(""); setCanResend(false); setTimer(30);
    const id = setInterval(() => {
      setTimer((t) => { if (t <= 1) { clearInterval(id); setCanResend(true); return 0; } return t - 1; });
    }, 1000);
    setTimeout(() => hiddenRef.current?.focus(), 100);
  };

  const handleCreateAccount = () => {
    if (!name.trim()) { setError("Name is required"); return; }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) { setError("Enter a valid email address"); return; }
    if (!shopName.trim()) { setError("Shop / Firm name is required"); return; }
    setError("");
    const user: AuthUser = {
      name: name.trim(), email: email.trim(), phone: `+91 ${phone}`,
      address: address.trim(), state: state.trim(), district: district.trim(),
      city: city.trim(), shopName: shopName.trim(),
      gstNumber: gst.trim(), panNumber: pan.trim(), vatNumber: vat.trim(),
    };
    loginUser(user);
    router.replace("/auth/pin-setup" as any);
  };

  const goBack = () => {
    if (step === "otp") { setStep("phone"); setOtp(""); setError(""); }
    else if (step === "details") { setStep("otp"); setError(""); }
    else router.back();
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.primary, paddingTop: topPad + 8 }]}>
          <TouchableOpacity onPress={goBack} style={{ padding: 4 }}>
            <Feather name="arrow-left" size={20} color="#fff" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, { fontFamily: "Inter_700Bold" }]}>Create Account</Text>
            <Text style={[styles.headerSub, { fontFamily: "Inter_400Regular" }]}>{STEP_LABELS[step]}</Text>
          </View>
          {/* Step dots */}
          <View style={styles.stepIndicator}>
            {[0, 1, 2].map((s) => (
              <View key={s} style={[styles.stepDot, { backgroundColor: stepIndex[step] >= s ? "#fff" : "rgba(255,255,255,0.35)" }]} />
            ))}
          </View>
        </View>

        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: botPad + 40 }]} keyboardShouldPersistTaps="handled">

          {/* ── Step 1: Phone ── */}
          {step === "phone" && (
            <>
              <View style={[styles.stepCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.stepIcon, { backgroundColor: colors.primary + "18" }]}>
                  <Feather name="smartphone" size={22} color={colors.primary} />
                </View>
                <Text style={[styles.stepTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Verify Mobile Number</Text>
                <Text style={[styles.stepDesc, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  We'll send a one-time password to confirm your number
                </Text>
              </View>

              <Text style={[styles.fieldLabel, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>Mobile Number</Text>
              <View style={[styles.inputRow, { backgroundColor: colors.card, borderColor: error ? colors.destructive : colors.border }]}>
                <View style={[styles.prefix, { borderRightColor: colors.border }]}>
                  <Text style={[styles.prefixText, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>+91</Text>
                </View>
                <TextInput
                  style={[styles.textInput, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
                  placeholder="Enter 10-digit number"
                  placeholderTextColor={colors.mutedForeground}
                  value={phone}
                  onChangeText={(t) => { setPhone(t.replace(/\D/g, "").slice(0, 10)); setError(""); }}
                  keyboardType="phone-pad"
                />
              </View>
              {error ? <Text style={[styles.error, { color: colors.destructive, fontFamily: "Inter_400Regular" }]}>{error}</Text> : null}

              <TouchableOpacity
                style={[styles.primaryBtn, { backgroundColor: colors.primary, opacity: phone.length === 10 ? 1 : 0.55 }]}
                onPress={handleSendOtp}
                disabled={phone.length < 10}
                activeOpacity={0.85}
              >
                <Text style={[styles.primaryBtnText, { fontFamily: "Inter_700Bold" }]}>Send OTP</Text>
                <Feather name="arrow-right" size={18} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => router.push("/auth/login" as any)}>
                <Text style={[styles.switchText, { fontFamily: "Inter_400Regular" }]}>
                  <Text style={{ color: colors.mutedForeground }}>Already have an account? </Text>
                  <Text style={{ color: colors.primary, fontFamily: "Inter_600SemiBold" }}>Sign In</Text>
                </Text>
              </TouchableOpacity>
            </>
          )}

          {/* ── Step 2: OTP ── */}
          {step === "otp" && (
            <>
              <View style={[styles.otpHint, { backgroundColor: colors.secondary, borderColor: colors.primary + "40" }]}>
                <Feather name="info" size={14} color={colors.primary} />
                <Text style={[styles.otpHintText, { color: colors.secondaryForeground, fontFamily: "Inter_400Regular" }]}>
                  Demo OTP: <Text style={{ fontFamily: "Inter_700Bold" }}>{DEMO_OTP}</Text>
                </Text>
              </View>

              <Text style={[styles.otpDesc, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                Enter the 4-digit OTP sent to <Text style={{ fontFamily: "Inter_600SemiBold", color: colors.foreground }}>+91 {phone}</Text>
              </Text>

              <OtpBoxes value={otp} onPress={() => hiddenRef.current?.focus()} />

              <TextInput
                ref={hiddenRef}
                value={otp}
                onChangeText={(t) => { setOtp(t.replace(/\D/g, "").slice(0, 4)); setError(""); }}
                keyboardType="number-pad"
                style={styles.hiddenInput}
                maxLength={4}
              />

              {error ? <Text style={[styles.error, { color: colors.destructive, fontFamily: "Inter_400Regular", textAlign: "center" }]}>{error}</Text> : null}

              <Text style={[styles.timer, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                {canResend ? "" : `Resend in ${timer}s`}
              </Text>
              {canResend && (
                <TouchableOpacity onPress={handleResend}>
                  <Text style={[styles.resend, { color: colors.primary, fontFamily: "Inter_600SemiBold" }]}>Resend OTP</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.primaryBtn, { backgroundColor: colors.primary, opacity: otp.length === 4 ? 1 : 0.5 }]}
                onPress={handleVerifyOtp}
                disabled={otp.length < 4}
                activeOpacity={0.85}
              >
                <Text style={[styles.primaryBtnText, { fontFamily: "Inter_700Bold" }]}>Verify & Continue</Text>
                <Feather name="check" size={18} color="#fff" />
              </TouchableOpacity>
            </>
          )}

          {/* ── Step 3: Details ── */}
          {step === "details" && (
            <>
              {/* Personal Info */}
              <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.sectionHeader}>
                  <View style={[styles.sectionIcon, { backgroundColor: colors.primary + "18" }]}>
                    <Feather name="user" size={15} color={colors.primary} />
                  </View>
                  <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Personal Information</Text>
                </View>
                <View style={{ gap: 14 }}>
                  <FieldInput label="Full Name *" placeholder="Enter your full name" value={name} onChangeText={setName} />
                  <FieldInput label="Email Address *" placeholder="Enter your email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
                </View>
              </View>

              {/* Address */}
              <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.sectionHeader}>
                  <View style={[styles.sectionIcon, { backgroundColor: "#10B98118" }]}>
                    <Feather name="map-pin" size={15} color="#10B981" />
                  </View>
                  <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Address</Text>
                </View>
                <View style={{ gap: 14 }}>
                  <FieldInput label="Street Address" placeholder="House No., Street, Area" value={address} onChangeText={setAddress} />
                  <View style={styles.rowFields}>
                    <View style={{ flex: 1 }}>
                      <FieldInput label="State" placeholder="e.g. Maharashtra" value={state} onChangeText={setState} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <FieldInput label="District" placeholder="e.g. Pune" value={district} onChangeText={setDistrict} />
                    </View>
                  </View>
                  <FieldInput label="City" placeholder="Enter your city" value={city} onChangeText={setCity} />
                </View>
              </View>

              {/* Business Info */}
              <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.sectionHeader}>
                  <View style={[styles.sectionIcon, { backgroundColor: "#F59E0B18" }]}>
                    <Feather name="briefcase" size={15} color="#F59E0B" />
                  </View>
                  <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Business Information</Text>
                </View>
                <View style={{ gap: 14 }}>
                  <FieldInput label="Shop / Firm / Company Name *" placeholder="Enter business name" value={shopName} onChangeText={setShopName} />
                  <FieldInput label="GST Number" placeholder="e.g. 27AAPFU0939F1ZV" value={gst} onChangeText={(t) => setGst(t.toUpperCase())} autoCapitalize="characters" />
                  <FieldInput label="PAN Number" placeholder="e.g. AAPFU0939F" value={pan} onChangeText={(t) => setPan(t.toUpperCase())} autoCapitalize="characters" />
                  <FieldInput label="VAT Number" placeholder="e.g. VAT27123456" value={vat} onChangeText={setVat} autoCapitalize="characters" />
                </View>
              </View>

              {error ? <Text style={[styles.error, { color: colors.destructive, fontFamily: "Inter_400Regular", textAlign: "center" }]}>{error}</Text> : null}

              <TouchableOpacity
                style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
                onPress={handleCreateAccount}
                activeOpacity={0.85}
              >
                <Feather name="check-circle" size={18} color="#fff" />
                <Text style={[styles.primaryBtnText, { fontFamily: "Inter_700Bold" }]}>Create Account</Text>
              </TouchableOpacity>

              <Text style={[styles.hint, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                * Required fields
              </Text>
            </>
          )}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root:         { flex: 1 },
  header:       { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingBottom: 20 },
  headerTitle:  { color: "#fff", fontSize: 20 },
  headerSub:    { color: "rgba(255,255,255,0.8)", fontSize: 13 },
  stepIndicator:{ flexDirection: "row", gap: 6 },
  stepDot:      { width: 8, height: 8, borderRadius: 4 },
  content:      { padding: 16, gap: 16 },

  stepCard:     { alignItems: "center", borderRadius: 14, borderWidth: 1, padding: 20, gap: 8 },
  stepIcon:     { width: 56, height: 56, borderRadius: 16, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  stepTitle:    { fontSize: 18, textAlign: "center" },
  stepDesc:     { fontSize: 13, textAlign: "center", lineHeight: 20 },

  fieldLabel:   { fontSize: 13 },
  inputRow:     { flexDirection: "row", alignItems: "center", borderRadius: 12, borderWidth: 1, height: 52, overflow: "hidden" },
  prefix:       { paddingHorizontal: 14, borderRightWidth: 1, height: "100%", alignItems: "center", justifyContent: "center" },
  prefixText:   { fontSize: 15 },
  textInput:    { flex: 1, fontSize: 16, paddingHorizontal: 14 },
  error:        { fontSize: 13 },

  otpHint:      { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: 10, borderWidth: 1 },
  otpHintText:  { fontSize: 13 },
  otpDesc:      { fontSize: 14, textAlign: "center" },
  otpRow:       { flexDirection: "row", gap: 12, justifyContent: "center", marginVertical: 8 },
  otpBox:       { width: 64, height: 68, borderRadius: 14, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  otpDigit:     { fontSize: 28 },
  hiddenInput:  { position: "absolute", opacity: 0, width: 0, height: 0 },
  timer:        { textAlign: "center", fontSize: 13 },
  resend:       { textAlign: "center", fontSize: 14 },

  sectionCard:  { borderRadius: 14, borderWidth: 1, padding: 14, gap: 14 },
  sectionHeader:{ flexDirection: "row", alignItems: "center", gap: 10 },
  sectionIcon:  { width: 30, height: 30, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  sectionTitle: { fontSize: 15 },
  rowFields:    { flexDirection: "row", gap: 12 },
  fieldInput:   { borderRadius: 10, borderWidth: 1, height: 46, justifyContent: "center", paddingHorizontal: 12 },
  fieldText:    { fontSize: 14 },

  primaryBtn:   { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, height: 54, borderRadius: 14 },
  primaryBtnText:{ color: "#fff", fontSize: 16 },
  switchText:   { textAlign: "center", fontSize: 14 },
  hint:         { fontSize: 12, textAlign: "center" },
});
