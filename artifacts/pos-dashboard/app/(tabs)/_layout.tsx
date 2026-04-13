import { BlurView } from "expo-blur";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { SymbolView } from "expo-symbols";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, View, useColorScheme } from "react-native";

import { useColors } from "@/hooks/useColors";

function NativeTabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: "chart.bar", selected: "chart.bar.fill" }} />
        <Label>Dashboard</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="products">
        <Icon sf={{ default: "cube.box", selected: "cube.box.fill" }} />
        <Label>Products</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="pos">
        <Icon sf={{ default: "cart", selected: "cart.fill" }} />
        <Label>POS</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="purchases">
        <Icon sf={{ default: "shippingbox", selected: "shippingbox.fill" }} />
        <Label>Purchases</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <Icon sf={{ default: "person.crop.circle", selected: "person.crop.circle.fill" }} />
        <Label>Profile</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function ClassicTabLayout() {
  const colors = useColors();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : colors.background,
          borderTopWidth: isWeb ? 1 : 0,
          borderTopColor: colors.border,
          elevation: 0,
          ...(isWeb ? { height: 84 } : {}),
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView
              intensity={100}
              tint={isDark ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
          ) : isWeb ? (
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: colors.background, borderTopColor: colors.border, borderTopWidth: 1 },
              ]}
            />
          ) : null,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="chart.bar.fill" tintColor={color} size={22} />
            ) : (
              <Feather name="bar-chart-2" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: "Products",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="cube.box" tintColor={color} size={22} />
            ) : (
              <Feather name="box" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="pos"
        options={{
          title: "POS",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="cart.fill" tintColor={color} size={22} />
            ) : (
              <Feather name="shopping-cart" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="purchases"
        options={{
          title: "Purchases",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="shippingbox" tintColor={color} size={22} />
            ) : (
              <Feather name="truck" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="person.crop.circle" tintColor={color} size={22} />
            ) : (
              <Feather name="user" size={22} color={color} />
            ),
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  if (Platform.OS === "ios" && isLiquidGlassAvailable()) {
    return <NativeTabLayout />;
  }
  return <ClassicTabLayout />;
}
