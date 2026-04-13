export interface Customer {
  id:           string;
  name:         string;
  phone:        string;
  email:        string;
  address:      string;
  joinedDate:   string;
  totalPurchases: number;
  creditBalance:  number;
}

export type CreditTxType = "sale" | "payment";

export interface CreditTransaction {
  id:         string;
  customerId: string;
  type:       CreditTxType;
  amount:     number;
  note:       string;
  date:       string;
}

const INITIAL_CUSTOMERS: Customer[] = [
  { id: "C1", name: "Ramesh Gupta",    phone: "+91 98001 11001", email: "ramesh@gmail.com",   address: "Whitefield, Bengaluru",  joinedDate: "2024-01-10", totalPurchases: 84500,  creditBalance: 3200  },
  { id: "C2", name: "Sunita Verma",    phone: "+91 98001 11002", email: "sunita@gmail.com",   address: "Koramangala, Bengaluru", joinedDate: "2024-03-22", totalPurchases: 52300,  creditBalance: 0     },
  { id: "C3", name: "Ajay Sharma",     phone: "+91 98001 11003", email: "ajay@outlook.com",   address: "JP Nagar, Bengaluru",    joinedDate: "2024-05-15", totalPurchases: 31800,  creditBalance: 8500  },
  { id: "C4", name: "Pooja Nair",      phone: "+91 98001 11004", email: "pooja@gmail.com",    address: "HSR Layout, Bengaluru",  joinedDate: "2024-06-01", totalPurchases: 128000, creditBalance: 0     },
  { id: "C5", name: "Vikram Singh",    phone: "+91 98001 11005", email: "vikram@gmail.com",   address: "Marathahalli, Bengaluru",joinedDate: "2024-07-19", totalPurchases: 19200,  creditBalance: 1500  },
  { id: "C6", name: "Meera Iyer",      phone: "+91 98001 11006", email: "meera@gmail.com",    address: "Jayanagar, Bengaluru",   joinedDate: "2024-08-05", totalPurchases: 67400,  creditBalance: 4800  },
  { id: "C7", name: "Deepak Joshi",    phone: "+91 98001 11007", email: "deepak@gmail.com",   address: "BTM Layout, Bengaluru",  joinedDate: "2024-09-12", totalPurchases: 23100,  creditBalance: 0     },
  { id: "C8", name: "Kavitha Rao",     phone: "+91 98001 11008", email: "kavitha@gmail.com",  address: "Electronic City",        joinedDate: "2024-10-30", totalPurchases: 41600,  creditBalance: 11000 },
];

const INITIAL_CREDIT_TX: CreditTransaction[] = [
  { id: "CT1",  customerId: "C1", type: "sale",    amount: 5000,  note: "Rice & grocery items",   date: "2026-03-15" },
  { id: "CT2",  customerId: "C1", type: "payment", amount: 2000,  note: "Partial payment",         date: "2026-03-22" },
  { id: "CT3",  customerId: "C1", type: "sale",    amount: 1800,  note: "Daily items",             date: "2026-04-02" },
  { id: "CT4",  customerId: "C1", type: "payment", amount: 1600,  note: "Cash payment",            date: "2026-04-10" },
  { id: "CT5",  customerId: "C3", type: "sale",    amount: 12000, note: "Bulk spices order",       date: "2026-02-20" },
  { id: "CT6",  customerId: "C3", type: "payment", amount: 4000,  note: "UPI payment",             date: "2026-03-01" },
  { id: "CT7",  customerId: "C3", type: "sale",    amount: 3000,  note: "Dry fruits",              date: "2026-03-18" },
  { id: "CT8",  customerId: "C3", type: "payment", amount: 2500,  note: "Cash",                    date: "2026-04-05" },
  { id: "CT9",  customerId: "C5", type: "sale",    amount: 2500,  note: "Tea & biscuits",          date: "2026-04-01" },
  { id: "CT10", customerId: "C5", type: "payment", amount: 1000,  note: "Part payment",            date: "2026-04-08" },
  { id: "CT11", customerId: "C6", type: "sale",    amount: 7000,  note: "Home items",              date: "2026-03-10" },
  { id: "CT12", customerId: "C6", type: "payment", amount: 3000,  note: "Online transfer",         date: "2026-03-25" },
  { id: "CT13", customerId: "C6", type: "sale",    amount: 1800,  note: "Assorted grocery",        date: "2026-04-07" },
  { id: "CT14", customerId: "C8", type: "sale",    amount: 18000, note: "Monthly order",           date: "2026-02-15" },
  { id: "CT15", customerId: "C8", type: "payment", amount: 8000,  note: "Cheque cleared",          date: "2026-03-05" },
  { id: "CT16", customerId: "C8", type: "sale",    amount: 3000,  note: "Extra items",             date: "2026-04-01" },
  { id: "CT17", customerId: "C8", type: "payment", amount: 2000,  note: "UPI",                     date: "2026-04-11" },
];

let _customers: Customer[] = [...INITIAL_CUSTOMERS];
let _credit: CreditTransaction[] = [...INITIAL_CREDIT_TX];
let _listeners: Array<() => void> = [];
function notify() { _listeners.forEach(fn => fn()); }

export function getCustomers(): Customer[] { return _customers; }
export function getCustomer(id: string): Customer | undefined { return _customers.find(c => c.id === id); }
export function getCreditTransactions(customerId: string): CreditTransaction[] {
  return _credit.filter(t => t.customerId === customerId).sort((a, b) => b.date.localeCompare(a.date));
}
export function getAllCreditBalances(): Customer[] {
  return _customers.filter(c => c.creditBalance > 0).sort((a, b) => b.creditBalance - a.creditBalance);
}
export function addCustomer(c: Omit<Customer, "id" | "joinedDate" | "totalPurchases" | "creditBalance">): Customer {
  const n: Customer = { ...c, id: "C" + Date.now(), joinedDate: new Date().toISOString().split("T")[0], totalPurchases: 0, creditBalance: 0 };
  _customers = [n, ..._customers];
  notify();
  return n;
}
export function addCreditTransaction(t: Omit<CreditTransaction, "id">): void {
  const tx: CreditTransaction = { ...t, id: "CT" + Date.now() };
  _credit = [tx, ..._credit];
  _customers = _customers.map(c => {
    if (c.id !== t.customerId) return c;
    const delta = t.type === "sale" ? t.amount : -t.amount;
    return { ...c, creditBalance: Math.max(0, c.creditBalance + delta), totalPurchases: t.type === "sale" ? c.totalPurchases + t.amount : c.totalPurchases };
  });
  notify();
}
export function subscribeCustomers(fn: () => void) {
  _listeners.push(fn);
  return () => { _listeners = _listeners.filter(l => l !== fn); };
}
export function getTotalOutstanding(): number { return _customers.reduce((s, c) => s + c.creditBalance, 0); }
