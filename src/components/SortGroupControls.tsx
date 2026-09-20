"use client";

import { GroupKey, SortKey } from "@/lib/analysis";

interface Props {
  sort: SortKey;
  group: GroupKey;
  onSortChange: (s: SortKey) => void;
  onGroupChange: (g: GroupKey) => void;
}

const sortOptions: { value: SortKey; label: string }[] = [
  { value: "date-desc", label: "Newest first" },
  { value: "date-asc", label: "Oldest first" },
  { value: "amount-desc", label: "Amount: high to low" },
  { value: "amount-asc", label: "Amount: low to high" },
  { value: "category", label: "Category" },
];

const groupOptions: { value: GroupKey; label: string }[] = [
  { value: "none", label: "No grouping" },
  { value: "day", label: "By day" },
  { value: "week", label: "By week" },
  { value: "month", label: "By month" },
  { value: "category", label: "By category" },
];

export function SortGroupControls({
  sort,
  group,
  onSortChange,
  onGroupChange,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      <label className="flex items-center gap-2">
        <span className="text-slate-500 dark:text-slate-400">Sort</span>
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value as SortKey)}
          className="rounded-md border border-slate-200 bg-white px-2 py-1 text-sm text-slate-800 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-primary-400 dark:focus:ring-primary-900"
        >
          {sortOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-2">
        <span className="text-slate-500 dark:text-slate-400">Group</span>
        <select
          value={group}
          onChange={(e) => onGroupChange(e.target.value as GroupKey)}
          className="rounded-md border border-slate-200 bg-white px-2 py-1 text-sm text-slate-800 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-primary-400 dark:focus:ring-primary-900"
        >
          {groupOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}