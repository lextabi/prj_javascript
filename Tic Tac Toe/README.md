# Tic Tac Toe

The classic game for two players on one device, or against the computer. The winning line lights up, the scoreboard is saved between visits, and the first player alternates each round.

## Concepts shown

- the board as **data**: `Array(9).fill(null)`, and the page drawn from it
- **win detection** with a list of the 8 winning lines and destructuring (`const [a, b, c] = line`)
- a **pure function** (`getResult(board)`) that works on any board, so the computer can test "what if" moves on a copy (`[...board]`)
- a rule-based **computer player**: win → block → centre → corner → side
- `every()`, `map()` + `filter()` to list empty cells, `Math.floor(i / 3)` / `i % 3` for rows and columns
- `setTimeout()` for the computer's "thinking" delay while the board is locked
- event delegation, `disabled` buttons, and `aria-label`s that update with each move
- `localStorage` + JSON for the scoreboard, `??` for defaults
- CSS: a Grid board with `aspect-ratio`, `clamp()` font size, `@keyframes` pop-in, inset `box-shadow`

## Run

Open `index.html` in any browser, or try the [live demo](https://lextabi.github.io/prj_javascript/Tic%20Tac%20Toe/).

## Sample result

```
Mode: 🤖 vs Computer

 X | O | X
---+---+---
   | O |
---+---+---
   | O | X        Computer wins! 🎉   (the middle column lights up)

You (X): 2     Draws: 1     Computer (O): 3
```
