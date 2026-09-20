import type { Metadata } from "next";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import { ExpensesProvider } from "@/components/ExpensesProvider";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "ExpenseEase — Personal Expense Tracker",
  description:
    "Track your personal expenses, see spending analytics, and stay on top of your finances.",
};

// Inline anti-flash script: runs before React hydrates and sets the `dark`
// class on <html> so the page never paints in the wrong theme.
const themeScript = `
(function() {
  try {
    var KEY = 'expense-tracker:theme:v1';
    var raw = localStorage.getItem(KEY);
    var pref = raw === 'light' || raw === 'dark' || raw === 'system' ? raw : 'system';
    var resolved = pref === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : pref;
    if (resolved === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = resolved;
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <ThemeProvider>
          <ExpensesProvider>
            <Navigation />
            <main className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
              {children}
            </main>
            <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <div className="mx-auto max-w-6xl px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400 sm:px-6 lg:px-8">
                Built with Next.js · Data stored locally in your browser
              </div>
            </footer>
          </ExpensesProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}