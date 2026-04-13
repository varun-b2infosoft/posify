export type StaffRole = "Admin" | "Manager" | "Salesman";

export interface Permission {
  pos:           boolean;
  viewProducts:  boolean;
  editProducts:  boolean;
  manageStock:   boolean;
  transferStock: boolean;
  viewReports:   boolean;
  purchases:     boolean;
}

export const ROLE_PERMISSIONS: Record<StaffRole, Permission> = {
  Admin:    { pos: true,  viewProducts: true,  editProducts: true,  manageStock: true,  transferStock: true,  viewReports: true,  purchases: true  },
  Manager:  { pos: true,  viewProducts: true,  editProducts: true,  manageStock: true,  transferStock: true,  viewReports: true,  purchases: true  },
  Salesman: { pos: true,  viewProducts: true,  editProducts: false, manageStock: false, transferStock: false, viewReports: false, purchases: false },
};

export interface StaffMember {
  id:          string;
  shopId:      string;
  name:        string;
  phone:       string;
  email:       string;
  role:        StaffRole;
  permissions: Permission;
  joinedDate:  string;
  active:      boolean;
}

export interface Shop {
  id:           string;
  name:         string;
  address:      string;
  phone:        string;
  manager:      string;
  stockValue:   number;
  todaySales:   number;
  totalOrders:  number;
  active:       boolean;
  color:        string;
}

const INITIAL_SHOPS: Shop[] = [
  { id: "SH1", name: "Main Store",      address: "12, MG Road, Bengaluru",   phone: "+91 98765 43210", manager: "Arjun Kumar",  stockValue: 512000, todaySales: 72400, totalOrders: 284, active: true,  color: "#4F46E5" },
  { id: "SH2", name: "North Branch",    address: "45, Koramangala, Bengaluru", phone: "+91 87654 32109", manager: "Priya Nair",   stockValue: 284000, todaySales: 38200, totalOrders: 141, active: true,  color: "#10B981" },
  { id: "SH3", name: "East Outlet",     address: "8, Indiranagar, Bengaluru",  phone: "+91 76543 21098", manager: "Ravi Sharma",  stockValue: 195000, todaySales: 21500, totalOrders: 87,  active: true,  color: "#F59E0B" },
  { id: "SH4", name: "Airport Kiosk",   address: "Terminal 2, BLR Airport",    phone: "+91 65432 10987", manager: "Meena Singh",  stockValue: 98000,  todaySales: 12800, totalOrders: 54,  active: false, color: "#EF4444" },
];

const INITIAL_STAFF: StaffMember[] = [
  { id: "ST1", shopId: "SH1", name: "Arjun Kumar",  phone: "+91 98765 43210", email: "arjun@posify.in",  role: "Admin",    permissions: ROLE_PERMISSIONS["Admin"],    joinedDate: "Jan 1, 2024",  active: true },
  { id: "ST2", shopId: "SH1", name: "Deepa Menon",  phone: "+91 87654 32109", email: "deepa@posify.in",  role: "Manager",  permissions: ROLE_PERMISSIONS["Manager"],  joinedDate: "Mar 15, 2024", active: true },
  { id: "ST3", shopId: "SH1", name: "Kartik Rao",   phone: "+91 76543 21098", email: "kartik@posify.in", role: "Salesman", permissions: ROLE_PERMISSIONS["Salesman"], joinedDate: "Jun 10, 2024", active: true },
  { id: "ST4", shopId: "SH2", name: "Priya Nair",   phone: "+91 65432 10987", email: "priya@posify.in",  role: "Manager",  permissions: ROLE_PERMISSIONS["Manager"],  joinedDate: "Feb 20, 2024", active: true },
  { id: "ST5", shopId: "SH2", name: "Anand Pillai", phone: "+91 54321 09876", email: "anand@posify.in",  role: "Salesman", permissions: ROLE_PERMISSIONS["Salesman"], joinedDate: "May 5, 2024",  active: true },
  { id: "ST6", shopId: "SH3", name: "Ravi Sharma",  phone: "+91 43210 98765", email: "ravi@posify.in",   role: "Manager",  permissions: ROLE_PERMISSIONS["Manager"],  joinedDate: "Apr 1, 2024",  active: true },
  { id: "ST7", shopId: "SH3", name: "Sunita Devi",  phone: "+91 32109 87654", email: "sunita@posify.in", role: "Salesman", permissions: ROLE_PERMISSIONS["Salesman"], joinedDate: "Jul 12, 2024", active: true },
  { id: "ST8", shopId: "SH4", name: "Meena Singh",  phone: "+91 21098 76543", email: "meena@posify.in",  role: "Manager",  permissions: ROLE_PERMISSIONS["Manager"],  joinedDate: "Sep 1, 2024",  active: false },
];

let _shops: Shop[]          = [...INITIAL_SHOPS];
let _staff: StaffMember[]   = [...INITIAL_STAFF];
let _selectedShopId: string = "ALL";
let _listeners: Array<() => void> = [];

export function getShops():    Shop[]        { return _shops; }
export function getShop(id: string): Shop | undefined { return _shops.find(s => s.id === id); }
export function getStaff(shopId?: string): StaffMember[] {
  return shopId ? _staff.filter(s => s.shopId === shopId) : _staff;
}
export function getStaffMember(id: string): StaffMember | undefined { return _staff.find(s => s.id === id); }
export function getSelectedShopId(): string { return _selectedShopId; }

export function setSelectedShop(id: string): void {
  _selectedShopId = id;
  _notify();
}

export function addShop(s: Omit<Shop, "id" | "stockValue" | "todaySales" | "totalOrders">): Shop {
  const n: Shop = { ...s, id: "SH" + Date.now(), stockValue: 0, todaySales: 0, totalOrders: 0 };
  _shops = [..._shops, n];
  _notify();
  return n;
}

export function updateShop(s: Shop): void {
  _shops = _shops.map(x => x.id === s.id ? s : x);
  _notify();
}

export function deleteShop(id: string): void {
  _shops = _shops.filter(s => s.id !== id);
  _staff = _staff.filter(s => s.shopId !== id);
  if (_selectedShopId === id) _selectedShopId = "ALL";
  _notify();
}

export function addStaff(m: Omit<StaffMember, "id">): StaffMember {
  const n: StaffMember = { ...m, id: "ST" + Date.now() };
  _staff = [..._staff, n];
  _notify();
  return n;
}

export function updateStaff(m: StaffMember): void {
  _staff = _staff.map(x => x.id === m.id ? m : x);
  _notify();
}

export function deleteStaff(id: string): void {
  _staff = _staff.filter(s => s.id !== id);
  _notify();
}

export function subscribeShops(fn: () => void) {
  _listeners.push(fn);
  return () => { _listeners = _listeners.filter(l => l !== fn); };
}

function _notify() { _listeners.forEach(fn => fn()); }

export const ROLES: StaffRole[] = ["Admin", "Manager", "Salesman"];

export const ROLE_COLORS: Record<StaffRole, string> = {
  Admin:    "#4F46E5",
  Manager:  "#10B981",
  Salesman: "#F59E0B",
};

export const ROLE_ICONS: Record<StaffRole, string> = {
  Admin:    "shield",
  Manager:  "briefcase",
  Salesman: "shopping-cart",
};

export const PERMISSION_LABELS: Record<keyof Permission, string> = {
  pos:           "Access POS",
  viewProducts:  "View Products",
  editProducts:  "Edit Products",
  manageStock:   "Manage Stock",
  transferStock: "Transfer Stock",
  viewReports:   "View Reports",
  purchases:     "Purchases",
};
