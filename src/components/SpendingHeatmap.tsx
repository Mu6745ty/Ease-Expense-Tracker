"use client";

import { useMemo } from "react";
import { Expense } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import { formatDate } from "@/lib/format";

interface Props {
  expenses: Expense[];
  year?: number;
  onDayClick?: (ymd: string) => void;
}

interface Day {
  date: string;
  total: number;
  count: number;
  inYear: boolean;
  inFuture: boolean;
}

function ymd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function SpendingHeatmap({ expenses, year, onDayClick }: Props) {
  const targetYear = year ?? new Date().getFullYear();
  const today = new Date();
  const todayKey = ymd(today);

  const { weeks, monthLabels, max, total } = useMemo(() => {
    // Build all 365/366 days for the target year, aligned by week (Sun-start).
    const jan1 = new Date(targetYear, 0, 1);
    const dec31 = new Date(targetYear, 11, 31);
    // Walk back to the previous Sunday
    const gridStart = new Date(jan1);
    gridStart.setDate(jan1.getDate() - jan1.getDay());
    // Walk forward to the next Saturday
    const gridEnd = new Date(dec31);
    gridEnd.setDate(dec31.getDate() + (6 - dec31.getDay()));

    const days: Day[] = [];
    const cursor = new Date(gridStart);
    while (cursor <= gridEnd) {
      const key = ymd(cursor);
      const inYear = cursor.getFullYear() === targetYear;
      const inFuture = key > todayKey;
      days.push({ date: key, total: 0, count: 0, inYear, inFuture });
      cursor.setDate(cursor.getDate() + 1);
    }
    for (const e of expenses) {
      const d = days.find((x) => x.date === e.date);
      if (d) {
        d.total += e.amount;
        d.count += 1;
      }
    }
    // Group into columns of 7
    const weekCols: Day[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      weekCols.push(days.slice(i, i + 7));
    }
    // Month labels: for each week column, find first day in that column whose month is new
    const labels: { col: number; label: string }[] = [];
    let lastMonth = -1;
    weekCols.forEach((week, idx) => {
      const firstOfMonth = week.find((d) => {
        const dDate = new Date(d.date);
        return dDate.getDate() <= 7 && dDate.getMonth() !== lastMonth;
      });
      if (firstOfMonth) {
        const dDate = new Date(firstOfMonth.date);
        if (dDate.getMonth() !== lastMonth) {
          labels.push({
            col: idx,
            label: dDate.toLocaleDateString("en-US", { month: "short" }),
          });
          lastMonth = dDate.getMonth();
        }
      }
    });
    const maxVal = days.reduce((m, d) => Math.max(m, d.total), 0);
    const totalVal = days.reduce((s, d) => s + d.total, 0);
    return { weeks: weekCols, monthLabels: labels, max: maxVal, total: totalVal };
  }, [expenses, targetYear, todayKey]);

  function intensity(total: number): number {
    if (max === 0) return 0;
    if (total === 0) return 0;
    const ratio = total / max;
    if (ratio > 0.75) return 4;
    if (ratio > 0.5) return 3;
    if (ratio > 0.25) return 2;
    return 1;
  }

  const intensityClass = [
    "bg-slate-100 dark:bg-slate-800",
    "bg-emerald-100 dark:bg-emerald-900/40",
    "bg-emerald-300 dark:bg-emerald-700",
    "bg-emerald-500 dark:bg-emerald-500",
    "bg-emerald-700 dark:bg-emerald-300",
  ];

  return (
    <div className="overflow-x-auto">
      <div className="inline-flex flex-col gap-1">
        <div className="flex gap-1 pl-6 text-[10px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
          {weeks.map((_, idx) => {
            const label = monthLabels.find((l) => l.col === idx);
            return (
              <div key={idx} className="w-3">
                {label?.label ?? ""}
              </div>
            );
          })}
        </div>
        <div className="flex gap-1">
          <div className="flex flex-col gap-1 pr-2 text-[10px] font-medium text-slate-400 dark:text-slate-500">
            <span className="h-3" />
            <span className="h-3 leading-3">Mon</span>
            <span className="h-3" />
            <span className="h-3 leading-3">Wed</span>
            <span className="h-3" />
            <span className="h-3 leading-3">Fri</span>
            <span className="h-3" />
          </div>
          {weeks.map((week, idx) => (
            <div key={idx} className="flex flex-col gap-1">
              {week.map((day) => {
                const cls = !day.inYear
                  ? "bg-transparent"
                  : day.inFuture
                  ? "bg-slate-50 dark:bg-slate-900"
                  : intensityClass[intensity(day.total)];
                return (
                  <button
                    key={day.date}
                    type="button"
                    disabled={!day.inYear || day.inFuture || !onDayClick}
                    onClick={() => onDayClick?.(day.date)}
                    title={
                      day.inYear && !day.inFuture
                        ? `${formatDate(day.date)} · ${formatCurrency(
                            day.total
                          )} · ${day.count} ${
                            day.count === 1 ? "item" : "items"
                          }`
                        : day.date
                    }
                    className={`h-3 w-3 rounded-[3px] transition ${cls} ${
                      onDayClick && day.inYear && !day.inFuture
                        ? "hover:ring-1 hover:ring-primary-500"
                        : ""
                    }`}
                    aria-label={
                      day.inYear
                        ? `${formatDate(day.date)}: ${formatCurrency(day.total)}`
                        : day.date
                    }
                  />
                );
              })}
            </div>
          ))}
        </div>
        <div className="mt-2 flex items-center gap-2 pl-6 text-[11px] text-slate-500 dark:text-slate-400">
          <span>Less</span>
          {intensityClass.map((c, i) => (
            <span key={i} className={`h-3 w-3 rounded-[3px] ${c}`} />
          ))}
          <span>More</span>
          <span className="ml-3 font-medium text-slate-700 dark:text-slate-200">
            {targetYear} total: {formatCurrency(total)}
          </span>
        </div>
      </div>
    </div>
  );
}