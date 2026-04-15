// Customer-facing app store — profile, orders, cart, wallet, loyalty, referral

export const CUSTOMER_PRIMARY = "#10B981";
export const CUSTOMER_AMBER   = "#F59E0B";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CustomerProfile {
  id: string;
  name: string;
  phone: string;
  location: string;
  walletBalance: number;
  loyaltyPoints: number;
  totalSpent: number;
  referralCode: string;
  referralEarnings: number;
  referralCount: number;
}

export type OrderStatus =
  | "placed"
  | "preparing"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export interface CustomerOrderItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  unit: string;
}

export interface CustomerOrder {
  id: string;
  orderNo: string;
  shopId: string;
  shopName: string;
  shopPhone: string;
  items: CustomerOrderItem[];
  subtotal: number;
  gst: number;
  total: number;
  paymentMode: "UPI" | "Card" | "COD" | "Wallet";
  deliveryType: "delivery" | "pickup";
  address?: string;
  status: OrderStatus;
  createdAt: number;
  statusHistory: { status: OrderStatus; time: number }[];
  pointsEarned: number;
  paid: boolean;
}

export type WalletTxType = "added" | "used" | "cashback" | "refund";

export interface WalletTx {
  id: string;
  type: WalletTxType;
  amount: number;
  note: string;
  date: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  unit: string;
  category: string;
  image?: string;
}

export interface ShopLoyalty {
  shopId: string;
  shopName: string;
  points: number;
  totalSpent: number;
}

export interface CustomerShop {
  id: string;
  name: string;
  address: string;
  phone: string;
  distance: string;
  category: string;
  rating: number;
  isOpen: boolean;
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const now = Date.now();
const D = (mins: number) => now - mins * 60 * 1000;

const INITIAL_PROFILE: CustomerProfile = {
  id: "cust_001",
  name: "Rahul Mehta",
  phone: "+91 98765 43210",
  location: "Koramangala, Bengaluru",
  walletBalance: 350,
  loyaltyPoints: 1240,
  totalSpent: 12500,
  referralCode: "RAHUL123",
  referralEarnings: 150,
  referralCount: 3,
};

export const CUSTOMER_SHOPS: CustomerShop[] = [
  { id: "SH1", name: "Main Store",    address: "12, MG Road, Bengaluru",     phone: "+91 80 1234 5678", distance: "1.2 km", category: "General",   rating: 4.7, isOpen: true  },
  { id: "SH2", name: "North Branch",  address: "45, Rajajinagar, Bengaluru", phone: "+91 80 9876 5432", distance: "2.0 km", category: "General",   rating: 4.5, isOpen: true  },
  { id: "SH3", name: "East Outlet",   address: "7, Whitefield, Bengaluru",   phone: "+91 80 5678 1234", distance: "3.4 km", category: "Specialty", rating: 4.3, isOpen: false },
  { id: "SH4", name: "West Corner",   address: "88, Yeshwanthpur, Bengaluru",phone: "+91 80 2345 6789", distance: "4.1 km", category: "General",   rating: 4.2, isOpen: true  },
];

const INITIAL_ORDERS: CustomerOrder[] = [
  {
    id: "co_001", orderNo: "ORD-0001",
    shopId: "SH1", shopName: "Main Store", shopPhone: "+91 80 1234 5678",
    items: [
      { id: "16", name: "Basmati Rice Premium", price: 89,  qty: 2, unit: "kg"    },
      { id: "17", name: "Extra Virgin Olive Oil",price: 450, qty: 1, unit: "litre" },
    ],
    subtotal: 628, gst: 31, total: 659,
    paymentMode: "UPI", deliveryType: "delivery",
    address: "12, 5th Cross, Koramangala",
    status: "out_for_delivery", createdAt: D(45),
    statusHistory: [
      { status: "placed",           time: D(45) },
      { status: "preparing",        time: D(35) },
      { status: "out_for_delivery", time: D(15) },
    ],
    pointsEarned: 6, paid: true,
  },
  {
    id: "co_002", orderNo: "ORD-0002",
    shopId: "SH2", shopName: "North Branch", shopPhone: "+91 80 9876 5432",
    items: [
      { id: "3", name: "Linen Kurta Set", price: 1299, qty: 1, unit: "pcs" },
    ],
    subtotal: 1299, gst: 156, total: 1455,
    paymentMode: "COD", deliveryType: "delivery",
    address: "12, 5th Cross, Koramangala",
    status: "preparing", createdAt: D(20),
    statusHistory: [
      { status: "placed",    time: D(20) },
      { status: "preparing", time: D(10) },
    ],
    pointsEarned: 14, paid: false,
  },
  {
    id: "co_003", orderNo: "ORD-0003",
    shopId: "SH1", shopName: "Main Store", shopPhone: "+91 80 1234 5678",
    items: [
      { id: "8",  name: "Herbal Face Cream", price: 1199, qty: 1, unit: "100ml" },
      { id: "7",  name: "Fitness Gloves",    price: 549,  qty: 1, unit: "pcs"   },
    ],
    subtotal: 1748, gst: 175, total: 1923,
    paymentMode: "Card", deliveryType: "pickup",
    status: "delivered", createdAt: D(2 * 24 * 60),
    statusHistory: [
      { status: "placed",           time: D(2 * 24 * 60)      },
      { status: "preparing",        time: D(2 * 24 * 60 - 15) },
      { status: "out_for_delivery", time: D(2 * 24 * 60 - 40) },
      { status: "delivered",        time: D(2 * 24 * 60 - 60) },
    ],
    pointsEarned: 19, paid: true,
  },
  {
    id: "co_004", orderNo: "ORD-0004",
    shopId: "SH1", shopName: "Main Store", shopPhone: "+91 80 1234 5678",
    items: [
      { id: "16", name: "Basmati Rice Premium", price: 89,  qty: 5, unit: "kg"  },
      { id: "18", name: "Mixed Dry Fruits",      price: 899, qty: 1, unit: "500g" },
    ],
    subtotal: 1344, gst: 67, total: 1411,
    paymentMode: "UPI", deliveryType: "delivery",
    address: "12, 5th Cross, Koramangala",
    status: "delivered", createdAt: D(5 * 24 * 60),
    statusHistory: [
      { status: "placed",           time: D(5 * 24 * 60)      },
      { status: "preparing",        time: D(5 * 24 * 60 - 20) },
      { status: "out_for_delivery", time: D(5 * 24 * 60 - 50) },
      { status: "delivered",        time: D(5 * 24 * 60 - 80) },
    ],
    pointsEarned: 14, paid: true,
  },
  {
    id: "co_005", orderNo: "ORD-0005",
    shopId: "SH2", shopName: "North Branch", shopPhone: "+91 80 9876 5432",
    items: [
      { id: "5", name: "Python Handbook", price: 799, qty: 2, unit: "pcs" },
    ],
    subtotal: 1598, gst: 160, total: 1758,
    paymentMode: "UPI", deliveryType: "pickup",
    status: "delivered", createdAt: D(10 * 24 * 60),
    statusHistory: [
      { status: "placed",    time: D(10 * 24 * 60)      },
      { status: "preparing", time: D(10 * 24 * 60 - 20) },
      { status: "delivered", time: D(10 * 24 * 60 - 50) },
    ],
    pointsEarned: 17, paid: true,
  },
];

const INITIAL_WALLET: WalletTx[] = [
  { id: "W1", type: "added",    amount: 500, note: "Added via UPI",            date: "2026-04-01" },
  { id: "W2", type: "used",     amount: 100, note: "Used in order ORD-0004",   date: "2026-04-05" },
  { id: "W3", type: "cashback", amount: 50,  note: "Cashback on ORD-0004",     date: "2026-04-05" },
  { id: "W4", type: "used",     amount: 100, note: "Used in order ORD-0003",   date: "2026-04-08" },
  { id: "W5", type: "refund",   amount: 0,   note: "Added via UPI",            date: "2026-04-10" },
  { id: "W6", type: "added",    amount: 200, note: "Referral bonus credited",  date: "2026-04-12" },
];

const INITIAL_LOYALTY: ShopLoyalty[] = [
  { shopId: "SH1", shopName: "Main Store",   points: 840, totalSpent: 8400 },
  { shopId: "SH2", shopName: "North Branch", points: 280, totalSpent: 2800 },
  { shopId: "SH3", shopName: "East Outlet",  points: 120, totalSpent: 1200 },
];

// ─── State ─────────────────────────────────────────────────────────────────────

let _loggedIn: boolean              = false;
let _profile: CustomerProfile       = { ...INITIAL_PROFILE };
let _orders:  CustomerOrder[]       = [...INITIAL_ORDERS];
let _wallet:  WalletTx[]            = [...INITIAL_WALLET];
let _loyalty: ShopLoyalty[]         = [...INITIAL_LOYALTY];
let _cart:    CartItem[]            = [];
let _cartShopId: string             = "";
let _cartShopName: string           = "";
let _subs: Array<() => void>        = [];

function notify() { _subs.forEach(fn => fn()); }

export function subscribeCustomerApp(fn: () => void): () => void {
  _subs.push(fn);
  return () => { _subs = _subs.filter(l => l !== fn); };
}

// ─── Auth ──────────────────────────────────────────────────────────────────────

export function isCustomerLoggedIn(): boolean { return _loggedIn; }
export function getCustomerProfile(): CustomerProfile { return { ..._profile }; }

export function loginCustomer(phone: string, name?: string) {
  _loggedIn = true;
  _profile  = { ..._profile, phone, name: name || _profile.name };
  notify();
}

export function logoutCustomer() {
  _loggedIn = false;
  _cart = [];
  notify();
}

// ─── Orders ────────────────────────────────────────────────────────────────────

export function getCustomerOrders(): CustomerOrder[] {
  return [..._orders].sort((a, b) => b.createdAt - a.createdAt);
}

export function getCustomerOrder(id: string): CustomerOrder | undefined {
  return _orders.find(o => o.id === id);
}

export function getPendingOrders(): CustomerOrder[] {
  return _orders.filter(o => o.status !== "delivered" && o.status !== "cancelled");
}

// ─── Cart ──────────────────────────────────────────────────────────────────────

export function getCart(): CartItem[]      { return [..._cart]; }
export function getCartShopId(): string    { return _cartShopId; }
export function getCartShopName(): string  { return _cartShopName; }
export function getCartCount(): number     { return _cart.reduce((s, c) => s + c.qty, 0); }

export function setCartShop(shopId: string, shopName: string) {
  _cartShopId   = shopId;
  _cartShopName = shopName;
  _cart         = [];
  notify();
}

export function addToCart(item: Omit<CartItem, "qty">) {
  const existing = _cart.find(c => c.id === item.id);
  if (existing) {
    _cart = _cart.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
  } else {
    _cart = [..._cart, { ...item, qty: 1 }];
  }
  notify();
}

export function updateCartQty(id: string, qty: number) {
  if (qty <= 0) { _cart = _cart.filter(c => c.id !== id); }
  else           { _cart = _cart.map(c => c.id === id ? { ...c, qty } : c); }
  notify();
}

export function clearCart() {
  _cart = [];
  notify();
}

export function getCartTotals(): { subtotal: number; gst: number; total: number } {
  const subtotal = _cart.reduce((s, c) => s + c.price * c.qty, 0);
  const gst      = Math.round(subtotal * 0.05);
  return { subtotal, gst, total: subtotal + gst };
}

// ─── Wallet ────────────────────────────────────────────────────────────────────

export function getWalletTransactions(): WalletTx[] { return [..._wallet]; }

export function addWalletFunds(amount: number) {
  _profile = { ..._profile, walletBalance: _profile.walletBalance + amount };
  _wallet  = [
    { id: "W" + Date.now(), type: "added", amount, note: "Added via UPI", date: new Date().toISOString().split("T")[0] },
    ..._wallet,
  ];
  notify();
}

// ─── Loyalty ───────────────────────────────────────────────────────────────────

export function getLoyaltyByShop(): ShopLoyalty[] { return [..._loyalty]; }

// ─── Place Order ───────────────────────────────────────────────────────────────

let _orderCounter = 5;

export function placeOrder(params: {
  paymentMode: CustomerOrder["paymentMode"];
  deliveryType: CustomerOrder["deliveryType"];
  address?: string;
  useWallet?: boolean;
}): CustomerOrder {
  _orderCounter++;
  const { subtotal, gst, total } = getCartTotals();
  const walletUsed = params.useWallet
    ? Math.min(_profile.walletBalance, total)
    : 0;
  const pointsEarned = Math.floor(total / 100);

  const newOrder: CustomerOrder = {
    id:           "co_" + Date.now(),
    orderNo:      `ORD-${String(_orderCounter).padStart(4, "0")}`,
    shopId:       _cartShopId,
    shopName:     _cartShopName,
    shopPhone:    "+91 80 1234 5678",
    items:        _cart.map(c => ({ id: c.id, name: c.name, price: c.price, qty: c.qty, unit: c.unit })),
    subtotal, gst, total,
    paymentMode:  params.paymentMode,
    deliveryType: params.deliveryType,
    address:      params.address,
    status:       "placed",
    createdAt:    Date.now(),
    statusHistory: [{ status: "placed", time: Date.now() }],
    pointsEarned,
    paid: params.paymentMode !== "COD",
  };

  _orders  = [newOrder, ..._orders];
  _profile = {
    ..._profile,
    totalSpent:    _profile.totalSpent + total,
    loyaltyPoints: _profile.loyaltyPoints + pointsEarned,
    walletBalance: _profile.walletBalance - walletUsed,
  };

  if (walletUsed > 0) {
    _wallet = [
      { id: "W" + Date.now(), type: "used", amount: walletUsed, note: `Used in ${newOrder.orderNo}`, date: new Date().toISOString().split("T")[0] },
      ..._wallet,
    ];
  }

  const existing = _loyalty.find(l => l.shopId === _cartShopId);
  if (existing) {
    _loyalty = _loyalty.map(l =>
      l.shopId === _cartShopId
        ? { ...l, points: l.points + pointsEarned, totalSpent: l.totalSpent + total }
        : l
    );
  } else {
    _loyalty = [{ shopId: _cartShopId, shopName: _cartShopName, points: pointsEarned, totalSpent: total }, ..._loyalty];
  }

  _cart         = [];
  _cartShopId   = "";
  _cartShopName = "";
  notify();
  return newOrder;
}
