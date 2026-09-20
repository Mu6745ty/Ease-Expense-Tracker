"use client";

import { useTheme } from "./ThemeProvider";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DailyTotal } from "@/lib/format";
import { CategoryTotal } from "@/lib/format";
import { CATEGORY_META } from "@/lib/types";
import { formatCurrency } from "@/lib/format";

interface SpendingTrendChartProps {
  data: DailyTotal[];
}

export function SpendingTrendChart({ data }: SpendingTrendChartProps) {
  const { resolved } = useTheme();
  const isDark = resolved === "dark";

  const formatted = data.map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  }));

  const grid = isDark ? "#334155" : "#e2e8f0"; // slate-700 / slate-200
  const axis = isDark ? "#94a3b8" : "#64748b"; // slate-400 / slate-500
  const label = isDark ? "#e2e8f0" : "#0f172a"; // slate-200 / slate-900
  const tooltipBg = isDark ? "#0f172a" : "#ffffff";
  const tooltipBorder = isDark ? "#334155" : "#e2e8f0";
  const tooltipShadow = isDark
    ? "0 4px 12px rgba(0,0,0,0.45)"
    : "0 4px 12px rgba(15,23,42,0.08)";
  const cursorFill = isDark ? "rgba(165,180,252,0.12)" : "rgba(99,102,241,0.08)";
  const barFill = isDark ? "#818cf8" : "#6366f1"; // primary-400 / primary-500

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={formatted} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: axis }}
            tickLine={false}
            axisLine={{ stroke: grid }}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 11, fill: axis }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `$${v}`}
            width={48}
          />
          <Tooltip
            cursor={{ fill: cursorFill }}
            contentStyle={{
              borderRadius: 10,
              border: `1px solid ${tooltipBorder}`,
              backgroundColor: tooltipBg,
              fontSize: 12,
              boxShadow: tooltipShadow,
              color: label,
            }}
            formatter={(value: number) => [formatCurrency(value), "Spent"]}
            labelStyle={{ color: label, fontWeight: 600 }}
          />
          <Bar dataKey="total" fill={barFill} radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

interface CategoryPieChartProps {
  data: CategoryTotal[];
}

export function CategoryPieChart({ data }: CategoryPieChartProps) {
  const { resolved } = useTheme();
  const isDark = resolved === "dark";

  if (data.length === 0) {
    return (
      <div className="grid h-72 place-items-center text-sm text-slate-500 dark:text-slate-400">
        No spending data to chart yet.
      </div>
    );
  }
  const pieData = data.map((d) => ({
    name: d.category,
    value: Number(d.total.toFixed(2)),
    color: CATEGORY_META[d.category].color,
  }));

  const tooltipBg = isDark ? "#0f172a" : "#ffffff";
  const tooltipBorder = isDark ? "#334155" : "#e2e8f0";
  const tooltipShadow = isDark
    ? "0 4px 12px rgba(0,0,0,0.45)"
    : "0 4px 12px rgba(15,23,42,0.08)";
  const label = isDark ? "#e2e8f0" : "#0f172a";
  const legendColor = isDark ? "#cbd5e1" : "#475569";

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip
            contentStyle={{
              borderRadius: 10,
              border: `1px solid ${tooltipBorder}`,
              backgroundColor: tooltipBg,
              fontSize: 12,
              boxShadow: tooltipShadow,
              color: label,
            }}
            formatter={(value: number, name: string) => [
              formatCurrency(value),
              name,
            ]}
          />
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            wrapperStyle={{ fontSize: 12, color: legendColor }}
          />
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            innerRadius={50}
            outerRadius={88}
            paddingAngle={2}
          >
            {pieData.map((entry, idx) => (
              <Cell key={`cell-${idx}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}