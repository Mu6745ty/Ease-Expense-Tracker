"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ExpenseForm } from "@/components/ExpenseForm";
import { useExpensesContext } from "@/components/ExpensesProvider";
import { Expense } from "@/lib/types";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";

export default function EditExpensePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { expenses, hydrated } = useExpensesContext();
  const [expense, setExpense] = useState<Expense | null | "loading">(null);

  useEffect(() => {
    if (!hydrated) return;
    const found = expenses.find((e) => e.id === params.id) ?? null;
    setExpense(found);
  }, [hydrated, expenses, params.id]);

  if (expense === "loading" || !hydrated) {
    return (
      <Card className="mx-auto max-w-xl">
        <div className="h-6 w-32 animate-pulse rounded bg-slate-200" />
        <div className="mt-4 h-10 w-full animate-pulse rounded bg-slate-100" />
        <div className="mt-2 h-10 w-full animate-pulse rounded bg-slate-100" />
        <div className="mt-2 h-10 w-full animate-pulse rounded bg-slate-100" />
      </Card>
    );
  }

  if (expense === null) {
    return (
      <Card className="mx-auto max-w-xl text-center">
        <h1 className="text-lg font-semibold text-slate-900">
          Expense not found
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          It may have been deleted, or the link is incorrect.
        </p>
        <div className="mt-4">
          <Link href="/expenses">
            <Button>Back to expenses</Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <ExpenseForm
      mode="edit"
      expenseId={expense.id}
      initial={{
        date: expense.date,
        amount: expense.amount,
        category: expense.category,
        description: expense.description,
      }}
    />
  );
}
