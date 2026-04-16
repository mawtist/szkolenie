const CACHE_NAME = 'shoutbox-cache-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './manifest.json'
];

// 1. INSTALACJA: Zapisujemy pliki do pamięci telefonu
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Zapisywanie plików w pamięci podręcznej...');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// 2. ODCZYT: Jeśli plik jest w pamięci, ładujemy go z dysku zamiast z neta
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});