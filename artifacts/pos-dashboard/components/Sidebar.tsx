import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const SIDEBAR_WIDTH = Dimensions.get("window").width * 0.78;

const MENU = [
  { icon: "bar-chart-2",   label: "Dashboard",          screen: "index"    },
  { icon: "shopping-cart", label: "POS — Sell Items",   screen: "pos",      highlight: true },
  { icon: "box",           label: "Products",            screen: "products" },
  { icon: "truck",         label: "Purchases",           screen: "purchases"},
  { icon: "map-pin",       label: "Delivery Orders",     screen: "delivery" },
  { icon: "repeat",        label: "Stock Transfer",      screen: "purchases"},
  { icon: "file-text",     label: "Invoices",            screen: "purchases"},
  { icon: "home",          label: "Shops Management",    screen: "profile"  },
  { icon: "user",          label: "Profile / Settings",  screen: "profile"  },
];

interface SidebarProps {
  visible: boolean;
  activeScreen: string;
  onClose: () => void;
  onNavigate: (screen: string) => void;
}

export function Sidebar({ visible, activeScreen, onClose, onNavigate }: SidebarProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -SIDEBAR_WIDTH,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <Animated.View
          style={[styles.overlay, { opacity: overlayAnim }]}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        <Animated.View
          style={[
            styles.drawer,
            {
              width: SIDEBAR_WIDTH,
              backgroundColor: colors.card,
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          <View style={[styles.profileSection, { paddingTop: topPad + 16, backgroundColor: colors.primary }]}>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Feather name="x" size={20} color="rgba(255,255,255,0.8)" />
            </TouchableOpacity>
            <View style={styles.avatarLarge}>
              <Text style={[styles.avatarText, { fontFamily: "Inter_700Bold" }]}>AK</Text>
            </View>
            <Text style={[styles.profileName, { fontFamily: "Inter_700Bold" }]}>Arjun Kumar</Text>
            <Text style={[styles.profileRole, { fontFamily: "Inter_400Regular" }]}>Store Manager</Text>
            <TouchableOpacity style={styles.shopChip}>
              <Feather name="map-pin" size={11} color="rgba(255,255,255,0.9)" />
              <Text style={[styles.shopChipText, { fontFamily: "Inter_500Medium" }]}>Main Store</Text>
              <Feather name="chevron-down" size={11} color="rgba(255,255,255,0.9)" />
            </TouchableOpacity>
          </View>

          <View style={styles.menuSection}>
            {MENU.map((item) => {
              const isActive = activeScreen === item.screen;
              return (
                <TouchableOpacity
                  key={item.label}
                  style={[
                    styles.menuItem,
                    isActive && { backgroundColor: colors.secondary },
                    item.highlight && !isActive && { backgroundColor: colors.primary + "10" },
                  ]}
                  onPress={() => {
                    onNavigate(item.screen);
                    onClose();
                  }}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.menuIconWrap,
                      {
                        backgroundColor: isActive
                          ? colors.primary
                          : item.highlight
                          ? colors.primary + "20"
                          : colors.muted,
                      },
                    ]}
                  >
                    <Feather
                      name={item.icon as any}
                      size={16}
                      color={isActive ? "#fff" : item.highlight ? colors.primary : colors.mutedForeground}
                    />
                  </View>
                  <Text
                    style={[
                      styles.menuLabel,
                      {
                        color: isActive ? colors.primary : item.highlight ? colors.primary : colors.foreground,
                        fontFamily: isActive || item.highlight ? "Inter_600SemiBold" : "Inter_500Medium",
                      },
                    ]}
                  >
                    {item.label}
                  </Text>
                  {item.highlight && (
                    <View style={[styles.hotBadge, { backgroundColor: colors.primary }]}>
                      <Text style={[styles.hotText, { fontFamily: "Inter_700Bold" }]}>SELL</Text>
                    </View>
                  )}
                  {isActive && (
                    <View style={[styles.activeIndicator, { backgroundColor: colors.primary }]} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={[styles.bottomSection, { paddingBottom: bottomPad + 8, borderTopColor: colors.border }]}>
            <TouchableOpacity style={styles.bottomItem}>
              <Feather name="help-circle" size={16} color={colors.mutedForeground} />
              <Text style={[styles.bottomLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                Help & Support
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.bottomItem}>
              <Feather name="log-out" size={16} color={colors.destructive} />
              <Text style={[styles.bottomLabel, { color: colors.destructive, fontFamily: "Inter_400Regular" }]}>
                Sign Out
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  drawer: {
    height: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 20,
    flexDirection: "column",
  },
  profileSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  closeBtn: {
    alignSelf: "flex-end",
    padding: 4,
    marginBottom: 12,
  },
  avatarLarge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.5)",
    marginBottom: 10,
  },
  avatarText: {
    color: "#fff",
    fontSize: 22,
  },
  profileName: {
    color: "#fff",
    fontSize: 18,
    marginBottom: 2,
  },
  profileRole: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
    marginBottom: 10,
  },
  shopChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  shopChipText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 13,
  },
  menuSection: {
    flex: 1,
    paddingTop: 8,
    paddingHorizontal: 10,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 11,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginVertical: 1,
    position: "relative",
  },
  menuIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: {
    fontSize: 14,
    flex: 1,
  },
  hotBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
  },
  hotText: {
    color: "#fff",
    fontSize: 9,
    letterSpacing: 0.5,
  },
  activeIndicator: {
    position: "absolute",
    right: 0,
    top: "25%",
    bottom: "25%",
    width: 3,
    borderRadius: 2,
  },
  bottomSection: {
    borderTopWidth: 1,
    paddingTop: 12,
    paddingHorizontal: 10,
    gap: 4,
  },
  bottomItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  bottomLabel: {
    fontSize: 14,
  },
});
