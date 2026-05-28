const CACHE_NAME = 'parents-health-os-shell-v1';

const PRECACHE_ASSETS = [
  '/',
  '/resources',
  '/resources/body-mind-os',
  '/resources/decks/body-mind-os/body-mind-os.pdf',
  '/file.svg',
  '/globe.svg',
  '/next.svg',
  '/vercel.svg',
  '/window.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching offline app shell');
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[Service Worker] Pre-caching warning (some files might be missing in dev):', err);
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

  // CRITICAL BOUNDARIES: Explicitly AVOID caching dynamic operations, API endpoints, uploaded files, or local storage.
  // Bypass cache for:
  // 1. Non-GET requests (e.g. POST requests for Gemini API analyze, Webhooks)
  // 2. API endpoints (/api/*)
  // 3. Dynamic clinical paths, query strings, or mock WhatsApp triggers
  if (
    request.method !== 'GET' ||
    url.pathname.startsWith('/api/') ||
    url.pathname.includes('whatsapp') ||
    request.url.startsWith('chrome-extension:')
  ) {
    return; // Let the browser handle standard network flow directly
  }

  // Caching Strategy:
  // - Dynamic runtime assets (static JS/CSS, images, fonts) -> Cache First
  // - HTML Document navigation requests -> Network First, falling back to cache
  
  const isStaticAsset = 
    url.pathname.endsWith('.js') || 
    url.pathname.endsWith('.css') || 
    url.pathname.endsWith('.png') || 
    url.pathname.endsWith('.svg') || 
    url.pathname.endsWith('.woff') || 
    url.pathname.endsWith('.woff2') || 
    url.pathname.endsWith('.pdf');

  if (isStaticAsset) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(request).then((networkResponse) => {
            // Only cache valid GET responses
            if (networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(() => {
            // Fallback gracefully on network failure
            return new Response('Asset not found offline', { status: 404 });
          });
        });
      })
    );
  } else {
    // Navigation / page requests: Network First, Fallback to Cache
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Return root offline shell fallback
            return caches.match('/');
          });
        })
    );
  }
});
