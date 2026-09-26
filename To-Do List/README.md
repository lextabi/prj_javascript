# To-Do List

A to-do app that remembers your tasks after you close the browser. You can add, complete, edit (double-click), delete and filter tasks, and clear all the finished ones in one go.

## Concepts shown

- **`localStorage`** with `JSON.stringify()` / `JSON.parse()` to save an array of objects between visits
- the **data → render** pattern: change the `tasks` array, save it, redraw the list from it
- array methods: `push()`, `map()`, `find()`, `filter()`, `some()`, `forEach()`, and the spread operator in `Math.max(0, ...ids)`
- `createElement()` + `textContent` (safe, no HTML injection) instead of `innerHTML` for user text
- **event delegation**: one listener on the `<ul>` handles every task using `closest()` and `matches()`
- `data-*` attributes (`li.dataset.id`) to link an element to its data
- inline editing with `dblclick`, `replaceWith()`, `keydown` (Enter / Escape) and `blur`
- `try/catch` so corrupted saved data does not break the app
- CSS: `:focus-within` and `@media (hover: none)` to show the delete button, `@keyframes` slide-in, `text-decoration: line-through`

## Run

Open `index.html` in any browser, or try the [live demo](https://lextabi.github.io/prj_javascript/To-Do%20List/).

Your tasks are stored in your own browser (`localStorage`), so they are still there when you reload the page.

## Sample result

```
To-Do                                  Saturday, Sep 26

[ What needs to be done?          ] [Add]

(All)  Active  Completed
[x] Buy milk               (crossed out)
[ ] Finish JavaScript portfolio
[ ] Call mom                              ✕

2 items left                     Clear completed
```
