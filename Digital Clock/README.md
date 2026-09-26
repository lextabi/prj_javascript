# Digital Clock

A live clock with blinking colons, the full date, a greeting that changes with the time of day, a 12/24-hour switch, and world clocks for four cities.

## Concepts shown

- the `Date` object: `getHours()`, `getMinutes()`, `getSeconds()`, `toISOString()`
- `setInterval()` to update the page every second
- `padStart()` to always show two digits (`07` instead of `7`)
- the `%` operator and the ternary `? :` to convert 24-hour time to 12-hour time
- `toLocaleDateString()` / `toLocaleTimeString()` with options, including `timeZone` for world clocks
- `localStorage` to remember the 12/24-hour choice
- arrays of objects with `forEach((item, index) => ...)`
- CSS: custom properties (`--accent`), `@keyframes` animation, `clamp()` font size, a checkbox styled as a toggle switch with `::before` and the `+` selector

## Run

Open `index.html` in any browser, or try the [live demo](https://lextabi.github.io/prj_javascript/Digital%20Clock/).

## Sample result

```
Good afternoon 🌤️
02:45:09 PM
Saturday, September 26, 2026

[ ] 24-hour format

WORLD CLOCKS
London   Sat      07:45 AM
New York Sat      02:45 AM
Tokyo    Sat      03:45 PM
Sydney   Sat      04:45 PM
```
