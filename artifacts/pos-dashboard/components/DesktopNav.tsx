import React from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useLayout } from "@/hooks/useLayout";

const NAV_ITEMS = [
  { icon: "bar-chart-2",   label: "Dashboard",  href: "/"          },
  { icon: "shopping-cart", label: "POS",         href: "/pos",  hot: true },
  { icon: "box",           label: "Products",    href: "/products"  },
  { icon: "truck",         label: "Purchases",   href: "/purchases" },
  { icon: "user",          label: "Profile",     href: "/profile"   },
];

const BOTTOM_ITEMS = [
  { icon: "settings",    label: "Settings",      href: "/settings"  },
  { icon: "bell",        label: "Notifications", href: "/notifications" },
  { icon: "help-circle", label: "Help",          href: "/help"      },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/" || pathname === "/(tabs)" || pathname === "/(tabs)/index";
  return pathname.startsWith(href);
}

export function DesktopNav() {
  const colors  = useColors();
  const layout  = useLayout();
  const insets  = useSafeAreaInsets();
  const pathname = usePathname();

  const topPad  = Platform.OS === "web" ? 67 : insets.top;
  const botPad  = Platform.OS === "web" ? 16 : insets.bottom + 8;
  const width   = layout.sidebarWidth;

  return (
    <View style={[
      styles.root,
      {
        width,
        backgroundColor: colors.card,
        borderRightColor: colors.border,
        paddingTop: topPad,
        paddingBottom: botPad,
      },
    ]}>
      {/* Logo */}
      <View style={[styles.logoRow, { borderBottomColor: colors.border }]}>
        <View style={[styles.logoIcon, { backgroundColor: colors.primary }]}>
          <Feather name="shopping-bag" size={18} color="#fff" />
        </View>
        {width >= 220 && (
          <Text style={[styles.logoText, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            IPOS
          </Text>
        )}
      </View>

      {/* Profile mini */}
      <TouchableOpacity
        style={[styles.profileRow, { borderBottomColor: colors.border }]}
        onPress={() => router.push("/profile" as any)}
        activeOpacity={0.7}
      >
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={[styles.avatarText, { fontFamily: "Inter_700Bold" }]}>AK</Text>
        </View>
        {width >= 220 && (
          <View style={{ flex: 1 }}>
            <Text style={[styles.profileName, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]} numberOfLines={1}>
              Arjun Kumar
            </Text>
            <Text style={[styles.profileSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]} numberOfLines={1}>
              Store Manager
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Main nav */}
      <View style={styles.navList}>
        {NAV_ITEMS.map(item => {
          const active = isActive(pathname, item.href);
          return (
            <TouchableOpacity
              key={item.href}
              style={[
                styles.navItem,
                active && { backgroundColor: colors.primary + "15" },
                (item as any).hot && !active && { backgroundColor: colors.primary + "08" },
              ]}
              onPress={() => router.push(item.href as any)}
              activeOpacity={0.7}
            >
              <View style={[
                styles.navIcon,
                { backgroundColor: active ? colors.primary : (item as any).hot ? colors.primary + "18" : colors.muted },
              ]}>
                <Feather
                  name={item.icon as any}
                  size={16}
                  color={active ? "#fff" : (item as any).hot ? colors.primary : colors.mutedForeground}
                />
              </View>
              {width >= 200 && (
                <Text style={[
                  styles.navLabel,
                  { color: active ? colors.primary : colors.foreground,
                    fontFamily: active ? "Inter_700Bold" : "Inter_500Medium" },
                ]}>
                  {item.label}
                </Text>
              )}
              {(item as any).hot && !active && width >= 200 && (
                <View style={[styles.hotBadge, { backgroundColor: colors.primary }]}>
                  <Text style={[styles.hotText, { fontFamily: "Inter_700Bold" }]}>SELL</Text>
                </View>
              )}
              {active && <View style={[styles.activeBar, { backgroundColor: colors.primary }]} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Spacer */}
      <View style={{ flex: 1 }} />

      {/* Bottom links */}
      <View style={[styles.bottomSection, { borderTopColor: colors.border }]}>
        {BOTTOM_ITEMS.map(item => {
          const active = isActive(pathname, item.href);
          return (
            <TouchableOpacity
              key={item.href}
              style={[styles.bottomItem, active && { backgroundColor: colors.primary + "10" }]}
              onPress={() => router.push(item.href as any)}
              activeOpacity={0.7}
            >
              <Feather
                name={item.icon as any}
                size={15}
                color={active ? colors.primary : colors.mutedForeground}
              />
              {width >= 200 && (
                <Text style={[
                  styles.bottomLabel,
                  { color: active ? colors.primary : colors.mutedForeground,
                    fontFamily: active ? "Inter_600SemiBold" : "Inter_400Regular" },
                ]}>
                  {item.label}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    borderRightWidth: 1,
    flexDirection: "column",
    overflow: "hidden",
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    marginBottom: 6,
  },
  logoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText:  { fontSize: 18 },

  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    marginBottom: 8,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText:   { color: "#fff", fontSize: 13 },
  profileName:  { fontSize: 13 },
  profileSub:   { fontSize: 11 },

  navList: {
    paddingHorizontal: 8,
    gap: 2,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    position: "relative",
    overflow: "hidden",
  },
  navIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  navLabel: { fontSize: 14, flex: 1 },
  hotBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  hotText:   { color: "#fff", fontSize: 9, letterSpacing: 0.5 },
  activeBar: {
    position: "absolute",
    right: 0,
    top: "20%",
    bottom: "20%",
    width: 3,
    borderRadius: 2,
  },

  bottomSection: {
    borderTopWidth: 1,
    paddingTop: 8,
    paddingHorizontal: 8,
    gap: 2,
  },
  bottomItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  bottomLabel: { fontSize: 13 },
});
