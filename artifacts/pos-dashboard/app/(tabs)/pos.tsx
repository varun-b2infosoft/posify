import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
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
import { useFocusEffect } from "expo-router";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useColors } from "@/hooks/useColors";
import { useLayout } from "@/hooks/useLayout";
import { Sidebar } from "@/components/Sidebar";
import { PaymentModal, PaymentMethod, PaymentResult } from "@/components/PaymentModal";
import { HoldOrderModal } from "@/components/HoldOrderModal";
import { HeldOrdersPanel } from "@/components/HeldOrdersPanel";
import {
  getProducts, subscribeProducts,
  isWeightBased, formatQty, weightPresets, weightStep,
  CATEGORY_COLORS, CATEGORY_ICONS,
} from "@/store/products";
import { addInvoice } from "@/store/invoices";
import { addCreditTransaction } from "@/store/customers";
import {
  HeldOrder,
  saveHoldOrder,
  getNextOrderName,
  heldOrderCount,
  subscribeHeldOrders,
} from "@/store/holdOrders";
import {
  createDeliveryOrder,
  updateDeliveryOrderItems,
  pendingDeliveryCount,
  subscribeDeliveryOrders,
  getEditingDeliveryOrder,
  setEditingDeliveryOrder,
  DeliveryOrder as DeliveryOrderType,
} from "@/store/deliveryOrders";
import { DeliveryCheckoutParams } from "@/components/PaymentModal";
import { getPosViewMode, setPosViewMode, subscribePosViewMode, loadPosViewMode } from "@/store/posLayout";
import type { PosViewMode } from "@/store/posLayout";
import { CompactGridTile, ListRow, SlimListRow, ViewModeBar } from "@/components/PosProductCards";

interface StoreProduct {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  unit: string;
  image?: string;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  unit: string;
  weightBased: boolean;
}

const CATEGORIES = [
  "All", "Food & Bev", "Electronics", "Clothing",
  "Home & Living", "Books", "Sports", "Beauty", "Accessories", "Stationery",
];

const TAB_ROUTES: Record<string, string> = {
  index:     "/(tabs)/",
  pos:       "/(tabs)/pos",
  products:  "/(tabs)/products",
  purchases: "/(tabs)/purchases",
  profile:   "/(tabs)/profile",
  delivery:  "/delivery",
};

const COLLAPSED_H = 80;
const EXPANDED_H  = 390;

function ProductCard({
  item,
  cartItem,
  onPress,
}: {
  item: StoreProduct;
  cartItem?: CartItem;
  onPress: () => void;
}) {
  const colors     = useColors();
  const inCart     = !!cartItem;
  const isLow      = item.stock > 0 && item.stock <= 5;
  const isOut      = item.stock === 0;
  const catColor   = CATEGORY_COLORS[item.category] ?? CATEGORY_COLORS.default;
  const catIcon    = CATEGORY_ICONS[item.category]  ?? CATEGORY_ICONS.default;
  const weightItem = isWeightBased(item.unit);

  const qtyLabel = cartItem
    ? (weightItem ? formatQty(cartItem.qty, item.unit) : `×${cartItem.qty}`)
    : null;

  return (
    <TouchableOpacity
      style={[
        styles.productCard,
        {
          backgroundColor: colors.card,
          borderColor: inCart ? colors.primary : isLow ? "#F59E0B80" : isOut ? "#EF444460" : colors.border,
          borderWidth: inCart ? 2 : isLow || isOut ? 1.5 : 1,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.82}
    >
      {/* Image section — dominant top area */}
      <View style={[styles.cardImageWrap, { backgroundColor: catColor + "14" }]}>
        {item.image ? (
          <Image
            source={{ uri: item.image }}
            style={styles.cardImage}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View style={[styles.cardImageFallback, { backgroundColor: catColor + "18" }]}>
            <Feather name={catIcon as any} size={26} color={catColor} />
          </View>
        )}

        {/* In-cart overlay */}
        {inCart && <View style={[styles.cartOverlay, { backgroundColor: colors.primary + "55" }]} />}

        {/* In-cart checkmark */}
        {inCart && (
          <View style={[styles.cartCheck, { backgroundColor: colors.primary }]}>
            <Feather name="check" size={10} color="#fff" />
          </View>
        )}

        {/* Quantity badge */}
        {inCart && qtyLabel && (
          <View style={[styles.qtyBadge, { backgroundColor: colors.primary }]}>
            <Text style={[styles.qtyBadgeText, { fontFamily: "Inter_700Bold" }]} numberOfLines={1}>
              {qtyLabel}
            </Text>
          </View>
        )}

        {/* Low-stock / out-of-stock dot */}
        {(isLow || isOut) && !inCart && (
          <View style={[styles.stockDot, { backgroundColor: isOut ? "#EF4444" : "#F59E0B" }]} />
        )}

        {/* Weight unit tag */}
        {weightItem && (
          <View style={[styles.weightTag, { backgroundColor: "rgba(0,0,0,0.50)" }]}>
            <Text style={[styles.weightTagText, { fontFamily: "Inter_600SemiBold", color: "#fff" }]}>
              {item.unit}
            </Text>
          </View>
        )}
      </View>

      {/* Name + price below image */}
      <View style={styles.cardInfo}>
        <Text
          style={[styles.cardName, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}
          numberOfLines={1}
        >
          {item.name}
        </Text>
        <Text
          style={[styles.cardPrice, { color: inCart ? colors.primary : catColor, fontFamily: "Inter_700Bold" }]}
        >
          ₹{item.price}{weightItem ? `/${item.unit}` : ""}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function WeightInputModal({
  visible, product, existing,
  onClose, onConfirm,
}: {
  visible: boolean;
  product: StoreProduct | null;
  existing: number;
  onClose: () => void;
  onConfirm: (qty: number) => void;
}) {
  const colors   = useColors();
  const [input,  setInput]  = useState("");
  const [error,  setError]  = useState("");
  const catColor = product ? (CATEGORY_COLORS[product.category] ?? CATEGORY_COLORS.default) : "#4F46E5";

  useEffect(() => {
    if (visible) {
      setInput(existing > 0 ? String(existing) : "");
      setError("");
    }
  }, [visible, existing]);

  if (!product) return null;

  const presets     = weightPresets(product.unit);
  const step        = weightStep(product.unit);
  const parsedInput = parseFloat(input) || 0;

  const handleConfirm = () => {
    const val = parseFloat(input);
    if (!val || val <= 0) { setError(`Enter a valid ${product.unit} value`); return; }
    if (val > product.stock) { setError(`Only ${product.stock} ${product.unit} in stock`); return; }
    onConfirm(val);
  };

  const adjustInput = (delta: number) => {
    const current = parseFloat(input) || 0;
    const next    = Math.max(0, parseFloat((current + delta).toFixed(4)));
    setInput(next > 0 ? String(next) : "");
    setError("");
  };

  const lineTotal = parsedInput * product.price;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.weightSheet, { backgroundColor: colors.card }]}>
          <View style={styles.sheetHandle} />

          <View style={styles.weightHeader}>
            <View style={[styles.weightProductIcon, { backgroundColor: catColor + "18" }]}>
              <Feather name={(CATEGORY_ICONS[product.category] ?? "box") as any} size={20} color={catColor} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.weightProductName, { color: colors.foreground, fontFamily: "Inter_700Bold" }]} numberOfLines={1}>
                {product.name}
              </Text>
              <Text style={[styles.weightProductPrice, { color: catColor, fontFamily: "Inter_600SemiBold" }]}>
                ₹{product.price}/{product.unit} · Stock: {product.stock} {product.unit}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={20} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.weightInputLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
            ENTER QUANTITY ({product.unit.toUpperCase()})
          </Text>

          <View style={styles.weightInputRow}>
            <TouchableOpacity
              style={[styles.weightStepBtn, { borderColor: colors.border, backgroundColor: colors.secondary }]}
              onPress={() => adjustInput(-step)}
            >
              <Feather name="minus" size={18} color={colors.foreground} />
            </TouchableOpacity>

            <TextInput
              style={[styles.weightInput, { color: colors.foreground, borderColor: error ? colors.destructive : catColor, fontFamily: "Inter_700Bold" }]}
              value={input}
              onChangeText={v => { setInput(v.replace(/[^0-9.]/g, "")); setError(""); }}
              keyboardType="decimal-pad"
              placeholder={`0.00`}
              placeholderTextColor={colors.mutedForeground}
              autoFocus
            />

            <TouchableOpacity
              style={[styles.weightStepBtn, { borderColor: catColor, backgroundColor: catColor + "18" }]}
              onPress={() => adjustInput(step)}
            >
              <Feather name="plus" size={18} color={catColor} />
            </TouchableOpacity>
          </View>

          {error ? (
            <Text style={[styles.weightError, { color: colors.destructive, fontFamily: "Inter_400Regular" }]}>{error}</Text>
          ) : null}

          <View style={styles.presetsRow}>
            {presets.map(p => (
              <TouchableOpacity
                key={p}
                style={[styles.presetBtn, { borderColor: parseFloat(input) === p ? catColor : colors.border, backgroundColor: parseFloat(input) === p ? catColor + "18" : colors.secondary }]}
                onPress={() => { setInput(String(p)); setError(""); }}
              >
                <Text style={[styles.presetText, { color: parseFloat(input) === p ? catColor : colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>
                  {p} {product.unit}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {parsedInput > 0 && (
            <View style={[styles.lineTotalRow, { backgroundColor: catColor + "10", borderColor: catColor + "30" }]}>
              <Text style={[styles.lineTotalLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                {parsedInput} {product.unit} × ₹{product.price}/{product.unit}
              </Text>
              <Text style={[styles.lineTotalValue, { color: catColor, fontFamily: "Inter_700Bold" }]}>
                = ₹{lineTotal.toFixed(2)}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.weightConfirmBtn, { backgroundColor: parsedInput > 0 ? catColor : colors.border }]}
            onPress={handleConfirm}
          >
            <Feather name="check" size={17} color="#fff" />
            <Text style={[styles.weightConfirmText, { fontFamily: "Inter_700Bold" }]}>
              {existing > 0 ? "Update" : "Add to Cart"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default function POSScreen() {
  const colors    = useColors();
  const layout    = useLayout();
  const insets    = useSafeAreaInsets();
  const topPad    = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 0  : insets.bottom;
  const TAB_BAR_H = Platform.OS === "web" ? (layout.isWide ? 0 : 84) : 49;
  const cartBottom = TAB_BAR_H + bottomPad;

  const [allProducts,    setAllProducts]    = useState<StoreProduct[]>(() => getProducts());
  const [cart,           setCart]           = useState<CartItem[]>([]);
  const [search,         setSearch]         = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [cartExpanded,   setCartExpanded]   = useState(false);
  const [payVisible,     setPayVisible]     = useState(false);
  const [orderPlaced,    setOrderPlaced]    = useState(false);
  const [lastMethod,     setLastMethod]     = useState<PaymentMethod>("cash");
  const [lastResult,     setLastResult]     = useState<PaymentResult | null>(null);
  const [sidebarOpen,    setSidebarOpen]    = useState(false);
  const [weightModal,    setWeightModal]    = useState<StoreProduct | null>(null);
  const [holdModalVisible,  setHoldModalVisible]  = useState(false);
  const [heldPanelVisible,  setHeldPanelVisible]  = useState(false);
  const [heldCount,         setHeldCount]         = useState(() => heldOrderCount());
  const [deliveryCount,     setDeliveryCount]     = useState(() => pendingDeliveryCount());
  const [editingDelivery,   setEditingDelivery]   = useState<DeliveryOrderType | null>(null);
  const [deliverySaved,     setDeliverySaved]     = useState(false);
  const [viewMode,          setViewMode]          = useState<PosViewMode>(() => getPosViewMode());

  useFocusEffect(useCallback(() => {
    setAllProducts(getProducts());
    setHeldCount(heldOrderCount());
    setDeliveryCount(pendingDeliveryCount());
    const editing = getEditingDeliveryOrder();
    if (editing) {
      setEditingDelivery(editing);
      setCart(editing.items as any);
      setEditingDeliveryOrder(null);
    }
    loadPosViewMode().then(() => setViewMode(getPosViewMode()));
    const unsubP = subscribeProducts(() => setAllProducts(getProducts()));
    const unsubH = subscribeHeldOrders(() => setHeldCount(heldOrderCount()));
    const unsubD = subscribeDeliveryOrders(() => setDeliveryCount(pendingDeliveryCount()));
    const unsubV = subscribePosViewMode(() => setViewMode(getPosViewMode()));
    return () => { unsubP(); unsubH(); unsubD(); unsubV(); };
  }, []));

  const panelH     = useRef(new Animated.Value(0)).current;
  const panelOpac  = useRef(new Animated.Value(0)).current;
  const chevronRot = useRef(new Animated.Value(0)).current;
  const hasCart    = cart.length > 0;

  useEffect(() => {
    if (hasCart) {
      Animated.parallel([
        Animated.spring(panelH,    { toValue: COLLAPSED_H, tension: 60, friction: 10, useNativeDriver: false }),
        Animated.timing(panelOpac, { toValue: 1, duration: 200, useNativeDriver: false }),
      ]).start();
    } else {
      setCartExpanded(false);
      chevronRot.setValue(0);
      Animated.parallel([
        Animated.timing(panelH,    { toValue: 0,   duration: 180, useNativeDriver: false }),
        Animated.timing(panelOpac, { toValue: 0,   duration: 160, useNativeDriver: false }),
      ]).start();
    }
  }, [hasCart]);

  const toggleExpand = () => {
    const next = !cartExpanded;
    setCartExpanded(next);
    Animated.parallel([
      Animated.spring(panelH, { toValue: next ? EXPANDED_H : COLLAPSED_H, tension: 55, friction: 11, useNativeDriver: false }),
      Animated.timing(chevronRot, { toValue: next ? 1 : 0, duration: 220, useNativeDriver: false }),
    ]).start();
  };

  const chevronDeg = chevronRot.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] });

  const filtered = allProducts.filter((p) => {
    const q         = search.toLowerCase();
    const matchSearch = p.name.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q);
    const matchCat  = activeCategory === "All" || p.category === activeCategory;
    return matchSearch && matchCat;
  });

  const handleProductPress = (product: StoreProduct) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isWeightBased(product.unit)) {
      setWeightModal(product);
    } else {
      setCart(prev => {
        const ex = prev.find(c => c.id === product.id);
        if (ex) return prev.map(c => c.id === product.id ? { ...c, qty: c.qty + 1 } : c);
        return [...prev, { id: product.id, name: product.name, price: product.price, qty: 1, unit: product.unit, weightBased: false }];
      });
    }
  };

  const handleWeightConfirm = (qty: number) => {
    if (!weightModal) return;
    setCart(prev => {
      const ex = prev.find(c => c.id === weightModal.id);
      if (ex) return prev.map(c => c.id === weightModal.id ? { ...c, qty } : c);
      return [...prev, { id: weightModal.id, name: weightModal.name, price: weightModal.price, qty, unit: weightModal.unit, weightBased: true }];
    });
    setWeightModal(null);
  };

  const updatePcsQty = (id: string, delta: number) => {
    setCart(prev => prev.map(c => c.id === id ? { ...c, qty: c.qty + delta } : c).filter(c => c.qty > 0));
  };

  const updateWeightQty = (id: string, rawVal: string) => {
    const val = parseFloat(rawVal);
    if (!isNaN(val) && val > 0) {
      setCart(prev => prev.map(c => c.id === id ? { ...c, qty: val } : c));
    } else if (rawVal === "" || rawVal === "0") {
      setCart(prev => prev.map(c => c.id === id ? { ...c, qty: 0 } : c));
    }
  };

  const removeItem = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCart(prev => prev.filter(c => c.id !== id));
  };

  const subtotal  = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const tax       = Math.round(subtotal * 0.18);
  const total     = subtotal + tax;
  const itemCount = cart.reduce((s, c) => s + (c.weightBased ? 1 : c.qty), 0);

  const handleDeliveryCheckout = (params: DeliveryCheckoutParams) => {
    setPayVisible(false);
    createDeliveryOrder({
      customer: params.customer,
      items: cart.map(c => ({ id: c.id, name: c.name, price: c.price, qty: c.qty, unit: c.unit, weightBased: c.weightBased })),
      subtotal,
      gst: tax,
      total,
      amountReceived: params.amountReceived,
    });
    setEditingDelivery(null);
    setCart([]);
    setDeliverySaved(true);
    setTimeout(() => setDeliverySaved(false), 2500);
  };

  const handleHoldConfirm = (orderName: string, customerName: string, customerPhone: string) => {
    if (cart.length === 0) return;
    saveHoldOrder(cart, subtotal, total, orderName, customerName, customerPhone);
    setCart([]);
    setCartExpanded(false);
    setHoldModalVisible(false);
  };

  const handleResume = (order: HeldOrder) => {
    setCart(order.items as any);
    setHeldPanelVisible(false);
  };

  const handlePaySuccess = (result: PaymentResult) => {
    setLastMethod(result.method);
    setLastResult(result);
    setPayVisible(false);
    setOrderPlaced(true);
    setCartExpanded(false);
    panelH.setValue(COLLAPSED_H);
    chevronRot.setValue(0);

    const today = new Date().toISOString().split("T")[0];
    const modeMap = { cash: "Cash" as const, upi: "UPI" as const, card: "Card" as const };
    addInvoice({
      invoiceNo:    `IPOS-${Date.now()}`,
      customerId:   result.customerId   ?? "",
      customerName: result.customerName ?? "Walk-in Customer",
      date:  today,
      items: cart.map(c => ({ name: c.name, qty: c.qty, unit: c.unit, price: c.price, total: c.price * c.qty })),
      subtotal,
      gst:      tax,
      gstRate:  18,
      total,
      paid:        result.dueAmount === 0,
      paymentMode: result.dueAmount > 0 ? "Credit" : modeMap[result.method],
      shopId:   "SH1",
      returned: false,
      amountPaid:  result.totalReceived,
      dueAmount:   result.dueAmount   > 0 ? result.dueAmount   : undefined,
      walletAdded: result.walletAdded > 0 ? result.walletAdded : undefined,
      walletUsed:  result.walletUsed  > 0 ? result.walletUsed  : undefined,
    });

    if (result.customerId) {
      if (result.dueAmount > 0) {
        addCreditTransaction({ customerId: result.customerId, type: "sale",       amount: result.dueAmount,   note: `Udhaar from sale ₹${total.toLocaleString()}`, date: today });
      }
      if (result.walletAdded > 0) {
        addCreditTransaction({ customerId: result.customerId, type: "wallet_in",  amount: result.walletAdded, note: `Wallet top-up from sale ₹${total.toLocaleString()}`,   date: today });
      }
      if (result.walletUsed > 0) {
        addCreditTransaction({ customerId: result.customerId, type: "wallet_out", amount: result.walletUsed,  note: `Wallet applied to sale ₹${total.toLocaleString()}`,    date: today });
      }
    }

    setTimeout(() => { setOrderPlaced(false); setCart([]); }, 2800);
  };

  const gridCols = viewMode === "grid4" ? (layout.isWide ? 5 : 4) : (layout.isWide ? 4 : 3);
  const handleModeChange = (m: PosViewMode) => { setViewMode(m); setPosViewMode(m); };
  const renderProducts = () => {
    if (filtered.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Feather name="search" size={32} color={colors.mutedForeground} />
          <Text style={[styles.emptyText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>No products found</Text>
        </View>
      );
    }
    if (viewMode === "list") {
      return filtered.map(item => (
        <ListRow key={item.id} item={item} cartItem={cart.find(c => c.id === item.id)} onPress={() => handleProductPress(item)} />
      ));
    }
    if (viewMode === "listslim") {
      return filtered.map(item => (
        <SlimListRow key={item.id} item={item} cartItem={cart.find(c => c.id === item.id)} onPress={() => handleProductPress(item)} />
      ));
    }
    const cols = gridCols;
    const rows: StoreProduct[][] = [];
    for (let i = 0; i < filtered.length; i += cols) rows.push(filtered.slice(i, i + cols));
    return rows.map((row, ri) => (
      <View key={ri} style={[styles.gridRow, viewMode === "grid4" && { gap: 6 }]}>
        {row.map(item =>
          viewMode === "gridflat"
            ? <CompactGridTile key={item.id} item={item} cartItem={cart.find(c => c.id === item.id)} onPress={() => handleProductPress(item)} />
            : <ProductCard     key={item.id} item={item} cartItem={cart.find(c => c.id === item.id)} onPress={() => handleProductPress(item)} />
        )}
        {row.length < cols && Array(cols - row.length).fill(null).map((_, i) => <View key={`ph_${i}`} style={{ flex: 1 }} />)}
      </View>
    ));
  };

  if (orderPlaced) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <View style={[styles.successScreen, { paddingTop: topPad }]}>
          <View style={[styles.successCircle, { backgroundColor: colors.success + "1E" }]}>
            <Feather name="check-circle" size={64} color={colors.success} />
          </View>
          <Text style={[styles.successTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Sale Complete!</Text>
          <Text style={[styles.successAmt,   { color: colors.primary,    fontFamily: "Inter_700Bold" }]}>₹{total.toLocaleString()}</Text>
          <View style={[styles.methodBadge,  { backgroundColor: colors.secondary }]}>
            <Feather
              name={lastMethod === "cash" ? "dollar-sign" : lastMethod === "upi" ? "smartphone" : "credit-card"}
              size={13} color={colors.primary}
            />
            <Text style={[styles.methodText, { color: colors.primary, fontFamily: "Inter_500Medium" }]}>
              {lastMethod === "cash" ? "Cash" : lastMethod === "upi" ? "UPI" : "Card"}
            </Text>
          </View>
          {lastResult && lastResult.dueAmount > 0 && (
            <View style={[styles.methodBadge, { backgroundColor: "#EF444415", marginTop: 4 }]}>
              <Feather name="alert-circle" size={13} color="#EF4444" />
              <Text style={[styles.methodText, { color: "#EF4444", fontFamily: "Inter_600SemiBold" }]}>
                ₹{lastResult.dueAmount.toLocaleString()} due from {lastResult.customerName}
              </Text>
            </View>
          )}
          {lastResult && lastResult.walletAdded > 0 && (
            <View style={[styles.methodBadge, { backgroundColor: "#10B98115", marginTop: 4 }]}>
              <Feather name="pocket" size={13} color="#10B981" />
              <Text style={[styles.methodText, { color: "#10B981", fontFamily: "Inter_600SemiBold" }]}>
                ₹{lastResult.walletAdded.toLocaleString()} added to {lastResult.customerName}'s wallet
              </Text>
            </View>
          )}
          <Text style={[styles.successSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            Invoice created · Inventory updated
          </Text>
          <TouchableOpacity style={[styles.newSaleBtn, { backgroundColor: colors.primary }]} onPress={() => setOrderPlaced(false)}>
            <Feather name="plus" size={18} color="#fff" />
            <Text style={[styles.newSaleText, { fontFamily: "Inter_700Bold" }]}>New Sale</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const DK_CAT_ICONS: Record<string, string> = {
    "All": "grid", "Food & Bev": "coffee", "Electronics": "zap",
    "Clothing": "scissors", "Home & Living": "home", "Books": "book-open",
    "Sports": "activity", "Beauty": "star", "Accessories": "watch", "Stationery": "pen-tool",
  };

  if (layout.isWide) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background, flexDirection: "row" }]}>
        <PaymentModal visible={payVisible} total={total} onClose={() => setPayVisible(false)} onSuccess={handlePaySuccess} onDelivery={handleDeliveryCheckout} isEditMode={!!editingDelivery} />
        <WeightInputModal visible={!!weightModal} product={weightModal} existing={cart.find(c => c.id === weightModal?.id)?.qty ?? 0} onClose={() => setWeightModal(null)} onConfirm={handleWeightConfirm} />
        <HoldOrderModal visible={holdModalVisible} items={cart} total={total} defaultOrderName={getNextOrderName()} onConfirm={handleHoldConfirm} onCancel={() => setHoldModalVisible(false)} />
        <HeldOrdersPanel visible={heldPanelVisible} hasActiveCart={cart.length > 0} onResume={handleResume} onClose={() => setHeldPanelVisible(false)} />

        {/* ── COL 1: Category Sidebar ── */}
        <View style={dk.catSidebar}>
          {/* Brand */}
          <View style={[dk.brand, { paddingTop: topPad + 6 }]}>
            <View style={dk.brandLogoWrap}>
              <Feather name="shopping-bag" size={18} color="#fff" />
            </View>
            <View>
              <Text style={[dk.brandName, { fontFamily: "Inter_700Bold" }]}>IPOS</Text>
              <Text style={[dk.brandSub, { fontFamily: "Inter_400Regular" }]}>Point of Sale</Text>
            </View>
          </View>

          {/* Edit mode banner in sidebar */}
          {editingDelivery && (
            <View style={dk.sideEditBanner}>
              <Feather name="edit-2" size={11} color="#FCD34D" />
              <Text style={[dk.sideEditText, { fontFamily: "Inter_600SemiBold" }]} numberOfLines={2}>
                Editing {editingDelivery.orderNo}
              </Text>
              <TouchableOpacity onPress={() => { setEditingDelivery(null); setCart([]); }}>
                <Feather name="x" size={13} color="rgba(255,255,255,0.7)" />
              </TouchableOpacity>
            </View>
          )}
          {deliverySaved && (
            <View style={[dk.sideEditBanner, { backgroundColor: "rgba(16,185,129,0.25)" }]}>
              <Feather name="check-circle" size={11} color="#6EE7B7" />
              <Text style={[dk.sideEditText, { fontFamily: "Inter_600SemiBold" }]} numberOfLines={2}>Order saved!</Text>
            </View>
          )}

          {/* Category section label */}
          <Text style={[dk.catSectionLabel, { fontFamily: "Inter_600SemiBold" }]}>CATEGORIES</Text>

          {/* Category list */}
          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 8 }}>
            {CATEGORIES.map(cat => {
              const isActive = activeCategory === cat;
              const icon = DK_CAT_ICONS[cat] ?? "tag";
              const catColor = isActive ? colors.primary : "rgba(255,255,255,0.55)";
              return (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setActiveCategory(cat)}
                  style={[dk.catItem, isActive && dk.catItemActive]}
                  activeOpacity={0.75}
                >
                  <View style={[dk.catItemIcon, { backgroundColor: isActive ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.07)" }]}>
                    <Feather name={icon as any} size={14} color={isActive ? "#fff" : "rgba(255,255,255,0.65)"} />
                  </View>
                  <Text style={[dk.catItemText, { fontFamily: isActive ? "Inter_600SemiBold" : "Inter_400Regular", color: isActive ? "#fff" : "rgba(255,255,255,0.7)" }]} numberOfLines={1}>
                    {cat}
                  </Text>
                  {isActive && <View style={dk.catActiveBar} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Bottom action buttons */}
          <View style={dk.sideBottom}>
            <TouchableOpacity
              onPress={() => router.push("/delivery" as any)}
              style={[dk.sideAction, deliveryCount > 0 && dk.sideActionActive]}
              activeOpacity={0.8}
            >
              <Feather name="truck" size={14} color={deliveryCount > 0 ? "#fff" : "rgba(255,255,255,0.55)"} />
              <Text style={[dk.sideActionText, { fontFamily: "Inter_500Medium", color: deliveryCount > 0 ? "#fff" : "rgba(255,255,255,0.6)" }]}>
                {deliveryCount > 0 ? `Delivery (${deliveryCount})` : "Delivery"}
              </Text>
              {deliveryCount > 0 && (
                <View style={dk.sideBadge}><Text style={[dk.sideBadgeText, { fontFamily: "Inter_700Bold" }]}>{deliveryCount}</Text></View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setHeldPanelVisible(true)}
              style={[dk.sideAction, heldCount > 0 && dk.sideActionActive]}
              activeOpacity={0.8}
            >
              <Feather name="pause-circle" size={14} color={heldCount > 0 ? "#fff" : "rgba(255,255,255,0.55)"} />
              <Text style={[dk.sideActionText, { fontFamily: "Inter_500Medium", color: heldCount > 0 ? "#fff" : "rgba(255,255,255,0.6)" }]}>
                {heldCount > 0 ? `Held (${heldCount})` : "Held Orders"}
              </Text>
              {heldCount > 0 && (
                <View style={[dk.sideBadge, { backgroundColor: "#F59E0B" }]}><Text style={[dk.sideBadgeText, { fontFamily: "Inter_700Bold" }]}>{heldCount}</Text></View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* ── COL 2: Product Browser ── */}
        <View style={dk.productCol}>
          {/* Top toolbar */}
          <View style={[dk.toolbar, { paddingTop: topPad + 10, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
            <View style={dk.toolbarLeft}>
              <Text style={[dk.toolbarTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                {editingDelivery ? `Editing ${editingDelivery.orderNo}` : "Products"}
              </Text>
              {activeCategory !== "All" && (
                <View style={[dk.catChip, { backgroundColor: colors.primary + "18", borderColor: colors.primary + "40" }]}>
                  <Text style={[dk.catChipText, { color: colors.primary, fontFamily: "Inter_600SemiBold" }]}>{activeCategory}</Text>
                  <TouchableOpacity onPress={() => setActiveCategory("All")}>
                    <Feather name="x" size={11} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
            <View style={[dk.searchWrap, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Feather name="search" size={14} color={colors.mutedForeground} />
              <TextInput
                style={[dk.searchIn, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
                placeholder="Search or scan barcode…"
                placeholderTextColor={colors.mutedForeground}
                value={search}
                onChangeText={setSearch}
              />
              {search.length > 0
                ? <TouchableOpacity onPress={() => setSearch("")}><Feather name="x" size={13} color={colors.mutedForeground} /></TouchableOpacity>
                : <Feather name="camera" size={14} color={colors.mutedForeground} />
              }
            </View>
            <ViewModeBar mode={viewMode} onChange={handleModeChange} />
          </View>

          {/* Weight legend */}
          <View style={[dk.legendBar, { backgroundColor: "#F59E0B08", borderBottomColor: "#F59E0B20" }]}>
            <Feather name="sliders" size={11} color="#B45309" />
            <Text style={[dk.legendBarText, { color: "#B45309", fontFamily: "Inter_400Regular" }]}>
              Items with <Text style={{ fontFamily: "Inter_700Bold" }}>kg / g / litre / ml</Text> — tap to enter weight quantity
            </Text>
            <Text style={[dk.productCount, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              {filtered.length} item{filtered.length !== 1 ? "s" : ""}
            </Text>
          </View>

          {/* Product grid */}
          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={[styles.gridContainer, { paddingBottom: 24 }]}>
            {renderProducts()}
          </ScrollView>
        </View>

        {/* ── COL 3: Cart / Order Panel ── */}
        <View style={[dk.cartCol, { borderLeftColor: colors.border, backgroundColor: colors.card }]}>
          {/* Cart header */}
          <View style={[dk.cartHeader, { paddingTop: topPad + 10, borderBottomColor: colors.border }]}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <View style={[dk.cartIconBig, { backgroundColor: colors.primary }]}>
                <Feather name="shopping-cart" size={17} color="#fff" />
                {hasCart && (
                  <View style={dk.cartCountBubble}>
                    <Text style={[dk.cartCountText, { fontFamily: "Inter_700Bold" }]}>{cart.length}</Text>
                  </View>
                )}
              </View>
              <View>
                <Text style={[dk.cartTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Current Order</Text>
                <Text style={[dk.cartSubtitle, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  {hasCart ? `${cart.length} line item${cart.length !== 1 ? "s" : ""} · ${itemCount} unit${itemCount !== 1 ? "s" : ""}` : "No items yet"}
                </Text>
              </View>
            </View>
            {hasCart && (
              <TouchableOpacity onPress={() => setCart([])} style={dk.clearBtn}>
                <Feather name="trash-2" size={13} color="#EF4444" />
                <Text style={[dk.clearBtnText, { fontFamily: "Inter_600SemiBold" }]}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>

          {hasCart ? (
            <>
              {/* Cart items list */}
              <ScrollView style={{ flex: 1, paddingHorizontal: 14 }} showsVerticalScrollIndicator={false} nestedScrollEnabled>
                {cart.map((item, idx) => (
                  <View key={item.id} style={[dk.cartRow, idx < cart.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
                    <View style={{ flex: 1 }}>
                      <Text style={[dk.cartRowName, { color: colors.foreground, fontFamily: "Inter_500Medium" }]} numberOfLines={1}>{item.name}</Text>
                      <Text style={[dk.cartRowUnit, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>₹{item.price}/{item.unit}</Text>
                    </View>
                    {item.weightBased ? (
                      <TouchableOpacity
                        style={[dk.weightChip, { borderColor: "#4F46E5", backgroundColor: "#4F46E510" }]}
                        onPress={() => { const prod = allProducts.find(p => p.id === item.id); if (prod) setWeightModal(prod); }}
                      >
                        <Feather name="sliders" size={11} color="#4F46E5" />
                        <Text style={[dk.weightChipText, { color: "#4F46E5", fontFamily: "Inter_700Bold" }]}>{formatQty(item.qty, item.unit)}</Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={dk.qtyCtrl}>
                        <TouchableOpacity onPress={() => updatePcsQty(item.id, -1)} style={[dk.qtyBtn, { borderColor: colors.border }]}>
                          <Feather name="minus" size={12} color={colors.foreground} />
                        </TouchableOpacity>
                        <Text style={[dk.qtyNum, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>{item.qty}</Text>
                        <TouchableOpacity onPress={() => updatePcsQty(item.id, 1)} style={[dk.qtyBtn, { borderColor: colors.primary, backgroundColor: colors.primary }]}>
                          <Feather name="plus" size={12} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    )}
                    <Text style={[dk.cartRowAmt, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                      ₹{(item.price * item.qty).toFixed(item.weightBased ? 2 : 0)}
                    </Text>
                    <TouchableOpacity onPress={() => removeItem(item.id)} style={{ padding: 4 }}>
                      <Feather name="trash-2" size={14} color={colors.destructive} />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>

              {/* Order summary */}
              <View style={[dk.orderSummary, { borderTopColor: colors.border, backgroundColor: colors.secondary }]}>
                <View style={dk.summRow}>
                  <Text style={[dk.summLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Subtotal</Text>
                  <Text style={[dk.summVal, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>₹{subtotal.toFixed(2)}</Text>
                </View>
                <View style={dk.summRow}>
                  <Text style={[dk.summLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>GST (18%)</Text>
                  <Text style={[dk.summVal, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>+₹{tax.toLocaleString()}</Text>
                </View>
                <View style={[dk.summRow, dk.totalRow, { borderTopColor: colors.border }]}>
                  <Text style={[dk.totalLabel2, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Total</Text>
                  <Text style={[dk.totalAmt, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>₹{total.toLocaleString()}</Text>
                </View>
              </View>

              {/* Action buttons */}
              <View style={dk.cartActions}>
                <TouchableOpacity
                  style={[dk.holdBtn, { borderColor: "#F59E0B50", backgroundColor: "#F59E0B0D" }]}
                  onPress={() => setHoldModalVisible(true)}
                  activeOpacity={0.78}
                >
                  <Feather name="pause-circle" size={15} color="#D97706" />
                  <Text style={[dk.holdBtnText, { color: "#D97706", fontFamily: "Inter_600SemiBold" }]}>Hold Order</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[dk.payBigBtn, { backgroundColor: editingDelivery ? "#4F46E5" : colors.success }]}
                  onPress={() => {
                    if (editingDelivery) {
                      updateDeliveryOrderItems(editingDelivery.id, cart.map(c => ({ id: c.id, name: c.name, price: c.price, qty: c.qty, unit: c.unit, weightBased: c.weightBased })), subtotal, tax, total);
                      setCart([]); setEditingDelivery(null);
                      router.push(`/delivery/${editingDelivery.id}` as any);
                    } else { setPayVisible(true); }
                  }}
                  activeOpacity={0.88}
                >
                  <View style={dk.payBigInner}>
                    <Feather name={editingDelivery ? "save" : "credit-card"} size={18} color="#fff" />
                    <Text style={[dk.payBigLabel, { fontFamily: "Inter_700Bold" }]}>
                      {editingDelivery ? "Save Changes" : "Charge"}
                    </Text>
                  </View>
                  <Text style={[dk.payBigAmt, { fontFamily: "Inter_700Bold" }]}>₹{total.toLocaleString()}</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={dk.emptyCart}>
              <View style={[dk.emptyCartCircle, { backgroundColor: colors.muted }]}>
                <Feather name="shopping-cart" size={36} color={colors.mutedForeground} />
              </View>
              <Text style={[dk.emptyCartTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>Order is empty</Text>
              <Text style={[dk.emptyCartSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                Pick a category on the left and tap a product to add it to this order
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Sidebar
        visible={sidebarOpen}
        activeScreen="pos"
        onClose={() => setSidebarOpen(false)}
        onNavigate={(s) => { const r = TAB_ROUTES[s]; if (r) router.push(r as any); }}
      />
      <PaymentModal
        visible={payVisible}
        total={total}
        onClose={() => { setPayVisible(false); }}
        onSuccess={handlePaySuccess}
        onDelivery={handleDeliveryCheckout}
        isEditMode={!!editingDelivery}
      />

      <WeightInputModal
        visible={!!weightModal}
        product={weightModal}
        existing={cart.find(c => c.id === weightModal?.id)?.qty ?? 0}
        onClose={() => setWeightModal(null)}
        onConfirm={handleWeightConfirm}
      />

      <HoldOrderModal
        visible={holdModalVisible}
        items={cart}
        total={total}
        defaultOrderName={getNextOrderName()}
        onConfirm={handleHoldConfirm}
        onCancel={() => setHoldModalVisible(false)}
      />

      <HeldOrdersPanel
        visible={heldPanelVisible}
        hasActiveCart={cart.length > 0}
        onResume={handleResume}
        onClose={() => setHeldPanelVisible(false)}
      />

      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.primary }]}>
        {!layout.isWide && (
          <TouchableOpacity onPress={() => setSidebarOpen(true)} style={styles.hamburger}>
            <Feather name="menu" size={22} color="#fff" />
          </TouchableOpacity>
        )}
        <Text style={[styles.headerTitle, { fontFamily: "Inter_700Bold" }]}>
          {editingDelivery ? `Edit ${editingDelivery.orderNo}` : "POS"}
        </Text>
        <View style={{ flexDirection: "row", gap: 6 }}>
          <TouchableOpacity
            onPress={() => router.push("/delivery" as any)}
            style={[styles.heldBtn, { backgroundColor: deliveryCount > 0 ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.1)" }]}
          >
            <Feather name="truck" size={14} color={deliveryCount > 0 ? "#fff" : "rgba(255,255,255,0.65)"} />
            <Text style={[styles.heldBtnText, { fontFamily: "Inter_600SemiBold", color: deliveryCount > 0 ? "#fff" : "rgba(255,255,255,0.65)" }]}>
              {deliveryCount > 0 ? `Delivery (${deliveryCount})` : "Delivery"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setHeldPanelVisible(true)}
            style={[styles.heldBtn, { backgroundColor: heldCount > 0 ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.1)" }]}
          >
            <Feather name="pause-circle" size={14} color={heldCount > 0 ? "#fff" : "rgba(255,255,255,0.65)"} />
            <Text style={[styles.heldBtnText, { fontFamily: "Inter_600SemiBold", color: heldCount > 0 ? "#fff" : "rgba(255,255,255,0.65)" }]}>
              {heldCount > 0 ? `Held (${heldCount})` : "Held"}
            </Text>
            {heldCount > 0 && <View style={styles.heldDot} />}
          </TouchableOpacity>
        </View>
      </View>

      {/* Edit delivery mode banner */}
      {editingDelivery && (
        <View style={[styles.editBanner, { backgroundColor: "#4F46E5", }]}>
          <Feather name="edit-2" size={13} color="#fff" />
          <Text style={[styles.editBannerText, { fontFamily: "Inter_600SemiBold" }]}>
            Editing {editingDelivery.orderNo} for {editingDelivery.customer.name}
          </Text>
          <TouchableOpacity onPress={() => { setEditingDelivery(null); setCart([]); }}>
            <Feather name="x" size={15} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
        </View>
      )}

      {/* Delivery saved flash */}
      {deliverySaved && (
        <View style={[styles.editBanner, { backgroundColor: "#10B981" }]}>
          <Feather name="check-circle" size={13} color="#fff" />
          <Text style={[styles.editBannerText, { fontFamily: "Inter_600SemiBold" }]}>
            Delivery order saved! Track it in Delivery Orders.
          </Text>
        </View>
      )}

      {/* Search bar */}
      <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Feather name="search" size={15} color={colors.mutedForeground} />
        <TextInput
          style={[styles.searchInput, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
          placeholder="Search or scan barcode..."
          placeholderTextColor={colors.mutedForeground}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0
          ? <TouchableOpacity onPress={() => setSearch("")}><Feather name="x" size={15} color={colors.mutedForeground} /></TouchableOpacity>
          : <Feather name="camera" size={16} color={colors.mutedForeground} />
        }
      </View>

      {/* View mode selector */}
      <ViewModeBar mode={viewMode} onChange={handleModeChange} />

      {/* Category tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.catTabs}
        style={styles.catTabsWrap}
      >
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <TouchableOpacity
              key={cat}
              onPress={() => setActiveCategory(cat)}
              style={[
                styles.catTab,
                { backgroundColor: isActive ? colors.primary : colors.card, borderColor: isActive ? colors.primary : colors.border },
              ]}
            >
              <Text style={[styles.catTabText, { color: isActive ? "#fff" : colors.mutedForeground, fontFamily: isActive ? "Inter_600SemiBold" : "Inter_400Regular" }]}>
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Weight legend strip */}
      <View style={[styles.legendStrip, { backgroundColor: "#F59E0B10", borderColor: "#F59E0B25" }]}>
        <Feather name="sliders" size={11} color="#B45309" />
        <Text style={[styles.legendText, { color: "#B45309", fontFamily: "Inter_400Regular" }]}>
          Products showing <Text style={{ fontFamily: "Inter_700Bold" }}>kg / g / litre / ml</Text> — tap to enter weight
        </Text>
      </View>

      {/* Product grid */}
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.gridContainer,
          { paddingBottom: hasCart ? cartBottom + EXPANDED_H + 16 : cartBottom + 16 },
        ]}
      >
        {renderProducts()}
      </ScrollView>

      {/* Cart panel */}
      <Animated.View
        style={[
          styles.cartPanel,
          {
            backgroundColor: colors.card,
            height: panelH,
            opacity: panelOpac,
            bottom: cartBottom,
            borderTopColor: colors.border,
          },
        ]}
        pointerEvents={hasCart ? "auto" : "none"}
      >
        {/* Collapsed bar */}
        <TouchableOpacity style={styles.collapsedBar} onPress={toggleExpand} activeOpacity={0.85}>
          <View style={styles.barLeft}>
            <View style={[styles.cartIconBox, { backgroundColor: colors.primary }]}>
              <Feather name="shopping-cart" size={15} color="#fff" />
              <View style={styles.cartBubble}>
                <Text style={[styles.cartBubbleText, { fontFamily: "Inter_700Bold" }]}>{cart.length}</Text>
              </View>
            </View>
            <View>
              <Text style={[styles.barItemCount, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                {cart.length} product{cart.length !== 1 ? "s" : ""}
              </Text>
              <Text style={[styles.barProductCount, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                {cart.filter(c => c.weightBased).length > 0
                  ? `incl. ${cart.filter(c => c.weightBased).length} weighed`
                  : `${itemCount} items`}
              </Text>
            </View>
          </View>

          <View style={styles.barCenter}>
            <Text style={[styles.barTotal, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>
              ₹{total.toLocaleString()}
            </Text>
            <Animated.View style={{ transform: [{ rotate: chevronDeg }] }}>
              <Feather name="chevron-up" size={16} color={colors.mutedForeground} />
            </Animated.View>
          </View>

          <TouchableOpacity
            style={[styles.payBtn, { backgroundColor: editingDelivery ? "#4F46E5" : colors.success }]}
            onPress={() => {
              if (editingDelivery) {
                updateDeliveryOrderItems(
                  editingDelivery.id,
                  cart.map(c => ({ id: c.id, name: c.name, price: c.price, qty: c.qty, unit: c.unit, weightBased: c.weightBased })),
                  subtotal, tax, total
                );
                setCart([]);
                setEditingDelivery(null);
                router.push(`/delivery/${editingDelivery.id}` as any);
              } else {
                setPayVisible(true);
              }
            }}
            activeOpacity={0.85}
          >
            <Text style={[styles.payBtnText, { fontFamily: "Inter_700Bold" }]}>
              {editingDelivery ? "Save" : "Pay"}
            </Text>
            <Feather name={editingDelivery ? "save" : "arrow-right"} size={14} color="#fff" />
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Expanded content */}
        {cartExpanded && (
          <View style={styles.expandedContent}>
            <View style={[styles.expandDivider, { backgroundColor: colors.border }]} />

            <ScrollView style={styles.itemList} showsVerticalScrollIndicator={false} nestedScrollEnabled>
              {cart.map((item, idx) => (
                <View
                  key={item.id}
                  style={[
                    styles.itemRow,
                    idx < cart.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.itemName, { color: colors.foreground, fontFamily: "Inter_500Medium" }]} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={[styles.itemUnit, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                      ₹{item.price}/{item.unit}
                    </Text>
                  </View>

                  {item.weightBased ? (
                    <TouchableOpacity
                      style={[styles.weightEditBtn, { borderColor: "#4F46E5", backgroundColor: "#4F46E510" }]}
                      onPress={() => {
                        const prod = allProducts.find(p => p.id === item.id);
                        if (prod) setWeightModal(prod);
                      }}
                    >
                      <Feather name="sliders" size={11} color="#4F46E5" />
                      <Text style={[styles.weightEditText, { color: "#4F46E5", fontFamily: "Inter_700Bold" }]}>
                        {formatQty(item.qty, item.unit)}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.qtyRow}>
                      <TouchableOpacity
                        onPress={() => updatePcsQty(item.id, -1)}
                        style={[styles.qtyBtn, { borderColor: colors.border }]}
                      >
                        <Feather name="minus" size={12} color={colors.foreground} />
                      </TouchableOpacity>
                      <Text style={[styles.qtyNum, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>{item.qty}</Text>
                      <TouchableOpacity
                        onPress={() => updatePcsQty(item.id, 1)}
                        style={[styles.qtyBtn, { borderColor: colors.primary, backgroundColor: colors.primary }]}
                      >
                        <Feather name="plus" size={12} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  )}

                  <Text style={[styles.itemAmt, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                    ₹{(item.price * item.qty).toFixed(item.weightBased ? 2 : 0)}
                  </Text>
                  <TouchableOpacity onPress={() => removeItem(item.id)} style={styles.deleteBtn}>
                    <Feather name="trash-2" size={14} color={colors.destructive} />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>

            <View style={[styles.summary, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
              <View style={styles.summaryLine}>
                <Text style={[styles.summaryLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Subtotal</Text>
                <Text style={[styles.summaryVal,   { color: colors.foreground,      fontFamily: "Inter_500Medium"   }]}>₹{subtotal.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryLine}>
                <Text style={[styles.summaryLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>GST (18%)</Text>
                <Text style={[styles.summaryVal,   { color: colors.foreground,      fontFamily: "Inter_500Medium"   }]}>₹{tax.toLocaleString()}</Text>
              </View>
              <View style={[styles.summaryLine, styles.totalLine, { borderTopColor: colors.border }]}>
                <Text style={[styles.totalLabel, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Total</Text>
                <Text style={[styles.totalValue, { color: colors.primary,    fontFamily: "Inter_700Bold" }]}>₹{total.toLocaleString()}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.holdOrderBtn, { borderColor: "#F59E0B50", backgroundColor: "#F59E0B0C" }]}
              onPress={() => setHoldModalVisible(true)}
              activeOpacity={0.75}
            >
              <Feather name="pause-circle" size={15} color="#D97706" />
              <Text style={[styles.holdOrderText, { color: "#D97706", fontFamily: "Inter_600SemiBold" }]}>
                Hold Order
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.proceedBtn, { backgroundColor: editingDelivery ? "#4F46E5" : colors.success }]}
              onPress={() => {
                if (editingDelivery) {
                  updateDeliveryOrderItems(
                    editingDelivery.id,
                    cart.map(c => ({ id: c.id, name: c.name, price: c.price, qty: c.qty, unit: c.unit, weightBased: c.weightBased })),
                    subtotal, tax, total
                  );
                  setCart([]);
                  setEditingDelivery(null);
                  router.push(`/delivery/${editingDelivery.id}` as any);
                } else {
                  setPayVisible(true);
                }
              }}
              activeOpacity={0.85}
            >
              <Feather name={editingDelivery ? "save" : "credit-card"} size={17} color="#fff" />
              <Text style={[styles.proceedText, { fontFamily: "Inter_700Bold" }]}>
                {editingDelivery
                  ? `Save Delivery Update · ₹${total.toLocaleString()}`
                  : `Proceed to Pay · ₹${total.toLocaleString()}`
                }
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  header: {
    flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between",
    paddingHorizontal: 16, paddingBottom: 10,
  },
  hamburger: { padding: 2 },
  headerTitle: { color: "#fff", fontSize: 18 },

  searchBar: {
    flexDirection: "row", alignItems: "center", gap: 9,
    marginHorizontal: 12, marginTop: 10, marginBottom: 4,
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9, borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 14 },

  catTabsWrap: { flexGrow: 0, flexShrink: 0 },
  catTabs: { paddingHorizontal: 12, paddingVertical: 6, gap: 7 },
  catTab: { paddingHorizontal: 13, paddingVertical: 5, borderRadius: 16, borderWidth: 1 },
  catTabText: { fontSize: 12 },

  legendStrip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    marginHorizontal: 12, marginBottom: 6, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1,
  },
  legendText: { fontSize: 11, flex: 1 },

  gridContainer: { paddingHorizontal: 10, paddingTop: 4 },
  gridRow: { flexDirection: "row", gap: 8, marginBottom: 8 },

  productCard: {
    flex: 1, borderRadius: 12,
    overflow: "hidden", position: "relative", borderWidth: 1,
  },
  cardImageWrap: {
    height: 108, position: "relative", overflow: "hidden",
  },
  cardImage: { width: "100%", height: "100%" },
  cardImageFallback: {
    width: "100%", height: "100%",
    alignItems: "center", justifyContent: "center",
  },
  cartOverlay: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
  },
  cartCheck: {
    position: "absolute", top: 6, left: 6,
    width: 20, height: 20, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
  },
  qtyBadge: {
    position: "absolute", top: 6, right: 6,
    borderRadius: 8,
    paddingHorizontal: 5, paddingVertical: 2, minWidth: 22, alignItems: "center",
  },
  qtyBadgeText: { color: "#fff", fontSize: 9 },
  stockDot: {
    position: "absolute", top: 7, left: 7,
    width: 8, height: 8, borderRadius: 4,
  },
  weightTag: {
    position: "absolute", bottom: 5, right: 5,
    paddingHorizontal: 5, paddingVertical: 2, borderRadius: 5,
  },
  weightTagText: { fontSize: 9 },
  cardInfo:  { paddingHorizontal: 8, paddingTop: 6, paddingBottom: 8, gap: 2 },
  cardName:  { fontSize: 11, lineHeight: 14 },
  cardPrice: { fontSize: 12 },

  emptyState: { alignItems: "center", justifyContent: "center", gap: 10, paddingTop: 80 },
  emptyText:  { fontSize: 15 },

  cartPanel: {
    position: "absolute", left: 0, right: 0,
    borderTopWidth: 1, overflow: "hidden",
    shadowColor: "#000", shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1, shadowRadius: 8, elevation: 12,
  },
  collapsedBar:  { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 10, gap: 10, height: COLLAPSED_H },
  barLeft:       { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  cartIconBox: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: "center", justifyContent: "center", position: "relative",
  },
  cartBubble: {
    position: "absolute", top: -4, right: -4,
    backgroundColor: "#EF4444", width: 18, height: 18, borderRadius: 9,
    alignItems: "center", justifyContent: "center",
  },
  cartBubbleText: { color: "#fff", fontSize: 10 },
  barItemCount:   { fontSize: 15 },
  barProductCount:{ fontSize: 12 },
  barCenter: { flexDirection: "row", alignItems: "center", gap: 6 },
  barTotal:  { fontSize: 18 },
  payBtn: {
    paddingHorizontal: 18, paddingVertical: 11, borderRadius: 14,
    flexDirection: "row", alignItems: "center", gap: 5,
  },
  payBtnText: { color: "#fff", fontSize: 15 },

  expandedContent: { flex: 1 },
  expandDivider:   { height: 1 },
  itemList:        { flex: 1, paddingHorizontal: 12 },
  itemRow: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingVertical: 9,
  },
  itemName: { fontSize: 13, marginBottom: 2 },
  itemUnit: { fontSize: 11 },
  qtyRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  qtyBtn: {
    width: 26, height: 26, borderRadius: 7,
    alignItems: "center", justifyContent: "center", borderWidth: 1,
  },
  qtyNum:   { fontSize: 14, minWidth: 22, textAlign: "center" },
  weightEditBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1.5,
  },
  weightEditText: { fontSize: 12 },
  itemAmt:   { fontSize: 13, minWidth: 52, textAlign: "right" },
  deleteBtn: { padding: 4 },

  summary: {
    borderRadius: 10, margin: 10, marginTop: 4, padding: 10,
    gap: 6, borderWidth: 1,
  },
  summaryLine:  { flexDirection: "row", justifyContent: "space-between" },
  summaryLabel: { fontSize: 13 },
  summaryVal:   { fontSize: 13 },
  totalLine:    { borderTopWidth: 1, paddingTop: 6, marginTop: 2 },
  totalLabel:   { fontSize: 15 },
  totalValue:   { fontSize: 15 },

  editBanner: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 14, paddingVertical: 9,
  },
  editBannerText: { flex: 1, color: "#fff", fontSize: 12 },

  heldBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 8, paddingVertical: 5, borderRadius: 10,
  },
  heldBtnText: { fontSize: 13 },
  heldDot: {
    width: 7, height: 7, borderRadius: 4,
    backgroundColor: "#F59E0B", marginLeft: 1,
  },

  holdOrderBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 7, marginHorizontal: 10, marginBottom: 6, borderRadius: 11,
    paddingVertical: 10, borderWidth: 1,
  },
  holdOrderText: { fontSize: 14 },

  proceedBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, marginHorizontal: 10, marginBottom: 8, borderRadius: 13, paddingVertical: 12,
  },
  proceedText: { color: "#fff", fontSize: 15 },

  successScreen: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14, padding: 24 },
  successCircle: { width: 110, height: 110, borderRadius: 55, alignItems: "center", justifyContent: "center" },
  successTitle:  { fontSize: 26 },
  successAmt:    { fontSize: 32 },
  methodBadge:   { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  methodText:    { fontSize: 14 },
  successSub:    { fontSize: 13 },
  newSaleBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 28, paddingVertical: 13, borderRadius: 14, marginTop: 8,
  },
  newSaleText: { color: "#fff", fontSize: 16 },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "flex-end" },
  weightSheet: {
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, gap: 14, paddingBottom: 36,
  },
  sheetHandle: {
    width: 40, height: 4, borderRadius: 2, backgroundColor: "#E5E7EB",
    alignSelf: "center", marginBottom: 4,
  },
  weightHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  weightProductIcon: { width: 46, height: 46, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  weightProductName:  { fontSize: 15, marginBottom: 2 },
  weightProductPrice: { fontSize: 12 },

  weightInputLabel: { fontSize: 10, letterSpacing: 0.8 },
  weightInputRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  weightStepBtn: { width: 48, height: 52, borderRadius: 12, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  weightInput: {
    flex: 1, height: 52, borderRadius: 12, borderWidth: 2,
    fontSize: 28, textAlign: "center",
  },
  weightError: { fontSize: 12, textAlign: "center" },

  presetsRow: { flexDirection: "row", gap: 8 },
  presetBtn: { flex: 1, paddingVertical: 9, borderRadius: 10, borderWidth: 1.5, alignItems: "center" },
  presetText: { fontSize: 12 },

  lineTotalRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, borderWidth: 1,
  },
  lineTotalLabel: { fontSize: 12 },
  lineTotalValue: { fontSize: 15 },

  weightConfirmBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, borderRadius: 14, paddingVertical: 14,
  },
  weightConfirmText: { color: "#fff", fontSize: 16 },
});

const dk = StyleSheet.create({
  catSidebar: {
    width: 210,
    backgroundColor: "#3730A3",
    flexDirection: "column",
  },
  brand: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 16, paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.12)",
  },
  brandLogoWrap: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center", justifyContent: "center",
  },
  brandName: { color: "#fff", fontSize: 18 },
  brandSub:  { color: "rgba(255,255,255,0.55)", fontSize: 10, marginTop: 1 },

  sideEditBanner: {
    flexDirection: "row", alignItems: "center", gap: 6,
    margin: 10, marginBottom: 0, padding: 8, borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  sideEditText: { flex: 1, color: "#fff", fontSize: 11 },

  catSectionLabel: {
    color: "rgba(255,255,255,0.4)", fontSize: 9, letterSpacing: 1.2,
    paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6,
  },
  catItem: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 12, paddingVertical: 9, marginHorizontal: 8,
    borderRadius: 10, position: "relative",
  },
  catItemActive: { backgroundColor: "rgba(255,255,255,0.14)" },
  catItemIcon: {
    width: 28, height: 28, borderRadius: 8,
    alignItems: "center", justifyContent: "center",
  },
  catItemText: { fontSize: 13, flex: 1 },
  catActiveBar: {
    position: "absolute", right: 0, top: "25%", bottom: "25%",
    width: 3, borderRadius: 2, backgroundColor: "#fff",
  },

  sideBottom: {
    borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.12)",
    padding: 10, gap: 6,
  },
  sideAction: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 10, paddingVertical: 9, borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  sideActionActive: { backgroundColor: "rgba(255,255,255,0.15)" },
  sideActionText: { flex: 1, fontSize: 12 },
  sideBadge: {
    backgroundColor: "#EF4444", borderRadius: 10,
    minWidth: 18, height: 18, alignItems: "center", justifyContent: "center",
    paddingHorizontal: 4,
  },
  sideBadgeText: { color: "#fff", fontSize: 10 },

  productCol: { flex: 1, flexDirection: "column", overflow: "hidden" },

  toolbar: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingHorizontal: 16, paddingBottom: 10, borderBottomWidth: 1,
  },
  toolbarLeft: { flexDirection: "row", alignItems: "center", gap: 10, flexShrink: 0 },
  toolbarTitle: { fontSize: 16 },
  catChip: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 9, paddingVertical: 4, borderRadius: 20, borderWidth: 1,
  },
  catChipText: { fontSize: 11 },
  searchWrap: {
    flex: 1, flexDirection: "row", alignItems: "center", gap: 8,
    borderRadius: 10, borderWidth: 1, paddingHorizontal: 11, paddingVertical: 8,
  },
  searchIn: { flex: 1, fontSize: 13 },

  legendBar: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 16, paddingVertical: 7,
    borderBottomWidth: 1,
  },
  legendBarText: { flex: 1, fontSize: 11 },
  productCount:  { fontSize: 11 },

  cartCol: {
    width: 390, borderLeftWidth: 1, flexDirection: "column",
  },
  cartHeader: {
    paddingHorizontal: 16, paddingBottom: 12,
    borderBottomWidth: 1, flexDirection: "row",
    alignItems: "center", justifyContent: "space-between",
  },
  cartIconBig: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
    position: "relative",
  },
  cartCountBubble: {
    position: "absolute", top: -4, right: -4,
    backgroundColor: "#EF4444", width: 17, height: 17, borderRadius: 9,
    alignItems: "center", justifyContent: "center",
  },
  cartCountText: { color: "#fff", fontSize: 9 },
  cartTitle:    { fontSize: 16 },
  cartSubtitle: { fontSize: 11, marginTop: 1 },
  clearBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 9,
    backgroundColor: "#EF444413",
  },
  clearBtnText: { color: "#EF4444", fontSize: 12 },

  cartRow: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingVertical: 10,
  },
  cartRowName: { fontSize: 13, marginBottom: 2 },
  cartRowUnit: { fontSize: 11 },
  cartRowAmt:  { fontSize: 14, minWidth: 58, textAlign: "right" },
  weightChip: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 9, paddingVertical: 5, borderRadius: 8, borderWidth: 1.5,
  },
  weightChipText: { fontSize: 12 },
  qtyCtrl: { flexDirection: "row", alignItems: "center", gap: 6 },
  qtyBtn: {
    width: 26, height: 26, borderRadius: 7,
    alignItems: "center", justifyContent: "center", borderWidth: 1,
  },
  qtyNum: { fontSize: 14, minWidth: 22, textAlign: "center" },

  orderSummary: {
    paddingHorizontal: 16, paddingVertical: 14,
    borderTopWidth: 1, gap: 8,
  },
  summRow:    { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  summLabel:  { fontSize: 13 },
  summVal:    { fontSize: 13 },
  totalRow:   { borderTopWidth: 1, paddingTop: 10, marginTop: 2 },
  totalLabel2:{ fontSize: 18 },
  totalAmt:   { fontSize: 26 },

  cartActions: { padding: 14, paddingTop: 10, gap: 10 },
  holdBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 7, borderRadius: 12, paddingVertical: 11, borderWidth: 1,
  },
  holdBtnText: { fontSize: 14 },
  payBigBtn: {
    borderRadius: 14, paddingVertical: 14, paddingHorizontal: 18,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  payBigInner:  { flexDirection: "row", alignItems: "center", gap: 8 },
  payBigLabel:  { color: "#fff", fontSize: 16 },
  payBigAmt:    { color: "#fff", fontSize: 20 },

  emptyCart: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14, padding: 32 },
  emptyCartCircle: { width: 88, height: 88, borderRadius: 44, alignItems: "center", justifyContent: "center" },
  emptyCartTitle:  { fontSize: 18 },
  emptyCartSub: { fontSize: 13, textAlign: "center", lineHeight: 20 },
});
