// Service Worker for gaiadress
const CACHE_NAME = 'gaiadress-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/images/product/product-01.jpeg',
  '/images/product/product-02.jpeg',
  '/images/product/product-03.jpeg',
  '/images/product/product-04.jpeg',
  '/images/product/product-05.jpeg',
  '/images/product/product-06.jpeg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});
