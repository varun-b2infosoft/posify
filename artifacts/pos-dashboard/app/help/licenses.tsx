import React, { useState } from "react";
import {
  Linking,
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

type License = {
  name: string;
  version: string;
  license: string;
  licenseColor: string;
  description: string;
  url: string;
  category: string;
};

const LICENSES: License[] = [
  // Core
  { name: "React Native",       version: "0.74.x", license: "MIT",       licenseColor: "#61DAFB", description: "Framework for building native apps using React.",                              url: "https://github.com/facebook/react-native",           category: "Core Framework" },
  { name: "Expo",               version: "~51.0",  license: "MIT",       licenseColor: "#4F46E5", description: "Platform for universal React applications (iOS, Android, Web).",             url: "https://github.com/expo/expo",                       category: "Core Framework" },
  { name: "Expo Router",        version: "~3.5",   license: "MIT",       licenseColor: "#4F46E5", description: "File-based routing for React Native and web.",                               url: "https://github.com/expo/expo",                       category: "Core Framework" },
  { name: "React",              version: "18.2.0", license: "MIT",       licenseColor: "#61DAFB", description: "JavaScript library for building user interfaces.",                           url: "https://github.com/facebook/react",                  category: "Core Framework" },
  // Navigation
  { name: "React Navigation",   version: "6.x",    license: "MIT",       licenseColor: "#6B4226", description: "Routing and navigation for React Native apps.",                              url: "https://github.com/react-navigation/react-navigation",category: "Navigation"     },
  // UI & Icons
  { name: "@expo/vector-icons", version: "14.0",   license: "MIT",       licenseColor: "#10B981", description: "Feather, FontAwesome, MaterialIcons and more as React components.",          url: "https://github.com/expo/vector-icons",               category: "UI & Icons"     },
  { name: "Feather Icons",      version: "4.29.0", license: "MIT",       licenseColor: "#10B981", description: "Simply beautiful open-source icons (284 icons).",                           url: "https://github.com/feathericons/feather",            category: "UI & Icons"     },
  { name: "Expo Linear Gradient",version: "~13.0", license: "MIT",       licenseColor: "#F59E0B", description: "Linear gradient component for React Native.",                               url: "https://github.com/expo/expo",                       category: "UI & Icons"     },
  { name: "@expo-google-fonts/inter", version: "0.2.3", license: "OFL-1.1", licenseColor: "#EC4899","description": "Inter typeface by Rasmus Andersson — used throughout the app.",         url: "https://github.com/expo/google-fonts",               category: "UI & Icons"     },
  // Storage & State
  { name: "AsyncStorage",       version: "1.23.x", license: "MIT",       licenseColor: "#8B5CF6", description: "Asynchronous, unencrypted, persistent key-value storage.",                  url: "https://github.com/react-native-async-storage/async-storage", category: "Storage" },
  { name: "Expo SecureStore",   version: "~13.0",  license: "MIT",       licenseColor: "#8B5CF6", description: "Encrypted key-value store for sensitive data (PIN, tokens).",               url: "https://github.com/expo/expo",                       category: "Storage"        },
  // Utilities
  { name: "React Native Safe Area Context", version: "4.10.x", license: "MIT", licenseColor: "#06B6D4", description: "Safe area insets for notches, home indicators and status bars.", url: "https://github.com/th3rdwave/react-native-safe-area-context", category: "Utilities" },
  { name: "Expo Status Bar",    version: "~1.12",  license: "MIT",       licenseColor: "#06B6D4", description: "Control the status bar appearance from React Native.",                       url: "https://github.com/expo/expo",                       category: "Utilities"      },
  { name: "Expo Font",          version: "~12.0",  license: "MIT",       licenseColor: "#06B6D4", description: "Load fonts at runtime in Expo apps.",                                       url: "https://github.com/expo/expo",                       category: "Utilities"      },
  { name: "Expo Haptics",       version: "~13.0",  license: "MIT",       licenseColor: "#06B6D4", description: "Haptic feedback for iOS and Android.",                                      url: "https://github.com/expo/expo",                       category: "Utilities"      },
  { name: "Expo Linking",       version: "~6.3",   license: "MIT",       licenseColor: "#06B6D4", description: "Deep linking and URL handling utilities.",                                   url: "https://github.com/expo/expo",                       category: "Utilities"      },
  { name: "React Native Reanimated", version: "~3.10", license: "MIT",  licenseColor: "#F97316", description: "High-performance animations running on the native UI thread.",                url: "https://github.com/software-mansion/react-native-reanimated", category: "Animation" },
  { name: "Expo Camera",        version: "~15.0",  license: "MIT",       licenseColor: "#EF4444", description: "Camera access for barcode/QR scanning in the POS screen.",                  url: "https://github.com/expo/expo",                       category: "Device APIs"    },
  { name: "Expo Print",         version: "~13.0",  license: "MIT",       licenseColor: "#EF4444", description: "Print and share PDFs from within the app.",                                 url: "https://github.com/expo/expo",                       category: "Device APIs"    },
  { name: "Expo Sharing",       version: "~12.0",  license: "MIT",       licenseColor: "#EF4444", description: "Share content via native share sheet.",                                     url: "https://github.com/expo/expo",                       category: "Device APIs"    },
];

const CATEGORY_COLORS: Record<string, string> = {
  "Core Framework": "#4F46E5",
  "Navigation":     "#6B4226",
  "UI & Icons":     "#10B981",
  "Storage":        "#8B5CF6",
  "Utilities":      "#06B6D4",
  "Animation":      "#F97316",
  "Device APIs":    "#EF4444",
};

const CATEGORIES = ["All", ...Array.from(new Set(LICENSES.map(l => l.category)))];

const LICENSE_TEXT: Record<string, string> = {
  MIT: 'Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicence, and/or sell copies of the Software...\n\nTHE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.',
  "OFL-1.1": "The fonts and their derivatives are bundled, redistributed and/or sold with any software provided that any reserved font names are not used by derivative works. The Font Software may be freely used, studied, modified and redistributed provided the conditions of this licence are met.",
};

export default function LicensesScreen() {
  const colors  = useColors();
  const insets  = useSafeAreaInsets();
  const topPad  = Platform.OS === "web" ? 67 : insets.top;
  const botPad  = Platform.OS === "web" ? 24 : insets.bottom + 16;

  const [activeCategory, setActiveCategory] = useState("All");
  const [expandedLicense, setExpandedLicense] = useState<string | null>(null);

  const filtered = activeCategory === "All"
    ? LICENSES
    : LICENSES.filter(l => l.category === activeCategory);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: "#1D4ED8", paddingTop: topPad + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
          <Feather name="arrow-left" size={20} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { fontFamily: "Inter_700Bold" }]}>Open Source Licenses</Text>
          <Text style={[styles.headerSub,   { fontFamily: "Inter_400Regular" }]}>{LICENSES.length} packages used in IPOS</Text>
        </View>
        <View style={[styles.headerBadge, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
          <Feather name="code" size={18} color="#fff" />
        </View>
      </View>

      {/* Category filter */}
      <View style={[styles.filterBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingVertical: 10 }}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[styles.filterChip, {
                backgroundColor: activeCategory === cat ? (CATEGORY_COLORS[cat] ?? "#1D4ED8") : colors.muted,
                borderColor: activeCategory === cat ? (CATEGORY_COLORS[cat] ?? "#1D4ED8") : colors.border,
              }]}
              onPress={() => setActiveCategory(cat)}
              activeOpacity={0.75}
            >
              <Text style={[styles.filterText, {
                color: activeCategory === cat ? "#fff" : colors.mutedForeground,
                fontFamily: activeCategory === cat ? "Inter_700Bold" : "Inter_400Regular",
              }]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: botPad + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.banner, { backgroundColor: "#1D4ED80D", borderColor: "#1D4ED825" }]}>
          <Feather name="heart" size={13} color="#1D4ED8" />
          <Text style={[styles.bannerText, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>
            IPOS is built on the shoulders of{" "}
            <Text style={{ fontFamily: "Inter_700Bold", color: "#1D4ED8" }}>amazing open-source software</Text>.
            We are grateful to all contributors.
          </Text>
        </View>

        {filtered.map((lib) => {
          const catColor = CATEGORY_COLORS[lib.category] ?? "#4F46E5";
          const isExpanded = expandedLicense === lib.name;
          return (
            <View key={lib.name} style={[styles.libCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.libMain}>
                <View style={{ flex: 1, gap: 3 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <Text style={[styles.libName, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>{lib.name}</Text>
                    <View style={[styles.versionBadge, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                      <Text style={[styles.versionText, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>v{lib.version}</Text>
                    </View>
                  </View>
                  <Text style={[styles.libDesc, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]} numberOfLines={2}>
                    {lib.description}
                  </Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 2 }}>
                    <View style={[styles.licenseBadge, { backgroundColor: lib.licenseColor + "18" }]}>
                      <Text style={[styles.licenseText, { color: lib.licenseColor, fontFamily: "Inter_700Bold" }]}>{lib.license}</Text>
                    </View>
                    <View style={[styles.catBadge, { backgroundColor: catColor + "12" }]}>
                      <Text style={[styles.catText, { color: catColor, fontFamily: "Inter_600SemiBold" }]}>{lib.category}</Text>
                    </View>
                  </View>
                </View>
                <View style={{ gap: 8, alignItems: "flex-end" }}>
                  <TouchableOpacity
                    style={[styles.repoBtn, { backgroundColor: colors.muted, borderColor: colors.border }]}
                    onPress={() => Linking.openURL(lib.url).catch(() => {})}
                    activeOpacity={0.75}
                  >
                    <Feather name="github" size={13} color={colors.foreground} />
                  </TouchableOpacity>
                  {LICENSE_TEXT[lib.license] && (
                    <TouchableOpacity
                      style={[styles.repoBtn, { backgroundColor: lib.licenseColor + "15", borderColor: lib.licenseColor + "30" }]}
                      onPress={() => setExpandedLicense(isExpanded ? null : lib.name)}
                      activeOpacity={0.75}
                    >
                      <Feather name={isExpanded ? "chevron-up" : "file-text"} size={13} color={lib.licenseColor} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
              {isExpanded && LICENSE_TEXT[lib.license] && (
                <View style={[styles.licenseBody, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
                  <Text style={[styles.licenseBodyText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                    {LICENSE_TEXT[lib.license]}
                  </Text>
                </View>
              )}
            </View>
          );
        })}

        <View style={[styles.footer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="info" size={14} color="#6B7280" />
          <Text style={[styles.footerText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            Full license texts are available in the app bundle and at each project's repository on GitHub.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:         { flex: 1 },
  header:       { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingBottom: 16 },
  headerTitle:  { color: "#fff", fontSize: 20 },
  headerSub:    { color: "rgba(255,255,255,0.75)", fontSize: 12 },
  headerBadge:  { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  filterBar:    { borderBottomWidth: 1 },
  filterChip:   { paddingHorizontal: 13, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  filterText:   { fontSize: 12 },
  content:      { padding: 16, gap: 10 },
  banner:       { flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 2 },
  bannerText:   { fontSize: 13, flex: 1, lineHeight: 19 },
  libCard:      { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  libMain:      { flexDirection: "row", gap: 10, padding: 14 },
  libName:      { fontSize: 14 },
  libDesc:      { fontSize: 12, lineHeight: 17 },
  versionBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, borderWidth: 1 },
  versionText:  { fontSize: 11 },
  licenseBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  licenseText:  { fontSize: 11 },
  catBadge:     { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  catText:      { fontSize: 11 },
  repoBtn:      { width: 30, height: 30, borderRadius: 8, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  licenseBody:  { borderTopWidth: 1, padding: 12 },
  licenseBodyText: { fontSize: 12, lineHeight: 19 },
  footer:       { flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 14, borderRadius: 14, borderWidth: 1, marginTop: 4 },
  footerText:   { fontSize: 13, flex: 1, lineHeight: 19 },
});
