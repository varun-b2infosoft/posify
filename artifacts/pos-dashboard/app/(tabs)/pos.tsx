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
import { useColors } from "@/hooks/useColors";
import { useLayout } from "@/hooks/useLayout";
import { Sidebar } from "@/components/Sidebar";
import { PaymentModal } from "@/components/PaymentModal";
import {
  getProducts, subscribeProducts,
  isWeightBased, formatQty, weightPresets, weightStep,
  CATEGORY_COLORS, CATEGORY_ICONS,
} from "@/store/products";

type PaymentMethod = "cash" | "upi" | "card";

interface StoreProduct {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  unit: string;
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
  index: "/(tabs)/",
  pos: "/(tabs)/pos",
  products: "/(tabs)/products",
  purchases: "/(tabs)/purchases",
  profile: "/(tabs)/profile",
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
  const colors      = useColors();
  const inCart      = !!cartItem;
  const isLow       = item.stock <= 5;
  const catColor    = CATEGORY_COLORS[item.category] ?? CATEGORY_COLORS.default;
  const catIcon     = CATEGORY_ICONS[item.category]  ?? CATEGORY_ICONS.default;
  const weightItem  = isWeightBased(item.unit);

  const qtyLabel = cartItem
    ? (weightItem ? formatQty(cartItem.qty, item.unit) : String(cartItem.qty))
    : null;

  return (
    <TouchableOpacity
      style={[
        styles.productCard,
        {
          backgroundColor: inCart ? colors.primary : colors.card,
          borderColor: inCart ? colors.primary : isLow ? "#F59E0B60" : colors.border,
          borderWidth: isLow && !inCart ? 1.5 : 1,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.78}
    >
      <View style={[styles.cardIcon, { backgroundColor: inCart ? "rgba(255,255,255,0.2)" : catColor + "18" }]}>
        <Feather name={catIcon as any} size={20} color={inCart ? "#fff" : catColor} />
      </View>

      {isLow && !inCart && (
        <View style={[styles.lowDot, { backgroundColor: "#F59E0B" }]} />
      )}

      {inCart && qtyLabel && (
        <View style={styles.qtyBadge}>
          <Text style={[styles.qtyBadgeText, { fontFamily: "Inter_700Bold" }]} numberOfLines={1}>
            {qtyLabel}
          </Text>
        </View>
      )}

      {weightItem && (
        <View style={[styles.weightTag, { backgroundColor: inCart ? "rgba(255,255,255,0.2)" : catColor + "25" }]}>
          <Feather name="sliders" size={9} color={inCart ? "#fff" : catColor} />
          <Text style={[styles.weightTagText, { color: inCart ? "#fff" : catColor, fontFamily: "Inter_600SemiBold" }]}>
            {item.unit}
          </Text>
        </View>
      )}

      <Text
        style={[styles.cardName, { color: inCart ? "#fff" : colors.foreground, fontFamily: "Inter_600SemiBold" }]}
        numberOfLines={2}
      >
        {item.name}
      </Text>
      <Text
        style={[styles.cardPrice, { color: inCart ? "rgba(255,255,255,0.95)" : catColor, fontFamily: "Inter_700Bold" }]}
      >
        ₹{item.price}{weightItem ? `/${item.unit}` : ""}
      </Text>
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
  const [sidebarOpen,    setSidebarOpen]    = useState(false);
  const [weightModal,    setWeightModal]    = useState<StoreProduct | null>(null);

  useFocusEffect(useCallback(() => {
    setAllProducts(getProducts());
    return subscribeProducts(() => setAllProducts(getProducts()));
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

  const handlePaySuccess = (method: PaymentMethod) => {
    setLastMethod(method);
    setPayVisible(false);
    setOrderPlaced(true);
    setCartExpanded(false);
    panelH.setValue(COLLAPSED_H);
    chevronRot.setValue(0);
    setTimeout(() => { setOrderPlaced(false); setCart([]); }, 2600);
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
          <Text style={[styles.successSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            Receipt printed · Inventory updated
          </Text>
          <TouchableOpacity style={[styles.newSaleBtn, { backgroundColor: colors.primary }]} onPress={() => setOrderPlaced(false)}>
            <Feather name="plus" size={18} color="#fff" />
            <Text style={[styles.newSaleText, { fontFamily: "Inter_700Bold" }]}>New Sale</Text>
          </TouchableOpacity>
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
        onClose={() => setPayVisible(false)}
        onSuccess={handlePaySuccess}
      />

      <WeightInputModal
        visible={!!weightModal}
        product={weightModal}
        existing={cart.find(c => c.id === weightModal?.id)?.qty ?? 0}
        onClose={() => setWeightModal(null)}
        onConfirm={handleWeightConfirm}
      />

      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.primary }]}>
        {!layout.isWide && (
          <TouchableOpacity onPress={() => setSidebarOpen(true)} style={styles.hamburger}>
            <Feather name="menu" size={22} color="#fff" />
          </TouchableOpacity>
        )}
        <Text style={[styles.headerTitle, { fontFamily: "Inter_700Bold" }]}>POS</Text>
        <TouchableOpacity onPress={() => router.push("/(tabs)/" as any)}>
          <Feather name="home" size={20} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>
      </View>

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
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="search" size={32} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              No products found
            </Text>
          </View>
        ) : (
          <>
            {(() => {
              const rows: StoreProduct[][] = [];
              for (let i = 0; i < filtered.length; i += 3) rows.push(filtered.slice(i, i + 3));
              return rows.map((row, ri) => (
                <View key={ri} style={styles.gridRow}>
                  {row.map((item) => (
                    <ProductCard
                      key={item.id}
                      item={item}
                      cartItem={cart.find(c => c.id === item.id)}
                      onPress={() => handleProductPress(item)}
                    />
                  ))}
                  {row.length < 3 && Array(3 - row.length).fill(null).map((_, i) => (
                    <View key={`ph_${i}`} style={{ flex: 1 }} />
                  ))}
                </View>
              ));
            })()}
          </>
        )}
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
            style={[styles.payBtn, { backgroundColor: colors.success }]}
            onPress={() => setPayVisible(true)}
            activeOpacity={0.85}
          >
            <Text style={[styles.payBtnText, { fontFamily: "Inter_700Bold" }]}>Pay</Text>
            <Feather name="arrow-right" size={14} color="#fff" />
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
              style={[styles.proceedBtn, { backgroundColor: colors.success }]}
              onPress={() => setPayVisible(true)}
              activeOpacity={0.85}
            >
              <Feather name="credit-card" size={17} color="#fff" />
              <Text style={[styles.proceedText, { fontFamily: "Inter_700Bold" }]}>
                Proceed to Pay · ₹{total.toLocaleString()}
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
    flex: 1, borderRadius: 12, padding: 10, gap: 5,
    minHeight: 115, position: "relative", borderWidth: 1,
  },
  cardIcon: { width: 36, height: 36, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  lowDot:   { position: "absolute", top: 8, right: 8, width: 7, height: 7, borderRadius: 4, backgroundColor: "#F59E0B" },
  qtyBadge: {
    position: "absolute", top: 6, right: 6,
    backgroundColor: "#10B981", borderRadius: 8,
    paddingHorizontal: 5, paddingVertical: 2, minWidth: 20, alignItems: "center",
  },
  qtyBadgeText: { color: "#fff", fontSize: 9 },
  weightTag: {
    position: "absolute", bottom: 10, right: 7,
    flexDirection: "row", alignItems: "center", gap: 2,
    paddingHorizontal: 5, paddingVertical: 2, borderRadius: 6,
  },
  weightTagText: { fontSize: 9 },
  cardName:  { fontSize: 12, lineHeight: 15 },
  cardPrice: { fontSize: 13 },

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
