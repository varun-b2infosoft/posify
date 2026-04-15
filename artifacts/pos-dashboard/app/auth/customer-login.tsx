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
import { loginCustomer, CUSTOMER_PRIMARY } from "@/store/customerApp";

const DEMO_OTP = "1234";
type Step = "input" | "otp";

function OtpBoxes({ value, onPress }: { value: string; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={1}>
      <View style={styles.otpRow}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={[
              styles.otpBox,
              {
                borderColor:
                  value.length === i
                    ? CUSTOMER_PRIMARY
                    : value.length > i
                    ? CUSTOMER_PRIMARY
                    : "#E5E7EB",
                backgroundColor: "#fff",
              },
            ]}
          >
            <Text style={[styles.otpDigit, { color: "#111827", fontFamily: "Inter_700Bold" }]}>
              {value[i] ? "●" : ""}
            </Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
}

export default function CustomerLoginScreen() {
  const colors    = useColors();
  const insets    = useSafeAreaInsets();
  const topPad    = Platform.OS === "web" ? 60 : insets.top;
  const botPad    = Platform.OS === "web" ? 24 : insets.bottom;

  const [step, setStep]           = useState<Step>("input");
  const [phone, setPhone]         = useState("");
  const [otp, setOtp]             = useState("");
  const [error, setError]         = useState("");
  const [timer, setTimer]         = useState(30);
  const [canResend, setCanResend] = useState(false);
  const hiddenRef = useRef<TextInput>(null);

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

  const masked = `+91 XXXXX ${phone.slice(-5)}`;

  const handleSendOtp = () => {
    if (phone.replace(/\D/g, "").length < 10) {
      setError("Enter a valid 10-digit mobile number");
      return;
    }
    setError("");
    setOtp("");
    setStep("otp");
    setTimeout(() => hiddenRef.current?.focus(), 200);
  };

  const handleVerify = () => {
    if (otp !== DEMO_OTP) {
      setError("Incorrect OTP. Use: " + DEMO_OTP);
      return;
    }
    setError("");
    loginCustomer("+91 " + phone);
    router.replace("/customer" as any);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View
          style={[
            styles.header,
            { backgroundColor: CUSTOMER_PRIMARY, paddingTop: topPad + 8 },
          ]}
        >
          <TouchableOpacity
            onPress={() =>
              step === "otp" ? setStep("input") : router.back()
            }
            style={{ padding: 4 }}
          >
            <Feather name="arrow-left" size={20} color="#fff" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, { fontFamily: "Inter_700Bold" }]}>
              {step === "input" ? "Customer Login" : "Verify OTP"}
            </Text>
            <Text style={[styles.headerSub, { fontFamily: "Inter_400Regular" }]}>
              {step === "input" ? "Enter your mobile to continue" : `Sent to ${masked}`}
            </Text>
          </View>
          <View style={styles.stepIndicator}>
            {[1, 2].map((s) => (
              <View
                key={s}
                style={[
                  styles.stepDot,
                  {
                    backgroundColor:
                      (step === "input" ? 1 : 2) >= s
                        ? "#fff"
                        : "rgba(255,255,255,0.35)",
                  },
                ]}
              />
            ))}
          </View>
        </View>

        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: botPad + 40 }]}
          keyboardShouldPersistTaps="handled"
        >
          {step === "input" ? (
            <>
              {/* Friendly illustration */}
              <View style={[styles.illustrationWrap, { backgroundColor: CUSTOMER_PRIMARY + "12" }]}>
                <Feather name="shopping-bag" size={40} color={CUSTOMER_PRIMARY} />
                <Text style={[styles.illustrationText, { color: CUSTOMER_PRIMARY, fontFamily: "Inter_600SemiBold" }]}>
                  Shop from your favourite stores
                </Text>
              </View>

              <Text style={[styles.label, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>
                Mobile Number
              </Text>
              <View
                style={[
                  styles.inputRow,
                  {
                    backgroundColor: colors.card,
                    borderColor: error ? "#EF4444" : colors.border,
                  },
                ]}
              >
                <View style={[styles.prefix, { borderRightColor: colors.border }]}>
                  <Text style={[styles.prefixText, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                    +91
                  </Text>
                </View>
                <TextInput
                  style={[styles.textInput, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
                  placeholder="Enter mobile number"
                  placeholderTextColor={colors.mutedForeground}
                  value={phone}
                  onChangeText={(t) => {
                    setPhone(t.replace(/\D/g, "").slice(0, 10));
                    setError("");
                  }}
                  keyboardType="phone-pad"
                />
              </View>

              {error ? (
                <Text style={[styles.error, { color: "#EF4444", fontFamily: "Inter_400Regular" }]}>
                  {error}
                </Text>
              ) : null}

              <TouchableOpacity
                style={[
                  styles.primaryBtn,
                  {
                    backgroundColor: CUSTOMER_PRIMARY,
                    opacity: phone.length >= 10 ? 1 : 0.5,
                  },
                ]}
                onPress={handleSendOtp}
                disabled={phone.length < 10}
                activeOpacity={0.85}
              >
                <Text style={[styles.primaryBtnText, { fontFamily: "Inter_700Bold" }]}>
                  Send OTP
                </Text>
                <Feather name="arrow-right" size={18} color="#fff" />
              </TouchableOpacity>

              <View style={styles.benefitsWrap}>
                {[
                  { icon: "star",     label: "Earn loyalty points on every purchase" },
                  { icon: "credit-card", label: "Wallet & easy payments" },
                  { icon: "truck",    label: "Track deliveries in real time"          },
                  { icon: "gift",     label: "Referral rewards & cashback"            },
                ].map((b) => (
                  <View key={b.label} style={styles.benefitRow}>
                    <Feather name={b.icon as any} size={15} color={CUSTOMER_PRIMARY} />
                    <Text style={[styles.benefitText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                      {b.label}
                    </Text>
                  </View>
                ))}
              </View>
            </>
          ) : (
            <>
              <View
                style={[
                  styles.otpHint,
                  { backgroundColor: CUSTOMER_PRIMARY + "15", borderColor: CUSTOMER_PRIMARY + "40" },
                ]}
              >
                <Feather name="info" size={14} color={CUSTOMER_PRIMARY} />
                <Text style={[styles.otpHintText, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>
                  Demo OTP:{" "}
                  <Text style={{ fontFamily: "Inter_700Bold" }}>{DEMO_OTP}</Text>
                </Text>
              </View>

              <Text style={[styles.otpLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                Enter the 4-digit code sent to {masked}
              </Text>

              <OtpBoxes value={otp} onPress={() => hiddenRef.current?.focus()} />

              <TextInput
                ref={hiddenRef}
                value={otp}
                onChangeText={(t) => {
                  setOtp(t.replace(/\D/g, "").slice(0, 4));
                  setError("");
                }}
                keyboardType="number-pad"
                style={styles.hiddenInput}
                maxLength={4}
              />

              {error ? (
                <Text
                  style={[
                    styles.error,
                    { color: "#EF4444", fontFamily: "Inter_400Regular", textAlign: "center" },
                  ]}
                >
                  {error}
                </Text>
              ) : null}

              <Text style={[styles.timer, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                {canResend ? "" : `Resend in ${timer}s`}
              </Text>
              {canResend && (
                <TouchableOpacity
                  onPress={() => {
                    setOtp(""); setError(""); setCanResend(false); setTimer(30);
                  }}
                >
                  <Text style={[styles.resend, { color: CUSTOMER_PRIMARY, fontFamily: "Inter_600SemiBold" }]}>
                    Resend OTP
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[
                  styles.primaryBtn,
                  { backgroundColor: CUSTOMER_PRIMARY, opacity: otp.length === 4 ? 1 : 0.5 },
                ]}
                onPress={handleVerify}
                disabled={otp.length < 4}
                activeOpacity={0.85}
              >
                <Text style={[styles.primaryBtnText, { fontFamily: "Inter_700Bold" }]}>
                  Verify & Continue
                </Text>
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
  root:          { flex: 1 },
  header:        { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingBottom: 20 },
  headerTitle:   { color: "#fff", fontSize: 20 },
  headerSub:     { color: "rgba(255,255,255,0.8)", fontSize: 13 },
  stepIndicator: { flexDirection: "row", gap: 6 },
  stepDot:       { width: 8, height: 8, borderRadius: 4 },
  content:       { padding: 20, gap: 14 },
  illustrationWrap: { alignItems: "center", gap: 10, paddingVertical: 24, borderRadius: 16 },
  illustrationText: { fontSize: 15, textAlign: "center" },
  label:         { fontSize: 13, marginBottom: -4 },
  inputRow:      { flexDirection: "row", alignItems: "center", borderRadius: 12, borderWidth: 1, height: 52, overflow: "hidden" },
  prefix:        { paddingHorizontal: 14, borderRightWidth: 1, height: "100%", alignItems: "center", justifyContent: "center" },
  prefixText:    { fontSize: 15 },
  textInput:     { flex: 1, fontSize: 16, paddingHorizontal: 14 },
  error:         { fontSize: 13 },
  primaryBtn:    { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, height: 54, borderRadius: 14 },
  primaryBtnText:{ color: "#fff", fontSize: 16 },
  benefitsWrap:  { gap: 10, marginTop: 6 },
  benefitRow:    { flexDirection: "row", alignItems: "center", gap: 10 },
  benefitText:   { fontSize: 13 },
  otpHint:       { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: 10, borderWidth: 1 },
  otpHintText:   { fontSize: 13 },
  otpLabel:      { fontSize: 14, textAlign: "center" },
  otpRow:        { flexDirection: "row", gap: 12, justifyContent: "center", marginVertical: 8 },
  otpBox:        { width: 64, height: 68, borderRadius: 14, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  otpDigit:      { fontSize: 28 },
  hiddenInput:   { position: "absolute", opacity: 0, width: 0, height: 0 },
  timer:         { textAlign: "center", fontSize: 13 },
  resend:        { textAlign: "center", fontSize: 14 },
});
