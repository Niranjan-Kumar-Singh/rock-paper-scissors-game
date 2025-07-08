const CACHE_NAME = 'rps-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/privacy.html',
  '/terms.html',
  '/images/favicon.ico',
  '/images/rock.png',
  '/images/paper.png',
  '/images/scissor.png',
  '/images/question.png',
  '/images/rockPaperScissor-192x192.png',
  '/images/rockPaperScissor-512x512.png',
  '/manifest.json',
  '/rockPaperScissor.png',
  '/sitemap-2025.xml',
  '/ads.txt'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('✅ Opened cache');
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', event => {
  // For navigation requests (like privacy.html, terms.html), fall back to cache
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request);
      }).catch(() => {
        return caches.match('/index.html'); // optional fallback
      })
    );
    return;
  }

  // For other requests (images, CSS, etc.)
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      );
    })
  );
});
