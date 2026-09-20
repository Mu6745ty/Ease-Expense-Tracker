"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  ListChecks,
  PlusCircle,
  Wallet,
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

const links = [
  { href: "/", label: "Dashboard", icon: BarChart3 },
  { href: "/expenses", label: "Expenses", icon: ListChecks },
  { href: "/expenses/new", label: "Add", icon: PlusCircle, mobileOnly: true },
];

export function Navigation() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="group flex items-center gap-2 text-slate-900 hover:text-primary-600 dark:text-slate-100 dark:hover:text-primary-300"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary-600 text-white shadow-sm transition group-hover:scale-105">
            <Wallet className="h-5 w-5" />
          </span>
          <span className="text-lg font-semibold tracking-tight">ExpenseEase</span>
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          {links
            .filter((l) => !l.mobileOnly)
            .map((link) => {
              const Icon = link.icon;
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-200"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          <Link
            href="/expenses/new"
            className="ml-2 inline-flex items-center gap-2 rounded-lg bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
          >
            <PlusCircle className="h-4 w-4" />
            New Expense
          </Link>
          <div className="ml-2">
            <ThemeToggle />
          </div>
        </nav>

        <div className="flex items-center gap-2 sm:hidden">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}