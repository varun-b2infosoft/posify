export type ExpenseCategory = "Rent" | "Salary" | "Utilities" | "Marketing" | "Transport" | "Maintenance" | "Other";
export const EXPENSE_CATEGORIES: ExpenseCategory[] = ["Rent", "Salary", "Utilities", "Marketing", "Transport", "Maintenance", "Other"];

export const EXPENSE_CAT_COLORS: Record<ExpenseCategory, string> = {
  Rent:        "#4F46E5",
  Salary:      "#10B981",
  Utilities:   "#F59E0B",
  Marketing:   "#EC4899",
  Transport:   "#06B6D4",
  Maintenance: "#8B5CF6",
  Other:       "#6B7280",
};

export interface Expense {
  id:       string;
  title:    string;
  amount:   number;
  category: ExpenseCategory;
  date:     string;
  notes:    string;
  shopId:   string;
}

const INITIAL_EXPENSES: Expense[] = [
  { id: "E1",  title: "Shop Rent – Feb",     amount: 18000, category: "Rent",        date: "2026-02-01", notes: "Monthly rent for Main Store",   shopId: "SH1" },
  { id: "E2",  title: "Electricity Bill",    amount: 3200,  category: "Utilities",   date: "2026-02-05", notes: "BESCOM bill for February",      shopId: "SH1" },
  { id: "E3",  title: "Arjun Salary",        amount: 22000, category: "Salary",      date: "2026-02-28", notes: "",                              shopId: "SH1" },
  { id: "E4",  title: "Google Ads",          amount: 5000,  category: "Marketing",   date: "2026-02-10", notes: "Feb campaign spend",            shopId: "SH1" },
  { id: "E5",  title: "Courier charges",     amount: 1400,  category: "Transport",   date: "2026-02-12", notes: "Last mile delivery",            shopId: "SH1" },
  { id: "E6",  title: "Shop Rent – Mar",     amount: 18000, category: "Rent",        date: "2026-03-01", notes: "Monthly rent for Main Store",   shopId: "SH1" },
  { id: "E7",  title: "AC Repair",           amount: 2800,  category: "Maintenance", date: "2026-03-08", notes: "Compressor issue fixed",        shopId: "SH1" },
  { id: "E8",  title: "Deepa Salary",        amount: 18000, category: "Salary",      date: "2026-03-28", notes: "",                              shopId: "SH1" },
  { id: "E9",  title: "North Branch Rent",   amount: 12000, category: "Rent",        date: "2026-03-01", notes: "",                              shopId: "SH2" },
  { id: "E10", title: "Water & Internet",    amount: 1800,  category: "Utilities",   date: "2026-03-15", notes: "",                              shopId: "SH2" },
  { id: "E11", title: "Shop Rent – Apr",     amount: 18000, category: "Rent",        date: "2026-04-01", notes: "Monthly rent",                  shopId: "SH1" },
  { id: "E12", title: "Electricity – Apr",   amount: 3600,  category: "Utilities",   date: "2026-04-05", notes: "",                              shopId: "SH1" },
  { id: "E13", title: "Instagram Ads",       amount: 3000,  category: "Marketing",   date: "2026-04-09", notes: "Product launch campaign",       shopId: "SH1" },
  { id: "E14", title: "Van Hire",            amount: 2200,  category: "Transport",   date: "2026-04-11", notes: "Stock transfer vehicle",        shopId: "SH1" },
];

let _expenses: Expense[] = [...INITIAL_EXPENSES];
let _listeners: Array<() => void> = [];

function notify() { _listeners.forEach(fn => fn()); }

export function getExpenses(): Expense[] { return _expenses; }
export function getExpense(id: string): Expense | undefined { return _expenses.find(e => e.id === id); }
export function addExpense(e: Omit<Expense, "id">): Expense {
  const n: Expense = { ...e, id: "E" + Date.now() };
  _expenses = [n, ..._expenses];
  notify();
  return n;
}
export function deleteExpense(id: string): void {
  _expenses = _expenses.filter(e => e.id !== id);
  notify();
}
export function subscribeExpenses(fn: () => void) {
  _listeners.push(fn);
  return () => { _listeners = _listeners.filter(l => l !== fn); };
}

export function getMonthlyTotal(year: number, month: number): number {
  return _expenses.filter(e => {
    const d = new Date(e.date);
    return d.getFullYear() === year && d.getMonth() + 1 === month;
  }).reduce((s, e) => s + e.amount, 0);
}
