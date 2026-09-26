// view.js - everything the user sees and does: drawing the board, drag and drop, keyboard.
// It never changes the data directly; it calls Board methods, and the board tells app.js
// (through onChange) to save and redraw.

// ---------- Drawing ----------

// Short date for a card: "Sep 26".
function shortDate(iso) {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Builds the element for one card. User text is always set with textContent.
function createCardElement(card, columnIndex, columnCount) {
    const li = document.createElement('li');
    li.className = 'card';
    li.dataset.id = card.id;
    // draggable="true" lets the user pick this element up with the mouse.
    li.draggable = true;
    // tabindex="0" lets keyboard users focus the card with Tab.
    li.tabIndex = 0;
    li.setAttribute('aria-label', `${card.title}, ${card.priority} priority`);

    const top = document.createElement('div');
    top.className = 'card-top';

    const tag = document.createElement('button');
    tag.type = 'button';
    tag.className = `tag ${card.priority}`;
    tag.dataset.action = 'priority';
    tag.textContent = card.priority;
    tag.title = 'Click to change priority';

    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'icon-btn';
    del.dataset.action = 'delete';
    del.textContent = '✕';
    del.setAttribute('aria-label', `Delete "${card.title}"`);

    top.append(tag, del);

    const title = document.createElement('p');
    title.className = 'title';
    title.textContent = card.title;

    const bottom = document.createElement('div');
    bottom.className = 'card-bottom';

    const date = document.createElement('span');
    date.className = 'date';
    date.textContent = shortDate(card.createdAt);

    // ◀ ▶ buttons: drag and drop does not work on every touch screen, so these always do.
    const moves = document.createElement('span');
    moves.className = 'moves';
    const left = document.createElement('button');
    left.type = 'button';
    left.className = 'icon-btn';
    left.dataset.action = 'left';
    left.textContent = '◀';
    left.setAttribute('aria-label', 'Move to the previous column');
    left.disabled = columnIndex === 0;
    const right = document.createElement('button');
    right.type = 'button';
    right.className = 'icon-btn';
    right.dataset.action = 'right';
    right.textContent = '▶';
    right.setAttribute('aria-label', 'Move to the next column');
    right.disabled = columnIndex === columnCount - 1;
    moves.append(left, right);

    bottom.append(date, moves);
    li.append(top, title, bottom);
    return li;
}

// Draws every column and card. "query" hides cards that do not match the search.
export function renderBoard(board, root, query = '') {
    const search = query.trim().toLowerCase();
    const fragment = document.createDocumentFragment();

    board.columns.forEach((column, columnIndex) => {
        const section = document.createElement('section');
        section.className = `column column-${column.id}`;
        section.dataset.column = column.id;

        // A template literal for the static parts. column.title comes from our own code,
        // and the count is a number, so innerHTML is safe here.
        section.innerHTML = `
            <header class="column-head">
                <h2>${column.title}</h2>
                <span class="count">${column.cards.length}</span>
                ${column.id === 'done' ? '<button type="button" class="link" data-action="clear">Clear</button>' : ''}
            </header>
            <ul class="cards" data-column="${column.id}"></ul>
            <form class="add-form" data-column="${column.id}">
                <label class="visually-hidden" for="add-${column.id}">Add a card to ${column.title}</label>
                <input id="add-${column.id}" name="title" type="text" maxlength="80" placeholder="+ Add a card" autocomplete="off">
            </form>`;

        const list = section.querySelector('.cards');
        for (const card of column.cards) {
            const el = createCardElement(card, columnIndex, board.columns.length);
            // Hidden cards stay in the page (in the same order as the data) so positions still match.
            if (search && !card.title.toLowerCase().includes(search)) el.hidden = true;
            list.appendChild(el);
        }
        fragment.appendChild(section);
    });

    root.replaceChildren(fragment);
}

// ---------- Drag and drop ----------

// Works out where the dragged card would land, from the mouse's height (clientY).
// Returns the first visible card whose middle is below the mouse, or null for "the end".
function cardAfterPointer(list, clientY) {
    const cards = [...list.querySelectorAll('.card:not(.dragging):not([hidden])')];
    return cards.find((card) => {
        // getBoundingClientRect() gives an element's position and size on screen.
        const box = card.getBoundingClientRect();
        return clientY < box.top + box.height / 2;
    }) ?? null;
}

// Counts the cards before the placeholder, not counting the one being dragged.
// Hidden (filtered-out) cards are counted too, so the number matches the data.
function placeholderIndex(list, placeholder) {
    let index = 0;
    for (const child of list.children) {
        if (child === placeholder) break;
        if (child.classList.contains('card') && !child.classList.contains('dragging')) index++;
    }
    return index;
}

function setupDragAndDrop(board, root) {
    let draggedId = null;
    // A dashed box that shows where the card will be dropped.
    const placeholder = document.createElement('li');
    placeholder.className = 'placeholder';

    // 1. dragstart: the user picked up a card.
    root.addEventListener('dragstart', (e) => {
        const card = e.target.closest('.card');
        if (!card) return;
        draggedId = card.dataset.id;
        // dataTransfer carries data with the drag. Firefox will not start a drag without setData.
        e.dataTransfer.setData('text/plain', draggedId);
        e.dataTransfer.effectAllowed = 'move';
        placeholder.style.height = `${card.offsetHeight}px`;
        // Add the class on the next frame, so the "ghost" image under the mouse still looks normal.
        requestAnimationFrame(() => card.classList.add('dragging'));
    });

    // 2. dragover: fires again and again while the card is over something.
    root.addEventListener('dragover', (e) => {
        if (draggedId === null) return;
        const column = e.target.closest('.column');
        if (!column) return;
        // By default, elements do not accept drops. preventDefault() says "you may drop here".
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        const list = column.querySelector('.cards');
        const after = cardAfterPointer(list, e.clientY);
        // insertBefore(x, null) appends at the end, which is what we want when "after" is null.
        if (placeholder.parentElement !== list || placeholder.nextElementSibling !== after) {
            list.insertBefore(placeholder, after);
        }
        root.querySelectorAll('.column.drag-over').forEach((c) => c !== column && c.classList.remove('drag-over'));
        column.classList.add('drag-over');
    });

    // 3. drop: the user let go over a column.
    root.addEventListener('drop', (e) => {
        if (draggedId === null) return;
        e.preventDefault();
        const list = placeholder.parentElement;
        if (!list) return;
        const index = placeholderIndex(list, placeholder);
        const id = draggedId;
        cleanUp();
        // Changing the board triggers onChange → save and redraw.
        board.moveCard(id, list.dataset.column, index);
    });

    // 4. dragend: always fires at the end, even if the card was dropped outside the board.
    root.addEventListener('dragend', cleanUp);

    function cleanUp() {
        draggedId = null;
        placeholder.remove();
        root.querySelectorAll('.dragging').forEach((el) => el.classList.remove('dragging'));
        root.querySelectorAll('.drag-over').forEach((el) => el.classList.remove('drag-over'));
    }
}

// ---------- Renaming ----------

function startRename(board, cardEl) {
    const titleEl = cardEl.querySelector('.title');
    const input = document.createElement('input');
    input.className = 'rename';
    input.value = titleEl.textContent;
    input.maxLength = 80;
    titleEl.replaceWith(input);
    // While renaming, stop the card from being dragged (so text can be selected with the mouse).
    cardEl.draggable = false;
    input.focus();
    input.select();

    let done = false;
    const finish = (save) => {
        if (done) return;
        done = true;
        if (save && input.value.trim() && input.value.trim() !== titleEl.textContent) {
            board.renameCard(cardEl.dataset.id, input.value);   // triggers a redraw
        } else {
            input.replaceWith(titleEl);                          // put the old title back
            cardEl.draggable = true;
            cardEl.focus();
        }
    };

    input.addEventListener('keydown', (e) => {
        e.stopPropagation();          // keep Enter / arrow keys away from the card's shortcuts
        if (e.key === 'Enter') finish(true);
        if (e.key === 'Escape') finish(false);
    });
    input.addEventListener('blur', () => finish(true));
}

// ---------- Clicks, forms and keyboard ----------

// Asks app.js to put the focus back on a card after the board is redrawn.
let focusAfterRender = null;

export function takeFocusRequest() {
    const id = focusAfterRender;
    focusAfterRender = null;
    return id;
}

export function setupEvents(board, root) {
    setupDragAndDrop(board, root);

    // One click listener for every button on the board (event delegation).
    root.addEventListener('click', (e) => {
        const button = e.target.closest('[data-action]');
        if (!button) return;
        const cardEl = button.closest('.card');
        const id = cardEl?.dataset.id;

        // A switch on the button's data-action.
        switch (button.dataset.action) {
            case 'priority':
                focusAfterRender = id;
                board.cyclePriority(id);
                break;
            case 'delete':
                board.deleteCard(id);
                break;
            case 'left':
                focusAfterRender = id;
                board.moveCardSideways(id, -1);
                break;
            case 'right':
                focusAfterRender = id;
                board.moveCardSideways(id, 1);
                break;
            case 'clear': {
                const column = button.closest('.column').dataset.column;
                const count = board.getColumn(column).cards.length;
                if (count && confirm(`Delete all ${count} cards in Done?`)) board.clearColumn(column);
                break;
            }
        }
    });

    // Adding a card: each column has a small form; Enter submits it.
    root.addEventListener('submit', (e) => {
        e.preventDefault();
        const form = e.target;
        const columnId = form.dataset.column;
        const title = form.elements.title.value;
        if (board.addCard(columnId, title)) {
            // After the redraw, put the cursor back in the same column's input for the next card.
            requestAnimationFrame(() => document.getElementById(`add-${columnId}`)?.focus());
        }
    });

    root.addEventListener('dblclick', (e) => {
        const cardEl = e.target.closest('.card');
        if (cardEl && !e.target.closest('button')) startRename(board, cardEl);
    });

    // Keyboard shortcuts on a focused card.
    root.addEventListener('keydown', (e) => {
        const cardEl = e.target.closest('.card');
        if (!cardEl || e.target !== cardEl) return;   // ignore keys typed inside inputs
        const id = cardEl.dataset.id;

        if (e.key === 'Enter') {
            e.preventDefault();
            startRename(board, cardEl);
            return;
        }
        if (!e.altKey) return;

        // An object used as a lookup table: key name → what to do.
        const moves = {
            ArrowLeft: () => board.moveCardSideways(id, -1),
            ArrowRight: () => board.moveCardSideways(id, 1),
            ArrowUp: () => board.moveCardVertically(id, -1),
            ArrowDown: () => board.moveCardVertically(id, 1),
        };
        if (moves[e.key]) {
            e.preventDefault();
            focusAfterRender = id;
            moves[e.key]();
        }
    });
}
