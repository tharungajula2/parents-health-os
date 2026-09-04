const CACHE_NAME = 'parents-health-os-static-v1';

const PRECACHE_ASSETS = [
  '/manifest.json',
  '/icon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[Service Worker] Static pre-caching warning:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Clearing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // PRIVACY BOUNDARIES:
  // 1. ALL navigation and document requests are NETWORK ONLY (never cached).
  // 2. All API endpoints (/api/*) are NETWORK ONLY.
  // 3. All Supabase calls (*.supabase.co) and Storage files (/storage/*) are NETWORK ONLY.
  // 4. All PDFs (*.pdf) and health records are NETWORK ONLY.
  // 5. Non-GET requests are NETWORK ONLY.
  if (
    request.mode === 'navigate' ||
    request.destination === 'document' ||
    request.method !== 'GET' ||
    url.pathname.startsWith('/api/') ||
    url.pathname.includes('whatsapp') ||
    url.pathname.includes('/storage/') ||
    url.pathname.endsWith('.pdf') ||
    url.hostname.includes('supabase') ||
    request.url.startsWith('chrome-extension:')
  ) {
    return; // Bypass Service Worker: browser handles request via network directly
  }

  // Only safe immutable static assets (CSS, JS, icons, webfonts) may be served from cache
  const isStaticAsset =
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'image' ||
    request.destination === 'font' ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.woff') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.json') ||
    url.pathname.endsWith('.ico');

  if (isStaticAsset) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(request)
            .then((networkResponse) => {
              if (networkResponse.status === 200 && networkResponse.type === 'basic') {
                cache.put(request, networkResponse.clone());
              }
              return networkResponse;
            })
            .catch(() => {
              return new Response('Static asset unavailable offline', { status: 404 });
            });
        });
      })
    );
  }
});
