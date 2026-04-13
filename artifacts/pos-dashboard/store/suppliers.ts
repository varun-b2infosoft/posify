export interface Supplier {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
  totalOrders: number;
  lastPurchase: string;
  totalSpend: number;
}

const INITIAL: Supplier[] = [
  { id: "S1", name: "Metro Wholesale",   phone: "+91 98765 43210", email: "metro@wholesale.in",   address: "14, Andheri Ind. Area, Mumbai",  notes: "Primary grocery & F&B supplier",   totalOrders: 24, lastPurchase: "Apr 13, 2026", totalSpend: 382000 },
  { id: "S2", name: "TechHub Imports",   phone: "+91 87654 32109", email: "sales@techhub.co",     address: "78, Electronics Mkt, Nehru Place", notes: "Electronics & accessories",          totalOrders: 11, lastPurchase: "Apr 12, 2026", totalSpend: 514000 },
  { id: "S3", name: "FabricWorld",       phone: "+91 76543 21098", email: "orders@fabricworld.in", address: "42, Textile Hub, Surat",           notes: "Clothing & linen items",             totalOrders: 18, lastPurchase: "Apr 11, 2026", totalSpend: 228000 },
  { id: "S4", name: "BookMart Dist.",    phone: "+91 65432 10987", email: "bkmart@books.net",      address: "9, Publisher Lane, Chennai",       notes: "Books & stationery",                 totalOrders: 15, lastPurchase: "Apr 10, 2026", totalSpend: 143000 },
  { id: "S5", name: "HomeDeco Supp.",    phone: "+91 54321 09876", email: "homedeco@supply.in",    address: "21, Decor Zone, Jaipur",           notes: "Home, candles, kitchenware",         totalOrders: 9,  lastPurchase: "Apr 9, 2026",  totalSpend: 198000 },
  { id: "S6", name: "SportZone B2B",     phone: "+91 43210 98765", email: "b2b@sportzone.com",     address: "55, Sports Complex, Pune",         notes: "Sports & fitness gear",              totalOrders: 7,  lastPurchase: "Apr 7, 2026",  totalSpend: 165000 },
];

let _suppliers: Supplier[] = [...INITIAL];
let _listeners: Array<() => void> = [];

export function getSuppliers(): Supplier[] { return _suppliers; }

export function getSupplier(id: string): Supplier | undefined {
  return _suppliers.find((s) => s.id === id);
}

export function addSupplier(s: Omit<Supplier, "id" | "totalOrders" | "lastPurchase" | "totalSpend">): Supplier {
  const n: Supplier = { ...s, id: "S" + Date.now(), totalOrders: 0, lastPurchase: "Never", totalSpend: 0 };
  _suppliers = [..._suppliers, n];
  _notify();
  return n;
}

export function updateSupplier(s: Supplier): void {
  _suppliers = _suppliers.map((x) => (x.id === s.id ? s : x));
  _notify();
}

export function deleteSupplier(id: string): void {
  _suppliers = _suppliers.filter((s) => s.id !== id);
  _notify();
}

export function recordPurchaseForSupplier(id: string, amount: number): void {
  _suppliers = _suppliers.map((s) =>
    s.id === id
      ? { ...s, totalOrders: s.totalOrders + 1, totalSpend: s.totalSpend + amount, lastPurchase: "Today" }
      : s
  );
  _notify();
}

export function subscribeSuppliers(fn: () => void) {
  _listeners.push(fn);
  return () => { _listeners = _listeners.filter((l) => l !== fn); };
}

function _notify() { _listeners.forEach((fn) => fn()); }
