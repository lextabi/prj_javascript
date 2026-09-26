# Calculator

A phone-style calculator with chained operations, percent, ±, backspace, full keyboard support and a friendly divide-by-zero message. It never uses `eval()`: the maths is done by a small, readable state machine.

## Concepts shown

- a **state object** (`current`, `previous`, `operator`, `waiting`, `done`) and clear rules for how each key changes it
- **event delegation**: one `click` listener on the key grid, using `data-action` / `data-value`
- keyboard support: mapping `e.key` to the same actions as the buttons, using a **regular expression** (`/^[0-9]$/`)
- why **`0.1 + 0.2 !== 0.3`**, and fixing it with `toPrecision()`
- `throw new Error()` + `try/catch` for divide by zero
- string methods: `slice()`, `includes()`, `startsWith()`, `split()`, `replace()` with a regex
- `toLocaleString()` for thousands separators
- why not to use `eval()`
- CSS: a **Grid** of round keys with `aspect-ratio: 1`, `text-overflow: ellipsis`, `filter: brightness()`, `touch-action`

## Run

Open `index.html` in any browser, or try the [live demo](https://lextabi.github.io/prj_javascript/Calculator/).

## Keyboard

| Key | Action |
|---|---|
| `0`–`9`, `.` | Type a number |
| `+` `-` `*` `/` (or `x`) | Operators |
| `Enter` or `=` | Equals |
| `Backspace` | Delete the last digit |
| `Esc` | Clear all (AC) |
| `%` | Percent |

## Sample result

```
0.1 + 0.2 =          →  0.3              (not 0.30000000000000004)
12 + 7 − 5 × 2 =     →  28               (left to right: 19, 14, 28)
1234567 × 1000 =     →  1,234,567,000
250 × 8 % =          →  20               (8 % → 0.08)
9 ÷ 0 =              →  Can't divide by 0
```
