// ════════════════════════════════════════════
//  MULTI-TENANT SETTINGS UI
// ════════════════════════════════════════════

function renderMtPropertiesList() {
  const container = document.getElementById('mt-properties-list');
  if (!container) return;
  const props = (typeof listProperties === 'function') ? listProperties() : [];
  const currentId = (typeof getPropertyId === 'function') ? getPropertyId() : 'default';
  if (props.length === 0) {
    container.innerHTML = '<p style="font-size:12px;color:var(--text2)">Nessuna struttura configurata.</p>';
    return;
  }
  container.innerHTML = props.map(function(p) {
    const isCurrent = p.id === currentId;
    return '<div class="mt-prop-row" style="display:flex;align-items:center;gap:8px;padding:8px;border:1px solid var(--border);border-radius:8px;margin-bottom:8px;'+(isCurrent ? 'border-color:var(--teal);background:color-mix(in srgb, var(--teal) 8%, var(--card))' : '')+'">' +
      '<div style="flex:1">' +
        '<div style="font-weight:600;font-size:13px;color:var(--text1)">' + escHtml(p.name) + '</div>' +
        '<div style="font-size:11px;color:var(--text2)">ID: ' + escHtml(p.id) + (isCurrent ? ' <span style="color:var(--teal);font-weight:700">✓ Attiva</span>' : '') + '</div>' +
      '</div>' +
      (!isCurrent ? '<button class="s-btn" style="padding:4px 10px;font-size:12px" data-action="mtSwitch" data-id="'+escHtml(p.id)+'">Apri</button>' : '') +
      '<button class="s-btn" style="padding:4px 10px;font-size:12px" data-action="mtDuplicate" data-id="'+escHtml(p.id)+'">Duplica</button>' +
      (p.id !== 'default' ? '<button class="s-btn danger" style="padding:4px 10px;font-size:12px" data-action="mtDelete" data-id="'+escHtml(p.id)+'">🗑️</button>' : '') +
    '</div>';
  }).join('');
}

let _mtSettingsInited = false;

function initMtSettings() {
  if (_mtSettingsInited) return;
  _mtSettingsInited = true;

  const createBtn = document.getElementById('mt-create-btn');
  if (createBtn) {
    createBtn.addEventListener('click', function() {
      const idEl = document.getElementById('mt-new-id');
      const nameEl = document.getElementById('mt-new-name');
      const msgEl = document.getElementById('mt-msg');
      if (!idEl || !nameEl) return;
      const newId = idEl.value.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
      const newName = nameEl.value.trim();
      if (!newId) { if (msgEl) showMsg(msgEl, 'ID non valido', 'error'); return; }
      const created = (typeof createProperty === 'function') ? createProperty(newId, newName || newId) : false;
      if (created) {
        if (msgEl) showMsg(msgEl, 'Struttura creata: ' + newId, 'ok');
        idEl.value = ''; nameEl.value = '';
        renderMtPropertiesList();
      } else {
        if (msgEl) showMsg(msgEl, 'ID già esistente o non valido', 'error');
      }
    });
  }

  document.addEventListener('click', function(e) {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    const action = el.dataset.action;
    const id = el.dataset.id;
    if (action === 'mtSwitch' && id) {
      if (typeof switchProperty === 'function') switchProperty(id);
    } else if (action === 'mtDuplicate' && id) {
      const newIdRaw = prompt('ID per la copia (solo lettere minuscole, trattini):', id + '-copia');
      if (!newIdRaw) return;
      const newId2 = newIdRaw.toLowerCase().replace(/[^a-z0-9_-]/g, '');
      const newName2 = prompt('Nome della copia:', newIdRaw);
      if (!newId2) return;
      const ok = (typeof duplicateProperty === 'function') ? duplicateProperty(id, newId2, newName2 || newId2) : false;
      if (ok) { showToast('Struttura duplicata: ' + newId2, 'success'); renderMtPropertiesList(); }
      else showToast('ID già esistente o non valido', 'error');
    } else if (action === 'mtDelete' && id) {
      if (!confirm('Eliminare la struttura "' + id + '"? I dati verranno persi permanentemente.')) return;
      const ok = (typeof deleteProperty === 'function') ? deleteProperty(id) : false;
      if (ok) { showToast('Struttura eliminata', 'success'); renderMtPropertiesList(); }
      else showToast('Impossibile eliminare la struttura default', 'error');
    }
  });
}
