// ════════════════════════════════════════════
//  SETTINGS: UI PANEL
// ════════════════════════════════════════════

// ════════════════════════════════════════════
//  SETTINGS: APT CHECKOUT STEPS (dynamic, per-apt)
// ════════════════════════════════════════════
function renderAptCheckoutSteps(aptIndex, steps) {
  const container = document.getElementById(`s-a${aptIndex}-checkoutSteps`);
  if (!container) return;
  container.dataset.count = steps.length;
  let html = '';
  steps.forEach((step, j) => {
    html += `
      <div class="s-sub-title s-sub-title-row" style="margin-top:12px">
        <span>Passo ${j + 1}</span>
        <button class="s-remove-btn" onclick="removeAptCheckoutStep(${aptIndex}, ${j})">🗑️ Rimuovi</button>
      </div>
      <div class="s-field"><label>Titolo 🇮🇹</label><input type="text" id="s-a${aptIndex}-cs${j}-titleIt" value="${escHtml(step.titleIt || '')}" onblur="autoTranslateField('s-a${aptIndex}-cs${j}-titleIt','s-a${aptIndex}-cs${j}-titleEn')"></div>
      <div class="s-field"><label>Titolo 🇬🇧</label><input type="text" id="s-a${aptIndex}-cs${j}-titleEn" value="${escHtml(step.titleEn || '')}"></div>
      <div class="s-field"><label>Descrizione 🇮🇹</label><textarea id="s-a${aptIndex}-cs${j}-descIt" onblur="autoTranslateField('s-a${aptIndex}-cs${j}-descIt','s-a${aptIndex}-cs${j}-descEn')">${escHtml(step.descIt || '')}</textarea></div>
      <div class="s-field"><label>Descrizione 🇬🇧</label><textarea id="s-a${aptIndex}-cs${j}-descEn">${escHtml(step.descEn || '')}</textarea></div>`;
  });
  container.innerHTML = html;
}

function collectAptCheckoutSteps(aptIndex) {
  const container = document.getElementById(`s-a${aptIndex}-checkoutSteps`);
  if (!container) return [];
  const count = parseInt(container.dataset.count || '0');
  const steps = [];
  for (let j = 0; j < count; j++) {
    const step = {};
    ['titleIt', 'titleEn', 'descIt', 'descEn'].forEach(k => {
      const el = document.getElementById(`s-a${aptIndex}-cs${j}-${k}`);
      if (el) step[k] = el.value;
    });
    steps.push(step);
  }
  return steps;
}

function addAptCheckoutStep(aptIndex) {
  const current = collectAptCheckoutSteps(aptIndex);
  current.push({ titleIt: '', descIt: '' });
  renderAptCheckoutSteps(aptIndex, current);
}

function removeAptCheckoutStep(aptIndex, stepIdx) {
  if (!confirm(`Rimuovere il passo ${stepIdx + 1}?`)) return;
  const current = collectAptCheckoutSteps(aptIndex);
  current.splice(stepIdx, 1);
  renderAptCheckoutSteps(aptIndex, current);
}

// ════════════════════════════════════════════
//  SETTINGS: CHECK-IN STEPS
// ════════════════════════════════════════════
function renderSettingsCheckinSteps(steps) {
  const container = document.getElementById('s-checkin-container');
  if (!container) return;
  container.dataset.count = steps.length;
  let html = '';
  steps.forEach((step, j) => {
    html += `
      <div class="s-sub-title s-sub-title-row" style="margin-top:12px">
        <span>Step ${j + 1}</span>
        <button class="s-remove-btn" onclick="removeSettingsCheckinStep(${j})">🗑️ Rimuovi</button>
      </div>
      <div class="s-field"><label>Emoji</label><input type="text" id="s-ci${j}-icon" value="${escHtml(step.icon || '')}" style="max-width:80px"></div>
      <div class="s-field"><label>Titolo 🇮🇹</label><input type="text" id="s-ci${j}-titleIt" value="${escHtml(step.titleIt || '')}" onblur="autoTranslateField('s-ci${j}-titleIt','s-ci${j}-titleEn')"></div>
      <div class="s-field"><label>Titolo 🇬🇧</label><input type="text" id="s-ci${j}-titleEn" value="${escHtml(step.titleEn || '')}"></div>
      <div class="s-field"><label>Descrizione 🇮🇹</label><textarea id="s-ci${j}-descIt" onblur="autoTranslateField('s-ci${j}-descIt','s-ci${j}-descEn')">${escHtml(step.descIt || '')}</textarea></div>
      <div class="s-field"><label>Descrizione 🇬🇧</label><textarea id="s-ci${j}-descEn">${escHtml(step.descEn || '')}</textarea></div>`;
  });
  container.innerHTML = html;
}

function collectSettingsCheckinSteps() {
  const container = document.getElementById('s-checkin-container');
  if (!container) return [];
  const count = parseInt(container.dataset.count || '0');
  const steps = [];
  for (let j = 0; j < count; j++) {
    const step = {};
    ['icon', 'titleIt', 'titleEn', 'descIt', 'descEn'].forEach(k => {
      const el = document.getElementById(`s-ci${j}-${k}`);
      if (el) step[k] = k === 'descIt' || k === 'descEn' ? el.value : el.value.trim();
    });
    steps.push(step);
  }
  return steps;
}

function addSettingsCheckinStep() {
  if (parseInt((document.getElementById('s-checkin-container') || {}).dataset.count || '0') >= 6) {
    showToast('Massimo 6 step check-in.', 'error');
    return;
  }
  const current = collectSettingsCheckinSteps();
  current.push({ icon: '', titleIt: '', titleEn: '', descIt: '', descEn: '' });
  renderSettingsCheckinSteps(current);
}

function removeSettingsCheckinStep(idx) {
  if (!confirm(`Rimuovere lo step ${idx + 1}?`)) return;
  const current = collectSettingsCheckinSteps();
  current.splice(idx, 1);
  renderSettingsCheckinSteps(current);
}

// ════════════════════════════════════════════
//  SETTINGS: DYNAMIC CONTACTS
// ════════════════════════════════════════════
function renderSettingsContacts(contacts) {
  const container = document.getElementById('s-contacts-fields');
  container.dataset.count = contacts.length;
  let html = '';
  contacts.forEach((c, i) => {
    html += `
      <div class="s-sub-title s-sub-title-row">
        <span>Contatto ${i + 1}</span>
        <button class="s-remove-btn" onclick="removeSettingsContact(${i})">🗑️ Rimuovi</button>
      </div>
      <div class="s-field"><label>Nome</label><input type="text" id="s-c${i}-name" value="${escHtml(c.name || '')}" placeholder="Nome Contatto"></div>
      <div class="s-field"><label>Telefono</label><input type="tel" id="s-c${i}-phone" value="${escHtml(c.phone || '')}" placeholder="+39 000 000 0000"></div>
      ${i < contacts.length - 1 ? '<div class="s-divider"></div>' : ''}`;
  });
  container.innerHTML = html;
}

function collectSettingsContacts() {
  const container = document.getElementById('s-contacts-fields');
  const count = parseInt(container.dataset.count || '0');
  const contacts = [];
  for (let i = 0; i < count; i++) {
    const nameEl = document.getElementById(`s-c${i}-name`);
    const phoneEl = document.getElementById(`s-c${i}-phone`);
    contacts.push({
      name: nameEl ? nameEl.value.trim() : '',
      phone: phoneEl ? phoneEl.value.trim() : ''
    });
  }
  return contacts;
}

function addSettingsContact() {
  const current = collectSettingsContacts();
  current.push({ name: '', phone: '' });
  renderSettingsContacts(current);
  const container = document.getElementById('s-contacts-fields');
  const idx = current.length - 1;
  const el = document.getElementById(`s-c${idx}-name`);
  if (el) el.focus();
}

function removeSettingsContact(idx) {
  const current = collectSettingsContacts();
  current.splice(idx, 1);
  renderSettingsContacts(current);
}
// ════════════════════════════════════════════
//  SETTINGS PANEL
// ════════════════════════════════════════════

function populateSettingsForms() {
  const d = currentData;

  // Info
  document.getElementById('s-bbName').value = d.bbName;
  document.getElementById('s-subtitle').value = d.subtitle;
  document.getElementById('s-cityZone').value = d.cityZone;
  document.getElementById('s-hostName').value = d.hostName;
  document.getElementById('s-hostPhone').value = d.hostPhone;
  document.getElementById('s-welcomeIt').value = d.welcomeIt || '';
  document.getElementById('s-welcomeEn').value = d.welcomeEn || '';
  document.getElementById('s-googleReviewUrl').value = d.googleReviewUrl || '';
  document.getElementById('s-closingTitleIt').value = d.closingTitleIt || '';
  document.getElementById('s-closingTitleEn').value = d.closingTitleEn || '';
  document.getElementById('s-closingTextIt').value = d.closingTextIt || '';
  document.getElementById('s-closingTextEn').value = d.closingTextEn || '';

  // Apts (dynamic)
  renderSettingsApts(d.apts);

  // Dynamic contacts
  renderSettingsContacts(d.extraContacts || []);

  // Reviews
  renderSettingsReviews(d.reviews || []);

  // Check-in steps
  renderSettingsCheckinSteps(d.checkinSteps || []);

  // Custom domain
  const cdEl = document.getElementById('s-customDomain');
  if (cdEl) cdEl.value = d.customDomain || '';

  // Char counters
  initCharCounters();

  // Nav Labels
  const nl = d.navLabels || {};
  document.getElementById('s-nl-homeIcon').value = nl.homeIcon || '';
  document.getElementById('s-nl-homeIt').value = nl.homeIt || '';
  document.getElementById('s-nl-homeEn').value = nl.homeEn || '';
  document.getElementById('s-nl-stayIcon').value = nl.stayIcon || '';
  document.getElementById('s-nl-stayIt').value = nl.stayIt || '';
  document.getElementById('s-nl-stayEn').value = nl.stayEn || '';
  document.getElementById('s-nl-placesIcon').value = nl.placesIcon || '';
  document.getElementById('s-nl-placesIt').value = nl.placesIt || '';
  document.getElementById('s-nl-placesEn').value = nl.placesEn || '';
  document.getElementById('s-nl-foodIcon').value = nl.foodIcon || '';
  document.getElementById('s-nl-foodIt').value = nl.foodIt || '';
  document.getElementById('s-nl-foodEn').value = nl.foodEn || '';
  document.getElementById('s-nl-transportIcon').value = nl.transportIcon || '';
  document.getElementById('s-nl-transportIt').value = nl.transportIt || '';
  document.getElementById('s-nl-transportEn').value = nl.transportEn || '';
  document.getElementById('s-nl-departureIcon').value = nl.departureIcon || '';
  document.getElementById('s-nl-departureIt').value = nl.departureIt || '';
  document.getElementById('s-nl-departureEn').value = nl.departureEn || '';

  // Section Titles
  const st = d.sectionTitles || {};
  document.getElementById('s-st-stayEyebrowIt').value = st.stayEyebrowIt || '';
  document.getElementById('s-st-stayEyebrowEn').value = st.stayEyebrowEn || '';
  document.getElementById('s-st-stayTitleIt').value = st.stayTitleIt || '';
  document.getElementById('s-st-stayTitleEn').value = st.stayTitleEn || '';
  document.getElementById('s-st-placesEyebrowIt').value = st.placesEyebrowIt || '';
  document.getElementById('s-st-placesEyebrowEn').value = st.placesEyebrowEn || '';
  document.getElementById('s-st-placesTitleIt').value = st.placesTitleIt || '';
  document.getElementById('s-st-placesTitleEn').value = st.placesTitleEn || '';
  document.getElementById('s-st-foodEyebrowIt').value = st.foodEyebrowIt || '';
  document.getElementById('s-st-foodEyebrowEn').value = st.foodEyebrowEn || '';
  document.getElementById('s-st-foodTitleIt').value = st.foodTitleIt || '';
  document.getElementById('s-st-foodTitleEn').value = st.foodTitleEn || '';
  document.getElementById('s-st-transportEyebrowIt').value = st.transportEyebrowIt || '';
  document.getElementById('s-st-transportEyebrowEn').value = st.transportEyebrowEn || '';
  document.getElementById('s-st-transportTitleIt').value = st.transportTitleIt || '';
  document.getElementById('s-st-transportTitleEn').value = st.transportTitleEn || '';
  document.getElementById('s-st-departureEyebrowIt').value = st.departureEyebrowIt || '';
  document.getElementById('s-st-departureEyebrowEn').value = st.departureEyebrowEn || '';
  document.getElementById('s-st-departureTitleIt').value = st.departureTitleIt || '';
  document.getElementById('s-st-departureTitleEn').value = st.departureTitleEn || '';

  // GitHub token (show indicator if saved, but do not reveal the token)
  const ghField = document.getElementById('s-github-token');
  if (ghField) {
    const encTok = localStorage.getItem(HOST_TOKEN_STORE);
    ghField.value = '';
    ghField.placeholder = encTok ? '[Token salvato ✅]' : 'ghp_...';
  }

  // QR Base URL
  const qrBaseUrlField = document.getElementById('s-qrBaseUrl');
  if (qrBaseUrlField) qrBaseUrlField.value = d.qrBaseUrl || '';

  // Support WhatsApp
  const supportPhone = (d.supportPhone || '+393450307922').replace(/\D/g, '');
  const waBtn = document.getElementById('s-support-wa-btn');
  if (waBtn) waBtn.setAttribute('href', 'https://wa.me/' + supportPhone);
  const supportPhoneField = document.getElementById('s-supportPhone');
  if (supportPhoneField) supportPhoneField.value = d.supportPhone || '+393450307922';

  // QR codes
  renderQrSection();

  // Analytics dashboard
  if (typeof GuestAnalytics !== 'undefined') GuestAnalytics.renderDashboard('an-dashboard');
}

function collectFormData() {
  const d = deepClone(currentData);

  d.bbName = document.getElementById('s-bbName').value.trim() || d.bbName;
  d.subtitle = document.getElementById('s-subtitle').value.trim() || d.subtitle;
  d.cityZone = document.getElementById('s-cityZone').value.trim() || d.cityZone;
  d.hostName = document.getElementById('s-hostName').value.trim() || d.hostName;
  d.hostPhone = document.getElementById('s-hostPhone').value.trim() || d.hostPhone;
  d.welcomeIt = document.getElementById('s-welcomeIt').value;
  d.welcomeEn = document.getElementById('s-welcomeEn').value;
  d.googleReviewUrl = document.getElementById('s-googleReviewUrl').value.trim();
  d.qrBaseUrl = (document.getElementById('s-qrBaseUrl') || {}).value || '';
  d.supportPhone = (document.getElementById('s-supportPhone') || {}).value || '+393450307922';
  d.closingTitleIt = document.getElementById('s-closingTitleIt').value.trim();
  d.closingTitleEn = document.getElementById('s-closingTitleEn').value.trim();
  d.closingTextIt = document.getElementById('s-closingTextIt').value.trim();
  d.closingTextEn = document.getElementById('s-closingTextEn').value.trim();

  // Dynamic apts
  d.apts = collectSettingsApts();

  // Dynamic contacts
  d.extraContacts = collectSettingsContacts();

  // Reviews
  d.reviews = collectSettingsReviews();

  // Check-in steps
  d.checkinSteps = collectSettingsCheckinSteps();

  // Custom domain
  const cdEl = document.getElementById('s-customDomain');
  if (cdEl) d.customDomain = cdEl.value.trim();

  // Nav Labels
  d.navLabels = {
    homeIt:         document.getElementById('s-nl-homeIt').value.trim() || 'Home',
    homeEn:         document.getElementById('s-nl-homeEn').value.trim(),
    homeIcon:       document.getElementById('s-nl-homeIcon').value.trim() || '🏠',
    stayIt:         document.getElementById('s-nl-stayIt').value.trim() || 'Soggiorno',
    stayEn:         document.getElementById('s-nl-stayEn').value.trim(),
    stayIcon:       document.getElementById('s-nl-stayIcon').value.trim() || '🛋️',
    placesIt:       document.getElementById('s-nl-placesIt').value.trim() || 'Luoghi',
    placesEn:       document.getElementById('s-nl-placesEn').value.trim(),
    placesIcon:     document.getElementById('s-nl-placesIcon').value.trim() || '🗺️',
    foodIt:         document.getElementById('s-nl-foodIt').value.trim() || 'Mangiare',
    foodEn:         document.getElementById('s-nl-foodEn').value.trim(),
    foodIcon:       document.getElementById('s-nl-foodIcon').value.trim() || '🍽️',
    transportIt:    document.getElementById('s-nl-transportIt').value.trim() || 'Muoversi',
    transportEn:    document.getElementById('s-nl-transportEn').value.trim(),
    transportIcon:  document.getElementById('s-nl-transportIcon').value.trim() || '🚇',
    departureIt:    document.getElementById('s-nl-departureIt').value.trim() || 'Partenza',
    departureEn:    document.getElementById('s-nl-departureEn').value.trim(),
    departureIcon:  document.getElementById('s-nl-departureIcon').value.trim() || '🧳'
  };

  // Section Titles
  d.sectionTitles = {
    stayEyebrowIt:      document.getElementById('s-st-stayEyebrowIt').value.trim() || 'Il Tuo Appartamento',
    stayEyebrowEn:      document.getElementById('s-st-stayEyebrowEn').value.trim(),
    stayTitleIt:        document.getElementById('s-st-stayTitleIt').value.trim() || 'Soggiorno',
    stayTitleEn:        document.getElementById('s-st-stayTitleEn').value.trim(),
    placesEyebrowIt:    document.getElementById('s-st-placesEyebrowIt').value.trim() || 'Scopri la Città',
    placesEyebrowEn:    document.getElementById('s-st-placesEyebrowEn').value.trim(),
    placesTitleIt:      document.getElementById('s-st-placesTitleIt').value.trim() || 'Luoghi',
    placesTitleEn:      document.getElementById('s-st-placesTitleEn').value.trim(),
    foodEyebrowIt:      document.getElementById('s-st-foodEyebrowIt').value.trim() || 'Dove Mangiare',
    foodEyebrowEn:      document.getElementById('s-st-foodEyebrowEn').value.trim(),
    foodTitleIt:        document.getElementById('s-st-foodTitleIt').value.trim() || 'Mangiare',
    foodTitleEn:        document.getElementById('s-st-foodTitleEn').value.trim(),
    transportEyebrowIt: document.getElementById('s-st-transportEyebrowIt').value.trim() || 'In Città',
    transportEyebrowEn: document.getElementById('s-st-transportEyebrowEn').value.trim(),
    transportTitleIt:   document.getElementById('s-st-transportTitleIt').value.trim() || 'Muoversi',
    transportTitleEn:   document.getElementById('s-st-transportTitleEn').value.trim(),
    departureEyebrowIt: document.getElementById('s-st-departureEyebrowIt').value.trim() || 'È Ora di Partire',
    departureEyebrowEn: document.getElementById('s-st-departureEyebrowEn').value.trim(),
    departureTitleIt:   document.getElementById('s-st-departureTitleIt').value.trim() || 'Partenza',
    departureTitleEn:   document.getElementById('s-st-departureTitleEn').value.trim()
  };

  return d;
}

// ════════════════════════════════════════════
//  FORM VALIDATION
// ════════════════════════════════════════════
function validateSettingsForm() {
  const errors = [];

  // Validazione URL
  const urlFields = ['s-googleReviewUrl'];
  const aptCount = parseInt(document.getElementById('s-apts-container').dataset.count || '0');
  for (let i = 0; i < aptCount; i++) {
    urlFields.push(`s-a${i}-mapsLink`);
    ['airport', 'station', 'metro', 'bus'].forEach(tr => {
      urlFields.push(`s-a${i}-tr-${tr}Maps`);
    });
  }
  urlFields.forEach(id => {
    const el = document.getElementById(id);
    if (el && el.value.trim() && !el.value.trim().match(/^https?:\/\//)) {
      el.style.borderColor = 'var(--accent)';
      const labelEl = el.closest('.s-field') && el.closest('.s-field').querySelector('label');
      errors.push(`Il campo "${labelEl ? labelEl.textContent : id}" deve essere un URL valido (https://...)`);
    } else if (el) {
      el.style.borderColor = '';
    }
  });

  // Validazione telefono
  const phoneEl = document.getElementById('s-hostPhone');
  if (phoneEl && phoneEl.value.trim() && !/^[\+\d\s\-\(\)]+$/.test(phoneEl.value.trim())) {
    phoneEl.style.borderColor = 'var(--accent)';
    errors.push('Il numero di telefono host non è valido.');
  } else if (phoneEl) {
    phoneEl.style.borderColor = '';
  }

  return errors;
}

function saveAndApply() {
  const validationErrors = validateSettingsForm();
  if (validationErrors.length > 0) {
    showToast('⚠️ ' + validationErrors[0], 'error');
    return;
  }
  if (currentRole === 'host') {
    if (!confirm('Vuoi salvare le modifiche? Le vedranno tutti gli ospiti.')) return;
    const d = collectFormData();
    currentData = d;
    saveData(d);
    renderLanding();
    settingsDirty = false;
    // Stay in settings panel - show toast feedback
    showToast("✅ Salvato! Ricorda di cliccare '🚀 Pubblica Ora' per aggiornare il sito online.", 'success');
    addChangelogEntry('Impostazioni salvate', 'host');
    if (typeof renderChangelogSection === 'function') renderChangelogSection();
  } else {
    const d = collectFormData();
    currentData = d;
    saveData(d);
    renderLanding();
    settingsDirty = false;
    // Stay in settings panel - show toast feedback
    showToast('✅ Salvato con successo!', 'success');
    addChangelogEntry('Impostazioni salvate', 'admin');
    if (typeof renderChangelogSection === 'function') renderChangelogSection();
  }
}

function sendChangesAsHost() {
  const phone = ((currentData && currentData.supportPhone) || '+393450307922').replace(/\D/g, '');
  window.open('https://wa.me/' + phone, '_blank');
  showToast('💬 WhatsApp aperto.', 'success');
}
function resetData() {
  if (!confirm('Ripristinare i dati predefiniti? Tutte le modifiche verranno perse.')) return;
  currentData = deepClone(DEFAULT_DATA);
  saveData(currentData);
  renderLanding();
  closeSettings();
  showToast('Dati resettati', 'info');
}

function exportJSON() {
  const d = collectFormData();
  const json = JSON.stringify(d, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'bnb-guide-data.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function importJSON(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const imported = JSON.parse(e.target.result);
      currentData = mergeWithDefaults(imported, DEFAULT_DATA);
      saveData(currentData);
      renderLanding();
      populateSettingsForms();
      alert('Dati importati con successo!');
    } catch(err) {
      alert('Errore nel file JSON. Verificare il formato.');
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}

// ════════════════════════════════════════════
//  QR CODE GENERATOR (lazy-loaded from js/qr-lib.js)
// ════════════════════════════════════════════

// Perf: lazy-load QR library only when needed
async function loadQrLib() {
  if (window.qrcode) return;
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'js/qr-lib.js';
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

// ════════════════════════════════════════════
//  QR CODE SECTION
// ════════════════════════════════════════════
function getGuideBaseUrl() {
  return (currentData && currentData.qrBaseUrl && currentData.qrBaseUrl.trim())
    ? currentData.qrBaseUrl.trim()
    : window.location.origin + window.location.pathname;
}

async function renderQrSection() {
  const grid = document.getElementById('qr-grid');
  if (!grid) return;
  const apts = (currentData && currentData.apts) || [];
  const base = getGuideBaseUrl();
  grid.innerHTML = '';
  if (!apts.length) {
    grid.innerHTML = '<p style="color:var(--text2);font-size:12px">Nessun appartamento configurato.</p>';
    return;
  }
  try { await loadQrLib(); } catch(e) { console.error('Failed to load QR library:', e); }
  apts.forEach(function(apt, idx) {
    const url = base + '?apt=' + idx;
    const name = apt.name || ('Appartamento ' + (idx + 1));
    const card = document.createElement('div');
    card.className = 'qr-card';
    const title = document.createElement('div');
    title.className = 'qr-apt-name';
    title.textContent = name;
    card.appendChild(title);
    const wrap = document.createElement('div');
    wrap.className = 'qr-canvas-wrap';
    const canvas = document.createElement('canvas');
    canvas.id = 'qr-canvas-' + idx;
    wrap.appendChild(canvas);
    card.appendChild(wrap);
    const urlLabel = document.createElement('div');
    urlLabel.className = 'qr-url';
    urlLabel.textContent = url;
    card.appendChild(urlLabel);
    const dlBtn = document.createElement('button');
    dlBtn.className = 'qr-dl-btn';
    dlBtn.textContent = '📥 Scarica QR';
    dlBtn.onclick = (function(i, n) { return function() { downloadQr(i, n); }; })(idx, name);
    card.appendChild(dlBtn);
    grid.appendChild(card);
    // Generate QR
    try {
      var qr = qrcode(0, 'M');
      qr.addData(url);
      qr.make();
      var moduleCount = qr.getModuleCount();
      var size = 200;
      var cellSize = Math.floor(size / moduleCount);
      var actualSize = cellSize * moduleCount;
      canvas.width = actualSize;
      canvas.height = actualSize;
      var ctx = canvas.getContext('2d');
      ctx.fillStyle = '#1a3238';
      ctx.fillRect(0, 0, actualSize, actualSize);
      ctx.fillStyle = '#c9a84c';
      for (var row = 0; row < moduleCount; row++) {
        for (var col = 0; col < moduleCount; col++) {
          if (qr.isDark(row, col)) {
            ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
          }
        }
      }
    } catch(e) {
      canvas.style.display = 'none';
      urlLabel.textContent += ' (QR non disponibile)';
    }
  });
}

function downloadQr(idx, aptName) {
  var canvas = document.getElementById('qr-canvas-' + idx);
  if (!canvas) return;
  var link = document.createElement('a');
  link.download = 'qr-' + (aptName || ('apt-' + idx)).replace(/[^a-zA-Z0-9]/g, '_') + '.png';
  link.href = canvas.toDataURL('image/png');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function printAllQr() {
  var apts = (currentData && currentData.apts) || [];
  var base = getGuideBaseUrl();
  var items = '';
  apts.forEach(function(apt, idx) {
    var canvas = document.getElementById('qr-canvas-' + idx);
    var dataUrl = canvas ? canvas.toDataURL('image/png') : '';
    var name = apt.name || ('Appartamento ' + (idx + 1));
    var url = base + '?apt=' + idx;
    items += '<div style="page-break-inside:avoid;display:inline-block;margin:20px;text-align:center;vertical-align:top">'
      + '<p style="font-family:serif;font-size:16px;color:#c9a84c;margin-bottom:8px">' + escHtml(name) + '</p>'
      + (dataUrl ? '<img src="' + dataUrl + '" style="width:200px;height:200px">' : '')
      + '<p style="font-size:10px;color:#666;margin-top:8px;word-break:break-all;max-width:200px">' + escHtml(url) + '</p>'
      + '</div>';
  });
  var win = window.open('', '_blank', 'noopener');
  if (!win) return;
  win.document.write('<html><head><title>QR Codes</title><style>body{background:#fff;text-align:center;padding:20px}@media print{@page{margin:1cm}}</style></head><body>' + items + '</body></html>');
  win.document.close();
  win.focus();
  setTimeout(function() { win.print(); }, 300);
}

function renderSettingsReviews(reviews) {
  const container = document.getElementById('s-reviews-container');
  if (!container) return;
  const existingReviews = container.querySelectorAll('.s-review-item');
  existingReviews.forEach(function(el) { el.remove(); });
  (reviews || []).forEach(function(r, i) {
    container.appendChild(_buildReviewItem(r, i));
  });
  container.dataset.count = (reviews || []).length;
}

function _buildReviewItem(r, idx) {
  const wrap = document.createElement('div');
  wrap.className = 's-review-item';
  wrap.style.cssText = 'border:1px solid var(--border);border-radius:10px;padding:12px;margin-bottom:10px';
  wrap.innerHTML =
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">' +
      '<strong style="font-size:12px;color:var(--gold)">Recensione #' + (idx+1) + '</strong>' +
      '<button onclick="removeSettingsReview(' + idx + ')" style="background:transparent;border:none;color:var(--accent);cursor:pointer;font-size:16px">✕</button>' +
    '</div>' +
    '<div class="s-field"><label>Nome Ospite</label><input type="text" class="rev-author" placeholder="es. Maria R." value="' + escHtml(r.author || '') + '"></div>' +
    '<div class="s-field"><label>Stelle</label><select class="rev-stars">' +
      [5,4,3,2,1].map(function(n) { return '<option value="' + n + '"' + (n === (r.stars||5) ? ' selected' : '') + '>' + n + ' ★</option>'; }).join('') +
    '</select></div>' +
    '<div class="s-field"><label>Testo 🇮🇹</label><textarea class="rev-textIt" rows="2" placeholder="Testo recensione in italiano...">' + escHtml(r.textIt || '') + '</textarea></div>' +
    '<div class="s-field"><label>Testo 🇬🇧</label><textarea class="rev-textEn" rows="2" placeholder="Review text in English...">' + escHtml(r.textEn || '') + '</textarea></div>';
  return wrap;
}

function collectSettingsReviews() {
  const container = document.getElementById('s-reviews-container');
  if (!container) return [];
  const items = container.querySelectorAll('.s-review-item');
  const reviews = [];
  items.forEach(function(item) {
    reviews.push({
      author: item.querySelector('.rev-author').value.trim(),
      stars: parseInt(item.querySelector('.rev-stars').value, 10) || 5,
      textIt: item.querySelector('.rev-textIt').value.trim(),
      textEn: item.querySelector('.rev-textEn').value.trim()
    });
  });
  return reviews;
}

function addSettingsReview() {
  const container = document.getElementById('s-reviews-container');
  if (!container) return;
  const current = collectSettingsReviews();
  const newReview = { author: '', stars: 5, textIt: '', textEn: '' };
  current.push(newReview);
  container.appendChild(_buildReviewItem(newReview, current.length - 1));
  container.dataset.count = current.length;
  settingsDirty = true;
}

function removeSettingsReview(idx) {
  const current = collectSettingsReviews();
  current.splice(idx, 1);
  renderSettingsReviews(current);
  settingsDirty = true;
}



// ════════════════════════════════════════════
//  CHANGELOG SECTION
// ════════════════════════════════════════════
function renderChangelogSection() {
  const container = document.getElementById('changelog-list');
  if (!container) return;
  const log = getChangelog();
  if (log.length === 0) {
    container.innerHTML = '<p style="font-size:12px;color:var(--text2);text-align:center;padding:12px">Nessuna modifica registrata.</p>';
    return;
  }
  container.innerHTML = log.map(entry => {
    const d = new Date(entry.ts);
    const dateStr = d.toLocaleDateString('it-IT') + ' ' + d.toLocaleTimeString('it-IT', {hour:'2-digit',minute:'2-digit'});
    const who = entry.who || 'admin';
    return `<div class="changelog-entry">
      <div class="changelog-entry-header">
        <span class="changelog-entry-desc">${escHtml(entry.desc || '')}</span>
        <span class="changelog-entry-who ${who === 'admin' ? 'admin' : 'host'}">${who === 'admin' ? '🛡️ Admin' : '👤 Host'}</span>
      </div>
      <div class="changelog-entry-meta">${dateStr}</div>
    </div>`;
  }).join('');
}

function clearChangelog() {
  if (!confirm('Cancellare tutto lo storico modifiche?')) return;
  localStorage.removeItem('bnb_changelog');
  renderChangelogSection();
}

function copyCnameRecord() {
  const el = document.getElementById('s-customDomain');
  const domain = el ? el.value.trim() : '';
  const githubUser = (typeof currentData !== 'undefined' && currentData.qrBaseUrl)
    ? (currentData.qrBaseUrl.match(/^https?:\/\/([^\/]+)/) || [])[1] || '<username>.github.io'
    : '<username>.github.io';
  const text = githubUser;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => showToast('📋 Record CNAME copiato!', 'success')).catch(() => showToast('⚠️ Copia fallita.', 'error'));
  } else {
    showToast('⚠️ Copia non supportata su questo browser.', 'error');
  }
}

function resetAnalytics() {
  if (!confirm('Azzerare tutti i dati analytics?')) return;
  if (typeof GuestAnalytics !== 'undefined') {
    GuestAnalytics.reset();
    GuestAnalytics.renderDashboard('an-dashboard');
  }
  showToast('📊 Analytics azzerati.', 'success');
}
