// Calculator - a small "state machine" with event delegation and keyboard support.
//
// We never use eval() to run the maths. eval() executes any text as code, which is unsafe
// and hides the logic. Instead the calculator remembers a few values (the "state") and
// each key press changes them according to clear rules.

// ---------- Elements ----------

const keys = document.getElementById('keys');
const currentEl = document.getElementById('current');
const expressionEl = document.getElementById('expression');

// ---------- State ----------

const state = {
    current: '0',            // the number being typed, kept as a STRING so "0." and "007" behave nicely
    previous: null,          // the number before the operator, as a real number
    operator: null,          // '+', '-', '*' or '/'
    waiting: false,          // true right after an operator: the next digit starts a new number
    done: false,             // true right after "=": the next digit starts a brand new calculation
    error: false,
};

const MAX_DIGITS = 15;
const SYMBOLS = { '+': '+', '-': '−', '*': '×', '/': '÷' };

// ---------- Maths ----------

// Computers store decimals in binary, so 0.1 + 0.2 gives 0.30000000000000004.
// Rounding to 12 significant digits hides that tiny error: the result becomes 0.3.
function tidy(number) {
    return Number(number.toPrecision(12));
}

function operate(a, b, operator) {
    // switch with return: each case ends the function, so no break is needed.
    switch (operator) {
        case '+': return tidy(a + b);
        case '-': return tidy(a - b);
        case '*': return tidy(a * b);
        case '/':
            // Dividing by zero gives Infinity in JavaScript. We show a friendly error instead.
            if (b === 0) throw new Error("Can't divide by 0");
            return tidy(a / b);
        default: return b;
    }
}

// ---------- Key handlers ----------

function inputDigit(digit) {
    // After "=" or an operator, a digit starts a new number.
    if (state.waiting || state.done) {
        state.current = digit;
        state.waiting = false;
        if (state.done) {
            state.done = false;
            expressionEl.textContent = '';
        }
        return;
    }
    // Count digits only (ignore the "-" and "."), and stop at the maximum.
    if (state.current.replace(/[-.]/g, '').length >= MAX_DIGITS) return;
    // Replace a lone "0" instead of making "05".
    state.current = state.current === '0' ? digit : state.current + digit;
}

function inputDecimal() {
    if (state.waiting || state.done) {
        state.current = '0.';
        state.waiting = false;
        state.done = false;
        return;
    }
    // includes() stops a second decimal point, like "1.2.3".
    if (!state.current.includes('.')) state.current += '.';
}

function chooseOperator(operator) {
    const value = Number(state.current);

    // Pressing two operators in a row just changes the operator (e.g. + then × means ×).
    if (state.operator && state.waiting) {
        state.operator = operator;
        showExpression();
        return;
    }

    if (state.previous === null || state.done) {
        state.previous = value;
    } else if (state.operator) {
        // Chained maths: 2 + 3 × ... first works out 2 + 3 = 5 (left to right, like a simple calculator).
        const result = operate(state.previous, value, state.operator);
        state.previous = result;
        state.current = String(result);
    }

    state.operator = operator;
    state.waiting = true;
    state.done = false;
    showExpression();
}

function equals() {
    // Nothing to do without an operator, or right after pressing one ("5 + =").
    if (!state.operator || state.waiting) return;

    const a = state.previous;
    const b = Number(state.current);
    const result = operate(a, b, state.operator);

    expressionEl.textContent = `${formatNumber(String(a))} ${SYMBOLS[state.operator]} ${formatNumber(String(b))} =`;
    state.current = String(result);
    state.previous = null;
    state.operator = null;
    state.done = true;
}

function clearAll() {
    state.current = '0';
    state.previous = null;
    state.operator = null;
    state.waiting = false;
    state.done = false;
    state.error = false;
    expressionEl.textContent = '';
}

function deleteLast() {
    if (state.waiting || state.done) return;
    // slice(0, -1) removes the last character.
    state.current = state.current.slice(0, -1);
    // Do not leave the display empty or showing just "-".
    if (state.current === '' || state.current === '-') state.current = '0';
}

function toggleSign() {
    if (state.current === '0') return;
    // startsWith() checks the first character(s) of a string.
    state.current = state.current.startsWith('-') ? state.current.slice(1) : '-' + state.current;
}

function percent() {
    state.current = String(tidy(Number(state.current) / 100));
}

// ---------- Display ----------

// Adds thousands separators but keeps what the user typed after the decimal point.
// "1234567.50" → "1,234,567.50"
function formatNumber(text) {
    // Very big or very small results use scientific notation (1e+21); show those as they are.
    if (text.includes('e')) return text;
    const [whole, decimals] = text.split('.');
    const formatted = Number(whole).toLocaleString('en-US');
    // "-0" would lose its sign in toLocaleString, so keep it.
    const sign = whole === '-0' ? '-' : '';
    // decimals is undefined when there was no "." at all.
    return decimals === undefined ? sign + formatted : `${sign}${formatted}.${decimals}`;
}

function showExpression() {
    expressionEl.textContent = `${formatNumber(String(state.previous))} ${SYMBOLS[state.operator]}`;
}

function render() {
    // Highlight the operator key that is waiting for a number.
    document.querySelectorAll('.key.op').forEach((key) => {
        key.classList.toggle('active', state.waiting && key.dataset.value === state.operator);
    });

    if (state.error) return;          // keep the error message on screen

    const text = formatNumber(state.current);
    currentEl.textContent = text;
    currentEl.classList.remove('error');
    // Make long numbers smaller so they fit.
    currentEl.classList.toggle('small', text.length > 9 && text.length <= 13);
    currentEl.classList.toggle('xsmall', text.length > 13);
}

// One function handles every key, whether it came from a click or the keyboard.
function press(action, value) {
    // After an error, any key clears first (and AC just clears).
    if (state.error) {
        clearAll();
        if (action === 'clear') return render();
    }

    try {
        if (action === 'digit') inputDigit(value);
        else if (action === 'decimal') inputDecimal();
        else if (action === 'operator') chooseOperator(value);
        else if (action === 'equals') equals();
        else if (action === 'clear') clearAll();
        else if (action === 'delete') deleteLast();
        else if (action === 'sign') toggleSign();
        else if (action === 'percent') percent();
        render();
    } catch (error) {
        // operate() throws for divide by zero; show the message and wait for the next key.
        state.error = true;
        state.waiting = false;
        currentEl.textContent = error.message;
        currentEl.classList.add('error');
        currentEl.classList.remove('small', 'xsmall');
        render();
    }
}

// ---------- Events ----------

// Event delegation: one listener on the grid handles all 20 buttons.
keys.addEventListener('click', (e) => {
    const key = e.target.closest('button');
    if (!key) return;                 // the click was in a gap between buttons
    press(key.dataset.action, key.dataset.value);
});

// Maps keyboard keys to the same actions the buttons use.
function keyToAction(key) {
    // /^[0-9]$/ is a regular expression: exactly one character from 0 to 9.
    if (/^[0-9]$/.test(key)) return ['digit', key];
    if (key === '.' || key === ',') return ['decimal'];
    if (['+', '-', '*', '/'].includes(key)) return ['operator', key];
    if (key === 'x' || key === 'X') return ['operator', '*'];
    if (key === 'Enter' || key === '=') return ['equals'];
    if (key === 'Backspace') return ['delete'];
    if (key === 'Escape' || key === 'Delete') return ['clear'];
    if (key === '%') return ['percent'];
    return null;
}

document.addEventListener('keydown', (e) => {
    const mapped = keyToAction(e.key);
    if (!mapped) return;
    e.preventDefault();               // stop "/" opening Firefox's quick find, Enter clicking a focused button, etc.
    const [action, value] = mapped;
    press(action, value);

    // Flash the matching on-screen button so keyboard users see what happened.
    const selector = value ? `[data-action="${action}"][data-value="${value}"]` : `[data-action="${action}"]`;
    const button = keys.querySelector(selector);
    if (button) {
        button.classList.add('pressed');
        setTimeout(() => button.classList.remove('pressed'), 120);
    }
});

render();
