import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useColors } from "@/hooks/useColors";

const DAY_DATA = [42000, 38000, 55000, 49000, 61000, 57000, 72400];
const WEEK_DATA = [180000, 215000, 198000, 234000, 221000, 267000, 295000];
const MONTH_DATA = [890000, 920000, 1050000, 980000, 1120000, 1050000, 1240000];
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const WEEK_LABELS = ["W1", "W2", "W3", "W4", "W5", "W6", "W7"];
const MONTH_LABELS = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan"];

const TABS = ["Day", "Week", "Month"] as const;
type Tab = typeof TABS[number];

function formatAmount(n: number) {
  if (n >= 100000) return "₹" + (n / 100000).toFixed(1) + "L";
  if (n >= 1000) return "₹" + (n / 1000).toFixed(0) + "K";
  return "₹" + n;
}

export function RevenueChart() {
  const colors = useColors();
  const [tab, setTab] = useState<Tab>("Day");

  const data = tab === "Day" ? DAY_DATA : tab === "Week" ? WEEK_DATA : MONTH_DATA;
  const labels = tab === "Day" ? DAY_LABELS : tab === "Week" ? WEEK_LABELS : MONTH_LABELS;
  const max = Math.max(...data, 1);
  const chartH = 100;
  const totalOrders = tab === "Day" ? 284 : tab === "Week" ? 1847 : 7234;
  const totalRevenue = data.reduce((a, b) => a + b, 0);

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.topRow}>
        <View>
          <Text style={[styles.label, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>Total Revenue</Text>
          <Text style={[styles.revenueVal, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            {formatAmount(totalRevenue)}
          </Text>
          <Text style={[styles.ordersLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            {totalOrders.toLocaleString()} orders
          </Text>
        </View>
        <View style={styles.tabRow}>
          {TABS.map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setTab(t)}
              style={[
                styles.tabBtn,
                t === tab && { backgroundColor: colors.primary },
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: t === tab ? "#fff" : colors.mutedForeground, fontFamily: "Inter_500Medium" },
                ]}
              >
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={[styles.chartArea, { height: chartH + 24 }]}>
        <View style={styles.bars}>
          {data.map((val, idx) => {
            const barH = Math.max((val / max) * chartH, 6);
            const isLast = idx === data.length - 1;
            return (
              <View key={idx} style={styles.barCol}>
                <View style={[styles.barBg, { height: chartH }]}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: barH,
                        backgroundColor: isLast ? colors.primary : colors.primary + "50",
                        borderRadius: 5,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.barLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  {labels[idx]}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={[styles.peakRow, { backgroundColor: colors.secondary }]}>
        <Text style={[styles.peakText, { color: colors.primary, fontFamily: "Inter_500Medium" }]}>
          Peak: {tab === "Day" ? "6–8 PM" : tab === "Week" ? "Saturday" : "December"} · {formatAmount(max)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    marginBottom: 2,
  },
  revenueVal: {
    fontSize: 28,
    marginBottom: 2,
  },
  ordersLabel: {
    fontSize: 12,
  },
  tabRow: {
    flexDirection: "row",
    gap: 4,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    padding: 3,
  },
  tabBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  tabText: {
    fontSize: 12,
  },
  chartArea: {
    marginBottom: 12,
  },
  bars: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
    paddingBottom: 20,
  },
  barCol: {
    flex: 1,
    alignItems: "center",
  },
  barBg: {
    width: "100%",
    justifyContent: "flex-end",
  },
  bar: {
    width: "100%",
  },
  barLabel: {
    fontSize: 10,
    marginTop: 4,
  },
  peakRow: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    alignItems: "center",
  },
  peakText: {
    fontSize: 12,
  },
});
