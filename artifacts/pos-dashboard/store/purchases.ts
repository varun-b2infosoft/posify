import { updateProduct, getProduct } from "./products";
import { recordPurchaseForSupplier } from "./suppliers";

export interface PurchaseLineItem {
  productId: string;
  productName: string;
  qty: number;
  costPrice: number;
}

export interface Purchase {
  id: string;
  supplierId: string;
  supplierName: string;
  date: string;
  items: PurchaseLineItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: "delivered" | "pending" | "cancelled";
  notes: string;
}

const INITIAL: Purchase[] = [
  {
    id: "PO-001", supplierId: "S1", supplierName: "Metro Wholesale",
    date: "Apr 13, 2026",
    items: [
      { productId: "1",  productName: "Café Americano Blend",  qty: 10, costPrice: 380 },
      { productId: "11", productName: "Espresso Pods (10pk)",  qty: 20, costPrice: 280 },
    ],
    subtotal: 9400, tax: 846, total: 10246, status: "delivered", notes: "",
  },
  {
    id: "PO-002", supplierId: "S2", supplierName: "TechHub Imports",
    date: "Apr 12, 2026",
    items: [
      { productId: "2",  productName: "iPhone Case Pro",       qty: 15, costPrice: 650 },
      { productId: "12", productName: "USB-C Hub 7-in-1",      qty: 5,  costPrice: 1800 },
    ],
    subtotal: 18750, tax: 1688, total: 20438, status: "pending", notes: "Expected by Apr 15",
  },
  {
    id: "PO-003", supplierId: "S3", supplierName: "FabricWorld",
    date: "Apr 11, 2026",
    items: [
      { productId: "3",  productName: "Linen Kurta Set",       qty: 20, costPrice: 950 },
    ],
    subtotal: 19000, tax: 1710, total: 20710, status: "delivered", notes: "",
  },
  {
    id: "PO-004", supplierId: "S4", supplierName: "BookMart Dist.",
    date: "Apr 10, 2026",
    items: [
      { productId: "5",  productName: "Python Handbook",       qty: 30, costPrice: 580 },
      { productId: "10", productName: "Desk Calendar 2026",    qty: 20, costPrice: 100 },
    ],
    subtotal: 19400, tax: 1746, total: 21146, status: "delivered", notes: "",
  },
  {
    id: "PO-005", supplierId: "S5", supplierName: "HomeDeco Supp.",
    date: "Apr 9, 2026",
    items: [
      { productId: "4",  productName: "Wooden Platter (L)",    qty: 8,  costPrice: 820 },
      { productId: "6",  productName: "Crystal Candle Set",    qty: 12, costPrice: 480 },
    ],
    subtotal: 12320, tax: 1109, total: 13429, status: "cancelled", notes: "Supplier out of stock",
  },
  {
    id: "PO-006", supplierId: "S1", supplierName: "Metro Wholesale",
    date: "Apr 8, 2026",
    items: [
      { productId: "11", productName: "Espresso Pods (10pk)",  qty: 30, costPrice: 275 },
    ],
    subtotal: 8250, tax: 743, total: 8993, status: "delivered", notes: "",
  },
  {
    id: "PO-007", supplierId: "S6", supplierName: "SportZone B2B",
    date: "Apr 7, 2026",
    items: [
      { productId: "7",  productName: "Fitness Gloves",        qty: 15, costPrice: 400 },
      { productId: "13", productName: "Yoga Mat Pro",          qty: 8,  costPrice: 1100 },
    ],
    subtotal: 14800, tax: 1332, total: 16132, status: "delivered", notes: "",
  },
];

let _purchases: Purchase[] = [...INITIAL];
let _listeners: Array<() => void> = [];

export function getPurchases(): Purchase[] {
  return [..._purchases].sort((a, b) => b.id.localeCompare(a.id));
}

export function getPurchase(id: string): Purchase | undefined {
  return _purchases.find((p) => p.id === id);
}

export function confirmPurchase(
  supplierId: string,
  supplierName: string,
  items: PurchaseLineItem[],
  notes: string = ""
): Purchase {
  const subtotal = items.reduce((s, i) => s + i.costPrice * i.qty, 0);
  const tax      = Math.round(subtotal * 0.09);
  const total    = subtotal + tax;
  const idNum    = String(_purchases.length + 1).padStart(3, "0");

  const po: Purchase = {
    id: `PO-${idNum}`,
    supplierId,
    supplierName,
    date: "Today",
    items,
    subtotal,
    tax,
    total,
    status: "delivered",
    notes,
  };

  _purchases = [po, ..._purchases];

  items.forEach((item) => {
    const existing = getProduct(item.productId);
    if (existing) {
      updateProduct({ ...existing, stock: existing.stock + item.qty });
    }
  });

  recordPurchaseForSupplier(supplierId, total);
  _notify();
  return po;
}

export function subscribePurchases(fn: () => void) {
  _listeners.push(fn);
  return () => { _listeners = _listeners.filter((l) => l !== fn); };
}

function _notify() { _listeners.forEach((fn) => fn()); }
