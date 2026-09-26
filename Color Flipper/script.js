// Color Flipper - random colors, template literals and the Clipboard API.

// ---------- Elements ----------

const colorCode = document.getElementById('color-code');
const flipBtn = document.getElementById('flip');
const copyBtn = document.getElementById('copy');
const statusEl = document.getElementById('status');
const historyList = document.getElementById('history');

// ---------- Data ----------

// An array of CSS color names for "Simple" mode.
const simpleColors = [
    'Tomato', 'Gold', 'MediumSeaGreen', 'SteelBlue', 'Orchid',
    'Coral', 'SlateBlue', 'Teal', 'Crimson', 'DarkOrange', 'HotPink', 'OliveDrab',
];

// The 16 digits of hexadecimal: 0-9 and A-F.
const HEX_DIGITS = '0123456789ABCDEF';

// The most recent colors, newest first.
const history = [];
const MAX_HISTORY = 6;

// ---------- Random helpers ----------

// randomInt(max) returns a whole number from 0 up to (but not including) max.
// Math.random() gives a decimal in [0, 1), and Math.floor() drops the decimals.
function randomInt(max) {
    return Math.floor(Math.random() * max);
}

// Picks a random item from any array.
function randomItem(array) {
    return array[randomInt(array.length)];
}

// Builds a color like "#3FA2C7" from six random hex digits.
function randomHex() {
    let hex = '#';
    // A classic for loop that runs 6 times (i = 0, 1, 2, 3, 4, 5).
    for (let i = 0; i < 6; i++) {
        // Strings can be indexed like arrays: HEX_DIGITS[10] is 'A'.
        hex += HEX_DIGITS[randomInt(16)];
    }
    return hex;
}

// Builds a color like "rgb(12, 200, 99)".
function randomRgb() {
    // Each channel goes from 0 to 255, so randomInt(256).
    const r = randomInt(256);
    const g = randomInt(256);
    const b = randomInt(256);
    // Template literals (backticks) insert values with ${ }.
    return `rgb(${r}, ${g}, ${b})`;
}

// Returns the value of the selected radio button: 'simple', 'hex' or 'rgb'.
function getMode() {
    // :checked matches only the selected radio. querySelector() accepts any CSS selector.
    return document.querySelector('input[name="mode"]:checked').value;
}

// ---------- Main actions ----------

// setColor() is the single place that changes the color, so the page never gets out of sync.
function setColor(color) {
    // Inline styles win over the stylesheet, so this replaces the background from style.css.
    document.body.style.backgroundColor = color;
    colorCode.textContent = color;
    addToHistory(color);
}

function flip() {
    const mode = getMode();
    let color;

    if (mode === 'hex') {
        color = randomHex();
    } else if (mode === 'rgb') {
        color = randomRgb();
    } else {
        // Keep picking until we get a different name, so a click always changes something.
        do {
            color = randomItem(simpleColors);
        } while (color === colorCode.textContent);
    }

    setColor(color);
    statusEl.textContent = '';
}

// async functions can use await to wait for a Promise (a value that arrives later).
async function copyColor() {
    const text = colorCode.textContent;
    // try/catch: copying can fail (for example, if the page is not allowed to use the clipboard).
    try {
        await navigator.clipboard.writeText(text);
        statusEl.textContent = `Copied ${text}!`;
    } catch (error) {
        statusEl.textContent = 'Copy failed. Select the code and press Ctrl+C.';
    }
}

// ---------- History ----------

function addToHistory(color) {
    // Do not add the same color twice in a row.
    if (history[0] === color) return;

    // unshift() adds to the start of the array; pop() removes the last item.
    history.unshift(color);
    if (history.length > MAX_HISTORY) history.pop();

    renderHistory();
}

// Rebuilds the swatch list from the history array.
function renderHistory() {
    // Clear the old list first.
    historyList.innerHTML = '';

    // forEach() runs the function once for every color in the array.
    history.forEach((color) => {
        // createElement() makes a new element that is not on the page yet.
        const li = document.createElement('li');
        const btn = document.createElement('button');
        btn.className = 'swatch';
        btn.style.backgroundColor = color;
        btn.title = color;                       // tooltip on hover
        btn.setAttribute('aria-label', `Use ${color}`);
        // Clicking a swatch brings that color back.
        btn.addEventListener('click', () => {
            document.body.style.backgroundColor = color;
            colorCode.textContent = color;
        });
        // appendChild() puts the new element inside its parent, which puts it on the page.
        li.appendChild(btn);
        historyList.appendChild(li);
    });
}

// ---------- Events ----------

flipBtn.addEventListener('click', flip);
copyBtn.addEventListener('click', copyColor);

document.addEventListener('keydown', (e) => {
    // The space bar reports e.key as ' '. Ignore it when a button or radio has focus,
    // because space already "clicks" the focused control.
    if (e.key === ' ' && !['BUTTON', 'INPUT'].includes(e.target.tagName)) {
        e.preventDefault();   // stop the page from scrolling
        flip();
    }
});
