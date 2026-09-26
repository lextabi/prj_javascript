// Counter App - the "hello world" of DOM programming.
// We find elements on the page, listen for events (clicks, key presses)
// and update the page when something happens.

// ---------- 1. Find the elements we need ----------

// document.getElementById() returns the element that has that id in index.html.
// const means the variable will always point to the same element.
const countEl = document.getElementById('count');
const decreaseBtn = document.getElementById('decrease');
const resetBtn = document.getElementById('reset');
const increaseBtn = document.getElementById('increase');
const stepInput = document.getElementById('step');

// ---------- 2. Keep track of the state ----------

// let (not const) because this value changes every time a button is clicked.
let count = 0;

// ---------- 3. Helper functions ----------

// getStep() reads the step box and always returns a sensible whole number.
function getStep() {
    // Input values are always strings, so Number() converts "5" to 5.
    const step = Number(stepInput.value);
    // Number.isInteger() is false for NaN (empty box or text) and for decimals like 2.5.
    // If the value is invalid or less than 1, fall back to 1.
    return Number.isInteger(step) && step > 0 ? step : 1;
}

// updateDisplay() writes the count to the page and picks the right color.
function updateDisplay() {
    // textContent replaces the text inside the element.
    countEl.textContent = count;

    // classList.toggle(name, condition) adds the class when condition is true
    // and removes it when false, so we never have to check first.
    countEl.classList.toggle('positive', count > 0);
    countEl.classList.toggle('negative', count < 0);

    // Small "pop" animation: add the class, then remove it 100 ms later.
    countEl.classList.add('pop');
    // setTimeout(fn, ms) runs fn once after ms milliseconds.
    setTimeout(() => countEl.classList.remove('pop'), 100);
}

// Each action changes the state first, then updates what the user sees.
function increase() {
    count += getStep();          // same as: count = count + getStep()
    updateDisplay();
}

function decrease() {
    count -= getStep();
    updateDisplay();
}

function reset() {
    count = 0;
    updateDisplay();
}

// ---------- 4. Connect events to functions ----------

// addEventListener('click', fn) runs fn every time the button is clicked.
// Notice we pass the function itself (increase), not its result (increase()).
increaseBtn.addEventListener('click', increase);
decreaseBtn.addEventListener('click', decrease);
resetBtn.addEventListener('click', reset);

// Keyboard shortcuts. 'keydown' fires on the whole document for any key.
// The event object (e) tells us which key was pressed.
document.addEventListener('keydown', (e) => {
    // Do not steal the arrow keys while the user is typing in the step box.
    if (e.target === stepInput) return;

    // switch compares e.key against each case.
    switch (e.key) {
        case 'ArrowUp':
            e.preventDefault();  // stop the page from scrolling
            increase();
            break;               // break stops the switch here
        case 'ArrowDown':
            e.preventDefault();
            decrease();
            break;
        case 'r':
        case 'R':                // two cases can share the same code
            reset();
            break;
    }
});
