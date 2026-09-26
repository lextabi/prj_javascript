# Quiz App

A 10-question quiz about JavaScript, HTML and CSS. Each question has a 15-second timer, and you see instantly whether you were right, with a short explanation. At the end you get a score ring and a review of the questions you missed, and your best score is kept between visits.

## Concepts shown

- **data-driven UI**: the questions are an array of objects in their own file (`questions.js`), and the screen is built from them
- three screens in one page, switched with the `hidden` attribute
- `setInterval()` / `clearInterval()` for a countdown that is cleaned up properly
- array methods: `map()`, `filter()`, `slice()`, `indexOf()`, `forEach()`, plus a **Fisher–Yates shuffle** that returns a copy
- the **spread** operator for arrays and objects (`[...array]`, `{ ...q, answers }`)
- `Object.entries()` with `for...of` and destructuring
- `replaceChildren()` / `append()` with plain strings, so question text like `<script>` is shown safely
- the `??` (nullish coalescing) operator, `localStorage` for the high score
- keyboard shortcuts (1–4) that share the click handler
- CSS: a score ring drawn with **`conic-gradient`** and a custom property set from JavaScript (`style.setProperty('--percent', ...)`), `place-items: center`

## Run

Open `index.html` in any browser, or try the [live demo](https://lextabi.github.io/prj_javascript/Quiz%20App/).

To add your own questions, edit `questions.js`. The app picks 10 at random each game.

## Sample result

```
Question 3 / 10                                ⏱ 11
[██████░░░░░░░░░░░░░░]
What is the result of 0.1 + 0.2 === 0.3?
 1  true
 2  false        ✓ (green)
 3  undefined
 4  It throws an error
Correct! Binary floating point makes 0.1 + 0.2 equal 0.30000000000000004.

──────── results ────────
Well done! 🎉        ( 8 / 10 )
You scored 80%. You clearly know your stuff. New high score!

Review your mistakes
1. What does typeof null return?
   Your answer: "undefined"
   Correct: "object"
```
