import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { getProducts, CATEGORY_COLORS, CATEGORY_ICONS } from "@/store/products";
import { getSuppliers } from "@/store/suppliers";
import { PurchaseLineItem, confirmPurchase } from "@/store/purchases";

type Step = "supplier" | "products" | "confirm" | "success";

interface CartEntry {
  productId: string;
  productName: string;
  currentStock: number;
  costPrice: string;
  qty: number;
}

export default function NewPurchaseScreen() {
  const colors  = useColors();
  const insets  = useSafeAreaInsets();
  const topPad  = Platform.OS === "web" ? 67 : insets.top;
  const botPad  = Platform.OS === "web" ? 24 : insets.bottom + 16;

  const [step,           setStep]           = useState<Step>("supplier");
  const [selectedSuppId, setSelectedSuppId] = useState("");
  const [suppSearch,     setSuppSearch]     = useState("");
  const [suppModal,      setSuppModal]      = useState(false);
  const [productSearch,  setProductSearch]  = useState("");
  const [cart,           setCart]           = useState<CartEntry[]>([]);
  const [notes,          setNotes]          = useState("");
  const [successPO,      setSuccessPO]      = useState<string>("");

  const successAnim = useRef(new Animated.Value(0)).current;

  const suppliers = getSuppliers();
  const products  = getProducts();
  const selSupp   = suppliers.find((s) => s.id === selectedSuppId);

  const filteredSupp = suppliers.filter((s) =>
    s.name.toLowerCase().includes(suppSearch.toLowerCase()) ||
    s.phone.includes(suppSearch)
  );

  const filteredProd = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.sku.toLowerCase().includes(productSearch.toLowerCase())
  );

  const subtotal   = cart.reduce((s, e) => s + (parseFloat(e.costPrice) || 0) * e.qty, 0);
  const tax        = Math.round(subtotal * 0.09);
  const total      = subtotal + tax;
  const totalUnits = cart.reduce((s, e) => s + e.qty, 0);

  const addToCart = (p: typeof products[0]) => {
    setCart((prev) => {
      const ex = prev.find((e) => e.productId === p.id);
      if (ex) return prev.map((e) => e.productId === p.id ? { ...e, qty: e.qty + 1 } : e);
      return [...prev, {
        productId: p.id,
        productName: p.name,
        currentStock: p.stock,
        costPrice: String(Math.round(p.price * 0.7)),
        qty: 1,
      }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev.map((e) => e.productId === id ? { ...e, qty: Math.max(1, e.qty + delta) } : e)
    );
  };

  const setCostPrice = (id: string, val: string) => {
    setCart((prev) => prev.map((e) => e.productId === id ? { ...e, costPrice: val } : e));
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((e) => e.productId !== id));
  };

  const handleConfirm = () => {
    if (!selectedSuppId) { Alert.alert("Select a supplier first"); return; }
    if (cart.length === 0) { Alert.alert("Add at least one product"); return; }

    const items: PurchaseLineItem[] = cart.map((e) => ({
      productId:   e.productId,
      productName: e.productName,
      qty:         e.qty,
      costPrice:   parseFloat(e.costPrice) || 0,
    }));

    const po = confirmPurchase(selectedSuppId, selSupp!.name, items, notes);
    setSuccessPO(po.id);
    setStep("success");

    Animated.spring(successAnim, { toValue: 1, tension: 60, friction: 10, useNativeDriver: true }).start();
  };

  const STEPS: Step[] = ["supplier", "products", "confirm"];
  const stepIdx = STEPS.indexOf(step === "success" ? "confirm" : step);

  if (step === "success") {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: "#10B981" }]}>
          <Text style={[styles.headerTitle, { fontFamily: "Inter_700Bold" }]}>Purchase Complete</Text>
          <View style={{ width: 32 }} />
        </View>
        <Animated.View style={[styles.successBody, { opacity: successAnim, transform: [{ scale: successAnim.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) }] }]}>
          <View style={[styles.successCircle, { backgroundColor: "#10B98120" }]}>
            <Feather name="check-circle" size={64} color="#10B981" />
          </View>
          <Text style={[styles.successTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Stock Updated!</Text>
          <Text style={[styles.successId,    { color: colors.primary,    fontFamily: "Inter_700Bold" }]}>{successPO}</Text>
          <Text style={[styles.successSub,   { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            {totalUnits} units across {cart.length} SKUs added to inventory.{"\n"}
            Supplier: {selSupp?.name}
          </Text>
          <View style={[styles.successAmount, { backgroundColor: "#10B98115", borderRadius: 14, padding: 16 }]}>
            <Text style={[styles.successAmtLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Total Paid</Text>
            <Text style={[styles.successAmtVal, { color: "#10B981", fontFamily: "Inter_700Bold" }]}>₹{total.toLocaleString()}</Text>
          </View>
          <TouchableOpacity
            style={[styles.newPOBtn, { backgroundColor: "#10B981" }]}
            onPress={() => { setCart([]); setSelectedSuppId(""); setStep("supplier"); }}
          >
            <Feather name="plus" size={18} color="#fff" />
            <Text style={[styles.newPOBtnText, { fontFamily: "Inter_700Bold" }]}>New Purchase Order</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.replace("/(tabs)/purchases" as any)} style={styles.viewHistoryBtn}>
            <Text style={[styles.viewHistoryText, { color: colors.primary, fontFamily: "Inter_500Medium" }]}>View Purchase History</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.primary }]}>
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="x" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { fontFamily: "Inter_700Bold" }]}>New Purchase Order</Text>
          <View style={{ width: 20 }} />
        </View>

        {/* Step indicator */}
        <View style={[styles.stepRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {(["supplier", "products", "confirm"] as Step[]).map((s, i) => {
            const done   = i < stepIdx;
            const active = i === stepIdx;
            return (
              <React.Fragment key={s}>
                <TouchableOpacity
                  style={styles.stepItem}
                  onPress={() => { if (done) setStep(s); }}
                  disabled={!done}
                >
                  <View style={[styles.stepCircle, {
                    backgroundColor: done ? "#10B981" : active ? colors.primary : colors.secondary,
                    borderColor:     done ? "#10B981" : active ? colors.primary : colors.border,
                  }]}>
                    {done
                      ? <Feather name="check" size={12} color="#fff" />
                      : <Text style={[styles.stepNum, { color: active ? "#fff" : colors.mutedForeground, fontFamily: "Inter_700Bold" }]}>{i + 1}</Text>
                    }
                  </View>
                  <Text style={[styles.stepLabel, {
                    color: active ? colors.primary : done ? "#10B981" : colors.mutedForeground,
                    fontFamily: active ? "Inter_600SemiBold" : "Inter_400Regular",
                  }]}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </Text>
                </TouchableOpacity>
                {i < 2 && <View style={[styles.stepLine, { backgroundColor: done ? "#10B981" : colors.border }]} />}
              </React.Fragment>
            );
          })}
        </View>

        {/* STEP 1: Supplier */}
        {step === "supplier" && (
          <ScrollView style={{ flex: 1 }} contentContainerStyle={[styles.stepContent, { paddingBottom: botPad + 16 }]}>
            <Text style={[styles.stepHeading, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
              Who are you buying from?
            </Text>

            {selSupp ? (
              <TouchableOpacity
                style={[styles.selectedSupp, { backgroundColor: "#4F46E510", borderColor: "#4F46E540" }]}
                onPress={() => setSuppModal(true)}
              >
                <View style={[styles.suppAvatarLarge, { backgroundColor: "#4F46E520" }]}>
                  <Text style={[styles.suppInitialsLarge, { color: "#4F46E5", fontFamily: "Inter_700Bold" }]}>
                    {selSupp.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.selSuppName, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>{selSupp.name}</Text>
                  <Text style={[styles.selSuppMeta, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                    {selSupp.phone} · {selSupp.totalOrders} orders
                  </Text>
                </View>
                <Feather name="chevron-down" size={18} color={colors.mutedForeground} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.suppSelectBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => setSuppModal(true)}
              >
                <Feather name="users" size={18} color={colors.primary} />
                <Text style={[styles.suppSelectText, { color: colors.primary, fontFamily: "Inter_600SemiBold" }]}>Select Supplier</Text>
                <Feather name="chevron-down" size={16} color={colors.primary} />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.addSuppBtn, { borderColor: colors.border }]}
              onPress={() => router.push("/suppliers/edit" as any)}
            >
              <Feather name="user-plus" size={14} color={colors.mutedForeground} />
              <Text style={[styles.addSuppText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                + Add new supplier
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.nextBtn, { backgroundColor: selSupp ? colors.primary : colors.border }]}
              onPress={() => { if (selSupp) setStep("products"); }}
              disabled={!selSupp}
            >
              <Text style={[styles.nextBtnText, { fontFamily: "Inter_700Bold" }]}>Continue</Text>
              <Feather name="arrow-right" size={18} color="#fff" />
            </TouchableOpacity>
          </ScrollView>
        )}

        {/* STEP 2: Products */}
        {step === "products" && (
          <>
            <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="search" size={15} color={colors.mutedForeground} />
              <TextInput
                style={[styles.searchInput, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
                placeholder="Search product to add..."
                placeholderTextColor={colors.mutedForeground}
                value={productSearch}
                onChangeText={setProductSearch}
              />
              {productSearch.length > 0 && (
                <TouchableOpacity onPress={() => setProductSearch("")}>
                  <Feather name="x" size={14} color={colors.mutedForeground} />
                </TouchableOpacity>
              )}
            </View>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={[styles.productList, { paddingBottom: botPad + 90 }]}>
              {cart.length > 0 && (
                <View style={styles.cartSection}>
                  <Text style={[styles.sectionLabel, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                    In Purchase ({cart.length} SKUs · {totalUnits} units)
                  </Text>
                  {cart.map((entry) => {
                    const prod = products.find((p) => p.id === entry.productId);
                    const catColor = prod ? (CATEGORY_COLORS[prod.category] ?? CATEGORY_COLORS.default) : "#4F46E5";
                    const catIcon  = prod ? (CATEGORY_ICONS[prod.category]  ?? CATEGORY_ICONS.default)  : "box";
                    return (
                      <View key={entry.productId} style={[styles.cartRow, { backgroundColor: colors.card, borderColor: "#10B98130" }]}>
                        <View style={[styles.rowIcon, { backgroundColor: catColor + "18" }]}>
                          <Feather name={catIcon as any} size={16} color={catColor} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.rowName, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]} numberOfLines={1}>
                            {entry.productName}
                          </Text>
                          <View style={styles.costRow}>
                            <Text style={[styles.costLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>₹</Text>
                            <TextInput
                              style={[styles.costInput, { color: colors.foreground, borderColor: colors.border, fontFamily: "Inter_500Medium" }]}
                              value={entry.costPrice}
                              onChangeText={(v) => setCostPrice(entry.productId, v)}
                              keyboardType="decimal-pad"
                            />
                            <Text style={[styles.costLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                              / unit
                            </Text>
                          </View>
                        </View>
                        <View style={styles.qtyControl}>
                          <TouchableOpacity onPress={() => updateQty(entry.productId, -1)} style={[styles.qtyBtn, { borderColor: colors.border }]}>
                            <Feather name="minus" size={12} color={colors.foreground} />
                          </TouchableOpacity>
                          <Text style={[styles.qtyNum, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>{entry.qty}</Text>
                          <TouchableOpacity onPress={() => updateQty(entry.productId, 1)} style={[styles.qtyBtn, { borderColor: colors.primary, backgroundColor: colors.primary }]}>
                            <Feather name="plus" size={12} color="#fff" />
                          </TouchableOpacity>
                        </View>
                        <TouchableOpacity onPress={() => removeFromCart(entry.productId)} style={{ padding: 4 }}>
                          <Feather name="trash-2" size={14} color={colors.destructive} />
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              )}

              <Text style={[styles.sectionLabel, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                {productSearch ? "Search Results" : "All Products"}
              </Text>
              {filteredProd.map((p) => {
                const inCart   = cart.find((e) => e.productId === p.id);
                const catColor = CATEGORY_COLORS[p.category] ?? CATEGORY_COLORS.default;
                const catIcon  = CATEGORY_ICONS[p.category]  ?? CATEGORY_ICONS.default;
                return (
                  <TouchableOpacity
                    key={p.id}
                    style={[styles.prodRow, {
                      backgroundColor: inCart ? "#4F46E508" : colors.card,
                      borderColor: inCart ? "#4F46E530" : colors.border,
                    }]}
                    onPress={() => addToCart(p)}
                    activeOpacity={0.75}
                  >
                    <View style={[styles.rowIcon, { backgroundColor: catColor + "18" }]}>
                      <Feather name={catIcon as any} size={16} color={catColor} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.rowName, { color: colors.foreground, fontFamily: inCart ? "Inter_600SemiBold" : "Inter_500Medium" }]} numberOfLines={1}>
                        {p.name}
                      </Text>
                      <Text style={[styles.rowStock, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                        {p.sku} · Stock: {p.stock} {p.unit}
                      </Text>
                    </View>
                    <Text style={[styles.rowPrice, { color: catColor, fontFamily: "Inter_700Bold" }]}>₹{p.price}</Text>
                    {inCart ? (
                      <View style={[styles.inCartBadge, { backgroundColor: "#10B98120" }]}>
                        <Text style={[styles.inCartText, { color: "#10B981", fontFamily: "Inter_700Bold" }]}>×{inCart.qty}</Text>
                      </View>
                    ) : (
                      <View style={[styles.addBadge, { backgroundColor: colors.primary + "15", borderColor: colors.primary + "30" }]}>
                        <Feather name="plus" size={14} color={colors.primary} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {cart.length > 0 && (
              <View style={[styles.cartBar, { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: botPad }]}>
                <View>
                  <Text style={[styles.cartBarCount, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                    {totalUnits} units · {cart.length} SKUs
                  </Text>
                  <Text style={[styles.cartBarTotal, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>
                    ₹{subtotal.toLocaleString()} subtotal
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.cartBarBtn, { backgroundColor: colors.primary }]}
                  onPress={() => setStep("confirm")}
                >
                  <Text style={[styles.cartBarBtnText, { fontFamily: "Inter_700Bold" }]}>Review Order</Text>
                  <Feather name="arrow-right" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        {/* STEP 3: Confirm */}
        {step === "confirm" && (
          <>
            <ScrollView style={{ flex: 1 }} contentContainerStyle={[styles.stepContent, { paddingBottom: botPad + 90 }]}>
              {/* Supplier */}
              <View style={[styles.confirmSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.confirmSectionTitle, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>SUPPLIER</Text>
                <View style={styles.suppRowInline}>
                  <View style={[styles.suppAvatarSm, { backgroundColor: "#4F46E520" }]}>
                    <Text style={[{ fontSize: 13, color: "#4F46E5", fontFamily: "Inter_700Bold" }]}>
                      {selSupp?.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                    </Text>
                  </View>
                  <View>
                    <Text style={[{ color: colors.foreground, fontFamily: "Inter_600SemiBold", fontSize: 15 }]}>{selSupp?.name}</Text>
                    <Text style={[{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 12 }]}>{selSupp?.phone}</Text>
                  </View>
                </View>
              </View>

              {/* Items */}
              <View style={[styles.confirmSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.confirmSectionTitle, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
                  ITEMS ({cart.length} SKUs · {totalUnits} units)
                </Text>
                {cart.map((entry, idx) => {
                  const prod = products.find((p) => p.id === entry.productId);
                  const catColor = prod ? (CATEGORY_COLORS[prod.category] ?? "#4F46E5") : "#4F46E5";
                  return (
                    <View key={entry.productId}>
                      {idx > 0 && <View style={[{ height: 1, backgroundColor: colors.border }]} />}
                      <View style={styles.confirmItem}>
                        <View style={{ flex: 1 }}>
                          <Text style={[{ color: colors.foreground, fontFamily: "Inter_500Medium", fontSize: 14 }]} numberOfLines={1}>
                            {entry.productName}
                          </Text>
                          <Text style={[{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 12 }]}>
                            {entry.qty} {prod?.unit ?? "pcs"} × ₹{entry.costPrice}
                          </Text>
                        </View>
                        <Text style={[{ color: catColor, fontFamily: "Inter_700Bold", fontSize: 15 }]}>
                          ₹{((parseFloat(entry.costPrice) || 0) * entry.qty).toLocaleString()}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>

              {/* Summary */}
              <View style={[styles.confirmSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.confirmSectionTitle, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>SUMMARY</Text>
                {[
                  { label: "Subtotal", value: `₹${subtotal.toLocaleString()}` },
                  { label: "GST (9%)", value: `₹${tax.toLocaleString()}` },
                ].map((r) => (
                  <View key={r.label} style={styles.summaryLine}>
                    <Text style={[styles.summaryLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{r.label}</Text>
                    <Text style={[styles.summaryVal,   { color: colors.foreground,      fontFamily: "Inter_500Medium"   }]}>{r.value}</Text>
                  </View>
                ))}
                <View style={[styles.summaryLine, styles.totalLine, { borderTopColor: colors.border }]}>
                  <Text style={[styles.summaryLabel, { color: colors.foreground, fontFamily: "Inter_700Bold", fontSize: 16 }]}>Total</Text>
                  <Text style={[styles.summaryVal,   { color: colors.primary,    fontFamily: "Inter_700Bold", fontSize: 20 }]}>₹{total.toLocaleString()}</Text>
                </View>
              </View>

              {/* Notes */}
              <View style={[styles.confirmSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.confirmSectionTitle, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>NOTES (Optional)</Text>
                <TextInput
                  style={[styles.notesInput, { color: colors.foreground, borderColor: colors.border, fontFamily: "Inter_400Regular" }]}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Delivery instructions, reference..."
                  placeholderTextColor={colors.mutedForeground}
                  multiline
                />
              </View>
            </ScrollView>

            <View style={[styles.confirmBar, { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: botPad }]}>
              <TouchableOpacity
                style={[styles.backBtn, { borderColor: colors.border }]}
                onPress={() => setStep("products")}
              >
                <Feather name="arrow-left" size={16} color={colors.foreground} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmBtn, { backgroundColor: "#10B981", flex: 1 }]}
                onPress={handleConfirm}
              >
                <Feather name="check-circle" size={18} color="#fff" />
                <Text style={[styles.confirmBtnText, { fontFamily: "Inter_700Bold" }]}>
                  Confirm Purchase · ₹{total.toLocaleString()}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Supplier selector modal */}
        <Modal visible={suppModal} transparent animationType="slide">
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setSuppModal(false)} />
          <View style={[styles.modalSheet, { backgroundColor: colors.card }]}>
            <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />
            <Text style={[styles.modalTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Select Supplier</Text>
            <View style={[styles.modalSearch, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Feather name="search" size={14} color={colors.mutedForeground} />
              <TextInput
                style={[styles.modalSearchInput, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
                placeholder="Search suppliers..."
                placeholderTextColor={colors.mutedForeground}
                value={suppSearch}
                onChangeText={setSuppSearch}
              />
            </View>
            <ScrollView style={{ maxHeight: 320 }}>
              {filteredSupp.map((s) => (
                <TouchableOpacity
                  key={s.id}
                  style={[styles.modalItem, {
                    backgroundColor: s.id === selectedSuppId ? "#4F46E510" : "transparent",
                    borderColor: s.id === selectedSuppId ? "#4F46E540" : "transparent",
                  }]}
                  onPress={() => { setSelectedSuppId(s.id); setSuppModal(false); }}
                >
                  <View style={[styles.modalAvatar, { backgroundColor: "#4F46E520" }]}>
                    <Text style={[{ fontSize: 13, color: "#4F46E5", fontFamily: "Inter_700Bold" }]}>
                      {s.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[{ color: colors.foreground, fontFamily: "Inter_600SemiBold", fontSize: 14 }]}>{s.name}</Text>
                    <Text style={[{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 12 }]}>
                      {s.phone} · {s.totalOrders} orders
                    </Text>
                  </View>
                  {s.id === selectedSuppId && <Feather name="check" size={16} color="#4F46E5" />}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={[styles.modalAddBtn, { borderColor: colors.border }]}
              onPress={() => { setSuppModal(false); router.push("/suppliers/edit" as any); }}
            >
              <Feather name="user-plus" size={14} color={colors.primary} />
              <Text style={[{ color: colors.primary, fontFamily: "Inter_500Medium", fontSize: 13 }]}>+ Add New Supplier</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  header: {
    flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between",
    paddingHorizontal: 16, paddingBottom: 12,
  },
  headerTitle: { color: "#fff", fontSize: 18, flex: 1, textAlign: "center" },

  stepRow: {
    flexDirection: "row", alignItems: "center",
    margin: 12, borderRadius: 12, borderWidth: 1,
    padding: 12,
  },
  stepItem:  { alignItems: "center", gap: 4 },
  stepCircle: {
    width: 26, height: 26, borderRadius: 13, borderWidth: 2,
    alignItems: "center", justifyContent: "center",
  },
  stepNum:   { fontSize: 12 },
  stepLabel: { fontSize: 11 },
  stepLine:  { flex: 1, height: 2, marginHorizontal: 6, marginBottom: 12 },

  stepContent: { paddingHorizontal: 14, paddingTop: 8, gap: 12 },
  stepHeading: { fontSize: 20, marginBottom: 4 },

  selectedSupp: {
    flexDirection: "row", alignItems: "center", gap: 12,
    borderRadius: 14, borderWidth: 1.5, padding: 14,
  },
  suppAvatarLarge: {
    width: 50, height: 50, borderRadius: 25,
    alignItems: "center", justifyContent: "center",
  },
  suppInitialsLarge: { fontSize: 18 },
  selSuppName: { fontSize: 16 },
  selSuppMeta: { fontSize: 12, marginTop: 2 },

  suppSelectBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    borderRadius: 14, borderWidth: 1.5, padding: 18,
  },
  suppSelectText: { fontSize: 16 },

  addSuppBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    borderRadius: 10, borderWidth: 1, borderStyle: "dashed", padding: 12,
  },
  addSuppText: { fontSize: 13 },

  nextBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    borderRadius: 14, padding: 16, marginTop: 8,
  },
  nextBtnText: { color: "#fff", fontSize: 16 },

  searchBar: {
    flexDirection: "row", alignItems: "center", gap: 9,
    marginHorizontal: 12, marginTop: 8, marginBottom: 4,
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9, borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 14 },

  productList: { paddingHorizontal: 12, paddingTop: 6, gap: 7 },

  cartSection: { gap: 7, marginBottom: 6 },
  sectionLabel: { fontSize: 13, marginBottom: 2 },

  cartRow: {
    flexDirection: "row", alignItems: "center", gap: 8,
    borderRadius: 12, borderWidth: 1.5, padding: 10,
  },
  rowIcon: {
    width: 36, height: 36, borderRadius: 9,
    alignItems: "center", justifyContent: "center",
  },
  rowName:    { fontSize: 13 },
  rowStock:   { fontSize: 11 },
  rowPrice:   { fontSize: 13 },
  costRow:    { flexDirection: "row", alignItems: "center", gap: 3, marginTop: 2 },
  costLabel:  { fontSize: 12 },
  costInput: {
    borderWidth: 1, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2,
    fontSize: 13, width: 70,
  },

  qtyControl: { flexDirection: "row", alignItems: "center", gap: 6 },
  qtyBtn: {
    width: 26, height: 26, borderRadius: 7, borderWidth: 1,
    alignItems: "center", justifyContent: "center",
  },
  qtyNum: { fontSize: 13, minWidth: 22, textAlign: "center" },

  prodRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    borderRadius: 12, borderWidth: 1, padding: 11,
  },
  inCartBadge: {
    width: 34, height: 34, borderRadius: 8,
    alignItems: "center", justifyContent: "center",
  },
  inCartText: { fontSize: 13 },
  addBadge: {
    width: 34, height: 34, borderRadius: 8, borderWidth: 1,
    alignItems: "center", justifyContent: "center",
  },

  cartBar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    padding: 12, paddingTop: 10, borderTopWidth: 1, gap: 12,
  },
  cartBarCount: { fontSize: 13 },
  cartBarTotal: { fontSize: 18 },
  cartBarBtn: {
    flexDirection: "row", alignItems: "center", gap: 7,
    paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12,
  },
  cartBarBtnText: { color: "#fff", fontSize: 14 },

  confirmSection: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  confirmSectionTitle: {
    fontSize: 11, paddingHorizontal: 14, paddingTop: 12, paddingBottom: 6,
    letterSpacing: 0.5,
  },
  suppRowInline: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 14, paddingBottom: 12,
  },
  suppAvatarSm: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: "center", justifyContent: "center",
  },
  confirmItem: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 14, paddingVertical: 10, gap: 10,
  },
  summaryLine:  { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 7 },
  summaryLabel: { fontSize: 13 },
  summaryVal:   { fontSize: 13 },
  totalLine:    { borderTopWidth: 1, paddingTop: 10 },

  notesInput: {
    borderRadius: 8, borderWidth: 1, padding: 10, fontSize: 13,
    marginHorizontal: 14, marginBottom: 12, minHeight: 60,
  },

  confirmBar: {
    flexDirection: "row", gap: 10, padding: 12, paddingTop: 10, borderTopWidth: 1,
  },
  backBtn: {
    width: 46, alignItems: "center", justifyContent: "center",
    borderRadius: 12, borderWidth: 1,
  },
  confirmBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, paddingVertical: 14, borderRadius: 12,
  },
  confirmBtnText: { color: "#fff", fontSize: 15 },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
  modalSheet: {
    borderTopLeftRadius: 22, borderTopRightRadius: 22,
    paddingTop: 8, paddingBottom: 24, overflow: "hidden",
  },
  modalHandle: { width: 36, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 12 },
  modalTitle: { fontSize: 17, paddingHorizontal: 16, marginBottom: 12 },
  modalSearch: {
    flexDirection: "row", alignItems: "center", gap: 8,
    marginHorizontal: 16, marginBottom: 8, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 9, borderWidth: 1,
  },
  modalSearchInput: { flex: 1, fontSize: 14 },
  modalItem: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingHorizontal: 16, paddingVertical: 12, borderRadius: 10, borderWidth: 1,
    marginHorizontal: 8, marginBottom: 4,
  },
  modalAvatar: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  modalAddBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    marginHorizontal: 16, marginTop: 8, borderRadius: 10, borderWidth: 1,
    borderStyle: "dashed", paddingVertical: 12,
  },

  successBody: {
    flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 14,
  },
  successCircle: {
    width: 110, height: 110, borderRadius: 55,
    alignItems: "center", justifyContent: "center",
  },
  successTitle:     { fontSize: 28 },
  successId:        { fontSize: 18 },
  successSub:       { fontSize: 14, textAlign: "center", lineHeight: 22 },
  successAmtLabel:  { fontSize: 13, textAlign: "center" },
  successAmtVal:    { fontSize: 30, textAlign: "center", marginTop: 4 },
  newPOBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14, marginTop: 8,
  },
  newPOBtnText:   { color: "#fff", fontSize: 16 },
  viewHistoryBtn: { marginTop: 4 },
  viewHistoryText: { fontSize: 14 },
});
