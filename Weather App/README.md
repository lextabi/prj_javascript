# Weather App

Current weather and a 7-day forecast for any city in the world, using the free [Open-Meteo](https://open-meteo.com/) API (no account or API key needed). It has °C/°F, "use my location", recent searches, "did you mean" suggestions for places with the same name, and a background that changes with the weather.

## Concepts shown

- **`fetch()`** with **`async` / `await`**, and chaining two APIs (city name → coordinates → forecast)
- checking `response.ok` (fetch does not fail on 404/500) and throwing your own `Error`
- **`try` / `catch`** with different messages for "not found", server errors and no internet (`TypeError`)
- **loading states** (a CSS spinner) and error states for the user
- `AbortController` to cancel an older request when a newer search starts
- `URLSearchParams` to build query strings safely
- a `Map` to turn weather codes into text, emoji and a background
- `?.` (optional chaining), `??` (nullish coalescing), `filter(Boolean)`, `Math.min(...array)`
- the **Geolocation API** (`navigator.geolocation.getCurrentPosition`) with success and error callbacks
- `localStorage` for recent searches, the last city and the unit
- CSS: "frosted glass" with `backdrop-filter`, a background chosen by `body[data-sky="rain"]`, a spinner made with `border-top-color` + `@keyframes`, `:empty`, forecast bars positioned in %

## Run

Open `index.html` in any browser (it needs an internet connection), or try the [live demo](https://lextabi.github.io/prj_javascript/Weather%20App/).

"Use my location" only works on `https://` pages or `localhost`, so try it on the live demo.

## Sample result

```
Weather                                   [°C] °F
[ Search for a city…            ] [Search] [📍]
(Manila) (Tokyo) (London)

Manila, National Capital Region, Philippines           ⛅ 28°C
Local time 23:15
Partly cloudy

Feels like 34°C   Humidity 84%   Wind 3 km/h   Rain chance 57%
Did you mean: (Manila, Utah, United States) (Manila, Arkansas, United States)

7-DAY FORECAST
Today  🌦️  💧57%   25° ━━━━━━━━━━━━━  32°
Sun    🌦️  💧41%   26°   ━━━━━━━━━━━━ 33°
Mon    🌦️  💧86%   26°   ━━━━━━━━━━━  33°
...
```
