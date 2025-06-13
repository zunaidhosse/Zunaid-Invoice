const CACHE_NAME = 'zunaid-invoice-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/delete-icon.png',
  '/pin-icon.png',
  '/advance-icon.png',
  '/icon-192.png',
  '/icon-512.png',
  'https://fonts.googleapis.com/css2?family=Roboto+Mono&display=swap',
  'https://html2canvas.hertzen.com/dist/html2canvas.min.js',
  'https://cdn-icons-png.flaticon.com/512/1828/1828911.png',
  'https://cdn-icons-png.flaticon.com/512/1170/1170627.png',
  'https://cdn-icons-png.flaticon.com/512/6488/6488677.png',
  'https://cdn-icons-png.flaticon.com/512/9377/9377574.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('pwa-cache').then((cache) => {
      return cache.addAll([
        './',
        './index.html',
        './style.css',
        './app.js',
        './manifest.json',
        './icons/icon-192.png',
        './icons/icon-512.png'
      ]);
    })
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});
