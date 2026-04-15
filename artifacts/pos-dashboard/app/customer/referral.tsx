import React, { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  Share,
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
  subscribeCustomerApp,
  CustomerProfile,
} from "@/store/customerApp";

const MOCK_REFERRALS = [
  { name: "Priya S.",  status: "joined",    earned: 50,  date: "Apr 01, 2026" },
  { name: "Amit K.",   status: "joined",    earned: 50,  date: "Mar 22, 2026" },
  { name: "Rohit M.",  status: "pending",   earned: 0,   date: "Apr 10, 2026" },
];

export default function ReferralScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 60 : insets.top;

  const [profile, setProfile] = useState<CustomerProfile>(getCustomerProfile());

  useEffect(() => {
    return subscribeCustomerApp(() => setProfile(getCustomerProfile()));
  }, []);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join POSify and get ₹50 off your first order! Use my referral code: ${profile.referralCode}\n\nDownload now: https://posify.app`,
        title:   "Invite to POSify",
      });
    } catch {
      Alert.alert("Share failed", "Please try again");
    }
  };

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(
      `Hey! Join POSify and get ₹50 off your first order 🎉\nUse my code: ${profile.referralCode}\nhttps://posify.app`
    );
    Alert.alert("WhatsApp", "Opens WhatsApp with your referral link.");
  };

  const joinedCount = MOCK_REFERRALS.filter(r => r.status === "joined").length;
  const pendingCount = MOCK_REFERRALS.filter(r => r.status === "pending").length;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: "#8B5CF6", paddingTop: topPad + 10 }]}>
        <TouchableOpacity onPress={() => router.push("/customer" as any)} style={{ padding: 4 }}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { fontFamily: "Inter_700Bold" }]}>Refer & Earn</Text>
          <Text style={[styles.headerSub, { fontFamily: "Inter_400Regular" }]}>
            Invite friends, earn ₹50 each
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* Hero card */}
        <View style={[styles.heroCard, { backgroundColor: "#8B5CF6" }]}>
          <Text style={styles.heroEmoji}>🎁</Text>
          <Text style={[styles.heroTitle, { fontFamily: "Inter_700Bold" }]}>
            Invite Friends & Earn
          </Text>
          <Text style={[styles.heroSub, { fontFamily: "Inter_400Regular" }]}>
            You earn ₹50 + 100 pts when a friend joins and places their first order
          </Text>

          {/* Stats row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statVal, { fontFamily: "Inter_700Bold" }]}>{joinedCount}</Text>
              <Text style={[styles.statLabel, { fontFamily: "Inter_400Regular" }]}>Joined</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statVal, { fontFamily: "Inter_700Bold" }]}>{pendingCount}</Text>
              <Text style={[styles.statLabel, { fontFamily: "Inter_400Regular" }]}>Pending</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statVal, { fontFamily: "Inter_700Bold" }]}>
                ₹{profile.referralEarnings}
              </Text>
              <Text style={[styles.statLabel, { fontFamily: "Inter_400Regular" }]}>Earned</Text>
            </View>
          </View>
        </View>

        {/* Referral code */}
        <View style={[styles.codeCard, { backgroundColor: colors.card, borderColor: "#8B5CF630" }]}>
          <Text style={[styles.codeLabel, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>
            Your Referral Code
          </Text>
          <View style={[styles.codeBox, { backgroundColor: "#8B5CF612", borderColor: "#8B5CF640" }]}>
            <Text style={[styles.codeText, { color: "#8B5CF6", fontFamily: "Inter_700Bold" }]}>
              {profile.referralCode}
            </Text>
            <TouchableOpacity
              onPress={() => Alert.alert("Copied!", `${profile.referralCode} copied to clipboard`)}
              style={[styles.copyBtn, { backgroundColor: "#8B5CF6" }]}
            >
              <Feather name="copy" size={14} color="#fff" />
              <Text style={[styles.copyText, { fontFamily: "Inter_700Bold" }]}>Copy</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Share buttons */}
        <View style={{ gap: 12 }}>
          <TouchableOpacity
            style={[styles.shareBtn, { backgroundColor: "#25D366" }]}
            onPress={handleWhatsApp}
            activeOpacity={0.85}
          >
            <Feather name="message-circle" size={20} color="#fff" />
            <Text style={[styles.shareBtnText, { fontFamily: "Inter_700Bold" }]}>
              Share on WhatsApp
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.shareBtn, { backgroundColor: "#8B5CF6" }]}
            onPress={handleShare}
            activeOpacity={0.85}
          >
            <Feather name="share-2" size={20} color="#fff" />
            <Text style={[styles.shareBtnText, { fontFamily: "Inter_700Bold" }]}>
              Share Invite Link
            </Text>
          </TouchableOpacity>
        </View>

        {/* How it works */}
        <View style={[styles.howCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            How It Works
          </Text>
          {[
            { step: "1", text: "Share your referral code or link",           icon: "share-2",       color: "#3B82F6" },
            { step: "2", text: "Friend downloads POSify & signs up",          icon: "user-plus",     color: "#8B5CF6" },
            { step: "3", text: "Friend places their first order",             icon: "shopping-bag",  color: CUSTOMER_PRIMARY },
            { step: "4", text: "You get ₹50 + 100 loyalty points instantly", icon: "gift",          color: CUSTOMER_AMBER },
          ].map((h) => (
            <View key={h.step} style={styles.howRow}>
              <View style={[styles.howNum, { backgroundColor: h.color + "18" }]}>
                <Text style={[styles.howNumText, { color: h.color, fontFamily: "Inter_700Bold" }]}>
                  {h.step}
                </Text>
              </View>
              <Feather name={h.icon as any} size={16} color={h.color} />
              <Text style={[styles.howText, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>
                {h.text}
              </Text>
            </View>
          ))}
        </View>

        {/* Referral history */}
        <View style={[styles.howCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            Referral History
          </Text>
          {MOCK_REFERRALS.map((r, i) => (
            <View key={i} style={[styles.refRow, i > 0 && { borderTopColor: colors.border, borderTopWidth: 1 }]}>
              <View style={[styles.refAvatar, { backgroundColor: "#8B5CF618" }]}>
                <Text style={[styles.refAvatarText, { color: "#8B5CF6", fontFamily: "Inter_700Bold" }]}>
                  {r.name[0]}
                </Text>
              </View>
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={[styles.refName, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                  {r.name}
                </Text>
                <Text style={[styles.refDate, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  {r.date}
                </Text>
              </View>
              {r.status === "joined" ? (
                <View style={[styles.refBadge, { backgroundColor: CUSTOMER_PRIMARY + "18" }]}>
                  <Text style={[styles.refBadgeText, { color: CUSTOMER_PRIMARY, fontFamily: "Inter_700Bold" }]}>
                    +₹{r.earned}
                  </Text>
                </View>
              ) : (
                <View style={[styles.refBadge, { backgroundColor: "#F59E0B18" }]}>
                  <Text style={[styles.refBadgeText, { color: "#F59E0B", fontFamily: "Inter_600SemiBold" }]}>
                    Pending
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>

      <CustomerBottomNav activeTab="profile" />
    </View>
  );
}

const styles = StyleSheet.create({
  root:          { flex: 1 },
  header:        { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingBottom: 18 },
  headerTitle:   { color: "#fff", fontSize: 18 },
  headerSub:     { color: "rgba(255,255,255,0.85)", fontSize: 12 },
  heroCard:      { borderRadius: 20, padding: 24, alignItems: "center", gap: 12 },
  heroEmoji:     { fontSize: 40 },
  heroTitle:     { color: "#fff", fontSize: 22, textAlign: "center" },
  heroSub:       { color: "rgba(255,255,255,0.85)", fontSize: 13, textAlign: "center", lineHeight: 20 },
  statsRow:      { flexDirection: "row", alignItems: "center", gap: 20, marginTop: 8 },
  statItem:      { alignItems: "center", gap: 2 },
  statVal:       { color: "#fff", fontSize: 22 },
  statLabel:     { color: "rgba(255,255,255,0.8)", fontSize: 12 },
  statDivider:   { width: 1, height: 28, backgroundColor: "rgba(255,255,255,0.3)" },
  codeCard:      { borderRadius: 16, borderWidth: 1, padding: 16, gap: 10 },
  codeLabel:     { fontSize: 12 },
  codeBox:       { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 10 },
  codeText:      { fontSize: 24, letterSpacing: 2 },
  copyBtn:       { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10 },
  copyText:      { color: "#fff", fontSize: 13 },
  shareBtn:      { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, height: 52, borderRadius: 14 },
  shareBtnText:  { color: "#fff", fontSize: 15 },
  howCard:       { borderRadius: 16, borderWidth: 1, padding: 16, gap: 12 },
  sectionTitle:  { fontSize: 15, marginBottom: 2 },
  howRow:        { flexDirection: "row", alignItems: "center", gap: 10 },
  howNum:        { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  howNumText:    { fontSize: 13 },
  howText:       { flex: 1, fontSize: 13, lineHeight: 20 },
  refRow:        { flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 10 },
  refAvatar:     { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  refAvatarText: { fontSize: 16 },
  refName:       { fontSize: 14 },
  refDate:       { fontSize: 12 },
  refBadge:      { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  refBadgeText:  { fontSize: 13 },
});
