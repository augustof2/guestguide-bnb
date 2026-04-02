if ('serviceWorker' in navigator) {
  let waitingSW = null;

  function showUpdateBanner() {
    const banner = document.getElementById('update-banner');
    if (banner) banner.classList.remove('d-none');
  }

  // Wire up the "Aggiorna ora" button — safe to run immediately since this
  // script is loaded with defer (DOM is fully parsed at this point).
  const updateBtn = document.getElementById('update-banner-btn');
  if (updateBtn) {
    updateBtn.addEventListener('click', () => {
      if (waitingSW) {
        waitingSW.postMessage({ type: 'SKIP_WAITING' });
      } else {
        location.reload();
      }
    });
  }

  // When the new SW takes control, reload the page to get fresh assets
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    location.reload();
  });

  // Listen for background-update notifications from stale-while-revalidate
  navigator.serviceWorker.addEventListener('message', event => {
    if (event.data && event.data.type === 'CONTENT_UPDATED') {
      showUpdateBanner();
    }
  });

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').then(reg => {
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // Store reference to waiting SW and show the update banner
            waitingSW = newWorker;
            showUpdateBanner();
          }
        });
      });
    }).catch(() => {});
  });
}

// Call init after all deferred scripts have been parsed.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    if (typeof init === 'function') init();
  });
} else {
  if (typeof init === 'function') init();
}
