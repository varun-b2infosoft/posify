import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

interface StatCardProps {
  title: string;
  value: string;
  trend: number;
  subtext: string;
  icon: string;
  accentColor?: string;
}

export function StatCard({ title, value, trend, subtext, icon, accentColor }: StatCardProps) {
  const colors = useColors();
  const isPositive = trend >= 0;
  const trendColor = isPositive ? colors.success : colors.destructive;

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: accentColor ? accentColor + "20" : colors.secondary }]}>
          <Feather name={icon as any} size={16} color={accentColor || colors.primary} />
        </View>
        <View style={[styles.trendBadge, { backgroundColor: trendColor + "18" }]}>
          <Feather
            name={isPositive ? "trending-up" : "trending-down"}
            size={11}
            color={trendColor}
          />
          <Text style={[styles.trendText, { color: trendColor }]}>
            {Math.abs(trend)}%
          </Text>
        </View>
      </View>
      <Text style={[styles.value, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>{value}</Text>
      <Text style={[styles.title, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>{title}</Text>
      <Text style={[styles.subtext, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{subtext}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    minWidth: "47%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 20,
  },
  trendText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  value: {
    fontSize: 22,
    marginBottom: 2,
  },
  title: {
    fontSize: 12,
    marginBottom: 2,
  },
  subtext: {
    fontSize: 10,
  },
});
