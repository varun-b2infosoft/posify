import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

interface StockItem {
  name: string;
  qty: number;
  unit: string;
  critical: boolean;
}

export function LowStockAlert({ items }: { items: StockItem[] }) {
  const colors = useColors();

  return (
    <View style={[styles.card, { backgroundColor: "#FFF8F0", borderColor: "#FED7AA" }]}>
      <View style={styles.headerRow}>
        <View style={styles.iconWrap}>
          <Feather name="alert-circle" size={16} color="#EA580C" />
        </View>
        <Text style={[styles.heading, { color: "#9A3412", fontFamily: "Inter_600SemiBold" }]}>
          Low Stock Alerts
        </Text>
        <View style={styles.badge}>
          <Text style={[styles.badgeText, { fontFamily: "Inter_700Bold" }]}>{items.length}</Text>
        </View>
      </View>
      {items.map((item, idx) => (
        <View
          key={idx}
          style={[
            styles.itemRow,
            idx < items.length - 1 && { borderBottomColor: "#FED7AA", borderBottomWidth: 1 },
          ]}
        >
          <View
            style={[
              styles.dot,
              { backgroundColor: item.critical ? "#EF4444" : "#F59E0B" },
            ]}
          />
          <Text style={[styles.itemName, { color: "#7C2D12", fontFamily: "Inter_500Medium" }]} numberOfLines={1}>
            {item.name}
          </Text>
          <View
            style={[
              styles.qtyBadge,
              { backgroundColor: item.critical ? "#FEE2E2" : "#FEF9C3" },
            ]}
          >
            <Text
              style={[
                styles.qtyText,
                { color: item.critical ? "#B91C1C" : "#854D0E", fontFamily: "Inter_600SemiBold" },
              ]}
            >
              {item.qty} {item.unit}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#FED7AA",
    alignItems: "center",
    justifyContent: "center",
  },
  heading: {
    fontSize: 14,
    flex: 1,
  },
  badge: {
    backgroundColor: "#EA580C",
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  itemName: {
    flex: 1,
    fontSize: 13,
  },
  qtyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  qtyText: {
    fontSize: 12,
  },
});
