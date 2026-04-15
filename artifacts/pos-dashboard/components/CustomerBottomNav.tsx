import React from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { CUSTOMER_PRIMARY } from "@/store/customerApp";

type Tab = "home" | "orders" | "wallet" | "profile";

const TABS: { key: Tab; label: string; icon: string; route: string }[] = [
  { key: "home",    label: "Home",    icon: "home",     route: "/customer"         },
  { key: "orders",  label: "Orders",  icon: "package",  route: "/customer/orders"  },
  { key: "wallet",  label: "Wallet",  icon: "credit-card", route: "/customer/wallet"  },
  { key: "profile", label: "Profile", icon: "user",     route: "/customer/profile" },
];

interface Props {
  activeTab: Tab;
}

export default function CustomerBottomNav({ activeTab }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const botPad = Platform.OS === "web" ? 0 : insets.bottom;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderTopColor:  colors.border,
          paddingBottom:   botPad + 6,
        },
      ]}
    >
      {TABS.map((tab) => {
        const active = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tab}
            onPress={() => router.push(tab.route as any)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconWrap, active && { backgroundColor: CUSTOMER_PRIMARY + "18" }]}>
              <Feather
                name={tab.icon as any}
                size={22}
                color={active ? CUSTOMER_PRIMARY : colors.mutedForeground}
              />
            </View>
            <Text
              style={[
                styles.label,
                {
                  color:      active ? CUSTOMER_PRIMARY : colors.mutedForeground,
                  fontFamily: active ? "Inter_700Bold" : "Inter_400Regular",
                },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection:  "row",
    borderTopWidth: 1,
    paddingTop:     8,
  },
  tab: {
    flex:           1,
    alignItems:     "center",
    gap:            3,
  },
  iconWrap: {
    width:          44,
    height:         32,
    borderRadius:   10,
    alignItems:     "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 11,
  },
});
