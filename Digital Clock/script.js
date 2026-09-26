// Digital Clock - Date objects, timers and formatting.

// ---------- Elements ----------

const hoursEl = document.getElementById('hours');
const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');
const ampmEl = document.getElementById('ampm');
const dateEl = document.getElementById('date');
const greetingEl = document.getElementById('greeting');
const format24 = document.getElementById('format24');
const worldList = document.getElementById('world');

// Cities for the world clock. Each item is an object with a label and an IANA time zone name.
const cities = [
    { name: 'London', zone: 'Europe/London' },
    { name: 'New York', zone: 'America/New_York' },
    { name: 'Tokyo', zone: 'Asia/Tokyo' },
    { name: 'Sydney', zone: 'Australia/Sydney' },
];

// ---------- Helpers ----------

// pad(7) returns "07". padStart(2, '0') adds zeros on the left until the string is 2 long.
function pad(number) {
    return String(number).padStart(2, '0');
}

// Chooses a greeting from the hour (0-23).
function getGreeting(hour) {
    if (hour < 12) return 'Good morning ☀️';
    if (hour < 18) return 'Good afternoon 🌤️';
    return 'Good evening 🌙';
}

// ---------- Main clock ----------

function updateClock() {
    // new Date() with no arguments means "right now".
    const now = new Date();

    // getHours() returns 0-23, getMinutes() and getSeconds() return 0-59.
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    if (format24.checked) {
        ampmEl.textContent = '';
    } else {
        // 12-hour clock: 0 becomes 12, 13 becomes 1, and so on.
        // The ternary operator (condition ? a : b) is a short if/else.
        ampmEl.textContent = hours >= 12 ? 'PM' : 'AM';
        // % is the remainder: 13 % 12 = 1. "|| 12" turns 0 into 12.
        hours = hours % 12 || 12;
    }

    hoursEl.textContent = pad(hours);
    minutesEl.textContent = pad(minutes);
    secondsEl.textContent = pad(seconds);

    // toLocaleDateString() formats a date for a language and region.
    // The options object says which parts to show and how long each should be.
    dateEl.textContent = now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    greetingEl.textContent = getGreeting(now.getHours());

    // The <time> element should also carry a machine-readable value.
    // toISOString() gives something like "2026-09-26T14:05:09.000Z".
    document.getElementById('time').setAttribute('datetime', now.toISOString());

    updateWorldClocks(now);
}

// ---------- World clocks ----------

// Build the list items once, then only update the text every second.
function createWorldClocks() {
    cities.forEach((city) => {
        const li = document.createElement('li');
        // innerHTML lets us write a small piece of HTML as a string.
        // It is safe here because the text comes from our own array, not from the user.
        li.innerHTML = `<span>${city.name}<span class="offset"></span></span><span class="city-time"></span>`;
        worldList.appendChild(li);
    });
}

function updateWorldClocks(now) {
    // querySelectorAll() returns every <li>, in the same order as the cities array.
    const items = worldList.querySelectorAll('li');

    cities.forEach((city, index) => {
        const li = items[index];
        // The timeZone option converts "now" to that city's local time.
        li.querySelector('.city-time').textContent = now.toLocaleTimeString('en-US', {
            timeZone: city.zone,
            hour: '2-digit',
            minute: '2-digit',
            // hourCycle 'h23' = 00-23, 'h12' = 1-12 with AM/PM. (hour12: false can show "24:05" at midnight.)
            hourCycle: format24.checked ? 'h23' : 'h12',
        });
        // Show the day difference with a short weekday name, for example "Sun".
        li.querySelector('.offset').textContent = now.toLocaleDateString('en-US', {
            timeZone: city.zone,
            weekday: 'short',
        });
    });
}

// ---------- Start ----------

// Remember the user's choice between visits with localStorage (it only stores strings).
format24.checked = localStorage.getItem('clock-24h') === 'true';

format24.addEventListener('change', () => {
    localStorage.setItem('clock-24h', format24.checked);
    updateClock();                     // redraw straight away instead of waiting for the next tick
});

createWorldClocks();
updateClock();                         // draw once immediately so the page does not show 00:00:00
// setInterval(fn, 1000) runs fn every 1000 ms (every second) until the page is closed.
setInterval(updateClock, 1000);
