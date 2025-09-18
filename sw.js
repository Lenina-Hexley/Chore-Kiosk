const CACHE_NAME = 'cosmos-chore-v1';

const ASSETS = [
  './',
  './index.html',             // update if your file has a different name
  './manifest.webmanifest',
  './sw.js',
  './icons/180.png',
  './icons/192.png',
  './icons/512.png',
  './icons/maskable-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const wantsHTML = req.headers.get('accept')?.includes('text/html');

  event.respondWith(
    (wantsHTML
      ? fetch(req).then(r => {
          const c = r.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, c));
          return r;
        }).catch(() => caches.match(req).then(m => m || caches.match('./')))
      : caches.match(req).then(m => m || fetch(req).then(r => {
          const c = r.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, c));
          return r;
        }))
    )
  );
});
