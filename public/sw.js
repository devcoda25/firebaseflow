/* Minimal, build-tool-agnostic service worker */
const CACHE = 'flowbuilder-shell-v1';
const ASSETS = [
  '/', '/index.html',
  // add your built bundles if you know their names, or rely on runtime caching
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k === CACHE ? null : caches.delete(k))))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // SPA: serve shell for navigations
  if (request.mode === 'navigate' && url.origin === location.origin) {
    event.respondWith(
      fetch(request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // static assets → cache-first
  if (/\.(?:png|jpg|jpeg|svg|gif|webp|ico|woff2|woff|ttf)$/.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then((hit) => hit || fetch(request).then((res) => {
        const copy = res.clone();
        caches.open('static-assets').then((c) => c.put(request, copy));
        return res;
      }))
    );
    return;
  }

  // API → network-first
  if (/\/api\/.*$/i.test(url.pathname)) {
    event.respondWith(
      fetch(request).then((res) => {
        const copy = res.clone();
        caches.open('api-cache').then((c) => c.put(request, copy));
        return res;
      }).catch(() => caches.match(request))
    );
    return;
  }
});

// Allow app to trigger activation immediately
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});
