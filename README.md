# Campus Life Super App

A one-stop website for Millsaps College students (Jackson, MS): check the weather, find campus events, see dining options, and explore campus spots. Built as the final project for my Web Development course.

**Status:** MVP (Part 2). Features marked *In progress* are planned for the final project.

- Live site: `https://dannyjcl.github.io/campus-life-super-app/` (after GitHub Pages is enabled)
- Design: wireframes are in [`docs/Campus_Life_Super_App_Wireframe.pdf`](docs/Campus_Life_Super_App_Wireframe.pdf)

## Technologies

- HTML5 (semantic: `header`, `nav`, `main`, `section`, `footer`)
- CSS3: Flexbox, custom properties (dark/light theme), media queries for tablet and mobile
- [Bootstrap 5.3](https://getbootstrap.com/) via CDN
- JavaScript (ES6+): `addEventListener`, DOM manipulation, `async`/`await` with `fetch`
- [Open-Meteo](https://open-meteo.com/) weather API (no API key)

## Pages

| Page | File | What it does |
| --- | --- | --- |
| Home | `index.html` | Live Jackson, MS weather, next-meal card, highlights, quick links |
| Events | `events.html` | Search and category filter over a list of campus events |
| Dining | `dining.html` | Dining locations with a meal-type filter and weekly hours table |
| Map | `map.html` | Campus spot list with category and search filters |

## Features

Working now:

- Same responsive navigation bar on every page, with the current page highlighted and a hamburger menu on phones
- Live weather for Jackson, MS (Open-Meteo) with a loading state and a friendly error message with a retry button
- Events: live search box and category chips, rendered from a JavaScript array, with a result count
- Dining: meal-type filter chips
- Map page: spot list filtered by category checkboxes and name search
- Dark/light theme toggle, saved in the browser
- Accessibility basics: alt text, labeled inputs, visible focus outlines, skip link, `aria-live` regions

In progress (final project):

- Interactive Leaflet / OpenStreetMap campus map with markers *(In progress)*
- Nager.Date holidays API on Events and Home *(In progress; setup code and TODOs are in `js/script.js`)*
- Favorite events saved with `localStorage` *(In progress)*
- Live dining open/closed status and countdown from real hours *(In progress)*
- Real event, dining and location data *(In progress; current entries are sample data)*

## How to run

No build step or install is needed.

1. Clone the repo: `git clone https://github.com/Dannyjcl/campus-life-super-app.git`
2. Open `index.html` in a browser (double-click it), or serve the folder locally, e.g. `python -m http.server` and visit `http://localhost:8000`.
3. An internet connection is required for Bootstrap (CDN) and the weather API.

## Project structure

```
index.html  events.html  dining.html  map.html
css/style.css      custom styles (loaded after Bootstrap)
js/script.js       all interactivity and API code
images/            placeholder images
docs/              wireframe PDF
```

## Credits

Weather data by [Open-Meteo](https://open-meteo.com/). Student project, not an official Millsaps College site.
