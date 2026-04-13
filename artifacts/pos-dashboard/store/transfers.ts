import { getProduct, updateProduct } from "./products";
import { getShop } from "./shops";

export type TransferStatus = "initiated" | "in_transit" | "completed" | "cancelled";

export interface TransferItem {
  productId:   string;
  productName: string;
  qty:         number;
  unit?:       string;
}

export interface StockTransfer {
  id:         string;
  fromShopId: string;
  fromShop:   string;
  toShopId:   string;
  toShop:     string;
  items:      TransferItem[];
  status:     TransferStatus;
  date:       string;
  notes:      string;
  updatedAt:  string;
}

const INITIAL: StockTransfer[] = [
  {
    id: "TR-001", fromShopId: "SH1", fromShop: "Main Store",   toShopId: "SH2", toShop: "North Branch",
    items: [
      { productId: "2",  productName: "iPhone Case Pro",     qty: 10 },
      { productId: "5",  productName: "Python Handbook",     qty: 20 },
    ],
    status: "completed", date: "Apr 12, 2026", notes: "Monthly replenishment", updatedAt: "Apr 13, 2026",
  },
  {
    id: "TR-002", fromShopId: "SH2", fromShop: "North Branch", toShopId: "SH3", toShop: "East Outlet",
    items: [
      { productId: "11", productName: "Espresso Pods (10pk)", qty: 15 },
    ],
    status: "in_transit", date: "Apr 13, 2026", notes: "Urgent — low stock at East", updatedAt: "Apr 13, 2026",
  },
  {
    id: "TR-003", fromShopId: "SH1", fromShop: "Main Store",   toShopId: "SH3", toShop: "East Outlet",
    items: [
      { productId: "3",  productName: "Linen Kurta Set",     qty: 5  },
      { productId: "8",  productName: "Herbal Face Cream",   qty: 12 },
    ],
    status: "initiated", date: "Apr 13, 2026", notes: "", updatedAt: "Apr 13, 2026",
  },
  {
    id: "TR-004", fromShopId: "SH3", fromShop: "East Outlet",  toShopId: "SH1", toShop: "Main Store",
    items: [
      { productId: "9",  productName: "Travel Pillow",        qty: 8  },
    ],
    status: "cancelled", date: "Apr 11, 2026", notes: "Cancelled — product recalled", updatedAt: "Apr 11, 2026",
  },
];

let _transfers: StockTransfer[] = [...INITIAL];
let _listeners: Array<() => void> = [];

export function getTransfers(): StockTransfer[] {
  return [..._transfers].sort((a, b) => b.id.localeCompare(a.id));
}

export function getTransfer(id: string): StockTransfer | undefined {
  return _transfers.find(t => t.id === id);
}

export function createTransfer(
  fromShopId: string, toShopId: string,
  items: TransferItem[], notes: string
): StockTransfer {
  const fromShop = getShop(fromShopId);
  const toShop   = getShop(toShopId);
  const idNum    = String(_transfers.length + 1).padStart(3, "0");
  const t: StockTransfer = {
    id:         `TR-${idNum}`,
    fromShopId, fromShop: fromShop?.name ?? "Unknown",
    toShopId,   toShop:   toShop?.name   ?? "Unknown",
    items,
    status:     "initiated",
    date:       "Today",
    notes,
    updatedAt:  "Today",
  };
  _transfers = [t, ..._transfers];
  _notify();
  return t;
}

export function updateTransferStatus(id: string, status: TransferStatus): void {
  _transfers = _transfers.map(t => {
    if (t.id !== id) return t;
    const updated = { ...t, status, updatedAt: "Today" };
    if (status === "completed") {
      t.items.forEach(item => {
        const prod = getProduct(item.productId);
        if (prod) updateProduct({ ...prod, stock: Math.max(0, prod.stock - item.qty) });
      });
    }
    return updated;
  });
  _notify();
}

export function subscribeTransfers(fn: () => void) {
  _listeners.push(fn);
  return () => { _listeners = _listeners.filter(l => l !== fn); };
}

function _notify() { _listeners.forEach(fn => fn()); }

export const STATUS_META: Record<TransferStatus, { label: string; color: string; bg: string; icon: string }> = {
  initiated:  { label: "Initiated",  color: "#92400E", bg: "#FEF3C7", icon: "clock"        },
  in_transit: { label: "In Transit", color: "#1D4ED8", bg: "#DBEAFE", icon: "truck"         },
  completed:  { label: "Completed",  color: "#065F46", bg: "#D1FAE5", icon: "check-circle"  },
  cancelled:  { label: "Cancelled",  color: "#B91C1C", bg: "#FEE2E2", icon: "x-circle"      },
};
