const CACHE = 'mondo-admin-v1';

const PRECACHE = [
  '/admin',
  '/admin/orders',
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE).catch(() => {}))
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  // Only handle same-origin requests
  if (!e.request.url.startsWith(self.location.origin)) return;

  // For navigation requests (HTML pages) — network first, fall back to cache
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request).then((r) => r || caches.match('/admin')))
    );
    return;
  }

  // For everything else — network only (admin needs live data)
  e.respondWith(fetch(e.request));
});
