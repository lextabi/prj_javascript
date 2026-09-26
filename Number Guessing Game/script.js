// Number Guessing Game - game state, form submit events and conditionals.

// ---------- Settings ----------

// An object whose keys are the level names. Each value is another object.
const LEVELS = {
    easy:   { max: 50,  tries: 10 },
    normal: { max: 100, tries: 7 },
    hard:   { max: 500, tries: 9 },
};

// ---------- Elements ----------

const levelButtons = document.querySelectorAll('.level');
const intro = document.getElementById('intro');
const form = document.getElementById('guess-form');
const guessInput = document.getElementById('guess');
const guessBtn = document.getElementById('guess-btn');
const message = document.getElementById('message');
const triesLeftEl = document.getElementById('tries-left');
const bestEl = document.getElementById('best');
const guessList = document.getElementById('guesses');
const playAgainBtn = document.getElementById('play-again');
const rangeLow = document.getElementById('range-low');
const rangeHigh = document.getElementById('range-high');
const rangeFill = document.getElementById('range-fill');

// ---------- Game state ----------

// All the values that change during a game live in one object.
// This makes it easy to see (and reset) everything the game depends on.
const game = {
    level: 'easy',
    secret: 0,
    triesLeft: 0,
    low: 1,          // the smallest number that could still be the answer
    high: 50,        // the largest number that could still be the answer
    guesses: [],
    over: false,
};

// ---------- Helpers ----------

// A whole random number from min to max, including both ends.
function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Shows a message with a CSS class for its color.
function say(text, type = '') {
    message.textContent = text;
    message.className = `message ${type}`;
}

// Best scores are kept in localStorage under one key per level, e.g. "guess-best-easy".
function getBest(level) {
    // getItem returns null when nothing was saved yet.
    const saved = localStorage.getItem(`guess-best-${level}`);
    return saved === null ? null : Number(saved);
}

function saveBest(level, tries) {
    const best = getBest(level);
    // Save only if there is no best yet, or this game used fewer tries.
    if (best === null || tries < best) {
        localStorage.setItem(`guess-best-${level}`, tries);
        return true;
    }
    return false;
}

// Moves the orange bar to show the numbers that are still possible.
function updateRange() {
    const { max } = LEVELS[game.level];   // destructuring: same as const max = LEVELS[game.level].max
    rangeLow.textContent = game.low;
    rangeHigh.textContent = game.high;
    // Convert numbers to percentages of the full range.
    const left = ((game.low - 1) / max) * 100;
    const width = ((game.high - game.low + 1) / max) * 100;
    rangeFill.style.left = `${left}%`;
    rangeFill.style.width = `${width}%`;
}

// ---------- Game flow ----------

function newGame() {
    const { max, tries } = LEVELS[game.level];

    game.secret = randomBetween(1, max);
    game.triesLeft = tries;
    game.low = 1;
    game.high = max;
    game.guesses = [];
    game.over = false;

    // Reset the page to match the new state.
    intro.textContent = `I'm thinking of a number between 1 and ${max}. You have ${tries} tries.`;
    guessInput.min = 1;
    guessInput.max = max;
    guessInput.value = '';
    guessInput.disabled = false;
    guessBtn.disabled = false;
    triesLeftEl.textContent = tries;
    const best = getBest(game.level);
    bestEl.textContent = best === null ? '–' : `${best} tries`;
    guessList.innerHTML = '';
    playAgainBtn.hidden = true;
    say('Make your first guess.');
    updateRange();
    guessInput.focus();
}

function addChip(value, type) {
    const li = document.createElement('li');
    li.textContent = value;
    li.className = type;
    guessList.appendChild(li);
}

function endGame() {
    game.over = true;
    guessInput.disabled = true;
    guessBtn.disabled = true;
    playAgainBtn.hidden = false;
    playAgainBtn.focus();
}

function handleGuess(event) {
    // A form normally reloads the page when submitted. preventDefault() stops that.
    event.preventDefault();
    if (game.over) return;

    const { max } = LEVELS[game.level];
    const guess = Number(guessInput.value);

    // ----- Validation: make sure the guess makes sense before using a try. -----
    if (guessInput.value.trim() === '' || !Number.isInteger(guess)) {
        say('Please type a whole number.', 'warn');
        return;
    }
    if (guess < 1 || guess > max) {
        say(`Your guess must be between 1 and ${max}.`, 'warn');
        return;
    }
    // includes() checks whether the array already contains the value.
    if (game.guesses.includes(guess)) {
        say(`You already tried ${guess}.`, 'warn');
        return;
    }

    // ----- A valid guess: use up one try. -----
    game.guesses.push(guess);
    game.triesLeft--;                 // same as game.triesLeft = game.triesLeft - 1
    triesLeftEl.textContent = game.triesLeft;
    guessInput.value = '';

    if (guess === game.secret) {
        const used = game.guesses.length;
        addChip(guess, 'win');
        // A different word for one try vs many: "1 try" / "3 tries".
        const word = used === 1 ? 'try' : 'tries';
        const isBest = saveBest(game.level, used);
        say(`🎉 Correct! You got it in ${used} ${word}.${isBest ? ' New best!' : ''}`, 'win');
        bestEl.textContent = `${getBest(game.level)} tries`;
        game.low = game.high = guess;
        updateRange();
        endGame();
        return;
    }

    // Wrong guess: give a hint and narrow the possible range.
    if (guess < game.secret) {
        addChip(guess, 'higher');
        // Math.max keeps the range from growing if the player guesses outside it.
        game.low = Math.max(game.low, guess + 1);
        say(`⬆️ Higher than ${guess}!`, 'higher');
    } else {
        addChip(guess, 'lower');
        game.high = Math.min(game.high, guess - 1);
        say(`⬇️ Lower than ${guess}!`, 'lower');
    }
    updateRange();

    // Restart the shake animation: remove the class, force a reflow, add it again.
    form.classList.remove('shake');
    void form.offsetWidth;            // reading offsetWidth makes the browser apply the removal first
    form.classList.add('shake');

    if (game.triesLeft === 0) {
        say(`💀 Out of tries! The number was ${game.secret}.`, 'lose');
        endGame();
    } else {
        guessInput.focus();
    }
}

// ---------- Events ----------

// 'submit' fires when the Guess button is clicked OR Enter is pressed in the input.
form.addEventListener('submit', handleGuess);
playAgainBtn.addEventListener('click', newGame);

levelButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
        game.level = btn.dataset.level;
        levelButtons.forEach((b) => b.classList.toggle('active', b === btn));
        newGame();
    });
});

newGame();
