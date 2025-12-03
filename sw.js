const CACHE_NAME = 'zdevstack-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/pages/allproject.html',
  '/css/style.css',
  '/css/global.css',
  '/css/fonts.css',
  '/css/resopnsive.css',
  '/js/app.js',
  '/js/gsap.min.js',
  '/js/scrolltrigger.min.js',
  '/js/lenis.js',
  '/js/partical.js',
  '/assets/images/logo-gradient.svg',
  '/assets/images/fav-icon.png'
];

// Install event: Cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activate event: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Fetch event: Serve from cache, fall back to network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests (like Google Fonts or CDNs)
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached response if found
      if (response) {
        return response;
      }

      // Otherwise fetch from network
      return fetch(event.request).then((networkResponse) => {
        // Don't cache if response is not valid
        if (
          !networkResponse ||
          networkResponse.status !== 200 ||
          networkResponse.type !== 'basic'
        ) {
          return networkResponse;
        }

        // Clone response to store in cache
        const responseToCache = networkResponse.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      });
    })
  );
});
