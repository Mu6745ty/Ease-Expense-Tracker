"use client";

import { Expense, ExpenseInput } from "@/lib/types";
import { useExpenses } from "@/lib/useExpenses";
import { createContext, useContext } from "react";

interface ExpensesContextValue {
  expenses: Expense[];
  hydrated: boolean;
  addExpense: (input: ExpenseInput) => Expense;
  updateExpense: (id: string, patch: ExpenseInput) => Expense | null;
  deleteExpense: (id: string) => void;
  replaceAll: (next: Expense[]) => void;
}

const ExpensesContext = createContext<ExpensesContextValue | null>(null);

export function ExpensesProvider({ children }: { children: React.ReactNode }) {
  const value = useExpenses();
  return (
    <ExpensesContext.Provider value={value}>{children}</ExpensesContext.Provider>
  );
}

export function useExpensesContext(): ExpensesContextValue {
  const ctx = useContext(ExpensesContext);
  if (!ctx) {
    throw new Error("useExpensesContext must be used within ExpensesProvider");
  }
  return ctx;
}
