import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";

const { width: W, height: H } = Dimensions.get("window");
const ND       = Platform.OS !== "web";
const PRIMARY  = "#4F46E5";
const LIGHT    = "#6366F1";
const DURATION = 3000;

/* ─── Floating particle ─────────────────────────── */
const PARTICLES = [
  { id: 0, x: 0.08, startY: 0.85, delay: 0,    size: 7,  op: 0.35 },
  { id: 1, x: 0.22, startY: 0.75, delay: 350,  size: 11, op: 0.2  },
  { id: 2, x: 0.82, startY: 0.8,  delay: 700,  size: 8,  op: 0.28 },
  { id: 3, x: 0.68, startY: 0.9,  delay: 150,  size: 5,  op: 0.4  },
  { id: 4, x: 0.45, startY: 0.7,  delay: 900,  size: 13, op: 0.15 },
  { id: 5, x: 0.58, startY: 0.82, delay: 500,  size: 7,  op: 0.3  },
  { id: 6, x: 0.33, startY: 0.78, delay: 1100, size: 9,  op: 0.22 },
  { id: 7, x: 0.9,  startY: 0.88, delay: 250,  size: 6,  op: 0.3  },
  { id: 8, x: 0.15, startY: 0.6,  delay: 800,  size: 5,  op: 0.25 },
  { id: 9, x: 0.76, startY: 0.65, delay: 600,  size: 10, op: 0.18 },
];

function Particle({ x, startY, delay, size, op }: typeof PARTICLES[0]) {
  const ty  = useRef(new Animated.Value(0)).current;
  const opa = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(ty,  { toValue: -(H * 0.55), duration: 2800, useNativeDriver: ND }),
          Animated.sequence([
            Animated.timing(opa, { toValue: op, duration: 700,  useNativeDriver: ND }),
            Animated.timing(opa, { toValue: 0,  duration: 1400, delay: 400, useNativeDriver: ND }),
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
        position:    "absolute",
        left:        x * W,
        top:         startY * H,
        width:       size,
        height:      size,
        borderRadius:size / 2,
        backgroundColor: "#fff",
        opacity:     opa,
        transform:   [{ translateY: ty }],
      }}
    />
  );
}

/* ─── Pulsing ring ───────────────────────────────── */
function Ring({ delay, size }: { delay: number; size: number }) {
  const sc  = useRef(new Animated.Value(0.5)).current;
  const opa = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(sc,  { toValue: 2.2, duration: 2000, useNativeDriver: ND }),
          Animated.sequence([
            Animated.timing(opa, { toValue: 0.3, duration: 300,  useNativeDriver: ND }),
            Animated.timing(opa, { toValue: 0,   duration: 1700, useNativeDriver: ND }),
          ]),
        ]),
        Animated.timing(sc, { toValue: 0.5, duration: 0, useNativeDriver: ND }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.View
      style={{
        position:    "absolute",
        width:       size,
        height:      size,
        borderRadius:size / 2,
        borderWidth: 1.5,
        borderColor: "rgba(255,255,255,0.9)",
        opacity:     opa,
        transform:   [{ scale: sc }],
      }}
    />
  );
}

/* ─── Shimmer stripe ─────────────────────────────── */
function Shimmer() {
  const x = useRef(new Animated.Value(-120)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(900),
        Animated.timing(x, { toValue: 140, duration: 700, useNativeDriver: ND }),
        Animated.timing(x, { toValue: -120, duration: 0,  useNativeDriver: ND }),
        Animated.delay(1600),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.View
      style={{
        position:        "absolute",
        top:             0,
        bottom:          0,
        width:           60,
        backgroundColor: "rgba(255,255,255,0.18)",
        transform:       [{ translateX: x }, { skewX: "-20deg" }],
        borderRadius:    4,
      }}
    />
  );
}

/* ─── Main splash ────────────────────────────────── */
export default function SplashScreen() {
  const logoSc   = useRef(new Animated.Value(0.2)).current;
  const logoOpa  = useRef(new Animated.Value(0)).current;
  const glowSc   = useRef(new Animated.Value(0.6)).current;
  const glowOpa  = useRef(new Animated.Value(0)).current;
  const nameOpa  = useRef(new Animated.Value(0)).current;
  const nameY    = useRef(new Animated.Value(24)).current;
  const tagOpa   = useRef(new Animated.Value(0)).current;
  const barW     = useRef(new Animated.Value(0)).current;
  const footerOpa= useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      /* 1. Logo bounces in */
      Animated.parallel([
        Animated.spring(logoSc,  { toValue: 1, tension: 55, friction: 6, useNativeDriver: ND }),
        Animated.timing(logoOpa, { toValue: 1, duration: 400,            useNativeDriver: ND }),
      ]),
      /* 2. Glow burst */
      Animated.parallel([
        Animated.timing(glowOpa, { toValue: 0.45, duration: 220, useNativeDriver: ND }),
        Animated.timing(glowSc,  { toValue: 1.8,  duration: 220, useNativeDriver: ND }),
      ]),
      Animated.parallel([
        Animated.timing(glowOpa, { toValue: 0, duration: 300, useNativeDriver: ND }),
        /* 3. Name slides up while glow fades */
        Animated.timing(nameY,   { toValue: 0, duration: 300, useNativeDriver: ND }),
        Animated.timing(nameOpa, { toValue: 1, duration: 300, useNativeDriver: ND }),
      ]),
      /* 4. Tagline */
      Animated.timing(tagOpa, { toValue: 1, duration: 350, useNativeDriver: ND }),
      /* 5. Footer */
      Animated.timing(footerOpa, { toValue: 1, duration: 300, useNativeDriver: ND }),
    ]).start();

    /* Progress bar fills across full duration */
    Animated.timing(barW, {
      toValue:  W - 80,
      duration: DURATION - 300,
      delay:    300,
      useNativeDriver: false,
    }).start();

    const t = setTimeout(() => router.replace("/auth/onboarding" as any), DURATION);
    return () => clearTimeout(t);
  }, []);

  return (
    <View style={styles.root}>
      {/* Background decoration blobs */}
      <View style={[styles.blob, styles.blobTL]} />
      <View style={[styles.blob, styles.blobBR]} />
      <View style={[styles.blobSm, styles.blobTR]} />
      <View style={[styles.blobSm, styles.blobBL]} />

      {/* Floating particles */}
      {PARTICLES.map(p => <Particle key={p.id} {...p} />)}

      {/* Center stage */}
      <View style={styles.stage}>
        {/* Rings */}
        <Ring delay={0}    size={160} />
        <Ring delay={700}  size={160} />
        <Ring delay={1400} size={160} />

        {/* Glow burst */}
        <Animated.View
          style={[styles.glow, { opacity: glowOpa, transform: [{ scale: glowSc }] }]}
        />

        {/* Icon box */}
        <Animated.View
          style={[styles.iconWrap, { opacity: logoOpa, transform: [{ scale: logoSc }] }]}
        >
          <View style={styles.iconBox}>
            <Feather name="shopping-bag" size={52} color="#fff" />
            <Shimmer />
          </View>
        </Animated.View>

        {/* App name */}
        <Animated.Text
          style={[styles.appName, { opacity: nameOpa, transform: [{ translateY: nameY }] }]}
        >
          IPOS
        </Animated.Text>

        {/* Tagline */}
        <Animated.Text style={[styles.tagline, { opacity: tagOpa }]}>
          Smart POS for Growing Businesses
        </Animated.Text>

        {/* Feature chips */}
        <Animated.View style={[styles.chips, { opacity: tagOpa }]}>
          {["Billing", "Analytics", "CRM", "Inventory"].map(f => (
            <View key={f} style={styles.chip}>
              <Text style={styles.chipText}>{f}</Text>
            </View>
          ))}
        </Animated.View>
      </View>

      {/* Footer — progress bar + version */}
      <Animated.View style={[styles.footer, { opacity: footerOpa }]}>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, { width: barW }]} />
        </View>
        <Text style={styles.version}>v1.0.0</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root:         { flex: 1, backgroundColor: PRIMARY, alignItems: "center", justifyContent: "space-between", paddingTop: Platform.OS === "web" ? 72 : 96, paddingBottom: 44, overflow: "hidden" },

  /* Blobs */
  blob:         { position: "absolute", width: 300, height: 300, borderRadius: 150, backgroundColor: LIGHT, opacity: 0.25 },
  blobTL:       { top: -120, left: -120 },
  blobBR:       { bottom: -120, right: -120 },
  blobSm:       { position: "absolute", width: 180, height: 180, borderRadius: 90, backgroundColor: "#818CF8", opacity: 0.18 },
  blobTR:       { top: 40,  right: -60 },
  blobBL:       { bottom: 80, left: -50 },

  /* Stage */
  stage:        { alignItems: "center", gap: 18 },
  glow:         { position: "absolute", width: 180, height: 180, borderRadius: 90, backgroundColor: "#fff" },

  /* Icon */
  iconWrap:     { alignItems: "center", justifyContent: "center" },
  iconBox:      { width: 120, height: 120, borderRadius: 36, backgroundColor: "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "rgba(255,255,255,0.4)", overflow: "hidden" },

  /* Text */
  appName:      { fontSize: 52, color: "#fff", fontWeight: "900", letterSpacing: 4 },
  tagline:      { fontSize: 15, color: "rgba(255,255,255,0.82)", textAlign: "center", paddingHorizontal: 32, lineHeight: 22 },

  /* Chips */
  chips:        { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center", marginTop: 4 },
  chip:         { backgroundColor: "rgba(255,255,255,0.15)", paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.25)" },
  chipText:     { color: "rgba(255,255,255,0.9)", fontSize: 12, fontWeight: "600" },

  /* Footer */
  footer:       { alignItems: "center", gap: 14, width: "100%" },
  progressTrack:{ width: W - 80, height: 3, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 2, overflow: "hidden" },
  progressFill: { height: 3, backgroundColor: "#fff", borderRadius: 2 },
  version:      { fontSize: 12, color: "rgba(255,255,255,0.45)" },
});
