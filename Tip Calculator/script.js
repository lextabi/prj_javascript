// Tip Calculator - reading form inputs, validating them and showing money nicely.

// ---------- Elements ----------

const billInput = document.getElementById('bill');
const billError = document.getElementById('bill-error');
const tipButtons = document.querySelectorAll('.tip-btn');    // a list of all tip buttons
const customTipInput = document.getElementById('custom-tip');
const peopleInput = document.getElementById('people');
const peopleError = document.getElementById('people-error');
const peopleMinus = document.getElementById('people-minus');
const peoplePlus = document.getElementById('people-plus');
const roundUpBox = document.getElementById('round-up');
const tipPerPersonEl = document.getElementById('tip-per-person');
const totalPerPersonEl = document.getElementById('total-per-person');
const grandTotalEl = document.getElementById('grand-total');
const resetBtn = document.getElementById('reset');

// ---------- State ----------

const DEFAULT_TIP = 15;
let tipPercent = DEFAULT_TIP;

// Intl.NumberFormat formats numbers as money: 1234.5 becomes "$1,234.50".
// We create it once and reuse it, which is faster than creating it every time.
const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

// ---------- Validation ----------

// Shows or clears an error for one input. Returns true when the value is OK.
function validate(input, errorEl, isValid, message) {
    // classList.toggle(name, force) adds the class when force is true.
    input.classList.toggle('invalid', !isValid);
    errorEl.textContent = isValid ? '' : message;
    return isValid;
}

// ---------- Calculation ----------

function calculate() {
    // parseFloat("") is NaN, so an empty box is treated as "not entered yet".
    const bill = parseFloat(billInput.value);
    const people = Number(peopleInput.value);

    // Check each input. We only show an error once the user has typed something.
    const billOk = validate(
        billInput, billError,
        billInput.value === '' || bill >= 0,
        'Must be 0 or more',
    );
    const peopleOk = validate(
        peopleInput, peopleError,
        Number.isInteger(people) && people >= 1,
        people === 0 ? "Can't be zero" : 'Whole number, 1 or more',
    );

    // Enable Reset as soon as anything differs from the starting values.
    resetBtn.disabled = billInput.value === '' && peopleInput.value === '1' && tipPercent === DEFAULT_TIP
        && customTipInput.value === '' && !roundUpBox.checked;

    // If anything is missing or wrong, show zeros instead of NaN or Infinity.
    if (!billOk || !peopleOk || Number.isNaN(bill)) {
        showResults(0, 0, 0);
        return;
    }

    // The core maths.
    const tipTotal = bill * (tipPercent / 100);
    let totalPerPerson = (bill + tipTotal) / people;

    if (roundUpBox.checked) {
        // Math.ceil() always rounds up: 12.01 becomes 13.
        totalPerPerson = Math.ceil(totalPerPerson);
    }

    // When rounding up, the extra money counts as tip.
    const tipPerPerson = totalPerPerson - bill / people;

    showResults(tipPerPerson, totalPerPerson, totalPerPerson * people);
}

function showResults(tipPerPerson, totalPerPerson, grandTotal) {
    tipPerPersonEl.textContent = money.format(tipPerPerson);
    totalPerPersonEl.textContent = money.format(totalPerPerson);
    grandTotalEl.textContent = money.format(grandTotal);
}

// ---------- Tip selection ----------

// Marks one button as active (or none when a custom value is used).
function setActiveButton(activeBtn) {
    tipButtons.forEach((btn) => btn.classList.toggle('active', btn === activeBtn));
}

tipButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
        // dataset.tip reads the data-tip="15" attribute. It is a string, so convert it.
        tipPercent = Number(btn.dataset.tip);
        customTipInput.value = '';
        setActiveButton(btn);
        calculate();
    });
});

customTipInput.addEventListener('input', () => {
    const value = Number(customTipInput.value);
    if (customTipInput.value === '' || value < 0 || value > 100) {
        // Empty or out of range: go back to the default button.
        tipPercent = DEFAULT_TIP;
        setActiveButton(document.querySelector(`.tip-btn[data-tip="${DEFAULT_TIP}"]`));
    } else {
        tipPercent = value;
        setActiveButton(null);
    }
    calculate();
});

// ---------- People stepper ----------

// changePeople(+1) or changePeople(-1)
function changePeople(amount) {
    // Math.floor() drops decimals; "|| 0" turns NaN (text or an empty box) into 0.
    const current = Math.floor(Number(peopleInput.value)) || 0;
    // Math.max(1, x) makes sure we never go below 1.
    peopleInput.value = Math.max(1, current + amount);
    calculate();
}

peopleMinus.addEventListener('click', () => changePeople(-1));
peoplePlus.addEventListener('click', () => changePeople(1));

// ---------- Other events ----------

// The 'input' event fires on every keystroke, so results update as you type.
billInput.addEventListener('input', calculate);
peopleInput.addEventListener('input', calculate);
roundUpBox.addEventListener('change', calculate);

resetBtn.addEventListener('click', () => {
    billInput.value = '';
    customTipInput.value = '';
    peopleInput.value = 1;
    roundUpBox.checked = false;
    tipPercent = DEFAULT_TIP;
    setActiveButton(document.querySelector(`.tip-btn[data-tip="${DEFAULT_TIP}"]`));
    calculate();
    billInput.focus();              // put the cursor back in the first box
});

// Draw the starting state.
calculate();
