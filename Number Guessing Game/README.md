# Number Guessing Game

The computer picks a secret number and you guess it with higher/lower hints. It has three difficulty levels, a bar that shrinks to show which numbers are still possible, colored chips for your earlier guesses, and a best score for each level that is kept between visits.

The browser version of the [prj_powshl Number Guessing Game](https://github.com/lextabi/prj_powshl).

## Concepts shown

- a single **game state object** (`game.secret`, `game.triesLeft`, ...) that the page is drawn from
- a `<form>` with the `submit` event, so both the button and the **Enter** key work, plus `event.preventDefault()`
- input validation before a try is used (empty, not a whole number, out of range, already guessed)
- `Math.random()` for a number in a range, `Math.min()` / `Math.max()` to narrow the range
- `if / else if / else` for the hints, `array.includes()` to catch repeated guesses
- **destructuring** (`const { max, tries } = LEVELS[level]`)
- `localStorage` for the best score on each level
- `hidden` and `disabled` to show or lock parts of the page
- CSS: `@keyframes` shake (restarted with the reflow trick), `flex-wrap` chips, a `visually-hidden` label

## Levels

| Level | Range | Tries |
|---|---|---|
| Easy | 1 to 50 | 10 |
| Normal | 1 to 100 | 7 |
| Hard | 1 to 500 | 9 |

## Run

Open `index.html` in any browser, or try the [live demo](https://lextabi.github.io/prj_javascript/Number%20Guessing%20Game/).

## Sample result

```
I'm thinking of a number between 1 and 50. You have 10 tries.

abc  →  Please type a whole number.
25   →  ⬆️ Higher than 25!      1 [██████████████████] 50  →  26 [█████████] 50
37   →  ⬇️ Lower than 37!
31   →  🎉 Correct! You got it in 3 tries. New best!

Tries left: 7     Best: 3 tries
Guesses: (25) (37) (31)
```
