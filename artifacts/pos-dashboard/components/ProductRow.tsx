import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

interface ProductRowProps {
  rank: number;
  name: string;
  category: string;
  unitsSold: number;
  revenue: string;
  isTop: boolean;
  isFirst?: boolean;
}

export function ProductRow({ rank, name, category, unitsSold, revenue, isTop, isFirst }: ProductRowProps) {
  const colors = useColors();

  return (
    <View style={[styles.row, { borderBottomColor: colors.border }]}>
      <View style={[
        styles.rankBadge,
        {
          backgroundColor: isFirst
            ? colors.primary
            : isTop
            ? colors.secondary
            : "#FEF3C7",
        },
      ]}>
        {isFirst ? (
          <Feather name="award" size={12} color="#fff" />
        ) : (
          <Text style={[
            styles.rankText,
            { color: isTop ? colors.primary : colors.warning, fontFamily: "Inter_700Bold" }
          ]}>
            {rank}
          </Text>
        )}
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={[styles.name, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}
          numberOfLines={1}
        >
          {name}
        </Text>
        <Text style={[styles.cat, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          {category}
        </Text>
      </View>
      <View style={styles.stats}>
        <Text style={[styles.revenue, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
          {revenue}
        </Text>
        <Text style={[styles.units, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          {unitsSold} units
        </Text>
      </View>
      {!isTop && (
        <Feather name="alert-triangle" size={14} color={colors.warning} style={{ marginLeft: 4 }} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  rankText: {
    fontSize: 13,
  },
  name: {
    fontSize: 13,
    marginBottom: 1,
  },
  cat: {
    fontSize: 11,
  },
  stats: {
    alignItems: "flex-end",
  },
  revenue: {
    fontSize: 13,
  },
  units: {
    fontSize: 11,
  },
});
