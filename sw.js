// Sonematic service worker: caches the app so it runs offline.
// Bump CACHE whenever any file below changes, so installed copies update.
const CACHE = 'sonematic-v4';
const FILES = [
  './',
  'index.html',
  'manifest.webmanifest',
  'icons/icon.svg',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable-512.png',
  'icons/apple-touch-icon.png',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Serve from the cache straight away, and refresh the cached copy in the
// background, so the app starts instantly offline and picks up updates online.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then(async cache => {
    const cached = await cache.match(e.request, { ignoreSearch: true });
    const fresh = fetch(e.request)
      .then(r => { if (r.ok) cache.put(e.request, r.clone()); return r; })
      .catch(() => cached);
    if (cached) { e.waitUntil(fresh); return cached; }
    return fresh;
  }));
});
