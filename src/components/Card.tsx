"use client";

import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 ${className}`}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children, className = "" }: CardProps) {
  return (
    <h2
      className={`text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100 ${className}`}
    >
      {children}
    </h2>
  );
}

export function CardSubtitle({ children, className = "" }: CardProps) {
  return (
    <p
      className={`mt-1 text-sm text-slate-500 dark:text-slate-400 ${className}`}
    >
      {children}
    </p>
  );
}