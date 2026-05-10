import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: W } = Dimensions.get("window");
const ND = false; // always JS driver — width animations are needed

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
  const insets      = useSafeAreaInsets();
  const [idx, setIdx]  = useState(0);
  const dirRef         = useRef(1); // 1 = forward, -1 = backward
  const transitioning  = useRef(false);

  /* ── Content animated values ── */
  const slideX   = useRef(new Animated.Value(W * 0.35)).current; // horizontal slide
  const contentOpa = useRef(new Animated.Value(0)).current;

  /* ── Icon ── */
  const iconSc   = useRef(new Animated.Value(0.3)).current;
  const iconOpa  = useRef(new Animated.Value(0)).current;
  const iconRot  = useRef(new Animated.Value(-15)).current;   // unwinds on entrance
  const ringPSc  = useRef(new Animated.Value(1)).current;     // one-shot ring pulse
  const ringPOpa = useRef(new Animated.Value(0)).current;

  /* ── Text ── */
  const titleY   = useRef(new Animated.Value(30)).current;
  const titleOpa = useRef(new Animated.Value(0)).current;
  const bodyOpa  = useRef(new Animated.Value(0)).current;

  /* ── Bullets (up to 4) ── */
  const bulletOpa = useRef([0,1,2,3].map(() => new Animated.Value(0))).current;
  const bulletX   = useRef([0,1,2,3].map(() => new Animated.Value(28))).current;

  /* ── Dot widths ── */
  const dotW = useRef(SLIDES.map((_, i) => new Animated.Value(i === 0 ? 28 : 8))).current;

  /* ── Screen-level exit (skip / get started) ── */
  const screenSc  = useRef(new Animated.Value(1)).current;
  const screenOpa = useRef(new Animated.Value(1)).current;

  /* ── Next button press ── */
  const btnSc = useRef(new Animated.Value(1)).current;

  /* ── Floating icon bob (continuous) ── */
  const floatY = useRef(new Animated.Value(0)).current;
  const floatRef = useRef<Animated.CompositeAnimation | null>(null);

  const startFloat = () => {
    floatRef.current?.stop();
    floatRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(floatY, { toValue: -10, duration: 1600, useNativeDriver: ND }),
        Animated.timing(floatY, { toValue: 0,   duration: 1600, useNativeDriver: ND }),
      ])
    );
    floatRef.current.start();
  };

  /* ── Animate content IN ── */
  const animateIn = (fromRight: boolean) => {
    const startX = fromRight ? W * 0.4 : -W * 0.4;

    // Reset
    slideX.setValue(startX);
    contentOpa.setValue(0);
    iconSc.setValue(0.3);
    iconOpa.setValue(0);
    iconRot.setValue(fromRight ? -15 : 15);
    titleY.setValue(30);
    titleOpa.setValue(0);
    bodyOpa.setValue(0);
    bulletOpa.forEach(a => a.setValue(0));
    bulletX.forEach(a => a.setValue(fromRight ? 28 : -28));

    // Phase 1: Slide + fade content in
    Animated.parallel([
      Animated.spring(slideX,    { toValue: 0, tension: 100, friction: 14, useNativeDriver: ND }),
      Animated.timing(contentOpa,{ toValue: 1, duration: 280,              useNativeDriver: ND }),
    ]).start(() => {
      transitioning.current = false;

      // Phase 2: Icon springs in with rotation unwind
      Animated.parallel([
        Animated.spring(iconSc,  { toValue: 1,  tension: 180, friction: 8, useNativeDriver: ND }),
        Animated.spring(iconRot, { toValue: 0,  tension: 180, friction: 8, useNativeDriver: ND }),
        Animated.timing(iconOpa, { toValue: 1,  duration: 200,             useNativeDriver: ND }),
      ]).start(() => {
        // One-shot ring pulse after icon lands
        ringPSc.setValue(1);
        ringPOpa.setValue(0.5);
        Animated.parallel([
          Animated.timing(ringPSc,  { toValue: 1.9, duration: 650, useNativeDriver: ND }),
          Animated.timing(ringPOpa, { toValue: 0,   duration: 650, useNativeDriver: ND }),
        ]).start();
        startFloat();
      });

      // Phase 3: Title slides up (staggered 60ms after content)
      setTimeout(() => {
        Animated.parallel([
          Animated.spring(titleY,  { toValue: 0, tension: 160, friction: 12, useNativeDriver: ND }),
          Animated.timing(titleOpa,{ toValue: 1, duration: 260,              useNativeDriver: ND }),
        ]).start();
      }, 60);

      // Phase 4: Body fades in
      setTimeout(() => {
        Animated.timing(bodyOpa, { toValue: 1, duration: 280, useNativeDriver: ND }).start();
      }, 140);

      // Phase 5: Bullets stagger in from the side
      bulletOpa.forEach((a, i) => {
        setTimeout(() => {
          Animated.parallel([
            Animated.timing(a,        { toValue: 1, duration: 240, useNativeDriver: ND }),
            Animated.spring(bulletX[i],{ toValue: 0, tension: 160, friction: 12, useNativeDriver: ND }),
          ]).start();
        }, 200 + i * 85);
      });
    });
  };

  /* ── Animate content OUT ── */
  const animateOut = (toLeft: boolean, cb: () => void) => {
    transitioning.current = true;
    floatRef.current?.stop();

    Animated.parallel([
      Animated.timing(slideX,     { toValue: toLeft ? -W * 0.35 : W * 0.35, duration: 200, useNativeDriver: ND }),
      Animated.timing(contentOpa, { toValue: 0, duration: 160, useNativeDriver: ND }),
      Animated.timing(iconOpa,    { toValue: 0, duration: 130, useNativeDriver: ND }),
      Animated.spring(iconSc,     { toValue: 0.7, tension: 200, friction: 12, useNativeDriver: ND }),
      Animated.timing(titleOpa,   { toValue: 0, duration: 130, useNativeDriver: ND }),
      Animated.timing(bodyOpa,    { toValue: 0, duration: 130, useNativeDriver: ND }),
      ...bulletOpa.map(a => Animated.timing(a, { toValue: 0, duration: 110, useNativeDriver: ND })),
    ]).start(() => cb());
  };

  /* ── Navigate to a slide ── */
  const goTo = (next: number) => {
    if (transitioning.current || next === idx) return;
    dirRef.current = next > idx ? 1 : -1;

    // Animate dots
    dotW.forEach((w, i) => {
      Animated.spring(w, { toValue: i === next ? 28 : 8, tension: 200, friction: 14, useNativeDriver: ND }).start();
    });

    animateOut(next > idx, () => {
      setIdx(next);
    });
  };

  /* ── Re-animate when idx changes ── */
  useEffect(() => {
    animateIn(dirRef.current >= 0);
  }, [idx]);

  /* ── Button press feedback ── */
  const pressBtn = (cb: () => void) => {
    Animated.sequence([
      Animated.timing(btnSc, { toValue: 0.92, duration: 80, useNativeDriver: ND }),
      Animated.spring(btnSc, { toValue: 1,    tension: 260, friction: 8, useNativeDriver: ND }),
    ]).start(() => cb());
  };

  /* ── Screen exit animation ── */
  const exitScreen = (cb: () => void) => {
    floatRef.current?.stop();
    Animated.parallel([
      Animated.timing(screenOpa, { toValue: 0, duration: 300, useNativeDriver: ND }),
      Animated.spring(screenSc,  { toValue: 0.88, tension: 120, friction: 14, useNativeDriver: ND }),
    ]).start(() => cb());
  };

  const handleNext = () => {
    if (transitioning.current) return;
    if (idx < SLIDES.length - 1) {
      pressBtn(() => goTo(idx + 1));
    } else {
      pressBtn(() => exitScreen(() => router.replace("/auth/welcome" as any)));
    }
  };

  const handleBack = () => {
    if (transitioning.current) return;
    goTo(idx - 1);
  };

  const handleSkip = () => {
    if (transitioning.current) return;
    exitScreen(() => router.replace("/auth/welcome" as any));
  };

  const slide    = SLIDES[idx];
  const topPad   = Platform.OS === "web" ? 60 : insets.top + 16;
  const botPad   = Platform.OS === "web" ? 40 : insets.bottom + 16;

  return (
    <Animated.View
      style={[styles.root, { backgroundColor: slide.bg, opacity: screenOpa, transform: [{ scale: screenSc }] }]}
    >
      {/* ── Top bar ── */}
      <View style={[styles.topBar, { paddingTop: topPad }]}>
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => (
            <TouchableOpacity key={i} onPress={() => goTo(i)} activeOpacity={0.7}>
              <Animated.View
                style={[
                  styles.dot,
                  {
                    width:           dotW[i],
                    backgroundColor: i <= idx ? slide.accent : "#D1D5DB",
                  },
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

      {/* ── Slide content ── */}
      <Animated.View
        style={[styles.content, { opacity: contentOpa, transform: [{ translateX: slideX }] }]}
      >
        {/* Icon with pulse ring */}
        <View style={[styles.iconOuter, { backgroundColor: slide.accent + "18" }]}>
          {/* One-shot ring pulse */}
          <Animated.View
            style={[
              styles.ringPulse,
              {
                borderColor: slide.accent,
                opacity:     ringPOpa,
                transform:   [{ scale: ringPSc }],
              },
            ]}
          />
          <Animated.View
            style={{
              opacity:   iconOpa,
              transform: [
                { scale:  iconSc },
                { rotate: iconRot.interpolate({ inputRange: [-15, 15], outputRange: ["-15deg", "15deg"] }) },
                { translateY: floatY },
              ],
            }}
          >
            <View style={[styles.iconInner, { backgroundColor: slide.iconBg }]}>
              <Feather name={slide.icon} size={42} color="#fff" />
            </View>
          </Animated.View>
        </View>

        {/* Counter */}
        <Text style={[styles.counter, { color: slide.accent }]}>
          {idx + 1} of {SLIDES.length}
        </Text>

        {/* Title */}
        <Animated.Text
          style={[styles.title, { color: "#111827", opacity: titleOpa, transform: [{ translateY: titleY }] }]}
        >
          {slide.title}
        </Animated.Text>

        {/* Body */}
        <Animated.Text style={[styles.body, { color: "#6B7280", opacity: bodyOpa }]}>
          {slide.body}
        </Animated.Text>

        {/* Bullets */}
        <View style={styles.bullets}>
          {slide.bullets.map((b, i) => (
            <Animated.View
              key={b}
              style={[styles.bulletRow, { opacity: bulletOpa[i], transform: [{ translateX: bulletX[i] }] }]}
            >
              <View style={[styles.bulletDot, { backgroundColor: slide.accent }]} />
              <Text style={[styles.bulletText, { color: "#374151" }]}>{b}</Text>
            </Animated.View>
          ))}
        </View>
      </Animated.View>

      {/* ── Bottom buttons ── */}
      <View style={[styles.bottomBar, { paddingBottom: botPad }]}>
        {idx > 0 ? (
          <TouchableOpacity
            onPress={handleBack}
            style={[styles.prevBtn, { borderColor: slide.accent }]}
            activeOpacity={0.8}
          >
            <Feather name="chevron-left" size={20} color={slide.accent} />
            <Text style={[styles.prevText, { color: slide.accent }]}>Back</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ flex: 1 }} />
        )}

        <Animated.View style={[styles.nextWrap, { transform: [{ scale: btnSc }] }]}>
          <TouchableOpacity
            onPress={handleNext}
            style={[styles.nextBtn, { backgroundColor: slide.accent }]}
            activeOpacity={0.9}
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
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root:       { flex: 1 },

  topBar:     { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 24, paddingBottom: 8 },
  dotsRow:    { flexDirection: "row", gap: 8, alignItems: "center" },
  dot:        { height: 8, borderRadius: 4 },
  skipBtn:    { flexDirection: "row", alignItems: "center", gap: 2, paddingVertical: 6, paddingHorizontal: 10 },
  skipText:   { fontSize: 14, fontWeight: "600" },

  content:    { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32, gap: 16 },

  iconOuter:  { width: 160, height: 160, borderRadius: 80, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  ringPulse:  { position: "absolute", width: 120, height: 120, borderRadius: 60, borderWidth: 2 },
  iconInner:  { width: 100, height: 100, borderRadius: 50, alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.22, shadowRadius: 16 },

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
  nextWrap:   { flex: 2 },
  nextBtn:    { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 52, borderRadius: 14, width: "100%" },
  nextText:   { color: "#fff", fontSize: 15, fontWeight: "700" },
});
