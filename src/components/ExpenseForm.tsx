"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Field, Select, TextArea, TextInput } from "@/components/FormControls";
import { Toast, useToast } from "@/components/Toast";
import { useExpensesContext } from "@/components/ExpensesProvider";
import { CATEGORIES, Category, ExpenseInput } from "@/lib/types";
import { todayIso } from "@/lib/format";

interface FormState {
  date: string;
  amount: string;
  category: Category;
  description: string;
}

const empty: FormState = {
  date: "",
  amount: "",
  category: "Food",
  description: "",
};

interface ExpenseFormProps {
  initial?: Partial<ExpenseInput>;
  mode: "create" | "edit";
  expenseId?: string;
}

export function ExpenseForm({ initial, mode, expenseId }: ExpenseFormProps) {
  const router = useRouter();
  const { addExpense, updateExpense } = useExpensesContext();
  const { toast, showToast, closeToast } = useToast();

  const seed: FormState = useMemo(
    () => ({
      date: initial?.date ?? todayIso(),
      amount: initial?.amount != null ? String(initial.amount) : "",
      category: initial?.category ?? "Food",
      description: initial?.description ?? "",
    }),
    [initial]
  );

  const [form, setForm] = useState<FormState>(seed);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(state: FormState) {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!state.date) e.date = "Date is required";
    else if (state.date > todayIso()) e.date = "Date can't be in the future";
    const amountNum = Number(state.amount);
    if (!state.amount || Number.isNaN(amountNum)) e.amount = "Amount is required";
    else if (amountNum <= 0) e.amount = "Amount must be greater than zero";
    else if (amountNum > 1_000_000) e.amount = "Amount seems too large";
    if (state.description.length > 200)
      e.description = "Description must be 200 characters or fewer";
    return e;
  }

  function onSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const v = validate(form);
    setErrors(v);
    if (Object.values(v).some(Boolean)) return;

    setSubmitting(true);
    const payload: ExpenseInput = {
      date: form.date,
      amount: Number(Number(form.amount).toFixed(2)),
      category: form.category,
      description: form.description.trim(),
    };

    // Defer to next tick to surface submitting state visually.
    window.setTimeout(() => {
      if (mode === "create") {
        addExpense(payload);
        showToast("Expense added");
      } else if (mode === "edit" && expenseId) {
        updateExpense(expenseId, payload);
        showToast("Expense updated");
      }
      router.push("/expenses");
    }, 150);
  }

  return (
    <>
      <div className="mb-4">
        <Link
          href="/expenses"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to expenses
        </Link>
      </div>
      <Card className="mx-auto max-w-xl">
        <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          {mode === "create" ? "Add expense" : "Edit expense"}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {mode === "create"
            ? "Record a new transaction. All fields except description are required."
            : "Update the details of this transaction."}
        </p>
        <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
          <Field label="Date" htmlFor="date" error={errors.date}>
            <TextInput
              id="date"
              type="date"
              value={form.date}
              max={todayIso()}
              onChange={(e) => setField("date", e.target.value)}
            />
          </Field>
          <Field
            label="Amount"
            htmlFor="amount"
            error={errors.amount}
            hint="Enter a positive number, e.g. 12.50"
          >
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400 dark:text-slate-500">
                $
              </span>
              <TextInput
                id="amount"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={form.amount}
                onChange={(e) => setField("amount", e.target.value)}
                className="pl-7"
              />
            </div>
          </Field>
          <Field label="Category" htmlFor="category" error={errors.category}>
            <Select
              id="category"
              value={form.category}
              onChange={(e) => setField("category", e.target.value as Category)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </Field>
          <Field
            label="Description"
            htmlFor="description"
            error={errors.description}
            hint={`${form.description.length}/200`}
          >
            <TextArea
              id="description"
              placeholder="What was this expense for?"
              value={form.description}
              maxLength={200}
              onChange={(e) => setField("description", e.target.value)}
            />
          </Field>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Link href="/expenses">
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={submitting}>
              {submitting
                ? mode === "create"
                  ? "Adding…"
                  : "Saving…"
                : mode === "create"
                ? "Add expense"
                : "Save changes"}
            </Button>
          </div>
        </form>
      </Card>
      {toast && <Toast message={toast} onClose={closeToast} />}
    </>
  );
}
