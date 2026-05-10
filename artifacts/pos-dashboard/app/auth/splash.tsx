import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, Platform, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";

const { width: W, height: H } = Dimensions.get("window");
const ND      = false; // always JS driver — web + consistent cross-platform
const PRIMARY = "#4F46E5";
const NAVIGATE_AT = 3600;

/* ─── Letter (spring-bounce in) ─── */
function Letter({ char, delay }: { char: string; delay: number }) {
  const opa = useRef(new Animated.Value(0)).current;
  const ty  = useRef(new Animated.Value(32)).current;
  const sc  = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const t = setTimeout(() => {
      Animated.parallel([
        Animated.spring(sc,  { toValue: 1,   tension: 220, friction: 9, useNativeDriver: ND }),
        Animated.spring(ty,  { toValue: 0,   tension: 220, friction: 9, useNativeDriver: ND }),
        Animated.timing(opa, { toValue: 1,   duration: 160,             useNativeDriver: ND }),
      ]).start();
    }, delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <Animated.Text style={[styles.letter, { opacity: opa, transform: [{ translateY: ty }, { scale: sc }] }]}>
      {char}
    </Animated.Text>
  );
}

/* ─── Sparkle dot (burst from logo) ─── */
const SPARKLE_DEFS = [
  { angle: 270, dist: 82 }, // top
  { angle: 30,  dist: 80 },
  { angle: 150, dist: 80 },
  { angle: 330, dist: 76 },
  { angle: 210, dist: 76 },
  { angle: 90,  dist: 78 }, // bottom
];

function Sparkle({ angle, dist, startDelay }: { angle: number; dist: number; startDelay: number }) {
  const rad = (angle * Math.PI) / 180;
  const tx  = useRef(new Animated.Value(0)).current;
  const ty  = useRef(new Animated.Value(0)).current;
  const opa = useRef(new Animated.Value(0)).current;
  const sc  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const t = setTimeout(() => {
      Animated.parallel([
        Animated.spring(tx,  { toValue: Math.cos(rad) * dist, tension: 120, friction: 10, useNativeDriver: ND }),
        Animated.spring(ty,  { toValue: Math.sin(rad) * dist, tension: 120, friction: 10, useNativeDriver: ND }),
        Animated.spring(sc,  { toValue: 1, tension: 260, friction: 8, useNativeDriver: ND }),
        Animated.sequence([
          Animated.timing(opa, { toValue: 1,   duration: 140, useNativeDriver: ND }),
          Animated.timing(opa, { toValue: 0,   duration: 480, useNativeDriver: ND }),
        ]),
      ]).start();
    }, startDelay);
    return () => clearTimeout(t);
  }, []);

  return (
    <Animated.View
      style={{
        position: "absolute",
        width: 10, height: 10, borderRadius: 5,
        backgroundColor: "rgba(255,255,255,0.9)",
        opacity: opa,
        transform: [{ translateX: tx }, { translateY: ty }, { scale: sc }],
      }}
    />
  );
}

/* ─── Pulsing ring ─── */
function Ring({ delay, size, speed = 2000 }: { delay: number; size: number; speed?: number }) {
  const sc  = useRef(new Animated.Value(0.4)).current;
  const opa = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(sc,  { toValue: 2.6,  duration: speed, useNativeDriver: ND }),
          Animated.sequence([
            Animated.timing(opa, { toValue: 0.38, duration: speed * 0.18, useNativeDriver: ND }),
            Animated.timing(opa, { toValue: 0,    duration: speed * 0.82, useNativeDriver: ND }),
          ]),
        ]),
        Animated.timing(sc, { toValue: 0.4, duration: 0, useNativeDriver: ND }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.View
      style={{
        position: "absolute",
        width: size, height: size, borderRadius: size / 2,
        borderWidth: 1.5,
        borderColor: "rgba(255,255,255,0.85)",
        opacity: opa,
        transform: [{ scale: sc }],
      }}
    />
  );
}

/* ─── Floating particle ─── */
const PARTICLES = [
  { id: 0, x: 0.07,  delay: 0,    size: 6,  op: 0.4,  speed: 3000 },
  { id: 1, x: 0.20,  delay: 400,  size: 10, op: 0.22, speed: 3400 },
  { id: 2, x: 0.83,  delay: 750,  size: 8,  op: 0.3,  speed: 2800 },
  { id: 3, x: 0.67,  delay: 160,  size: 5,  op: 0.45, speed: 2600 },
  { id: 4, x: 0.44,  delay: 1000, size: 12, op: 0.16, speed: 3600 },
  { id: 5, x: 0.57,  delay: 550,  size: 7,  op: 0.32, speed: 2900 },
  { id: 6, x: 0.32,  delay: 1200, size: 9,  op: 0.24, speed: 3200 },
  { id: 7, x: 0.91,  delay: 280,  size: 6,  op: 0.33, speed: 2700 },
  { id: 8, x: 0.14,  delay: 850,  size: 5,  op: 0.28, speed: 3100 },
  { id: 9, x: 0.75,  delay: 650,  size: 11, op: 0.18, speed: 3500 },
];

function Particle({ x, delay, size, op, speed }: typeof PARTICLES[0]) {
  const ty  = useRef(new Animated.Value(0)).current;
  const opa = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(ty,  { toValue: -(H * 0.6), duration: speed, useNativeDriver: ND }),
          Animated.sequence([
            Animated.timing(opa, { toValue: op, duration: speed * 0.25, useNativeDriver: ND }),
            Animated.timing(opa, { toValue: 0,  duration: speed * 0.45, delay: speed * 0.2, useNativeDriver: ND }),
          ]),
        ]),
        Animated.parallel([
          Animated.timing(ty,  { toValue: 0, duration: 0, useNativeDriver: ND }),
          Animated.timing(opa, { toValue: 0, duration: 0, useNativeDriver: ND }),
        ]),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.View
      style={{
        position: "absolute",
        left: x * W, bottom: 0,
        width: size, height: size, borderRadius: size / 2,
        backgroundColor: "#fff",
        opacity: opa, transform: [{ translateY: ty }],
      }}
    />
  );
}

/* ─── Shimmer stripe on icon ─── */
function Shimmer() {
  const x = useRef(new Animated.Value(-130)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(600),
        Animated.timing(x, { toValue: 150, duration: 550, useNativeDriver: ND }),
        Animated.timing(x, { toValue: -130, duration: 0,  useNativeDriver: ND }),
        Animated.delay(1200),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.View
      style={{
        position: "absolute", top: 0, bottom: 0, width: 55,
        backgroundColor: "rgba(255,255,255,0.22)",
        transform: [{ translateX: x }, { skewX: "-22deg" }],
        borderRadius: 2,
      }}
    />
  );
}

/* ─── Animated chip ─── */
function Chip({ label, delay }: { label: string; delay: number }) {
  const sc  = useRef(new Animated.Value(0)).current;
  const opa = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const t = setTimeout(() => {
      Animated.parallel([
        Animated.spring(sc,  { toValue: 1, tension: 240, friction: 11, useNativeDriver: ND }),
        Animated.timing(opa, { toValue: 1, duration: 200,               useNativeDriver: ND }),
      ]).start();
    }, delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <Animated.View style={[styles.chip, { opacity: opa, transform: [{ scale: sc }] }]}>
      <Text style={styles.chipText}>{label}</Text>
    </Animated.View>
  );
}

/* ─── Progress bar shine ─── */
function BarShine({ trackW }: { trackW: Animated.Value }) {
  const shineX = useRef(new Animated.Value(-40)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(800),
        Animated.timing(shineX, { toValue: W, duration: 900, useNativeDriver: ND }),
        Animated.timing(shineX, { toValue: -40, duration: 0, useNativeDriver: ND }),
        Animated.delay(600),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.View style={[styles.progressTrack, { width: W - 80 }]}>
      <Animated.View style={[styles.progressFill, { width: trackW }]}>
        <Animated.View
          style={{
            position: "absolute", top: 0, bottom: 0, width: 36,
            backgroundColor: "rgba(255,255,255,0.45)",
            transform: [{ translateX: shineX }, { skewX: "-20deg" }],
            borderRadius: 2,
          }}
        />
      </Animated.View>
    </Animated.View>
  );
}

/* ═══ MAIN SPLASH ════════════════════════════════════ */
const LETTERS = ["I", "P", "O", "S"];
const CHIPS   = ["Billing", "Analytics", "CRM", "Inventory"];

export default function SplashScreen() {
  /* Logo */
  const logoSc   = useRef(new Animated.Value(0.3)).current;
  const logoOpa  = useRef(new Animated.Value(0)).current;
  const logoRot  = useRef(new Animated.Value(-8)).current;
  /* Glow burst */
  const glowSc   = useRef(new Animated.Value(0.5)).current;
  const glowOpa  = useRef(new Animated.Value(0)).current;
  /* Tagline */
  const tagOpa   = useRef(new Animated.Value(0)).current;
  const tagY     = useRef(new Animated.Value(20)).current;
  /* Footer */
  const footerOpa= useRef(new Animated.Value(0)).current;
  /* Progress */
  const barW     = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    /* ① Logo springs in immediately (with slight rotation unwinding) */
    Animated.parallel([
      Animated.spring(logoSc,  { toValue: 1,  tension: 65, friction: 5.5, useNativeDriver: ND }),
      Animated.timing(logoOpa, { toValue: 1,  duration: 320,              useNativeDriver: ND }),
      Animated.spring(logoRot, { toValue: 0,  tension: 65, friction: 5.5, useNativeDriver: ND }),
    ]).start();

    /* ② Glow burst at 440ms */
    const t1 = setTimeout(() => {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(glowOpa, { toValue: 0.55, duration: 170, useNativeDriver: ND }),
          Animated.timing(glowSc,  { toValue: 2.2,  duration: 170, useNativeDriver: ND }),
        ]),
        Animated.parallel([
          Animated.timing(glowOpa, { toValue: 0, duration: 280, useNativeDriver: ND }),
        ]),
      ]).start();
    }, 440);

    /* ③ Tagline at 1020ms */
    const t2 = setTimeout(() => {
      Animated.parallel([
        Animated.timing(tagOpa, { toValue: 1, duration: 380, useNativeDriver: ND }),
        Animated.spring(tagY,   { toValue: 0, tension: 100, friction: 14, useNativeDriver: ND }),
      ]).start();
    }, 1020);

    /* ④ Footer at 1500ms */
    const t3 = setTimeout(() => {
      Animated.timing(footerOpa, { toValue: 1, duration: 350, useNativeDriver: ND }).start();
    }, 1500);

    /* ⑤ Progress bar fills across full duration */
    Animated.timing(barW, {
      toValue:  W - 80,
      duration: NAVIGATE_AT - 500,
      delay:    500,
      useNativeDriver: false, // width
    }).start();

    /* ⑥ Navigate */
    const t4 = setTimeout(() => router.replace("/auth/onboarding" as any), NAVIGATE_AT);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, []);

  return (
    <View style={styles.root}>
      {/* Background depth blobs */}
      <View style={[styles.blob, styles.blobTL]} />
      <View style={[styles.blob, styles.blobBR]} />
      <View style={[styles.blobSm, styles.blobTR]} />
      <View style={[styles.blobSm, styles.blobBL]} />

      {/* Floating particles */}
      {PARTICLES.map(p => <Particle key={p.id} {...p} />)}

      {/* ── Center stage ── */}
      <View style={styles.stage}>
        {/* Pulsing rings (staggered start) */}
        <Ring delay={0}    size={160} speed={2200} />
        <Ring delay={730}  size={160} speed={2200} />
        <Ring delay={1460} size={160} speed={2200} />

        {/* Glow burst */}
        <Animated.View style={[styles.glow, { opacity: glowOpa, transform: [{ scale: glowSc }] }]} />

        {/* Sparkles burst after logo lands */}
        {SPARKLE_DEFS.map((s, i) => (
          <Sparkle key={i} {...s} startDelay={460 + i * 30} />
        ))}

        {/* Logo icon */}
        <Animated.View
          style={[
            styles.iconWrap,
            { opacity: logoOpa, transform: [{ scale: logoSc }, { rotate: logoRot.interpolate({ inputRange: [-8, 0], outputRange: ["-8deg", "0deg"] }) }] },
          ]}
        >
          <View style={styles.iconBox}>
            <Feather name="shopping-bag" size={52} color="#fff" />
            <Shimmer />
          </View>
        </Animated.View>

        {/* "IPOS" — one letter at a time */}
        <View style={styles.nameRow}>
          {LETTERS.map((ch, i) => (
            <Letter key={ch} char={ch} delay={580 + i * 95} />
          ))}
        </View>

        {/* Tagline */}
        <Animated.Text style={[styles.tagline, { opacity: tagOpa, transform: [{ translateY: tagY }] }]}>
          Smart POS for Growing Businesses
        </Animated.Text>

        {/* Feature chips */}
        <View style={styles.chips}>
          {CHIPS.map((label, i) => (
            <Chip key={label} label={label} delay={1260 + i * 90} />
          ))}
        </View>
      </View>

      {/* Footer — progress bar */}
      <Animated.View style={[styles.footer, { opacity: footerOpa }]}>
        <BarShine trackW={barW} />
        <Text style={styles.version}>v1.0.0</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root:     { flex: 1, backgroundColor: PRIMARY, alignItems: "center", justifyContent: "space-between", paddingTop: Platform.OS === "web" ? 68 : 92, paddingBottom: 44, overflow: "hidden" },

  blob:     { position: "absolute", width: 320, height: 320, borderRadius: 160, backgroundColor: "#6366F1", opacity: 0.28 },
  blobTL:   { top: -130, left: -130 },
  blobBR:   { bottom: -130, right: -130 },
  blobSm:   { position: "absolute", width: 200, height: 200, borderRadius: 100, backgroundColor: "#818CF8", opacity: 0.2 },
  blobTR:   { top: 30,  right: -70 },
  blobBL:   { bottom: 70, left: -55 },

  stage:    { alignItems: "center", gap: 20 },
  glow:     { position: "absolute", width: 200, height: 200, borderRadius: 100, backgroundColor: "#fff" },

  iconWrap: { alignItems: "center", justifyContent: "center" },
  iconBox:  { width: 124, height: 124, borderRadius: 38, backgroundColor: "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "rgba(255,255,255,0.42)", overflow: "hidden" },

  nameRow:  { flexDirection: "row", gap: 2, marginTop: 4 },
  letter:   { fontSize: 54, color: "#fff", fontWeight: "900", letterSpacing: 2 },

  tagline:  { fontSize: 15, color: "rgba(255,255,255,0.82)", textAlign: "center", paddingHorizontal: 36, lineHeight: 23 },

  chips:    { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center", marginTop: 2 },
  chip:     { backgroundColor: "rgba(255,255,255,0.14)", paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.26)" },
  chipText: { color: "rgba(255,255,255,0.9)", fontSize: 12, fontWeight: "600" },

  footer:       { alignItems: "center", gap: 14, width: "100%" },
  progressTrack:{ height: 3, backgroundColor: "rgba(255,255,255,0.18)", borderRadius: 2, overflow: "hidden" },
  progressFill: { height: 3, backgroundColor: "#fff", borderRadius: 2, overflow: "hidden" },
  version:      { fontSize: 12, color: "rgba(255,255,255,0.4)" },
});
