"use client";

import { CATEGORY_META, Expense } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/format";
import { Pencil, Sparkles, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface Props {
  expense: Expense;
  onDelete: (id: string) => void;
  anomalyRatio?: number;
}

export function ExpenseRow({ expense, onDelete, anomalyRatio }: Props) {
  const [confirming, setConfirming] = useState(false);
  const meta = CATEGORY_META[expense.category];
  const isAnomaly = anomalyRatio != null && anomalyRatio > 1.0;

  return (
    <li className="group flex items-center gap-3 border-b border-slate-100 px-4 py-3 last:border-b-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50 sm:px-5">
      <div
        className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-lg ${meta.bgClass} dark:opacity-90`}
        aria-hidden
      >
        {meta.icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
            {expense.description || (
              <span className="text-slate-400 dark:text-slate-500">
                No description
              </span>
            )}
          </p>
          {isAnomaly && (
            <span
              title={`Unusually high for ${meta.name}`}
              className="inline-flex items-center gap-0.5 rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
            >
              <Sparkles className="h-2.5 w-2.5" />
              Unusual
            </span>
          )}
        </div>
        <p className="mt-0.5 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className={`font-medium ${meta.textClass}`}>{meta.name}</span>
          <span className="text-slate-300 dark:text-slate-600">·</span>
          <span>{formatDate(expense.date)}</span>
        </p>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold tabular-nums text-slate-900 dark:text-slate-100">
          {formatCurrency(expense.amount)}
        </p>
      </div>
      <div className="ml-2 flex items-center gap-1">
        <Link
          href={`/expenses/${expense.id}/edit`}
          aria-label="Edit expense"
          className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          <Pencil className="h-4 w-4" />
        </Link>
        {confirming ? (
          <button
            type="button"
            onClick={() => onDelete(expense.id)}
            className="rounded-md bg-red-600 px-2 py-1 text-xs font-semibold text-white hover:bg-red-700"
          >
            Confirm
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            aria-label="Delete expense"
            className="rounded-md p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-300"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </li>
  );
}