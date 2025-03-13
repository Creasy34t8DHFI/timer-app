// public/service-worker.js
const CACHE_NAME = 'timer-app-v1';

// Zasoby do zapisania w pamięci podręcznej
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/timer.worker.js',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/_next/static/chunks/main.js',
  '/_next/static/chunks/webpack.js',
  '/_next/static/chunks/pages/_app.js',
  '/_next/static/chunks/pages/index.js',
];

// Instalacja service workera i zapisanie zasobów w pamięci podręcznej
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Obsługa żądań
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Zwróć zasób z pamięci podręcznej, jeśli jest dostępny
        if (response) {
          return response;
        }
        
        // Spróbuj pobrać zasób z sieci
        return fetch(event.request)
          .then(response => {
            // Jeśli nie ma odpowiedzi lub status nie jest ok, zwróć błąd
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Sklonuj odpowiedź, ponieważ jest to strumień,
            // który może być używany tylko raz
            const responseToCache = response.clone();
            
            // Otwórz pamięć podręczną i zapisz odpowiedź
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch(() => {
            // Jeśli nie udało się pobrać zasobu i jest to dokument HTML,
            // zwróć stronę offline
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('/');
            }
          });
      })
  );
});

// Czyszczenie starych pamięci podręcznych
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});