# Unit Converter

Convert length, weight and temperature as you type. You can type in either box to convert in both directions, swap the units with one click, and see a quick reference table for the pair you picked.

## Concepts shown

- a **lookup object** (`UNITS.length.mile.factor`) instead of a long chain of `if` statements
- **functions as values**: each temperature unit stores its own `toBase()` / `fromBase()` arrow functions
- `typeof` to decide which kind of conversion to use
- string methods: `name[0].toUpperCase() + name.slice(1)` to capitalize, `replaceAll()`
- **two-way inputs**: typing on either side updates the other side
- `Object.keys()`, `new Option()` to build `<select>` menus from data
- `map()` + `join('')` to build table rows from an array
- array **destructuring**, including swapping two values: `[a, b] = [b, a]`
- `toFixed()` and `toLocaleString()` to format numbers neatly
- CSS: `:focus-within`, attribute selectors (`[aria-selected="true"]`), `:nth-child(even)` stripes, a `@media` query that stacks the boxes on phones

## Run

Open `index.html` in any browser, or try the [live demo](https://lextabi.github.io/prj_javascript/Unit%20Converter/).

## Sample result

```
Length:       5 km        =  3.106856 mi        (1 km = 0.621371 mi)
Weight:       70 kg       =  154.323584 lb
Temperature:  37 °C       =  98.6 °F           (°F = °C × 9/5 + 32)
Temperature:  -40 °F      =  -40 °C
Swap ⇄:       mi → km     1 mi = 1.609344 km

Quick reference: °C → °F
-40 °C   -40 °F
0 °C      32 °F
20 °C     68 °F
37 °C   98.6 °F
100 °C   212 °F
```
