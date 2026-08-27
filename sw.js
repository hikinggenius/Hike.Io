const SHELL_CACHE = 'hikeio-shell-v3';
const RUNTIME_CACHE = 'hikeio-runtime-v3';

const SHELL_FILES = [
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
];

// Install: pre-cache the app shell so the page itself opens with no signal.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_FILES)).then(() => self.skipWaiting())
  );
});

// Activate: clear out old cache versions.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== SHELL_CACHE && k !== RUNTIME_CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

function isLiveDataRequest(url) {
  return url.includes('api.open-meteo.com') || url.includes('geocoding-api.open-meteo.com');
}

function isCacheableAsset(url) {
  return (
    url.includes('tile.openstreetmap.org') ||       // map tiles
    url.includes('upload.wikimedia.org') ||          // trail/gear/camp photos
    url.includes('commons.wikimedia.org') ||         // image lookup API responses
    url.includes('fonts.googleapis.com') ||
    url.includes('fonts.gstatic.com') ||
    url.includes('cdnjs.cloudflare.com')             // leaflet js/css
  );
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = request.url;

  // Live weather/geocoding: try the network first (data must be fresh),
  // but fall back to the last successful response if offline.
  if (isLiveDataRequest(url)) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const clone = res.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone));
          return res;
        })
        .catch(() => caches.match(request).then((cached) => cached || Response.error()))
    );
    return;
  }

  // Map tiles, photos, fonts, Leaflet library: cache-first, since these rarely change
  // and this is what makes previously-viewed trails/maps work offline.
  if (isCacheableAsset(url)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((res) => {
          const clone = res.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone));
          return res;
        }).catch(() => cached);
      })
    );
    return;
  }

  // App shell files: cache-first so the app itself always opens offline.
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request))
  );
});
