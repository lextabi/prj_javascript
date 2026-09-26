# Expense Tracker

Track your income and expenses month by month in Philippine pesos (₱). It shows your balance, a donut chart of spending by category drawn by hand on a `<canvas>`, a filterable list, and it can export the month to a CSV file. Everything is saved in your browser.

## Concepts shown

- **`reduce()`** for totals and for grouping expenses by category into an object
- the **Canvas 2D API**: `getContext('2d')`, `arc()`, `stroke()`, `fillText()`, angles in radians, and `devicePixelRatio` for sharp drawing on high-resolution screens
- `filter()`, `sort()` with a compare function and `localeCompare()`, `map()`, `Object.entries()` with destructuring
- `Intl.NumberFormat('en-PH', { currency: 'PHP' })` for pesos
- `<input type="month">` / `type="date"` and working with `YYYY-MM-DD` strings (and why `toISOString()` can give the wrong day)
- `localStorage` with safe loading (`try/catch`, `Array.isArray`)
- a **CSV download** with `Blob`, `URL.createObjectURL()` and a temporary `<a download>` link, with correct CSV quoting
- `confirm()` before deleting, event delegation for the delete buttons
- CSS: Grid layouts that collapse on small screens, `minmax(0, 1fr)`, radio buttons styled as a toggle, a per-card `--stripe` custom property used inside `box-shadow`

## Run

Open `index.html` in any browser, or try the [live demo](https://lextabi.github.io/prj_javascript/Expense%20Tracker/).

Click **Add sample data** to fill the current month with example transactions.

## Sample result

```
Expense Tracker                               September 2026

Balance ₱24,144.75     Income ₱50,500.00     Expenses ₱26,355.25

Spending by category        Transactions (All)
   ◯ Spent                  🎬 Movie night          Fun · Sep 22       −₱560.00
     ₱26,355.25             🚌 Jeepney and Grab     Transport · Sep 20 −₱1,540.00
 ● Bills      54%           💻 Website project      Freelance · Sep 18 +₱8,500.00
 ● Food       22%           ...
 ● Shopping   13%
 ● Transport   6%
 ● Health      3%
 ● Fun         2%
```

Exported CSV:

```
"Date","Type","Category","Description","Amount"
"2026-09-01","income","Salary","Monthly salary","42000"
"2026-09-02","expense","Bills","Rent","12000"
```
