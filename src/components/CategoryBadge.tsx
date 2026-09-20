"use client";

import { CATEGORY_META, Category } from "@/lib/types";

export function CategoryBadge({
  category,
  size = "md",
}: {
  category: Category;
  size?: "sm" | "md";
}) {
  const meta = CATEGORY_META[category];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${meta.bgClass} ${meta.textClass} dark:opacity-90 ${
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs"
      }`}
    >
      <span aria-hidden className={size === "sm" ? "text-sm" : "text-sm"}>
        {meta.icon}
      </span>
      {meta.name}
    </span>
  );
}