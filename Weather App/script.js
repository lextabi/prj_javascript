// Weather App - fetch(), async/await, error handling and loading states.
// Uses the free Open-Meteo APIs (no account or API key needed):
//   1. the geocoding API turns a city name into latitude/longitude
//   2. the forecast API returns the weather for those coordinates

// ---------- Settings ----------

const GEO_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast';
const DEFAULT_CITY = 'Manila';
const MAX_RECENT = 5;

// WMO weather codes (what the API returns) → a description, an emoji and a background "sky".
// A Map is like an object, but its keys can be numbers and it keeps insertion order.
const WEATHER_CODES = new Map([
    [0, ['Clear sky', '☀️', 'clear']],
    [1, ['Mainly clear', '🌤️', 'clear']],
    [2, ['Partly cloudy', '⛅', 'cloudy']],
    [3, ['Overcast', '☁️', 'cloudy']],
    [45, ['Fog', '🌫️', 'cloudy']],
    [48, ['Freezing fog', '🌫️', 'cloudy']],
    [51, ['Light drizzle', '🌦️', 'rain']],
    [53, ['Drizzle', '🌦️', 'rain']],
    [55, ['Heavy drizzle', '🌧️', 'rain']],
    [56, ['Freezing drizzle', '🌧️', 'rain']],
    [57, ['Freezing drizzle', '🌧️', 'rain']],
    [61, ['Light rain', '🌦️', 'rain']],
    [63, ['Rain', '🌧️', 'rain']],
    [65, ['Heavy rain', '🌧️', 'rain']],
    [66, ['Freezing rain', '🌧️', 'rain']],
    [67, ['Freezing rain', '🌧️', 'rain']],
    [71, ['Light snow', '🌨️', 'snow']],
    [73, ['Snow', '🌨️', 'snow']],
    [75, ['Heavy snow', '❄️', 'snow']],
    [77, ['Snow grains', '🌨️', 'snow']],
    [80, ['Rain showers', '🌦️', 'rain']],
    [81, ['Rain showers', '🌧️', 'rain']],
    [82, ['Violent rain showers', '⛈️', 'storm']],
    [85, ['Snow showers', '🌨️', 'snow']],
    [86, ['Heavy snow showers', '❄️', 'snow']],
    [95, ['Thunderstorm', '⛈️', 'storm']],
    [96, ['Thunderstorm with hail', '⛈️', 'storm']],
    [99, ['Thunderstorm with hail', '⛈️', 'storm']],
]);

// ---------- Elements ----------

const form = document.getElementById('search-form');
const cityInput = document.getElementById('city');
const statusEl = document.getElementById('status');
const weatherEl = document.getElementById('weather');
const recentEl = document.getElementById('recent');
const alternativesEl = document.getElementById('alternatives');
const unitButtons = document.querySelectorAll('.units button');

// ---------- State ----------

let unit = localStorage.getItem('weather-unit') || 'celsius';
let lastPlace = null;          // the place currently shown, so a unit change can reload it
let controller = null;         // an AbortController for the request in progress

// ---------- Small helpers ----------

// Looks up a weather code, with a safe fallback for codes we do not know.
function describe(code, isDay = 1) {
    const [text, emoji, sky] = WEATHER_CODES.get(code) ?? ['Unknown', '🌡️', 'cloudy'];
    // Show a moon instead of a sun at night.
    const nightEmoji = code <= 1 && !isDay ? '🌙' : emoji;
    const nightSky = sky === 'clear' ? (isDay ? 'clear-day' : 'clear-night') : sky;
    return { text, emoji: nightEmoji, sky: nightSky };
}

function setStatus(message, type = '') {
    statusEl.textContent = message;
    statusEl.className = `status ${type}`;
}

// "Manila, National Capital Region, Philippines" without empty parts.
function placeLabel(place) {
    // filter(Boolean) removes empty values like undefined or ''.
    return [place.name, place.admin1, place.country].filter(Boolean).join(', ');
}

// ---------- Talking to the APIs ----------

// Fetches a URL and returns the parsed JSON, or throws a helpful error.
async function getJSON(url, signal) {
    // fetch() returns a Promise; await pauses this function until the response arrives.
    const response = await fetch(url, { signal });
    // fetch only rejects on network failures. A 404 or 500 still "succeeds", so check ok ourselves.
    if (!response.ok) {
        throw new Error(`The weather service answered with an error (${response.status}).`);
    }
    return response.json();          // .json() also returns a Promise
}

// City name → list of matching places.
async function findPlaces(name, signal) {
    // URLSearchParams builds "?name=...&count=5" and escapes spaces and special characters for us.
    const params = new URLSearchParams({ name, count: 5, language: 'en', format: 'json' });
    const data = await getJSON(`${GEO_URL}?${params}`, signal);
    // When nothing matches, the API leaves out "results" completely, so default to [].
    return data.results ?? [];
}

// Coordinates → current weather and 7-day forecast.
async function getForecast(place, signal) {
    const params = new URLSearchParams({
        latitude: place.latitude,
        longitude: place.longitude,
        current: 'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,is_day',
        daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
        timezone: 'auto',              // times come back in the city's own time zone
        forecast_days: 7,
        temperature_unit: unit,
        wind_speed_unit: unit === 'fahrenheit' ? 'mph' : 'kmh',
    });
    return getJSON(`${WEATHER_URL}?${params}`, signal);
}

// ---------- Main flow ----------

// Search by name: find the place, then load its weather.
async function searchCity(name) {
    const query = name.trim();
    if (!query) return;

    // If a previous search is still running, cancel it: only the newest search matters.
    controller?.abort();                // ?. calls abort() only if controller is not null
    controller = new AbortController();
    const { signal } = controller;

    setStatus(`Searching for “${query}”…`, 'loading');

    try {
        const places = await findPlaces(query, signal);
        if (places.length === 0) {
            setStatus(`No place called “${query}” was found. Check the spelling and try again.`, 'error');
            return;
        }
        // Show the best match, and offer the others as buttons.
        await loadWeather(places[0], signal, places.slice(1));
    } catch (error) {
        handleError(error);
    }
}

// Loads and shows the weather for one place.
async function loadWeather(place, signal, alternatives = []) {
    setStatus(`Loading the weather for ${place.name}…`, 'loading');
    const data = await getForecast(place, signal);

    lastPlace = place;
    render(place, data);
    renderAlternatives(alternatives);
    // Only real searches (not "my location") go into the recent list.
    if (!place.isMyLocation) {
        saveRecent(place);
        localStorage.setItem('weather-last', JSON.stringify(place));
    }
    setStatus('');
}

function handleError(error) {
    // An aborted request is not a real error: a newer search replaced it.
    if (error.name === 'AbortError') return;

    // TypeError is what fetch throws when there is no internet connection.
    if (error instanceof TypeError) {
        setStatus('Could not reach the weather service. Check your internet connection.', 'error');
    } else {
        setStatus(error.message, 'error');
    }
}

// ---------- Drawing ----------

function render(place, data) {
    const { current, daily } = data;
    const tempUnit = unit === 'fahrenheit' ? '°F' : '°C';
    const windUnit = unit === 'fahrenheit' ? 'mph' : 'km/h';
    const now = describe(current.weather_code, current.is_day);

    document.getElementById('place').textContent = place.isMyLocation ? '📍 Your location' : placeLabel(place);
    // current.time looks like "2026-09-26T23:15" (already in the city's time zone).
    document.getElementById('local-time').textContent = `Local time ${current.time.slice(11)}`;
    document.getElementById('description').textContent = now.text;
    document.getElementById('icon').textContent = now.emoji;
    // Math.round() because nobody needs 27.8 degrees on the big display.
    document.getElementById('temp').textContent = `${Math.round(current.temperature_2m)}${tempUnit}`;
    document.getElementById('feels').textContent = `${Math.round(current.apparent_temperature)}${tempUnit}`;
    document.getElementById('humidity').textContent = `${current.relative_humidity_2m}%`;
    document.getElementById('wind').textContent = `${Math.round(current.wind_speed_10m)} ${windUnit}`;
    document.getElementById('rain').textContent = `${daily.precipitation_probability_max[0] ?? '–'}%`;

    document.body.dataset.sky = now.sky;
    renderForecast(daily);
    weatherEl.hidden = false;
}

function renderForecast(daily) {
    // The week's lowest and highest temperatures, to scale every day's bar.
    // Math.min(...array) spreads the array into separate arguments.
    const weekMin = Math.min(...daily.temperature_2m_min);
    const weekMax = Math.max(...daily.temperature_2m_max);
    const span = weekMax - weekMin || 1;          // avoid dividing by zero

    const list = document.getElementById('forecast');
    list.innerHTML = '';

    // daily.time is an array of dates; the other daily arrays line up with it by index.
    daily.time.forEach((date, i) => {
        const min = daily.temperature_2m_min[i];
        const max = daily.temperature_2m_max[i];
        const { text, emoji } = describe(daily.weather_code[i]);
        // Adding "T00:00" makes JavaScript read the date as local time, not UTC.
        const dayName = i === 0 ? 'Today' : new Date(`${date}T00:00`).toLocaleDateString('en-US', { weekday: 'short' });

        const li = document.createElement('li');
        // All values here are numbers or come from our own table, so innerHTML is safe.
        li.innerHTML = `
            <span class="day">${dayName}</span>
            <span class="f-icon" title="${text}">${emoji}</span>
            <span class="f-rain">💧${daily.precipitation_probability_max[i] ?? 0}%</span>
            <span class="range">
                <span class="min">${Math.round(min)}°</span>
                <span class="bar"><span style="left:${((min - weekMin) / span) * 100}%; width:${((max - min) / span) * 100}%"></span></span>
                <span class="max">${Math.round(max)}°</span>
            </span>`;
        list.appendChild(li);
    });
}

function renderAlternatives(places) {
    alternativesEl.innerHTML = '';
    if (places.length === 0) return;
    alternativesEl.append('Did you mean: ');
    places.forEach((place) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'chip';
        // textContent, because place names come from the internet.
        btn.textContent = placeLabel(place);
        btn.addEventListener('click', () => showPlace(place));
        alternativesEl.appendChild(btn);
    });
}

// Loads a place we already have coordinates for (alternatives, recent searches, unit changes).
async function showPlace(place) {
    controller?.abort();
    controller = new AbortController();
    try {
        await loadWeather(place, controller.signal);
    } catch (error) {
        handleError(error);
    }
}

// ---------- Recent searches ----------

function getRecent() {
    try {
        const saved = JSON.parse(localStorage.getItem('weather-recent'));
        return Array.isArray(saved) ? saved : [];
    } catch {
        return [];
    }
}

function saveRecent(place) {
    // Remove this place if it is already in the list, then put it first.
    const recent = getRecent().filter((p) => p.id !== place.id);
    recent.unshift({
        id: place.id, name: place.name, admin1: place.admin1, country: place.country,
        latitude: place.latitude, longitude: place.longitude,
    });
    localStorage.setItem('weather-recent', JSON.stringify(recent.slice(0, MAX_RECENT)));
    renderRecent();
}

function renderRecent() {
    recentEl.innerHTML = '';
    getRecent().forEach((place) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'chip';
        btn.textContent = place.name;
        btn.title = placeLabel(place);
        btn.addEventListener('click', () => showPlace(place));
        recentEl.appendChild(btn);
    });
}

// ---------- Events ----------

form.addEventListener('submit', (e) => {
    e.preventDefault();
    searchCity(cityInput.value);
    cityInput.blur();                  // close the keyboard on phones
});

unitButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
        unit = btn.dataset.unit;
        localStorage.setItem('weather-unit', unit);
        unitButtons.forEach((b) => b.setAttribute('aria-pressed', b === btn));
        if (lastPlace) showPlace(lastPlace);    // reload the same place in the new unit
    });
});

// The Geolocation API asks the user for permission, then gives us their coordinates.
document.getElementById('locate').addEventListener('click', () => {
    if (!('geolocation' in navigator)) {
        setStatus('Your browser cannot share your location.', 'error');
        return;
    }
    setStatus('Finding your location…', 'loading');
    navigator.geolocation.getCurrentPosition(
        // Success callback: runs when the position is known.
        (position) => {
            showPlace({
                name: 'your location',
                isMyLocation: true,
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
            });
        },
        // Error callback: permission denied, no signal, and so on.
        () => setStatus('Location access was blocked. Search for a city instead.', 'error'),
        { timeout: 10000 },
    );
});

// ---------- Start ----------

unitButtons.forEach((b) => b.setAttribute('aria-pressed', b.dataset.unit === unit));
renderRecent();

// Show the last place the user looked at, or the default city.
let startPlace = null;
try {
    startPlace = JSON.parse(localStorage.getItem('weather-last'));
} catch {
    startPlace = null;
}
if (startPlace) {
    showPlace(startPlace);
} else {
    searchCity(DEFAULT_CITY);
}
