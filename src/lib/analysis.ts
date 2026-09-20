import { Expense } from "./types";

export type PeriodPreset =
  | "today"
  | "thisWeek"
  | "thisMonth"
  | "lastMonth"
  | "last7"
  | "last30"
  | "last90"
  | "ytd"
  | "allTime"
  | "custom";

export interface DateRange {
  startDate?: string; // inclusive yyyy-MM-dd
  endDate?: string; // inclusive yyyy-MM-dd
  label: string;
}

function ymd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

export function rangeForPreset(preset: PeriodPreset): DateRange {
  const now = new Date();
  const today = startOfDay(now);

  switch (preset) {
    case "today":
      return { startDate: ymd(today), endDate: ymd(today), label: "Today" };
    case "thisWeek": {
      const dow = today.getDay(); // 0=Sun
      const mondayOffset = (dow + 6) % 7; // shift so Mon=0
      const start = new Date(today);
      start.setDate(today.getDate() - mondayOffset);
      return { startDate: ymd(start), endDate: ymd(today), label: "This week" };
    }
    case "thisMonth": {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      return { startDate: ymd(start), endDate: ymd(today), label: "This month" };
    }
    case "lastMonth": {
      const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const end = new Date(today.getFullYear(), today.getMonth(), 0);
      return { startDate: ymd(start), endDate: ymd(end), label: "Last month" };
    }
    case "last7": {
      const start = new Date(today);
      start.setDate(today.getDate() - 6);
      return { startDate: ymd(start), endDate: ymd(today), label: "Last 7 days" };
    }
    case "last30": {
      const start = new Date(today);
      start.setDate(today.getDate() - 29);
      return { startDate: ymd(start), endDate: ymd(today), label: "Last 30 days" };
    }
    case "last90": {
      const start = new Date(today);
      start.setDate(today.getDate() - 89);
      return { startDate: ymd(start), endDate: ymd(today), label: "Last 90 days" };
    }
    case "ytd": {
      const start = new Date(today.getFullYear(), 0, 1);
      return { startDate: ymd(start), endDate: ymd(today), label: "Year to date" };
    }
    case "allTime":
    default:
      return { label: "All time" };
  }
}

export function shiftRangeByOnePeriod(
  range: DateRange,
  preset: PeriodPreset
): DateRange {
  if (!range.startDate || !range.endDate) return range;
  const start = new Date(range.startDate);
  const end = new Date(range.endDate);
  const days = Math.round(
    (endOfDay(end).getTime() - startOfDay(start).getTime()) / 86400000
  );

  let prevStart: Date;
  let prevEnd: Date;
  switch (preset) {
    case "today": {
      prevStart = new Date(start);
      prevStart.setDate(start.getDate() - 1);
      prevEnd = prevStart;
      break;
    }
    case "thisWeek":
    case "last7": {
      prevStart = new Date(start);
      prevStart.setDate(start.getDate() - 7);
      prevEnd = new Date(end);
      prevEnd.setDate(end.getDate() - 7);
      break;
    }
    case "thisMonth":
    case "lastMonth":
    case "last30": {
      // Roughly 30 days prior; covers the standard month-length
      prevStart = new Date(start);
      prevStart.setDate(start.getDate() - 30);
      prevEnd = new Date(end);
      prevEnd.setDate(end.getDate() - 30);
      break;
    }
    case "last90": {
      prevStart = new Date(start);
      prevStart.setDate(start.getDate() - 90);
      prevEnd = new Date(end);
      prevEnd.setDate(end.getDate() - 90);
      break;
    }
    case "ytd": {
      // Compare to the same day-of-year last year
      prevStart = new Date(start);
      prevStart.setFullYear(start.getFullYear() - 1);
      prevEnd = new Date(end);
      prevEnd.setFullYear(end.getFullYear() - 1);
      break;
    }
    default:
      return { ...range, label: "Previous period" };
  }
  return {
    startDate: ymd(prevStart),
    endDate: ymd(prevEnd),
    label: "Previous period",
  };
}

export const PRESET_OPTIONS: { value: PeriodPreset; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "thisWeek", label: "This week" },
  { value: "thisMonth", label: "This month" },
  { value: "lastMonth", label: "Last month" },
  { value: "last7", label: "Last 7d" },
  { value: "last30", label: "Last 30d" },
  { value: "last90", label: "Last 90d" },
  { value: "ytd", label: "YTD" },
  { value: "allTime", label: "All time" },
];

/* -------- Smart amount search -------- */

export interface ParsedQuery {
  text: string; // free-form text
  amountOp?: ">" | ">=" | "<" | "<=" | "=";
  amountValue?: number;
  amountRange?: [number, number];
}

export function parseSearchQuery(raw: string): ParsedQuery {
  const query = raw.trim();
  if (!query) return { text: "" };

  // Strip any amount token and capture it.
  const amountRegex =
    /\b(>|>=|<|<=|=)?\s*\$?(\d+(?:\.\d+)?)(?:\s*-\s*\$?(\d+(?:\.\d+)?))?/;
  const match = query.match(amountRegex);
  let op: ParsedQuery["amountOp"];
  let val: number | undefined;
  let range: [number, number] | undefined;

  if (match) {
    op = (match[1] as ParsedQuery["amountOp"]) || "=";
    val = Number(match[2]);
    if (match[3]) {
      range = [
        Math.min(val, Number(match[3])),
        Math.max(val, Number(match[3])),
      ];
      op = undefined;
      val = undefined;
    }
  }
  const text = query.replace(amountRegex, "").trim();
  const parsed: ParsedQuery = { text };
  if (range) parsed.amountRange = range;
  else if (val != null && !Number.isNaN(val)) {
    parsed.amountOp = op;
    parsed.amountValue = val;
  }
  return parsed;
}

export function expenseMatchesAmount(
  amount: number,
  parsed: ParsedQuery
): boolean {
  if (parsed.amountRange) {
    return amount >= parsed.amountRange[0] && amount <= parsed.amountRange[1];
  }
  if (parsed.amountValue == null) return true;
  switch (parsed.amountOp) {
    case ">":
      return amount > parsed.amountValue;
    case ">=":
      return amount >= parsed.amountValue;
    case "<":
      return amount < parsed.amountValue;
    case "<=":
      return amount <= parsed.amountValue;
    case "=":
    default:
      return amount === parsed.amountValue;
  }
}

/* -------- Recurring detection -------- */

export interface RecurringItem {
  key: string; // normalized description
  display: string; // original casing
  category: Expense["category"];
  occurrences: number;
  dates: string[]; // sorted desc
  cadenceDays: number; // average gap
  monthlyCost: number; // estimated
  amount: number; // most recent amount
}

function normalizeKey(desc: string): string {
  return desc
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function detectRecurring(expenses: Expense[]): RecurringItem[] {
  // Group by (normalized description + category)
  const groups = new Map<
    string,
    { key: string; display: string; category: Expense["category"]; items: Expense[] }
  >();

  for (const e of expenses) {
    if (!e.description.trim()) continue;
    const key = `${normalizeKey(e.description)}|${e.category}`;
    const existing = groups.get(key);
    if (existing) {
      existing.items.push(e);
    } else {
      groups.set(key, {
        key,
        display: e.description,
        category: e.category,
        items: [e],
      });
    }
  }

  const results: RecurringItem[] = [];
  for (const g of groups.values()) {
    if (g.items.length < 2) continue;
    const sorted = [...g.items].sort((a, b) => (a.date < b.date ? 1 : -1));
    const dates = sorted.map((s) => s.date);
    const timestamps = sorted
      .map((s) => new Date(s.date).getTime())
      .sort((a, b) => a - b);
    let totalGap = 0;
    for (let i = 1; i < timestamps.length; i++) {
      totalGap += (timestamps[i] - timestamps[i - 1]) / 86400000;
    }
    const cadenceDays =
      timestamps.length > 1 ? totalGap / (timestamps.length - 1) : 0;

    // Accept anything roughly monthly, weekly, biweekly, quarterly, or yearly
    const matchesCadence =
      cadenceDays >= 5 &&
      cadenceDays <= 400 &&
      // Coefficient of variation check: gaps should be consistent
      (() => {
        const gaps: number[] = [];
        for (let i = 1; i < timestamps.length; i++) {
          gaps.push((timestamps[i] - timestamps[i - 1]) / 86400000);
        }
        if (gaps.length < 2) return cadenceDays <= 35; // 2-occurrence case
        const mean = gaps.reduce((a, b) => a + b, 0) / gaps.length;
        if (mean === 0) return false;
        const variance =
          gaps.reduce((a, b) => a + (b - mean) ** 2, 0) / gaps.length;
        const stddev = Math.sqrt(variance);
        return stddev / mean < 0.6; // within 60% CV
      })();

    if (!matchesCadence) continue;

    const last = sorted[0];
    const avgGap = cadenceDays || 30;
    // Monthly cost = (latest amount) * (30 / avgGap)
    const monthlyCost = last.amount * (30 / avgGap);

    results.push({
      key: g.key,
      display: g.display,
      category: g.category,
      occurrences: sorted.length,
      dates,
      cadenceDays: Math.round(avgGap),
      monthlyCost,
      amount: last.amount,
    });
  }
  results.sort((a, b) => b.monthlyCost - a.monthlyCost);
  return results;
}

/* -------- Anomaly detection -------- */

export interface AnomalyMap {
  // expense.id -> ratio of amount / median amount in same category
  ratio: Map<string, number>;
  thresholds: Map<string, number>; // category -> 2x median
}

export function buildAnomalyMap(expenses: Expense[]): AnomalyMap {
  const byCat = new Map<Expense["category"], number[]>();
  for (const e of expenses) {
    const arr = byCat.get(e.category) ?? [];
    arr.push(e.amount);
    byCat.set(e.category, arr);
  }
  const thresholds = new Map<string, number>();
  const median = (arr: number[]) => {
    if (arr.length === 0) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  };
  for (const [cat, amounts] of byCat.entries()) {
    thresholds.set(cat, median(amounts) * 2);
  }
  const ratio = new Map<string, number>();
  for (const e of expenses) {
    const thr = thresholds.get(e.category) ?? 0;
    if (thr > 0) {
      ratio.set(e.id, e.amount / thr);
    }
  }
  return { ratio, thresholds };
}

export function isAnomaly(anomalyMap: AnomalyMap, id: string): boolean {
  const r = anomalyMap.ratio.get(id);
  return r != null && r > 1.0;
}

/* -------- Grouping & sorting -------- */

export type SortKey = "date-desc" | "date-asc" | "amount-desc" | "amount-asc" | "category";
export type GroupKey = "none" | "day" | "week" | "month" | "category";

export function sortExpenses(expenses: Expense[], sort: SortKey): Expense[] {
  const copy = [...expenses];
  switch (sort) {
    case "date-asc":
      return copy.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
    case "amount-desc":
      return copy.sort((a, b) => b.amount - a.amount);
    case "amount-asc":
      return copy.sort((a, b) => a.amount - b.amount);
    case "category":
      return copy.sort((a, b) => {
        const cmp = a.category.localeCompare(b.category);
        if (cmp !== 0) return cmp;
        return a.date < b.date ? 1 : -1;
      });
    case "date-desc":
    default:
      return copy.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  }
}

export interface Group {
  key: string;
  label: string;
  total: number;
  count: number;
  expenses: Expense[];
}

export function groupExpenses(expenses: Expense[], group: GroupKey): Group[] {
  if (group === "none") {
    return [
      {
        key: "all",
        label: "All",
        total: expenses.reduce((s, e) => s + e.amount, 0),
        count: expenses.length,
        expenses,
      },
    ];
  }
  const map = new Map<string, Group>();
  for (const e of expenses) {
    const k = groupKeyOf(e, group);
    const existing = map.get(k.key);
    if (existing) {
      existing.expenses.push(e);
      existing.total += e.amount;
      existing.count += 1;
    } else {
      map.set(k.key, { ...k, total: e.amount, count: 1, expenses: [e] });
    }
  }
  // Order groups: category alphabetically, time descending
  const list = Array.from(map.values());
  if (group === "category") {
    list.sort((a, b) => a.label.localeCompare(b.label));
  } else {
    list.sort((a, b) => (a.key < b.key ? 1 : -1));
  }
  return list;
}

function groupKeyOf(e: Expense, group: GroupKey): { key: string; label: string } {
  switch (group) {
    case "day":
      return { key: e.date, label: e.date };
    case "week": {
      const d = new Date(e.date);
      const dow = d.getDay();
      const mondayOffset = (dow + 6) % 7;
      const start = new Date(d);
      start.setDate(d.getDate() - mondayOffset);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      const key = start.toISOString().slice(0, 10);
      return {
        key,
        label: `Week of ${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
      };
    }
    case "month":
      return { key: e.date.slice(0, 7), label: e.date.slice(0, 7) };
    case "category":
      return { key: e.category, label: e.category };
    default:
      return { key: "all", label: "All" };
  }
}
