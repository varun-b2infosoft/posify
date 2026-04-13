export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  unit: string;
  lowStockThreshold: number;
  totalSold: number;
  revenue: number;
  lastSold: string;
}

const INITIAL: Product[] = [
  { id: "1",  name: "Café Americano Blend",    sku: "FB-001", category: "Food & Bev",    price: 499,  stock: 2,    unit: "kg",     lowStockThreshold: 5,  totalSold: 142, revenue: 70858,  lastSold: "Today" },
  { id: "2",  name: "iPhone Case Pro",          sku: "EL-021", category: "Electronics",   price: 899,  stock: 24,   unit: "pcs",    lowStockThreshold: 5,  totalSold: 89,  revenue: 80011,  lastSold: "Yesterday" },
  { id: "3",  name: "Linen Kurta Set",          sku: "CL-045", category: "Clothing",      price: 1299, stock: 6,    unit: "pcs",    lowStockThreshold: 5,  totalSold: 54,  revenue: 70146,  lastSold: "2 days ago" },
  { id: "4",  name: "Wooden Platter (L)",       sku: "HL-012", category: "Home & Living", price: 1150, stock: 3,    unit: "pcs",    lowStockThreshold: 5,  totalSold: 38,  revenue: 43700,  lastSold: "3 days ago" },
  { id: "5",  name: "Python Handbook",          sku: "BK-007", category: "Books",         price: 799,  stock: 31,   unit: "pcs",    lowStockThreshold: 10, totalSold: 210, revenue: 167790, lastSold: "Today" },
  { id: "6",  name: "Crystal Candle Set",       sku: "HL-034", category: "Home & Living", price: 650,  stock: 18,   unit: "pcs",    lowStockThreshold: 5,  totalSold: 73,  revenue: 47450,  lastSold: "Yesterday" },
  { id: "7",  name: "Fitness Gloves",           sku: "SP-009", category: "Sports",        price: 549,  stock: 5,    unit: "pcs",    lowStockThreshold: 5,  totalSold: 91,  revenue: 49959,  lastSold: "Today" },
  { id: "8",  name: "Herbal Face Cream",        sku: "BE-022", category: "Beauty",        price: 1199, stock: 500,  unit: "ml",     lowStockThreshold: 100, totalSold: 186, revenue: 92814, lastSold: "Yesterday" },
  { id: "9",  name: "Travel Pillow",            sku: "AC-061", category: "Accessories",   price: 299,  stock: 22,   unit: "pcs",    lowStockThreshold: 5,  totalSold: 134, revenue: 40066,  lastSold: "Today" },
  { id: "10", name: "Desk Calendar 2026",       sku: "ST-014", category: "Stationery",    price: 149,  stock: 9,    unit: "pcs",    lowStockThreshold: 5,  totalSold: 67,  revenue: 9983,   lastSold: "2 days ago" },
  { id: "11", name: "Espresso Pods (10pk)",     sku: "FB-019", category: "Food & Bev",    price: 349,  stock: 38,   unit: "pcs",    lowStockThreshold: 10, totalSold: 298, revenue: 104002, lastSold: "Today" },
  { id: "12", name: "USB-C Hub 7-in-1",         sku: "EL-067", category: "Electronics",   price: 2299, stock: 15,   unit: "pcs",    lowStockThreshold: 5,  totalSold: 44,  revenue: 101156, lastSold: "Yesterday" },
  { id: "13", name: "Yoga Mat Pro",             sku: "SP-031", category: "Sports",        price: 1499, stock: 8,    unit: "pcs",    lowStockThreshold: 5,  totalSold: 62,  revenue: 92938,  lastSold: "3 days ago" },
  { id: "14", name: "Moisturiser SPF",          sku: "BE-041", category: "Beauty",        price: 649,  stock: 19,   unit: "pcs",    lowStockThreshold: 10, totalSold: 155, revenue: 100595, lastSold: "Yesterday" },
  { id: "15", name: "Travel Wallet",            sku: "AC-078", category: "Accessories",   price: 799,  stock: 11,   unit: "pcs",    lowStockThreshold: 5,  totalSold: 48,  revenue: 38352,  lastSold: "4 days ago" },
  { id: "16", name: "Basmati Rice Premium",     sku: "FB-031", category: "Food & Bev",    price: 89,   stock: 50,   unit: "kg",     lowStockThreshold: 10, totalSold: 320, revenue: 28480,  lastSold: "Today" },
  { id: "17", name: "Extra Virgin Olive Oil",   sku: "FB-042", category: "Food & Bev",    price: 450,  stock: 20,   unit: "litre",  lowStockThreshold: 5,  totalSold: 84,  revenue: 37800,  lastSold: "Yesterday" },
  { id: "18", name: "Mixed Dry Fruits",         sku: "FB-056", category: "Food & Bev",    price: 12,   stock: 5000, unit: "g",      lowStockThreshold: 500, totalSold: 9200, revenue: 110400, lastSold: "Today" },
  { id: "19", name: "Rose Water",               sku: "BE-055", category: "Beauty",        price: 2.5,  stock: 8000, unit: "ml",     lowStockThreshold: 500, totalSold: 45000, revenue: 112500, lastSold: "Today" },
];

let _products: Product[] = [...INITIAL];
let _listeners: Array<() => void> = [];

export function getProducts(): Product[] { return _products; }

export function getProduct(id: string): Product | undefined {
  return _products.find((p) => p.id === id);
}

export function addProduct(p: Omit<Product, "id" | "totalSold" | "revenue" | "lastSold">): Product {
  const newProduct: Product = {
    ...p,
    id: Date.now().toString(),
    totalSold: 0,
    revenue: 0,
    lastSold: "Never",
  };
  _products = [..._products, newProduct];
  _notify();
  return newProduct;
}

export function updateProduct(p: Product): void {
  _products = _products.map((x) => (x.id === p.id ? p : x));
  _notify();
}

export function deleteProduct(id: string): void {
  _products = _products.filter((x) => x.id !== id);
  _notify();
}

export function subscribeProducts(fn: () => void) {
  _listeners.push(fn);
  return () => { _listeners = _listeners.filter((l) => l !== fn); };
}

function _notify() {
  _listeners.forEach((fn) => fn());
}

export const CATEGORIES = [
  "Food & Bev", "Electronics", "Clothing", "Home & Living",
  "Books", "Sports", "Beauty", "Accessories", "Stationery",
];

export const UNITS = ["pcs", "kg", "g", "litre", "ml", "box", "set"];

export const WEIGHT_UNITS = ["kg", "g", "litre", "ml"];

export function isWeightBased(unit: string): boolean {
  return WEIGHT_UNITS.includes(unit);
}

export function formatQty(qty: number, unit: string): string {
  if (!isWeightBased(unit)) return `${qty} ${unit}`;
  const rounded = parseFloat(qty.toFixed(3));
  return `${rounded} ${unit}`;
}

export function weightStep(unit: string): number {
  switch (unit) {
    case "g":  return 50;
    case "ml": return 50;
    default:   return 0.25;
  }
}

export function weightPresets(unit: string): number[] {
  switch (unit) {
    case "g":     return [50, 100, 250, 500];
    case "ml":    return [50, 100, 250, 500];
    case "litre": return [0.25, 0.5, 1, 2];
    default:      return [0.25, 0.5, 1, 2]; // kg
  }
}

export const CATEGORY_COLORS: Record<string, string> = {
  "Food & Bev": "#F59E0B",
  Electronics: "#06B6D4",
  Clothing: "#8B5CF6",
  "Home & Living": "#EC4899",
  Books: "#10B981",
  Sports: "#EF4444",
  Beauty: "#F472B6",
  Accessories: "#6366F1",
  Stationery: "#84CC16",
  default: "#4F46E5",
};

export const CATEGORY_ICONS: Record<string, string> = {
  "Food & Bev": "coffee",
  Electronics: "smartphone",
  Clothing: "tag",
  "Home & Living": "home",
  Books: "book",
  Sports: "activity",
  Beauty: "droplet",
  Accessories: "briefcase",
  Stationery: "pen-tool",
  default: "box",
};
