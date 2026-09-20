"use client";

import { ArrowDownRight, ArrowUpRight, LucideIcon } from "lucide-react";
import { Card } from "./Card";

interface SummaryCardProps {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  trend?: { value: string; direction: "up" | "down"; positiveIsUp?: boolean };
  accent?: "primary" | "success" | "warning" | "info";
}

const accentMap: Record<NonNullable<SummaryCardProps["accent"]>, string> = {
  primary: "bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-200",
  success: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  warning: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  info: "bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300",
};

export function SummaryCard({
  label,
  value,
  hint,
  icon: Icon,
  trend,
  accent = "primary",
}: SummaryCardProps) {
  return (
    <Card className="flex h-full flex-col justify-between">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {label}
        </p>
        <span
          className={`grid h-9 w-9 place-items-center rounded-lg ${accentMap[accent]}`}
        >
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div className="mt-4">
        <p className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          {value}
        </p>
        <div className="mt-1 flex items-center gap-2 text-xs">
          {trend && (
            <span
              className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-semibold ${
                (trend.direction === "up" && trend.positiveIsUp) ||
                (trend.direction === "down" && !trend.positiveIsUp)
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                  : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300"
              }`}
            >
              {trend.direction === "up" ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {trend.value}
            </span>
          )}
          {hint && (
            <span className="text-slate-500 dark:text-slate-400">{hint}</span>
          )}
        </div>
      </div>
    </Card>
  );
}