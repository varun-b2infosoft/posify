import React, { useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { setupPin } from "@/store/auth";

const KEYS = ["1","2","3","4","5","6","7","8","9","","0","⌫"];

type Phase = "create" | "confirm";

function PinDots({ value, total = 4 }: { value: string; total?: number }) {
  const colors = useColors();
  return (
    <View style={styles.dotsRow}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            {
              backgroundColor: i < value.length ? colors.primary : "transparent",
              borderColor: i < value.length ? colors.primary : colors.border,
            },
          ]}
        />
      ))}
    </View>
  );
}

export default function PinSetupScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const botPad = Platform.OS === "web" ? 32 : insets.bottom + 16;

  // "from=security" means we're changing PIN from the Security screen
  const { from } = useLocalSearchParams<{ from?: string }>();
  const isChanging = from === "security";

  const [phase, setPhase]       = useState<Phase>("create");
  const [pin, setPin]           = useState("");
  const [confirmPin, setConfirm] = useState("");
  const [error, setError]       = useState("");
  const [shake, setShake]       = useState(false);

  const current = phase === "create" ? pin : confirmPin;
  const setter  = phase === "create" ? setPin : setConfirm;

  const doShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleKey = (key: string) => {
    if (key === "⌫") {
      setter((v) => v.slice(0, -1));
      setError("");
      return;
    }
    if (key === "" || current.length >= 4) return;
    const next = current + key;
    setter(next);
    setError("");

    if (next.length === 4) {
      setTimeout(() => {
        if (phase === "create") {
          setPhase("confirm");
        } else {
          if (next !== pin) {
            setError("PINs don't match. Please try again.");
            doShake();
            setConfirm("");
          } else {
            setupPin(pin);
            // If coming from security settings, go back; otherwise go to dashboard
            if (isChanging) {
              router.back();
            } else {
              router.replace("/(tabs)" as any);
            }
          }
        }
      }, 180);
    }
  };

  const handleBack = () => {
    if (phase === "confirm") {
      setPhase("create");
      setPin("");
      setConfirm("");
      setError("");
    } else if (isChanging) {
      router.back();
    }
  };

  const canGoBack = phase === "confirm" || isChanging;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary, paddingTop: (Platform.OS === "web" ? 60 : insets.top) + 8 }]}>
        {canGoBack ? (
          <TouchableOpacity onPress={handleBack} style={{ padding: 4 }}>
            <Feather name="arrow-left" size={20} color="#fff" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 28 }} />
        )}
        <Text style={[styles.headerTitle, { fontFamily: "Inter_700Bold" }]}>
          {isChanging
            ? (phase === "create" ? "Change PIN" : "Confirm New PIN")
            : (phase === "create" ? "Create PIN" : "Confirm PIN")}
        </Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={[styles.body, { paddingBottom: botPad }]}>
        <View style={[styles.iconWrap, { backgroundColor: colors.primary + "18" }]}>
          <Feather name={isChanging ? "refresh-cw" : "lock"} size={32} color={colors.primary} />
        </View>

        <Text style={[styles.title, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
          {phase === "create"
            ? (isChanging ? "Enter New 4-Digit PIN" : "Set Your 4-Digit PIN")
            : "Confirm Your PIN"}
        </Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          {phase === "create"
            ? (isChanging
                ? "Choose a new PIN to secure your app"
                : "This PIN will be required every time you open POSify")
            : "Re-enter your PIN to confirm"}
        </Text>

        <View style={[styles.dotsWrap, shake && styles.dotsShake]}>
          <PinDots value={current} />
        </View>

        {error ? (
          <Text style={[styles.error, { color: colors.destructive, fontFamily: "Inter_400Regular" }]}>{error}</Text>
        ) : null}

        <View style={styles.stepRow}>
          {[0, 1].map((s) => (
            <View
              key={s}
              style={[styles.stepPill, { backgroundColor: (phase === "create" ? 0 : 1) >= s ? colors.primary : colors.border }]}
            />
          ))}
        </View>

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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root:      { flex: 1 },
  header:    { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 16 },
  headerTitle:{ color: "#fff", fontSize: 18 },

  body:      { flex: 1, alignItems: "center", justifyContent: "space-evenly", paddingHorizontal: 32 },
  iconWrap:  { width: 72, height: 72, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  title:     { fontSize: 22, textAlign: "center" },
  subtitle:  { fontSize: 14, textAlign: "center", lineHeight: 21 },

  dotsWrap:  {},
  dotsShake: { transform: [{ translateX: 8 }] },
  dotsRow:   { flexDirection: "row", gap: 20, justifyContent: "center", marginVertical: 8 },
  dot:       { width: 18, height: 18, borderRadius: 9, borderWidth: 2 },

  error:     { fontSize: 13, textAlign: "center" },

  stepRow:   { flexDirection: "row", gap: 10 },
  stepPill:  { width: 32, height: 5, borderRadius: 3 },

  keypad:    { flexDirection: "row", flexWrap: "wrap", width: 260, gap: 12, justifyContent: "center" },
  key:       { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center" },
  keyText:   { fontSize: 26 },
});
