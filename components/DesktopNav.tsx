import React, { useEffect, useState } from "react";
import { Animated, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { isNavExpanded, subscribeNav, toggleNav } from "@/store/nav";

const COLLAPSED_W = 64;
const EXPANDED_W  = 240;

const NAV_ITEMS = [
  { icon: "bar-chart-2",   label: "Dashboard",  href: "/"          },
  { icon: "shopping-cart", label: "POS",         href: "/pos",  hot: true },
  { icon: "box",           label: "Products",    href: "/products"  },
  { icon: "truck",         label: "Purchases",   href: "/purchases" },
  { icon: "user",          label: "Profile",     href: "/profile"   },
];

const BOTTOM_ITEMS = [
  { icon: "settings",    label: "Settings",      href: "/settings"       },
  { icon: "bell",        label: "Notifications", href: "/notifications"  },
  { icon: "help-circle", label: "Help",          href: "/help"           },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/" || pathname === "/(tabs)" || pathname === "/(tabs)/index";
  return pathname.startsWith(href);
}

export function DesktopNav() {
  const colors   = useColors();
  const insets   = useSafeAreaInsets();
  const pathname = usePathname();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 16 : insets.bottom + 8;

  const [expanded, setExpanded] = useState(() => isNavExpanded());
  const widthAnim = React.useRef(new Animated.Value(isNavExpanded() ? EXPANDED_W : COLLAPSED_W)).current;
  const labelOpac = React.useRef(new Animated.Value(isNavExpanded() ? 1 : 0)).current;

  useEffect(() => {
    return subscribeNav(() => {
      const next = isNavExpanded();
      setExpanded(next);
      Animated.parallel([
        Animated.spring(widthAnim, { toValue: next ? EXPANDED_W : COLLAPSED_W, tension: 60, friction: 12, useNativeDriver: false }),
        Animated.timing(labelOpac, { toValue: next ? 1 : 0, duration: next ? 180 : 80, delay: next ? 80 : 0, useNativeDriver: false }),
      ]).start();
    });
  }, []);

  return (
    <Animated.View style={[
      styles.root,
      {
        width: widthAnim,
        backgroundColor: colors.card,
        borderRightColor: colors.border,
        paddingTop: topPad,
        paddingBottom: botPad,
      },
    ]}>
      {/* Logo + hamburger toggle */}
      <View style={[styles.logoRow, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={toggleNav}
          style={[styles.menuBtn, { backgroundColor: expanded ? colors.primary + "12" : colors.muted }]}
          activeOpacity={0.7}
        >
          <Feather name={expanded ? "x" : "menu"} size={18} color={expanded ? colors.primary : colors.mutedForeground} />
        </TouchableOpacity>

        <Animated.View style={{ opacity: labelOpac, overflow: "hidden", flexDirection: "row", alignItems: "center", gap: 8 }}>
          <View style={[styles.logoIcon, { backgroundColor: colors.primary }]}>
            <Feather name="shopping-bag" size={15} color="#fff" />
          </View>
          <Text style={[styles.logoText, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            IPOS
          </Text>
        </Animated.View>
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
        <Animated.View style={{ opacity: labelOpac, flex: 1, overflow: "hidden" }}>
          <Text style={[styles.profileName, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]} numberOfLines={1}>
            Arjun Kumar
          </Text>
          <Text style={[styles.profileSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]} numberOfLines={1}>
            Store Manager
          </Text>
        </Animated.View>
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
              <Animated.View style={{ opacity: labelOpac, flex: 1, flexDirection: "row", alignItems: "center", overflow: "hidden", gap: 6 }}>
                <Text style={[
                  styles.navLabel,
                  { color: active ? colors.primary : colors.foreground,
                    fontFamily: active ? "Inter_700Bold" : "Inter_500Medium", flex: 1 },
                ]}>
                  {item.label}
                </Text>
                {(item as any).hot && !active && (
                  <View style={[styles.hotBadge, { backgroundColor: colors.primary }]}>
                    <Text style={[styles.hotText, { fontFamily: "Inter_700Bold" }]}>SELL</Text>
                  </View>
                )}
              </Animated.View>
              {active && <View style={[styles.activeBar, { backgroundColor: colors.primary }]} />}
            </TouchableOpacity>
          );
        })}
      </View>

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
              <Animated.View style={{ opacity: labelOpac, overflow: "hidden" }}>
                <Text style={[
                  styles.bottomLabel,
                  { color: active ? colors.primary : colors.mutedForeground,
                    fontFamily: active ? "Inter_600SemiBold" : "Inter_400Regular" },
                ]}>
                  {item.label}
                </Text>
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </View>
    </Animated.View>
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    marginBottom: 6,
  },
  menuBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  logoIcon: {
    width: 28,
    height: 28,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: { fontSize: 16 },

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
    flexShrink: 0,
  },
  avatarText:  { color: "#fff", fontSize: 13 },
  profileName: { fontSize: 13 },
  profileSub:  { fontSize: 11 },

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
  navLabel:  { fontSize: 14 },
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
