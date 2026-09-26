# Color Flipper

Click a button to change the page's background to a random color. It has three modes (CSS color names, hex codes and RGB values), a copy button, and a history of recent colors that you can click to bring back.

## Concepts shown

- `Math.random()` and `Math.floor()` to pick random numbers and array items
- building strings with a `for` loop and **template literals** (`` `rgb(${r}, ${g}, ${b})` ``)
- reading radio buttons with `querySelector('input[name="mode"]:checked')`
- `element.style.backgroundColor` to change CSS from JavaScript
- the **Clipboard API** (`navigator.clipboard.writeText`) with `async/await` and `try/catch`
- arrays as a small history: `unshift()`, `pop()`, `forEach()`
- `createElement()` and `appendChild()` to add elements to the page
- `do...while` so a click never picks the same color twice in a row
- CSS: `transition` on `background-color`, `accent-color`, circular swatches

## Run

Open `index.html` in any browser, or try the [live demo](https://lextabi.github.io/prj_javascript/Color%20Flipper/).

## Sample result

```
Mode: Simple  →  Flip  →  Background: MediumSeaGreen
Mode: Hex     →  Flip  →  Background: #3FA2C7
Mode: RGB     →  Flip  →  Background: rgb(212, 87, 140)
Copy          →  "Copied rgb(212, 87, 140)!"
History       →  ● ● ●   (click a circle to bring that color back)
```
