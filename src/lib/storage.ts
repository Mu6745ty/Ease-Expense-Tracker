import { Category, CATEGORIES, Expense, ExpenseInput } from "./types";

const STORAGE_KEY = "expense-tracker:expenses:v1";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function uuid(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  // Fallback
  return (
    "id-" +
    Date.now().toString(36) +
    "-" +
    Math.random().toString(36).slice(2, 10)
  );
}

function nowIso(): string {
  return new Date().toISOString();
}

export function loadExpenses(): Expense[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Expense[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (err) {
    console.error("Failed to load expenses", err);
    return [];
  }
}

export function saveExpenses(expenses: Expense[]): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  } catch (err) {
    console.error("Failed to save expenses", err);
  }
}

export function addExpense(input: ExpenseInput): Expense {
  const expenses = loadExpenses();
  const expense: Expense = {
    id: uuid(),
    createdAt: nowIso(),
    updatedAt: nowIso(),
    ...input,
  };
  const next = [expense, ...expenses];
  saveExpenses(next);
  return expense;
}

export function updateExpense(
  id: string,
  patch: Partial<ExpenseInput>
): Expense | null {
  const expenses = loadExpenses();
  const idx = expenses.findIndex((e) => e.id === id);
  if (idx === -1) return null;
  const updated: Expense = {
    ...expenses[idx],
    ...patch,
    updatedAt: nowIso(),
  };
  expenses[idx] = updated;
  saveExpenses(expenses);
  return updated;
}

export function deleteExpense(id: string): void {
  const expenses = loadExpenses().filter((e) => e.id !== id);
  saveExpenses(expenses);
}

export function getExpense(id: string): Expense | undefined {
  return loadExpenses().find((e) => e.id === id);
}

export function clearAllExpenses(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(STORAGE_KEY);
}

export function isCategory(value: string): value is Category {
  return (CATEGORIES as string[]).includes(value);
}