import React, { useState } from "react";
import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { getAuthState, verifyPin, logout } from "@/store/auth";

const KEYS = ["1","2","3","4","5","6","7","8","9","","0","⌫"];

function PinDots({ value, error }: { value: string; error: boolean }) {
  const colors = useColors();
  return (
    <View style={styles.dotsRow}>
      {Array.from({ length: 4 }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            {
              backgroundColor: i < value.length
                ? (error ? colors.destructive : colors.primary)
                : "transparent",
              borderColor: i < value.length
                ? (error ? colors.destructive : colors.primary)
                : colors.border,
            },
          ]}
        />
      ))}
    </View>
  );
}

export default function PinEntryScreen() {
  const colors    = useColors();
  const insets    = useSafeAreaInsets();
  const botPad    = Platform.OS === "web" ? 32 : insets.bottom + 16;
  const user      = getAuthState().user;

  const [pin, setPin]       = useState("");
  const [error, setError]   = useState(false);
  const [attempts, setAttempts] = useState(0);

  const handleKey = (key: string) => {
    if (key === "⌫") {
      setPin((v) => v.slice(0, -1));
      setError(false);
      return;
    }
    if (key === "" || pin.length >= 4) return;
    const next = pin + key;
    setPin(next);
    setError(false);

    if (next.length === 4) {
      setTimeout(() => {
        if (verifyPin(next)) {
          router.replace("/(tabs)" as any);
        } else {
          setError(true);
          setAttempts((a) => a + 1);
          setTimeout(() => setPin(""), 600);
        }
      }, 180);
    }
  };

  const handleForgotPin = () => {
    Alert.alert(
      "Forgot PIN?",
      "You'll be signed out and need to log in again to set a new PIN.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: () => {
            logout();
            router.replace("/auth/welcome" as any);
          },
        },
      ]
    );
  };

  const firstName = user?.name?.split(" ")[0] ?? "there";

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Top branding */}
      <View style={[styles.top, { paddingTop: (Platform.OS === "web" ? 60 : insets.top) + 24 }]}>
        <View style={[styles.logoIcon, { backgroundColor: colors.primary + "18" }]}>
          <Feather name="shopping-bag" size={28} color={colors.primary} />
        </View>
        <Text style={[styles.appName, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>POSify</Text>
        <Text style={[styles.greeting, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
          Welcome back, {firstName}!
        </Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          Enter your PIN to continue
        </Text>
      </View>

      {/* Body */}
      <View style={[styles.body, { paddingBottom: botPad }]}>
        {/* PIN dots */}
        <PinDots value={pin} error={error} />

        {error ? (
          <Text style={[styles.errorText, { color: colors.destructive, fontFamily: "Inter_500Medium" }]}>
            Incorrect PIN{attempts >= 3 ? " — " + (5 - attempts) + " attempts left" : ""}
          </Text>
        ) : (
          <Text style={[styles.hintText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            {pin.length === 0 ? "Tap numbers to enter your PIN" : "\u00A0"}
          </Text>
        )}

        {/* Keypad */}
        <View style={styles.keypad}>
          {KEYS.map((key, i) => (
            <TouchableOpacity
              key={i}
              style={[
                styles.key,
                key === "" && { opacity: 0 },
                key === "⌫" && { backgroundColor: "transparent" },
                key !== "" && key !== "⌫" && { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 },
              ]}
              onPress={() => handleKey(key)}
              activeOpacity={0.65}
              disabled={key === ""}
            >
              {key === "⌫" ? (
                <Feather name="delete" size={22} color={colors.foreground} />
              ) : (
                <Text style={[styles.keyText, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>{key}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity onPress={handleForgotPin} activeOpacity={0.75}>
          <Text style={[styles.forgotText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            Forgot PIN? <Text style={{ color: colors.primary, fontFamily: "Inter_600SemiBold" }}>Sign out</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root:      { flex: 1 },
  top:       { alignItems: "center", paddingHorizontal: 32, gap: 8 },
  logoIcon:  { width: 64, height: 64, borderRadius: 20, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  appName:   { fontSize: 22, letterSpacing: 0.5 },
  greeting:  { fontSize: 22, textAlign: "center", marginTop: 4 },
  subtitle:  { fontSize: 15, textAlign: "center" },

  body:      { flex: 1, alignItems: "center", justifyContent: "space-evenly", paddingHorizontal: 32 },
  dotsRow:   { flexDirection: "row", gap: 20, justifyContent: "center" },
  dot:       { width: 20, height: 20, borderRadius: 10, borderWidth: 2 },

  errorText: { fontSize: 13, textAlign: "center" },
  hintText:  { fontSize: 13, textAlign: "center" },

  keypad:    { flexDirection: "row", flexWrap: "wrap", width: 260, gap: 12, justifyContent: "center" },
  key:       { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center" },
  keyText:   { fontSize: 26 },

  forgotText:{ fontSize: 14, textAlign: "center" },
});
