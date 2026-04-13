import React, { useState } from "react";
import {
  Alert,
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
import { getShops } from "@/store/shops";
import { getProducts, isWeightBased, formatQty, weightStep, weightPresets } from "@/store/products";
import { createTransfer, TransferItem } from "@/store/transfers";

type Step = 1 | 2 | 3;

export default function NewTransferScreen() {
  const colors  = useColors();
  const insets  = useSafeAreaInsets();
  const topPad  = Platform.OS === "web" ? 67 : insets.top;
  const botPad  = Platform.OS === "web" ? 24 : insets.bottom + 16;

  const shops    = getShops().filter(s => s.active);
  const products = getProducts();

  const [step,        setStep]        = useState<Step>(1);
  const [fromShopId,  setFromShopId]  = useState(shops[0]?.id ?? "");
  const [toShopId,    setToShopId]    = useState("");
  const [items,       setItems]       = useState<TransferItem[]>([]);
  const [notes,       setNotes]       = useState("");
  const [search,      setSearch]      = useState("");
  const [shopModal,   setShopModal]   = useState<"from" | "to" | null>(null);
  const [done,        setDone]        = useState<{ id: string; items: number } | null>(null);

  const fromShop = shops.find(s => s.id === fromShopId);
  const toShop   = shops.find(s => s.id === toShopId);

  const addItem = (prod: { id: string; name: string; stock: number; unit: string }) => {
    setItems(prev => {
      const existing = prev.find(i => i.productId === prod.id);
      if (existing) return prev;
      const initQty = isWeightBased(prod.unit) ? weightStep(prod.unit) : 1;
      return [...prev, { productId: prod.id, productName: prod.name, qty: initQty, unit: prod.unit }];
    });
  };

  const updateQty = (productId: string, qty: number) => {
    if (qty <= 0) setItems(prev => prev.filter(i => i.productId !== productId));
    else setItems(prev => prev.map(i => i.productId === productId ? { ...i, qty } : i));
  };

  const updateWeightQtyRaw = (productId: string, raw: string) => {
    const val = parseFloat(raw);
    if (!isNaN(val) && val > 0) {
      setItems(prev => prev.map(i => i.productId === productId ? { ...i, qty: val } : i));
    } else if (raw === "") {
      setItems(prev => prev.map(i => i.productId === productId ? { ...i, qty: 0 } : i));
    }
  };

  const getItemQty = (productId: string) => items.find(i => i.productId === productId)?.qty ?? 0;

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleConfirm = () => {
    if (!fromShopId || !toShopId) return;
    if (fromShopId === toShopId) { Alert.alert("Error", "Source and destination shops must be different."); return; }
    if (items.length === 0) { Alert.alert("Error", "Add at least one product to transfer."); return; }
    const t = createTransfer(fromShopId, toShopId, items, notes);
    setDone({ id: t.id, items: items.reduce((s, i) => s + i.qty, 0) });
  };

  if (done) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <View style={[styles.successBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.successIcon, { backgroundColor: "#10B98115" }]}>
            <Feather name="truck" size={40} color="#10B981" />
          </View>
          <Text style={[styles.successTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Transfer Initiated!</Text>
          <Text style={[styles.successId, { color: colors.primary, fontFamily: "Inter_600SemiBold" }]}>{done.id}</Text>
          <Text style={[styles.successSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            {done.items} units · {fromShop?.name} → {toShop?.name}
          </Text>
          <View style={styles.transferLine}>
            <View style={[styles.transferNode, { backgroundColor: fromShop?.color ?? "#4F46E5" }]} />
            <View style={[styles.transferTrack, { backgroundColor: "#10B981" }]} />
            <View style={[styles.transferTruck, { backgroundColor: "#10B98120" }]}>
              <Feather name="truck" size={16} color="#10B981" />
            </View>
            <View style={[styles.transferTrack, { backgroundColor: "#E5E7EB" }]} />
            <View style={[styles.transferNode, { backgroundColor: toShop?.color ?? "#10B981" }]} />
          </View>
          <View style={{ flexDirection: "row", gap: 10, width: "100%" }}>
            <TouchableOpacity
              style={[styles.doneBtn, { backgroundColor: colors.secondary, flex: 1 }]}
              onPress={() => router.push("/transfer/new" as any)}
            >
              <Text style={[{ color: colors.foreground, fontFamily: "Inter_600SemiBold", fontSize: 14 }]}>New Transfer</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.doneBtn, { backgroundColor: "#4F46E5", flex: 1 }]}
              onPress={() => router.back()}
            >
              <Text style={[{ color: "#fff", fontFamily: "Inter_700Bold", fontSize: 14 }]}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  const STEPS = [
    { n: 1, label: "Shops" },
    { n: 2, label: "Products" },
    { n: 3, label: "Confirm" },
  ];

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: topPad + 8 }]}>
          <TouchableOpacity onPress={() => (step > 1 ? setStep((step - 1) as Step) : router.back())} style={{ padding: 2 }}>
            <Feather name="arrow-left" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { fontFamily: "Inter_700Bold" }]}>New Stock Transfer</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Step indicator */}
        <View style={[styles.stepRow, { backgroundColor: "#4F46E5" }]}>
          {STEPS.map((s, idx) => {
            const active = step === s.n;
            const done   = step > s.n;
            return (
              <React.Fragment key={s.n}>
                <View style={styles.stepItem}>
                  <View style={[styles.stepCircle, { backgroundColor: done ? "#10B981" : active ? "#fff" : "rgba(255,255,255,0.3)" }]}>
                    {done
                      ? <Feather name="check" size={12} color="#fff" />
                      : <Text style={[styles.stepNum, { color: active ? "#4F46E5" : "rgba(255,255,255,0.7)", fontFamily: "Inter_700Bold" }]}>{s.n}</Text>
                    }
                  </View>
                  <Text style={[styles.stepLabel, { color: active ? "#fff" : "rgba(255,255,255,0.6)", fontFamily: active ? "Inter_600SemiBold" : "Inter_400Regular" }]}>{s.label}</Text>
                </View>
                {idx < STEPS.length - 1 && <View style={[styles.stepConnector, { backgroundColor: step > s.n ? "#10B981" : "rgba(255,255,255,0.25)" }]} />}
              </React.Fragment>
            );
          })}
        </View>

        {/* Step 1 — Shops */}
        {step === 1 && (
          <ScrollView contentContainerStyle={[styles.content, { paddingBottom: botPad + 80 }]}>
            <Text style={[styles.stepTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Select Shops</Text>

            {(["from", "to"] as const).map(dir => {
              const shopId = dir === "from" ? fromShopId : toShopId;
              const selShop = shops.find(s => s.id === shopId);
              return (
                <TouchableOpacity
                  key={dir}
                  style={[styles.shopSelectBtn, { backgroundColor: colors.card, borderColor: selShop ? selShop.color : colors.border }]}
                  onPress={() => setShopModal(dir)}
                >
                  <View style={[styles.shopSelectIcon, { backgroundColor: (selShop?.color ?? "#9CA3AF") + "20" }]}>
                    <Feather name="shopping-bag" size={18} color={selShop?.color ?? "#9CA3AF"} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.shopSelectDirLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                      {dir === "from" ? "From Shop" : "To Shop"}
                    </Text>
                    <Text style={[styles.shopSelectName, { color: selShop ? colors.foreground : colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>
                      {selShop?.name ?? "Tap to select..."}
                    </Text>
                  </View>
                  <Feather name="chevron-down" size={16} color={colors.mutedForeground} />
                </TouchableOpacity>
              );
            })}

            {fromShopId && toShopId && (
              <View style={[styles.routePreview, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.routeDot, { backgroundColor: fromShop?.color ?? "#4F46E5" }]} />
                <Feather name="arrow-right" size={14} color={colors.mutedForeground} />
                <Feather name="truck" size={16} color="#4F46E5" />
                <Feather name="arrow-right" size={14} color={colors.mutedForeground} />
                <View style={[styles.routeDot, { backgroundColor: toShop?.color ?? "#10B981" }]} />
                <Text style={[styles.routeText, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
                  {fromShop?.name} → {toShop?.name}
                </Text>
              </View>
            )}
          </ScrollView>
        )}

        {/* Step 2 — Products */}
        {step === 2 && (
          <View style={{ flex: 1 }}>
            <View style={[styles.searchWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="search" size={15} color={colors.mutedForeground} />
              <TextInput
                style={[styles.searchInput, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
                placeholder="Search products..."
                placeholderTextColor={colors.mutedForeground}
                value={search}
                onChangeText={setSearch}
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch("")}>
                  <Feather name="x" size={14} color={colors.mutedForeground} />
                </TouchableOpacity>
              )}
            </View>
            {items.length > 0 && (
              <View style={[styles.cartBar, { backgroundColor: "#4F46E5" }]}>
                <Feather name="package" size={14} color="#fff" />
                <Text style={[styles.cartBarText, { fontFamily: "Inter_600SemiBold" }]}>
                  {items.length} product{items.length > 1 ? "s" : ""} selected
                  {items.filter(i => isWeightBased(i.unit ?? "pcs")).length > 0
                    ? ` · incl. weighed items`
                    : ` · ${items.reduce((s, i) => s + i.qty, 0)} units`}
                </Text>
              </View>
            )}
            <ScrollView contentContainerStyle={{ padding: 12, gap: 8, paddingBottom: botPad + 80 }}>
              {filteredProducts.map(prod => {
                const qty      = getItemQty(prod.id);
                const wt       = isWeightBased(prod.unit);
                const step     = weightStep(prod.unit);
                const isAdded  = qty > 0;
                return (
                  <View key={prod.id} style={[styles.productRow, { backgroundColor: colors.card, borderColor: isAdded ? "#4F46E5" : colors.border }]}>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                        <Text style={[styles.productName, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]} numberOfLines={1}>{prod.name}</Text>
                        {wt && (
                          <View style={{ backgroundColor: "#F59E0B20", paddingHorizontal: 5, paddingVertical: 1, borderRadius: 5 }}>
                            <Text style={{ color: "#B45309", fontSize: 10, fontFamily: "Inter_700Bold" }}>{prod.unit}</Text>
                          </View>
                        )}
                      </View>
                      <Text style={[styles.productMeta, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                        Stock: {prod.stock} {prod.unit} · ₹{prod.price}/{prod.unit}
                      </Text>
                    </View>
                    {!isAdded ? (
                      <TouchableOpacity
                        style={[styles.addBtn, { backgroundColor: "#4F46E5" }]}
                        onPress={() => addItem(prod)}
                        disabled={prod.stock === 0}
                      >
                        <Feather name="plus" size={14} color="#fff" />
                      </TouchableOpacity>
                    ) : wt ? (
                      <View style={styles.weightQtyRow}>
                        <TouchableOpacity
                          style={[styles.qtyBtn, { backgroundColor: "#EF444415" }]}
                          onPress={() => updateQty(prod.id, parseFloat(Math.max(0, qty - step).toFixed(4)))}
                        >
                          <Feather name="minus" size={12} color="#EF4444" />
                        </TouchableOpacity>
                        <TextInput
                          style={[styles.weightQtyInput, { color: "#4F46E5", borderColor: "#4F46E540", fontFamily: "Inter_700Bold" }]}
                          value={qty > 0 ? String(qty) : ""}
                          onChangeText={v => updateWeightQtyRaw(prod.id, v.replace(/[^0-9.]/g, ""))}
                          keyboardType="decimal-pad"
                        />
                        <Text style={[{ fontSize: 10, color: "#4F46E5", fontFamily: "Inter_600SemiBold" }]}>{prod.unit}</Text>
                        <TouchableOpacity
                          style={[styles.qtyBtn, { backgroundColor: "#4F46E515" }]}
                          onPress={() => updateQty(prod.id, parseFloat(Math.min(prod.stock, qty + step).toFixed(4)))}
                        >
                          <Feather name="plus" size={12} color="#4F46E5" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => updateQty(prod.id, 0)}>
                          <Feather name="x" size={13} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View style={styles.qtyRow}>
                        <TouchableOpacity style={[styles.qtyBtn, { backgroundColor: "#EF444415" }]} onPress={() => updateQty(prod.id, qty - 1)}>
                          <Feather name="minus" size={12} color="#EF4444" />
                        </TouchableOpacity>
                        <Text style={[styles.qtyText, { color: "#4F46E5", fontFamily: "Inter_700Bold" }]}>{qty}</Text>
                        <TouchableOpacity
                          style={[styles.qtyBtn, { backgroundColor: "#4F46E515" }]}
                          onPress={() => qty < prod.stock && updateQty(prod.id, qty + 1)}
                        >
                          <Feather name="plus" size={12} color="#4F46E5" />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Step 3 — Confirm */}
        {step === 3 && (
          <ScrollView contentContainerStyle={[styles.content, { paddingBottom: botPad + 80 }]}>
            <Text style={[styles.stepTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Confirm Transfer</Text>

            <View style={[styles.confirmCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.confirmSectionLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>ROUTE</Text>
              <View style={styles.routeRow}>
                <View style={styles.routeShop}>
                  <View style={[styles.routeShopIcon, { backgroundColor: fromShop?.color + "20" }]}>
                    <Feather name="shopping-bag" size={16} color={fromShop?.color} />
                  </View>
                  <Text style={[styles.routeShopName, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]} numberOfLines={2}>{fromShop?.name}</Text>
                </View>
                <View style={{ alignItems: "center", gap: 4 }}>
                  <Feather name="truck" size={20} color="#4F46E5" />
                  <Text style={[{ color: colors.mutedForeground, fontSize: 10, fontFamily: "Inter_400Regular" }]}>Transfer</Text>
                </View>
                <View style={[styles.routeShop, { alignItems: "flex-end" }]}>
                  <View style={[styles.routeShopIcon, { backgroundColor: toShop?.color + "20" }]}>
                    <Feather name="shopping-bag" size={16} color={toShop?.color} />
                  </View>
                  <Text style={[styles.routeShopName, { color: colors.foreground, fontFamily: "Inter_600SemiBold", textAlign: "right" }]} numberOfLines={2}>{toShop?.name}</Text>
                </View>
              </View>
            </View>

            <View style={[styles.confirmCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.confirmSectionLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
                ITEMS ({items.length} products · {items.reduce((s, i) => s + i.qty, 0)} units)
              </Text>
              {items.map((item, idx) => (
                <React.Fragment key={item.productId}>
                  <View style={styles.confirmItemRow}>
                    <Feather name="package" size={13} color={colors.mutedForeground} />
                    <Text style={[styles.confirmItemName, { color: colors.foreground, fontFamily: "Inter_500Medium" }]} numberOfLines={1}>{item.productName}</Text>
                    <View style={[styles.confirmQtyBadge, { backgroundColor: "#4F46E515" }]}>
                      <Text style={[styles.confirmQtyText, { color: "#4F46E5", fontFamily: "Inter_700Bold" }]}>
                        {item.unit && isWeightBased(item.unit) ? `${item.qty} ${item.unit}` : `×${item.qty}`}
                      </Text>
                    </View>
                  </View>
                  {idx < items.length - 1 && <View style={[{ height: 1, backgroundColor: colors.border }]} />}
                </React.Fragment>
              ))}
            </View>

            <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>NOTES (optional)</Text>
              <TextInput
                style={[styles.notesInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background, fontFamily: "Inter_400Regular" }]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Add notes for this transfer..."
                placeholderTextColor={colors.mutedForeground}
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>
        )}

        {/* Bottom action */}
        {!done && (
          <View style={[styles.bottomBar, { borderTopColor: colors.border, paddingBottom: botPad + 12, backgroundColor: colors.card }]}>
            {step < 3 ? (
              <TouchableOpacity
                style={[styles.nextBtn, {
                  backgroundColor: (step === 1 && (!fromShopId || !toShopId || fromShopId === toShopId)) || (step === 2 && items.length === 0)
                    ? colors.border : "#4F46E5"
                }]}
                onPress={() => setStep((step + 1) as Step)}
                disabled={(step === 1 && (!fromShopId || !toShopId || fromShopId === toShopId)) || (step === 2 && items.length === 0)}
              >
                <Text style={[styles.nextBtnText, { fontFamily: "Inter_700Bold" }]}>
                  {step === 1 ? "Select Products →" : `Review Transfer (${items.reduce((s, i) => s + i.qty, 0)} units) →`}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={[styles.nextBtn, { backgroundColor: "#10B981" }]} onPress={handleConfirm}>
                <Feather name="truck" size={18} color="#fff" />
                <Text style={[styles.nextBtnText, { fontFamily: "Inter_700Bold" }]}>Initiate Transfer</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Shop picker modal */}
        <Modal visible={shopModal !== null} transparent animationType="slide" onRequestClose={() => setShopModal(null)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalSheet, { backgroundColor: colors.card }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                  {shopModal === "from" ? "Select Source Shop" : "Select Destination Shop"}
                </Text>
                <TouchableOpacity onPress={() => setShopModal(null)}>
                  <Feather name="x" size={20} color={colors.mutedForeground} />
                </TouchableOpacity>
              </View>
              {shops.map(s => {
                const isSelected = shopModal === "from" ? s.id === fromShopId : s.id === toShopId;
                const isDisabled = shopModal === "to" ? s.id === fromShopId : s.id === toShopId;
                return (
                  <TouchableOpacity
                    key={s.id}
                    style={[styles.shopOption, { borderColor: isSelected ? s.color : colors.border, backgroundColor: isSelected ? s.color + "10" : colors.background }]}
                    onPress={() => {
                      if (shopModal === "from") setFromShopId(s.id);
                      else setToShopId(s.id);
                      setShopModal(null);
                    }}
                    disabled={isDisabled}
                  >
                    <View style={[styles.shopOptionIcon, { backgroundColor: s.color + "20", opacity: isDisabled ? 0.4 : 1 }]}>
                      <Feather name="shopping-bag" size={18} color={s.color} />
                    </View>
                    <View style={{ flex: 1, opacity: isDisabled ? 0.4 : 1 }}>
                      <Text style={[styles.shopOptionName, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>{s.name}</Text>
                      <Text style={[styles.shopOptionAddr, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]} numberOfLines={1}>{s.address}</Text>
                    </View>
                    {isSelected && <Feather name="check-circle" size={18} color={s.color} />}
                    {isDisabled && <Text style={[{ color: colors.mutedForeground, fontSize: 10, fontFamily: "Inter_400Regular" }]}>Already selected</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>
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
    paddingHorizontal: 16, paddingBottom: 12, backgroundColor: "#4F46E5",
  },
  headerTitle: { color: "#fff", fontSize: 18 },
  stepRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 14, gap: 4 },
  stepItem: { alignItems: "center", gap: 4 },
  stepCircle: { width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  stepNum: { fontSize: 12 },
  stepLabel: { fontSize: 11 },
  stepConnector: { flex: 1, height: 2, marginBottom: 16, borderRadius: 1 },
  content: { padding: 12, gap: 12 },
  stepTitle: { fontSize: 18, marginBottom: 4 },

  shopSelectBtn: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 14, borderWidth: 1.5, padding: 14 },
  shopSelectIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  shopSelectDirLabel: { fontSize: 11, marginBottom: 2 },
  shopSelectName: { fontSize: 15 },
  routePreview: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 12, borderWidth: 1, padding: 12 },
  routeDot: { width: 10, height: 10, borderRadius: 5 },
  routeText: { fontSize: 13, flex: 1 },

  searchWrap: { flexDirection: "row", alignItems: "center", gap: 8, margin: 12, borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10 },
  searchInput: { flex: 1, fontSize: 14 },
  cartBar: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 8 },
  cartBarText: { color: "#fff", fontSize: 13 },
  productRow: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 12, borderWidth: 1.5, padding: 12 },
  productName: { fontSize: 14, marginBottom: 2 },
  productMeta: { fontSize: 12 },
  addBtn: { width: 32, height: 32, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  qtyRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  qtyBtn: { width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  qtyText: { fontSize: 15, minWidth: 22, textAlign: "center" },
  weightQtyRow:  { flexDirection: "row", alignItems: "center", gap: 5 },
  weightQtyInput: { width: 48, borderWidth: 1, borderRadius: 7, fontSize: 13, textAlign: "center", paddingVertical: 4 },

  confirmCard: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 10 },
  confirmSectionLabel: { fontSize: 10, letterSpacing: 0.8 },
  routeRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  routeShop: { flex: 1, alignItems: "flex-start", gap: 8 },
  routeShopIcon: { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  routeShopName: { fontSize: 13 },
  confirmItemRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 8 },
  confirmItemName: { flex: 1, fontSize: 13 },
  confirmQtyBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  confirmQtyText: { fontSize: 12 },
  section: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 10 },
  fieldLabel: { fontSize: 11, letterSpacing: 0.3 },
  notesInput: { borderWidth: 1, borderRadius: 10, padding: 10, fontSize: 14, minHeight: 80, textAlignVertical: "top" },

  bottomBar: { paddingHorizontal: 14, paddingTop: 12, borderTopWidth: 1 },
  nextBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 14, paddingVertical: 14 },
  nextBtnText: { color: "#fff", fontSize: 16 },

  successBox: { flex: 1, margin: 24, marginTop: 100, borderRadius: 24, borderWidth: 1, padding: 24, alignItems: "center", gap: 14 },
  successIcon: { width: 90, height: 90, borderRadius: 45, alignItems: "center", justifyContent: "center", marginBottom: 6 },
  successTitle: { fontSize: 22 },
  successId: { fontSize: 18 },
  successSub: { fontSize: 14, textAlign: "center" },
  transferLine: { flexDirection: "row", alignItems: "center", gap: 8, marginVertical: 8 },
  transferNode: { width: 14, height: 14, borderRadius: 7 },
  transferTrack: { flex: 1, height: 3, borderRadius: 2 },
  transferTruck: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  doneBtn: { borderRadius: 12, paddingVertical: 13, alignItems: "center", justifyContent: "center" },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalSheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16, gap: 10, paddingBottom: 40 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  modalTitle: { fontSize: 17 },
  shopOption: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 12, borderWidth: 1.5, padding: 12 },
  shopOptionIcon: { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  shopOptionName: { fontSize: 14, marginBottom: 2 },
  shopOptionAddr: { fontSize: 12 },
});
