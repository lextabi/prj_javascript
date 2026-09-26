# Tip Calculator

Split a restaurant bill between friends. Pick a tip percentage or type your own, set the number of people, and see the tip and total per person update as you type. It can also round each person's share up to a whole amount.

## Concepts shown

- reading form inputs with the `input` and `change` events
- `parseFloat()`, `Number()`, `Number.isNaN()`, `Number.isInteger()`
- **validation** with friendly error messages (`Can't be zero`) and a red border
- `data-*` attributes read through `dataset` (`data-tip="15"` → `btn.dataset.tip`)
- `querySelectorAll()` + `forEach()` to attach one listener to many buttons
- `Intl.NumberFormat` to show currency (`$1,234.50`)
- `Math.ceil()` / `Math.max()`
- a Reset button that is only enabled when something has changed
- CSS: **Grid** layout (`grid-template-columns`, `grid-column: 1 / -1`) and a `@media` query that switches to one column on phones

## Run

Open `index.html` in any browser, or try the [live demo](https://lextabi.github.io/prj_javascript/Tip%20Calculator/).

## Sample result

```
Bill:    $142.55
Tip:     18%
People:  5

Tip / person      $5.13
Total / person   $33.64
Whole bill      $168.21

With "round up" ticked:
Total / person   $34.00
Whole bill      $170.00
```
