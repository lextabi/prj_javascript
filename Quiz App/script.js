// Quiz App - rendering screens from data, timers and array methods.
// QUESTIONS comes from questions.js, which is loaded first in index.html.

// ---------- Settings ----------

const QUESTIONS_PER_GAME = 10;
const SECONDS_PER_QUESTION = 15;
const HIGH_SCORE_KEY = 'quiz-high-score';

// ---------- Elements ----------

const screens = {
    start: document.getElementById('start-screen'),
    question: document.getElementById('question-screen'),
    result: document.getElementById('result-screen'),
};
const highScoreEl = document.getElementById('high-score');
const progressText = document.getElementById('progress-text');
const progressFill = document.getElementById('progress-fill');
const timerEl = document.getElementById('timer');
const questionEl = document.getElementById('question');
const answersEl = document.getElementById('answers');
const feedbackEl = document.getElementById('feedback');
const nextBtn = document.getElementById('next-btn');

// ---------- State ----------

let questions = [];        // this game's questions, shuffled
let index = 0;             // which question we are on
let results = [];          // one entry per answered question
let timeLeft = 0;
let timerId = null;        // the id returned by setInterval, needed to stop it
let answered = false;

// ---------- Helpers ----------

// Returns a shuffled COPY of an array (Fisher–Yates shuffle, the fair way to shuffle).
function shuffle(array) {
    const copy = [...array];                        // spread into a new array; never change the original
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];    // swap two items
    }
    return copy;
}

// Shows one screen and hides the others.
function showScreen(name) {
    // Object.entries() gives [key, value] pairs we can loop over.
    for (const [key, screen] of Object.entries(screens)) {
        screen.hidden = key !== name;
    }
}

function showHighScore() {
    const best = localStorage.getItem(HIGH_SCORE_KEY);
    highScoreEl.textContent = best === null ? '' : `🏆 Your best: ${best} / ${QUESTIONS_PER_GAME}`;
}

// ---------- Game flow ----------

function startQuiz() {
    // Pick 10 random questions, and shuffle each one's answers too.
    questions = shuffle(QUESTIONS).slice(0, QUESTIONS_PER_GAME).map((q) => {
        // Remember the right answer's TEXT, because its position changes when shuffled.
        const correctText = q.answers[q.correct];
        const answers = shuffle(q.answers);
        // Spread copies every property of q, then we override answers and correct.
        return { ...q, answers, correct: answers.indexOf(correctText) };
    });
    index = 0;
    results = [];
    showScreen('question');
    showQuestion();
}

function showQuestion() {
    const q = questions[index];
    answered = false;

    progressText.textContent = `Question ${index + 1} / ${questions.length}`;
    progressFill.style.width = `${(index / questions.length) * 100}%`;
    // textContent (not innerHTML) because some questions contain "<script>" as text.
    questionEl.textContent = q.question;
    feedbackEl.textContent = '';
    nextBtn.hidden = true;
    answersEl.classList.remove('locked');

    // Build one button per answer.
    answersEl.innerHTML = '';
    q.answers.forEach((answer, i) => {
        const btn = document.createElement('button');
        btn.className = 'answer';
        btn.dataset.index = i;

        const key = document.createElement('span');
        key.className = 'key';
        key.textContent = i + 1;

        const text = document.createElement('span');
        text.textContent = answer;

        btn.append(key, text);
        btn.addEventListener('click', () => selectAnswer(i));
        answersEl.appendChild(btn);
    });

    startTimer();
}

function startTimer() {
    timeLeft = SECONDS_PER_QUESTION;
    updateTimer();
    // Always clear an old timer before starting a new one, or two would run at once.
    clearInterval(timerId);
    timerId = setInterval(() => {
        timeLeft--;
        updateTimer();
        if (timeLeft <= 0) {
            clearInterval(timerId);
            selectAnswer(null);            // null = time ran out, no answer chosen
        }
    }, 1000);
}

function updateTimer() {
    timerEl.textContent = `⏱ ${timeLeft}`;
    timerEl.classList.toggle('urgent', timeLeft <= 5);
}

// choice is the index of the clicked answer, or null when time ran out.
function selectAnswer(choice) {
    if (answered) return;                  // ignore extra clicks
    answered = true;
    clearInterval(timerId);

    const q = questions[index];
    const isCorrect = choice === q.correct;
    results.push({ question: q, choice, isCorrect });

    // Lock all buttons, color the right answer green and a wrong choice red.
    answersEl.classList.add('locked');
    answersEl.querySelectorAll('.answer').forEach((btn) => {
        const i = Number(btn.dataset.index);
        btn.disabled = true;
        if (i === q.correct) btn.classList.add('correct');
        if (i === choice && !isCorrect) btn.classList.add('wrong');
    });

    // Build the feedback with elements so the explanation text is never parsed as HTML.
    const verdict = document.createElement('strong');
    if (isCorrect) {
        verdict.className = 'good';
        verdict.textContent = 'Correct! ';
    } else {
        verdict.className = 'bad';
        verdict.textContent = choice === null ? "Time's up! " : 'Not quite. ';
    }
    feedbackEl.replaceChildren(verdict, q.explain);

    nextBtn.textContent = index === questions.length - 1 ? 'See results' : 'Next';
    nextBtn.hidden = false;
    nextBtn.focus();
}

function nextQuestion() {
    index++;
    if (index < questions.length) {
        showQuestion();
    } else {
        showResults();
    }
}

function showResults() {
    progressFill.style.width = '100%';

    // filter() + length counts the correct answers.
    const score = results.filter((r) => r.isCorrect).length;
    const total = results.length;
    const percent = Math.round((score / total) * 100);

    document.getElementById('score-text').textContent = `${score} / ${total}`;
    // setProperty() changes a CSS custom property; the ring's conic-gradient reads it.
    document.getElementById('score-ring').style.setProperty('--percent', `${percent}%`);

    // Pick a title and message from the score.
    let title;
    let message;
    if (percent === 100) {
        title = 'Perfect! 🏆';
        message = 'Every single one right. Impressive!';
    } else if (percent >= 70) {
        title = 'Well done! 🎉';
        message = `You scored ${percent}%. You clearly know your stuff.`;
    } else if (percent >= 40) {
        title = 'Not bad! 👍';
        message = `You scored ${percent}%. Review the answers below and try again.`;
    } else {
        title = 'Keep practising 💪';
        message = `You scored ${percent}%. Every expert started here.`;
    }
    document.getElementById('result-title').textContent = title;
    document.getElementById('result-message').textContent = message;

    // Save a new high score.
    const best = Number(localStorage.getItem(HIGH_SCORE_KEY) ?? -1);   // ?? = "if null, use -1"
    if (score > best) {
        localStorage.setItem(HIGH_SCORE_KEY, score);
        document.getElementById('result-message').textContent += ' New high score!';
    }

    // List the missed questions with the right answers.
    const mistakes = results.filter((r) => !r.isCorrect);
    const review = document.getElementById('review');
    review.innerHTML = '';
    document.getElementById('review-title').hidden = mistakes.length === 0;

    mistakes.forEach(({ question: q, choice }) => {       // destructuring right in the parameter
        const li = document.createElement('li');
        const your = document.createElement('div');
        your.className = 'your';
        your.textContent = `Your answer: ${choice === null ? '(no answer)' : q.answers[choice]}`;
        const right = document.createElement('div');
        right.className = 'right';
        right.textContent = `Correct: ${q.answers[q.correct]}`;
        li.append(q.question, your, right);
        review.appendChild(li);
    });

    showScreen('result');
    showHighScore();
}

// ---------- Events ----------

document.getElementById('start-btn').addEventListener('click', startQuiz);
document.getElementById('restart-btn').addEventListener('click', startQuiz);
nextBtn.addEventListener('click', nextQuestion);

// Keyboard: 1-4 picks an answer while the question screen is open.
document.addEventListener('keydown', (e) => {
    if (screens.question.hidden) return;
    const number = Number(e.key);
    if (!answered && number >= 1 && number <= questions[index].answers.length) {
        selectAnswer(number - 1);
    }
});

showHighScore();
