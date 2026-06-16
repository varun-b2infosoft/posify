import React, { useCallback, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useLayout } from "@/hooks/useLayout";
import { getShops, getStaff, subscribeShops } from "@/store/shops";
import { getTransfers, subscribeTransfers } from "@/store/transfers";
import { getExpenses, subscribeExpenses } from "@/store/expenses";
import { getCustomers, getTotalOutstanding, subscribeCustomers } from "@/store/customers";
import { getInvoices, subscribeInvoices } from "@/store/invoices";
import { getUnreadCount, subscribeNotifications } from "@/store/notifications";
import { pendingDeliveryCount, subscribeDeliveryOrders } from "@/store/deliveryOrders";

export default function ProfileScreen() {
  const colors  = useColors();
  const layout  = useLayout();
  const insets  = useSafeAreaInsets();
  const topPad  = Platform.OS === "web" ? 67 : insets.top;
  const botPad  = Platform.OS === "web" ? 34 : insets.bottom;

  const [shopCount,      setShopCount]      = useState(() => getShops().filter(s => s.active).length);
  const [staffCount,     setStaffCount]     = useState(() => getStaff().length);
  const [transferCount,  setTransferCount]  = useState(() => getTransfers().filter(t => t.status === "in_transit" || t.status === "initiated").length);
  const [unreadCount,    setUnreadCount]    = useState(() => getUnreadCount());
  const [outstanding,    setOutstanding]    = useState(() => getTotalOutstanding());
  const [invoiceCount,   setInvoiceCount]   = useState(() => getInvoices().filter(i => !i.paid && !i.returned).length);
  const [deliveryPending, setDeliveryPending] = useState(() => pendingDeliveryCount());
  const nowMonth = new Date().getMonth();
  const [monthExpenses,  setMonthExpenses]  = useState(() => getExpenses().filter(e => new Date(e.date).getMonth() === nowMonth).reduce((s, e) => s + e.amount, 0));

  useFocusEffect(useCallback(() => {
    const unsub1 = subscribeShops(() => {
      setShopCount(getShops().filter(s => s.active).length);
      setStaffCount(getStaff().length);
    });
    const unsub2 = subscribeTransfers(() => {
      setTransferCount(getTransfers().filter(t => t.status === "in_transit" || t.status === "initiated").length);
    });
    const unsub3 = subscribeNotifications(() => setUnreadCount(getUnreadCount()));
    const unsub4 = subscribeCustomers(() => setOutstanding(getTotalOutstanding()));
    const unsub5 = subscribeInvoices(() => setInvoiceCount(getInvoices().filter(i => !i.paid && !i.returned).length));
    const unsub6 = subscribeExpenses(() => {
      const m = new Date().getMonth();
      setMonthExpenses(getExpenses().filter(e => new Date(e.date).getMonth() === m).reduce((s, e) => s + e.amount, 0));
    });
    const unsub7 = subscribeDeliveryOrders(() => setDeliveryPending(pendingDeliveryCount()));
    return () => { unsub1(); unsub2(); unsub3(); unsub4(); unsub5(); unsub6(); unsub7(); };
  }, []));

  const MANAGEMENT_ITEMS = [
    {
      icon: "bar-chart-2",
      label: "Reports & Analytics",
      sub: "Revenue, profit, top products",
      color: "#4F46E5",
      onPress: () => router.push("/reports" as any),
    },
    {
      icon: "shopping-bag",
      label: "Manage Shops",
      sub: `${shopCount} active shop${shopCount !== 1 ? "s" : ""}`,
      color: "#8B5CF6",
      onPress: () => router.push("/shops" as any),
    },
    {
      icon: "truck",
      label: "Stock Transfers",
      sub: transferCount > 0 ? `${transferCount} active transfer${transferCount > 1 ? "s" : ""}` : "Transfer stock between shops",
      color: "#06B6D4",
      badge: transferCount > 0 ? String(transferCount) : null,
      onPress: () => router.push("/transfer/new" as any),
    },
    {
      icon: "users",
      label: "Customers",
      sub: outstanding > 0 ? `₹${(outstanding/1000).toFixed(0)}k outstanding` : "Manage customer records",
      color: "#10B981",
      badge: outstanding > 0 ? `₹${(outstanding/1000).toFixed(0)}k` : null,
      badgeColor: "#EF4444",
      onPress: () => router.push("/customers" as any),
    },
    {
      icon: "credit-card",
      label: "Credit / Udhaar",
      sub: outstanding > 0 ? `${getCustomers().filter(c => c.creditBalance > 0).length} customers with dues` : "No outstanding dues",
      color: "#EF4444",
      onPress: () => router.push("/credit" as any),
    },
    {
      icon: "dollar-sign",
      label: "Expenses",
      sub: monthExpenses > 0 ? `₹${(monthExpenses/1000).toFixed(1)}k this month` : "Track business expenses",
      color: "#F59E0B",
      onPress: () => router.push("/expenses" as any),
    },
    {
      icon: "file-text",
      label: "Invoices",
      sub: invoiceCount > 0 ? `${invoiceCount} pending invoice${invoiceCount > 1 ? "s" : ""}` : "Invoice history & management",
      color: "#6366F1",
      badge: invoiceCount > 0 ? String(invoiceCount) : null,
      badgeColor: "#F59E0B",
      onPress: () => router.push("/invoices" as any),
    },
    {
      icon: "truck",
      label: "Delivery Orders",
      sub: deliveryPending > 0 ? `${deliveryPending} pending delivery${deliveryPending > 1 ? "s" : ""}` : "Track & manage deliveries",
      color: "#06B6D4",
      badge: deliveryPending > 0 ? String(deliveryPending) : null,
      badgeColor: "#06B6D4",
      onPress: () => router.push("/delivery" as any),
    },
    {
      icon: "rotate-ccw",
      label: "Returns",
      sub: "Manage returned invoices",
      color: "#EF4444",
      onPress: () => router.push("/returns" as any),
    },
    {
      icon: "users",
      label: "Staff Management",
      sub: `${staffCount} members across all shops`,
      color: "#8B5CF6",
      onPress: () => router.push("/shops" as any),
    },
  ];

  const SETTINGS_ITEMS = [
    { icon: "bell",        label: "Notifications",   sub: unreadCount > 0 ? `${unreadCount} unread` : "Alerts & reminders",        badge: unreadCount > 0 ? String(unreadCount) : null, badgeColor: "#EF4444", onPress: () => router.push("/notifications" as any) },
    { icon: "cloud",       label: "Backup & Sync",   sub: "Auto backup on · Last: Today 2 AM",   onPress: () => router.push("/settings" as any) },
    { icon: "home",        label: "Store Settings",  sub: "Name, location, currency", onPress: () => router.push("/store-settings" as any) },
    { icon: "printer",     label: "Receipt Settings",sub: "Configure print layout", onPress: () => router.push("/receipt-settings" as any) },
    { icon: "shield",      label: "Security",        sub: "PIN, permissions",   onPress: () => router.push("/security" as any) },
    { icon: "help-circle", label: "Help & Support",  sub: "FAQs, contact us",   onPress: () => router.push("/help" as any) },
  ];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 10, backgroundColor: colors.primary }]}>
        <Text style={[styles.headerTitle, { fontFamily: "Inter_700Bold", flex: 1 }]}>Profile</Text>
        <TouchableOpacity style={{ position: "relative" }} onPress={() => router.push("/notifications" as any)}>
          <Feather name="bell" size={22} color="#fff" />
          {unreadCount > 0 && (
            <View style={styles.bellBadge}>
              <Text style={[styles.bellBadgeText, { fontFamily: "Inter_700Bold" }]}>{unreadCount > 9 ? "9+" : unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: botPad + 100 },
          layout.isWide && { maxWidth: layout.maxContentWidth, alignSelf: "center", width: "100%" },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile card */}
        <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={[styles.avatarText, { fontFamily: "Inter_700Bold" }]}>AK</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.name, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
              Arjun Kumar
            </Text>
            <Text style={[styles.role, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Store Manager · Main Store
            </Text>
            <Text style={[styles.email, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              arjun@posify.in
            </Text>
          </View>
          <View style={[styles.adminBadge, { backgroundColor: "#4F46E515" }]}>
            <Feather name="shield" size={11} color="#4F46E5" />
            <Text style={[styles.adminText, { color: "#4F46E5", fontFamily: "Inter_700Bold" }]}>Admin</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { label: "Today Sales", val: "₹72.4K" },
            { label: "Orders",      val: "284"     },
            { label: "Products",    val: "12"      },
          ].map((s) => (
            <View key={s.label} style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.statVal, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>{s.val}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Management section */}
        <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Management</Text>
        <View style={[styles.menuCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {MANAGEMENT_ITEMS.map((item, idx) => (
            <TouchableOpacity
              key={item.label}
              style={[
                styles.menuRow,
                idx < MANAGEMENT_ITEMS.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 },
              ]}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIcon, { backgroundColor: item.color + "15" }]}>
                <Feather name={item.icon as any} size={16} color={item.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.menuLabel, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
                  {item.label}
                </Text>
                <Text style={[styles.menuSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  {item.sub}
                </Text>
              </View>
              {(item as any).badge ? (
                <View style={[styles.badgePill, { backgroundColor: (item as any).badgeColor ?? "#10B981" }]}>
                  <Text style={[styles.badgePillText, { fontFamily: "Inter_700Bold" }]}>{(item as any).badge}</Text>
                </View>
              ) : null}
              <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Settings section */}
        <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Settings</Text>
        <View style={[styles.menuCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {SETTINGS_ITEMS.map((item, idx) => (
            <TouchableOpacity
              key={item.label}
              style={[
                styles.menuRow,
                idx < SETTINGS_ITEMS.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 },
              ]}
              activeOpacity={0.7}
              onPress={(item as any).onPress}
            >
              <View style={[styles.menuIcon, { backgroundColor: colors.secondary }]}>
                <Feather name={item.icon as any} size={16} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.menuLabel, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
                  {item.label}
                </Text>
                <Text style={[styles.menuSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  {item.sub}
                </Text>
              </View>
              {(item as any).badge ? (
                <View style={[styles.badgePill, { backgroundColor: (item as any).badgeColor ?? "#EF4444" }]}>
                  <Text style={[styles.badgePillText, { fontFamily: "Inter_700Bold" }]}>{(item as any).badge}</Text>
                </View>
              ) : null}
              <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.logoutBtn, { borderColor: colors.destructive + "50" }]}
          activeOpacity={0.7}
        >
          <Feather name="log-out" size={16} color={colors.destructive} />
          <Text style={[styles.logoutText, { color: colors.destructive, fontFamily: "Inter_600SemiBold" }]}>
            Sign Out
          </Text>
        </TouchableOpacity>

        <Text style={[styles.version, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          IPOS v1.0.0
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  headerTitle: { color: "#fff", fontSize: 22 },
  content: { padding: 14, gap: 12 },

  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontSize: 22 },
  name:  { fontSize: 17, marginBottom: 2 },
  role:  { fontSize: 13, marginBottom: 1 },
  email: { fontSize: 12 },
  adminBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  adminText:  { fontSize: 11 },

  statsRow: { flexDirection: "row", gap: 10 },
  statBox: {
    flex: 1,
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  statVal:   { fontSize: 18, marginBottom: 2 },
  statLabel: { fontSize: 11, textAlign: "center" },

  sectionTitle: { fontSize: 16, marginBottom: -4 },

  menuCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
  },
  menuIcon: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: { fontSize: 14, marginBottom: 1 },
  menuSub:   { fontSize: 12 },
  badgePill: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 10, marginRight: 4 },
  badgePillText: { color: "#fff", fontSize: 11 },

  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1.5,
  },
  logoutText:    { fontSize: 15 },
  version:       { fontSize: 12, textAlign: "center" },
  bellBadge:     { position: "absolute", top: -5, right: -6, backgroundColor: "#EF4444", borderRadius: 8, minWidth: 16, height: 16, alignItems: "center", justifyContent: "center", paddingHorizontal: 3 },
  bellBadgeText: { color: "#fff", fontSize: 9 },
});
