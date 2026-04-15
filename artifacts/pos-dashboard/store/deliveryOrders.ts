export type DeliveryStatus = "pending" | "completed" | "cancelled";

export interface DeliveryItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  unit: string;
  weightBased: boolean;
}

export interface DeliveryOrderCustomer {
  id?: string;
  name: string;
  phone: string;
  address?: string;
}

export interface DeliveryOrder {
  id: string;
  orderNo: string;
  customer: DeliveryOrderCustomer;
  items: DeliveryItem[];
  subtotal: number;
  gst: number;
  total: number;
  amountPaid: number;
  dueAmount: number;
  walletAdded?: number;
  status: DeliveryStatus;
  createdAt: number;
  deliveredAt?: number;
  cancelledAt?: number;
}

export interface CreateDeliveryParams {
  customer: DeliveryOrderCustomer;
  items: DeliveryItem[];
  subtotal: number;
  gst: number;
  total: number;
  amountReceived: number;
}

export interface CompleteDeliveryParams {
  id: string;
  amountReceived: number;
  walletUsed?: number;
  walletAdded?: number;
}

let _counter = 10;

function nextOrderNo(): string {
  _counter += 1;
  return `DEL-${String(_counter).padStart(3, "0")}`;
}

const SEED_DATE = Date.now();

let _orders: DeliveryOrder[] = [
  {
    id: "del_001",
    orderNo: "DEL-001",
    customer: { name: "Rahul Sharma", phone: "+91 98001 11001", address: "12, MG Road, Bengaluru" },
    items: [
      { id: "P1", name: "Basmati Rice", price: 499, qty: 5, unit: "kg", weightBased: true },
      { id: "P2", name: "Olive Oil",   price: 749, qty: 1, unit: "litre", weightBased: true },
    ],
    subtotal: 3244, gst: 194, total: 3438,
    amountPaid: 0, dueAmount: 3438,
    status: "pending",
    createdAt: SEED_DATE - 3 * 60 * 60 * 1000,
  },
  {
    id: "del_002",
    orderNo: "DEL-002",
    customer: { name: "Priya Patel", phone: "+91 98001 22002", address: "44, Park Street, Kolkata" },
    items: [
      { id: "P5", name: "Python Handbook", price: 799, qty: 2, unit: "pcs", weightBased: false },
      { id: "P8", name: "Crystal Candle Set", price: 650, qty: 1, unit: "pcs", weightBased: false },
    ],
    subtotal: 2248, gst: 405, total: 2653,
    amountPaid: 1000, dueAmount: 1653,
    status: "pending",
    createdAt: SEED_DATE - 45 * 60 * 1000,
  },
  {
    id: "del_003",
    orderNo: "DEL-003",
    customer: { name: "Amit Joshi", phone: "+91 98001 33003", address: "7, Civil Lines, Jaipur" },
    items: [
      { id: "P4", name: "Linen Kurta Set", price: 1299, qty: 1, unit: "pcs", weightBased: false },
    ],
    subtotal: 1299, gst: 234, total: 1533,
    amountPaid: 1533, dueAmount: 0,
    status: "completed",
    createdAt: SEED_DATE - 2 * 24 * 60 * 60 * 1000,
    deliveredAt: SEED_DATE - 1 * 24 * 60 * 60 * 1000,
  },
  {
    id: "del_004",
    orderNo: "DEL-004",
    customer: { name: "Sunita Verma", phone: "+91 98001 44004", address: "23, Lal Bagh, Lucknow" },
    items: [
      { id: "P9", name: "Fitness Gloves", price: 549, qty: 2, unit: "pcs", weightBased: false },
      { id: "P11", name: "Travel Pillow", price: 299, qty: 1, unit: "pcs", weightBased: false },
    ],
    subtotal: 1397, gst: 251, total: 1648,
    amountPaid: 0, dueAmount: 1648,
    status: "cancelled",
    createdAt: SEED_DATE - 5 * 24 * 60 * 60 * 1000,
    cancelledAt: SEED_DATE - 4 * 24 * 60 * 60 * 1000,
  },
];

const _subs: Array<() => void> = [];

function notify() {
  _subs.forEach((fn) => fn());
}

export function getDeliveryOrders(): DeliveryOrder[] {
  return [..._orders].sort((a, b) => b.createdAt - a.createdAt);
}

export function getDeliveryOrderById(id: string): DeliveryOrder | undefined {
  return _orders.find((o) => o.id === id);
}

export function subscribeDeliveryOrders(fn: () => void): () => void {
  _subs.push(fn);
  return () => {
    const i = _subs.indexOf(fn);
    if (i !== -1) _subs.splice(i, 1);
  };
}

export function createDeliveryOrder(params: CreateDeliveryParams): DeliveryOrder {
  const order: DeliveryOrder = {
    id: `del_${Date.now()}`,
    orderNo: nextOrderNo(),
    customer: params.customer,
    items: params.items,
    subtotal: params.subtotal,
    gst: params.gst,
    total: params.total,
    amountPaid: params.amountReceived,
    dueAmount: Math.max(0, params.total - params.amountReceived),
    status: "pending",
    createdAt: Date.now(),
  };
  _orders = [order, ..._orders];
  notify();
  return order;
}

export function completeDeliveryOrder(params: CompleteDeliveryParams): void {
  _orders = _orders.map((o) => {
    if (o.id !== params.id) return o;
    const totalPaid = o.amountPaid + params.amountReceived - (params.walletUsed ?? 0);
    const due = Math.max(0, o.total - totalPaid - (params.walletUsed ?? 0));
    const walletAdded = Math.max(0, totalPaid - o.total);
    return {
      ...o,
      amountPaid: totalPaid,
      dueAmount: due,
      walletAdded: walletAdded > 0 ? walletAdded : undefined,
      status: "completed",
      deliveredAt: Date.now(),
    };
  });
  notify();
}

export function cancelDeliveryOrder(id: string): void {
  _orders = _orders.map((o) =>
    o.id === id ? { ...o, status: "cancelled", cancelledAt: Date.now() } : o
  );
  notify();
}

export function updateDeliveryOrderItems(
  id: string,
  items: DeliveryItem[],
  subtotal: number,
  gst: number,
  total: number,
): void {
  _orders = _orders.map((o) => {
    if (o.id !== id) return o;
    return {
      ...o,
      items,
      subtotal,
      gst,
      total,
      dueAmount: Math.max(0, total - o.amountPaid),
    };
  });
  notify();
}

export function pendingDeliveryCount(): number {
  return _orders.filter((o) => o.status === "pending").length;
}

let _editingOrderId: string | null = null;

export function setEditingDeliveryOrder(id: string | null): void {
  _editingOrderId = id;
}

export function getEditingDeliveryOrder(): DeliveryOrder | null {
  if (!_editingOrderId) return null;
  return _orders.find((o) => o.id === _editingOrderId) ?? null;
}
