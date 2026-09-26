// Expense Tracker - reduce() for totals, a hand-drawn <canvas> chart, localStorage and a CSV download.

// ---------- Settings ----------

// Categories with an emoji and a chart color.
const CATEGORIES = {
    expense: {
        Food: { icon: '🍜', color: '#f97316' },
        Transport: { icon: '🚌', color: '#0ea5e9' },
        Bills: { icon: '💡', color: '#8b5cf6' },
        Shopping: { icon: '🛍️', color: '#ec4899' },
        Health: { icon: '💊', color: '#10b981' },
        Fun: { icon: '🎬', color: '#eab308' },
        Other: { icon: '📦', color: '#94a3b8' },
    },
    income: {
        Salary: { icon: '💼', color: '#059669' },
        Freelance: { icon: '💻', color: '#0d9488' },
        Gift: { icon: '🎁', color: '#d946ef' },
        Other: { icon: '💵', color: '#64748b' },
    },
};

const STORAGE_KEY = 'expense-transactions';

// Philippine pesos: 1234.5 → "₱1,234.50".
const money = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' });

// ---------- Elements ----------

const form = document.getElementById('form');
const descInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const dateInput = document.getElementById('date');
const categorySelect = document.getElementById('category');
const formError = document.getElementById('form-error');
const monthInput = document.getElementById('month');
const filterSelect = document.getElementById('filter');
const list = document.getElementById('list');
const emptyMsg = document.getElementById('empty');
const canvas = document.getElementById('chart');
const legend = document.getElementById('legend');

// ---------- Data ----------

// Each transaction: { id, type: 'income' | 'expense', description, amount, category, date: '2026-09-26' }
let transactions = load();

function load() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
        return Array.isArray(saved) ? saved : [];
    } catch {
        return [];
    }
}

function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

// Today's date as "YYYY-MM-DD" in local time (toISOString() would use UTC and could be a day off).
function today() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getType() {
    return form.querySelector('input[name="type"]:checked').value;
}

// ---------- Form ----------

// Fills the category <select> with the categories for the chosen type.
function fillCategories() {
    const type = getType();
    categorySelect.innerHTML = '';
    // Object.entries gives [name, { icon, color }] pairs.
    for (const [name, { icon }] of Object.entries(CATEGORIES[type])) {
        categorySelect.appendChild(new Option(`${icon} ${name}`, name));
    }
}

form.addEventListener('change', (e) => {
    if (e.target.name === 'type') fillCategories();
});

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const description = descInput.value.trim();
    const amount = Number(amountInput.value);

    // Simple validation with one message at a time.
    if (!description) return showFormError('Please enter a description.', descInput);
    if (!(amount > 0)) return showFormError('Please enter an amount greater than 0.', amountInput);
    if (!dateInput.value) return showFormError('Please pick a date.', dateInput);

    transactions.push({
        // Date.now() plus a random part: unique enough for a personal app.
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        type: getType(),
        description,
        // Store money rounded to cents, to avoid values like 10.000000001.
        amount: Math.round(amount * 100) / 100,
        category: categorySelect.value,
        date: dateInput.value,
    });
    save();

    // Jump to the month of the new transaction so the user sees it.
    monthInput.value = dateInput.value.slice(0, 7);
    formError.textContent = '';
    descInput.value = '';
    amountInput.value = '';
    descInput.focus();
    render();
});

function showFormError(message, input) {
    formError.textContent = message;
    input.focus();
}

// ---------- Calculations ----------

// Only the transactions in the chosen month ("2026-09").
function monthTransactions() {
    return transactions.filter((t) => t.date.startsWith(monthInput.value));
}

// reduce() walks through the array and builds ONE result, here a running total.
//   sum starts at 0; for each transaction we add its amount if its type matches.
function total(items, type) {
    return items.reduce((sum, t) => (t.type === type ? sum + t.amount : sum), 0);
}

// Expenses grouped by category: { Food: 1200, Transport: 300, ... }
function expensesByCategory(items) {
    return items
        .filter((t) => t.type === 'expense')
        .reduce((groups, t) => {
            // (groups[t.category] ?? 0) starts a new category at 0.
            groups[t.category] = (groups[t.category] ?? 0) + t.amount;
            return groups;
        }, {});
}

// ---------- Drawing ----------

function render() {
    const items = monthTransactions();
    const income = total(items, 'income');
    const expense = total(items, 'expense');

    document.getElementById('income').textContent = money.format(income);
    document.getElementById('expense').textContent = money.format(expense);
    const balanceEl = document.getElementById('balance');
    balanceEl.textContent = money.format(income - expense);
    balanceEl.style.color = income - expense < 0 ? 'var(--expense)' : '';

    renderList(items);
    drawChart(expensesByCategory(items), expense);
}

function renderList(items) {
    const filter = filterSelect.value;
    const shown = items
        .filter((t) => filter === 'all' || t.type === filter)
        // sort() with a compare function: newest date first. localeCompare compares strings.
        .sort((a, b) => b.date.localeCompare(a.date));

    list.innerHTML = '';
    emptyMsg.hidden = shown.length > 0;

    for (const t of shown) {
        const cat = CATEGORIES[t.type][t.category] ?? CATEGORIES[t.type].Other;
        const li = document.createElement('li');
        li.className = `item ${t.type}`;
        li.dataset.id = t.id;

        const icon = document.createElement('span');
        icon.className = 'icon';
        icon.textContent = cat.icon;
        // A see-through version of the category color: hex color + "22" alpha.
        icon.style.background = `${cat.color}22`;

        const text = document.createElement('div');
        const desc = document.createElement('div');
        desc.className = 'desc';
        desc.textContent = t.description;            // user text → textContent, never innerHTML
        const meta = document.createElement('div');
        meta.className = 'meta';
        const niceDate = new Date(`${t.date}T00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        meta.textContent = `${t.category} · ${niceDate}`;
        text.append(desc, meta);

        const amount = document.createElement('span');
        amount.className = 'amount';
        amount.textContent = `${t.type === 'income' ? '+' : '−'}${money.format(t.amount)}`;

        const del = document.createElement('button');
        del.className = 'delete';
        del.type = 'button';
        del.textContent = '✕';
        del.setAttribute('aria-label', `Delete ${t.description}`);

        li.append(icon, text, amount, del);
        list.appendChild(li);
    }
}

// Draws a donut chart with the Canvas 2D API.
function drawChart(groups, totalExpense) {
    // Make the canvas sharp on high-resolution screens: draw at 2× (or 3×) the size it is shown.
    const ratio = window.devicePixelRatio || 1;
    const size = 180;                              // the size set in style.css
    canvas.width = size * ratio;
    canvas.height = size * ratio;
    const ctx = canvas.getContext('2d');           // the "pen" we draw with
    ctx.scale(ratio, ratio);                       // from now on we can think in CSS pixels
    ctx.clearRect(0, 0, size, size);

    const center = size / 2;
    const radius = size / 2 - 4;
    const thickness = 28;

    // Sort the biggest categories first so the chart and legend read nicely.
    const entries = Object.entries(groups).sort((a, b) => b[1] - a[1]);

    if (entries.length === 0) {
        // Empty state: a grey ring.
        ctx.beginPath();
        ctx.arc(center, center, radius - thickness / 2, 0, Math.PI * 2);
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = thickness;
        ctx.stroke();
    } else {
        // Angles in canvas are in radians: a full circle is 2π. Start at the top (−π/2).
        let start = -Math.PI / 2;
        for (const [category, amount] of entries) {
            const slice = (amount / totalExpense) * Math.PI * 2;
            ctx.beginPath();
            // arc(x, y, radius, startAngle, endAngle) draws part of a circle.
            ctx.arc(center, center, radius - thickness / 2, start, start + slice);
            ctx.strokeStyle = CATEGORIES.expense[category]?.color ?? '#94a3b8';
            ctx.lineWidth = thickness;
            ctx.stroke();
            start += slice;
        }
    }

    // The total in the middle of the donut.
    ctx.fillStyle = '#1e293b';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '600 12px system-ui, sans-serif';
    ctx.fillText('Spent', center, center - 12);
    ctx.font = '700 15px system-ui, sans-serif';
    ctx.fillText(money.format(totalExpense), center, center + 8);

    // The legend next to the chart.
    legend.innerHTML = '';
    if (entries.length === 0) {
        legend.innerHTML = '<li>No expenses yet.</li>';
    }
    for (const [category, amount] of entries) {
        const li = document.createElement('li');
        const percent = Math.round((amount / totalExpense) * 100);
        li.innerHTML = `<span class="dot" style="background:${CATEGORIES.expense[category]?.color ?? '#94a3b8'}"></span>
            <span>${category}</span><span class="value">${percent}%</span>`;
        legend.appendChild(li);
    }
    canvas.setAttribute('aria-label', entries.length
        ? `Spending by category: ${entries.map(([c, a]) => `${c} ${money.format(a)}`).join(', ')}`
        : 'No expenses this month');
}

// ---------- List actions ----------

// Event delegation for the delete buttons.
list.addEventListener('click', (e) => {
    if (!e.target.matches('.delete')) return;
    const id = e.target.closest('.item').dataset.id;
    transactions = transactions.filter((t) => t.id !== id);
    save();
    render();
});

filterSelect.addEventListener('change', render);
monthInput.addEventListener('change', () => {
    // An emptied month picker falls back to the current month.
    if (!monthInput.value) monthInput.value = today().slice(0, 7);
    render();
});

document.getElementById('clear').addEventListener('click', () => {
    const count = monthTransactions().length;
    if (count === 0) return;
    // confirm() shows a built-in OK/Cancel box and returns true or false.
    if (!confirm(`Delete all ${count} transactions in this month?`)) return;
    transactions = transactions.filter((t) => !t.date.startsWith(monthInput.value));
    save();
    render();
});

// Adds a realistic month of example data, so the app can be tried quickly.
document.getElementById('sample').addEventListener('click', () => {
    const month = monthInput.value;
    const sample = [
        ['income', 'Monthly salary', 42000, 'Salary', '01'],
        ['income', 'Website project', 8500, 'Freelance', '18'],
        ['expense', 'Rent', 12000, 'Bills', '02'],
        ['expense', 'Electricity', 2350.75, 'Bills', '10'],
        ['expense', 'Groceries', 4820.5, 'Food', '06'],
        ['expense', 'Jollibee with friends', 865, 'Food', '14'],
        ['expense', 'Jeepney and Grab', 1540, 'Transport', '20'],
        ['expense', 'New running shoes', 3499, 'Shopping', '12'],
        ['expense', 'Vitamins', 720, 'Health', '08'],
        ['expense', 'Movie night', 560, 'Fun', '22'],
    ];
    // map() turns each short array into a full transaction object.
    const added = sample.map(([type, description, amount, category, day], i) => ({
        id: `${Date.now()}-sample-${i}`,
        type, description, amount, category,
        date: `${month}-${day}`,
    }));
    transactions.push(...added);
    save();
    render();
});

// Builds a CSV file in memory and downloads it.
document.getElementById('export').addEventListener('click', () => {
    const rows = [['Date', 'Type', 'Category', 'Description', 'Amount']];
    monthTransactions()
        .sort((a, b) => a.date.localeCompare(b.date))
        .forEach((t) => rows.push([t.date, t.type, t.category, t.description, t.amount]));

    // Wrap each value in quotes and double any quotes inside it, the CSV rule for commas and quotes.
    const csv = rows.map((row) => row.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(',')).join('\r\n');

    // A Blob is file data in memory. createObjectURL gives it a temporary URL a link can download.
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `expenses-${monthInput.value}.csv`;
    link.click();
    URL.revokeObjectURL(url);          // free the memory
});

// ---------- Start ----------

monthInput.value = today().slice(0, 7);
dateInput.value = today();
fillCategories();
render();
