// ════════════════════════════════════════════
//  VERSIONING / ROLLBACK SETTINGS UI
// ════════════════════════════════════════════

let _previewSnapshotData = null;

function renderVersioningList() {
  const container = document.getElementById('versioning-list');
  const storageInfo = document.getElementById('snap-storage-info');
  if (storageInfo && typeof localStorageUsage === 'function') {
    storageInfo.textContent = 'Storage usato: ' + localStorageUsage();
  }
  if (!container) return;
  const snaps = (typeof getSnapshots === 'function') ? getSnapshots() : [];
  if (snaps.length === 0) {
    container.innerHTML = '<p style="font-size:12px;color:var(--text2);text-align:center;padding:12px">Nessuno snapshot disponibile. Salva le impostazioni per creare il primo snapshot.</p>';
    return;
  }
  container.innerHTML = snaps.map(function(snap, i) {
    const d = new Date(snap.ts);
    const dateStr = d.toLocaleDateString('it-IT') + ' ' + d.toLocaleTimeString('it-IT', {hour:'2-digit',minute:'2-digit'});
    const who = snap.who || 'admin';
    return '<div class="versioning-entry" style="border:1px solid var(--border);border-radius:8px;padding:10px;margin-bottom:8px">' +
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px">' +
        '<div>' +
          '<div style="font-size:13px;font-weight:600;color:var(--text1)">'+escHtml(snap.desc||'Snapshot')+'</div>' +
          '<div style="font-size:11px;color:var(--text2)">'+dateStr+' · '+(who==='admin'?'🛡️ Admin':'👤 Host')+'</div>' +
        '</div>' +
        '<span style="font-size:10px;color:var(--text2);font-family:monospace">'+escHtml(snap.hash||'')+'</span>' +
      '</div>' +
      '<div style="display:flex;gap:6px;flex-wrap:wrap">' +
        '<button class="s-btn" style="padding:4px 10px;font-size:12px" data-action="snapPreview" data-idx="'+i+'">👁️ Anteprima</button>' +
        '<button class="s-btn" style="padding:4px 10px;font-size:12px;background:var(--teal);border-color:var(--teal);color:#fff" data-action="snapRestore" data-idx="'+i+'">↩️ Ripristina</button>' +
        '<button class="s-btn" style="padding:4px 10px;font-size:12px" data-action="snapDownload" data-idx="'+i+'">📥 Scarica JSON</button>' +
      '</div>' +
    '</div>';
  }).join('');
}

let _versioningSettingsInited = false;

function initVersioningSettings() {
  if (_versioningSettingsInited) return;
  _versioningSettingsInited = true;

  const importBtn = document.getElementById('snap-import-btn');
  const importInput = document.getElementById('snap-import-input');
  if (importBtn && importInput) {
    importBtn.addEventListener('click', function() { importInput.click(); });
    importInput.addEventListener('change', function() {
      const file = importInput.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(ev) {
        try {
          const snap = JSON.parse(ev.target.result);
          if (!snap.data || !snap.ts) throw new Error('Invalid snapshot');
          const snaps = (typeof getSnapshots === 'function') ? getSnapshots() : [];
          snap.desc = snap.desc && snap.desc.includes('importato') ? snap.desc : (snap.desc || 'Importato') + ' (importato)';
          snap.ts = snap.ts || Date.now();
          snaps.unshift(snap);
          if (snaps.length > 20) snaps.splice(20);
          if (typeof saveSnapshots === 'function') saveSnapshots(snaps);
          renderVersioningList();
          showToast('Snapshot importato con successo', 'success');
        } catch(e) {
          showToast('File non valido: ' + e.message, 'error');
        }
        importInput.value = '';
      };
      reader.readAsText(file);
    });
  }

  const resetBtn = document.getElementById('snap-reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', function() {
      if (!confirm('Eliminare tutti gli snapshot? Questa azione è irreversibile.')) return;
      if (typeof saveSnapshots === 'function') saveSnapshots([]);
      renderVersioningList();
      showToast('Tutti gli snapshot eliminati', 'success');
    });
  }

  document.addEventListener('click', function(e) {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    const action = el.dataset.action;
    const idx = parseInt(el.dataset.idx, 10);
    if (isNaN(idx)) return;

    if (action === 'snapPreview') {
      const snaps = (typeof getSnapshots === 'function') ? getSnapshots() : [];
      if (!snaps[idx]) return;
      _previewSnapshotData = deepClone(snaps[idx].data);
      if (typeof currentData !== 'undefined' && typeof renderApp === 'function') {
        currentData = _previewSnapshotData;
        renderApp(typeof currentAptIndex !== 'undefined' ? currentAptIndex : 0);
        showToast('Anteprima snapshot attiva. Salva per applicare oppure annulla.', 'info');
      }
    } else if (action === 'snapRestore') {
      if (!confirm('Ripristinare questo snapshot? I dati attuali verranno sovrascritti.')) return;
      if (typeof restoreSnapshot === 'function' && restoreSnapshot(idx)) {
        if (typeof renderApp === 'function') renderApp(typeof currentAptIndex !== 'undefined' ? currentAptIndex : 0);
        if (typeof renderChangelogSection === 'function') renderChangelogSection();
        renderVersioningList();
        showToast('Snapshot ripristinato con successo', 'success');
      }
    } else if (action === 'snapDownload') {
      const snaps = (typeof getSnapshots === 'function') ? getSnapshots() : [];
      if (!snaps[idx]) return;
      const snap = snaps[idx];
      const json = JSON.stringify(snap, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const dateStr = new Date(snap.ts).toISOString().slice(0,19).replace(/[:]/g,'-').replace('T','_');
      a.download = 'snapshot_' + dateStr + '.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  });
}
