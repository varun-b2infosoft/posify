export interface InvoiceItem {
  name:     string;
  qty:      number;
  unit:     string;
  price:    number;
  total:    number;
}

export interface Invoice {
  id:          string;
  invoiceNo:   string;
  customerId:  string;
  customerName:string;
  date:        string;
  items:       InvoiceItem[];
  subtotal:    number;
  gst:         number;
  gstRate:     number;
  total:       number;
  paid:        boolean;
  paymentMode: "Cash" | "UPI" | "Card" | "Credit";
  shopId:      string;
  returned:    boolean;
}

const mk = (
  id: string, no: string, cid: string, cname: string, date: string,
  items: InvoiceItem[], gstRate: number, paid: boolean,
  mode: Invoice["paymentMode"], shopId: string, returned = false
): Invoice => {
  const subtotal = items.reduce((s, i) => s + i.total, 0);
  const gst = Math.round(subtotal * gstRate / 100);
  return { id, invoiceNo: no, customerId: cid, customerName: cname, date, items, subtotal, gst, gstRate, total: subtotal + gst, paid, paymentMode: mode, shopId, returned };
};

const INITIAL_INVOICES: Invoice[] = [
  mk("INV1", "POSify-0001", "C1", "Ramesh Gupta",  "2026-04-10",
    [{ name: "Basmati Rice", qty: 5, unit: "kg", price: 499, total: 2495 }, { name: "Mixed Dry Fruits", qty: 0.5, unit: "kg", price: 899, total: 450 }],
    5, true, "Cash", "SH1"),
  mk("INV2", "POSify-0002", "C4", "Pooja Nair",    "2026-04-10",
    [{ name: "iPhone Case Pro", qty: 2, unit: "pcs", price: 899, total: 1798 }, { name: "Fitness Gloves", qty: 1, unit: "pcs", price: 549, total: 549 }],
    18, true, "UPI", "SH1"),
  mk("INV3", "POSify-0003", "C2", "Sunita Verma",  "2026-04-09",
    [{ name: "Linen Kurta Set", qty: 2, unit: "pcs", price: 1299, total: 2598 }, { name: "Crystal Candle Set", qty: 1, unit: "pcs", price: 650, total: 650 }],
    12, true, "Card", "SH1"),
  mk("INV4", "POSify-0004", "C3", "Ajay Sharma",   "2026-04-08",
    [{ name: "Basmati Rice", qty: 10, unit: "kg", price: 499, total: 4990 }, { name: "Olive Oil", qty: 2, unit: "litre", price: 749, total: 1498 }],
    5, false, "Credit", "SH1"),
  mk("INV5", "POSify-0005", "C6", "Meera Iyer",    "2026-04-07",
    [{ name: "Python Handbook", qty: 1, unit: "pcs", price: 799, total: 799 }, { name: "Travel Pillow", qty: 2, unit: "pcs", price: 299, total: 598 }],
    12, true, "UPI", "SH1"),
  mk("INV6", "POSify-0006", "C7", "Deepak Joshi",  "2026-04-06",
    [{ name: "Herbal Face Cream", qty: 100, unit: "ml", price: 1199, total: 1199 }, { name: "Rose Water", qty: 200, unit: "ml", price: 299, total: 299 }],
    18, true, "Cash", "SH2"),
  mk("INV7", "POSify-0007", "C5", "Vikram Singh",  "2026-04-05",
    [{ name: "Café Americano Blend", qty: 0.5, unit: "kg", price: 499, total: 250 }],
    5, true, "UPI", "SH1"),
  mk("INV8", "POSify-0008", "C8", "Kavitha Rao",   "2026-04-04",
    [{ name: "Wooden Platter", qty: 3, unit: "pcs", price: 1150, total: 3450 }, { name: "Crystal Candle Set", qty: 2, unit: "pcs", price: 650, total: 1300 }],
    12, false, "Credit", "SH1"),
  mk("INV9", "POSify-0009", "C1", "Ramesh Gupta",  "2026-04-03",
    [{ name: "Mixed Dry Fruits", qty: 1, unit: "kg", price: 899, total: 899 }],
    5, true, "Cash", "SH1", true),
  mk("INV10","POSify-0010", "C4", "Pooja Nair",    "2026-04-02",
    [{ name: "Linen Kurta Set", qty: 1, unit: "pcs", price: 1299, total: 1299 }, { name: "Fitness Gloves", qty: 2, unit: "pcs", price: 549, total: 1098 }],
    12, true, "Card", "SH1"),
];

let _invoices: Invoice[] = [...INITIAL_INVOICES];
let _listeners: Array<() => void> = [];
function notify() { _listeners.forEach(fn => fn()); }

export function getInvoices(): Invoice[] { return _invoices; }
export function getInvoice(id: string): Invoice | undefined { return _invoices.find(i => i.id === id); }
export function addInvoice(inv: Omit<Invoice, "id">): Invoice {
  const n: Invoice = { ...inv, id: "INV" + Date.now() };
  _invoices = [n, ..._invoices];
  notify();
  return n;
}
export function markReturned(id: string): void {
  _invoices = _invoices.map(i => i.id === id ? { ...i, returned: true } : i);
  notify();
}
export function subscribeInvoices(fn: () => void) {
  _listeners.push(fn);
  return () => { _listeners = _listeners.filter(l => l !== fn); };
}
export function getTodayRevenue(): number {
  const today = new Date().toISOString().split("T")[0];
  return _invoices.filter(i => i.date === today && !i.returned).reduce((s, i) => s + i.total, 0);
}
