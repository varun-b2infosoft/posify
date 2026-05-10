import React, { useEffect, useRef } from "react";
import { Animated, Platform, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";

const PRIMARY = "#4F46E5";
const NATIVE  = Platform.OS !== "web";

export default function SplashScreen() {
  const scale        = useRef(new Animated.Value(0.5)).current;
  const logoOpacity  = useRef(new Animated.Value(0)).current;
  const textOpacity  = useRef(new Animated.Value(0)).current;
  const ringScale    = useRef(new Animated.Value(0.8)).current;
  const ringOpacity  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scale,      { toValue: 1,   tension: 55, friction: 7, useNativeDriver: NATIVE }),
        Animated.timing(logoOpacity,{ toValue: 1,   duration: 450,            useNativeDriver: NATIVE }),
        Animated.spring(ringScale,  { toValue: 1.4, tension: 40, friction: 10,useNativeDriver: NATIVE }),
        Animated.timing(ringOpacity,{ toValue: 0.12,duration: 500,            useNativeDriver: NATIVE }),
      ]),
      Animated.timing(textOpacity, { toValue: 1, duration: 380, delay: 100, useNativeDriver: NATIVE }),
    ]).start();

    const t = setTimeout(() => {
      router.replace("/auth/onboarding" as any);
    }, 2600);
    return () => clearTimeout(t);
  }, []);

  return (
    <View style={styles.root}>
      <View style={styles.center}>
        <Animated.View style={[styles.ring, { opacity: ringOpacity, transform: [{ scale: ringScale }] }]} />
        <Animated.View style={[styles.iconWrap, { opacity: logoOpacity, transform: [{ scale }] }]}>
          <View style={styles.iconBox}>
            <Feather name="shopping-bag" size={52} color="#fff" />
          </View>
        </Animated.View>
        <Animated.View style={{ opacity: textOpacity, alignItems: "center" }}>
          <Text style={styles.appName}>IPOS</Text>
          <Text style={styles.tagline}>Smart POS for Growing Businesses</Text>
        </Animated.View>
      </View>

      <Animated.View style={[styles.footer, { opacity: textOpacity }]}>
        <View style={styles.dotRow}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={[styles.dot, i === 0 && styles.dotActive]} />
          ))}
        </View>
        <Text style={styles.version}>v1.0.0</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root:       { flex: 1, backgroundColor: PRIMARY, alignItems: "center", justifyContent: "space-between", paddingTop: Platform.OS === "web" ? 80 : 100, paddingBottom: 48 },
  center:     { alignItems: "center", gap: 24 },
  ring:       { position: "absolute", width: 200, height: 200, borderRadius: 100, backgroundColor: "#fff", top: -20 },
  iconWrap:   { alignItems: "center", justifyContent: "center" },
  iconBox:    { width: 110, height: 110, borderRadius: 32, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "rgba(255,255,255,0.35)" },
  appName:    { fontSize: 42, color: "#fff", fontWeight: "800", letterSpacing: 2, marginTop: 4 },
  tagline:    { fontSize: 15, color: "rgba(255,255,255,0.8)", marginTop: 6, textAlign: "center" },
  footer:     { alignItems: "center", gap: 16 },
  dotRow:     { flexDirection: "row", gap: 8 },
  dot:        { width: 8, height: 8, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.35)" },
  dotActive:  { backgroundColor: "#fff", width: 24 },
  version:    { fontSize: 12, color: "rgba(255,255,255,0.5)" },
});
