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
   8. START-UP: run each section once the page's HTML is ready
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initTodayDate();
  initEvents();
  initSpotList();
  initMealFilter();
});
