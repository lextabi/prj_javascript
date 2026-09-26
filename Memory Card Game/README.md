# Memory Card Game

Flip two cards at a time to find all the matching pairs. There are three board sizes, a move counter, a timer that starts on your first flip, and a star rating. The best result for each level is kept between visits.

## Concepts shown

- the **Fisher–Yates shuffle**, and why `sort(() => Math.random() - 0.5)` is not fair
- a **lock** flag so a third card cannot be flipped while two wrong cards are showing
- `setTimeout()` / `clearTimeout()` for the flip-back delay, `setInterval()` / `clearInterval()` for the game clock
- `data-*` attributes to store each card's symbol, `aria-label`s that follow the card's state
- `DocumentFragment` + `replaceChildren()` to add many elements in one go
- spread to double an array (`[...chosen, ...chosen]`), `slice()`, `String.repeat()` for stars
- the built-in **`<dialog>`** element with `showModal()`, `method="dialog"` and the `close` event
- `localStorage` with a separate key for each level
- CSS: a **3D card flip** (`perspective`, `transform-style: preserve-3d`, `backface-visibility: hidden`, `rotateY`), a Grid whose column count comes from a CSS variable set by JavaScript (also used in `calc()`), `::backdrop`, `repeating-linear-gradient`

## Levels

| Level | Board | Pairs | 3 stars | 2 stars |
|---|---|---|---|---|
| Easy | 4 × 3 | 6 | ≤ 9 moves | ≤ 13 moves |
| Normal | 4 × 4 | 8 | ≤ 12 moves | ≤ 17 moves |
| Hard | 6 × 6 | 18 | ≤ 27 moves | ≤ 39 moves |

## Run

Open `index.html` in any browser, or try the [live demo](https://lextabi.github.io/prj_javascript/Memory%20Card%20Game/).

## Sample result

```
Moves: 14    Time: 0:42    Pairs: 8 / 8    Best: 14 moves

┌──────────────────────────────┐
│        🎉 You did it!        │
│           ★ ★ ☆              │
│ You found all 8 pairs in 14  │
│ moves and 0:42. 🏆 New best! │
│         [Play again]         │
└──────────────────────────────┘
```
