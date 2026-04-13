import React, { useCallback, useState } from "react";
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { getShops, getSelectedShopId, setSelectedShop, subscribeShops, Shop } from "@/store/shops";

const DATE_RANGES = ["Today", "Week", "Month"] as const;
type DateRange = typeof DATE_RANGES[number];

interface DashboardHeaderProps {
  selectedRange: DateRange;
  onRangeChange: (r: DateRange) => void;
  notifCount: number;
  onMenuPress: () => void;
}

export function DashboardHeader({ selectedRange, onRangeChange, notifCount, onMenuPress }: DashboardHeaderProps) {
  const colors      = useColors();
  const insets      = useSafeAreaInsets();
  const topPad      = Platform.OS === "web" ? 67 : insets.top;

  const [shops,      setShops]      = useState<Shop[]>(() => getShops());
  const [selectedId, setSelectedId] = useState<string>(() => getSelectedShopId());
  const [shopOpen,   setShopOpen]   = useState(false);

  useFocusEffect(useCallback(() => {
    setShops(getShops());
    setSelectedId(getSelectedShopId());
    return subscribeShops(() => {
      setShops(getShops());
      setSelectedId(getSelectedShopId());
    });
  }, []));

  const selectedShop = selectedId === "ALL" ? null : shops.find(s => s.id === selectedId);
  const shopLabel    = selectedShop?.name ?? "All Shops";
  const shopColor    = selectedShop?.color ?? "rgba(255,255,255,0.7)";

  const handleSelectShop = (id: string) => {
    setSelectedShop(id);
    setSelectedId(id);
    setShopOpen(false);
  };

  const summaryByShop = () => {
    if (!selectedShop) return "₹72,400 in sales today · 284 orders";
    const todayStr = `₹${Math.round(selectedShop.todaySales / 1000)}k`;
    return `${todayStr} in sales today · ${selectedShop.totalOrders} orders`;
  };

  return (
    <>
      <View style={[styles.container, { paddingTop: topPad + 10, backgroundColor: colors.primary }]}>
        <View style={styles.row}>
          <View style={styles.left}>
            <TouchableOpacity onPress={onMenuPress} style={styles.hamburger}>
              <Feather name="menu" size={22} color="#fff" />
            </TouchableOpacity>
            <View>
              <View style={styles.logoRow}>
                <Feather name="shopping-bag" size={16} color="rgba(255,255,255,0.9)" />
                <Text style={[styles.appName, { fontFamily: "Inter_700Bold" }]}>POSify</Text>
              </View>
              <TouchableOpacity style={styles.shopSelector} onPress={() => setShopOpen(true)}>
                <View style={[styles.shopDot, { backgroundColor: selectedShop?.color ?? "rgba(255,255,255,0.4)" }]} />
                <Text style={[styles.shopName, { fontFamily: "Inter_500Medium" }]}>{shopLabel}</Text>
                <Feather name="chevron-down" size={10} color="rgba(255,255,255,0.7)" />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.iconBtn}>
              <Feather name="bell" size={20} color="#fff" />
              {notifCount > 0 && (
                <View style={styles.notifBadge}>
                  <Text style={[styles.notifText, { fontFamily: "Inter_700Bold" }]}>{notifCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <View style={styles.avatar}>
              <Text style={[styles.avatarText, { fontFamily: "Inter_700Bold" }]}>A</Text>
            </View>
          </View>
        </View>

        <Text style={[styles.summary, { fontFamily: "Inter_500Medium" }]}>
          {summaryByShop()}
        </Text>

        <View style={styles.rangeRow}>
          {DATE_RANGES.map((r) => (
            <TouchableOpacity
              key={r}
              onPress={() => onRangeChange(r)}
              style={[
                styles.rangeBtn,
                r === selectedRange && { backgroundColor: "rgba(255,255,255,0.25)" },
              ]}
            >
              <Text
                style={[
                  styles.rangeText,
                  { fontFamily: "Inter_500Medium" },
                  r === selectedRange && { color: "#fff" },
                ]}
              >
                {r}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Shop picker modal */}
      <Modal visible={shopOpen} transparent animationType="slide" onRequestClose={() => setShopOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: colors.card }]}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Select Shop</Text>
              <TouchableOpacity onPress={() => setShopOpen(false)}>
                <Feather name="x" size={20} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>

            {/* All shops option */}
            <TouchableOpacity
              style={[styles.shopOption, {
                borderColor: selectedId === "ALL" ? "#4F46E5" : colors.border,
                backgroundColor: selectedId === "ALL" ? "#4F46E510" : colors.background,
              }]}
              onPress={() => handleSelectShop("ALL")}
            >
              <View style={[styles.shopOptionIcon, { backgroundColor: "#4F46E520" }]}>
                <Feather name="layers" size={18} color="#4F46E5" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.shopOptionName, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>All Shops</Text>
                <Text style={[styles.shopOptionSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  {shops.filter(s => s.active).length} active shops
                </Text>
              </View>
              {selectedId === "ALL" && <Feather name="check-circle" size={18} color="#4F46E5" />}
            </TouchableOpacity>

            {shops.map(shop => {
              const isSelected = selectedId === shop.id;
              return (
                <TouchableOpacity
                  key={shop.id}
                  style={[styles.shopOption, {
                    borderColor: isSelected ? shop.color : colors.border,
                    backgroundColor: isSelected ? shop.color + "10" : colors.background,
                    opacity: shop.active ? 1 : 0.5,
                  }]}
                  onPress={() => handleSelectShop(shop.id)}
                >
                  <View style={[styles.shopOptionIcon, { backgroundColor: shop.color + "20" }]}>
                    <Feather name="shopping-bag" size={18} color={shop.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      <Text style={[styles.shopOptionName, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>{shop.name}</Text>
                      {!shop.active && (
                        <View style={{ backgroundColor: "#FEE2E2", paddingHorizontal: 5, paddingVertical: 1, borderRadius: 5 }}>
                          <Text style={{ color: "#B91C1C", fontSize: 9, fontFamily: "Inter_600SemiBold" }}>Inactive</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.shopOptionSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]} numberOfLines={1}>
                      ₹{Math.round(shop.todaySales / 1000)}k today · {shop.totalOrders} orders
                    </Text>
                  </View>
                  {isSelected && <Feather name="check-circle" size={18} color={shop.color} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  hamburger: {
    padding: 2,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  appName: {
    color: "#fff",
    fontSize: 18,
    letterSpacing: -0.3,
  },
  shopSelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 2,
  },
  shopDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  shopName: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 11,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBtn: {
    position: "relative",
  },
  notifBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#EF4444",
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  notifText: {
    color: "#fff",
    fontSize: 9,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
  },
  avatarText: {
    color: "#fff",
    fontSize: 14,
  },
  summary: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 13,
    marginBottom: 10,
  },
  rangeRow: {
    flexDirection: "row",
    gap: 6,
  },
  rangeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
  },
  rangeText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 16,
    gap: 10,
    paddingBottom: 40,
  },
  modalHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E5E7EB",
    alignSelf: "center",
    marginBottom: 4,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  modalTitle: { fontSize: 17 },
  shopOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 12,
  },
  shopOptionIcon: {
    width: 42,
    height: 42,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  shopOptionName: { fontSize: 14, marginBottom: 2 },
  shopOptionSub:  { fontSize: 12 },
});
