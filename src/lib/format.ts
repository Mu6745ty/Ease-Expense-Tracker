import { Expense, ExpenseFilters } from "./types";

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export function formatDate(iso: string): string {
  // iso is yyyy-MM-dd; render as a friendly long date in local time.
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, (m ?? 1) - 1, d ?? 1);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function todayIso(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function monthKey(iso: string): string {
  return iso.slice(0, 7); // yyyy-MM
}

export function currentMonthKey(): string {
  return todayIso().slice(0, 7);
}

export function isInMonth(iso: string, ym: string): boolean {
  return iso.slice(0, 7) === ym;
}

export function isInRange(
  iso: string,
  start?: string,
  end?: string
): boolean {
  if (start && iso < start) return false;
  if (end && iso > end) return false;
  return true;
}

export function applyFilters(
  expenses: Expense[],
  filters: ExpenseFilters
): Expense[] {
  const term = filters.search?.trim().toLowerCase() ?? "";
  return expenses.filter((e) => {
    if (
      filters.category &&
      filters.category !== "All" &&
      e.category !== filters.category
    )
      return false;
    if (!isInRange(e.date, filters.startDate, filters.endDate)) return false;
    if (term && !e.description.toLowerCase().includes(term)) return false;
    return true;
  });
}

export function totalAmount(expenses: Expense[]): number {
  return expenses.reduce((sum, e) => sum + e.amount, 0);
}

export interface CategoryTotal {
  category: Expense["category"];
  total: number;
  count: number;
}

export function totalsByCategory(expenses: Expense[]): CategoryTotal[] {
  const map = new Map<Expense["category"], CategoryTotal>();
  for (const e of expenses) {
    const existing = map.get(e.category);
    if (existing) {
      existing.total += e.amount;
      existing.count += 1;
    } else {
      map.set(e.category, {
        category: e.category,
        total: e.amount,
        count: 1,
      });
    }
  }
  return Array.from(map.values()).sort((a, b) => b.total - a.total);
}

export interface DailyTotal {
  date: string; // yyyy-MM-dd
  total: number;
}

export function dailyTotals(
  expenses: Expense[],
  days = 14
): DailyTotal[] {
  // Build a continuous date range ending today.
  const result: DailyTotal[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const ymd = d.toISOString().slice(0, 10);
    const dayExpenses = expenses.filter((e) => e.date === ymd);
    result.push({
      date: ymd,
      total: dayExpenses.reduce((s, e) => s + e.amount, 0),
    });
  }
  return result;
}
