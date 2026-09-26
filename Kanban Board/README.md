# Kanban Board

A Trello-style board with **To Do**, **In Progress** and **Done** columns. You can drag cards between and within columns, add, rename and delete cards, change their priority, and search. It also works with the keyboard and on touch screens, and everything is saved in your browser.

The code is split into **ES modules**, each with one job:

| File | Job |
|---|---|
| `js/models.js` | The data: `Card` and `Board` classes. No DOM code at all. |
| `js/storage.js` | Saving and loading the board with `localStorage`. |
| `js/view.js` | Drawing the board, drag and drop, clicks and keyboard shortcuts. |
| `js/app.js` | The entry point that connects the other three. |

## Concepts shown

- **ES modules**: `<script type="module">`, `export`, `import { ... } from './file.js'`
- **classes**: `constructor`, methods, `static` methods (`Board.createDefault()`, `Board.fromJSON()`), **private fields and methods** (`#listeners`, `#emit()`), `toJSON()`
- the **observer pattern**: `board.onChange(fn)` so saving and redrawing happen automatically after every change
- separating **data from display** (models vs view)
- the **HTML Drag and Drop API**: `draggable`, `dragstart`, `dragover` + `preventDefault()`, `drop`, `dragend`, `dataTransfer`, and working out the drop position with `getBoundingClientRect()`
- array editing with `splice()` (remove, insert), `findIndex()`, destructuring with default values
- **accessibility**: focusable cards (`tabindex`), `Alt` + arrow key moves, focus kept after a redraw, ◀ ▶ buttons for touch screens
- `requestAnimationFrame()`, `CSS.escape()`, `crypto.randomUUID()` with a fallback, `confirm()`
- CSS: Grid on desktop and a swipeable row with **scroll-snap** on phones, `cursor: grab`, `@media (hover: none)`, per-column custom properties

## Run

ES modules are not allowed to load from `file://` pages (the browser blocks them for security), so **double-clicking `index.html` will not work**. Use one of these instead:

- the [live demo](https://lextabi.github.io/prj_javascript/Kanban%20Board/)
- VS Code: right-click `index.html` → **Open with Live Server** (Live Server extension)
- any small local web server run from the repo folder, for example `python -m http.server 8000`, then open <http://localhost:8000/Kanban%20Board/>

## How to use

| Action | Mouse / touch | Keyboard (card focused) |
|---|---|---|
| Move to another column | drag it, or ◀ ▶ | `Alt` + `←` / `→` |
| Reorder in a column | drag it | `Alt` + `↑` / `↓` |
| Rename | double-click | `Enter` |
| Change priority | click the colored tag | Tab to the tag, `Enter` |
| Add | type in "+ Add a card", press Enter | |
| Delete | ✕ | Tab to ✕, `Enter` |

## Sample result

```
📋 Kanban                                            [Search cards…]

● To Do  3                  ● In Progress  2             ● Done  1          Clear
┌──────────────────────┐    ┌──────────────────────┐    ┌──────────────────────┐
│ MEDIUM            ✕  │    │ HIGH              ✕  │    │ LOW               ✕  │
│ Write the project    │    │ Design the landing   │    │ Set up the GitHub    │
│ README               │    │ page                 │    │ repo                 │
│ Sep 26          ◀ ▶  │    │ Sep 26          ◀ ▶  │    │ Sep 26          ◀ ▶  │
└──────────────────────┘    └──────────────────────┘    └──────────────────────┘
  + Add a card                + Add a card                + Add a card
```

In the browser console, `kanban.columns` shows the live data.
