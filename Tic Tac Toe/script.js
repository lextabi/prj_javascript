// Tic Tac Toe - a board stored as an array, win detection and a simple computer player.

// ---------- The board as data ----------

// The board is an array of 9 cells. Each cell is 'X', 'O' or null (empty).
// Index layout:   0 | 1 | 2
//                 3 | 4 | 5
//                 6 | 7 | 8
let board = Array(9).fill(null);

// Every way to win: 3 rows, 3 columns and 2 diagonals, as lists of cell indexes.
const WIN_LINES = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],      // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8],      // columns
    [0, 4, 8], [2, 4, 6],                 // diagonals
];

// ---------- Elements ----------

const cells = document.querySelectorAll('.cell');
const statusEl = document.getElementById('status');
const modeButtons = document.querySelectorAll('.mode');
const scoreEls = {
    X: document.getElementById('score-x'),
    O: document.getElementById('score-o'),
    draw: document.getElementById('score-draw'),
};

// ---------- State ----------

let current = 'X';           // whose turn it is
let gameOver = false;
let mode = 'pvp';            // 'pvp' = two players, 'cpu' = against the computer (the computer is O)
let starter = 'X';           // who starts the round; it alternates each round to be fair
const SCORE_KEY = 'ttt-scores';
let scores = loadScores();

// Reads the saved scoreboard, or starts from zero if there is none (or it is broken).
function loadScores() {
    try {
        // ?? (nullish coalescing) uses the right side when the left side is null or undefined.
        return JSON.parse(localStorage.getItem(SCORE_KEY)) ?? { X: 0, O: 0, draw: 0 };
    } catch {
        return { X: 0, O: 0, draw: 0 };
    }
}

// ---------- Rules ----------

// Returns { player, line } for a winner, 'draw' for a full board, or null if the game goes on.
// It takes the board as a parameter so the computer can test imaginary moves with it.
function getResult(b) {
    for (const line of WIN_LINES) {
        const [a, c, d] = line;           // destructure the three indexes
        // b[a] must not be null, and all three cells must be the same.
        if (b[a] && b[a] === b[c] && b[a] === b[d]) {
            return { player: b[a], line };
        }
    }
    // every() is true when no cell is null, i.e. the board is full.
    if (b.every((cell) => cell !== null)) return 'draw';
    return null;
}

// ---------- Computer player ----------

// A simple rule-based opponent. It tries, in order:
//   1. win now   2. block the player's win   3. take the centre
//   4. take a corner   5. take any free side
function computerMove() {
    // A list of the indexes of the empty cells.
    const empty = board.map((cell, i) => (cell === null ? i : null)).filter((i) => i !== null);

    // Finds a cell that would complete a line for "player".
    function findWinningCell(player) {
        for (const i of empty) {
            const test = [...board];        // copy the board, try the move, check the result
            test[i] = player;
            const result = getResult(test);
            if (result && result.player === player) return i;
        }
        return null;
    }

    const win = findWinningCell('O');
    if (win !== null) return win;

    const block = findWinningCell('X');
    if (block !== null) return block;

    if (board[4] === null) return 4;

    const corners = [0, 2, 6, 8].filter((i) => board[i] === null);
    if (corners.length) return corners[Math.floor(Math.random() * corners.length)];

    return empty[Math.floor(Math.random() * empty.length)];
}

// ---------- Playing ----------

function play(index) {
    // Ignore clicks on a full cell or after the game has ended.
    if (gameOver || board[index] !== null) return;

    board[index] = current;
    render();

    const result = getResult(board);
    if (result) {
        endRound(result);
        return;
    }

    // Switch turns: X becomes O and O becomes X.
    current = current === 'X' ? 'O' : 'X';
    updateStatus();

    if (mode === 'cpu' && current === 'O') {
        // Wait a moment so the computer's move feels natural (and the player sees their own move).
        lockBoard(true);
        setTimeout(() => {
            lockBoard(false);
            play(computerMove());
        }, 450);
    }
}

function endRound(result) {
    gameOver = true;

    if (result === 'draw') {
        scores.draw++;
        statusEl.textContent = "It's a draw! 🤝";
    } else {
        scores[result.player]++;
        // Highlight the three winning cells.
        result.line.forEach((i) => cells[i].classList.add('win'));
        const name = mode === 'cpu' ? (result.player === 'X' ? 'You win' : 'Computer wins') : `${result.player} wins`;
        statusEl.textContent = `${name}! 🎉`;
    }

    localStorage.setItem(SCORE_KEY, JSON.stringify(scores));
    renderScores();
    lockBoard(true);
}

function newRound() {
    board = Array(9).fill(null);
    gameOver = false;
    // Alternate who goes first each round.
    starter = starter === 'X' ? 'O' : 'X';
    current = starter;
    cells.forEach((cell) => cell.classList.remove('win'));
    lockBoard(false);
    render();
    updateStatus();

    // If the computer starts this round, let it move.
    if (mode === 'cpu' && current === 'O') {
        lockBoard(true);
        setTimeout(() => {
            lockBoard(false);
            play(computerMove());
        }, 450);
    }
}

// ---------- Drawing ----------

function render() {
    cells.forEach((cell, i) => {
        const value = board[i];
        cell.textContent = value ?? '';
        // Set the class to "cell x", "cell o" or just "cell".
        cell.className = value ? `cell ${value.toLowerCase()}` : 'cell';
        cell.disabled = value !== null || gameOver;
        // Math.floor(i / 3) is the row, i % 3 is the column.
        cell.setAttribute('aria-label', `Row ${Math.floor(i / 3) + 1}, column ${(i % 3) + 1}, ${value ?? 'empty'}`);
    });
}

function lockBoard(locked) {
    cells.forEach((cell, i) => {
        cell.disabled = locked || board[i] !== null;
    });
}

function updateStatus() {
    if (mode === 'cpu') {
        statusEl.textContent = current === 'X' ? 'Your turn (X)' : 'Computer is thinking…';
    } else {
        statusEl.textContent = `${current}'s turn`;
    }
}

function renderScores() {
    scoreEls.X.textContent = scores.X;
    scoreEls.O.textContent = scores.O;
    scoreEls.draw.textContent = scores.draw;
    document.getElementById('label-x').textContent = mode === 'cpu' ? 'You (X)' : 'Player X';
    document.getElementById('label-o').textContent = mode === 'cpu' ? 'Computer (O)' : 'Player O';
}

// ---------- Events ----------

// Event delegation on the board.
document.getElementById('board').addEventListener('click', (e) => {
    const cell = e.target.closest('.cell');
    if (!cell) return;
    // In cpu mode, only accept clicks on the player's turn.
    if (mode === 'cpu' && current === 'O') return;
    play(Number(cell.dataset.cell));
});

modeButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
        mode = btn.dataset.mode;
        modeButtons.forEach((b) => b.classList.toggle('active', b === btn));
        // A new mode starts clean scores and lets X begin.
        scores = { X: 0, O: 0, draw: 0 };
        localStorage.setItem(SCORE_KEY, JSON.stringify(scores));
        starter = 'O';                   // newRound() flips it to X
        renderScores();
        newRound();
    });
});

document.getElementById('new-round').addEventListener('click', newRound);

document.getElementById('reset-scores').addEventListener('click', () => {
    scores = { X: 0, O: 0, draw: 0 };
    localStorage.setItem(SCORE_KEY, JSON.stringify(scores));
    renderScores();
});

render();
renderScores();
updateStatus();
