import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
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

const { width: SCREEN_W } = Dimensions.get("window");
const SLIDE_W = Math.min(SCREEN_W, 430);

const SLIDES = [
  {
    icon:    "zap" as const,
    title:   "Lightning Fast Billing",
    body:    "Process sales in seconds. Scan products, apply GST automatically, and accept cash, UPI or card — all from one elegant screen.",
    accent:  "#4F46E5",
    bg:      "#EEF2FF",
    iconBg:  "#4F46E5",
    bullets: ["Quick product search & scan", "GST auto-calculation", "Hold & resume orders", "Split payments"],
  },
  {
    icon:    "bar-chart-2" as const,
    title:   "Smart Business Insights",
    body:    "Know exactly how your business is performing. Track revenue, profit, and inventory trends with clear visual reports.",
    accent:  "#7C3AED",
    bg:      "#F5F3FF",
    iconBg:  "#7C3AED",
    bullets: ["Daily/weekly/monthly reports", "Category-wise breakdown", "Top & least selling products", "Expense tracking"],
  },
  {
    icon:    "users" as const,
    title:   "Grow Customer Loyalty",
    body:    "Manage credit (Udhaar), track every order, and reward your best customers with points and referral bonuses.",
    accent:  "#10B981",
    bg:      "#ECFDF5",
    iconBg:  "#10B981",
    bullets: ["Credit / Udhaar ledger", "Customer purchase history", "Loyalty points & tiers", "Referral rewards"],
  },
];

export default function OnboardingScreen() {
  const insets    = useSafeAreaInsets();
  const [idx, setIdx] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const fadeAnim  = useRef(new Animated.Value(1)).current;

  const slide = SLIDES[idx];

  const goTo = (next: number) => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
    setIdx(next);
    scrollRef.current?.scrollTo({ x: next * SLIDE_W, animated: true });
  };

  const handleNext = () => {
    if (idx < SLIDES.length - 1) {
      goTo(idx + 1);
    } else {
      router.replace("/auth/welcome" as any);
    }
  };

  const handleSkip = () => {
    router.replace("/auth/welcome" as any);
  };

  const topPad = Platform.OS === "web" ? 60 : insets.top + 16;
  const botPad = Platform.OS === "web" ? 40 : insets.bottom + 16;

  return (
    <View style={[styles.root, { backgroundColor: slide.bg }]}>
      {/* Top bar */}
      <View style={[styles.topBar, { paddingTop: topPad }]}>
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => (
            <TouchableOpacity key={i} onPress={() => goTo(i)} activeOpacity={0.7}>
              <Animated.View
                style={[
                  styles.dot,
                  { backgroundColor: i <= idx ? slide.accent : "#D1D5DB" },
                  i === idx && styles.dotActive,
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>
        {idx < SLIDES.length - 1 && (
          <TouchableOpacity onPress={handleSkip} style={styles.skipBtn} activeOpacity={0.7}>
            <Text style={[styles.skipText, { color: slide.accent }]}>Skip</Text>
            <Feather name="chevron-right" size={14} color={slide.accent} />
          </TouchableOpacity>
        )}
      </View>

      {/* Slide content */}
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Icon */}
        <View style={[styles.iconOuter, { backgroundColor: slide.accent + "18" }]}>
          <View style={[styles.iconInner, { backgroundColor: slide.iconBg }]}>
            <Feather name={slide.icon} size={42} color="#fff" />
          </View>
        </View>

        {/* Slide counter */}
        <Text style={[styles.counter, { color: slide.accent }]}>
          {idx + 1} of {SLIDES.length}
        </Text>

        {/* Title */}
        <Text style={[styles.title, { color: "#111827" }]}>{slide.title}</Text>

        {/* Body */}
        <Text style={[styles.body, { color: "#6B7280" }]}>{slide.body}</Text>

        {/* Bullets */}
        <View style={styles.bullets}>
          {slide.bullets.map((b) => (
            <View key={b} style={styles.bulletRow}>
              <View style={[styles.bulletDot, { backgroundColor: slide.accent }]} />
              <Text style={[styles.bulletText, { color: "#374151" }]}>{b}</Text>
            </View>
          ))}
        </View>
      </Animated.View>

      {/* Bottom buttons */}
      <View style={[styles.bottomBar, { paddingBottom: botPad }]}>
        {idx > 0 && (
          <TouchableOpacity
            onPress={() => goTo(idx - 1)}
            style={[styles.prevBtn, { borderColor: slide.accent }]}
            activeOpacity={0.8}
          >
            <Feather name="chevron-left" size={20} color={slide.accent} />
            <Text style={[styles.prevText, { color: slide.accent }]}>Back</Text>
          </TouchableOpacity>
        )}
        {idx === 0 && <View style={{ flex: 1 }} />}

        <TouchableOpacity
          onPress={handleNext}
          style={[styles.nextBtn, { backgroundColor: slide.accent }]}
          activeOpacity={0.85}
        >
          <Text style={styles.nextText}>
            {idx === SLIDES.length - 1 ? "Get Started" : "Next"}
          </Text>
          <Feather
            name={idx === SLIDES.length - 1 ? "arrow-right" : "chevron-right"}
            size={18}
            color="#fff"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root:       { flex: 1 },
  topBar:     { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 24, paddingBottom: 8 },
  dotsRow:    { flexDirection: "row", gap: 8, alignItems: "center" },
  dot:        { width: 8, height: 8, borderRadius: 4 },
  dotActive:  { width: 28, borderRadius: 4 },
  skipBtn:    { flexDirection: "row", alignItems: "center", gap: 2, paddingVertical: 6, paddingHorizontal: 10 },
  skipText:   { fontSize: 14, fontWeight: "600" },

  content:    { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32, gap: 16 },
  iconOuter:  { width: 150, height: 150, borderRadius: 75, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  iconInner:  { width: 100, height: 100, borderRadius: 50, alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 16 },
  counter:    { fontSize: 12, fontWeight: "700", letterSpacing: 1.5, textTransform: "uppercase" },
  title:      { fontSize: 26, fontWeight: "800", textAlign: "center", lineHeight: 34 },
  body:       { fontSize: 15, textAlign: "center", lineHeight: 24 },
  bullets:    { gap: 10, alignSelf: "stretch", marginTop: 4 },
  bulletRow:  { flexDirection: "row", alignItems: "center", gap: 10 },
  bulletDot:  { width: 7, height: 7, borderRadius: 4 },
  bulletText: { fontSize: 14, fontWeight: "500" },

  bottomBar:  { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 24, gap: 12, paddingTop: 16 },
  prevBtn:    { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, height: 52, borderRadius: 14, borderWidth: 2 },
  prevText:   { fontSize: 15, fontWeight: "700" },
  nextBtn:    { flex: 2, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 52, borderRadius: 14 },
  nextText:   { color: "#fff", fontSize: 15, fontWeight: "700" },
});
