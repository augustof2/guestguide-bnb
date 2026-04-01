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

// Perf: cache the Cache API reference to avoid repeated caches.open() calls.
// The promise is reset on rejection so the next call retries the open.
// We capture the promise reference before attaching the catch handler so that
// concurrent callers who already hold the same promise don't accidentally
// reset a successfully-opened cache created by a later call.
let _cachePromise = null;
function getCache() {
  if (!_cachePromise) {
    const p = caches.open(CACHE_NAME);
    _cachePromise = p;
    p.catch(err => {
      // Only reset if our promise is still the active one (guard against races)
      if (_cachePromise === p) _cachePromise = null;
      throw err;
    });
  }
  return _cachePromise;
}

self.addEventListener('install', e => {
  e.waitUntil(
    getCache()
      .then(c => c.addAll(STATIC_ASSETS.map(u => new Request(u, {cache: 'reload'}))))
      // Primary precache failed — fall back to caching only the root so the
      // app shell is available offline even if assets are missing.
      .catch(err => {
        console.warn('[SW] Full precache failed, falling back to root only:', err);
        return getCache().then(c => c.add('./')).catch(fallbackErr => {
          console.error('[SW] Fallback cache also failed:', fallbackErr);
        });
      })
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
