import { Expense } from "./types";
import { formatDate } from "./format";

function escapeCsvField(value: string): string {
  if (value == null) return "";
  const needsQuotes = /[",\n\r]/.test(value);
  const escaped = value.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
}

export function expensesToCsv(expenses: Expense[]): string {
  const header = ["Date", "Category", "Amount", "Description"].join(",");
  const rows = expenses.map((e) =>
    [
      escapeCsvField(e.date),
      escapeCsvField(e.category),
      escapeCsvField(e.amount.toFixed(2)),
      escapeCsvField(e.description),
    ].join(",")
  );
  return [header, ...rows].join("\r\n");
}

export function downloadCsv(filename: string, csv: string): void {
  if (typeof window === "undefined") return;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function csvFilename(): string {
  const ts = new Date().toISOString().replace(/[:T]/g, "-").slice(0, 19);
  return `expenses-${ts}.csv`;
}

export { formatDate };
