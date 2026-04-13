import React, { useEffect, useRef } from "react";
import {
  Animated,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

interface CartSheetProps {
  visible: boolean;
  cart: CartItem[];
  discount: number;
  onClose: () => void;
  onUpdateQty: (id: string, delta: number) => void;
  onClear: () => void;
  onCheckout: () => void;
}

export function CartSheet({
  visible,
  cart,
  discount,
  onClose,
  onUpdateQty,
  onClear,
  onCheckout,
}: CartSheetProps) {
  const colors = useColors();
  const slideAnim = useRef(new Animated.Value(600)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 70,
          friction: 12,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 600,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const discountAmt = Math.round(subtotal * (discount / 100));
  const afterDiscount = subtotal - discountAmt;
  const tax = Math.round(afterDiscount * 0.18);
  const total = afterDiscount + tax;
  const itemCount = cart.reduce((s, c) => s + c.qty, 0);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.container}>
        <Animated.View style={[styles.overlay, { opacity: overlayAnim }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        <Animated.View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.card,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={[styles.handle, { backgroundColor: colors.border }]} />

          <View style={styles.titleRow}>
            <View style={styles.titleLeft}>
              <Text style={[styles.title, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                Cart
              </Text>
              <View style={[styles.countBadge, { backgroundColor: colors.primary }]}>
                <Text style={[styles.countText, { fontFamily: "Inter_700Bold" }]}>{itemCount}</Text>
              </View>
            </View>
            <View style={styles.titleRight}>
              {cart.length > 0 && (
                <TouchableOpacity
                  onPress={onClear}
                  style={[styles.clearBtn, { borderColor: colors.destructive + "40" }]}
                >
                  <Text style={[styles.clearText, { color: colors.destructive, fontFamily: "Inter_500Medium" }]}>
                    Clear all
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={onClose}
                style={[styles.closeBtn, { backgroundColor: colors.muted }]}
              >
                <Feather name="x" size={17} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
          </View>

          {cart.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Feather name="shopping-cart" size={38} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                No items in cart
              </Text>
            </View>
          ) : (
            <>
              <ScrollView style={styles.itemList} showsVerticalScrollIndicator={false}>
                {cart.map((item, idx) => (
                  <View
                    key={item.id}
                    style={[
                      styles.cartItem,
                      {
                        borderBottomColor: colors.border,
                        borderBottomWidth: idx < cart.length - 1 ? 1 : 0,
                      },
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[styles.itemName, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}
                        numberOfLines={1}
                      >
                        {item.name}
                      </Text>
                      <Text style={[styles.itemPrice, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                        ₹{item.price} × {item.qty}
                      </Text>
                    </View>
                    <View style={styles.qtyRow}>
                      <TouchableOpacity
                        onPress={() => onUpdateQty(item.id, -1)}
                        style={[styles.qtyBtn, { borderColor: colors.border }]}
                      >
                        <Feather name="minus" size={13} color={colors.foreground} />
                      </TouchableOpacity>
                      <Text style={[styles.qtyNum, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                        {item.qty}
                      </Text>
                      <TouchableOpacity
                        onPress={() => onUpdateQty(item.id, 1)}
                        style={[styles.qtyBtn, { borderColor: colors.primary, backgroundColor: colors.primary }]}
                      >
                        <Feather name="plus" size={13} color="#fff" />
                      </TouchableOpacity>
                    </View>
                    <Text style={[styles.itemTotal, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                      ₹{(item.price * item.qty).toLocaleString()}
                    </Text>
                  </View>
                ))}
              </ScrollView>

              <View style={[styles.totalsBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <View style={styles.totalLine}>
                  <Text style={[styles.totalLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                    Subtotal
                  </Text>
                  <Text style={[styles.totalVal, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
                    ₹{subtotal.toLocaleString()}
                  </Text>
                </View>
                {discount > 0 && (
                  <View style={styles.totalLine}>
                    <Text style={[styles.totalLabel, { color: colors.success, fontFamily: "Inter_400Regular" }]}>
                      Discount ({discount}%)
                    </Text>
                    <Text style={[styles.totalVal, { color: colors.success, fontFamily: "Inter_500Medium" }]}>
                      −₹{discountAmt.toLocaleString()}
                    </Text>
                  </View>
                )}
                <View style={styles.totalLine}>
                  <Text style={[styles.totalLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                    GST (18%)
                  </Text>
                  <Text style={[styles.totalVal, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
                    ₹{tax.toLocaleString()}
                  </Text>
                </View>
                <View style={[styles.totalLine, styles.grandLine]}>
                  <Text style={[styles.grandLabel, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                    Total
                  </Text>
                  <Text style={[styles.grandVal, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>
                    ₹{total.toLocaleString()}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.checkoutBtn, { backgroundColor: colors.success }]}
                onPress={() => {
                  onClose();
                  setTimeout(onCheckout, 250);
                }}
                activeOpacity={0.85}
              >
                <Feather name="credit-card" size={19} color="#fff" />
                <Text style={[styles.checkoutText, { fontFamily: "Inter_700Bold" }]}>
                  Pay ₹{total.toLocaleString()}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 18,
    paddingBottom: Platform.OS === "web" ? 36 : 28,
    maxHeight: "82%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 24,
  },
  handle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 14,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  titleLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 20,
  },
  countBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  countText: {
    color: "#fff",
    fontSize: 12,
  },
  titleRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  clearBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  clearText: {
    fontSize: 13,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyWrap: {
    alignItems: "center",
    gap: 10,
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
  },
  itemList: {
    maxHeight: 260,
  },
  cartItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
  },
  itemName: {
    fontSize: 14,
    marginBottom: 2,
  },
  itemPrice: {
    fontSize: 12,
  },
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyNum: {
    fontSize: 14,
    minWidth: 22,
    textAlign: "center",
  },
  itemTotal: {
    fontSize: 14,
    minWidth: 64,
    textAlign: "right",
  },
  totalsBox: {
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    gap: 6,
  },
  totalLine: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  totalLabel: {
    fontSize: 13,
  },
  totalVal: {
    fontSize: 13,
  },
  grandLine: {
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  grandLabel: {
    fontSize: 16,
  },
  grandVal: {
    fontSize: 22,
  },
  checkoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 14,
  },
  checkoutText: {
    color: "#fff",
    fontSize: 18,
  },
});
