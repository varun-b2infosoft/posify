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
import { getAuthState, loginUser, AuthUser } from "@/store/auth";

const DEMO_OTP = "1234";

type Step = "input" | "otp";
type Mode = "phone" | "email";

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

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 60 : insets.top;
  const botPad = Platform.OS === "web" ? 24 : insets.bottom;

  const [step, setStep]       = useState<Step>("input");
  const [mode, setMode]       = useState<Mode>("phone");
  const [input, setInput]     = useState("");
  const [otp, setOtp]         = useState("");
  const [error, setError]     = useState("");
  const [timer, setTimer]     = useState(30);
  const [canResend, setCanResend] = useState(false);
  const hiddenRef = useRef<TextInput>(null);
  const inputRef  = useRef<TextInput>(null);

  useEffect(() => {
    if (step !== "otp") return;
    setTimer(30);
    setCanResend(false);
    const id = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) { clearInterval(id); setCanResend(true); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [step]);

  const masked = mode === "phone"
    ? `+91 XXXXX ${input.slice(-5)}`
    : input.replace(/(.{2}).*(@)/, "$1****$2");

  const handleSendOtp = () => {
    if (mode === "phone" && input.replace(/\D/g, "").length < 10) {
      setError("Enter a valid 10-digit mobile number"); return;
    }
    if (mode === "email" && !/\S+@\S+\.\S+/.test(input)) {
      setError("Enter a valid email address"); return;
    }
    setError("");
    setOtp("");
    setStep("otp");
    setTimeout(() => hiddenRef.current?.focus(), 200);
  };

  const handleVerify = () => {
    if (otp !== DEMO_OTP) { setError("Incorrect OTP. Use: " + DEMO_OTP); return; }
    setError("");
    const mockUser: AuthUser = {
      name: "Arjun Kumar", email: mode === "email" ? input : "arjun@posify.in",
      phone: mode === "phone" ? input : "+91 98765 43210",
      address: "12, MG Road", state: "Maharashtra", district: "Pune",
      city: "Pune", shopName: "Arjun General Store", gstNumber: "27AAPFU0939F1ZV",
      panNumber: "AAPFU0939F", vatNumber: "VAT27123456",
    };
    loginUser(mockUser);
    const auth = getAuthState();
    if (!auth.hasPinSetup) {
      router.replace("/auth/pin-setup" as any);
    } else {
      router.replace("/auth/pin-entry" as any);
    }
  };

  const handleResend = () => {
    setOtp(""); setError(""); setCanResend(false); setTimer(30);
    const id = setInterval(() => {
      setTimer((t) => { if (t <= 1) { clearInterval(id); setCanResend(true); return 0; } return t - 1; });
    }, 1000);
    setTimeout(() => hiddenRef.current?.focus(), 100);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.primary, paddingTop: topPad + 8 }]}>
          <TouchableOpacity onPress={() => step === "otp" ? setStep("input") : router.back()} style={{ padding: 4 }}>
            <Feather name="arrow-left" size={20} color="#fff" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, { fontFamily: "Inter_700Bold" }]}>
              {step === "input" ? "Sign In" : "Verify OTP"}
            </Text>
            <Text style={[styles.headerSub, { fontFamily: "Inter_400Regular" }]}>
              {step === "input" ? "Welcome back to POSify" : `Sent to ${masked}`}
            </Text>
          </View>
          {/* Step indicator */}
          <View style={styles.stepIndicator}>
            {[1, 2].map((s) => (
              <View key={s} style={[styles.stepDot, { backgroundColor: (step === "input" ? 1 : 2) >= s ? "#fff" : "rgba(255,255,255,0.35)" }]} />
            ))}
          </View>
        </View>

        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: botPad + 40 }]} keyboardShouldPersistTaps="handled">
          {step === "input" ? (
            <>
              {/* Mode toggle */}
              <View style={[styles.modeToggle, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                {(["phone", "email"] as Mode[]).map((m) => (
                  <TouchableOpacity
                    key={m}
                    style={[styles.modeBtn, mode === m && { backgroundColor: colors.card }]}
                    onPress={() => { setMode(m); setInput(""); setError(""); }}
                    activeOpacity={0.8}
                  >
                    <Feather name={m === "phone" ? "smartphone" : "mail"} size={14} color={mode === m ? colors.primary : colors.mutedForeground} />
                    <Text style={[styles.modeBtnText, { color: mode === m ? colors.primary : colors.mutedForeground, fontFamily: mode === m ? "Inter_700Bold" : "Inter_400Regular" }]}>
                      {m === "phone" ? "Phone" : "Email"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.label, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>
                {mode === "phone" ? "Mobile Number" : "Email Address"}
              </Text>
              <View style={[styles.inputRow, { backgroundColor: colors.card, borderColor: error ? colors.destructive : colors.border }]}>
                {mode === "phone" && (
                  <View style={[styles.prefix, { borderRightColor: colors.border }]}>
                    <Text style={[styles.prefixText, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>+91</Text>
                  </View>
                )}
                {mode === "email" && <Feather name="mail" size={16} color={colors.mutedForeground} style={{ marginLeft: 12 }} />}
                <TextInput
                  ref={inputRef}
                  style={[styles.textInput, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
                  placeholder={mode === "phone" ? "Enter mobile number" : "Enter email address"}
                  placeholderTextColor={colors.mutedForeground}
                  value={input}
                  onChangeText={(t) => { setInput(mode === "phone" ? t.replace(/\D/g, "").slice(0, 10) : t); setError(""); }}
                  keyboardType={mode === "phone" ? "phone-pad" : "email-address"}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {error ? <Text style={[styles.error, { color: colors.destructive, fontFamily: "Inter_400Regular" }]}>{error}</Text> : null}

              <TouchableOpacity
                style={[styles.primaryBtn, { backgroundColor: colors.primary, opacity: input.length > 0 ? 1 : 0.6 }]}
                onPress={handleSendOtp}
                activeOpacity={0.85}
                disabled={input.length === 0}
              >
                <Text style={[styles.primaryBtnText, { fontFamily: "Inter_700Bold" }]}>Send OTP</Text>
                <Feather name="arrow-right" size={18} color="#fff" />
              </TouchableOpacity>

              <View style={styles.dividerRow}>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <Text style={[styles.dividerText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>or</Text>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
              </View>

              <TouchableOpacity onPress={() => router.push("/auth/register" as any)} activeOpacity={0.8}>
                <Text style={[styles.switchText, { fontFamily: "Inter_400Regular" }]}>
                  <Text style={{ color: colors.mutedForeground }}>New to POSify? </Text>
                  <Text style={{ color: colors.primary, fontFamily: "Inter_600SemiBold" }}>Create Account</Text>
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={[styles.otpHint, { backgroundColor: colors.secondary, borderColor: colors.primary + "40" }]}>
                <Feather name="info" size={14} color={colors.primary} />
                <Text style={[styles.otpHintText, { color: colors.secondaryForeground, fontFamily: "Inter_400Regular" }]}>
                  Demo OTP: <Text style={{ fontFamily: "Inter_700Bold" }}>{DEMO_OTP}</Text>
                </Text>
              </View>

              <Text style={[styles.otpLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                Enter the 4-digit code sent to {masked}
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
                onPress={handleVerify}
                disabled={otp.length < 4}
                activeOpacity={0.85}
              >
                <Text style={[styles.primaryBtnText, { fontFamily: "Inter_700Bold" }]}>Verify & Sign In</Text>
                <Feather name="check" size={18} color="#fff" />
              </TouchableOpacity>
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
  content:      { padding: 20, gap: 14 },

  modeToggle:   { flexDirection: "row", borderRadius: 12, borderWidth: 1, padding: 4, gap: 4 },
  modeBtn:      { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 9 },
  modeBtnText:  { fontSize: 14 },

  label:        { fontSize: 13, marginBottom: -4 },
  inputRow:     { flexDirection: "row", alignItems: "center", borderRadius: 12, borderWidth: 1, height: 52, overflow: "hidden" },
  prefix:       { paddingHorizontal: 14, borderRightWidth: 1, height: "100%", alignItems: "center", justifyContent: "center" },
  prefixText:   { fontSize: 15 },
  textInput:    { flex: 1, fontSize: 16, paddingHorizontal: 14 },
  error:        { fontSize: 13 },

  primaryBtn:   { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, height: 54, borderRadius: 14 },
  primaryBtnText:{ color: "#fff", fontSize: 16 },

  dividerRow:   { flexDirection: "row", alignItems: "center", gap: 12 },
  divider:      { flex: 1, height: 1 },
  dividerText:  { fontSize: 13 },
  switchText:   { textAlign: "center", fontSize: 14 },

  otpHint:      { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: 10, borderWidth: 1 },
  otpHintText:  { fontSize: 13 },
  otpLabel:     { fontSize: 14, textAlign: "center" },
  otpRow:       { flexDirection: "row", gap: 12, justifyContent: "center", marginVertical: 8 },
  otpBox:       { width: 64, height: 68, borderRadius: 14, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  otpDigit:     { fontSize: 28 },
  hiddenInput:  { position: "absolute", opacity: 0, width: 0, height: 0 },
  timer:        { textAlign: "center", fontSize: 13 },
  resend:       { textAlign: "center", fontSize: 14 },
});
