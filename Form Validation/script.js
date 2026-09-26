// Form Validation - the Constraint Validation API, regular expressions and friendly messages.
//
// The browser already knows the rules we wrote in the HTML (required, minlength, pattern,
// type="email"). input.validity tells us WHICH rule failed, so we can show a clear message.
// For rules HTML cannot express (password strength, "passwords match") we use
// setCustomValidity(), which plugs our own checks into the same system.

// ---------- Elements ----------

const form = document.getElementById('signup');
const fields = {
    fullname: document.getElementById('fullname'),
    username: document.getElementById('username'),
    email: document.getElementById('email'),
    phone: document.getElementById('phone'),
    password: document.getElementById('password'),
    confirm: document.getElementById('confirm'),
    terms: document.getElementById('terms'),
};
const togglePassword = document.getElementById('toggle-password');
const strengthBar = document.querySelector('.strength');
const strengthLabel = document.getElementById('strength-label');
const ruleItems = document.querySelectorAll('#password-rules li');
const successPanel = document.getElementById('success');
const summary = document.getElementById('summary');

// ---------- Regular expressions ----------

// A regular expression (regex) describes a text pattern.
//   ^ start, $ end, [a-z] one letter a to z, + one or more, \d a digit, \s a space
const PATTERNS = {
    // Letters (including accents), spaces, apostrophes and hyphens: "Anne-Marie O'Neil".
    // \p{L} means "any letter in any language"; it needs the u (unicode) flag.
    name: /^[\p{L}\s'-]+$/u,
    // A stricter email check than type="email": something@something.something (2+ letter ending).
    email: /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i,
    // Optional + then 7 to 15 digits, allowing spaces or dashes between them.
    phone: /^\+?[\d\s-]{7,20}$/,
};

// The password rules. Each has a test function that returns true or false.
const PASSWORD_RULES = {
    length: (pw) => pw.length >= 8,
    lower: (pw) => /[a-z]/.test(pw),
    upper: (pw) => /[A-Z]/.test(pw),
    number: (pw) => /\d/.test(pw),
    symbol: (pw) => /[^A-Za-z0-9]/.test(pw),    // anything that is not a letter or digit
};

// ---------- Custom checks ----------

// Runs our extra rules and stores the result with setCustomValidity().
// An empty string means "valid"; any other text means "invalid" (and becomes the message).
function runCustomChecks() {
    const { fullname, email, phone, password, confirm } = fields;

    // We check the length ourselves as well as with minlength, because the browser only sets
    // validity.tooShort for text the user typed (not for autofill or values set by code),
    // and because "   " (only spaces) would otherwise pass "required".
    const name = fullname.value.trim();
    let nameMessage = '';
    if (fullname.value !== '' && name.length < 2) nameMessage = 'Full name must be at least 2 characters.';
    else if (name !== '' && !PATTERNS.name.test(name)) nameMessage = 'Use letters, spaces, hyphens or apostrophes only.';
    fullname.setCustomValidity(nameMessage);

    email.setCustomValidity(
        email.value && !PATTERNS.email.test(email.value) ? 'Enter an email like name@example.com.' : '',
    );

    // Phone is optional: only check it when something was typed.
    const digits = phone.value.replace(/\D/g, '');            // \D = anything that is NOT a digit
    phone.setCustomValidity(
        phone.value && (!PATTERNS.phone.test(phone.value) || digits.length < 7 || digits.length > 15)
            ? 'Enter 7 to 15 digits, e.g. +63 912 345 6789.' : '',
    );

    // Object.values() gives an array of the rule functions; every() is true if ALL pass.
    const strongEnough = Object.values(PASSWORD_RULES).every((rule) => rule(password.value));
    password.setCustomValidity(
        password.value && !strongEnough ? 'Your password does not meet all the rules below.' : '',
    );

    confirm.setCustomValidity(
        confirm.value && confirm.value !== password.value ? 'Passwords do not match.' : '',
    );
}

// ---------- Messages ----------

// Turns the browser's validity flags into a friendly message.
function getMessage(input) {
    const v = input.validity;           // a ValidityState object with true/false flags
    const label = input.labels[0].textContent.replace('(optional)', '').trim();

    if (v.valueMissing) {
        return input.type === 'checkbox' ? 'Please accept the terms to continue.' : `${label} is required.`;
    }
    if (v.tooShort) return `${label} must be at least ${input.minLength} characters.`;
    if (v.typeMismatch) return 'Enter an email like name@example.com.';
    if (v.patternMismatch && input.id === 'username') {
        return '3 to 16 characters: letters, numbers and _ only.';
    }
    // customError is true when setCustomValidity() was given a message.
    if (v.customError) return input.validationMessage;
    return '';
}

// Shows the error (or clears it) for one field.
function showValidity(input) {
    const errorEl = document.getElementById(`${input.id}-error`);
    const valid = input.checkValidity();   // true when every rule passes

    // An optional empty field is neither right nor wrong, so give it no color.
    if (input.id === 'phone' && input.value === '') {
        input.removeAttribute('aria-invalid');
    } else {
        input.setAttribute('aria-invalid', String(!valid));
    }
    errorEl.textContent = valid ? '' : getMessage(input);
    return valid;
}

// ---------- Password strength ----------

function updateStrength() {
    const pw = fields.password.value;
    let passed = 0;

    ruleItems.forEach((li) => {
        // li.dataset.rule is "length", "lower", ... — the same keys as PASSWORD_RULES.
        const met = PASSWORD_RULES[li.dataset.rule](pw);
        li.classList.toggle('met', met);
        if (met) passed++;
    });

    // Turn 0-5 passed rules (plus a bonus for 12+ characters) into a 0-4 score.
    let score = 0;
    if (pw.length > 0) score = 1;
    if (passed >= 3) score = 2;
    if (passed >= 4) score = 3;
    if (passed === 5 && pw.length >= 12) score = 4;
    else if (passed === 5) score = 3;

    const labels = ['–', 'Weak', 'Fair', 'Good', 'Strong'];
    strengthBar.dataset.score = score;          // CSS colors the bars from this attribute
    strengthLabel.textContent = `Strength: ${labels[score]}`;
}

// ---------- Events ----------

// "touched" fields have been left at least once. We only show errors for those,
// so the user is not shouted at before they have even started typing.
const touched = new Set();

// Object.values(fields) is an array of the input elements.
Object.values(fields).forEach((input) => {
    // 'blur' = the user left the field: from now on we show its errors.
    input.addEventListener('blur', () => {
        touched.add(input);
        runCustomChecks();
        showValidity(input);
    });

    // 'input' fires on every keystroke (and 'change' for the checkbox).
    const eventName = input.type === 'checkbox' ? 'change' : 'input';
    input.addEventListener(eventName, () => {
        runCustomChecks();
        if (input.type === 'checkbox') touched.add(input);
        if (touched.has(input)) showValidity(input);
        // Changing the password can fix or break "confirm", so re-check it too.
        if (input === fields.password && touched.has(fields.confirm)) showValidity(fields.confirm);
    });
});

fields.password.addEventListener('input', updateStrength);

togglePassword.addEventListener('click', () => {
    const show = fields.password.type === 'password';
    fields.password.type = show ? 'text' : 'password';
    togglePassword.textContent = show ? 'Hide' : 'Show';
    togglePassword.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
});

form.addEventListener('submit', (e) => {
    e.preventDefault();               // this is a demo: never actually send the form
    runCustomChecks();

    // Check every field and remember the first one that fails.
    let firstInvalid = null;
    Object.values(fields).forEach((input) => {
        touched.add(input);
        if (!showValidity(input) && !firstInvalid) firstInvalid = input;
    });

    if (firstInvalid) {
        firstInvalid.focus();         // take the user straight to the problem
        form.classList.remove('shake');
        void form.offsetWidth;        // restart the animation
        form.classList.add('shake');
        return;
    }

    // FormData collects every named field. Object.fromEntries turns it into a plain object.
    const data = Object.fromEntries(new FormData(form));
    // Never display a password. delete removes a property from an object.
    delete data.password;
    delete data.confirm;
    data.terms = data.terms === 'on';
    // JSON.stringify(value, null, 2) pretty-prints with 2-space indentation.
    summary.textContent = JSON.stringify(data, null, 2);

    form.hidden = true;
    successPanel.hidden = false;
});

document.getElementById('again').addEventListener('click', () => {
    form.reset();                     // clears every field back to its starting value
    touched.clear();
    Object.values(fields).forEach((input) => {
        input.removeAttribute('aria-invalid');
        document.getElementById(`${input.id}-error`).textContent = '';
    });
    fields.password.type = 'password';
    togglePassword.textContent = 'Show';
    updateStrength();
    successPanel.hidden = true;
    form.hidden = false;
    fields.fullname.focus();
});

updateStrength();
