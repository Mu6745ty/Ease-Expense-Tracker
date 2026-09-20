"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Download,
  Layers,
  List,
  Plus,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { CategoryMultiSelect } from "@/components/CategoryMultiSelect";
import { EmptyState } from "@/components/EmptyState";
import { ExpenseRow } from "@/components/ExpenseRow";
import { Field, TextInput } from "@/components/FormControls";
import { PeriodChips } from "@/components/PeriodChips";
import { PeriodComparison } from "@/components/PeriodComparison";
import { RecurringPanel } from "@/components/RecurringPanel";
import { SortGroupControls } from "@/components/SortGroupControls";
import { SpendingHeatmap } from "@/components/SpendingHeatmap";
import { Toast, useToast } from "@/components/Toast";
import { useExpensesContext } from "@/components/ExpensesProvider";
import { Category } from "@/lib/types";
import {
  applyFilters,
  formatCurrency,
  totalAmount,
} from "@/lib/format";
import { csvFilename, downloadCsv, expensesToCsv } from "@/lib/csv";
import {
  GroupKey,
  PeriodPreset,
  SortKey,
  buildAnomalyMap,
  detectRecurring,
  expenseMatchesAmount,
  groupExpenses,
  parseSearchQuery,
  rangeForPreset,
  shiftRangeByOnePeriod,
  sortExpenses,
} from "@/lib/analysis";

type ViewMode = "list" | "grouped" | "heatmap";

export default function ExpensesPage() {
  const { expenses, hydrated, deleteExpense } = useExpensesContext();
  const { toast, showToast, closeToast } = useToast();

  // Filters
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<Set<Category>>(new Set());
  const [preset, setPreset] = useState<PeriodPreset>("last30");
  const [customStart, setCustomStart] = useState<string>("");
  const [customEnd, setCustomEnd] = useState<string>("");
  const [sort, setSort] = useState<SortKey>("date-desc");
  const [group, setGroup] = useState<GroupKey>("none");
  const [view, setView] = useState<ViewMode>("list");
  const [showAll, setShowAll] = useState(false);

  // When the user changes a preset, clear any custom range
  useEffect(() => {
    if (preset !== ("custom" as PeriodPreset)) {
      setCustomStart("");
      setCustomEnd("");
    }
  }, [preset]);

  const range = useMemo(() => {
    if (preset === ("custom" as PeriodPreset)) {
      return {
        startDate: customStart || undefined,
        endDate: customEnd || undefined,
        label: "Custom",
      };
    }
    return rangeForPreset(preset);
  }, [preset, customStart, customEnd]);

  const filtered = useMemo(() => {
    const q = parseSearchQuery(search);
    return applyFilters(expenses, {
      // No single category filter; we filter manually below for multi-select
      startDate: range.startDate,
      endDate: range.endDate,
    }).filter((e) => {
      if (categories.size > 0 && !categories.has(e.category)) return false;
      if (q.text && !e.description.toLowerCase().includes(q.text.toLowerCase()))
        return false;
      if (!expenseMatchesAmount(e.amount, q)) return false;
      return true;
    });
  }, [expenses, range, categories, search]);

  const sorted = useMemo(() => sortExpenses(filtered, sort), [filtered, sort]);
  const grouped = useMemo(() => groupExpenses(sorted, group), [sorted, group]);
  const total = totalAmount(filtered);
  const anomalyMap = useMemo(() => buildAnomalyMap(expenses), [expenses]);
  const recurring = useMemo(() => detectRecurring(expenses), [expenses]);

  // Period comparison
  const previousRange = useMemo(
    () => shiftRangeByOnePeriod(range, preset as PeriodPreset),
    [range, preset]
  );
  const previousTotal = useMemo(
    () =>
      totalAmount(
        applyFilters(expenses, {
          startDate: previousRange.startDate,
          endDate: previousRange.endDate,
        })
      ),
    [expenses, previousRange]
  );

  const hasActiveFilters =
    !!search || categories.size > 0 || preset !== "allTime";

  function clearAll() {
    setSearch("");
    setCategories(new Set());
    setPreset("allTime");
    setCustomStart("");
    setCustomEnd("");
  }

  function toggleCategory(cat: Category) {
    setCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  function handleExport() {
    if (sorted.length === 0) {
      showToast("No expenses to export");
      return;
    }
    const csv = expensesToCsv(sorted);
    downloadCsv(csvFilename(), csv);
    showToast(`Exported ${sorted.length} expense${sorted.length === 1 ? "" : "s"}`);
  }

  function handleDelete(id: string) {
    deleteExpense(id);
    showToast("Expense deleted");
  }

  function handleRecurringClick(display: string) {
    setSearch(display);
    showToast(`Filtering to "${display}"`);
  }

  function handleHeatmapClick(date: string) {
    // Force a single-day custom range
    setPreset("custom" as PeriodPreset);
    setCustomStart(date);
    setCustomEnd(date);
  }

  // Visible list: cap unless user expands
  const VISIBLE_CAP = 50;
  const visible = showAll ? sorted : sorted.slice(0, VISIBLE_CAP);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
            Expenses
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Powerful filtering, sorting, and analytics — all client-side.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Link href="/expenses/new">
            <Button>
              <Plus className="h-4 w-4" />
              New expense
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter card */}
      <Card className="space-y-4">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
          <Field
            label="Search"
            htmlFor="search"
            hint='Supports "lunch", "netflix", ">20", "<5", "10-50"'
          >
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <TextInput
                id="search"
                placeholder="Description or amount (e.g. >20, 10-50)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </Field>
          <div className="flex gap-2">
            <Link href="/expenses/new">
              <Button>+ Quick add</Button>
            </Link>
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">Period</p>
          <PeriodChips value={preset} onChange={setPreset} />
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">Categories</p>
          <CategoryMultiSelect
            selected={categories}
            onToggle={toggleCategory}
            onClear={() => setCategories(new Set())}
          />
        </div>

        {preset === ("custom" as PeriodPreset) && (
          <div className="grid grid-cols-2 gap-3 sm:max-w-md">
            <Field label="From" htmlFor="cust-start">
              <TextInput
                id="cust-start"
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
              />
            </Field>
            <Field label="To" htmlFor="cust-end">
              <TextInput
                id="cust-end"
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
              />
            </Field>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-sm dark:border-slate-800">
          <div className="text-slate-600 dark:text-slate-300">
            <span className="font-semibold text-slate-900 dark:text-slate-100">{sorted.length}</span>{" "}
            {sorted.length === 1 ? "result" : "results"}
            {hasActiveFilters && expenses.length !== sorted.length && (
              <span className="text-slate-400 dark:text-slate-500"> of {expenses.length}</span>
            )}{" "}
            · Total:{" "}
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {formatCurrency(total)}
            </span>
          </div>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAll}
              className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
              Clear all filters
            </button>
          )}
        </div>
      </Card>

      {/* Period comparison */}
      {hydrated && expenses.length > 0 && preset !== "allTime" && (
        <PeriodComparison
          current={total}
          previous={previousTotal}
          currentLabel={range.label}
          previousLabel={previousRange.label}
        />
      )}

      {/* View mode + sort/group controls */}
      {hydrated && expenses.length > 0 && (
        <Card className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 text-xs font-semibold dark:border-slate-700 dark:bg-slate-800">
            {(
              [
                { v: "list", label: "List", icon: List },
                { v: "grouped", label: "Grouped", icon: Layers },
                { v: "heatmap", label: "Heatmap", icon: Calendar },
              ] as { v: ViewMode; label: string; icon: typeof List }[]
            ).map(({ v, label, icon: Icon }) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 transition ${
                  view === v
                    ? "bg-primary-600 text-white dark:bg-primary-500"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>
          {view !== "heatmap" && (
            <SortGroupControls
              sort={sort}
              group={group}
              onSortChange={setSort}
              onGroupChange={setGroup}
            />
          )}
        </Card>
      )}

      {/* Anomaly callout */}
      {hydrated && sorted.length > 0 && (() => {
        const unusual = sorted.filter(
          (e) => (anomalyMap.ratio.get(e.id) ?? 0) > 1.0
        );
        if (unusual.length === 0) return null;
        return (
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800/60 dark:bg-amber-900/20 dark:text-amber-200">
            <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-300" />
            <span>
              <span className="font-semibold">{unusual.length}</span> unusual{" "}
              {unusual.length === 1 ? "transaction" : "transactions"} in this
              view — flagged as more than 2× your category median.
            </span>
          </div>
        );
      })()}

      {/* Recurring panel */}
      {hydrated && recurring.length > 0 && (
        <RecurringPanel
          items={recurring}
          onFilterByRecurring={handleRecurringClick}
        />
      )}

      {/* Main content */}
      {!hydrated ? (
        <Card className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-14 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800"
            />
          ))}
        </Card>
      ) : expenses.length === 0 ? (
        <EmptyState
          title="No expenses yet"
          description="Once you start adding expenses, they'll show up here."
          action={
            <Link href="/expenses/new">
              <Button>Add your first expense</Button>
            </Link>
          }
        />
      ) : sorted.length === 0 ? (
        <EmptyState
          title="No matches"
          description="Try adjusting your search or filters."
          action={
            <Button variant="secondary" onClick={clearAll}>
              Clear all filters
            </Button>
          }
        />
      ) : view === "heatmap" ? (
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                {new Date().getFullYear()} spending heatmap
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Click a day to filter the list to that date.
              </p>
            </div>
          </div>
          <div className="mt-4">
            <SpendingHeatmap
              expenses={expenses}
              onDayClick={handleHeatmapClick}
            />
          </div>
        </Card>
      ) : view === "grouped" ? (
        <div className="space-y-4">
          {grouped.map((g) => (
            <Card key={g.key} className="overflow-hidden p-0">
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-2.5 dark:border-slate-800 dark:bg-slate-800/50 sm:px-5">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {g.label}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {g.count} {g.count === 1 ? "item" : "items"}
                  </p>
                </div>
                <p className="text-sm font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                  {formatCurrency(g.total)}
                </p>
              </div>
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {g.expenses.map((e) => (
                  <ExpenseRow
                    key={e.id}
                    expense={e}
                    onDelete={handleDelete}
                    anomalyRatio={anomalyMap.ratio.get(e.id)}
                  />
                ))}
              </ul>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="overflow-hidden p-0">
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {visible.map((e) => (
              <ExpenseRow
                key={e.id}
                expense={e}
                onDelete={handleDelete}
                anomalyRatio={anomalyMap.ratio.get(e.id)}
              />
            ))}
          </ul>
          {sorted.length > VISIBLE_CAP && (
            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-800/50">
              <span className="text-slate-500 dark:text-slate-400">
                Showing {Math.min(VISIBLE_CAP, sorted.length)} of {sorted.length}
              </span>
              <button
                type="button"
                onClick={() => setShowAll((s) => !s)}
                className="font-semibold text-primary-700 hover:text-primary-800 dark:text-primary-300 dark:hover:text-primary-200"
              >
                {showAll ? "Show fewer" : `Show all ${sorted.length}`}
              </button>
            </div>
          )}
        </Card>
      )}

      {toast && <Toast message={toast} onClose={closeToast} />}
    </div>
  );
}
