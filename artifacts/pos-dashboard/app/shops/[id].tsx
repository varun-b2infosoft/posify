import React, { useCallback, useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import {
  ROLE_COLORS, ROLE_ICONS, PERMISSION_LABELS,
  StaffMember, Shop,
  deleteStaff, getShop, getStaff, subscribeShops,
} from "@/store/shops";

function StaffCard({ member, onEdit, onDelete }: {
  member: StaffMember;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const colors    = useColors();
  const roleColor = ROLE_COLORS[member.role];
  const roleIcon  = ROLE_ICONS[member.role];
  const initials  = member.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const [expanded, setExpanded] = useState(false);
  const perms     = Object.entries(member.permissions).filter(([, v]) => v);

  return (
    <View style={[styles.staffCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <TouchableOpacity style={styles.staffRow} onPress={() => setExpanded(v => !v)} activeOpacity={0.8}>
        <View style={[styles.staffAvatar, { backgroundColor: roleColor + "20" }]}>
          <Text style={[styles.staffInitials, { color: roleColor, fontFamily: "Inter_700Bold" }]}>{initials}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.staffName, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]} numberOfLines={1}>
            {member.name}
          </Text>
          <Text style={[styles.staffContact, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            {member.phone}
          </Text>
        </View>
        <View style={[styles.roleBadge, { backgroundColor: roleColor + "18" }]}>
          <Feather name={roleIcon as any} size={11} color={roleColor} />
          <Text style={[styles.roleText, { color: roleColor, fontFamily: "Inter_600SemiBold" }]}>{member.role}</Text>
        </View>
        <View style={{ flexDirection: "row", gap: 4, marginLeft: 6 }}>
          <TouchableOpacity style={[styles.actionBtn, { borderColor: colors.border }]} onPress={onEdit}>
            <Feather name="edit-2" size={12} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { borderColor: colors.border }]} onPress={onDelete}>
            <Feather name="trash-2" size={12} color={colors.destructive} />
          </TouchableOpacity>
        </View>
        <Feather name={expanded ? "chevron-up" : "chevron-down"} size={14} color={colors.mutedForeground} style={{ marginLeft: 4 }} />
      </TouchableOpacity>

      {expanded && (
        <View style={[styles.permissionsWrap, { borderTopColor: colors.border }]}>
          <Text style={[styles.permTitle, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>PERMISSIONS</Text>
          <View style={styles.permGrid}>
            {Object.entries(PERMISSION_LABELS).map(([key, label]) => {
              const granted = member.permissions[key as keyof typeof member.permissions];
              return (
                <View key={key} style={[styles.permChip, { backgroundColor: granted ? "#10B98115" : colors.secondary, borderColor: granted ? "#10B98130" : colors.border }]}>
                  <Feather name={granted ? "check" : "x"} size={10} color={granted ? "#10B981" : colors.mutedForeground} />
                  <Text style={[styles.permLabel, { color: granted ? "#10B981" : colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{label}</Text>
                </View>
              );
            })}
          </View>
          <Text style={[styles.joinDate, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            Joined {member.joinedDate}
          </Text>
        </View>
      )}
    </View>
  );
}

export default function ShopDetailScreen() {
  const { id }  = useLocalSearchParams<{ id: string }>();
  const colors  = useColors();
  const insets  = useSafeAreaInsets();
  const topPad  = Platform.OS === "web" ? 67 : insets.top;
  const botPad  = Platform.OS === "web" ? 24 : insets.bottom + 16;

  const [shop,  setShop]  = useState<Shop | undefined>(() => getShop(id));
  const [staff, setStaff] = useState<StaffMember[]>(() => getStaff(id));

  useFocusEffect(useCallback(() => {
    setShop(getShop(id));
    setStaff(getStaff(id));
    return subscribeShops(() => { setShop(getShop(id)); setStaff(getStaff(id)); });
  }, [id]));

  if (!shop) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background, paddingTop: topPad }]}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 16 }}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={[{ color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Shop not found</Text>
        </View>
      </View>
    );
  }

  const handleDeleteStaff = (m: StaffMember) => {
    Alert.alert("Remove Staff", `Remove "${m.name}" from ${shop.name}?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => deleteStaff(m.id) },
    ]);
  };

  const roleBreakdown = ["Admin", "Manager", "Salesman"].map(role => ({
    role,
    count: staff.filter(s => s.role === role).length,
    color: ROLE_COLORS[role as keyof typeof ROLE_COLORS],
    icon:  ROLE_ICONS[role as keyof typeof ROLE_ICONS],
  })).filter(r => r.count > 0);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: shop.color }]}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 2 }}>
          <Feather name="arrow-left" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { fontFamily: "Inter_600SemiBold" }]} numberOfLines={1}>{shop.name}</Text>
        <TouchableOpacity onPress={() => router.push(`/shops/edit?id=${shop.id}` as any)}>
          <Feather name="edit-2" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: botPad + 80 }]}>
        {/* Shop info */}
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.infoRow}>
            <Feather name="map-pin" size={14} color={colors.mutedForeground} />
            <Text style={[styles.infoText, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>{shop.address}</Text>
          </View>
          <View style={[styles.infoDivider, { backgroundColor: colors.border }]} />
          <View style={styles.infoRow}>
            <Feather name="phone" size={14} color={colors.mutedForeground} />
            <Text style={[styles.infoText, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>{shop.phone}</Text>
          </View>
          <View style={[styles.infoDivider, { backgroundColor: colors.border }]} />
          <View style={styles.infoRow}>
            <Feather name="user" size={14} color={colors.mutedForeground} />
            <Text style={[styles.infoText, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>Manager: {shop.manager}</Text>
          </View>
          {!shop.active && (
            <>
              <View style={[styles.infoDivider, { backgroundColor: colors.border }]} />
              <View style={[styles.inactiveBanner, { backgroundColor: "#FEE2E2" }]}>
                <Feather name="alert-circle" size={14} color="#B91C1C" />
                <Text style={[{ color: "#B91C1C", fontFamily: "Inter_500Medium", fontSize: 13 }]}>This shop is currently inactive</Text>
              </View>
            </>
          )}
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { label: "Today Sales",  value: `₹${Math.round(shop.todaySales / 1000)}k`,  color: "#10B981" },
            { label: "Stock Value",  value: `₹${Math.round(shop.stockValue / 1000)}k`,  color: "#4F46E5" },
            { label: "Total Orders", value: String(shop.totalOrders),                    color: "#F59E0B" },
          ].map(s => (
            <View key={s.label} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.statValue, { color: s.color, fontFamily: "Inter_700Bold" }]}>{s.value}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Staff section */}
        <View style={styles.sectionHead}>
          <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            Staff ({staff.length})
          </Text>
          {roleBreakdown.map(r => (
            <View key={r.role} style={[styles.rolePill, { backgroundColor: r.color + "18" }]}>
              <Feather name={r.icon as any} size={11} color={r.color} />
              <Text style={[styles.rolePillText, { color: r.color, fontFamily: "Inter_500Medium" }]}>
                {r.count} {r.role}
              </Text>
            </View>
          ))}
        </View>

        {staff.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="users" size={28} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              No staff added yet
            </Text>
          </View>
        ) : (
          staff.map(m => (
            <StaffCard
              key={m.id}
              member={m}
              onEdit={() => router.push(`/shops/staff-edit?shopId=${shop.id}&staffId=${m.id}` as any)}
              onDelete={() => handleDeleteStaff(m)}
            />
          ))
        )}

        <TouchableOpacity
          style={[styles.addStaffBtn, { backgroundColor: shop.color }]}
          onPress={() => router.push(`/shops/staff-edit?shopId=${shop.id}` as any)}
        >
          <Feather name="user-plus" size={16} color="#fff" />
          <Text style={[styles.addStaffText, { fontFamily: "Inter_700Bold" }]}>Add Staff Member</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between",
    paddingHorizontal: 16, paddingBottom: 14,
  },
  headerTitle: { flex: 1, color: "#fff", fontSize: 17, marginHorizontal: 12, textAlign: "center" },
  content: { padding: 12, gap: 12 },

  infoCard: { borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, overflow: "hidden" },
  infoRow:  { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 11 },
  infoDivider: { height: 1 },
  infoText: { fontSize: 13, flex: 1 },
  inactiveBanner: { flexDirection: "row", alignItems: "center", gap: 8, padding: 10, borderRadius: 8, marginVertical: 6 },

  statsRow: { flexDirection: "row", gap: 8 },
  statCard: { flex: 1, borderRadius: 12, borderWidth: 1, padding: 12, alignItems: "center", gap: 4 },
  statValue: { fontSize: 15 },
  statLabel: { fontSize: 11, textAlign: "center" },

  sectionHead: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  sectionTitle: { fontSize: 16 },
  rolePill: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  rolePillText: { fontSize: 11 },

  staffCard: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  staffRow: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12 },
  staffAvatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  staffInitials: { fontSize: 15 },
  staffName:    { fontSize: 14, marginBottom: 1 },
  staffContact: { fontSize: 12 },
  roleBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8 },
  roleText:  { fontSize: 11 },
  actionBtn: { width: 28, height: 28, borderRadius: 7, borderWidth: 1, alignItems: "center", justifyContent: "center" },

  permissionsWrap: { borderTopWidth: 1, padding: 12, gap: 8 },
  permTitle:   { fontSize: 10, letterSpacing: 0.5 },
  permGrid:    { flexDirection: "row", flexWrap: "wrap", gap: 5 },
  permChip: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  permLabel: { fontSize: 11 },
  joinDate:  { fontSize: 11 },

  emptyCard: { borderRadius: 14, borderWidth: 1, alignItems: "center", gap: 10, padding: 28 },
  emptyText: { fontSize: 14 },

  addStaffBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    borderRadius: 13, paddingVertical: 14,
  },
  addStaffText: { color: "#fff", fontSize: 15 },
});
