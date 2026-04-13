import React, { useState } from "react";
import {
  Alert,
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

type Video = {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: string;
  categoryColor: string;
  icon: string;
  iconColor: string;
  views: string;
  url: string;
  isNew?: boolean;
  isFeatured?: boolean;
};

const VIDEOS: Video[] = [
  {
    id: "v1",
    title: "Getting Started with POSify",
    description: "A complete walkthrough of the app — set up your store, add products, and make your first sale in under 10 minutes.",
    duration: "9:42",
    category: "Getting Started",
    categoryColor: "#4F46E5",
    icon: "play-circle",
    iconColor: "#4F46E5",
    views: "12.4k views",
    url: "https://www.youtube.com/results?search_query=pos+app+getting+started",
    isFeatured: true,
  },
  {
    id: "v2",
    title: "POS Sell Screen — Complete Guide",
    description: "Learn how to process sales, apply discounts, split payments, and handle cash/UPI/card transactions.",
    duration: "6:18",
    category: "POS & Selling",
    categoryColor: "#10B981",
    icon: "shopping-cart",
    iconColor: "#10B981",
    views: "8.7k views",
    url: "https://www.youtube.com/results?search_query=pos+sell+screen+tutorial",
    isNew: false,
  },
  {
    id: "v3",
    title: "Inventory & Product Management",
    description: "Add products, set up categories, manage stock levels, and configure weight-based pricing for loose items.",
    duration: "8:05",
    category: "Products",
    categoryColor: "#F59E0B",
    icon: "package",
    iconColor: "#F59E0B",
    views: "6.2k views",
    url: "https://www.youtube.com/results?search_query=inventory+management+tutorial",
  },
  {
    id: "v4",
    title: "Credit & Udhaar System",
    description: "Track customer credit balances, record partial payments, and send payment reminders — all in one place.",
    duration: "5:33",
    category: "Credit",
    categoryColor: "#EF4444",
    icon: "credit-card",
    iconColor: "#EF4444",
    views: "9.1k views",
    url: "https://www.youtube.com/results?search_query=credit+udhaar+business+management",
    isNew: true,
  },
  {
    id: "v5",
    title: "Reports & Analytics Deep Dive",
    description: "Understand your top products, profit margins, and daily sales trends with the Reports dashboard.",
    duration: "7:21",
    category: "Analytics",
    categoryColor: "#8B5CF6",
    icon: "bar-chart-2",
    iconColor: "#8B5CF6",
    views: "5.3k views",
    url: "https://www.youtube.com/results?search_query=business+analytics+pos+reports",
  },
  {
    id: "v6",
    title: "Printing Receipts & Invoice Setup",
    description: "Connect a Bluetooth thermal printer, choose a receipt template, and configure GST invoices for your store.",
    duration: "6:47",
    category: "Receipts",
    categoryColor: "#06B6D4",
    icon: "printer",
    iconColor: "#06B6D4",
    views: "4.8k views",
    url: "https://www.youtube.com/results?search_query=thermal+printer+receipt+setup",
    isNew: true,
  },
  {
    id: "v7",
    title: "Multi-Shop & Staff Management",
    description: "Add multiple shop locations, create staff accounts with role-based permissions, and monitor each store.",
    duration: "5:55",
    category: "Shops & Staff",
    categoryColor: "#EC4899",
    icon: "users",
    iconColor: "#EC4899",
    views: "3.6k views",
    url: "https://www.youtube.com/results?search_query=multi+store+pos+management",
  },
  {
    id: "v8",
    title: "Expense Tracking & Management",
    description: "Log daily expenses by category, set monthly budgets, and see how expenses impact your net profit.",
    duration: "4:12",
    category: "Expenses",
    categoryColor: "#F97316",
    icon: "trending-down",
    iconColor: "#F97316",
    views: "2.9k views",
    url: "https://www.youtube.com/results?search_query=expense+tracking+small+business",
  },
];

const CATEGORIES = ["All", "Getting Started", "POS & Selling", "Products", "Credit", "Analytics", "Receipts"];

function VideoCard({ video, colors }: { video: Video; colors: any }) {
  const handleWatch = () => {
    Linking.openURL(video.url).catch(() =>
      Alert.alert("Cannot open", "Please check your internet connection.")
    );
  };

  return (
    <TouchableOpacity
      style={[
        styles.videoCard,
        { backgroundColor: colors.card, borderColor: video.isFeatured ? video.iconColor + "40" : colors.border, borderWidth: video.isFeatured ? 1.5 : 1 },
      ]}
      onPress={handleWatch}
      activeOpacity={0.8}
    >
      {/* Thumbnail area */}
      <View style={[styles.thumbnail, { backgroundColor: video.iconColor + "15" }]}>
        {/* Fake waveform bars */}
        <View style={styles.waveform}>
          {[6, 14, 10, 18, 8, 16, 12, 18, 6, 14, 10, 16].map((h, i) => (
            <View key={i} style={[styles.waveBar, { height: h, backgroundColor: video.iconColor + "60" }]} />
          ))}
        </View>

        {/* Play button */}
        <View style={[styles.playBtn, { backgroundColor: video.iconColor }]}>
          <Feather name="play" size={18} color="#fff" style={{ marginLeft: 2 }} />
        </View>

        {/* Duration badge */}
        <View style={styles.durationBadge}>
          <Text style={[styles.durationText, { fontFamily: "Inter_700Bold" }]}>{video.duration}</Text>
        </View>

        {/* Featured ribbon */}
        {video.isFeatured && (
          <View style={[styles.featuredBadge, { backgroundColor: video.iconColor }]}>
            <Text style={[styles.featuredText, { fontFamily: "Inter_700Bold" }]}>FEATURED</Text>
          </View>
        )}
        {video.isNew && !video.isFeatured && (
          <View style={[styles.featuredBadge, { backgroundColor: "#10B981" }]}>
            <Text style={[styles.featuredText, { fontFamily: "Inter_700Bold" }]}>NEW</Text>
          </View>
        )}
      </View>

      {/* Info */}
      <View style={styles.videoInfo}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
          <View style={[styles.categoryChip, { backgroundColor: video.categoryColor + "15" }]}>
            <Text style={[styles.categoryText, { color: video.categoryColor, fontFamily: "Inter_600SemiBold" }]}>
              {video.category}
            </Text>
          </View>
          <Text style={[styles.views, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            · {video.views}
          </Text>
        </View>
        <Text style={[styles.videoTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]} numberOfLines={2}>
          {video.title}
        </Text>
        <Text style={[styles.videoDesc, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]} numberOfLines={2}>
          {video.description}
        </Text>
        <TouchableOpacity
          style={[styles.watchBtn, { backgroundColor: video.iconColor }]}
          onPress={handleWatch}
          activeOpacity={0.85}
        >
          <Feather name="youtube" size={14} color="#fff" />
          <Text style={[styles.watchBtnText, { fontFamily: "Inter_700Bold" }]}>Watch Tutorial</Text>
          <Feather name="external-link" size={12} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

export default function VideoTutorialsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 24 : insets.bottom + 16;

  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = activeCategory === "All"
    ? VIDEOS
    : VIDEOS.filter(v => v.category === activeCategory);

  const totalDuration = VIDEOS.reduce((acc, v) => {
    const [m, s] = v.duration.split(":").map(Number);
    return acc + m * 60 + s;
  }, 0);
  const totalMin = Math.round(totalDuration / 60);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: "#EF4444", paddingTop: topPad + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
          <Feather name="arrow-left" size={20} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { fontFamily: "Inter_700Bold" }]}>Video Tutorials</Text>
          <Text style={[styles.headerSub, { fontFamily: "Inter_400Regular" }]}>{VIDEOS.length} videos · ~{totalMin} min total</Text>
        </View>
        <View style={[styles.headerBadge, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
          <Feather name="video" size={18} color="#fff" />
        </View>
      </View>

      {/* Category filter */}
      <View style={[styles.filterBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingVertical: 10 }}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.filterChip,
                { backgroundColor: activeCategory === cat ? "#EF4444" : colors.muted, borderColor: activeCategory === cat ? "#EF4444" : colors.border },
              ]}
              onPress={() => setActiveCategory(cat)}
              activeOpacity={0.75}
            >
              <Text style={[styles.filterChipText, {
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
        {/* Count */}
        <Text style={[styles.countLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          {filtered.length} video{filtered.length !== 1 ? "s" : ""}
          {activeCategory !== "All" ? ` in "${activeCategory}"` : ""}
        </Text>

        {filtered.map(video => (
          <VideoCard key={video.id} video={video} colors={colors} />
        ))}

        {/* Bottom tip */}
        <View style={[styles.tipCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="youtube" size={16} color="#EF4444" />
          <Text style={[styles.tipText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            Videos open in YouTube. Subscribe to the{" "}
            <Text
              style={{ color: "#EF4444", fontFamily: "Inter_600SemiBold" }}
              onPress={() => Linking.openURL("https://www.youtube.com/results?search_query=posify+pos+tutorials")}
            >
              POSify channel
            </Text>
            {" "}for new tutorials every week.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:          { flex: 1 },
  header:        { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingBottom: 16 },
  headerTitle:   { color: "#fff", fontSize: 20 },
  headerSub:     { color: "rgba(255,255,255,0.8)", fontSize: 12 },
  headerBadge:   { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },

  filterBar:     { borderBottomWidth: 1 },

  content:       { padding: 16, gap: 14 },
  countLabel:    { fontSize: 12, marginBottom: -2 },

  videoCard:     { borderRadius: 16, overflow: "hidden" },
  thumbnail:     { height: 140, alignItems: "center", justifyContent: "center", position: "relative" },
  waveform:      { flexDirection: "row", alignItems: "flex-end", gap: 3, position: "absolute", bottom: 12, left: 16 },
  waveBar:       { width: 4, borderRadius: 2 },
  playBtn:       { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  durationBadge: { position: "absolute", bottom: 10, right: 10, backgroundColor: "rgba(0,0,0,0.65)", paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  durationText:  { color: "#fff", fontSize: 11 },
  featuredBadge: { position: "absolute", top: 10, left: 10, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  featuredText:  { color: "#fff", fontSize: 10 },

  videoInfo:     { padding: 14, gap: 6 },
  categoryChip:  { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  categoryText:  { fontSize: 11 },
  views:         { fontSize: 12 },
  videoTitle:    { fontSize: 15, lineHeight: 21 },
  videoDesc:     { fontSize: 12, lineHeight: 18 },
  watchBtn:      { flexDirection: "row", alignItems: "center", gap: 7, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10, alignSelf: "flex-start", marginTop: 4 },
  watchBtnText:  { color: "#fff", fontSize: 13 },

  filterChip:     { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  filterChipText: { fontSize: 13 },

  tipCard:       { flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 14, borderRadius: 14, borderWidth: 1 },
  tipText:       { flex: 1, fontSize: 13, lineHeight: 19 },
});
