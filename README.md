# prj_javascript

A collection of HTML, CSS and JavaScript projects I built to practise front-end development, from the basics up to complete little apps.

**▶ Live site: <https://lextabi.github.io/prj_javascript/>** (every project runs in the browser)

Every project is:

- **one folder**, written in **plain HTML, CSS and JavaScript**, with no frameworks, libraries or build tools
- **commented line by line** like a tutorial, so you can follow how the code was built
- documented with its own `README.md` listing the concepts it shows and some sample output
- responsive (it works on phones) and usable with the keyboard

## Projects

### Fundamentals

| # | Project | What it does | Main concepts |
|---|---|---|---|
| 1 | [Counter App](Counter%20App/) | Increase, decrease and reset a number | `getElementById`, `addEventListener`, `textContent`, `classList` |
| 2 | [Color Flipper](Color%20Flipper/) | Random background colors with copy and history | `Math.random`, template literals, **Clipboard API** |
| 3 | [Digital Clock](Digital%20Clock/) | Live clock, date, greeting and world clocks | `Date`, `setInterval`, `padStart`, `toLocaleTimeString` + `timeZone` |
| 4 | [Tip Calculator](Tip%20Calculator/) | Split a bill with tip between people | form inputs, validation, `Intl.NumberFormat`, **CSS Grid** |
| 5 | [Number Guessing Game](Number%20Guessing%20Game/) | Higher/lower hints, three levels, best scores | game state object, `submit` event, `localStorage` |
| 6 | [Unit Converter](Unit%20Converter/) | Length, weight and temperature, both ways | **lookup objects**, functions as values, destructuring |

### Intermediate

| # | Project | What it does | Main concepts |
|---|---|---|---|
| 7 | [To-Do List](To-Do%20List/) | Tasks saved between visits, with filters and editing | **`localStorage` + JSON**, data → render, **event delegation** |
| 8 | [Calculator](Calculator/) | Phone-style calculator with keyboard support | state machine (no `eval`), regex, floating-point fix |
| 9 | [Form Validation](Form%20Validation/) | Sign-up form with live errors and password strength | **Constraint Validation API**, regex, ARIA |
| 10 | [Quiz App](Quiz%20App/) | Timed quiz with explanations and a review | data-driven UI, `setInterval`/`clearInterval`, `map`/`filter` |
| 11 | [Tic Tac Toe](Tic%20Tac%20Toe/) | Two players or against the computer | win detection, pure functions, a rule-based AI |
| 12 | [Memory Card Game](Memory%20Card%20Game/) | Find the pairs, with levels, timer and stars | **Fisher–Yates shuffle**, 3D CSS flip, `<dialog>` |

### Advanced

| # | Project | What it does | Main concepts |
|---|---|---|---|
| 13 | [Weather App](Weather%20App/) | Current weather and 7-day forecast for any city | **`fetch`, `async/await`**, error handling, `AbortController` |
| 14 | [Expense Tracker](Expense%20Tracker/) | Monthly income/expenses with a chart and CSV export | **`reduce`**, **Canvas API**, `Blob` download |
| 15 | [Kanban Board](Kanban%20Board/) | Drag-and-drop task board | **ES modules**, **classes**, **Drag and Drop API** |

## Requirements

- Any modern browser (Chrome, Edge, Firefox or Safari)
- Internet access only for the **Weather App**

Nothing to install: there is no `npm install` and no build step.

## Run

The easiest way is the [live site](https://lextabi.github.io/prj_javascript/).

To run a project from your own computer, open its `index.html` in a browser (double-click it). For example:

```
Counter App/index.html
Weather App/index.html
```

The one exception is **Kanban Board**, which uses ES modules. Browsers block modules on `file://` pages, so serve the folder with any small local web server instead, for example:

```powershell
python -m http.server 8000
# then open http://localhost:8000/Kanban%20Board/
```

or right-click `index.html` in VS Code → **Open with Live Server**.

## More

- [prj_powshl](https://github.com/lextabi/prj_powshl): PowerShell scripts, from the basics to real-world automation
