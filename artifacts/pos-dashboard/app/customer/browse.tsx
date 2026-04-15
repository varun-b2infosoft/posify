import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { getProducts, Product } from "@/store/products";
import {
  CUSTOMER_PRIMARY,
  CUSTOMER_AMBER,
  getCart,
  getCartCount,
  getCartTotals,
  addToCart,
  updateCartQty,
  placeOrder,
  subscribeCustomerApp,
  CartItem,
  CustomerOrder,
} from "@/store/customerApp";

type PayMode = "UPI" | "Card" | "COD" | "Wallet";

const PAY_OPTIONS: { key: PayMode; icon: string; label: string }[] = [
  { key: "UPI",    icon: "smartphone",  label: "UPI"    },
  { key: "Card",   icon: "credit-card", label: "Card"   },
  { key: "COD",    icon: "dollar-sign", label: "COD"    },
  { key: "Wallet", icon: "pocket",      label: "Wallet" },
];

export default function BrowseScreen() {
  const colors      = useColors();
  const insets      = useSafeAreaInsets();
  const topPad      = Platform.OS === "web" ? 60 : insets.top;
  const botPad      = Platform.OS === "web" ? 0  : insets.bottom;

  const { shopId, shopName } = useLocalSearchParams<{ shopId: string; shopName: string }>();

  const products = getProducts();
  const categories = ["All", ...Array.from(new Set(products.map(p => p.category)))];

  const [selCat, setSelCat]       = useState("All");
  const [cart, setCart]           = useState<CartItem[]>(getCart());
  const [cartCount, setCartCount] = useState(getCartCount());
  const [totals, setTotals]       = useState(getCartTotals());
  const [showCart, setShowCart]   = useState(false);

  // Checkout form
  const [delivType, setDelivType] = useState<"delivery" | "pickup">("delivery");
  const [address, setAddress]     = useState("");
  const [payMode, setPayMode]     = useState<PayMode>("UPI");
  const [useWallet, setUseWallet] = useState(false);
  const [placing, setPlacing]     = useState(false);

  useEffect(() => {
    return subscribeCustomerApp(() => {
      setCart(getCart());
      setCartCount(getCartCount());
      setTotals(getCartTotals());
    });
  }, []);

  const filtered = selCat === "All"
    ? products
    : products.filter(p => p.category === selCat);

  const getQtyInCart = (id: string): number => {
    return cart.find(c => c.id === id)?.qty || 0;
  };

  const handleAddToCart = (product: Product) => {
    addToCart({
      id:       product.id,
      name:     product.name,
      price:    product.price,
      unit:     product.unit,
      category: product.category,
      image:    product.image,
    });
  };

  const handlePlaceOrder = () => {
    if (cartCount === 0) {
      Alert.alert("Empty Cart", "Add some items first!");
      return;
    }
    if (delivType === "delivery" && address.trim().length < 5) {
      Alert.alert("Address Required", "Please enter your delivery address.");
      return;
    }
    setPlacing(true);
    setTimeout(() => {
      const order: CustomerOrder = placeOrder({
        paymentMode:  payMode,
        deliveryType: delivType,
        address:      delivType === "delivery" ? address.trim() : undefined,
        useWallet,
      });
      setPlacing(false);
      setShowCart(false);
      Alert.alert(
        "🎉 Order Placed!",
        `Order ${order.orderNo} placed successfully.\n+${order.pointsEarned} loyalty points earned!`,
        [
          {
            text: "Track Order",
            onPress: () => router.replace(("/customer/track?id=" + order.id) as any),
          },
        ]
      );
    }, 800);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: CUSTOMER_PRIMARY, paddingTop: topPad + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { fontFamily: "Inter_700Bold" }]}>
            {decodeURIComponent(shopName || "Shop")}
          </Text>
          <Text style={[styles.headerSub, { fontFamily: "Inter_400Regular" }]}>
            {filtered.length} products available
          </Text>
        </View>
        <TouchableOpacity
          style={styles.cartHeaderBtn}
          onPress={() => cartCount > 0 && setShowCart(true)}
          activeOpacity={0.8}
        >
          <Feather name="shopping-cart" size={20} color="#fff" />
          {cartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={[styles.cartBadgeText, { fontFamily: "Inter_700Bold" }]}>
                {cartCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Category pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.catBar, { backgroundColor: colors.background, borderBottomColor: colors.border }]}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10, gap: 8 }}
      >
        {categories.map((cat) => {
          const active = selCat === cat;
          return (
            <TouchableOpacity
              key={cat}
              style={[
                styles.catChip,
                { backgroundColor: active ? CUSTOMER_PRIMARY : colors.card, borderColor: active ? CUSTOMER_PRIMARY : colors.border },
              ]}
              onPress={() => setSelCat(cat)}
              activeOpacity={0.8}
            >
              <Text style={[styles.catText, { color: active ? "#fff" : colors.foreground, fontFamily: active ? "Inter_700Bold" : "Inter_400Regular" }]}>
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Product grid */}
      <ScrollView contentContainerStyle={{ padding: 12, paddingBottom: cartCount > 0 ? 100 : 30 }}>
        <View style={styles.productGrid}>
          {filtered.map((product) => {
            const qty = getQtyInCart(product.id);
            return (
              <View
                key={product.id}
                style={[styles.productCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                {/* Product image */}
                <View style={[styles.productImgWrap, { backgroundColor: colors.background }]}>
                  {product.image ? (
                    <Image
                      source={{ uri: product.image }}
                      style={styles.productImg}
                      contentFit="cover"
                    />
                  ) : (
                    <Feather name="box" size={32} color={colors.mutedForeground} />
                  )}
                </View>

                {/* Info */}
                <View style={{ padding: 10, gap: 4 }}>
                  <Text style={[styles.productName, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]} numberOfLines={2}>
                    {product.name}
                  </Text>
                  <Text style={[styles.productCategory, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                    {product.category}
                  </Text>
                  <Text style={[styles.productPrice, { color: CUSTOMER_PRIMARY, fontFamily: "Inter_700Bold" }]}>
                    ₹{product.price}
                    <Text style={[styles.productUnit, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                      {" "}/ {product.unit}
                    </Text>
                  </Text>

                  {/* Add / Qty controls */}
                  {qty === 0 ? (
                    <TouchableOpacity
                      style={[styles.addBtn, { backgroundColor: CUSTOMER_PRIMARY }]}
                      onPress={() => handleAddToCart(product)}
                      activeOpacity={0.85}
                    >
                      <Feather name="plus" size={14} color="#fff" />
                      <Text style={[styles.addBtnText, { fontFamily: "Inter_700Bold" }]}>Add</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={[styles.qtyRow, { backgroundColor: CUSTOMER_PRIMARY + "15", borderColor: CUSTOMER_PRIMARY }]}>
                      <TouchableOpacity
                        onPress={() => updateCartQty(product.id, qty - 1)}
                        style={styles.qtyBtn}
                        activeOpacity={0.8}
                      >
                        <Feather name="minus" size={14} color={CUSTOMER_PRIMARY} />
                      </TouchableOpacity>
                      <Text style={[styles.qtyText, { color: CUSTOMER_PRIMARY, fontFamily: "Inter_700Bold" }]}>
                        {qty}
                      </Text>
                      <TouchableOpacity
                        onPress={() => updateCartQty(product.id, qty + 1)}
                        style={styles.qtyBtn}
                        activeOpacity={0.8}
                      >
                        <Feather name="plus" size={14} color={CUSTOMER_PRIMARY} />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Sticky cart bar */}
      {cartCount > 0 && (
        <View style={[styles.cartBar, { backgroundColor: CUSTOMER_PRIMARY, paddingBottom: botPad + 12 }]}>
          <View style={styles.cartBarLeft}>
            <View style={styles.cartCountBadge}>
              <Text style={[styles.cartCountText, { fontFamily: "Inter_700Bold" }]}>{cartCount}</Text>
            </View>
            <Text style={[styles.cartBarText, { fontFamily: "Inter_600SemiBold" }]}>
              {cartCount} item{cartCount > 1 ? "s" : ""} in cart
            </Text>
          </View>
          <TouchableOpacity
            style={styles.cartBarBtn}
            onPress={() => setShowCart(true)}
            activeOpacity={0.85}
          >
            <Text style={[styles.cartBarBtnText, { fontFamily: "Inter_700Bold" }]}>
              View Cart · ₹{totals.total}
            </Text>
            <Feather name="arrow-right" size={16} color={CUSTOMER_PRIMARY} />
          </TouchableOpacity>
        </View>
      )}

      {/* Cart & Checkout Modal */}
      <Modal visible={showCart} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: colors.background }]}>
            {/* Modal header */}
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                Your Cart
              </Text>
              <TouchableOpacity onPress={() => setShowCart(false)}>
                <Feather name="x" size={22} color={colors.foreground} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 20 }}>
              {/* Cart items */}
              {cart.map((item) => (
                <View key={item.id} style={[styles.cartItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={{ flex: 1, gap: 3 }}>
                    <Text style={[styles.cartItemName, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                      {item.name}
                    </Text>
                    <Text style={[styles.cartItemPrice, { color: CUSTOMER_PRIMARY, fontFamily: "Inter_700Bold" }]}>
                      ₹{item.price} × {item.qty} = ₹{item.price * item.qty}
                    </Text>
                  </View>
                  <View style={[styles.qtyRow, { backgroundColor: CUSTOMER_PRIMARY + "15", borderColor: CUSTOMER_PRIMARY }]}>
                    <TouchableOpacity
                      onPress={() => updateCartQty(item.id, item.qty - 1)}
                      style={styles.qtyBtn}
                    >
                      <Feather name="minus" size={13} color={CUSTOMER_PRIMARY} />
                    </TouchableOpacity>
                    <Text style={[styles.qtyText, { color: CUSTOMER_PRIMARY, fontFamily: "Inter_700Bold" }]}>
                      {item.qty}
                    </Text>
                    <TouchableOpacity
                      onPress={() => updateCartQty(item.id, item.qty + 1)}
                      style={styles.qtyBtn}
                    >
                      <Feather name="plus" size={13} color={CUSTOMER_PRIMARY} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              {/* Delivery type */}
              <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.sectionLabel, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                  Delivery Type
                </Text>
                <View style={styles.delivRow}>
                  {(["delivery", "pickup"] as const).map((t) => {
                    const active = delivType === t;
                    return (
                      <TouchableOpacity
                        key={t}
                        style={[
                          styles.delivChip,
                          { backgroundColor: active ? CUSTOMER_PRIMARY : colors.background, borderColor: active ? CUSTOMER_PRIMARY : colors.border },
                        ]}
                        onPress={() => setDelivType(t)}
                        activeOpacity={0.8}
                      >
                        <Feather
                          name={t === "delivery" ? "truck" : "shopping-bag"}
                          size={15}
                          color={active ? "#fff" : colors.mutedForeground}
                        />
                        <Text style={[styles.delivText, { color: active ? "#fff" : colors.foreground, fontFamily: active ? "Inter_700Bold" : "Inter_400Regular" }]}>
                          {t === "delivery" ? "Home Delivery" : "Store Pickup"}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                {delivType === "delivery" && (
                  <View style={[styles.addressInput, { backgroundColor: colors.background, borderColor: colors.border }]}>
                    <Feather name="map-pin" size={15} color={CUSTOMER_PRIMARY} />
                    <TextInput
                      style={[styles.addressField, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
                      placeholder="Enter delivery address"
                      placeholderTextColor={colors.mutedForeground}
                      value={address}
                      onChangeText={setAddress}
                      multiline
                    />
                  </View>
                )}
              </View>

              {/* Payment */}
              <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.sectionLabel, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                  Payment Method
                </Text>
                <View style={styles.payGrid}>
                  {PAY_OPTIONS.map((opt) => {
                    const active = payMode === opt.key;
                    return (
                      <TouchableOpacity
                        key={opt.key}
                        style={[
                          styles.payChip,
                          { backgroundColor: active ? CUSTOMER_PRIMARY + "15" : colors.background, borderColor: active ? CUSTOMER_PRIMARY : colors.border },
                        ]}
                        onPress={() => setPayMode(opt.key)}
                        activeOpacity={0.8}
                      >
                        <Feather name={opt.icon as any} size={16} color={active ? CUSTOMER_PRIMARY : colors.mutedForeground} />
                        <Text style={[styles.payText, { color: active ? CUSTOMER_PRIMARY : colors.foreground, fontFamily: active ? "Inter_700Bold" : "Inter_400Regular" }]}>
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Bill summary */}
              <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.sectionLabel, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                  Bill Summary
                </Text>
                <View style={styles.billLine}>
                  <Text style={[styles.billLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Subtotal</Text>
                  <Text style={[styles.billValue, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>₹{totals.subtotal}</Text>
                </View>
                <View style={styles.billLine}>
                  <Text style={[styles.billLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>GST (5%)</Text>
                  <Text style={[styles.billValue, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>₹{totals.gst}</Text>
                </View>
                <View style={styles.billLine}>
                  <Text style={[styles.billLabel, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Total</Text>
                  <Text style={[styles.billTotal, { color: CUSTOMER_PRIMARY, fontFamily: "Inter_700Bold" }]}>₹{totals.total}</Text>
                </View>
              </View>

              {/* Place order */}
              <TouchableOpacity
                style={[styles.placeBtn, { backgroundColor: CUSTOMER_PRIMARY, opacity: placing ? 0.7 : 1 }]}
                onPress={handlePlaceOrder}
                disabled={placing}
                activeOpacity={0.85}
              >
                {placing ? (
                  <Text style={[styles.placeBtnText, { fontFamily: "Inter_700Bold" }]}>Placing Order...</Text>
                ) : (
                  <>
                    <Feather name="check-circle" size={18} color="#fff" />
                    <Text style={[styles.placeBtnText, { fontFamily: "Inter_700Bold" }]}>
                      Place Order · ₹{totals.total}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root:           { flex: 1 },
  header:         { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingBottom: 14 },
  headerTitle:    { color: "#fff", fontSize: 16 },
  headerSub:      { color: "rgba(255,255,255,0.8)", fontSize: 12 },
  cartHeaderBtn:  { padding: 6, position: "relative" },
  cartBadge:      { position: "absolute", top: 2, right: 2, width: 16, height: 16, borderRadius: 8, backgroundColor: "#EF4444", alignItems: "center", justifyContent: "center" },
  cartBadgeText:  { color: "#fff", fontSize: 9 },
  catBar:         { borderBottomWidth: 1, maxHeight: 54 },
  catChip:        { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  catText:        { fontSize: 13 },
  productGrid:    { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  productCard:    { width: "48%", borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  productImgWrap: { width: "100%", height: 130, alignItems: "center", justifyContent: "center" },
  productImg:     { width: "100%", height: 130 },
  productName:    { fontSize: 13, lineHeight: 18 },
  productCategory:{ fontSize: 10 },
  productPrice:   { fontSize: 15 },
  productUnit:    { fontSize: 11 },
  addBtn:         { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, height: 34, borderRadius: 8, marginTop: 4 },
  addBtnText:     { color: "#fff", fontSize: 13 },
  qtyRow:         { flexDirection: "row", alignItems: "center", justifyContent: "space-between", height: 34, borderRadius: 8, borderWidth: 1, marginTop: 4 },
  qtyBtn:         { width: 34, height: 34, alignItems: "center", justifyContent: "center" },
  qtyText:        { fontSize: 15 },
  cartBar:        { position: "absolute", bottom: 0, left: 0, right: 0, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 12 },
  cartBarLeft:    { flexDirection: "row", alignItems: "center", gap: 8 },
  cartCountBadge: { width: 28, height: 28, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.25)", alignItems: "center", justifyContent: "center" },
  cartCountText:  { color: "#fff", fontSize: 13 },
  cartBarText:    { color: "rgba(255,255,255,0.9)", fontSize: 14 },
  cartBarBtn:     { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#fff", paddingHorizontal: 14, paddingVertical: 9, borderRadius: 12 },
  cartBarBtnText: { color: CUSTOMER_PRIMARY, fontSize: 14 },
  modalOverlay:   { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  modalSheet:     { borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: "90%", minHeight: "50%" },
  modalHeader:    { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 20, borderBottomWidth: 1 },
  modalTitle:     { fontSize: 18 },
  cartItem:       { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 14, borderWidth: 1 },
  cartItemName:   { fontSize: 14 },
  cartItemPrice:  { fontSize: 13 },
  section:        { borderRadius: 14, borderWidth: 1, padding: 14, gap: 12 },
  sectionLabel:   { fontSize: 14 },
  delivRow:       { flexDirection: "row", gap: 10 },
  delivChip:      { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, paddingVertical: 11, borderRadius: 12, borderWidth: 1 },
  delivText:      { fontSize: 13 },
  addressInput:   { flexDirection: "row", alignItems: "flex-start", gap: 10, borderRadius: 10, borderWidth: 1, padding: 12 },
  addressField:   { flex: 1, fontSize: 14, minHeight: 40 },
  payGrid:        { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  payChip:        { width: "47%", flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 11, borderRadius: 12, borderWidth: 1 },
  payText:        { fontSize: 13 },
  billLine:       { flexDirection: "row", justifyContent: "space-between" },
  billLabel:      { fontSize: 13 },
  billValue:      { fontSize: 13 },
  billTotal:      { fontSize: 16 },
  placeBtn:       { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, height: 54, borderRadius: 14 },
  placeBtnText:   { color: "#fff", fontSize: 16 },
});
