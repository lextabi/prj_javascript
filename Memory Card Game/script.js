// Memory Card Game - shuffling, timers, a "lock" while cards are compared, and a <dialog>.

// ---------- Settings ----------

const LEVELS = {
    easy:   { columns: 4, pairs: 6 },
    normal: { columns: 4, pairs: 8 },
    hard:   { columns: 6, pairs: 18 },
};

// 18 emojis, enough for the biggest board.
const SYMBOLS = ['🍎', '🍌', '🍇', '🍉', '🍒', '🍍', '🥝', '🍑', '🥥', '🍋', '🍓', '🥕',
    '🌽', '🍄', '🥑', '🍔', '🍕', '🍩'];

const FLIP_BACK_DELAY = 800;      // ms to show two wrong cards before turning them back

// ---------- Elements ----------

const board = document.getElementById('board');
const levelSelect = document.getElementById('level');
const movesEl = document.getElementById('moves');
const timeEl = document.getElementById('time');
const pairsEl = document.getElementById('pairs');
const bestEl = document.getElementById('best');
const dialog = document.getElementById('win-dialog');

// ---------- State ----------

let level = 'normal';
let firstCard = null;       // the first card turned over this move
let lockBoard = false;      // true while two unmatched cards are showing
let moves = 0;
let matchedPairs = 0;
let seconds = 0;
let timerId = null;
let flipBackId = null;      // the pending "turn the cards back" timeout, so Restart can cancel it

// ---------- Shuffle ----------

// The Fisher–Yates shuffle. Walk backwards through the array and swap each item
// with a random item at or before it. Every order is equally likely.
// (The popular array.sort(() => Math.random() - 0.5) trick is NOT fair.)
function shuffle(array) {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));    // random index from 0 to i
        [result[i], result[j]] = [result[j], result[i]];  // swap
    }
    return result;
}

// ---------- Timer ----------

// 75 seconds → "1:15"
function formatTime(totalSeconds) {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
}

function startTimer() {
    // The timer starts on the first flip, not when the page loads.
    if (timerId !== null) return;
    timerId = setInterval(() => {
        seconds++;
        timeEl.textContent = formatTime(seconds);
    }, 1000);
}

function stopTimer() {
    clearInterval(timerId);
    timerId = null;
}

// ---------- Setting up a game ----------

function newGame() {
    stopTimer();
    clearTimeout(flipBackId);
    const { columns, pairs } = LEVELS[level];

    // Reset the state.
    firstCard = null;
    lockBoard = false;
    moves = 0;
    matchedPairs = 0;
    seconds = 0;
    movesEl.textContent = 0;
    timeEl.textContent = '0:00';
    pairsEl.textContent = `0 / ${pairs}`;
    showBest();

    // Pick the symbols, double them to make pairs, then shuffle.
    const chosen = shuffle(SYMBOLS).slice(0, pairs);
    const deck = shuffle([...chosen, ...chosen]);

    // Tell CSS how many columns to use.
    board.style.setProperty('--columns', columns);
    board.classList.toggle('hard', level === 'hard');

    // A DocumentFragment builds all the cards off-screen, then adds them to the page in one go.
    const fragment = document.createDocumentFragment();
    deck.forEach((symbol, i) => {
        const card = document.createElement('button');
        card.className = 'card';
        card.type = 'button';
        card.dataset.symbol = symbol;
        card.setAttribute('aria-label', `Card ${i + 1}, face down`);
        // The inner structure: one element that rotates, holding a back and a front side.
        // innerHTML is safe here because the symbols come from our own array.
        card.innerHTML = `
            <span class="card-inner">
                <span class="card-back">?</span>
                <span class="card-front">${symbol}</span>
            </span>`;
        fragment.appendChild(card);
    });
    board.replaceChildren(fragment);
}

// ---------- Playing ----------

function flipCard(card) {
    // Ignore the click if: the board is locked, the card is already face up, or already matched.
    if (lockBoard || card === firstCard || card.classList.contains('matched')) return;

    startTimer();
    card.classList.add('flipped');
    card.setAttribute('aria-label', `${card.dataset.symbol}, face up`);

    // First card of the move: remember it and wait for the second.
    if (firstCard === null) {
        firstCard = card;
        return;
    }

    // Second card: count the move and compare.
    const secondCard = card;
    moves++;
    movesEl.textContent = moves;

    if (firstCard.dataset.symbol === secondCard.dataset.symbol) {
        keepPair(firstCard, secondCard);
    } else {
        flipBack(firstCard, secondCard);
    }
}

function keepPair(a, b) {
    // for...of loops over the values in an array.
    for (const card of [a, b]) {
        card.classList.add('matched');
        card.disabled = true;
        card.setAttribute('aria-label', `${card.dataset.symbol}, matched`);
    }
    firstCard = null;
    matchedPairs++;
    pairsEl.textContent = `${matchedPairs} / ${LEVELS[level].pairs}`;

    if (matchedPairs === LEVELS[level].pairs) {
        stopTimer();
        // Wait for the last flip animation before showing the win dialog.
        setTimeout(showWin, 700);
    }
}

function flipBack(a, b) {
    // Lock the board so a third card cannot be turned while these two are showing.
    lockBoard = true;
    a.classList.add('wrong');
    b.classList.add('wrong');

    flipBackId = setTimeout(() => {
        for (const card of [a, b]) {
            card.classList.remove('flipped', 'wrong');
            card.setAttribute('aria-label', 'Card, face down');
        }
        firstCard = null;
        lockBoard = false;
    }, FLIP_BACK_DELAY);
}

// ---------- Winning and best scores ----------

function bestKey() {
    return `memory-best-${level}`;
}

// Reads the saved best result for the current level, or null.
function loadBest() {
    try {
        return JSON.parse(localStorage.getItem(bestKey()));   // JSON.parse(null) is null
    } catch {
        return null;
    }
}

function showBest() {
    const best = loadBest();
    bestEl.textContent = best ? `${best.moves} moves` : '–';
}

function showWin() {
    const { pairs } = LEVELS[level];

    // Stars: 3 for a near-perfect game, fewer for more moves.
    // A perfect memory needs exactly "pairs" moves; we allow some slack.
    let stars = 1;
    if (moves <= pairs * 1.5) stars = 3;
    else if (moves <= pairs * 2.2) stars = 2;
    // repeat() repeats a string: '★'.repeat(2) → '★★'.
    document.getElementById('win-stars').textContent = '★'.repeat(stars) + '☆'.repeat(3 - stars);

    let text = `You found all ${pairs} pairs in ${moves} moves and ${formatTime(seconds)}.`;

    // Save the best result (fewest moves, then fastest time).
    const best = loadBest();
    if (!best || moves < best.moves || (moves === best.moves && seconds < best.seconds)) {
        localStorage.setItem(bestKey(), JSON.stringify({ moves, seconds }));
        text += ' 🏆 New best!';
    }
    document.getElementById('win-text').textContent = text;
    showBest();

    dialog.showModal();
}

// ---------- Events ----------

// Event delegation: one listener for all cards, even after they are re-created.
board.addEventListener('click', (e) => {
    const card = e.target.closest('.card');
    if (card) flipCard(card);
});

levelSelect.addEventListener('change', () => {
    level = levelSelect.value;
    newGame();
});

document.getElementById('restart').addEventListener('click', newGame);

// The dialog's 'close' event fires when "Play again" is clicked or Esc is pressed.
dialog.addEventListener('close', newGame);

newGame();
