// To-Do List - an array of task objects, saved in localStorage and drawn on the page.
//
// The pattern used here is common in real apps:
//   1. keep the data in one place (the "tasks" array)
//   2. change the data when the user does something
//   3. save it and re-draw the page from the data (render)

// ---------- Elements ----------

const form = document.getElementById('new-form');
const input = document.getElementById('new-task');
const list = document.getElementById('task-list');
const emptyMsg = document.getElementById('empty');
const countEl = document.getElementById('count');
const clearBtn = document.getElementById('clear-completed');
const filterButtons = document.querySelectorAll('#filters button');

document.getElementById('today').textContent = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'short', day: 'numeric',
});

// ---------- Data ----------

const STORAGE_KEY = 'todo-tasks';

// Each task looks like: { id: 1, text: 'Buy milk', done: false }
let tasks = loadTasks();
let filter = 'all';                   // 'all' | 'active' | 'completed'

// localStorage only stores strings, so we convert with JSON.
function loadTasks() {
    try {
        // JSON.parse turns the saved string back into an array. "|| '[]'" handles the first visit.
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        // Array.isArray() guards against valid JSON that is not a list, like {}.
        return Array.isArray(saved) ? saved : [];
    } catch {
        // If the saved data is broken, start fresh instead of crashing.
        return [];
    }
}

function saveTasks() {
    // JSON.stringify turns the array into a string like '[{"id":1,"text":"Buy milk","done":false}]'.
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// ---------- Changing the data ----------

function addTask(text) {
    // A unique id: one more than the biggest id so far.
    // map() gives an array of ids, and the spread (...) passes them to Math.max as separate arguments.
    const id = Math.max(0, ...tasks.map((t) => t.id)) + 1;
    tasks.push({
        id,                           // shorthand for id: id
        text,                         // shorthand for text: text
        done: false,
    });
    update();
}

function toggleTask(id) {
    // find() returns the first item that matches, or undefined.
    const task = tasks.find((t) => t.id === id);
    if (task) task.done = !task.done;
    update();
}

function deleteTask(id) {
    // filter() returns a NEW array with only the items where the test is true.
    tasks = tasks.filter((t) => t.id !== id);
    update();
}

function editTask(id, newText) {
    const task = tasks.find((t) => t.id === id);
    // An empty edit deletes the task, like in most to-do apps.
    if (newText === '') {
        deleteTask(id);
        return;
    }
    if (task) task.text = newText;
    update();
}

function clearCompleted() {
    tasks = tasks.filter((t) => !t.done);
    update();
}

// Save, then re-draw. Every change goes through here.
function update() {
    saveTasks();
    render();
}

// ---------- Drawing ----------

// Builds the <li> for one task. We use createElement + textContent (never innerHTML)
// for the task text, so a task like "<b>hi</b>" is shown as text and cannot inject HTML.
function createTaskElement(task) {
    const li = document.createElement('li');
    li.className = task.done ? 'task done' : 'task';
    // dataset.id stores the id on the element (as data-id="...") so events can find the task.
    li.dataset.id = task.id;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.done;
    checkbox.setAttribute('aria-label', `Mark "${task.text}" as done`);

    const text = document.createElement('span');
    text.className = 'text';
    text.textContent = task.text;

    const del = document.createElement('button');
    del.className = 'delete';
    del.type = 'button';
    del.textContent = '✕';
    del.setAttribute('aria-label', `Delete "${task.text}"`);

    // append() can add several children at once.
    li.append(checkbox, text, del);
    return li;
}

function render() {
    // Pick the tasks the current filter should show.
    const visible = tasks.filter((t) => {
        if (filter === 'active') return !t.done;
        if (filter === 'completed') return t.done;
        return true;
    });

    list.innerHTML = '';
    visible.forEach((task) => list.appendChild(createTaskElement(task)));

    // Empty-state message depends on why the list is empty.
    emptyMsg.hidden = visible.length > 0;
    if (tasks.length === 0) emptyMsg.textContent = 'Nothing here yet. Add your first task above ✨';
    else if (filter === 'active') emptyMsg.textContent = 'All done! 🎉';
    else emptyMsg.textContent = 'No completed tasks yet.';

    const left = tasks.filter((t) => !t.done).length;
    countEl.textContent = `${left} ${left === 1 ? 'item' : 'items'} left`;

    // some() is true if at least one item matches.
    clearBtn.disabled = !tasks.some((t) => t.done);
}

// ---------- Editing (double-click) ----------

function startEditing(li) {
    const id = Number(li.dataset.id);
    const textEl = li.querySelector('.text');

    const editor = document.createElement('input');
    editor.className = 'edit';
    editor.value = textEl.textContent;
    editor.maxLength = 120;
    // replaceWith() swaps the <span> for the <input> in the same spot.
    textEl.replaceWith(editor);
    editor.focus();
    editor.select();                  // highlight the text so typing replaces it

    // finish() is called once, when the user presses Enter/Escape or clicks away.
    let finished = false;
    function finish(save) {
        if (finished) return;
        finished = true;
        if (save) editTask(id, editor.value.trim());
        else render();                // Escape: throw away the changes
    }

    editor.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') finish(true);
        if (e.key === 'Escape') finish(false);
    });
    // 'blur' fires when the input loses focus (the user clicked somewhere else).
    editor.addEventListener('blur', () => finish(true));
}

// ---------- Events ----------

form.addEventListener('submit', (e) => {
    e.preventDefault();
    // trim() removes spaces at the start and end, so "   " counts as empty.
    const text = input.value.trim();
    if (text === '') return;
    addTask(text);
    input.value = '';
    input.focus();
});

// EVENT DELEGATION: instead of adding listeners to every task (which are re-created on
// each render), we add ONE listener to the list and check what was actually clicked.
list.addEventListener('click', (e) => {
    // closest() walks up from the clicked element to find the nearest matching ancestor.
    const li = e.target.closest('.task');
    if (!li) return;
    const id = Number(li.dataset.id);

    // matches() checks whether an element fits a CSS selector.
    if (e.target.matches('input[type="checkbox"]')) toggleTask(id);
    if (e.target.matches('.delete')) deleteTask(id);
});

list.addEventListener('dblclick', (e) => {
    if (e.target.matches('.text')) startEditing(e.target.closest('.task'));
});

filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
        filter = btn.dataset.filter;
        filterButtons.forEach((b) => b.classList.toggle('active', b === btn));
        render();
    });
});

clearBtn.addEventListener('click', clearCompleted);

// Draw whatever was saved from the last visit.
render();
