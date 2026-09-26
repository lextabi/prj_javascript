// The quiz data: an array of objects. Keeping data separate from the code means
// you can add, change or translate questions without touching script.js.
//
// Each question has:
//   question - the text to show
//   answers  - an array of possible answers
//   correct  - the INDEX of the right answer in "answers" (0 = first)
//   explain  - a short explanation shown after answering
const QUESTIONS = [
    {
        question: 'Which keyword declares a variable that cannot be reassigned?',
        answers: ['var', 'let', 'const', 'static'],
        correct: 2,
        explain: 'const creates a binding that cannot be reassigned (the object it points to can still change).',
    },
    {
        question: 'What does typeof null return?',
        answers: ['"null"', '"undefined"', '"object"', '"number"'],
        correct: 2,
        explain: 'A famous historic bug: typeof null is "object".',
    },
    {
        question: 'What is the result of 0.1 + 0.2 === 0.3?',
        answers: ['true', 'false', 'undefined', 'It throws an error'],
        correct: 1,
        explain: 'Binary floating point makes 0.1 + 0.2 equal 0.30000000000000004.',
    },
    {
        question: 'Which array method returns a NEW array with only the items that pass a test?',
        answers: ['map()', 'forEach()', 'filter()', 'find()'],
        correct: 2,
        explain: 'filter() keeps the items where the callback returns true.',
    },
    {
        question: 'Which HTML tag loads a JavaScript file?',
        answers: ['<js>', '<script>', '<link>', '<code>'],
        correct: 1,
        explain: '<script src="file.js"> loads and runs a JavaScript file.',
    },
    {
        question: 'What does "===" check that "==" does not?',
        answers: ['Only the value', 'The value AND the type', 'Only the type', 'Nothing, they are the same'],
        correct: 1,
        explain: '=== is strict equality: "5" === 5 is false, but "5" == 5 is true.',
    },
    {
        question: 'Which CSS property makes a flex container stack its children vertically?',
        answers: ['flex-direction: column', 'display: block', 'align-items: vertical', 'flex-wrap: wrap'],
        correct: 0,
        explain: 'flex-direction: column turns the main axis from horizontal to vertical.',
    },
    {
        question: 'What does localStorage store?',
        answers: ['Any JavaScript value', 'Only strings', 'Only numbers', 'Only objects'],
        correct: 1,
        explain: 'localStorage only stores strings, so objects are saved with JSON.stringify().',
    },
    {
        question: 'Which method adds a function to run when an element is clicked?',
        answers: ['element.onClick()', 'element.addEventListener("click", fn)', 'element.click(fn)', 'element.listen("click", fn)'],
        correct: 1,
        explain: 'addEventListener attaches a listener without replacing others.',
    },
    {
        question: 'What will console.log([1, 2, 3].map(n => n * 2)) print?',
        answers: ['[1, 2, 3]', '[2, 4, 6]', '12', '6'],
        correct: 1,
        explain: 'map() builds a new array from the result of the function for each item.',
    },
    {
        question: 'Which of these is NOT a JavaScript data type?',
        answers: ['boolean', 'undefined', 'float', 'symbol'],
        correct: 2,
        explain: 'JavaScript has one "number" type for integers and decimals; there is no float type.',
    },
    {
        question: 'What does the "async" keyword let a function use?',
        answers: ['await', 'yield', 'return', 'throw'],
        correct: 0,
        explain: 'Inside an async function you can await a Promise.',
    },
];
