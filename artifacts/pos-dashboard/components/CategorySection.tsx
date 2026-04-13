import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

const CATEGORIES = [
  { name: "Food & Bev", pct: 34, revenue: "₹2.4L", color: "#4F46E5" },
  { name: "Electronics", pct: 22, revenue: "₹1.55L", color: "#06B6D4" },
  { name: "Clothing", pct: 18, revenue: "₹1.27L", color: "#8B5CF6" },
  { name: "Home & Living", pct: 14, revenue: "₹98.7K", color: "#10B981" },
  { name: "Books", pct: 7, revenue: "₹49.3K", color: "#F59E0B" },
  { name: "Others", pct: 5, revenue: "₹35.2K", color: "#EF4444" },
];

export function CategorySection() {
  const colors = useColors();

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.heading, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
        Sales by Category
      </Text>

      <View style={styles.pieRow}>
        <View style={styles.pieWrap}>
          <PieChart data={CATEGORIES} />
        </View>
        <View style={styles.legend}>
          {CATEGORIES.map((cat) => (
            <View key={cat.name} style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: cat.color }]} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.catName, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
                  {cat.name}
                </Text>
                <Text style={[styles.catPct, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  {cat.pct}% · {cat.revenue}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

function PieChart({ data }: { data: typeof CATEGORIES }) {
  const size = 110;
  const cx = size / 2;
  const cy = size / 2;
  const r = 38;
  const innerR = 22;
  let cumulative = 0;

  const slices = data.map((d) => {
    const start = cumulative;
    const pct = d.pct / 100;
    cumulative += pct;
    return { ...d, start, end: cumulative, pct };
  });

  function polarToCart(cx: number, cy: number, r: number, angle: number) {
    const rad = (angle - 0.25) * 2 * Math.PI;
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad),
    };
  }

  const colors = useColors();

  return (
    <View style={{ width: size, height: size }}>
      {slices.map((slice, i) => {
        const startAngle = slice.start;
        const endAngle = slice.end;
        const midAngle = (startAngle + endAngle) / 2;
        const p1 = polarToCart(cx, cy, r, startAngle);
        const p2 = polarToCart(cx, cy, r, endAngle);
        const ip1 = polarToCart(cx, cy, innerR, endAngle);
        const ip2 = polarToCart(cx, cy, innerR, startAngle);
        const largeArc = slice.pct > 0.5 ? 1 : 0;
        const segW = ((r - innerR) * 2 * Math.PI * slice.pct) / 1;
        const offset = 1.5;
        const dx = Math.cos((midAngle - 0.25) * 2 * Math.PI) * offset;
        const dy = Math.sin((midAngle - 0.25) * 2 * Math.PI) * offset;

        return (
          <View
            key={i}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: size,
              height: size,
            }}
          >
            <View
              style={{
                position: "absolute",
                left: p1.x - 4 + dx,
                top: p1.y - 4 + dy,
                width: 8,
                height: 8,
                backgroundColor: slice.color,
                opacity: 0,
              }}
            />
          </View>
        );
      })}
      <DonutChart slices={slices} size={size} />
    </View>
  );
}

function DonutChart({
  slices,
  size,
}: {
  slices: Array<{ color: string; pct: number; start: number; end: number }>;
  size: number;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const outerR = 46;
  const innerR = 28;
  const gap = 0.004;

  return (
    <View style={{ width: size, height: size }}>
      {slices.map((slice, i) => {
        const segments = 20;
        return (
          <ArcSegment
            key={i}
            cx={cx}
            cy={cy}
            outerR={outerR}
            innerR={innerR}
            startFrac={slice.start + gap}
            endFrac={slice.end - gap}
            color={slice.color}
            size={size}
          />
        );
      })}
      <View
        style={{
          position: "absolute",
          left: cx - innerR,
          top: cy - innerR,
          width: innerR * 2,
          height: innerR * 2,
          borderRadius: innerR,
          backgroundColor: "#FFFFFF",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ fontSize: 9, color: "#6B7280", fontFamily: "Inter_400Regular" }}>Sales</Text>
        <Text style={{ fontSize: 11, color: "#0f0f23", fontFamily: "Inter_700Bold" }}>Mix</Text>
      </View>
    </View>
  );
}

function ArcSegment({
  cx,
  cy,
  outerR,
  innerR,
  startFrac,
  endFrac,
  color,
  size,
}: {
  cx: number;
  cy: number;
  outerR: number;
  innerR: number;
  startFrac: number;
  endFrac: number;
  color: string;
  size: number;
}) {
  const steps = Math.max(1, Math.round((endFrac - startFrac) * 60));
  const boxes: Array<{ x: number; y: number; angle: number }> = [];

  for (let i = 0; i <= steps; i++) {
    const frac = startFrac + (endFrac - startFrac) * (i / steps);
    const angle = (frac - 0.25) * 2 * Math.PI;
    const midR = (outerR + innerR) / 2;
    boxes.push({
      x: cx + midR * Math.cos(angle),
      y: cy + midR * Math.sin(angle),
      angle: frac * 360,
    });
  }

  const thickness = outerR - innerR;
  const arcLen = Math.abs(endFrac - startFrac) * 2 * Math.PI * ((outerR + innerR) / 2);
  const boxCount = Math.max(1, Math.round(arcLen / (thickness * 0.6)));

  const finalBoxes: Array<{ x: number; y: number; angle: number }> = [];
  for (let i = 0; i < boxCount; i++) {
    const frac = startFrac + (endFrac - startFrac) * (i / boxCount);
    const angle = (frac - 0.25) * 2 * Math.PI;
    const midR = (outerR + innerR) / 2;
    finalBoxes.push({
      x: cx + midR * Math.cos(angle),
      y: cy + midR * Math.sin(angle),
      angle: frac * 360 - 90,
    });
  }

  return (
    <>
      {finalBoxes.map((b, i) => (
        <View
          key={i}
          style={{
            position: "absolute",
            left: b.x - thickness / 2,
            top: b.y - thickness / 2,
            width: thickness + 1,
            height: thickness + 1,
            backgroundColor: color,
            transform: [{ rotate: `${b.angle}deg` }],
          }}
        />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
  },
  heading: {
    fontSize: 16,
    marginBottom: 14,
  },
  pieRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  pieWrap: {
    width: 110,
    height: 110,
  },
  legend: {
    flex: 1,
    gap: 6,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  catName: {
    fontSize: 12,
  },
  catPct: {
    fontSize: 11,
  },
});
