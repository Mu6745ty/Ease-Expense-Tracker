"use client";

import { Expense } from "./types";
import {
  loadExpenses,
  saveExpenses,
  addExpense as addExpenseToStorage,
  updateExpense as updateExpenseInStorage,
  deleteExpense as deleteExpenseInStorage,
} from "./storage";
import { useCallback, useEffect, useState } from "react";

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount.
  useEffect(() => {
    setExpenses(loadExpenses());
    setHydrated(true);
  }, []);

  // Cross-tab sync.
  useEffect(() => {
    function onStorage(event: StorageEvent) {
      if (event.key && event.key.startsWith("expense-tracker")) {
        setExpenses(loadExpenses());
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const addExpense = useCallback((input: Expense["date"] extends never ? never : import("./types").ExpenseInput) => {
    const created = addExpenseToStorage(input);
    setExpenses(loadExpenses());
    return created;
  }, []);

  const updateExpense = useCallback(
    (id: string, patch: import("./types").ExpenseInput) => {
      const updated = updateExpenseInStorage(id, patch);
      setExpenses(loadExpenses());
      return updated;
    },
    []
  );

  const deleteExpense = useCallback((id: string) => {
    deleteExpenseInStorage(id);
    setExpenses(loadExpenses());
  }, []);

  const replaceAll = useCallback((next: Expense[]) => {
    saveExpenses(next);
    setExpenses(next);
  }, []);

  return {
    expenses,
    hydrated,
    addExpense,
    updateExpense,
    deleteExpense,
    replaceAll,
  };
}
