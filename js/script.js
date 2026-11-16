// Campus Life Super App - shared script (linked on every page)
// Each section below checks that its elements exist first, so the same file
// can safely run on all four pages.
'use strict';

/* ==========================================================================
   1. SAMPLE DATA
   Stored in plain JS arrays so the pages work without a server (fetching a
   .json file does not work when index.html is opened straight from disk).
   NOTE: these entries are sample data for the MVP, not an official schedule.
   ========================================================================== */
const EVENTS = [
  { id: 1, title: 'Honors Convocation',      category: 'Academic',   date: '2026-11-19', location: 'Christian Center' },
  { id: 2, title: 'Fall Choir Concert',      category: 'Arts',       date: '2026-11-20', location: 'Christian Center' },
  { id: 3, title: 'Home Football Game',      category: 'Athletics',  date: '2026-11-21', location: 'Harper Davis Field' },
  { id: 4, title: 'Greek Philanthropy Night', category: 'Greek Life', date: '2026-11-22', location: 'Greek houses' },
  { id: 5, title: 'Study Break Social',      category: 'Social',     date: '2026-11-23', location: 'Millsaps-Wilson Library' },
  { id: 6, title: 'Finals Study Session',    category: 'Academic',   date: '2026-11-30', location: 'Ford Academic Complex' },
  { id: 7, title: 'Student Art Gallery Opening', category: 'Arts',   date: '2026-12-02', location: 'Christian Center' },
  { id: 8, title: 'Intramural Kickball',     category: 'Athletics',  date: '2026-12-03', location: 'Harper Davis Field' }
];

const SPOTS = [
  { id: 'millsaps-wilson-library', name: 'Millsaps-Wilson Library', category: 'Study' },
  { id: 'ford-academic-complex',   name: 'Ford Academic Complex',   category: 'Study' },
  { id: 'dining-hall',             name: 'Dining hall',             category: 'Dining' },
  { id: 'cafe',                    name: 'Cafe',                    category: 'Dining' },
  { id: 'harper-davis-field',      name: 'Harper Davis Field',      category: 'Athletics' },
  { id: 'greek-houses',            name: 'Greek houses',            category: 'Greek' }
];

// Bootstrap badge color for each spot category
const SPOT_BADGE = {
  Study: 'text-bg-primary',
  Dining: 'text-bg-success',
  Athletics: 'text-bg-warning',
  Greek: 'text-bg-info'
};

/* ==========================================================================
   2. SMALL HELPERS
   ========================================================================== */
// Build an element with optional class and text (textContent keeps data safe from HTML injection)
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

// Turn "2026-11-19" into a local Date (new Date("2026-11-19") would be read as UTC and can shift a day)
function parseLocalDate(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day);
}

// Mark one chip in a group as selected (visual class + aria-pressed for screen readers)
function setActiveChip(group, activeChip) {
  group.querySelectorAll('.chip').forEach((chip) => {
    const isActive = chip === activeChip;
    chip.classList.toggle('active', isActive);
    chip.setAttribute('aria-pressed', String(isActive));
  });
}

/* ==========================================================================
   3. THEME TOGGLE (dark / light) - runs on every page
   Bootstrap 5.3 switches colors when <html data-bs-theme="dark"> is set.
   The choice is saved in localStorage so it carries across pages.
   ========================================================================== */
function initThemeToggle() {
  const button = document.getElementById('themeToggle');
  if (!button) return;

  // localStorage can throw (private mode, blocked storage), so wrap it
  let theme = null;
  try {
    theme = localStorage.getItem('theme');
  } catch (err) {
    // ignore: fall back to the system preference below
  }
  if (!theme) {
    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(value) {
    document.documentElement.setAttribute('data-bs-theme', value);
    button.setAttribute('aria-pressed', String(value === 'dark'));
  }

  applyTheme(theme);

  button.addEventListener('click', () => {
    theme = theme === 'dark' ? 'light' : 'dark';
    applyTheme(theme);
    try {
      localStorage.setItem('theme', theme);
    } catch (err) {
      // saving is optional; the toggle still works for this page view
    }
  });
}

/* ==========================================================================
   4. HOME PAGE: today's date
   ========================================================================== */
function initTodayDate() {
  const target = document.getElementById('todayDate');
  if (!target) return;
  target.textContent = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'short', day: 'numeric'
  });
}

/* ==========================================================================
   5. EVENTS PAGE: render cards from EVENTS, then search + category filter
   ========================================================================== */
function initEvents() {
  const list = document.getElementById('eventList');
  const searchInput = document.getElementById('eventSearch');
  const chipGroup = document.getElementById('categoryChips');
  const countText = document.getElementById('eventCount');
  if (!list || !searchInput || !chipGroup || !countText) return;

  // Current filter state; both filters combine
  const state = { query: '', category: 'All' };

  // Build one event card with DOM methods
  function buildCard(event) {
    const date = parseLocalDate(event.date);

    const card = el('article', 'card event-card');
    const body = el('div', 'card-body');

    const badge = el('div', 'date-badge');
    badge.setAttribute('aria-hidden', 'true');
    badge.append(
      el('span', '', date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()),
      el('strong', '', String(date.getDate()))
    );

    const info = el('div');
    const link = el('a', '', '\u{1F4CD} ' + event.location + ' → map');
    // Link to the map page; map.html will use ?spot=... once the map is built
    link.href = 'map.html?spot=' + encodeURIComponent(event.location.toLowerCase().replace(/\s+/g, '-'));
    info.append(
      el('span', 'badge text-bg-primary', event.category),
      el('h2', 'h5 mt-1', event.title),
      link
    );

    body.append(badge, info);
    card.append(body);
    return card;
  }

  // Re-render the list from the current filter state
  function render() {
    const query = state.query.trim().toLowerCase();

    const matches = EVENTS.filter((event) => {
      const matchesCategory = state.category === 'All' || event.category === state.category;
      const matchesQuery = !query ||
        event.title.toLowerCase().includes(query) ||
        event.location.toLowerCase().includes(query);
      return matchesCategory && matchesQuery;
    });

    list.replaceChildren();
    if (matches.length === 0) {
      // Friendly empty state
      list.append(el('p', 'text-muted', 'No events match your search.'));
    } else {
      matches.forEach((event) => list.append(buildCard(event)));
    }

    // aria-live on this element makes screen readers announce the new count
    countText.textContent = `Showing ${matches.length} of ${EVENTS.length} events`;
  }

  // Filter as the user types
  searchInput.addEventListener('input', (e) => {
    state.query = e.target.value;
    render();
  });

  // One listener on the chip group handles every chip (event delegation)
  chipGroup.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    state.category = chip.dataset.category;
    setActiveChip(chipGroup, chip);
    render();
  });

  render();

  // TODO (In progress): favorites (star button + localStorage) and the
  // Nager.Date holidays list.
}

/* ==========================================================================
   6. MAP PAGE: filterable spot list (category checkboxes + name search)
   The Leaflet map itself is In progress; this list will drive its markers.
   ========================================================================== */
function initSpotList() {
  const list = document.getElementById('spotList');
  const searchInput = document.getElementById('spotSearch');
  if (!list || !searchInput) return;

  // Checkbox ids map to the category names used in SPOTS
  const checkboxes = {
    Study: document.getElementById('catStudy'),
    Dining: document.getElementById('catDining'),
    Athletics: document.getElementById('catAthletics'),
    Greek: document.getElementById('catGreek')
  };

  function render() {
    const query = searchInput.value.trim().toLowerCase();

    const matches = SPOTS.filter((spot) => {
      const categoryOn = checkboxes[spot.category] && checkboxes[spot.category].checked;
      return categoryOn && spot.name.toLowerCase().includes(query);
    });

    list.replaceChildren();
    if (matches.length === 0) {
      list.append(el('li', 'list-group-item text-muted', 'No spots match your filters.'));
      return;
    }
    matches.forEach((spot) => {
      const row = el('li', 'list-group-item');
      row.append(el('span', 'badge me-2 ' + SPOT_BADGE[spot.category], spot.category), spot.name);
      list.append(row);
    });
  }

  searchInput.addEventListener('input', render);
  Object.values(checkboxes).forEach((box) => {
    if (box) box.addEventListener('change', render);
  });

  render();
}

/* ==========================================================================
   7. DINING PAGE: meal-type filter (shows only cards serving that meal)
   Each card lists its meals in data-meals, e.g. data-meals="lunch dinner".
   ========================================================================== */
function initMealFilter() {
  const chipGroup = document.getElementById('mealChips');
  if (!chipGroup) return;
  const cards = document.querySelectorAll('.dining-card');

  chipGroup.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    const meal = chip.dataset.meal;
    setActiveChip(chipGroup, chip);

    cards.forEach((card) => {
      const meals = card.dataset.meals.split(' ');
      // The "hidden" attribute removes the card from layout and from screen readers
      card.hidden = !(meal === 'all' || meals.includes(meal));
    });
  });

  // TODO (In progress): live clock and OPEN / CLOSED status from today's hours.
}

/* ==========================================================================
   8. HOME PAGE: LIVE WEATHER (Open-Meteo API, no API key needed)
   Flow: show "Loading" -> fetch -> check response.ok -> parse JSON ->
   render. Any failure lands in the catch block, which shows a friendly
   message and a Retry button instead of a blank widget or a console crash.
   Docs: https://open-meteo.com/en/docs
   ========================================================================== */
// Jackson, MS coordinates (from the wireframe)
const JACKSON = { latitude: 32.32, longitude: -90.18 };

// Request: current conditions + daily highs/lows, in Fahrenheit, Central time.
// forecast_days=4 returns today plus the next 3 days.
const WEATHER_URL =
  'https://api.open-meteo.com/v1/forecast' +
  `?latitude=${JACKSON.latitude}&longitude=${JACKSON.longitude}` +
  '&current=temperature_2m,weather_code' +
  '&daily=weather_code,temperature_2m_max,temperature_2m_min' +
  '&temperature_unit=fahrenheit&timezone=America%2FChicago&forecast_days=4';

// Open-Meteo returns a numeric WMO weather code; translate it to text + an emoji
function describeWeather(code) {
  if (code === 0) return { text: 'Clear sky', icon: '☀️' };
  if (code === 1) return { text: 'Mostly clear', icon: '\u{1F324}️' };
  if (code === 2) return { text: 'Partly cloudy', icon: '⛅' };
  if (code === 3) return { text: 'Overcast', icon: '☁️' };
  if (code === 45 || code === 48) return { text: 'Fog', icon: '\u{1F32B}️' };
  if (code >= 51 && code <= 57) return { text: 'Drizzle', icon: '\u{1F326}️' };
  if (code >= 61 && code <= 67) return { text: 'Rain', icon: '\u{1F327}️' };
  if (code >= 71 && code <= 77) return { text: 'Snow', icon: '\u{1F328}️' };
  if (code >= 80 && code <= 82) return { text: 'Rain showers', icon: '\u{1F326}️' };
  if (code === 85 || code === 86) return { text: 'Snow showers', icon: '\u{1F328}️' };
  if (code >= 95 && code <= 99) return { text: 'Thunderstorm', icon: '⛈️' };
  return { text: 'Conditions unavailable', icon: '❓' };
}

// Fetch and validate the weather data. Throws an Error on any problem;
// the caller decides how to show it to the user.
async function fetchWeather() {
  // AbortController cancels the request if the network hangs for more than 8 seconds
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(WEATHER_URL, { signal: controller.signal });

    // fetch() only rejects on network failure; HTTP errors (404, 500...) still
    // "succeed", so response.ok must be checked by hand
    if (!response.ok) {
      throw new Error(`Weather service returned HTTP ${response.status}`);
    }

    const data = await response.json();

    // Confirm the pieces we need are really there before using them
    if (!data.current || !data.daily || !Array.isArray(data.daily.time)) {
      throw new Error('Weather data was in an unexpected format');
    }
    return data;
  } finally {
    // Always clear the timer, whether the request worked or failed
    clearTimeout(timer);
  }
}

// Turn the API response into DOM elements inside the weather widget
function renderWeather(container, data) {
  const now = describeWeather(data.current.weather_code);

  // Current conditions line, e.g. "72°F · Partly cloudy"
  const current = el('p', 'weather-current');
  const icon = el('span', 'weather-icon', now.icon);
  icon.setAttribute('aria-hidden', 'true'); // the text next to it already says the same thing
  current.append(
    icon,
    el('strong', '', `${Math.round(data.current.temperature_2m)}°F`),
    ` · ${now.text}`
  );

  // 3-day forecast: skip index 0 (today), show the next three days
  const forecast = el('ul', 'forecast-row list-unstyled mb-0');
  for (let i = 1; i <= 3 && i < data.daily.time.length; i++) {
    const day = parseLocalDate(data.daily.time[i]).toLocaleDateString('en-US', { weekday: 'short' });
    const info = describeWeather(data.daily.weather_code[i]);
    const tile = el('li', 'forecast-tile');
    const tileIcon = el('span', 'weather-icon', info.icon);
    tileIcon.setAttribute('aria-label', info.text);
    tileIcon.setAttribute('role', 'img');
    tile.append(
      el('strong', '', day),
      tileIcon,
      el('span', 'small', `${Math.round(data.daily.temperature_2m_max[i])}° / ${Math.round(data.daily.temperature_2m_min[i])}°`)
    );
    forecast.append(tile);
  }

  container.replaceChildren(current, forecast);
}

// Show the loading state, fetch, then render or show the error fallback
async function loadWeather(container) {
  container.replaceChildren(el('p', 'text-muted mb-0', 'Loading weather…'));

  try {
    const data = await fetchWeather();
    renderWeather(container, data);
  } catch (err) {
    // Log the technical detail for debugging; show the user something friendly
    console.warn('Weather request failed:', err);

    const message = el('p', 'mb-2', 'Sorry, we couldn’t load the weather right now. Please check your connection and try again.');
    const retry = el('button', 'btn btn-sm btn-outline-primary', 'Try again');
    retry.type = 'button';
    retry.addEventListener('click', () => loadWeather(container));
    container.replaceChildren(message, retry);
  }
}

function initWeather() {
  const container = document.getElementById('weather');
  if (container) loadWeather(container);
}

/* ==========================================================================
   9. SECOND API (PLACEHOLDER - In progress): Nager.Date public holidays
   Free, no API key. Will fill "Upcoming holidays / breaks" on events.html and
   the "Next holiday" card on the home page. Not called yet.
   Docs: https://date.nager.at/Api
   ========================================================================== */
const HOLIDAYS_URL = 'https://date.nager.at/api/v3/NextPublicHolidays/US';

async function fetchHolidays() {
  // TODO: const response = await fetch(HOLIDAYS_URL);
  // TODO: check response.ok and throw on failure (same pattern as fetchWeather)
  // TODO: parse the JSON array and return the next 3 items ({ date, localName })
  // TODO: render them into the events.html sidebar, with a friendly error message
  return [];
}

/* ==========================================================================
   10. START-UP: run each section once the page's HTML is ready
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initTodayDate();
  initWeather();
  initEvents();
  initSpotList();
  initMealFilter();
});
