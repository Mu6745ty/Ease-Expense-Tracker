# ExpenseEase — Personal Expense Tracker

A modern, professional expense tracking app built with **Next.js 14 (App Router)**, **TypeScript**, and **Tailwind CSS**. All data is persisted in your browser's `localStorage`, so it works offline and without a backend.

## Features

- 📊 **Dashboard** with summary cards (total spent, this month, average, top category), 14-day spending trend chart, and category pie chart
- ➕ **Add / edit / delete** expenses with full form validation
- 🔎 **Search & filter** by description, category, and date range
- 📁 **Six categories** with distinct color coding: Food, Transportation, Entertainment, Shopping, Bills, Other
- 🧠 **Power-user analytics** — see "Power features" below
- 📤 **CSV export** of the current filtered list
- 📱 **Responsive** layout that works on desktop, tablet, and mobile
- 💾 **Local persistence** via `localStorage` (with cross-tab sync)
- 🌙 **Light / dark / system** theme, with no-flash startup
- 🌱 **Empty on first run** — start with a clean slate and add your own expenses

## Tech Stack

- Next.js 14 (App Router) + React 18
- TypeScript (strict)
- Tailwind CSS 3 with a custom `primary` color palette
- Recharts for analytics
- date-fns for date helpers
- lucide-react for icons

## Power features (Expenses page)

The Expenses page is the power-user surface. Everything is client-side, all-in-one.

### 1. Time period presets
Click any chip at the top: **Today**, **This week**, **This month**, **Last month**, **Last 7d / 30d / 90d**, **YTD**, **All time**, **Custom…** (reveals From/To pickers).

### 2. Multi-select category filter
Click chips to add/remove categories. Filter to "Food + Transportation" or any combination. The chip itself shows the category's color and icon.

### 3. Smart amount search
The search box accepts more than text. Try any of:
- `lunch` — description contains "lunch"
- `>20` — amount greater than $20
- `<5` — amount less than $5
- `=12.50` — exact amount
- `10-50` — amount between $10 and $50
- `netflix >5` — combines text and amount

You can mix text and amount in any order.

### 4. Sort and group controls
Two dropdowns:
- **Sort**: Newest first · Oldest first · Amount high→low · Amount low→high · Category
- **Group**: No grouping · By day · By week · By month · By category
  When grouped, each section shows its own subtotal and item count.

### 5. View modes
Three modes via the top-right toggle on the Expenses page:
- **List** — flat, paginated (shows the first 50 with a "Show all" button)
- **Grouped** — sections per day/week/month/category with subtotals
- **Heatmap** — GitHub-style year-long heatmap. Click any day to filter the list to that exact date.

### 6. Period comparison
When you've picked any period other than "All time", a bar appears showing **current total vs. equivalent previous period** with a percent change. Useful for "Did I spend more on Food this month than last month?"

### 7. Recurring & subscription detection
A panel lists expenses that look like recurring charges (Netflix, rent, gym…) — anything with at least 2 occurrences of the same description + category whose dates are within ~60% of the average gap. Each item shows:
- Detection confidence (cadence in days)
- Estimated monthly cost
- Last occurrence date
- **Click any item to filter the list to that description.**

### 8. Anomaly highlighting
A row is tagged **Unusual** when its amount is more than 2× the median of its own category. A summary banner at the top of the list tells you how many unusual transactions are in your current view.

### 9. CSV export
Always reflects what you see. Sort, filter, group, and search first, then export — the CSV is built from the visible list, not the entire dataset.

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Run the development server

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

### 3. Build for production

```bash
npm run build
npm run start
```

## Project Structure

```
src/
├── app/
│   ├── layout.tsx               # Root layout, mounts Navigation + Provider
│   ├── page.tsx                 # Dashboard
│   ├── globals.css              # Tailwind base + custom styles
│   └── expenses/
│       ├── page.tsx             # Expenses list w/ filters, search, export
│       ├── new/page.tsx         # Add expense
│       └── [id]/edit/page.tsx   # Edit expense
├── components/
│   ├── Navigation.tsx
│   ├── ExpensesProvider.tsx     # Context + localStorage hydration
│   ├── SummaryCard.tsx
│   ├── charts.tsx               # Recharts bar + pie
│   ├── ExpenseForm.tsx          # Shared add/edit form
│   ├── ExpenseRow.tsx
│   ├── FormControls.tsx
│   ├── Card.tsx
│   ├── CategoryBadge.tsx
│   ├── Button.tsx
│   ├── EmptyState.tsx
│   └── Toast.tsx
└── lib/
    ├── types.ts                 # Expense, Category, CATEGORY_META
    ├── storage.ts               # localStorage CRUD + seed data
    ├── useExpenses.ts           # React hook bridging context + storage
    ├── format.ts                # Currency, date, filtering, aggregations
    └── csv.ts                   # CSV export
```

## How to Test Every Feature

1. **Add an expense**
   - Click **+ New Expense** in the top nav (or on the dashboard).
   - Pick a date, enter an amount, choose a category, add a description, submit.
   - Try submitting with an empty amount or a future date — you'll see validation errors.

2. **View & search the list**
   - Go to **Expenses**.
   - Type in the search box to filter by description.
   - Pick a category from the dropdown.
   - Set a date range with **From / To** dates.
   - Click **Clear filters** to reset.

3. **Edit & delete**
   - On any row, click the pencil icon → update fields → **Save changes**.
   - On any row, click the trash icon → click **Confirm** to delete.

4. **Dashboard analytics**
   - Return to the dashboard.
   - The four summary cards update instantly.
   - The 14-day bar chart and category pie chart reflect your data.

5. **CSV export**
   - On the **Expenses** page, click **Export CSV**.
   - A `.csv` file downloads with the current filtered list.
   - Filter first, then export — the export always reflects what you see.

6. **Persistence**
   - Refresh the page — your data is still there (it's in `localStorage`).
   - Open the app in a second tab — changes in one tab sync to the other.

7. **Reset**
   - To clear everything, open DevTools → Application → Local Storage → delete the `expense-tracker:expenses:v1` key. Refresh; the dashboard will show the empty state again.

## Data Model

```ts
type Category = "Food" | "Transportation" | "Entertainment" | "Shopping" | "Bills" | "Other";

interface Expense {
  id: string;
  date: string;        // yyyy-MM-dd
  amount: number;
  category: Category;
  description: string;
  createdAt: string;   // ISO timestamp
  updatedAt: string;   // ISO timestamp
}
```

## Notes

- This is a demo project — there is no authentication or server-side storage.
- All currency is formatted as USD (`Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })`).
- The date input is constrained to today or earlier.
- Tailwind's `primary` palette (`indigo`-based) is configured in `tailwind.config.js`.

## Try the power features (quick tour)

1. Go to **Expenses** → set period to **This month**, switch to **Grouped** view with **By day** — see daily subtotals.
2. In the search box, type `>20` to see only expenses over $20, then try `5-10` for a range, then `coffee <8` to combine text and amount.
3. Click a category chip twice to filter to two categories (e.g. Food + Transportation), then **Export CSV** — the file is exactly that slice.
4. Click the **Heatmap** view, then click a day on the calendar — the list filters to that day.
5. Pick a period like **This month** and watch the comparison bar at the top: it shows last month's total and the % change.
6. Add 2–3 expenses with the same description over different dates (e.g. "Spotify" on three consecutive months) — they appear in the **Recurring & subscriptions** panel. Click one to filter the list.
