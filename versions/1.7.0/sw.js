/* sw.js - Service worker for offline PWA support */

const CACHE_NAME = 'mental-maths-v1.7.0';

const ASSETS = [
    './',
    './index.html',
    './style.css',
    './css/charts.css',
    './css/dashboard.css',
    './css/intervention.css',
    './css/features.css',
    './js/config.js',
    './js/storage.js',
    './js/generators.js',
    './js/times-tables.js',
    './js/visuals.js',
    './js/versions.js',
    './js/charts.js',
    './js/settings.js',
    './js/spaced-repetition.js',
    './js/encouragement.js',
    './js/export-utils.js',
    './js/goals.js',
    './js/daily-challenge.js',
    './js/intervention.js',
    './js/teacher-dashboard.js',
    './js/stats-dashboard.js',
    './js/engine.js',
    './js/app-core.js',
    './js/app-quiz.js',
    './js/app-screens.js',
    './manifest.json',
    './icons/icon-192.svg',
    './icons/icon-512.svg',
];

// Install: cache all assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS))
            .then(() => self.skipWaiting())
    );
});

// Activate: clean old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
            )
        ).then(() => self.clients.claim())
    );
});

// Fetch: cache-first strategy
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(cached => {
                if (cached) return cached;
                return fetch(event.request).then(response => {
                    // Only cache same-origin GET requests
                    if (event.request.method === 'GET' && response.status === 200) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                    }
                    return response;
                });
            })
            .catch(() => {
                // Offline fallback for HTML pages
                if (event.request.headers.get('accept')?.includes('text/html')) {
                    return caches.match('./index.html');
                }
            })
    );
});
