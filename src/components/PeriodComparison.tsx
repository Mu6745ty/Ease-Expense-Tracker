"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import { formatCurrency } from "@/lib/format";

interface Props {
  current: number;
  previous: number;
  currentLabel: string;
  previousLabel: string;
}

export function PeriodComparison({
  current,
  previous,
  currentLabel,
  previousLabel,
}: Props) {
  const diff = current - previous;
  const pct =
    previous > 0 ? (diff / previous) * 100 : current > 0 ? 100 : 0;
  const direction: "up" | "down" = diff === 0 ? "up" : diff > 0 ? "up" : "down";
  // Spending going up is "bad" for the user, so we set positiveIsUp=false
  const positive = diff <= 0;
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div>
        <p className="text-xs text-slate-500 dark:text-slate-400">{currentLabel}</p>
        <p className="text-base font-semibold tabular-nums text-slate-900 dark:text-slate-100">
          {formatCurrency(current)}
        </p>
      </div>
      <span className="text-slate-300 dark:text-slate-600">vs</span>
      <div>
        <p className="text-xs text-slate-500 dark:text-slate-400">{previousLabel}</p>
        <p className="text-base font-semibold tabular-nums text-slate-900 dark:text-slate-100">
          {formatCurrency(previous)}
        </p>
      </div>
      <div
        className={`ml-auto inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold ${
          positive
            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
            : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300"
        }`}
      >
        {direction === "up" ? (
          <ArrowUp className="h-3 w-3" />
        ) : (
          <ArrowDown className="h-3 w-3" />
        )}
        {previous === 0
          ? current > 0
            ? "new spending"
            : "no change"
          : `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`}
      </div>
    </div>
  );
}