# Counter App

A number you can increase, decrease and reset. It turns green above zero and red below zero, has a custom step size, and works with the keyboard too.

## Concepts shown

- `document.getElementById()` to find elements
- `addEventListener()` for `click` and `keydown` events
- `textContent` to change what is shown on the page
- `classList.toggle()` / `add()` / `remove()` to change styles from JavaScript
- keeping **state** in a variable (`let count`) and re-drawing the page from it
- `Number()` and `Number.isInteger()` to read input safely
- `switch` on `e.key` for keyboard shortcuts, `e.preventDefault()`
- CSS: flexbox centering, `transition`, `:hover` / `:active` / `:focus-visible`

## Run

Open `index.html` in any browser (double-click it), or try the [live demo](https://lextabi.github.io/prj_javascript/Counter%20App/).

## How to use

| Action | Mouse | Keyboard |
|---|---|---|
| Add the step | **+** | `↑` |
| Remove the step | **−** | `↓` |
| Back to zero | **Reset** | `R` |

## Sample result

```
Step: 5
Click + three times   →  15  (green)
Press ↓ four times    →  -5  (red)
Press R               →   0  (default color)
```
