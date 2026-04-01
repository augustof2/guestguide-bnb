if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').then(reg => {
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            showUpdateBanner();
          }
        });
      });
    }).catch(() => {});
  });
}

function showUpdateBanner() {
  if (document.getElementById('sw-update-banner')) return;
  const banner = document.createElement('div');
  banner.id = 'sw-update-banner';
  banner.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:var(--teal);color:#fff;padding:12px 20px;border-radius:12px;z-index:9999;display:flex;gap:12px;align-items:center;box-shadow:0 4px 20px rgba(0,0,0,.4);font-family:Jost,sans-serif;';
  banner.innerHTML = '🔄 Nuova versione disponibile! <button onclick="location.reload()" style="background:#fff;color:var(--teal);border:none;padding:6px 14px;border-radius:8px;cursor:pointer;font-weight:600;">Aggiorna</button><button onclick="this.parentElement.remove()" style="background:none;border:none;color:#fff;cursor:pointer;font-size:18px;">✕</button>';
  document.body.appendChild(banner);
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
