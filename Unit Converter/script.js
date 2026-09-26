// Unit Converter - lookup objects, functions as values and two-way inputs.

// ---------- Conversion data ----------

// For length and weight every unit has a "factor": how many base units it is worth.
// Length base = metre, weight base = gram. To convert A → B:
//   value in base = value × factorA,  result = value in base ÷ factorB
//
// Temperature cannot use a simple factor (0 °C is not 0 °F), so each unit has two
// functions instead: toBase() converts to Celsius and fromBase() converts from Celsius.
const UNITS = {
    length: {
        millimetre: { symbol: 'mm', factor: 0.001 },
        centimetre: { symbol: 'cm', factor: 0.01 },
        metre:      { symbol: 'm',  factor: 1 },
        kilometre:  { symbol: 'km', factor: 1000 },
        inch:       { symbol: 'in', factor: 0.0254 },
        foot:       { symbol: 'ft', factor: 0.3048 },
        yard:       { symbol: 'yd', factor: 0.9144 },
        mile:       { symbol: 'mi', factor: 1609.344 },
    },
    weight: {
        milligram: { symbol: 'mg', factor: 0.001 },
        gram:      { symbol: 'g',  factor: 1 },
        kilogram:  { symbol: 'kg', factor: 1000 },
        ounce:     { symbol: 'oz', factor: 28.349523125 },
        pound:     { symbol: 'lb', factor: 453.59237 },
        stone:     { symbol: 'st', factor: 6350.29318 },
    },
    temperature: {
        // Arrow functions stored as object properties: "functions as values".
        // "fromC" and "toC" are the same formulas as text, shown under the boxes.
        celsius:    { symbol: '°C', fromC: '°C',            toC: '°C',
                      toBase: (c) => c,                fromBase: (c) => c },
        fahrenheit: { symbol: '°F', fromC: '°C × 9/5 + 32', toC: '(°F − 32) × 5/9',
                      toBase: (f) => (f - 32) * 5 / 9, fromBase: (c) => c * 9 / 5 + 32 },
        kelvin:     { symbol: 'K',  fromC: '°C + 273.15',   toC: 'K − 273.15',
                      toBase: (k) => k - 273.15,       fromBase: (c) => c + 273.15 },
    },
};

// The units each category starts with.
const DEFAULTS = {
    length: ['kilometre', 'mile'],
    weight: ['kilogram', 'pound'],
    temperature: ['celsius', 'fahrenheit'],
};

// ---------- Elements ----------

const tabs = document.querySelectorAll('#categories [role="tab"]');
const fromValue = document.getElementById('from-value');
const toValue = document.getElementById('to-value');
const fromUnit = document.getElementById('from-unit');
const toUnit = document.getElementById('to-unit');
const swapBtn = document.getElementById('swap');
const formulaEl = document.getElementById('formula');
const tableTitle = document.getElementById('table-title');
const tableBody = document.getElementById('table-body');

let category = 'length';

// ---------- Conversion ----------

// convert(5, 'kilometre', 'mile') → 3.10686...
function convert(value, from, to) {
    const units = UNITS[category];
    const a = units[from];
    const b = units[to];

    // If the unit has a toBase function it is a temperature, otherwise use factors.
    // typeof tells us the type of a value: 'function', 'number', 'string', ...
    if (typeof a.toBase === 'function') {
        return b.fromBase(a.toBase(value));
    }
    return (value * a.factor) / b.factor;
}

// Shows at most 6 decimal places and drops trailing zeros: 3.106856 / 2.5 / 1000.
function format(number) {
    // toFixed(6) gives a string with exactly 6 decimals; Number() removes the extra zeros.
    const rounded = Number(number.toFixed(6));
    // toLocaleString adds thousands separators: 1609344 → "1,609,344".
    return rounded.toLocaleString('en-US', { maximumFractionDigits: 6 });
}

// ---------- Drawing ----------

// Fills a <select> with one <option> per unit in the current category.
function fillSelect(select, selected) {
    select.innerHTML = '';
    // Object.keys() returns an array of the object's property names.
    Object.keys(UNITS[category]).forEach((name) => {
        // new Option(text, value) is a shortcut for creating an <option> element.
        // Capitalize the first letter for display: "kilometre" → "Kilometre".
        const label = name[0].toUpperCase() + name.slice(1);
        const option = new Option(`${label} (${UNITS[category][name].symbol})`, name);
        option.selected = name === selected;
        select.appendChild(option);
    });
}

// direction tells us which box the user typed in: 'forward' (left → right) or 'backward'.
function update(direction = 'forward') {
    const source = direction === 'forward' ? fromValue : toValue;
    const target = direction === 'forward' ? toValue : fromValue;
    const sourceUnit = direction === 'forward' ? fromUnit.value : toUnit.value;
    const targetUnit = direction === 'forward' ? toUnit.value : fromUnit.value;

    // An empty box clears the other box instead of showing NaN.
    if (source.value === '' || Number.isNaN(Number(source.value))) {
        target.value = '';
    } else {
        const result = convert(Number(source.value), sourceUnit, targetUnit);
        // Remove the thousands separators before putting the number in an <input type="number">.
        target.value = format(result).replaceAll(',', '');
    }

    updateFormula();
    updateTable();
}

function updateFormula() {
    const units = UNITS[category];

    // Temperatures are not a simple ratio (0 °C is not 0 °F), so show the formula instead.
    if (category === 'temperature') {
        const from = units[fromUnit.value];
        const to = units[toUnit.value];
        if (from === to) {
            formulaEl.textContent = 'Same unit, same value';
        } else if (fromUnit.value === 'celsius') {
            formulaEl.textContent = `${to.symbol} = ${to.fromC}`;
        } else if (toUnit.value === 'celsius') {
            formulaEl.textContent = `°C = ${from.toC}`;
        } else {
            // Neither side is Celsius: go through Celsius in two steps.
            formulaEl.textContent = `°C = ${from.toC}, then ${to.symbol} = ${to.fromC}`;
        }
        return;                    // stop here; the code below is for ratio units
    }

    const one = convert(1, fromUnit.value, toUnit.value);
    formulaEl.textContent = `1 ${units[fromUnit.value].symbol} = ${format(one)} ${units[toUnit.value].symbol}`;
}

// A quick reference table like "10 km = 6.21371 mi".
function updateTable() {
    const units = UNITS[category];
    const fromSym = units[fromUnit.value].symbol;
    const toSym = units[toUnit.value].symbol;
    // Temperatures get a more useful set of values than lengths and weights.
    const values = category === 'temperature' ? [-40, 0, 20, 37, 100] : [1, 5, 10, 50, 100];

    tableTitle.textContent = `Quick reference: ${fromSym} → ${toSym}`;
    // map() turns each number into a table row string; join('') glues them together.
    tableBody.innerHTML = values
        .map((v) => `<tr><td>${v} ${fromSym}</td><td>${format(convert(v, fromUnit.value, toUnit.value))} ${toSym}</td></tr>`)
        .join('');
}

function setCategory(newCategory) {
    category = newCategory;
    tabs.forEach((tab) => tab.setAttribute('aria-selected', tab.dataset.category === category));

    // Array destructuring: const [a, b] = ['kilometre', 'mile'].
    const [from, to] = DEFAULTS[category];
    fillSelect(fromUnit, from);
    fillSelect(toUnit, to);
    // Start temperatures at a friendly 20 °C, everything else at 1.
    fromValue.value = category === 'temperature' ? 20 : 1;
    update('forward');
}

// ---------- Events ----------

tabs.forEach((tab) => tab.addEventListener('click', () => setCategory(tab.dataset.category)));

// Typing on the left converts to the right, and typing on the right converts to the left.
fromValue.addEventListener('input', () => update('forward'));
toValue.addEventListener('input', () => update('backward'));
// Changing either unit keeps the left value and recalculates the right one.
fromUnit.addEventListener('change', () => update('forward'));
toUnit.addEventListener('change', () => update('forward'));

swapBtn.addEventListener('click', () => {
    // Swap the two units with array destructuring, no temporary variable needed.
    [fromUnit.value, toUnit.value] = [toUnit.value, fromUnit.value];
    update('forward');
});

setCategory('length');
