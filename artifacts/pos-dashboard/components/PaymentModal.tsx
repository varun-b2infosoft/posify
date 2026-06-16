import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useLayout } from "@/hooks/useLayout";
import { Customer, addCustomer, getCustomers, subscribeCustomers } from "@/store/customers";

export type PaymentMethod = "cash" | "upi" | "card";

export interface PaymentResult {
  method:        PaymentMethod;
  customerId:    string | null;
  customerName:  string | null;
  amountPaid:    number;
  walletUsed:    number;
  totalReceived: number;
  dueAmount:     number;
  walletAdded:   number;
}

export interface DeliveryCheckoutParams {
  customer: { id?: string; name: string; phone: string; address?: string };
  amountReceived: number;
}

interface Props {
  visible:     boolean;
  total:       number;
  onClose:     () => void;
  onSuccess:   (result: PaymentResult) => void;
  onDelivery?: (params: DeliveryCheckoutParams) => void;
  isEditMode?: boolean;
}

const ACCENT_COLORS = ["#4F46E5","#10B981","#F59E0B","#EC4899","#8B5CF6","#EF4444","#06B6D4","#6366F1"];
function initials(name: string) { return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase(); }
function accentOf(name: string)  { return ACCENT_COLORS[name.charCodeAt(0) % ACCENT_COLORS.length]; }

export function PaymentModal({ visible, total, onClose, onSuccess, onDelivery, isEditMode }: Props) {
  const colors  = useColors();
  const layout  = useLayout();
  const slideAnim   = useRef(new Animated.Value(520)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  const [method,      setMethod]      = useState<PaymentMethod>("cash");
  const [amountInput, setAmountInput] = useState("");

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [useWallet,        setUseWallet]         = useState(true);

  const [isDelivery,      setIsDelivery]      = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState("");

  const [pickerVisible, setPickerVisible] = useState(false);
  const [customers,     setCustomers]     = useState<Customer[]>(() => getCustomers());
  const [cSearch,       setCSearch]       = useState("");
  const [quickAdd,      setQuickAdd]      = useState(false);
  const [qName,         setQName]         = useState("");
  const [qPhone,        setQPhone]        = useState("");
  const [qErr,          setQErr]          = useState("");

  useEffect(() => subscribeCustomers(() => setCustomers(getCustomers())), []);

  useEffect(() => {
    if (layout.isWide) return;
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim,   { toValue: 0,   tension: 65, friction: 11, useNativeDriver: true }),
        Animated.timing(overlayAnim, { toValue: 1,   duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim,   { toValue: 520, duration: 220, useNativeDriver: true }),
        Animated.timing(overlayAnim, { toValue: 0,   duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  useEffect(() => {
    if (visible) {
      setAmountInput("");
      setMethod("cash");
      setSelectedCustomer(null);
      setUseWallet(true);
      setIsDelivery(false);
      setDeliveryAddress("");
    }
  }, [visible]);

  const walletBalance = selectedCustomer?.walletBalance ?? 0;
  const walletApplied = (!isDelivery && useWallet && walletBalance > 0) ? Math.min(walletBalance, total) : 0;
  const netPayable    = total - walletApplied;
  const amountPaid    = Math.max(0, parseInt(amountInput || "0", 10));
  const balance       = amountPaid - netPayable;
  const dueAmount     = balance < 0 ? -balance : 0;
  const walletAdded   = balance > 0 ? balance  : 0;
  const isPaid        = balance === 0 && amountPaid > 0;
  const needsCustomer = isDelivery || dueAmount > 0 || walletAdded > 0 || walletApplied > 0;
  const canPay        = isDelivery
    ? selectedCustomer !== null
    : amountPaid > 0 && (!needsCustomer || selectedCustomer !== null);

  const QUICK_AMOUNTS = [...new Set([
    netPayable,
    netPayable + 50,
    netPayable + 100,
    Math.ceil(netPayable / 100) * 100,
  ])].filter(v => v > 0);

  const handleMethodChange = (m: PaymentMethod) => {
    setMethod(m);
    if (m !== "cash") setAmountInput(netPayable.toString());
  };

  const handleConfirm = () => {
    if (!canPay) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (isDelivery && onDelivery && selectedCustomer) {
      onDelivery({
        customer: { id: selectedCustomer.id, name: selectedCustomer.name, phone: selectedCustomer.phone, address: deliveryAddress.trim() || undefined },
        amountReceived: amountPaid,
      });
      return;
    }
    onSuccess({
      method,
      customerId:    selectedCustomer?.id   ?? null,
      customerName:  selectedCustomer?.name ?? null,
      amountPaid,
      walletUsed:    walletApplied,
      totalReceived: amountPaid + walletApplied,
      dueAmount,
      walletAdded,
    });
  };

  const handlePickCustomer = (c: Customer) => {
    setSelectedCustomer(c);
    setUseWallet(true);
    setPickerVisible(false);
    setCSearch("");
    setQuickAdd(false);
    if (method !== "cash") {
      const wApplied = c.walletBalance > 0 ? Math.min(c.walletBalance, total) : 0;
      setAmountInput((total - wApplied).toString());
    }
  };

  const handleQuickAdd = () => {
    if (!qName.trim() || !qPhone.trim()) { setQErr("Name and phone are required"); return; }
    const nc = addCustomer({ name: qName.trim(), phone: qPhone.trim(), email: "", address: "" });
    setQName(""); setQPhone(""); setQErr(""); setQuickAdd(false);
    handlePickCustomer(nc);
  };

  const filteredCustomers = customers.filter(c =>
    !cSearch ||
    c.name.toLowerCase().includes(cSearch.toLowerCase()) ||
    c.phone.includes(cSearch)
  );

  const btnLabel = isDelivery
    ? `Save as Delivery Order`
    : dueAmount > 0
    ? `Confirm · ₹${dueAmount.toLocaleString()} Udhaar`
    : walletAdded > 0
    ? `Confirm · +₹${walletAdded.toLocaleString()} Wallet`
    : `Confirm Payment · ₹${(amountPaid > 0 ? amountPaid + walletApplied : netPayable).toLocaleString()}`;

  const PAYMENT_METHODS = [
    { key: "cash" as PaymentMethod, icon: "dollar-sign", label: "Cash" },
    { key: "upi"  as PaymentMethod, icon: "smartphone",  label: "UPI"  },
    { key: "card" as PaymentMethod, icon: "credit-card", label: "Card" },
  ];

  const CustomerSection = ({ compact }: { compact?: boolean }) => (
    <View style={compact ? {} : s.section}>
      {!compact && (
        <View style={s.sectionHeader}>
          <Text style={[s.sectionLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
            Customer{isDelivery ? " (Required)" : ""}
          </Text>
          {needsCustomer && !selectedCustomer && (
            <View style={[s.reqBadge, { backgroundColor: "#EF444415" }]}>
              <Text style={{ color: "#EF4444", fontSize: 10, fontFamily: "Inter_600SemiBold" }}>Required</Text>
            </View>
          )}
        </View>
      )}

      <TouchableOpacity
        style={[s.customerBtn, { backgroundColor: colors.background, borderColor: needsCustomer && !selectedCustomer ? "#EF444450" : colors.border }]}
        onPress={() => setPickerVisible(true)}
        activeOpacity={0.8}
      >
        {selectedCustomer ? (
          <View style={s.customerSelected}>
            <View style={[s.avatar, { backgroundColor: accentOf(selectedCustomer.name) }]}>
              <Text style={s.avatarText}>{initials(selectedCustomer.name)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.foreground, fontSize: 14, fontFamily: "Inter_600SemiBold" }}>{selectedCustomer.name}</Text>
              <Text style={{ color: colors.mutedForeground, fontSize: 12, fontFamily: "Inter_400Regular" }}>{selectedCustomer.phone}</Text>
            </View>
            <TouchableOpacity onPress={() => setSelectedCustomer(null)} style={{ padding: 4 }}>
              <Feather name="x-circle" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={s.customerPlaceholder}>
            <Feather name="user-plus" size={16} color={colors.mutedForeground} />
            <Text style={{ color: colors.mutedForeground, fontSize: 13, fontFamily: "Inter_400Regular", flex: 1, marginLeft: 8 }}>
              Select or add customer…
            </Text>
            <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
          </View>
        )}
      </TouchableOpacity>

      {selectedCustomer && walletBalance > 0 && (
        <TouchableOpacity
          style={[s.walletToggle, { backgroundColor: useWallet ? "#10B98110" : colors.muted, borderColor: useWallet ? "#10B98140" : colors.border }]}
          onPress={() => setUseWallet(v => !v)}
          activeOpacity={0.8}
        >
          <View style={[s.checkbox, { backgroundColor: useWallet ? "#10B981" : colors.border }]}>
            {useWallet && <Feather name="check" size={10} color="#fff" />}
          </View>
          <Feather name="pocket" size={13} color={useWallet ? "#10B981" : colors.mutedForeground} />
          <Text style={[s.walletToggleText, { color: useWallet ? "#10B981" : colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
            Use wallet — ₹{walletBalance.toLocaleString()}
          </Text>
          {useWallet && (
            <View style={[s.savePill, { backgroundColor: "#10B981" }]}>
              <Text style={{ color: "#fff", fontSize: 10, fontFamily: "Inter_600SemiBold" }}>−₹{walletApplied.toLocaleString()}</Text>
            </View>
          )}
        </TouchableOpacity>
      )}

      {walletApplied > 0 && (
        <View style={[s.netPayRow, { backgroundColor: "#10B9810C", borderColor: "#10B98128" }]}>
          <Feather name="arrow-right" size={12} color="#10B981" />
          <Text style={{ color: "#10B981", fontSize: 12, fontFamily: "Inter_400Regular", flex: 1, marginLeft: 6 }}>
            Net payable after wallet
          </Text>
          <Text style={{ color: "#10B981", fontSize: 15, fontFamily: "Inter_700Bold" }}>₹{netPayable.toLocaleString()}</Text>
        </View>
      )}

      {isDelivery && selectedCustomer && (
        <View style={[s.addressField, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <Feather name="map-pin" size={14} color={colors.mutedForeground} />
          <TextInput
            style={[s.addressInput, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
            value={deliveryAddress}
            onChangeText={setDeliveryAddress}
            placeholder="Delivery address (optional)"
            placeholderTextColor={colors.mutedForeground}
            multiline
          />
        </View>
      )}
    </View>
  );

  const CustomerPickerContent = () => (
    <>
      <View style={[s.pickerSearch, { backgroundColor: colors.background, borderColor: colors.border }]}>
        <Feather name="search" size={14} color={colors.mutedForeground} />
        <TextInput
          style={[s.pickerSearchInput, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
          placeholder="Search by name or phone…"
          placeholderTextColor={colors.mutedForeground}
          value={cSearch}
          onChangeText={setCSearch}
          autoFocus
        />
        {cSearch.length > 0 && (
          <TouchableOpacity onPress={() => setCSearch("")}>
            <Feather name="x" size={13} color={colors.mutedForeground} />
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        style={[s.quickAddRow, { backgroundColor: quickAdd ? colors.primary + "10" : colors.background, borderColor: quickAdd ? colors.primary + "40" : colors.border }]}
        onPress={() => { setQuickAdd(v => !v); setQErr(""); }}
      >
        <Feather name={quickAdd ? "minus-circle" : "user-plus"} size={14} color={colors.primary} />
        <Text style={{ color: colors.primary, fontFamily: "Inter_600SemiBold", fontSize: 13, marginLeft: 6 }}>
          {quickAdd ? "Cancel" : "Add New Customer"}
        </Text>
      </TouchableOpacity>

      {quickAdd && (
        <View style={[s.quickAddForm, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <TextInput
            style={[s.quickFormInput, { color: colors.foreground, backgroundColor: colors.card, borderColor: colors.border, fontFamily: "Inter_400Regular" }]}
            placeholder="Full name *"
            placeholderTextColor={colors.mutedForeground}
            value={qName}
            onChangeText={setQName}
          />
          <TextInput
            style={[s.quickFormInput, { color: colors.foreground, backgroundColor: colors.card, borderColor: colors.border, fontFamily: "Inter_400Regular" }]}
            placeholder="Phone number *"
            placeholderTextColor={colors.mutedForeground}
            keyboardType="phone-pad"
            value={qPhone}
            onChangeText={setQPhone}
          />
          {qErr.length > 0 && <Text style={{ color: "#EF4444", fontSize: 11, fontFamily: "Inter_400Regular" }}>{qErr}</Text>}
          <TouchableOpacity style={[s.quickFormSubmit, { backgroundColor: colors.primary }]} onPress={handleQuickAdd}>
            <Text style={{ color: "#fff", fontFamily: "Inter_600SemiBold", fontSize: 13 }}>Add & Select</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false}>
        {filteredCustomers.map(c => (
          <TouchableOpacity
            key={c.id}
            style={[s.customerRow, { borderBottomColor: colors.border }, selectedCustomer?.id === c.id && { backgroundColor: colors.primary + "0D" }]}
            onPress={() => handlePickCustomer(c)}
            activeOpacity={0.75}
          >
            <View style={[s.avatar, { backgroundColor: accentOf(c.name) }]}>
              <Text style={s.avatarText}>{initials(c.name)}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={{ color: colors.foreground, fontSize: 14, fontFamily: "Inter_600SemiBold" }}>{c.name}</Text>
              <Text style={{ color: colors.mutedForeground, fontSize: 12, fontFamily: "Inter_400Regular" }}>{c.phone}</Text>
            </View>
            <View style={{ gap: 4, alignItems: "flex-end", marginRight: 8 }}>
              {c.creditBalance > 0 && (
                <View style={[s.miniPill, { backgroundColor: "#EF444415" }]}>
                  <Text style={{ color: "#EF4444", fontSize: 9, fontFamily: "Inter_600SemiBold" }}>Due ₹{c.creditBalance.toLocaleString()}</Text>
                </View>
              )}
              {c.walletBalance > 0 && (
                <View style={[s.miniPill, { backgroundColor: "#10B98115" }]}>
                  <Text style={{ color: "#10B981", fontSize: 9, fontFamily: "Inter_600SemiBold" }}>Wallet ₹{c.walletBalance.toLocaleString()}</Text>
                </View>
              )}
            </View>
            {selectedCustomer?.id === c.id && <Feather name="check" size={16} color={colors.primary} />}
          </TouchableOpacity>
        ))}
        {filteredCustomers.length === 0 && (
          <View style={{ alignItems: "center", paddingVertical: 32 }}>
            <Feather name="users" size={28} color={colors.mutedForeground} />
            <Text style={{ color: colors.mutedForeground, marginTop: 8, fontFamily: "Inter_400Regular", fontSize: 13 }}>
              No customers found
            </Text>
          </View>
        )}
      </ScrollView>
    </>
  );

  /* ════════════════════════════════════════════
     DESKTOP LAYOUT
  ════════════════════════════════════════════ */
  if (layout.isWide) {
    return (
      <>
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
          <View style={d.overlay}>
            <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

            <View style={[d.dialog, { backgroundColor: colors.card }]}>

              {/* ── Header ── */}
              <View style={[d.header, { borderBottomColor: colors.border }]}>
                <View style={[d.headerIconWrap, { backgroundColor: colors.primary + "15" }]}>
                  <Feather name="credit-card" size={19} color={colors.primary} />
                </View>
                <Text style={[d.headerTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Checkout</Text>
                <View style={[d.headerTotalChip, { backgroundColor: colors.primary }]}>
                  <Feather name="shopping-bag" size={13} color="rgba(255,255,255,0.85)" />
                  <Text style={[d.headerTotalText, { fontFamily: "Inter_700Bold" }]}>₹{total.toLocaleString()}</Text>
                </View>
                <View style={{ flex: 1 }} />
                <TouchableOpacity onPress={onClose} style={[d.closeBtn, { backgroundColor: colors.secondary }]}>
                  <Feather name="x" size={18} color={colors.mutedForeground} />
                </TouchableOpacity>
              </View>

              {/* ── Two-column body ── */}
              <View style={d.body}>

                {/* Left column: order summary + customer */}
                <ScrollView
                  style={d.leftCol}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={d.leftPad}
                  keyboardShouldPersistTaps="handled"
                >
                  {/* Bill total card */}
                  <View style={[d.totalCard, { backgroundColor: colors.primary }]}>
                    <View style={{ flex: 1 }}>
                      <Text style={[d.totalLabel, { fontFamily: "Inter_400Regular" }]}>Bill Total</Text>
                      <Text style={[d.totalAmt, { fontFamily: "Inter_700Bold" }]}>₹{total.toLocaleString()}</Text>
                    </View>
                    {walletApplied > 0 ? (
                      <View style={d.totalRight}>
                        <Text style={[d.totalWalletLabel, { fontFamily: "Inter_400Regular" }]}>After wallet</Text>
                        <Text style={[d.totalNetAmt, { fontFamily: "Inter_700Bold" }]}>₹{netPayable.toLocaleString()}</Text>
                      </View>
                    ) : (
                      <View style={[d.totalBadge, { backgroundColor: "rgba(255,255,255,0.18)" }]}>
                        <Feather name="receipt" size={20} color="#fff" />
                      </View>
                    )}
                  </View>

                  {/* Delivery toggle */}
                  {onDelivery && !isEditMode && (
                    <TouchableOpacity
                      style={[d.deliveryToggle, {
                        backgroundColor: isDelivery ? "#4F46E508" : colors.background,
                        borderColor: isDelivery ? "#4F46E550" : colors.border,
                      }]}
                      onPress={() => { setIsDelivery(v => !v); setAmountInput(""); }}
                      activeOpacity={0.8}
                    >
                      <View style={[d.deliveryCheck, { backgroundColor: isDelivery ? "#4F46E5" : colors.border }]}>
                        {isDelivery && <Feather name="check" size={11} color="#fff" />}
                      </View>
                      <Feather name="truck" size={15} color={isDelivery ? "#4F46E5" : colors.mutedForeground} />
                      <View style={{ flex: 1 }}>
                        <Text style={[d.deliveryTitle, { color: isDelivery ? "#4F46E5" : colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                          Mark as Delivery Order
                        </Text>
                        <Text style={[d.deliverySub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                          Save for delivery · collect payment later
                        </Text>
                      </View>
                      {isDelivery && (
                        <View style={[d.onPill, { backgroundColor: "#4F46E5" }]}>
                          <Text style={[d.onPillText, { fontFamily: "Inter_700Bold" }]}>ON</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  )}

                  {/* Customer label */}
                  <View style={d.sectionHeaderRow}>
                    <Text style={[d.sectionLabel, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>
                      CUSTOMER{isDelivery ? " (REQUIRED)" : " — OPTIONAL"}
                    </Text>
                    {needsCustomer && !selectedCustomer && (
                      <View style={[d.reqBadge, { backgroundColor: "#EF444415" }]}>
                        <Feather name="alert-circle" size={10} color="#EF4444" />
                        <Text style={{ color: "#EF4444", fontSize: 10, fontFamily: "Inter_600SemiBold" }}>Required</Text>
                      </View>
                    )}
                  </View>

                  <CustomerSection compact />
                </ScrollView>

                {/* Vertical divider */}
                <View style={[d.divider, { backgroundColor: colors.border }]} />

                {/* Right column: payment + confirm */}
                <View style={[d.rightCol, { backgroundColor: colors.secondary }]}>

                  {/* Payment method */}
                  {!isDelivery && (
                    <View style={d.rightSection}>
                      <Text style={[d.sectionLabel, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>
                        PAYMENT METHOD
                      </Text>
                      <View style={d.methodRow}>
                        {PAYMENT_METHODS.map(m => (
                          <TouchableOpacity
                            key={m.key}
                            style={[d.methodBtn, {
                              backgroundColor: method === m.key ? colors.primary : colors.card,
                              borderColor: method === m.key ? colors.primary : colors.border,
                            }]}
                            onPress={() => handleMethodChange(m.key)}
                            activeOpacity={0.8}
                          >
                            <Feather name={m.icon as any} size={17} color={method === m.key ? "#fff" : colors.mutedForeground} />
                            <Text style={[d.methodLabel, { color: method === m.key ? "#fff" : colors.foreground, fontFamily: method === m.key ? "Inter_700Bold" : "Inter_400Regular" }]}>
                              {m.label}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  )}

                  {/* Amount received */}
                  <View style={d.rightSection}>
                    <Text style={[d.sectionLabel, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>
                      {isDelivery ? "ADVANCE / AMOUNT RECEIVED (OPTIONAL)" : "AMOUNT RECEIVED"}
                    </Text>
                    <View style={[d.amountWrap, {
                      backgroundColor: colors.card,
                      borderColor: isPaid ? "#10B981" : amountPaid > 0 && dueAmount > 0 ? "#EF4444" : colors.border,
                    }]}>
                      <Text style={[d.rupee, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>₹</Text>
                      <TextInput
                        style={[d.amountInput, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}
                        keyboardType="numeric"
                        value={amountInput}
                        onChangeText={setAmountInput}
                        placeholder={netPayable.toString()}
                        placeholderTextColor={colors.mutedForeground}
                        autoFocus={method === "cash"}
                      />
                      {amountPaid > 0 && (
                        <TouchableOpacity onPress={() => setAmountInput("")} style={d.clearInputBtn}>
                          <Feather name="x-circle" size={16} color={colors.mutedForeground} />
                        </TouchableOpacity>
                      )}
                    </View>

                    {/* Quick amount chips */}
                    <View style={d.quickRow}>
                      {QUICK_AMOUNTS.map(amt => (
                        <TouchableOpacity
                          key={amt}
                          style={[d.quickChip, { backgroundColor: colors.card, borderColor: colors.border }]}
                          onPress={() => setAmountInput(amt.toString())}
                        >
                          <Text style={[d.quickChipText, { color: colors.primary, fontFamily: "Inter_600SemiBold" }]}>
                            ₹{amt.toLocaleString()}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Balance indicator */}
                  {amountPaid > 0 && (
                    <View style={[d.balanceCard, {
                      backgroundColor: isPaid ? "#10B98110" : dueAmount > 0 ? "#EF444410" : "#10B98110",
                      borderColor: isPaid ? "#10B98130" : dueAmount > 0 ? "#EF444430" : "#10B98130",
                    }]}>
                      <Feather
                        name={isPaid ? "check-circle" : dueAmount > 0 ? "alert-circle" : "trending-up"}
                        size={18}
                        color={isPaid ? "#10B981" : dueAmount > 0 ? "#EF4444" : "#10B981"}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={[d.balanceLabel, { color: isPaid ? "#10B981" : dueAmount > 0 ? "#EF4444" : "#10B981", fontFamily: "Inter_600SemiBold" }]}>
                          {isPaid ? "Paid in Full" : dueAmount > 0 ? "Due / Udhaar" : "Extra → Added to Wallet"}
                        </Text>
                        {!isPaid && (
                          <Text style={[d.balanceAmt, { color: dueAmount > 0 ? "#EF4444" : "#10B981", fontFamily: "Inter_700Bold" }]}>
                            ₹{(dueAmount > 0 ? dueAmount : walletAdded).toLocaleString()}
                          </Text>
                        )}
                      </View>
                    </View>
                  )}

                  {/* Customer warning */}
                  {needsCustomer && !selectedCustomer && amountPaid > 0 && (
                    <View style={[d.warning, { backgroundColor: "#F59E0B10", borderColor: "#F59E0B40" }]}>
                      <Feather name="alert-triangle" size={14} color="#F59E0B" />
                      <Text style={[d.warningText, { fontFamily: "Inter_400Regular" }]}>
                        Select a customer for credit or wallet transactions
                      </Text>
                    </View>
                  )}

                  <View style={{ flex: 1 }} />

                  {/* Confirm button */}
                  <TouchableOpacity
                    style={[d.confirmBtn, { backgroundColor: canPay ? (isDelivery ? "#4F46E5" : colors.primary) : colors.border }]}
                    onPress={handleConfirm}
                    disabled={!canPay}
                    activeOpacity={0.85}
                  >
                    <Feather name={isDelivery ? "truck" : "check-circle"} size={20} color={canPay ? "#fff" : colors.mutedForeground} />
                    <Text style={[d.confirmText, { color: canPay ? "#fff" : colors.mutedForeground, fontFamily: "Inter_700Bold" }]}>
                      {btnLabel}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>

        {/* Customer Picker — centered dialog on desktop */}
        <Modal visible={pickerVisible} transparent animationType="fade" onRequestClose={() => setPickerVisible(false)}>
          <View style={d.overlay}>
            <Pressable style={StyleSheet.absoluteFill} onPress={() => setPickerVisible(false)} />
            <View style={[d.pickerDialog, { backgroundColor: colors.card }]}>
              <View style={[d.header, { borderBottomColor: colors.border }]}>
                <View style={[d.headerIconWrap, { backgroundColor: colors.primary + "12" }]}>
                  <Feather name="users" size={18} color={colors.primary} />
                </View>
                <Text style={[d.headerTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                  Select Customer
                </Text>
                <View style={{ flex: 1 }} />
                <TouchableOpacity onPress={() => setPickerVisible(false)} style={[d.closeBtn, { backgroundColor: colors.secondary }]}>
                  <Feather name="x" size={16} color={colors.mutedForeground} />
                </TouchableOpacity>
              </View>
              <View style={{ flex: 1, paddingTop: 12 }}>
                <CustomerPickerContent />
              </View>
            </View>
          </View>
        </Modal>
      </>
    );
  }

  /* ════════════════════════════════════════════
     MOBILE LAYOUT (unchanged)
  ════════════════════════════════════════════ */
  return (
    <>
      <Modal visible={visible} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <Animated.View style={[s.overlay, { opacity: overlayAnim }]}>
            <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
          </Animated.View>

          <Animated.View style={[s.sheet, { backgroundColor: colors.card, transform: [{ translateY: slideAnim }] }]}>
            <View style={[s.handle, { backgroundColor: colors.border }]} />

            <View style={s.titleRow}>
              <Text style={[s.title, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Checkout</Text>
              <TouchableOpacity onPress={onClose} style={[s.closeBtn, { backgroundColor: colors.muted }]}>
                <Feather name="x" size={18} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 8 }}>
              <View style={[s.totalCard, { backgroundColor: colors.primary }]}>
                <Text style={[s.totalLabel, { fontFamily: "Inter_400Regular" }]}>Bill Total</Text>
                <Text style={[s.totalAmt,   { fontFamily: "Inter_700Bold"   }]}>₹{total.toLocaleString()}</Text>
              </View>

              {onDelivery && !isEditMode && (
                <TouchableOpacity
                  style={[s.deliveryToggle, { backgroundColor: isDelivery ? "#4F46E512" : colors.secondary, borderColor: isDelivery ? "#4F46E540" : colors.border }]}
                  onPress={() => { setIsDelivery(v => !v); setAmountInput(""); }}
                  activeOpacity={0.8}
                >
                  <View style={[s.deliveryCheckbox, { backgroundColor: isDelivery ? "#4F46E5" : colors.border }]}>
                    {isDelivery && <Feather name="check" size={11} color="#fff" />}
                  </View>
                  <Feather name="truck" size={15} color={isDelivery ? "#4F46E5" : colors.mutedForeground} />
                  <View style={{ flex: 1 }}>
                    <Text style={[s.deliveryToggleTitle, { color: isDelivery ? "#4F46E5" : colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                      Mark as Delivery Order
                    </Text>
                    <Text style={[s.deliveryToggleSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                      Save order for delivery · collect payment later
                    </Text>
                  </View>
                  {isDelivery && (
                    <View style={[s.deliveryActivePill, { backgroundColor: "#4F46E5" }]}>
                      <Text style={[s.deliveryActivePillText, { fontFamily: "Inter_700Bold" }]}>ON</Text>
                    </View>
                  )}
                </TouchableOpacity>
              )}

              <CustomerSection />

              {!isDelivery && (
                <Text style={[s.sectionLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium", marginHorizontal: 16, marginBottom: 8 }]}>
                  Payment Method
                </Text>
              )}
              {!isDelivery && (
                <View style={s.methodRow}>
                  {PAYMENT_METHODS.map(m => (
                    <TouchableOpacity
                      key={m.key}
                      style={[s.methodBtn, { backgroundColor: method === m.key ? colors.primary : colors.background, borderColor: method === m.key ? colors.primary : colors.border }]}
                      onPress={() => handleMethodChange(m.key)}
                      activeOpacity={0.8}
                    >
                      <Feather name={m.icon as any} size={19} color={method === m.key ? "#fff" : colors.mutedForeground} />
                      <Text style={[s.methodLabel, { color: method === m.key ? "#fff" : colors.foreground, fontFamily: method === m.key ? "Inter_600SemiBold" : "Inter_400Regular" }]}>
                        {m.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <View style={s.section}>
                <Text style={[s.sectionLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
                  {isDelivery ? "Advance / Amount Received (Optional)" : "Amount Received"}
                </Text>
                <View style={[s.amountWrap, { backgroundColor: colors.background, borderColor: isPaid ? "#10B981" : amountPaid > 0 && dueAmount > 0 ? "#EF4444" : colors.border }]}>
                  <Text style={[s.rupee, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>₹</Text>
                  <TextInput
                    style={[s.amountInput, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}
                    keyboardType="numeric"
                    value={amountInput}
                    onChangeText={setAmountInput}
                    placeholder={netPayable.toString()}
                    placeholderTextColor={colors.mutedForeground}
                    autoFocus={method === "cash"}
                  />
                  {amountPaid > 0 && (
                    <TouchableOpacity onPress={() => setAmountInput("")} style={{ padding: 4 }}>
                      <Feather name="x" size={15} color={colors.mutedForeground} />
                    </TouchableOpacity>
                  )}
                </View>

                <View style={s.quickRow}>
                  {QUICK_AMOUNTS.map(amt => (
                    <TouchableOpacity
                      key={amt}
                      style={[s.quickBtn, { backgroundColor: colors.secondary, borderColor: colors.border }]}
                      onPress={() => setAmountInput(amt.toString())}
                    >
                      <Text style={[s.quickText, { color: colors.primary, fontFamily: "Inter_600SemiBold" }]}>₹{amt.toLocaleString()}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {amountPaid > 0 && (
                  <View style={[s.balanceRow, { backgroundColor: isPaid ? "#10B98112" : dueAmount > 0 ? "#EF444410" : "#10B98112" }]}>
                    <Feather
                      name={isPaid ? "check-circle" : dueAmount > 0 ? "alert-circle" : "trending-up"}
                      size={16}
                      color={isPaid ? "#10B981" : dueAmount > 0 ? "#EF4444" : "#10B981"}
                    />
                    <Text style={[s.balanceLabel, { color: isPaid ? "#10B981" : dueAmount > 0 ? "#EF4444" : "#10B981", fontFamily: "Inter_600SemiBold" }]}>
                      {isPaid ? "Paid in Full" : dueAmount > 0 ? "Due (Udhaar)" : "Extra → Wallet"}
                    </Text>
                    {!isPaid && (
                      <Text style={[s.balanceAmt, { color: dueAmount > 0 ? "#EF4444" : "#10B981", fontFamily: "Inter_700Bold" }]}>
                        ₹{(dueAmount > 0 ? dueAmount : walletAdded).toLocaleString()}
                      </Text>
                    )}
                  </View>
                )}

                {needsCustomer && !selectedCustomer && amountPaid > 0 && (
                  <View style={[s.warning, { backgroundColor: "#F59E0B12", borderColor: "#F59E0B40" }]}>
                    <Feather name="alert-triangle" size={13} color="#F59E0B" />
                    <Text style={[s.warningText, { fontFamily: "Inter_400Regular" }]}>
                      Customer required for credit or wallet transactions
                    </Text>
                  </View>
                )}
              </View>
            </ScrollView>

            <TouchableOpacity
              style={[s.confirmBtn, { backgroundColor: canPay ? (isDelivery ? "#4F46E5" : colors.primary) : colors.border, marginHorizontal: 16, marginBottom: 16 }]}
              onPress={handleConfirm}
              disabled={!canPay}
              activeOpacity={0.85}
            >
              <Feather name={isDelivery ? "truck" : "check-circle"} size={20} color={canPay ? "#fff" : colors.mutedForeground} />
              <Text style={[s.confirmText, { color: canPay ? "#fff" : colors.mutedForeground, fontFamily: "Inter_700Bold" }]}>
                {btnLabel}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Customer Picker — mobile bottom sheet */}
      <Modal visible={pickerVisible} transparent animationType="slide" onRequestClose={() => setPickerVisible(false)}>
        <View style={s.pickerOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setPickerVisible(false)} />
          <View style={[s.pickerSheet, { backgroundColor: colors.card }]}>
            <View style={[s.handle, { backgroundColor: colors.border, alignSelf: "center" }]} />
            <View style={s.pickerHeader}>
              <Text style={[s.pickerTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Select Customer</Text>
              <TouchableOpacity onPress={() => setPickerVisible(false)} style={[s.closeBtn, { backgroundColor: colors.muted }]}>
                <Feather name="x" size={16} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
            <CustomerPickerContent />
          </View>
        </View>
      </Modal>
    </>
  );
}

/* ════════════════════════════════
   DESKTOP STYLES
════════════════════════════════ */
const d = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
  },

  dialog: {
    width: "100%",
    maxWidth: 860,
    maxHeight: "88%",
    borderRadius: 20,
    overflow: "hidden",
    flexDirection: "column",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.22,
    shadowRadius: 36,
    elevation: 20,
  },

  pickerDialog: {
    width: "100%",
    maxWidth: 480,
    maxHeight: "82%",
    borderRadius: 20,
    overflow: "hidden",
    flexDirection: "column",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 26,
    elevation: 14,
  },

  /* Header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 22,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  headerIconWrap: {
    width: 38, height: 38, borderRadius: 11,
    alignItems: "center", justifyContent: "center",
  },
  headerTitle:     { fontSize: 18 },
  headerTotalChip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, marginLeft: 4,
  },
  headerTotalText: { color: "#fff", fontSize: 15 },
  closeBtn: {
    width: 34, height: 34, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
  },

  /* Two-column body */
  body: { flexDirection: "row", flex: 1, overflow: "hidden" },

  /* Left column */
  leftCol: { flex: 1 },
  leftPad: { padding: 22, gap: 14 },

  /* Total card */
  totalCard: {
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
  },
  totalLabel:       { fontSize: 12, color: "rgba(255,255,255,0.8)", marginBottom: 5 },
  totalAmt:         { fontSize: 30, color: "#fff" },
  totalBadge:       { width: 46, height: 46, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  totalRight:       { alignItems: "flex-end" },
  totalWalletLabel: { fontSize: 11, color: "rgba(255,255,255,0.75)", marginBottom: 3 },
  totalNetAmt:      { fontSize: 22, color: "#fff" },

  /* Delivery toggle */
  deliveryToggle: {
    flexDirection: "row", alignItems: "center", gap: 10,
    borderRadius: 12, borderWidth: 1.5, padding: 13,
  },
  deliveryCheck: { width: 18, height: 18, borderRadius: 5, alignItems: "center", justifyContent: "center" },
  deliveryTitle: { fontSize: 13 },
  deliverySub:   { fontSize: 11, marginTop: 2 },
  onPill:        { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  onPillText:    { color: "#fff", fontSize: 10 },

  /* Section label */
  sectionHeaderRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  sectionLabel:     { fontSize: 10, letterSpacing: 0.8, flex: 1 },
  reqBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6,
  },

  /* Vertical divider */
  divider: { width: 1 },

  /* Right column */
  rightCol: {
    width: 360,
    padding: 22,
    flexDirection: "column",
    gap: 18,
  },
  rightSection: { gap: 10 },

  /* Payment method */
  methodRow: { flexDirection: "row", gap: 8 },
  methodBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 7, paddingVertical: 12, borderRadius: 11, borderWidth: 1,
  },
  methodLabel: { fontSize: 13 },

  /* Amount input */
  amountWrap: {
    flexDirection: "row", alignItems: "center",
    borderRadius: 13, borderWidth: 2,
    paddingHorizontal: 16, paddingVertical: 2,
  },
  rupee:         { fontSize: 18, marginRight: 4 },
  amountInput:   { flex: 1, fontSize: 28, paddingVertical: 10 },
  clearInputBtn: { padding: 5 },

  /* Quick amount chips */
  quickRow:      { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  quickChip:     { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  quickChipText: { fontSize: 13 },

  /* Balance card */
  balanceCard: {
    flexDirection: "row", alignItems: "center", gap: 12,
    borderRadius: 12, borderWidth: 1,
    paddingHorizontal: 14, paddingVertical: 12,
  },
  balanceLabel: { fontSize: 13 },
  balanceAmt:   { fontSize: 16, marginTop: 2 },

  /* Warning */
  warning:     { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 10, borderWidth: 1, paddingHorizontal: 13, paddingVertical: 10 },
  warningText: { flex: 1, fontSize: 12, color: "#92400E" },

  /* Confirm */
  confirmBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 10, borderRadius: 14, paddingVertical: 17,
  },
  confirmText: { fontSize: 16 },
});

/* ════════════════════════════════
   MOBILE STYLES (unchanged)
════════════════════════════════ */
const s = StyleSheet.create({
  overlay:   { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.45)" },
  sheet:     { position: "absolute", bottom: 0, left: 0, right: 0, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 10, maxHeight: "92%" },
  handle:    { width: 36, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 10 },
  titleRow:  { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, marginBottom: 12 },
  title:     { fontSize: 20 },
  closeBtn:  { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },

  totalCard:  { marginHorizontal: 16, borderRadius: 14, paddingHorizontal: 18, paddingVertical: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  totalLabel: { fontSize: 13, color: "rgba(255,255,255,0.8)" },
  totalAmt:   { fontSize: 26, color: "#fff" },

  section:       { paddingHorizontal: 16, marginBottom: 14 },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  sectionLabel:  { fontSize: 12, letterSpacing: 0.3 },
  reqBadge:      { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5 },

  customerBtn:         { borderRadius: 12, borderWidth: 1, padding: 12 },
  customerSelected:    { flexDirection: "row", alignItems: "center", gap: 10 },
  customerPlaceholder: { flexDirection: "row", alignItems: "center" },
  avatar:              { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  avatarText:          { color: "#fff", fontSize: 13, fontFamily: "Inter_700Bold" },

  walletToggle:     { flexDirection: "row", alignItems: "center", gap: 7, borderRadius: 10, borderWidth: 1, padding: 10, marginTop: 8 },
  checkbox:         { width: 16, height: 16, borderRadius: 4, alignItems: "center", justifyContent: "center" },
  walletToggleText: { flex: 1, fontSize: 13 },
  savePill:         { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  netPayRow:        { flexDirection: "row", alignItems: "center", marginTop: 8, borderRadius: 8, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 8 },

  methodRow:  { flexDirection: "row", paddingHorizontal: 16, gap: 8, marginBottom: 14 },
  methodBtn:  { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 12, borderRadius: 12, borderWidth: 1 },
  methodLabel:{ fontSize: 13 },

  amountWrap:  { flexDirection: "row", alignItems: "center", borderRadius: 12, borderWidth: 1.5, paddingHorizontal: 14, paddingVertical: 2, marginBottom: 10 },
  rupee:       { fontSize: 22, marginRight: 4 },
  amountInput: { flex: 1, fontSize: 28, paddingVertical: 8 },

  quickRow: { flexDirection: "row", gap: 8, marginBottom: 10, flexWrap: "wrap" },
  quickBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
  quickText:{ fontSize: 13 },

  balanceRow:   { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 6 },
  balanceLabel: { flex: 1, fontSize: 14 },
  balanceAmt:   { fontSize: 17 },

  warning:     { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 8, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8 },
  warningText: { flex: 1, fontSize: 12, color: "#92400E" },

  confirmBtn:  { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, borderRadius: 14, paddingVertical: 17 },
  confirmText: { fontSize: 16 },

  deliveryToggle:      { flexDirection: "row", alignItems: "center", gap: 10, marginHorizontal: 16, marginBottom: 12, borderRadius: 12, borderWidth: 1.5, padding: 12 },
  deliveryCheckbox:    { width: 18, height: 18, borderRadius: 5, alignItems: "center", justifyContent: "center" },
  deliveryToggleTitle: { fontSize: 14 },
  deliveryToggleSub:   { fontSize: 11, marginTop: 1 },
  deliveryActivePill:  { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  deliveryActivePillText: { color: "#fff", fontSize: 10 },

  addressField: { flexDirection: "row", alignItems: "flex-start", gap: 8, borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10, marginTop: 8 },
  addressInput: { flex: 1, fontSize: 14, lineHeight: 20, minHeight: 38 },

  pickerOverlay: { flex: 1, justifyContent: "flex-end" },
  pickerSheet:   { borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 10, maxHeight: "88%", paddingBottom: 32 },
  pickerHeader:  { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 12 },
  pickerTitle:   { fontSize: 17 },

  pickerSearch:      { flexDirection: "row", alignItems: "center", gap: 8, marginHorizontal: 16, borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 8 },
  pickerSearchInput: { flex: 1, fontSize: 14, padding: 0 },

  quickAddRow:  { flexDirection: "row", alignItems: "center", marginHorizontal: 16, borderRadius: 10, borderWidth: 1, padding: 10, marginBottom: 8 },
  quickAddForm: { marginHorizontal: 16, borderRadius: 12, borderWidth: 1, padding: 12, gap: 8, marginBottom: 8 },
  quickFormInput:  { borderRadius: 8, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  quickFormSubmit: { borderRadius: 10, paddingVertical: 11, alignItems: "center" },

  customerRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  miniPill:    { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5 },
});
