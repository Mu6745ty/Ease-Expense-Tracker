"use client";

import { useMemo } from "react";
import Link from "next/link";
import { CalendarDays, CircleDollarSign, TrendingUp, Wallet } from "lucide-react";
import { Card, CardSubtitle, CardTitle } from "@/components/Card";
import { SummaryCard } from "@/components/SummaryCard";
import { CategoryPieChart, SpendingTrendChart } from "@/components/charts";
import { CategoryBadge } from "@/components/CategoryBadge";
import { Button } from "@/components/Button";
import { useExpensesContext } from "@/components/ExpensesProvider";
import {
  currentMonthKey,
  dailyTotals,
  formatCurrency,
  isInMonth,
  totalAmount,
  totalsByCategory,
} from "@/lib/format";

export default function DashboardPage() {
  const { expenses, hydrated } = useExpensesContext();

  const stats = useMemo(() => {
    const total = totalAmount(expenses);
    const monthKey = currentMonthKey();
    const monthExpenses = expenses.filter((e) => isInMonth(e.date, monthKey));
    const monthTotal = totalAmount(monthExpenses);
    const monthCount = monthExpenses.length;
    const avgPerExpense = monthCount > 0 ? monthTotal / monthCount : 0;
    const byCategory = totalsByCategory(monthExpenses);
    const top = byCategory[0];
    const trend = dailyTotals(expenses, 14);
    return { total, monthTotal, monthCount, avgPerExpense, byCategory, top, trend };
  }, [expenses]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Your spending at a glance.
          </p>
        </div>
        <Link href="/expenses/new">
          <Button>+ Add expense</Button>
        </Link>
      </div>

      {!hydrated ? (
        <DashboardSkeleton />
      ) : expenses.length === 0 ? (
        <EmptyDashboard />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard
              label="Total spent"
              value={formatCurrency(stats.total)}
              hint={`${expenses.length} transactions`}
              icon={Wallet}
              accent="primary"
            />
            <SummaryCard
              label="This month"
              value={formatCurrency(stats.monthTotal)}
              hint={`${stats.monthCount} this month`}
              icon={CalendarDays}
              accent="info"
            />
            <SummaryCard
              label="Average per expense"
              value={formatCurrency(stats.avgPerExpense)}
              hint="this month"
              icon={CircleDollarSign}
              accent="warning"
            />
            <SummaryCard
              label="Top category"
              value={stats.top ? stats.top.category : "—"}
              hint={
                stats.top
                  ? `${formatCurrency(stats.top.total)} this month`
                  : "no data yet"
              }
              icon={TrendingUp}
              accent="success"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Last 14 days</CardTitle>
                  <CardSubtitle>Daily spending trend</CardSubtitle>
                </div>
              </div>
              <div className="mt-4">
                <SpendingTrendChart data={stats.trend} />
              </div>
            </Card>

            <Card>
              <CardTitle>By category</CardTitle>
              <CardSubtitle>This month</CardSubtitle>
              <div className="mt-4">
                <CategoryPieChart data={stats.byCategory} />
              </div>
            </Card>
          </div>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Category breakdown</CardTitle>
                <CardSubtitle>How your spending is distributed this month</CardSubtitle>
              </div>
              <Link
                href="/expenses"
                className="text-sm font-medium text-primary-700 hover:text-primary-800 dark:text-primary-300 dark:hover:text-primary-200"
              >
                View all →
              </Link>
            </div>
            <ul className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
              {stats.byCategory.length === 0 ? (
                <li className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">
                  No spending recorded this month.
                </li>
              ) : (
                stats.byCategory.map((c) => {
                  const pct = stats.monthTotal
                    ? Math.round((c.total / stats.monthTotal) * 100)
                    : 0;
                  return (
                    <li
                      key={c.category}
                      className="flex items-center gap-3 py-3"
                    >
                      <div className="w-32 shrink-0">
                        <CategoryBadge category={c.category} />
                      </div>
                      <div className="flex-1">
                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                          <div
                            className="h-full rounded-full bg-primary-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                      <div className="w-28 shrink-0 text-right">
                        <p className="text-sm font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                          {formatCurrency(c.total)}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {c.count} {c.count === 1 ? "item" : "items"} · {pct}%
                        </p>
                      </div>
                    </li>
                  );
                })
              )}
            </ul>
          </Card>
        </>
      )}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
        />
      ))}
    </div>
  );
}

function EmptyDashboard() {
  return (
    <Card className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-primary-50 text-2xl dark:bg-primary-900/40">
        📊
      </div>
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
        Welcome to ExpenseEase
      </h2>
      <p className="mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">
        Track your spending, see insights, and stay on top of your finances.
        Add your first expense to get started.
      </p>
      <Link href="/expenses/new" className="mt-4">
        <Button size="lg">+ Add your first expense</Button>
      </Link>
    </Card>
  );
}
