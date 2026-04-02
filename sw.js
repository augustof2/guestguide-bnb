// NOTE: Update CACHE_VERSION manually on every deploy so users receive fresh assets.
const CACHE_VERSION = '2026-04-01-v1775086827229';
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
  './manifest.json',
  './icon.svg',
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
// Ensure CONTENT_UPDATED is broadcast at most once per SW activation to avoid
// repeated update banners when multiple JS/CSS assets are revalidated in parallel.
let _contentUpdateNotified = false;
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
  // Stale-while-revalidate for JS and CSS: serve from cache immediately,
  // then update cache in background for fresh assets on next load.
  const isJsOrCss = /\.(js|css)(\?|$)/.test(url.pathname);
  if (isJsOrCss) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        const networkFetch = fetch(e.request).then(response => {
          if (response && response.status === 200 && response.type === 'basic') {
            const c = response.clone();
            getCache().then(cache => cache.put(e.request, c)).then(() => {
              // Notify clients only once per SW activation to avoid repeated banners
              // when multiple JS/CSS assets are revalidated in parallel.
              // JS is single-threaded so the check+set is atomic within this callback,
              // but set the flag first to make the guard intent explicit.
              if (!_contentUpdateNotified) {
                _contentUpdateNotified = true;
                self.clients.matchAll().then(clients => {
                  clients.forEach(client => client.postMessage({ type: 'CONTENT_UPDATED', version: CACHE_VERSION }));
                });
              }
            });
          }
          return response;
        });
        return cached || networkFetch;
      })
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
    }).catch(() => {
      // Offline fallback: return app shell for navigation requests
      if (e.request.mode === 'navigate') return caches.match('./index.html');
      return new Response('', { status: 408, statusText: 'Offline' });
    }))
  );
});

self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
  // Reply via the dedicated MessageChannel port so the response is routed directly
  // to the caller without going through the global navigator.serviceWorker.message.
  if (e.data && e.data.type === 'GET_VERSION' && e.ports && e.ports[0]) {
    e.ports[0].postMessage({ type: 'SW_VERSION', version: CACHE_VERSION });
  }
});
