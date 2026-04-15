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
  getPendingOrders,
  logoutCustomer,
  subscribeCustomerApp,
  CustomerProfile,
} from "@/store/customerApp";

interface MenuItem {
  icon: string;
  label: string;
  sub?: string;
  badge?: string | number;
  color?: string;
  route?: string;
  onPress?: () => void;
}

export default function CustomerProfileScreen() {
  const colors  = useColors();
  const insets  = useSafeAreaInsets();
  const topPad  = Platform.OS === "web" ? 60 : insets.top;

  const [profile, setProfile]   = useState<CustomerProfile>(getCustomerProfile());
  const [pendingCnt, setPending] = useState(getPendingOrders().length);

  useEffect(() => {
    return subscribeCustomerApp(() => {
      setProfile(getCustomerProfile());
      setPending(getPendingOrders().length);
    });
  }, []);

  const tierInfo =
    profile.loyaltyPoints >= 2000 ? { name: "Platinum", color: "#8B5CF6" }
    : profile.loyaltyPoints >= 1000 ? { name: "Gold",   color: CUSTOMER_AMBER }
    : profile.loyaltyPoints >= 500  ? { name: "Silver", color: "#6B7280" }
    :                                  { name: "Bronze", color: "#92400E" };

  const handleSignOut = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: () => {
            logoutCustomer();
            router.replace("/auth/welcome" as any);
          },
        },
      ]
    );
  };

  const MENU_SECTIONS: { title: string; items: MenuItem[] }[] = [
    {
      title: "Shopping",
      items: [
        { icon: "shopping-bag",  label: "Order Now",          route: "/customer/shops"    },
        { icon: "package",       label: "My Orders",          badge: pendingCnt > 0 ? pendingCnt : undefined, route: "/customer/orders" },
        { icon: "clock",         label: "Pending Dues",       sub: "₹0 outstanding",       route: "/customer/orders"   },
      ],
    },
    {
      title: "Rewards",
      items: [
        { icon: "star",          label: "Loyalty Points",     sub: `⭐ ${profile.loyaltyPoints} pts`, color: CUSTOMER_AMBER, route: "/customer/loyalty" },
        { icon: "credit-card",   label: "Wallet",             sub: `₹${profile.walletBalance} balance`, color: "#3B82F6", route: "/customer/wallet"   },
        { icon: "gift",          label: "Refer & Earn",       sub: "Earn ₹50 per referral", color: "#8B5CF6", route: "/customer/referral" },
      ],
    },
    {
      title: "Insights",
      items: [
        { icon: "bar-chart-2",   label: "Spending Analytics", route: "/customer/analytics" },
      ],
    },
    {
      title: "Account",
      items: [
        { icon: "bell",          label: "Notifications",      route: "/notifications/index" },
        { icon: "help-circle",   label: "Help & Support",     route: "/help/index" },
        { icon: "log-out",       label: "Sign Out",           color: "#EF4444", onPress: handleSignOut },
      ],
    },
  ];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: CUSTOMER_PRIMARY, paddingTop: topPad + 10 }]}>
        <TouchableOpacity onPress={() => router.push("/customer" as any)} style={{ padding: 4 }}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { fontFamily: "Inter_700Bold" }]}>Profile</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* Profile card */}
        <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Avatar */}
          <View style={[styles.avatarWrap, { backgroundColor: CUSTOMER_PRIMARY }]}>
            <Text style={[styles.avatarText, { fontFamily: "Inter_700Bold" }]}>
              {profile.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
            </Text>
          </View>

          <Text style={[styles.profileName, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            {profile.name}
          </Text>
          <Text style={[styles.profilePhone, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            {profile.phone}
          </Text>

          {/* Tier badge */}
          <View style={[styles.tierBadge, { backgroundColor: tierInfo.color + "18", borderColor: tierInfo.color + "40" }]}>
            <Feather name="star" size={12} color={tierInfo.color} />
            <Text style={[styles.tierText, { color: tierInfo.color, fontFamily: "Inter_700Bold" }]}>
              {tierInfo.name} Member
            </Text>
          </View>

          {/* Quick stats */}
          <View style={styles.quickStats}>
            {[
              { label: "Orders",  value: "5"                           },
              { label: "Spent",   value: "₹" + profile.totalSpent.toLocaleString() },
              { label: "Points",  value: "⭐ " + profile.loyaltyPoints },
            ].map((s, i) => (
              <React.Fragment key={s.label}>
                {i > 0 && <View style={[styles.statDivider, { backgroundColor: colors.border }]} />}
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                    {s.value}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                    {s.label}
                  </Text>
                </View>
              </React.Fragment>
            ))}
          </View>

          <View style={{ flexDirection: "row", gap: 8, width: "100%", marginTop: 4 }}>
            <TouchableOpacity
              style={[styles.editBtn, { borderColor: CUSTOMER_PRIMARY }]}
              onPress={() => Alert.alert("Edit Profile", "Profile editing coming soon!")}
              activeOpacity={0.8}
            >
              <Feather name="edit-2" size={14} color={CUSTOMER_PRIMARY} />
              <Text style={[styles.editBtnText, { color: CUSTOMER_PRIMARY, fontFamily: "Inter_600SemiBold" }]}>
                Edit Profile
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.editBtn, { borderColor: colors.border }]}
              onPress={() => router.push("/customer/referral" as any)}
              activeOpacity={0.8}
            >
              <Feather name="share-2" size={14} color={colors.foreground} />
              <Text style={[styles.editBtnText, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                Refer Friends
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Menu sections */}
        {MENU_SECTIONS.map((section) => (
          <View key={section.title} style={{ paddingHorizontal: 16, marginTop: 20 }}>
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>
              {section.title}
            </Text>
            <View style={[styles.menuCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {section.items.map((item, idx) => (
                <TouchableOpacity
                  key={item.label}
                  style={[
                    styles.menuItem,
                    idx > 0 && { borderTopWidth: 1, borderTopColor: colors.border },
                  ]}
                  onPress={item.onPress || (() => item.route && router.push(item.route as any))}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.menuIcon,
                      { backgroundColor: (item.color || CUSTOMER_PRIMARY) + "15" },
                    ]}
                  >
                    <Feather
                      name={item.icon as any}
                      size={18}
                      color={item.color || CUSTOMER_PRIMARY}
                    />
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text
                      style={[
                        styles.menuLabel,
                        {
                          color:      item.color || colors.foreground,
                          fontFamily: "Inter_500Medium",
                        },
                      ]}
                    >
                      {item.label}
                    </Text>
                    {item.sub && (
                      <Text style={[styles.menuSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                        {item.sub}
                      </Text>
                    )}
                  </View>
                  {item.badge != null && Number(item.badge) > 0 && (
                    <View style={[styles.badge, { backgroundColor: "#EF4444" }]}>
                      <Text style={[styles.badgeText, { fontFamily: "Inter_700Bold" }]}>
                        {item.badge}
                      </Text>
                    </View>
                  )}
                  {!item.onPress && (
                    <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* App version */}
        <Text style={[styles.appVersion, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          POSify Customer v1.0.0
        </Text>
      </ScrollView>

      <CustomerBottomNav activeTab="profile" />
    </View>
  );
}

const styles = StyleSheet.create({
  root:         { flex: 1 },
  header:       { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingBottom: 18 },
  headerTitle:  { color: "#fff", fontSize: 18, fontWeight: "700" },
  profileCard:  { margin: 16, borderRadius: 20, borderWidth: 1, padding: 20, alignItems: "center", gap: 10 },
  avatarWrap:   { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center" },
  avatarText:   { color: "#fff", fontSize: 28 },
  profileName:  { fontSize: 22, textAlign: "center" },
  profilePhone: { fontSize: 14, textAlign: "center" },
  tierBadge:    { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
  tierText:     { fontSize: 13 },
  quickStats:   { flexDirection: "row", alignItems: "center", gap: 20, width: "100%", justifyContent: "center", marginTop: 6 },
  statItem:     { alignItems: "center", gap: 2 },
  statValue:    { fontSize: 16 },
  statLabel:    { fontSize: 11 },
  statDivider:  { width: 1, height: 28 },
  editBtn:      { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 9, borderRadius: 10, borderWidth: 1 },
  editBtnText:  { fontSize: 13 },
  sectionTitle: { fontSize: 12, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 },
  menuCard:     { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  menuItem:     { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 14, paddingVertical: 14 },
  menuIcon:     { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  menuLabel:    { fontSize: 15 },
  menuSub:      { fontSize: 12 },
  badge:        { minWidth: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center", paddingHorizontal: 5 },
  badgeText:    { color: "#fff", fontSize: 11 },
  appVersion:   { textAlign: "center", fontSize: 12, marginTop: 24, marginBottom: 12 },
});
