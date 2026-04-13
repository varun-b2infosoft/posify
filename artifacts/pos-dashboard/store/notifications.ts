export type NotifType = "low_stock" | "transfer" | "payment" | "daily_summary" | "return" | "system";

export interface Notification {
  id:      string;
  type:    NotifType;
  title:   string;
  body:    string;
  date:    string;
  read:    boolean;
  icon:    string;
  color:   string;
}

const INITIAL_NOTIFS: Notification[] = [
  { id: "N1",  type: "low_stock",     title: "Low Stock Alert",          body: "Basmati Rice is below minimum — only 8 kg left.",            date: "2026-04-13T08:15:00", read: false, icon: "alert-triangle", color: "#F59E0B" },
  { id: "N2",  type: "transfer",      title: "Transfer Completed",       body: "Stock transfer SH1 → SH2 has been completed.",               date: "2026-04-13T07:40:00", read: false, icon: "check-circle",   color: "#10B981" },
  { id: "N3",  type: "payment",       title: "Payment Received",         body: "₹3,200 received from Ramesh Gupta via UPI.",                 date: "2026-04-12T18:30:00", read: false, icon: "dollar-sign",    color: "#4F46E5" },
  { id: "N4",  type: "daily_summary", title: "Daily Summary – Apr 12",   body: "Sales ₹38,400 · Orders 14 · Net Profit ₹12,100",            date: "2026-04-12T23:55:00", read: true,  icon: "bar-chart-2",    color: "#8B5CF6" },
  { id: "N5",  type: "low_stock",     title: "Low Stock Alert",          body: "Herbal Face Cream (Rose Water) — only 150 ml remaining.",    date: "2026-04-12T11:00:00", read: true,  icon: "alert-triangle", color: "#F59E0B" },
  { id: "N6",  type: "payment",       title: "Credit Due Reminder",      body: "Kavitha Rao has ₹11,000 outstanding. Last txn 12 days ago.", date: "2026-04-11T09:00:00", read: true,  icon: "credit-card",    color: "#EF4444" },
  { id: "N7",  type: "transfer",      title: "Transfer Initiated",       body: "New transfer created: SH3 → SH1 (5 products).",             date: "2026-04-11T14:20:00", read: true,  icon: "package",        color: "#10B981" },
  { id: "N8",  type: "return",        title: "Return Processed",         body: "Invoice POSify-0009 returned by Ramesh Gupta — ₹944.",      date: "2026-04-10T16:45:00", read: true,  icon: "rotate-ccw",     color: "#EF4444" },
  { id: "N9",  type: "daily_summary", title: "Daily Summary – Apr 10",   body: "Sales ₹41,200 · Orders 18 · Net Profit ₹14,500",           date: "2026-04-10T23:55:00", read: true,  icon: "bar-chart-2",    color: "#8B5CF6" },
  { id: "N10", type: "system",        title: "Backup Successful",        body: "Your data was backed up to cloud at 2:00 AM.",              date: "2026-04-10T02:00:00", read: true,  icon: "cloud",          color: "#06B6D4" },
];

let _notifs: Notification[] = [...INITIAL_NOTIFS];
let _listeners: Array<() => void> = [];
function notify() { _listeners.forEach(fn => fn()); }

export function getNotifications(): Notification[] { return _notifs; }
export function getUnreadCount(): number { return _notifs.filter(n => !n.read).length; }
export function markRead(id: string): void {
  _notifs = _notifs.map(n => n.id === id ? { ...n, read: true } : n);
  notify();
}
export function markAllRead(): void {
  _notifs = _notifs.map(n => ({ ...n, read: true }));
  notify();
}
export function addNotification(n: Omit<Notification, "id">): void {
  _notifs = [{ ...n, id: "N" + Date.now() }, ..._notifs];
  notify();
}
export function subscribeNotifications(fn: () => void) {
  _listeners.push(fn);
  return () => { _listeners = _listeners.filter(l => l !== fn); };
}
