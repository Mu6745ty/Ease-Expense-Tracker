"use client";

import { PeriodPreset } from "@/lib/analysis";

const ALL_PRESETS: { value: PeriodPreset; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "thisWeek", label: "This week" },
  { value: "thisMonth", label: "This month" },
  { value: "lastMonth", label: "Last month" },
  { value: "last7", label: "Last 7d" },
  { value: "last30", label: "Last 30d" },
  { value: "last90", label: "Last 90d" },
  { value: "ytd", label: "YTD" },
  { value: "allTime", label: "All time" },
  { value: "custom", label: "Custom…" },
];

interface Props {
  value: PeriodPreset;
  onChange: (preset: PeriodPreset) => void;
}

export function PeriodChips({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {ALL_PRESETS.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
              active
                ? "bg-primary-600 text-white shadow-sm dark:bg-primary-500"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}