# Hike.io — Trail Planner

**For hikers, by hikers — completely free.**

A single-page web app (installable as a home-screen PWA) that finds hiking
trails near any U.S. location, tells you what to pack based on the day's
real weather, and points you toward nearby camping. No backend, no
database, no API keys — everything runs client-side in the browser.

## What it does

1. You enter a city/zip (or tap 📍 to use your current location).
2. The app geocodes that into coordinates, pulls today's live weather, and
   queries OpenStreetMap for named hiking trails and campsites within your
   chosen radius (2–60 miles).
3. Clicking a trail opens a trip-planner popup: a map with the trail's real
   path drawn in red, an elevation profile chart, a weather-driven gear
   list with real brand suggestions, and the nearest campsite.

## Why no backend?

Every API used here is free and requires no signup or key, so the whole
thing can run as static files (this is what makes it deployable on GitHub
Pages / Netlify with zero server cost):

| Data | Source | Notes |
|---|---|---|
| Weather + forecast | [Open-Meteo](https://open-meteo.com) | Free, keyless, current + 3-day forecast |
| Geocoding (place name → coords) | Open-Meteo Geocoding API | Free, keyless |
| Reverse geocoding (coords → city name) | BigDataCloud client API | Free, keyless, used for the "use my location" button |
| Trails + campsites | [OpenStreetMap](https://www.openstreetmap.org) via the [Overpass API](https://overpass-api.de) | Live query scoped to the search radius — nothing is pre-downloaded or hardcoded |
| Elevation | Open-Meteo Elevation API | Samples up to 30 points along each trail's real geometry |
| Precipitation radar | [RainViewer](https://www.rainviewer.com) | Free public tile API, animated over a Leaflet map |
| Photos | [Wikimedia Commons](https://commons.wikimedia.org) | CC-licensed, queried live by trail/park/gear name |
| Maps | [Leaflet.js](https://leafletjs.com) + OpenStreetMap tiles | |

## Known limitations (and why)

- **Elevation gain isn't available for every trail.** It depends on how
  well that trail is mapped in OpenStreetMap — well-documented trails get
  a real gain number and elevation chart; sparsely-mapped ones show "Not
  available" rather than a guess.
- **Trail/campsite coverage varies by region**, since it reflects
  volunteer-contributed OpenStreetMap data, not a curated database.
  Popular parks tend to be well-mapped; rural areas less so.
- **Gear prices are illustrative**, not live retail prices — they're
  real products from real brands, but check the linked retailer site for
  current pricing.
- **Temperature is Fahrenheit-only.** Distance and elevation have a
  mi/km ↔ ft/m toggle, but adding a full metric temperature conversion
  was out of scope for this pass.
- **The Overpass API (OpenStreetMap's free query service) can be slow or
  rate-limited** under heavy public use. Results are cached per-session
  (`sessionStorage`) so repeat searches for the same area don't re-hit
  it, and failed searches show a "Try again" button rather than a dead
  end.

## Notable implementation details

- **PWA**: a service worker (`sw.js`) caches the app shell, map tiles,
  and photos so previously-viewed trails and maps work offline. A banner
  appears when the connection drops.
- **Shareable links**: opening a trail updates the URL
  (`?loc=lat,lon&label=...&trail=id`) via the History API, so copying
  the address bar link reproduces that exact search + open trail for
  someone else.
- **Accessibility**: keyboard navigation on trail cards, focus is moved
  to the popup on open and restored on close, ARIA roles/labels on
  interactive controls, `prefers-reduced-motion` support throughout.
- **Dark mode** and **unit toggle** (mi/ft ↔ km/m) are both persisted in
  `localStorage`.

## Possible future improvements

- A real elevation-profile-based difficulty score instead of the current
  length-based heuristic.
- Deduplicating trail segments that OpenStreetMap splits across many
  disconnected ways.
- A metric temperature option.
- User accounts so favorites sync across devices instead of living in
  one browser's `localStorage`.
