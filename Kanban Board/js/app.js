// app.js - the entry point. It connects the pieces from the other modules:
//   models.js  → the data (Board, Card)
//   storage.js → saving and loading
//   view.js    → drawing and user input

import { Board } from './models.js';
import { loadBoard, saveBoard } from './storage.js';
// Several named imports from one file, separated by commas.
import { renderBoard, setupEvents, takeFocusRequest } from './view.js';

const root = document.getElementById('board');
const searchInput = document.getElementById('search');

// Use the saved board, or the starter board on the first visit.
// ?? picks the right side only when the left side is null or undefined.
const board = loadBoard() ?? Board.createDefault();

// Redraws the board and restores keyboard focus if a card asked for it.
function redraw() {
    renderBoard(board, root, searchInput.value);
    const id = takeFocusRequest();
    if (id) root.querySelector(`.card[data-id="${CSS.escape(id)}"]`)?.focus();
}

// The observer pattern in action: whenever the board changes, save it and redraw it.
board.onChange(() => {
    saveBoard(board);
    redraw();
});

searchInput.addEventListener('input', redraw);

setupEvents(board, root);
saveBoard(board);          // make sure a first-time starter board is saved too
redraw();

// Expose the board in the browser console for curious readers: try  kanban.columns
// (Modules do not create global variables, so we attach it to window on purpose.)
window.kanban = board;
