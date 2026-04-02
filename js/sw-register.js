if ('serviceWorker' in navigator) {
  let refreshing = false;
  // Quando il nuovo SW prende il controllo, ricarica la pagina
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true;
      location.reload();
    }
  });

  // Listen for background-update notifications from stale-while-revalidate
  navigator.serviceWorker.addEventListener('message', event => {
    if (event.data && event.data.type === 'CONTENT_UPDATED') {
      // null = background update (no SW worker reference needed; reload directly)
      showUpdateBanner(null, event.data.version);
    }
  });

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').then(reg => {
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // Ask the waiting SW for its CACHE_VERSION via a dedicated MessageChannel
            // so the reply doesn't go through the global navigator.serviceWorker.message
            // handler and avoids interference with CONTENT_UPDATED messages.
            const mc = new MessageChannel();
            let timeoutId;
            mc.port1.onmessage = event => {
              if (event.data && event.data.type === 'SW_VERSION') {
                clearTimeout(timeoutId);
                mc.port1.onmessage = null;
                showUpdateBanner(newWorker, event.data.version);
              }
            };
            newWorker.postMessage({ type: 'GET_VERSION' }, [mc.port2]);
            // Fallback: show the banner without a version if no reply within 500 ms.
            timeoutId = setTimeout(() => {
              mc.port1.onmessage = null; // discard any late-arriving reply
              showUpdateBanner(newWorker, null);
            }, 500);
          }
        });
      });
    }).catch(() => {});
  });
}

// Read the "just updated" flag once at module load time (before any async messages
// arrive) so that all CONTENT_UPDATED messages fired during the post-update reload
// are suppressed as a group, not just the first one.
const _justUpdated = !!sessionStorage.getItem('sw_just_updated');
if (_justUpdated) sessionStorage.removeItem('sw_just_updated');

function _swBannerLang() {
  try {
    return (typeof currentLang !== 'undefined' && currentLang) ||
      localStorage.getItem('bnb_lang') ||
      document.documentElement.lang ||
      'it';
  } catch (_) { return 'it'; }
}

function showUpdateBanner(worker, version) {
  // Suppress all banners in the page session immediately after a user-triggered update.
  if (_justUpdated) return;
  // If the user already dismissed this exact version, don't re-show it.
  if (version && localStorage.getItem('sw_dismissed_' + version)) return;
  if (document.getElementById('sw-update-banner')) return;
  const lang = _swBannerLang();
  const isEn = lang === 'en';
  const msg    = isEn ? '🔄 New version available!'   : '🔄 Nuova versione disponibile!';
  const btnUpd = isEn ? 'Update'                       : 'Aggiorna';
  const banner = document.createElement('div');
  banner.id = 'sw-update-banner';
  banner.innerHTML = `${msg} <button class="sw-banner-btn-update" id="sw-update-btn">${btnUpd}</button><button class="sw-banner-btn-close" id="sw-close-btn">✕</button>`;
  document.body.appendChild(banner);

  document.getElementById('sw-close-btn').addEventListener('click', function() {
    banner.remove();
    // Remember that the user dismissed this version so the banner doesn't reappear
    // on subsequent page loads until a new version is deployed.
    if (version) localStorage.setItem('sw_dismissed_' + version, '1');
  });
  document.getElementById('sw-update-btn').addEventListener('click', () => {
    sessionStorage.setItem('sw_just_updated', '1');
    // Persist dismissal so the banner doesn't reappear in the next browsing session.
    if (version) localStorage.setItem('sw_dismissed_' + version, '1');
    if (worker) {
      // Dice al nuovo SW di attivarsi → trigga controllerchange → reload
      worker.postMessage({ type: 'SKIP_WAITING' });
    } else {
      // Background update — just reload to get fresh assets
      location.reload();
    }
  });
}

// Call init after all scripts are loaded.
// Use a retry loop in case deferred scripts haven't finished loading yet
// (script execution order isn't guaranteed across all browsers/configurations).
function tryInit(attempts) {
  if (typeof init === 'function') {
    init();
  } else if (attempts > 0) {
    setTimeout(() => tryInit(attempts - 1), 50);
  }
}
tryInit(10);
