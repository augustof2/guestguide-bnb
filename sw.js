const CACHE_VERSION = '2026-03-31-v1775000731404';
const CACHE_NAME = 'bnb-guide-' + CACHE_VERSION;
const STATIC_ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/crypto.js',
  './js/i18n.js',
  './js/utils.js',
  './js/analytics.js',
  './js/app.js',
  './js/data.js',
  './js/settings-apartments.js',
  './js/settings-ui.js',
  './js/settings-publish.js',
  './js/weather.js',
  './js/sw-register.js',
  './js/qr-lib.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Jost:wght@300;400;500;600&display=swap'
];

// Perf: cache the Cache API reference to avoid repeated caches.open() calls
let _cachePromise = null;
function getCache() {
  if (!_cachePromise) _cachePromise = caches.open(CACHE_NAME);
  return _cachePromise;
}

self.addEventListener('install', e => {
  e.waitUntil(
    getCache()
      .then(c => c.addAll(STATIC_ASSETS.map(u => new Request(u, {cache: 'reload'}))))
      .catch(() => getCache().then(c => c.add('./')))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.hostname.includes('open-meteo.com')) {
    e.respondWith(
      fetch(e.request).then(r => {
        const c = r.clone();
        getCache().then(cache => cache.put(e.request, c));
        return r;
      }).catch(() => caches.match(e.request))
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).then(response => {
      if (response && response.status === 200 && response.type === 'basic') {
        const c = response.clone();
        getCache().then(cache => cache.put(e.request, c));
      }
      return response;
    }))
  );
});

self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});
