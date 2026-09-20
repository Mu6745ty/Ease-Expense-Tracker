export type Category =
  | "Food"
  | "Transportation"
  | "Entertainment"
  | "Shopping"
  | "Bills"
  | "Other";

export const CATEGORIES: Category[] = [
  "Food",
  "Transportation",
  "Entertainment",
  "Shopping",
  "Bills",
  "Other",
];

export interface CategoryMeta {
  name: Category;
  color: string; // tailwind text/bg class
  bgClass: string;
  textClass: string;
  ringClass: string;
  icon: string; // emoji or short label
}

export const CATEGORY_META: Record<Category, CategoryMeta> = {
  Food: {
    name: "Food",
    color: "#f97316",
    bgClass: "bg-orange-100",
    textClass: "text-orange-700",
    ringClass: "ring-orange-200",
    icon: "🍔",
  },
  Transportation: {
    name: "Transportation",
    color: "#3b82f6",
    bgClass: "bg-blue-100",
    textClass: "text-blue-700",
    ringClass: "ring-blue-200",
    icon: "🚗",
  },
  Entertainment: {
    name: "Entertainment",
    color: "#a855f7",
    bgClass: "bg-purple-100",
    textClass: "text-purple-700",
    ringClass: "ring-purple-200",
    icon: "🎬",
  },
  Shopping: {
    name: "Shopping",
    color: "#ec4899",
    bgClass: "bg-pink-100",
    textClass: "text-pink-700",
    ringClass: "ring-pink-200",
    icon: "🛍️",
  },
  Bills: {
    name: "Bills",
    color: "#ef4444",
    bgClass: "bg-red-100",
    textClass: "text-red-700",
    ringClass: "ring-red-200",
    icon: "💡",
  },
  Other: {
    name: "Other",
    color: "#64748b",
    bgClass: "bg-slate-100",
    textClass: "text-slate-700",
    ringClass: "ring-slate-200",
    icon: "📦",
  },
};

export interface Expense {
  id: string;
  date: string; // ISO yyyy-MM-dd
  amount: number;
  category: Category;
  description: string;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

export type ExpenseInput = Omit<
  Expense,
  "id" | "createdAt" | "updatedAt"
>;

export interface ExpenseFilters {
  startDate?: string;
  endDate?: string;
  category?: Category | "All";
  search?: string;
}
