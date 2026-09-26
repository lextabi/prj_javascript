// storage.js - saving and loading the board. The only file that knows about localStorage.

// "import { Board } from './models.js'" loads just the Board export from models.js.
// The path must start with ./ (same folder) and include the .js extension.
import { Board } from './models.js';

const STORAGE_KEY = 'kanban-board';

// Returns the saved Board, or null if nothing (valid) was saved yet.
export function loadBoard() {
    try {
        return Board.fromJSON(JSON.parse(localStorage.getItem(STORAGE_KEY)));
    } catch {
        return null;
    }
}

export function saveBoard(board) {
    // JSON.stringify uses board.toJSON(), which returns only the columns and cards.
    localStorage.setItem(STORAGE_KEY, JSON.stringify(board));
}
