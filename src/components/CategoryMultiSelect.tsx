"use client";

import { CATEGORY_META, Category } from "@/lib/types";

interface Props {
  selected: Set<Category>;
  onToggle: (cat: Category) => void;
  onClear: () => void;
}

export function CategoryMultiSelect({ selected, onToggle, onClear }: Props) {
  const categories = Object.keys(CATEGORY_META) as Category[];
  return (
    <div className="flex flex-wrap items-center gap-2">
      {categories.map((cat) => {
        const meta = CATEGORY_META[cat];
        const isSelected = selected.has(cat);
        return (
          <button
            key={cat}
            type="button"
            onClick={() => onToggle(cat)}
            aria-pressed={isSelected}
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition ${
              isSelected
                ? `${meta.bgClass} ${meta.textClass} border-transparent ring-2 ring-offset-1 ${meta.ringClass} dark:ring-offset-slate-900`
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            <span aria-hidden>{meta.icon}</span>
            {meta.name}
          </button>
        );
      })}
      {selected.size > 0 && (
        <button
          type="button"
          onClick={onClear}
          className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
        >
          Clear
        </button>
      )}
    </div>
  );
}