// models.js - the DATA of the app, with no DOM code at all.
// Keeping data and display separate means this file could be reused with a different UI,
// or tested on its own.

// "export" makes a value available to other files that import it.
export const PRIORITIES = ['low', 'medium', 'high'];

// A unique id for each card. crypto.randomUUID() gives something like "3b241101-e2bb-4255-8caf-4136c566a962".
// It only exists on secure pages (https or localhost), so fall back to time + random text.
function makeId() {
    return crypto.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

// ---------- Card ----------

// A class is a blueprint for objects. "new Card({ title: 'Hi' })" creates one.
export class Card {
    // The constructor runs when a new Card is created.
    // Destructuring with defaults: any value not passed in gets the value after "=".
    constructor({ id = makeId(), title, priority = 'medium', createdAt = new Date().toISOString() }) {
        this.id = id;
        this.title = title;
        this.priority = PRIORITIES.includes(priority) ? priority : 'medium';
        this.createdAt = createdAt;
    }

    // A method: a function that belongs to every Card.
    // It moves to the next priority: low → medium → high → low.
    cyclePriority() {
        const next = (PRIORITIES.indexOf(this.priority) + 1) % PRIORITIES.length;
        this.priority = PRIORITIES[next];
    }
}

// ---------- Board ----------

export class Board {
    // A private field (the # prefix): only code inside this class can see it.
    // Other files cannot accidentally change the list of listeners.
    #listeners = [];

    constructor(columns) {
        // columns: [{ id: 'todo', title: 'To Do', cards: [Card, ...] }, ...]
        this.columns = columns;
    }

    // A static method belongs to the class itself, not to one board: Board.createDefault().
    static createDefault() {
        const card = (title, priority) => new Card({ title, priority });
        return new Board([
            {
                id: 'todo',
                title: 'To Do',
                cards: [
                    card('Write the project README', 'medium'),
                    card('Add dark mode', 'low'),
                    card('Fix login bug on mobile', 'high'),
                ],
            },
            {
                id: 'doing',
                title: 'In Progress',
                cards: [card('Design the landing page', 'high'), card('Learn ES modules', 'medium')],
            },
            {
                id: 'done',
                title: 'Done',
                cards: [card('Set up the GitHub repo', 'low')],
            },
        ]);
    }

    // Rebuilds a Board (with real Card objects and their methods) from plain saved JSON data.
    static fromJSON(data) {
        if (!data || !Array.isArray(data.columns)) return null;
        return new Board(data.columns.map((column) => ({
            id: String(column.id),
            title: String(column.title),
            cards: Array.isArray(column.cards) ? column.cards.map((c) => new Card(c)) : [],
        })));
    }

    // JSON.stringify() calls toJSON() automatically, so private fields and methods are left out.
    toJSON() {
        return { columns: this.columns };
    }

    // ----- The observer pattern -----
    // Other code says "call me when the board changes" with onChange(fn).
    // Every change method below calls #emit(), so the view and storage stay in sync.
    onChange(fn) {
        this.#listeners.push(fn);
    }

    // A private method: only the class itself can call it.
    #emit() {
        this.#listeners.forEach((fn) => fn(this));
    }

    // ----- Finding things -----

    getColumn(columnId) {
        return this.columns.find((column) => column.id === columnId);
    }

    // Returns { column, index, card } for a card id, or null when it does not exist.
    findCard(cardId) {
        for (const column of this.columns) {
            const index = column.cards.findIndex((card) => card.id === cardId);
            if (index !== -1) return { column, index, card: column.cards[index] };
        }
        return null;
    }

    // ----- Changing things -----

    addCard(columnId, title, priority = 'medium') {
        const column = this.getColumn(columnId);
        const clean = title.trim();
        if (!column || !clean) return null;
        const card = new Card({ title: clean, priority });
        column.cards.push(card);
        this.#emit();
        return card;
    }

    renameCard(cardId, title) {
        const found = this.findCard(cardId);
        const clean = title.trim();
        if (!found || !clean || found.card.title === clean) return;
        found.card.title = clean;
        this.#emit();
    }

    cyclePriority(cardId) {
        const found = this.findCard(cardId);
        if (!found) return;
        found.card.cyclePriority();
        this.#emit();
    }

    deleteCard(cardId) {
        const found = this.findCard(cardId);
        if (!found) return;
        // splice(index, 1) removes one item at that position.
        found.column.cards.splice(found.index, 1);
        this.#emit();
    }

    // Moves a card to a column at a position. toIndex counts the cards in the target
    // column WITHOUT the moving card, which is exactly what the drag-and-drop code measures.
    moveCard(cardId, toColumnId, toIndex) {
        const found = this.findCard(cardId);
        const target = this.getColumn(toColumnId);
        if (!found || !target) return;

        // Take the card out...
        const [card] = found.column.cards.splice(found.index, 1);
        // ...and put it back in at the new position, kept within the list's bounds.
        const index = Math.max(0, Math.min(toIndex, target.cards.length));
        // splice(index, 0, item) inserts without removing anything.
        target.cards.splice(index, 0, card);
        this.#emit();
    }

    // Moves a card one column left (-1) or right (+1), keeping it at a similar height.
    moveCardSideways(cardId, direction) {
        const found = this.findCard(cardId);
        if (!found) return;
        const columnIndex = this.columns.indexOf(found.column) + direction;
        const target = this.columns[columnIndex];
        if (!target) return;                 // already in the first or last column
        this.moveCard(cardId, target.id, found.index);
    }

    // Moves a card one place up (-1) or down (+1) inside its column.
    moveCardVertically(cardId, direction) {
        const found = this.findCard(cardId);
        if (!found) return;
        const newIndex = found.index + direction;
        if (newIndex < 0 || newIndex >= found.column.cards.length) return;
        this.moveCard(cardId, found.column.id, newIndex);
    }

    clearColumn(columnId) {
        const column = this.getColumn(columnId);
        if (!column || column.cards.length === 0) return;
        column.cards = [];
        this.#emit();
    }
}
