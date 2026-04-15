import React, { useEffect, useState } from "react";
import {
  Alert,
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
import { useColors } from "@/hooks/useColors";
import CustomerBottomNav from "@/components/CustomerBottomNav";
import {
  CUSTOMER_PRIMARY,
  CUSTOMER_AMBER,
  getCustomerProfile,
  getLoyaltyByShop,
  subscribeCustomerApp,
  CustomerProfile,
  ShopLoyalty,
} from "@/store/customerApp";

const REDEEM_OPTIONS = [
  { pts: 100,  discount: 10,  label: "₹10 off"  },
  { pts: 250,  discount: 25,  label: "₹25 off"  },
  { pts: 500,  discount: 55,  label: "₹55 off"  },
  { pts: 1000, discount: 120, label: "₹120 off" },
];

export default function LoyaltyScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 60 : insets.top;

  const [profile, setProfile] = useState<CustomerProfile>(getCustomerProfile());
  const [loyalty, setLoyalty] = useState<ShopLoyalty[]>(getLoyaltyByShop());

  useEffect(() => {
    return subscribeCustomerApp(() => {
      setProfile(getCustomerProfile());
      setLoyalty(getLoyaltyByShop());
    });
  }, []);

  const totalPts   = loyalty.reduce((s, l) => s + l.points, 0);
  const totalSpent = loyalty.reduce((s, l) => s + l.totalSpent, 0);

  const handleRedeem = (opt: (typeof REDEEM_OPTIONS)[0]) => {
    if (profile.loyaltyPoints < opt.pts) {
      Alert.alert("Not enough points", `You need ${opt.pts} points. You have ${profile.loyaltyPoints}.`);
      return;
    }
    Alert.alert(
      "Redeem Points",
      `Convert ${opt.pts} points to ${opt.label}?`,
      [
        { text: "Cancel",  style: "cancel"  },
        { text: "Redeem",  onPress: () => Alert.alert("Coupon Applied!", `${opt.label} coupon applied. Use it at checkout.`) },
      ]
    );
  };

  const tierPts = profile.loyaltyPoints;
  const tierInfo =
    tierPts >= 2000 ? { name: "Platinum", color: "#8B5CF6", icon: "award" }
    : tierPts >= 1000 ? { name: "Gold",   color: CUSTOMER_AMBER, icon: "star"  }
    : tierPts >= 500  ? { name: "Silver", color: "#6B7280",      icon: "shield"}
    :                   { name: "Bronze", color: "#92400E",      icon: "circle"};

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: CUSTOMER_AMBER, paddingTop: topPad + 10 }]}>
        <TouchableOpacity onPress={() => router.push("/customer" as any)} style={{ padding: 4 }}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { fontFamily: "Inter_700Bold" }]}>Loyalty Points</Text>
          <Text style={[styles.headerSub, { fontFamily: "Inter_400Regular" }]}>
            Earn 1 point per ₹100 spent
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* Points overview card */}
        <View style={[styles.overviewCard, { backgroundColor: CUSTOMER_AMBER }]}>
          <View style={{ alignItems: "center", gap: 6 }}>
            <Text style={[styles.overviewLabel, { fontFamily: "Inter_400Regular" }]}>
              Total Points
            </Text>
            <Text style={[styles.overviewPts, { fontFamily: "Inter_700Bold" }]}>
              ⭐ {profile.loyaltyPoints}
            </Text>
          </View>

          <View style={styles.overviewMeta}>
            <View style={styles.overviewMetaItem}>
              <Text style={[styles.overviewMetaVal, { fontFamily: "Inter_700Bold" }]}>
                {loyalty.length}
              </Text>
              <Text style={[styles.overviewMetaLabel, { fontFamily: "Inter_400Regular" }]}>
                Shops
              </Text>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.overviewMetaItem}>
              <Text style={[styles.overviewMetaVal, { fontFamily: "Inter_700Bold" }]}>
                ₹{totalSpent.toLocaleString()}
              </Text>
              <Text style={[styles.overviewMetaLabel, { fontFamily: "Inter_400Regular" }]}>
                Total Spent
              </Text>
            </View>
          </View>

          {/* Tier badge */}
          <View style={[styles.tierBadge, { backgroundColor: "rgba(255,255,255,0.25)" }]}>
            <Feather name={tierInfo.icon as any} size={14} color="#fff" />
            <Text style={[styles.tierText, { fontFamily: "Inter_700Bold" }]}>
              {tierInfo.name} Member
            </Text>
          </View>
        </View>

        {/* Redeem options */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            🎁 Redeem Points
          </Text>
          <Text style={[styles.sectionSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            Convert your points to discounts
          </Text>
          <View style={styles.redeemGrid}>
            {REDEEM_OPTIONS.map((opt) => {
              const canRedeem = profile.loyaltyPoints >= opt.pts;
              return (
                <TouchableOpacity
                  key={opt.pts}
                  style={[
                    styles.redeemCard,
                    {
                      backgroundColor: canRedeem ? CUSTOMER_AMBER + "15" : colors.background,
                      borderColor:     canRedeem ? CUSTOMER_AMBER : colors.border,
                    },
                  ]}
                  onPress={() => handleRedeem(opt)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.redeemPts, { color: canRedeem ? CUSTOMER_AMBER : colors.mutedForeground, fontFamily: "Inter_700Bold" }]}>
                    ⭐ {opt.pts}
                  </Text>
                  <Text style={[styles.redeemDiscount, { color: canRedeem ? colors.foreground : colors.mutedForeground, fontFamily: "Inter_700Bold" }]}>
                    {opt.label}
                  </Text>
                  {canRedeem && (
                    <View style={[styles.redeemBadge, { backgroundColor: CUSTOMER_AMBER }]}>
                      <Text style={[styles.redeemBadgeText, { fontFamily: "Inter_700Bold" }]}>Redeem</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Per-shop breakdown */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            Points by Shop
          </Text>
          {loyalty.map((shop, idx) => {
            const pct = totalPts > 0 ? (shop.points / totalPts) * 100 : 0;
            return (
              <View key={shop.shopId}>
                {idx > 0 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
                <View style={styles.shopRow}>
                  <View style={[styles.shopIcon, { backgroundColor: CUSTOMER_PRIMARY + "18" }]}>
                    <Feather name="shopping-bag" size={18} color={CUSTOMER_PRIMARY} />
                  </View>
                  <View style={{ flex: 1, gap: 6 }}>
                    <View style={styles.shopMeta}>
                      <Text style={[styles.shopName, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                        {shop.shopName}
                      </Text>
                      <Text style={[styles.shopPts, { color: CUSTOMER_AMBER, fontFamily: "Inter_700Bold" }]}>
                        ⭐ {shop.points}
                      </Text>
                    </View>
                    <View style={[styles.progressBg, { backgroundColor: colors.border }]}>
                      <View style={[styles.progressFill, { width: pct + "%", backgroundColor: CUSTOMER_AMBER }]} />
                    </View>
                    <Text style={[styles.shopSpent, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                      ₹{shop.totalSpent.toLocaleString()} spent
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* How it works */}
        <View style={[styles.section, { backgroundColor: CUSTOMER_PRIMARY + "10", borderColor: CUSTOMER_PRIMARY + "30" }]}>
          <Text style={[styles.sectionTitle, { color: CUSTOMER_PRIMARY, fontFamily: "Inter_700Bold" }]}>
            How Points Work
          </Text>
          {[
            { icon: "shopping-cart", text: "Earn 1 point for every ₹100 spent" },
            { icon: "star",          text: "Points are added after order delivery" },
            { icon: "gift",          text: "Redeem at checkout for instant discounts" },
            { icon: "clock",         text: "Points expire after 12 months of inactivity" },
          ].map((h) => (
            <View key={h.text} style={styles.howRow}>
              <Feather name={h.icon as any} size={16} color={CUSTOMER_PRIMARY} />
              <Text style={[styles.howText, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>
                {h.text}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <CustomerBottomNav activeTab="profile" />
    </View>
  );
}

const styles = StyleSheet.create({
  root:             { flex: 1 },
  header:           { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingBottom: 18 },
  headerTitle:      { color: "#fff", fontSize: 18 },
  headerSub:        { color: "rgba(255,255,255,0.85)", fontSize: 12 },
  overviewCard:     { borderRadius: 20, padding: 24, alignItems: "center", gap: 16 },
  overviewLabel:    { color: "rgba(255,255,255,0.8)", fontSize: 14 },
  overviewPts:      { color: "#fff", fontSize: 48 },
  overviewMeta:     { flexDirection: "row", alignItems: "center", gap: 24 },
  overviewMetaItem: { alignItems: "center", gap: 2 },
  overviewMetaVal:  { color: "#fff", fontSize: 18 },
  overviewMetaLabel:{ color: "rgba(255,255,255,0.8)", fontSize: 12 },
  metaDivider:      { width: 1, height: 24, backgroundColor: "rgba(255,255,255,0.3)" },
  tierBadge:        { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  tierText:         { color: "#fff", fontSize: 13 },
  section:          { borderRadius: 16, borderWidth: 1, padding: 16, gap: 12 },
  sectionTitle:     { fontSize: 15 },
  sectionSub:       { fontSize: 12 },
  redeemGrid:       { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  redeemCard:       { width: "47%", borderRadius: 14, borderWidth: 1, padding: 14, gap: 6, alignItems: "center" },
  redeemPts:        { fontSize: 15 },
  redeemDiscount:   { fontSize: 18 },
  redeemBadge:      { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  redeemBadgeText:  { color: "#fff", fontSize: 11 },
  divider:          { height: 1, marginVertical: 10 },
  shopRow:          { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  shopIcon:         { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center", marginTop: 2 },
  shopMeta:         { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  shopName:         { fontSize: 14 },
  shopPts:          { fontSize: 14 },
  progressBg:       { height: 6, borderRadius: 3, overflow: "hidden" },
  progressFill:     { height: 6, borderRadius: 3 },
  shopSpent:        { fontSize: 12 },
  howRow:           { flexDirection: "row", alignItems: "center", gap: 10 },
  howText:          { fontSize: 13, flex: 1 },
});
