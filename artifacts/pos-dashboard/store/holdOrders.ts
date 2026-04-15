export interface HeldCartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  unit: string;
  weightBased: boolean;
}

export interface HeldOrder {
  id: string;
  queueNumber: number;
  orderName: string;
  items: HeldCartItem[];
  subtotal: number;
  total: number;
  itemCount: number;
  customerName?: string;
  customerPhone?: string;
  createdAt: number;
}

let _counter = 0;
let _orders: HeldOrder[] = [];
const _subs: Array<() => void> = [];

function notify() {
  _subs.forEach((fn) => fn());
}

function nextQueueNumber(): number {
  _counter += 1;
  return _counter;
}

export function getNextOrderName(): string {
  return `Order-${_counter + 1}`;
}

export function getHeldOrders(): HeldOrder[] {
  return [..._orders].sort((a, b) => b.createdAt - a.createdAt);
}

export function subscribeHeldOrders(fn: () => void): () => void {
  _subs.push(fn);
  return () => {
    const idx = _subs.indexOf(fn);
    if (idx !== -1) _subs.splice(idx, 1);
  };
}

export function saveHoldOrder(
  items: HeldCartItem[],
  subtotal: number,
  total: number,
  orderName: string,
  customerName?: string,
  customerPhone?: string,
): HeldOrder {
  const qn = nextQueueNumber();
  const name = orderName.trim() || `Order-${qn}`;
  const itemCount = items.reduce((s, c) => s + (c.weightBased ? 1 : c.qty), 0);
  const order: HeldOrder = {
    id: `hold_${Date.now()}_${qn}`,
    queueNumber: qn,
    orderName: name,
    items: [...items],
    subtotal,
    total,
    itemCount,
    customerName: customerName?.trim() || undefined,
    customerPhone: customerPhone?.trim() || undefined,
    createdAt: Date.now(),
  };
  _orders = [order, ..._orders];
  if (_orders.length > 50) _orders = _orders.slice(0, 50);
  notify();
  return order;
}

export function deleteHeldOrder(id: string): void {
  _orders = _orders.filter((o) => o.id !== id);
  notify();
}

export function heldOrderCount(): number {
  return _orders.length;
}
