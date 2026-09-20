"use client";

import { RecurringItem } from "@/lib/analysis";
import { CATEGORY_META } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/format";
import { Repeat } from "lucide-react";

interface Props {
  items: RecurringItem[];
  onFilterByRecurring?: (key: string) => void;
}

export function RecurringPanel({ items, onFilterByRecurring }: Props) {
  const monthlyTotal = items.reduce((s, i) => s + i.monthlyCost, 0);
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Recurring & subscriptions
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Detected from your history. Click to filter.
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Estimated monthly
          </p>
          <p className="text-lg font-semibold tabular-nums text-slate-900 dark:text-slate-100">
            {formatCurrency(monthlyTotal)}
          </p>
        </div>
      </div>
      {items.length === 0 ? (
        <p className="mt-4 rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
          Add a few expenses with similar descriptions over time and recurring
          charges will appear here.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
          {items.map((it) => {
            const meta = CATEGORY_META[it.category];
            return (
              <li key={it.key} className="py-3">
                <button
                  type="button"
                  onClick={() => onFilterByRecurring?.(it.display)}
                  className="flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/60"
                >
                  <span
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${meta.bgClass} dark:opacity-90`}
                    aria-hidden
                  >
                    {meta.icon}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {it.display}
                      </span>
                      <span className="inline-flex items-center gap-0.5 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        <Repeat className="h-2.5 w-2.5" />
                        every ~{it.cadenceDays}d
                      </span>
                    </span>
                    <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">
                      {it.occurrences} occurrences · last on{" "}
                      {formatDate(it.dates[0])}
                    </span>
                  </span>
                  <span className="text-right">
                    <span className="block text-sm font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                      {formatCurrency(it.amount)}
                    </span>
                    <span className="block text-xs text-slate-500 dark:text-slate-400">
                      ~{formatCurrency(it.monthlyCost)}/mo
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}