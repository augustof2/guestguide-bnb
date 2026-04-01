async function publishOnline() {
  const tokenInput = document.getElementById('s-github-token');
  const typedToken = tokenInput && tokenInput.value.trim();
  let token = typedToken || '';
  if (!token) {
    const enc = localStorage.getItem(HOST_TOKEN_STORE);
    if (enc) token = await decryptToken(enc).catch(() => '');
  }
  const msg = document.getElementById('s-publish-msg');
  const showErr = text => { if (msg) { msg.style.color = 'var(--accent)'; msg.textContent = '❌ ' + text; } else alert('❌ ' + text); };
  const showOk  = text => { if (msg) { msg.style.color = 'var(--teal)';   msg.textContent = '✅ ' + text; } else alert('✅ ' + text); };

  if (!token) {
    showErr('Inserisci il GitHub Token nella sezione Sicurezza PIN prima di pubblicare.');
    return;
  }
  // Persist token encrypted for future use
  encryptToken(token).then(enc => localStorage.setItem(HOST_TOKEN_STORE, enc)).catch(() => {});

  const btn = document.getElementById('publish-btn');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Pubblicazione…'; }
  if (msg) msg.textContent = '';

  try {
    const OWNER = 'ffeliteapartments';
    const REPO  = 'guide';
    const DATA_FILE = 'js/data.js';
    const BRANCH = 'main';
    const DATA_API = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${DATA_FILE}`;

    // Show deploy progress
    const deploySteps = [
      { id: 'step-fetch', label: 'Recupero file dal server...', icon: '📡' },
      { id: 'step-patch', label: 'Applicazione modifiche...', icon: '✏️' },
      { id: 'step-upload', label: 'Caricamento su GitHub...', icon: '⬆️' },
      { id: 'step-deploy', label: 'Avvio deploy su GitHub Pages...', icon: '🚀' }
    ];
    if (msg) {
      msg.innerHTML = '<div class="deploy-steps">' +
        deploySteps.map(s => `<div class="deploy-step" id="${s.id}"><div class="deploy-step-icon">${s.icon}</div><div class="deploy-step-label">${s.label}</div></div>`).join('') +
        '<div class="deploy-timer" id="deploy-timer"></div>' +
        '</div>';
    }
    const setStep = (id, state) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.classList.remove('active', 'done', 'error');
      el.classList.add(state);
      if (state === 'active') el.querySelector('.deploy-step-icon').innerHTML = '<div class="deploy-spinner"></div>';
    };
    const deployStart = Date.now();
    const timerInterval = setInterval(() => {
      const el = document.getElementById('deploy-timer');
      if (el) el.textContent = ((Date.now() - deployStart) / 1000).toFixed(1) + 's';
    }, 100);

    try {
    setStep('step-fetch', 'active');
    // 1. Get current js/data.js file (for SHA)
    const getResp = await fetch(`${DATA_API}?ref=${BRANCH}`, {
      headers: { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github.v3+json' }
    });
    if (!getResp.ok) {
      setStep('step-fetch', 'error');
      const e = await getResp.json().catch(() => ({}));
      throw new Error(e.message || `HTTP ${getResp.status}`);
    }
    const fileData = await getResp.json();
    setStep('step-fetch', 'done');
    const rawContent = decodeURIComponent(escape(atob(fileData.content.replace(/\n/g, ''))));

    setStep('step-patch', 'active');
    // 2. Get current PIN hash
    const pinHash = getStoredPinHash();

    // 3. Get current data from the form (includes unsaved changes in settings)
    const dataStr = JSON.stringify(collectFormData(), null, 2);

    // 4. Patch DEFAULT_PIN_HASH
    let newContent = rawContent.replace(
      /\/\* DEFAULT_PIN_HASH_START \*\/[\s\S]*?\/\* DEFAULT_PIN_HASH_END \*\//,
      `/* DEFAULT_PIN_HASH_START */\nconst DEFAULT_PIN_HASH = deobfuscateHash('${obfuscateHash(pinHash)}');\n/* DEFAULT_PIN_HASH_END */`
    );

    // 4b. Patch DEFAULT_USER_HASH
    const userHash = getStoredUserHash();
    newContent = newContent.replace(
      /\/\* DEFAULT_USER_HASH_START \*\/[\s\S]*?\/\* DEFAULT_USER_HASH_END \*\//,
      `/* DEFAULT_USER_HASH_START */\nconst DEFAULT_USER_HASH = deobfuscateHash('${obfuscateHash(userHash)}');\n/* DEFAULT_USER_HASH_END */`
    );

    // 4c. Patch DEFAULT_PASS_HASH
    const passHash = getStoredPassHash();
    newContent = newContent.replace(
      /\/\* DEFAULT_PASS_HASH_START \*\/[\s\S]*?\/\* DEFAULT_PASS_HASH_END \*\//,
      `/* DEFAULT_PASS_HASH_START */\nconst DEFAULT_PASS_HASH = deobfuscateHash('${obfuscateHash(passHash)}');\n/* DEFAULT_PASS_HASH_END */`
    );

    // 4d. Patch DEFAULT_RECOVERY_HASH
    const recoveryHash = getStoredRecoveryHash();
    newContent = newContent.replace(
      /\/\* DEFAULT_RECOVERY_HASH_START \*\/[\s\S]*?\/\* DEFAULT_RECOVERY_HASH_END \*\//,
      `/* DEFAULT_RECOVERY_HASH_START */\nconst DEFAULT_RECOVERY_HASH = deobfuscateHash('${obfuscateHash(recoveryHash)}');\n/* DEFAULT_RECOVERY_HASH_END */`
    );

    // 5. Patch PUBLISHED_DATA
    newContent = newContent.replace(
      /\/\* PUBLISHED_DATA_START \*\/[\s\S]*?\/\* PUBLISHED_DATA_END \*\//,
      `/* PUBLISHED_DATA_START */\nconst PUBLISHED_DATA = ${dataStr};\n/* PUBLISHED_DATA_END */`
    );

    // 6. Base64-encode (handle Unicode)
    const newContentB64 = btoa(unescape(encodeURIComponent(newContent)));

    setStep('step-patch', 'done');
    setStep('step-upload', 'active');
    // 7. Commit to js/data.js
    const putResp = await fetch(DATA_API, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Aggiorna guida e PIN [via admin panel]',
        content: newContentB64,
        sha: fileData.sha,
        branch: BRANCH
      })
    });

    if (!putResp.ok) {
      setStep('step-upload', 'error');
      const e = await putResp.json().catch(() => ({}));
      throw new Error(e.message || `HTTP ${putResp.status}`);
    }
    setStep('step-upload', 'done');
    setStep('step-deploy', 'active');

    // 8. Patch CACHE_VERSION in sw.js
    try {
      const SW_FILE = 'sw.js';
      const SW_API = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${SW_FILE}`;
      const swGetResp = await fetch(`${SW_API}?ref=${BRANCH}`, {
        headers: { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github.v3+json' }
      });
      if (swGetResp.ok) {
        const swFileData = await swGetResp.json();
        const swRaw = decodeURIComponent(escape(atob(swFileData.content.replace(/\n/g, ''))));
        const newVersion = new Date().toISOString().slice(0, 10) + '-v' + Date.now();
        const swUpdated = swRaw.replace(
          /const CACHE_VERSION = '[^']+';/,
          `const CACHE_VERSION = '${newVersion}';`
        );
        await fetch(SW_API, {
          method: 'PUT',
          headers: { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github.v3+json', 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: '🔄 Aggiorna cache SW [auto]',
            content: btoa(unescape(encodeURIComponent(swUpdated))),
            sha: swFileData.sha,
            branch: BRANCH
          })
        });
      }
    } catch(swErr) { /* Non-fatal: SW cache patch failed */ }

    setTimeout(() => { setStep('step-deploy', 'done'); }, 1500);

    clearInterval(timerInterval);
    showOk('✅ Pubblicato! Le modifiche saranno live su ffeliteapartments.github.io/guide tra qualche secondo.');
    showToast('Pubblicato online!', 'success');
    addChangelogEntry('Pubblicazione online (admin)', 'admin');
    setTimeout(() => { if (msg) msg.innerHTML = ''; }, 12000);
    } catch(innerErr) {
      clearInterval(timerInterval);
      throw innerErr;
    }
  } catch (err) {
    showErr(err.message || 'Errore sconosciuto.');
    showToast(err.message || 'Errore di pubblicazione', 'error');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '🚀 Pubblica Online'; }
  }
}

// ════════════════════════════════════════════
//  SETTINGS: DYNAMIC APARTMENTS
// ════════════════════════════════════════════
function renderSettingsApts(apts) {
  const container = document.getElementById('s-apts-container');
  container.dataset.count = apts.length;
  container.innerHTML = '';
  apts.forEach((apt, i) => {
    const canDel = apts.length > 1;
    const section = document.createElement('details');
    section.className = 's-section';
    const delBtn = canDel
      ? `<button class="s-remove-btn" onclick="event.stopPropagation(); removeSettingsApt(${i})">🗑️ Elimina</button>`
      : '';
    section.innerHTML = `
      <summary class="s-section-title"><span class="s-section-title-inner">🏠 Appartamento ${i + 1}${delBtn}</span></summary>
      <div class="s-fields">
        <div class="s-field"><label>Nome (IT)</label><input type="text" id="s-a${i}-name" value="${escAttr(apt.name || '')}" placeholder="Appartamento ${i + 1}"></div>
        <div class="s-field"><label>Indirizzo completo</label><input type="text" id="s-a${i}-address" value="${escAttr(apt.address || '')}"></div>
        <div class="s-field"><label>Indirizzo breve</label><input type="text" id="s-a${i}-addressShort" value="${escAttr(apt.addressShort || '')}"></div>
        <div class="s-field"><label>Link Google Maps</label><input type="url" id="s-a${i}-mapsLink" value="${escAttr(apt.mapsLink || '')}"></div>
        <div class="s-field"><label>Max ospiti (IT)</label><input type="text" id="s-a${i}-maxGuests" value="${escAttr(apt.maxGuests || '')}"></div>
        <div class="s-field"><label>Max ospiti (EN)</label><input type="text" id="s-a${i}-maxGuestsEn" value="${escAttr(apt.maxGuestsEn || '')}"></div>
        <div class="s-field"><label>WiFi — Nome rete</label><input type="text" id="s-a${i}-wifi" value="${escAttr(apt.wifi || '')}"></div>
        <div class="s-field"><label>WiFi — Password</label><input type="text" id="s-a${i}-wifiPass" value="${escAttr(deobfuscate(apt.wifiPass || ''))}"></div>
        <div class="s-field"><label>Check-in (orario)</label><input type="text" id="s-a${i}-checkin" value="${escAttr(apt.checkin || '')}" placeholder="15:00"></div>
        <div class="s-field"><label>Check-out (orario)</label><input type="text" id="s-a${i}-checkout" value="${escAttr(apt.checkout || '')}" placeholder="10:00"></div>
        <div class="s-divider"></div>
        <div class="s-sub-title">🌤️ Meteo</div>
        <div class="s-field"><label>Latitudine (per widget meteo)</label><input type="text" id="s-a${i}-lat" value="${escAttr(apt.lat || '')}" placeholder="41.9028 (Roma)"></div>
        <div class="s-field"><label>Longitudine (per widget meteo)</label><input type="text" id="s-a${i}-lon" value="${escAttr(apt.lon || '')}" placeholder="12.4964 (Roma)"></div>
        <div class="s-divider"></div>
        <div class="s-sub-title">📍 Come raggiungerci</div>
        <div class="s-field"><label>Come raggiungerci 🇮🇹</label><textarea id="s-a${i}-howToReachIt" placeholder="Dalla stazione centrale..." onblur="autoTranslateField('s-a${i}-howToReachIt','s-a${i}-howToReachEn')">${escHtml(apt.howToReachIt || '')}</textarea></div>
        <div class="s-field"><label>Come raggiungerci 🇬🇧</label><textarea id="s-a${i}-howToReachEn">${escHtml(apt.howToReachEn || '')}</textarea></div>
        <div class="s-divider"></div>
        <div class="s-sub-title">🗝️ Come accedere</div>
        <div class="s-field"><label>Come accedere 🇮🇹</label><textarea id="s-a${i}-howToAccessIt" placeholder="Le chiavi vi verranno consegnate..." onblur="autoTranslateField('s-a${i}-howToAccessIt','s-a${i}-howToAccessEn')">${escHtml(apt.howToAccessIt || '')}</textarea></div>
        <div class="s-field"><label>Come accedere 🇬🇧</label><textarea id="s-a${i}-howToAccessEn">${escHtml(apt.howToAccessEn || '')}</textarea></div>
        <div class="s-divider"></div>
        <div class="s-sub-title">🚗 Parcheggio</div>
        <div class="s-field"><label>Parcheggio 🇮🇹</label><textarea id="s-a${i}-parkingIt" placeholder="Parcheggio pubblico disponibile..." onblur="autoTranslateField('s-a${i}-parkingIt','s-a${i}-parkingEn')">${escHtml(apt.parkingIt || '')}</textarea></div>
        <div class="s-field"><label>Parcheggio 🇬🇧</label><textarea id="s-a${i}-parkingEn">${escHtml(apt.parkingEn || '')}</textarea></div>
        <div class="s-divider"></div>
        <div class="s-sub-title">🏠 Regole della casa</div>
        <div id="s-a${i}-rules" data-count="0"></div>
        <button class="s-add-btn" style="margin-top:8px" onclick="addAptHouseRule(${i})">➕ Aggiungi Regola</button>
        <div class="s-divider"></div>
        <div class="s-sub-title">🛌 Camera da Letto — Dotazioni (comma-separato)</div>
        <div class="s-field"><label>Dotazioni camera 🇮🇹</label><input type="text" id="s-a${i}-bedroomTagsIt" value="${escAttr(apt.bedroomTagsIt || '')}" placeholder="Letto matrimoniale,Armadio,Biancheria..." onblur="autoTranslateField('s-a${i}-bedroomTagsIt','s-a${i}-bedroomTagsEn')"></div>
        <div class="s-field"><label>Dotazioni camera 🇬🇧</label><input type="text" id="s-a${i}-bedroomTagsEn" value="${escAttr(apt.bedroomTagsEn || '')}" placeholder="Double bed,Wardrobe,Linen..."></div>
        <div class="s-divider"></div>
        <div class="s-sub-title">🍳 Cucina — Dotazioni (comma-separato)</div>
        <div class="s-field"><label>Dotazioni cucina 🇮🇹</label><input type="text" id="s-a${i}-kitchenTagsIt" value="${escAttr(apt.kitchenTagsIt || '')}" placeholder="Piano cottura,Forno,Frigorifero..." onblur="autoTranslateField('s-a${i}-kitchenTagsIt','s-a${i}-kitchenTagsEn')"></div>
        <div class="s-field"><label>Dotazioni cucina 🇬🇧</label><input type="text" id="s-a${i}-kitchenTagsEn" value="${escAttr(apt.kitchenTagsEn || '')}" placeholder="Hob,Oven,Fridge..."></div>
        <div class="s-divider"></div>
        <div class="s-sub-title">🚿 Bagno — Dotazioni (comma-separato)</div>
        <div class="s-field"><label>Dotazioni bagno 🇮🇹</label><input type="text" id="s-a${i}-bathroomTagsIt" value="${escAttr(apt.bathroomTagsIt || '')}" placeholder="Doccia,Asciugamani,Phon..." onblur="autoTranslateField('s-a${i}-bathroomTagsIt','s-a${i}-bathroomTagsEn')"></div>
        <div class="s-field"><label>Dotazioni bagno 🇬🇧</label><input type="text" id="s-a${i}-bathroomTagsEn" value="${escAttr(apt.bathroomTagsEn || '')}" placeholder="Shower,Towels,Hair dryer..."></div>
        <div class="s-divider"></div>
        <div class="s-sub-title">✨ Servizi Extra</div>
        <div id="s-a${i}-services" data-count="0"></div>
        <button class="s-add-btn" style="margin-top:8px" onclick="addAptExtraService(${i})">➕ Aggiungi Servizio</button>
        <div class="s-divider"></div>
        <div class="s-sub-title">🗺️ Luoghi da Visitare</div>
        <div id="s-a${i}-places" data-count="0"></div>
        <button class="s-add-btn" style="margin-top:8px" onclick="addAptPlace(${i})">➕ Aggiungi Luogo</button>
        <div class="s-divider"></div>
        <div class="s-sub-title">🍽️ Ristoranti</div>
        <div id="s-a${i}-restaurants" data-count="0"></div>
        <button class="s-add-btn" style="margin-top:8px" onclick="addAptRest(${i})">➕ Aggiungi Ristorante</button>
        <div class="s-divider"></div>
        <div class="s-sub-title">🛒 Supermercati</div>
        <div id="s-a${i}-supermarkets" data-count="0"></div>
        <button class="s-add-btn" style="margin-top:8px" onclick="addAptSupermarket(${i})">➕ Aggiungi Supermercato</button>
        <div class="s-divider"></div>
        <div class="s-sub-title">🚇 Trasporti</div>
        <div class="s-fields">
          <div class="s-sub-title" style="font-size:12px">✈️ Aeroporto</div>
          <div class="s-field" style="flex-direction:row;align-items:center;gap:10px;flex-wrap:wrap">
            <label style="white-space:nowrap">Mostra sezione</label>
            <input type="checkbox" id="s-a${i}-tr-airportEnabled" ${(apt.transport && apt.transport.airportEnabled !== false) ? 'checked' : ''} style="width:auto;accent-color:var(--teal)">
          </div>
          <div class="s-field"><label>Emoji</label><input type="text" id="s-a${i}-tr-airportIcon" value="${escAttr((apt.transport && apt.transport.airportIcon) || '✈️')}" placeholder="✈️" style="max-width:80px"></div>
          <div class="s-field"><label>Descrizione 🇮🇹</label><textarea id="s-a${i}-tr-airportIt" placeholder="All'uscita dell'aeroporto..." onblur="autoTranslateField('s-a${i}-tr-airportIt','s-a${i}-tr-airportEn')">${escHtml((apt.transport && apt.transport.airportIt) || '')}</textarea></div>
          <div class="s-field"><label>Descrizione 🇬🇧</label><textarea id="s-a${i}-tr-airportEn">${escHtml((apt.transport && apt.transport.airportEn) || '')}</textarea></div>
          <div class="s-field"><label>Link Maps</label><input type="url" id="s-a${i}-tr-airportMaps" value="${escAttr((apt.transport && apt.transport.airportMaps) || '')}" placeholder="https://maps.google.com/..."></div>
          <div class="s-divider"></div>
          <div class="s-sub-title" style="font-size:12px">🚉 Stazione</div>
          <div class="s-field" style="flex-direction:row;align-items:center;gap:10px;flex-wrap:wrap">
            <label style="white-space:nowrap">Mostra sezione</label>
            <input type="checkbox" id="s-a${i}-tr-stationEnabled" ${(apt.transport && apt.transport.stationEnabled !== false) ? 'checked' : ''} style="width:auto;accent-color:var(--teal)">
          </div>
          <div class="s-field"><label>Emoji</label><input type="text" id="s-a${i}-tr-stationIcon" value="${escAttr((apt.transport && apt.transport.stationIcon) || '🚉')}" placeholder="🚉" style="max-width:80px"></div>
          <div class="s-field"><label>Descrizione 🇮🇹</label><textarea id="s-a${i}-tr-stationIt" placeholder="Dalla stazione..." onblur="autoTranslateField('s-a${i}-tr-stationIt','s-a${i}-tr-stationEn')">${escHtml((apt.transport && apt.transport.stationIt) || '')}</textarea></div>
          <div class="s-field"><label>Descrizione 🇬🇧</label><textarea id="s-a${i}-tr-stationEn">${escHtml((apt.transport && apt.transport.stationEn) || '')}</textarea></div>
          <div class="s-field"><label>Link Maps</label><input type="url" id="s-a${i}-tr-stationMaps" value="${escAttr((apt.transport && apt.transport.stationMaps) || '')}" placeholder="https://maps.google.com/..."></div>
          <div class="s-divider"></div>
          <div class="s-sub-title" style="font-size:12px">🚇 Metro</div>
          <div class="s-field" style="flex-direction:row;align-items:center;gap:10px;flex-wrap:wrap">
            <label style="white-space:nowrap">Mostra sezione</label>
            <input type="checkbox" id="s-a${i}-tr-metroEnabled" ${(apt.transport && apt.transport.metroEnabled !== false) ? 'checked' : ''} style="width:auto;accent-color:var(--teal)">
          </div>
          <div class="s-field"><label>Emoji</label><input type="text" id="s-a${i}-tr-metroIcon" value="${escAttr((apt.transport && apt.transport.metroIcon) || '🚇')}" placeholder="🚇" style="max-width:80px"></div>
          <div class="s-field"><label>Descrizione 🇮🇹</label><input type="text" id="s-a${i}-tr-metroIt" value="${escAttr((apt.transport && apt.transport.metroIt) || '')}" placeholder="Fermata più vicina..." onblur="autoTranslateField('s-a${i}-tr-metroIt','s-a${i}-tr-metroEn')"></div>
          <div class="s-field"><label>Descrizione 🇬🇧</label><input type="text" id="s-a${i}-tr-metroEn" value="${escAttr((apt.transport && apt.transport.metroEn) || '')}" placeholder="Nearest stop..."></div>
          <div class="s-field"><label>Link Maps</label><input type="url" id="s-a${i}-tr-metroMaps" value="${escAttr((apt.transport && apt.transport.metroMaps) || '')}" placeholder="https://maps.google.com/..."></div>
          <div class="s-divider"></div>
          <div class="s-sub-title" style="font-size:12px">🚌 Bus</div>
          <div class="s-field" style="flex-direction:row;align-items:center;gap:10px;flex-wrap:wrap">
            <label style="white-space:nowrap">Mostra sezione</label>
            <input type="checkbox" id="s-a${i}-tr-busEnabled" ${(apt.transport && apt.transport.busEnabled !== false) ? 'checked' : ''} style="width:auto;accent-color:var(--teal)">
          </div>
          <div class="s-field"><label>Emoji</label><input type="text" id="s-a${i}-tr-busIcon" value="${escAttr((apt.transport && apt.transport.busIcon) || '🚌')}" placeholder="🚌" style="max-width:80px"></div>
          <div class="s-field"><label>Descrizione 🇮🇹</label><input type="text" id="s-a${i}-tr-busIt" value="${escAttr((apt.transport && apt.transport.busIt) || '')}" placeholder="Linee principali..." onblur="autoTranslateField('s-a${i}-tr-busIt','s-a${i}-tr-busEn')"></div>
          <div class="s-field"><label>Descrizione 🇬🇧</label><input type="text" id="s-a${i}-tr-busEn" value="${escAttr((apt.transport && apt.transport.busEn) || '')}" placeholder="Main lines..."></div>
          <div class="s-field"><label>Link Maps</label><input type="url" id="s-a${i}-tr-busMaps" value="${escAttr((apt.transport && apt.transport.busMaps) || '')}" placeholder="https://maps.google.com/..."></div>
          <div class="s-divider"></div>
          <div class="s-sub-title" style="font-size:12px">🎫 Biglietti</div>
          <div class="s-field"><label>Descrizione 🇮🇹</label><textarea id="s-a${i}-tr-ticketsIt" placeholder="Biglietto singolo: ~€1,50..." onblur="autoTranslateField('s-a${i}-tr-ticketsIt','s-a${i}-tr-ticketsEn')">${escHtml((apt.transport && apt.transport.ticketsIt) || '')}</textarea></div>
          <div class="s-field"><label>Descrizione 🇬🇧</label><textarea id="s-a${i}-tr-ticketsEn">${escHtml((apt.transport && apt.transport.ticketsEn) || '')}</textarea></div>
          <div class="s-divider"></div>
          <div class="s-sub-title" style="font-size:12px">🚖 Taxi &amp; App</div>
          <div class="s-field"><label>Descrizione 🇮🇹</label><textarea id="s-a${i}-tr-taxiIt" placeholder="Taxi ufficiali: trovate i posteggi..." onblur="autoTranslateField('s-a${i}-tr-taxiIt','s-a${i}-tr-taxiEn')">${escHtml((apt.transport && apt.transport.taxiIt) || '')}</textarea></div>
          <div class="s-field"><label>Descrizione 🇬🇧</label><textarea id="s-a${i}-tr-taxiEn">${escHtml((apt.transport && apt.transport.taxiEn) || '')}</textarea></div>
        </div>
        <div class="s-divider"></div>
        <div class="s-sub-title">🧳 Istruzioni Check-out</div>
        <div id="s-a${i}-checkoutSteps" data-count="0"></div>
        <button class="s-add-btn" style="margin-top:8px" onclick="addAptCheckoutStep(${i})">➕ Aggiungi Passo</button>
      </div>`;
    container.appendChild(section);
    renderAptHouseRules(i, apt.houseRules || []);
    renderAptExtraServices(i, apt.extraServices || []);
    renderAptPlaces(i, apt.places || []);
    renderAptRests(i, apt.restaurants || []);
    renderAptSupermarkets(i, apt.supermarkets || []);
    renderAptCheckoutSteps(i, apt.checkoutSteps || []);
  });
}

function collectSettingsApts() {
  const container = document.getElementById('s-apts-container');
  const count = parseInt(container.dataset.count || '0');
  const apts = [];
  for (let i = 0; i < count; i++) {
    const apt = {};
    ['name','address','addressShort','mapsLink','maxGuests','maxGuestsEn','wifi','wifiPass','checkin','checkout','lat','lon',
     'howToReachIt','howToReachEn','howToAccessIt','howToAccessEn','parkingIt','parkingEn',
     'bedroomTagsIt','bedroomTagsEn','kitchenTagsIt','kitchenTagsEn','bathroomTagsIt','bathroomTagsEn'].forEach(k => {
      const el = document.getElementById(`s-a${i}-${k}`);
      if (el) apt[k] = k === 'wifiPass' ? obfuscate(el.value) : el.value; // re-obfuscate WiFi password before storing
    });
    apt.houseRules = collectAptHouseRules(i);
    apt.extraServices = collectAptExtraServices(i);
    apt.places = collectAptPlaces(i);
    apt.restaurants = collectAptRests(i);
    apt.supermarkets = collectAptSupermarkets(i);
    apt.transport = collectAptTransport(i);
    apt.checkoutSteps = collectAptCheckoutSteps(i);
    apts.push(apt);
  }
  return apts;
}

function addSettingsApt() {
  const current = collectSettingsApts();
  const n = current.length + 1;
  current.push({
    name: `Appartamento ${n}`,
    address: '', addressShort: '', mapsLink: '',
    maxGuests: '4 persone', maxGuestsEn: '4 people',
    wifi: '', wifiPass: '',
    checkin: '15:00', checkout: '10:00',
    lat: '', lon: '',
    howToReachIt: '', howToReachEn: '', howToAccessIt: '', howToAccessEn: '', parkingIt: '', parkingEn: '',
    houseRules: [],
    bedroomTagsIt: '', bedroomTagsEn: '', kitchenTagsIt: '', kitchenTagsEn: '', bathroomTagsIt: '', bathroomTagsEn: '',
    extraServices: [],
    places: [],
    restaurants: [],
    supermarkets: [],
    transport: {
      airportEnabled: true, airportIcon: '✈️', airportIt: '', airportEn: '', airportMaps: '',
      stationEnabled: true, stationIcon: '🚉', stationIt: '', stationEn: '', stationMaps: '',
      metroEnabled: true, metroIcon: '🚇', metroIt: '', metroEn: '', metroMaps: '',
      busEnabled: true, busIcon: '🚌', busIt: '', busEn: '', busMaps: '',
      ticketsIt: '', ticketsEn: '', taxiIt: '', taxiEn: ''
    },
    checkoutSteps: []
  });
  renderSettingsApts(current);
  const last = document.getElementById('s-apts-container').lastElementChild;
  if (last) { last.open = true; last.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
}

function removeSettingsApt(idx) {
  const current = collectSettingsApts();
  if (current.length <= 1) { alert('Devi avere almeno un appartamento.'); return; }
  if (!confirm(`Eliminare Appartamento ${idx + 1}? Le modifiche non salvate verranno perse.`)) return;
  current.splice(idx, 1);
  renderSettingsApts(current);
}

// ════════════════════════════════════════════
//  TRANSLATION DICTIONARY (IT→EN fallback)
// ════════════════════════════════════════════
const TRANSLATION_DICT = {
  "Check-in": "Check-in",
  "Check-out": "Check-out",
  "Benvenuti": "Welcome",
  "Benvenuto": "Welcome",
  "Siamo felici di avervi come ospiti": "We are delighted to have you as our guests",
  "Le chiavi sono nella cassetta di sicurezza": "The keys are in the lockbox",
  "La password del WiFi è": "The WiFi password is",
  "In caso di emergenza chiamare": "In case of emergency call",
  "Raccolta differenziata": "Waste sorting",
  "Non fumare": "No smoking",
  "Vietato fumare": "No smoking",
  "Orario di silenzio": "Quiet hours",
  "Riscaldamento": "Heating",
  "Aria condizionata": "Air conditioning",
  "Cucina": "Kitchen",
  "Bagno": "Bathroom",
  "Camera": "Bedroom",
  "Soggiorno": "Living room",
  "Terrazzo": "Terrace",
  "Balcone": "Balcony",
  "Parcheggio": "Parking",
  "Ascensore": "Elevator",
  "Wifi": "WiFi",
  "WiFi": "WiFi",
  "Asciugamani": "Towels",
  "Lenzuola": "Bedsheets",
  "Biancheria": "Linen",
  "Lavatrice": "Washing machine",
  "Lavastoviglie": "Dishwasher",
  "Frigorifero": "Refrigerator",
  "Forno": "Oven",
  "Microonde": "Microwave",
  "Piano cottura": "Hob",
  "Caffettiera": "Coffee maker",
  "Ferro da stiro": "Iron",
  "Phon": "Hair dryer",
  "Asciugacapelli": "Hair dryer",
  "Televisione": "Television",
  "Armadio": "Wardrobe",
  "Cassaforte": "Safe",
  "Grazie per aver scelto il nostro B&B": "Thank you for choosing our B&B",
  "È stato un piacere avervi come ospiti": "It has been a pleasure having you as guests",
  "Per ulteriori informazioni": "For further information",
  "Non esitate a contattarci": "Do not hesitate to contact us",
  "Buon soggiorno": "Enjoy your stay",
  "Buona permanenza": "Enjoy your stay",
  "Stazione": "Train station",
  "Aeroporto": "Airport",
  "Metropolitana": "Metro",
  "Autobus": "Bus",
  "Taxi": "Taxi",
  "Farmacia": "Pharmacy",
  "Ospedale": "Hospital",
  "Supermercato": "Supermarket",
  "Ristorante": "Restaurant",
  "Bar": "Bar",
  "Pizzeria": "Pizzeria",
  "Emergenza": "Emergency",
  "Orario": "Schedule",
  "Prezzo": "Price",
  "Biglietto": "Ticket",
  "Ingresso": "Entrance",
  "Uscita": "Exit",
  "Aperto": "Open",
  "Chiuso": "Closed",
  "Gratuito": "Free",
  "Letto matrimoniale": "Double bed",
  "Letto singolo": "Single bed",
  "Doccia": "Shower",
  "Vasca da bagno": "Bathtub"
};

function translateWithDict(text) {
  const lower = text.trim().toLowerCase();
  for (const [it, en] of Object.entries(TRANSLATION_DICT)) {
    if (it.toLowerCase() === lower) return en;
  }
  for (const [it, en] of Object.entries(TRANSLATION_DICT)) {
    if (lower.includes(it.toLowerCase())) {
      return text.replace(new RegExp(it, 'gi'), en);
    }
  }
  return null;
}

// ════════════════════════════════════════════
//  AUTO-TRANSLATE (Italian → English via MyMemory + dictionary fallback)
// ════════════════════════════════════════════
async function autoTranslateField(itElId, enElId) {
  const itEl = document.getElementById(itElId);
  const enEl = document.getElementById(enElId);
  if (!itEl || !enEl) return;
  const text = itEl.value.trim();
  if (!text) return;
  if (enEl.value.trim()) return;
  const prev = enEl.placeholder;
  enEl.placeholder = '⏳ Traducendo…';
  enEl.disabled = true;
  try {
    const params = new URLSearchParams({ q: text, langpair: 'it|en' });
    const res = await fetch('https://api.mymemory.translated.net/get?' + params.toString());
    const json = await res.json();
    const translated = json && json.responseData && json.responseData.translatedText;
    if (translated && String(json.responseStatus) === '200') {
      enEl.value = translated;
      enEl.disabled = false;
      enEl.placeholder = prev;
      return;
    }
  } catch (e) {
    // fall through to dictionary
  }
  const dictResult = translateWithDict(text);
  if (dictResult) enEl.value = dictResult;
  enEl.disabled = false;
  enEl.placeholder = prev;
}

// ════════════════════════════════════════════
//  SETTINGS: APT HOUSE RULES (dynamic)
// ════════════════════════════════════════════
function renderAptHouseRules(aptIndex, rules) {
  const container = document.getElementById(`s-a${aptIndex}-rules`);
  if (!container) return;
  container.dataset.count = rules.length;
  let html = '';
  rules.forEach((r, j) => {
    html += `
      <div class="s-sub-title s-sub-title-row" style="margin-top:12px">
        <span>Regola ${j + 1}</span>
        <button class="s-remove-btn" onclick="removeAptHouseRule(${aptIndex}, ${j})">🗑️ Rimuovi</button>
      </div>
      <div class="s-field"><label>Icona (emoji)</label><input type="text" id="s-a${aptIndex}-r${j}-icon" value="${escAttr(r.icon || '')}" placeholder="🔇"></div>
      <div class="s-field"><label>Titolo 🇮🇹</label><input type="text" id="s-a${aptIndex}-r${j}-titleIt" value="${escAttr(r.titleIt || '')}" onblur="autoTranslateField('s-a${aptIndex}-r${j}-titleIt','s-a${aptIndex}-r${j}-titleEn')"></div>
      <div class="s-field"><label>Titolo 🇬🇧</label><input type="text" id="s-a${aptIndex}-r${j}-titleEn" value="${escAttr(r.titleEn || '')}"></div>
      <div class="s-field"><label>Descrizione 🇮🇹</label><textarea id="s-a${aptIndex}-r${j}-descIt" onblur="autoTranslateField('s-a${aptIndex}-r${j}-descIt','s-a${aptIndex}-r${j}-descEn')">${escHtml(r.descIt || '')}</textarea></div>
      <div class="s-field"><label>Descrizione 🇬🇧</label><textarea id="s-a${aptIndex}-r${j}-descEn">${escHtml(r.descEn || '')}</textarea></div>`;
  });
  container.innerHTML = html;
}

function collectAptHouseRules(aptIndex) {
  const container = document.getElementById(`s-a${aptIndex}-rules`);
  if (!container) return [];
  const count = parseInt(container.dataset.count || '0');
  const rules = [];
  for (let j = 0; j < count; j++) {
    const rule = {};
    ['icon', 'titleIt', 'titleEn', 'descIt', 'descEn'].forEach(k => {
      const el = document.getElementById(`s-a${aptIndex}-r${j}-${k}`);
      if (el) rule[k] = el.value;
    });
    rules.push(rule);
  }
  return rules;
}

function addAptHouseRule(aptIndex) {
  const current = collectAptHouseRules(aptIndex);
  current.push({ icon: '🏠', titleIt: '', descIt: '' });
  renderAptHouseRules(aptIndex, current);
}

function removeAptHouseRule(aptIndex, ruleIdx) {
  if (!confirm(`Rimuovere la regola ${ruleIdx + 1}?`)) return;
  const current = collectAptHouseRules(aptIndex);
  current.splice(ruleIdx, 1);
  renderAptHouseRules(aptIndex, current);
}

// ════════════════════════════════════════════
//  SETTINGS: APT EXTRA SERVICES (dynamic)
// ════════════════════════════════════════════
function renderAptExtraServices(aptIndex, services) {
  const container = document.getElementById(`s-a${aptIndex}-services`);
  if (!container) return;
  container.dataset.count = services.length;
  let html = '';
  services.forEach((svc, j) => {
    html += `
      <div class="s-sub-title s-sub-title-row" style="margin-top:12px">
        <span>Servizio ${j + 1}</span>
        <button class="s-remove-btn" onclick="removeAptExtraService(${aptIndex}, ${j})">🗑️ Rimuovi</button>
      </div>
      <div class="s-field"><label>Icona (emoji)</label><input type="text" id="s-a${aptIndex}-svc${j}-icon" value="${escAttr(svc.icon || '')}" placeholder="✨"></div>
      <div class="s-field"><label>Nome 🇮🇹</label><input type="text" id="s-a${aptIndex}-svc${j}-nameIt" value="${escAttr(svc.nameIt || '')}" onblur="autoTranslateField('s-a${aptIndex}-svc${j}-nameIt','s-a${aptIndex}-svc${j}-nameEn')"></div>
      <div class="s-field"><label>Nome 🇬🇧</label><input type="text" id="s-a${aptIndex}-svc${j}-nameEn" value="${escAttr(svc.nameEn || '')}"></div>
      <div class="s-field"><label>Descrizione 🇮🇹</label><input type="text" id="s-a${aptIndex}-svc${j}-descIt" value="${escAttr(svc.descIt || '')}" onblur="autoTranslateField('s-a${aptIndex}-svc${j}-descIt','s-a${aptIndex}-svc${j}-descEn')"></div>
      <div class="s-field"><label>Descrizione 🇬🇧</label><input type="text" id="s-a${aptIndex}-svc${j}-descEn" value="${escAttr(svc.descEn || '')}"></div>
`;
  });
  container.innerHTML = html;
}

function collectAptExtraServices(aptIndex) {
  const container = document.getElementById(`s-a${aptIndex}-services`);
  if (!container) return [];
  const count = parseInt(container.dataset.count || '0');
  const services = [];
  for (let j = 0; j < count; j++) {
    const svc = {};
    ['icon', 'nameIt', 'nameEn', 'descIt', 'descEn'].forEach(k => {
      const el = document.getElementById(`s-a${aptIndex}-svc${j}-${k}`);
      if (el) svc[k] = el.value;
    });
    services.push(svc);
  }
  return services;
}

function addAptExtraService(aptIndex) {
  const current = collectAptExtraServices(aptIndex);
  current.push({ icon: '✨', nameIt: '', descIt: '' });
  renderAptExtraServices(aptIndex, current);
}

function removeAptExtraService(aptIndex, svcIdx) {
  if (!confirm(`Rimuovere il servizio ${svcIdx + 1}?`)) return;
  const current = collectAptExtraServices(aptIndex);
  current.splice(svcIdx, 1);
  renderAptExtraServices(aptIndex, current);
}

// ════════════════════════════════════════════
//  SETTINGS: APT PLACES (dynamic, per-apt)
// ════════════════════════════════════════════
function renderAptPlaces(aptIndex, places) {
  const container = document.getElementById(`s-a${aptIndex}-places`);
  if (!container) return;
  container.dataset.count = places.length;
  let html = '';
  places.forEach((p, j) => {
    html += `
      <div class="s-sub-title s-sub-title-row" style="margin-top:12px">
        <span>Luogo ${j + 1}</span>
        <button class="s-remove-btn" onclick="removeAptPlace(${aptIndex}, ${j})">🗑️ Rimuovi</button>
      </div>
      <div class="s-field"><label>Emoji</label><input type="text" id="s-a${aptIndex}-pl${j}-emoji" value="${escAttr(p.emoji || '📍')}" placeholder="📍" style="max-width:80px"></div>
      <div class="s-field"><label>Nome</label><input type="text" id="s-a${aptIndex}-pl${j}-name" value="${escAttr(p.name || '')}"></div>
      <div class="s-field"><label>Descrizione 🇮🇹</label><textarea id="s-a${aptIndex}-pl${j}-descIt" onblur="autoTranslateField('s-a${aptIndex}-pl${j}-descIt','s-a${aptIndex}-pl${j}-descEn')">${escHtml(p.descIt || '')}</textarea></div>
      <div class="s-field"><label>Descrizione 🇬🇧</label><textarea id="s-a${aptIndex}-pl${j}-descEn">${escHtml(p.descEn || '')}</textarea></div>
      <div class="s-field"><label>Come arrivarci 🇮🇹</label><textarea id="s-a${aptIndex}-pl${j}-howIt" onblur="autoTranslateField('s-a${aptIndex}-pl${j}-howIt','s-a${aptIndex}-pl${j}-howEn')">${escHtml(p.howIt || '')}</textarea></div>
      <div class="s-field"><label>Come arrivarci 🇬🇧</label><textarea id="s-a${aptIndex}-pl${j}-howEn">${escHtml(p.howEn || '')}</textarea></div>
      <div class="s-field"><label>Link Maps</label><input type="url" id="s-a${aptIndex}-pl${j}-maps" value="${escAttr(p.maps || '')}"></div>`;
  });
  container.innerHTML = html;
}

function collectAptPlaces(aptIndex) {
  const container = document.getElementById(`s-a${aptIndex}-places`);
  if (!container) return [];
  const count = parseInt(container.dataset.count || '0');
  const places = [];
  for (let j = 0; j < count; j++) {
    const emojiEl = document.getElementById(`s-a${aptIndex}-pl${j}-emoji`);
    const p = { emoji: emojiEl ? emojiEl.value : '📍' };
    ['name', 'descIt', 'descEn', 'howIt', 'howEn', 'maps'].forEach(k => {
      const el = document.getElementById(`s-a${aptIndex}-pl${j}-${k}`);
      if (el) p[k] = el.value.trim();
    });
    places.push(p);
  }
  return places;
}

function addAptPlace(aptIndex) {
  const current = collectAptPlaces(aptIndex);
  current.push({ name: '', emoji: '📍', descIt: '', howIt: '', maps: '#' });
  renderAptPlaces(aptIndex, current);
}

function removeAptPlace(aptIndex, placeIdx) {
  if (!confirm(`Rimuovere il luogo ${placeIdx + 1}?`)) return;
  const current = collectAptPlaces(aptIndex);
  current.splice(placeIdx, 1);
  renderAptPlaces(aptIndex, current);
}

// ════════════════════════════════════════════
//  SETTINGS: APT RESTAURANTS (dynamic, per-apt)
// ════════════════════════════════════════════
function renderAptRests(aptIndex, rests) {
  const container = document.getElementById(`s-a${aptIndex}-restaurants`);
  if (!container) return;
  container.dataset.count = rests.length;
  let html = '';
  rests.forEach((r, j) => {
    html += `
      <div class="s-sub-title s-sub-title-row" style="margin-top:12px">
        <span>Ristorante ${j + 1}</span>
        <button class="s-remove-btn" onclick="removeAptRest(${aptIndex}, ${j})">🗑️ Rimuovi</button>
      </div>
      <div class="s-field"><label>Emoji</label><input type="text" id="s-a${aptIndex}-rt${j}-emoji" value="${escAttr(r.emoji || '🍽️')}" placeholder="🍽️" style="max-width:80px"></div>
      <div class="s-field"><label>Nome</label><input type="text" id="s-a${aptIndex}-rt${j}-name" value="${escAttr(r.name || '')}"></div>
      <div class="s-field"><label>Tipo</label><input type="text" id="s-a${aptIndex}-rt${j}-tipo" value="${escAttr(r.tipo || '')}"></div>
      <div class="s-field"><label>Descrizione 🇮🇹</label><textarea id="s-a${aptIndex}-rt${j}-descIt" onblur="autoTranslateField('s-a${aptIndex}-rt${j}-descIt','s-a${aptIndex}-rt${j}-descEn')">${escHtml(r.descIt || '')}</textarea></div>
      <div class="s-field"><label>Descrizione 🇬🇧</label><textarea id="s-a${aptIndex}-rt${j}-descEn">${escHtml(r.descEn || '')}</textarea></div>
      <div class="s-field"><label>Fascia prezzo</label><input type="text" id="s-a${aptIndex}-rt${j}-price" value="${escAttr(r.price || '')}" placeholder="€ / €€ / €€€"></div>
      <div class="s-field"><label>Link Maps</label><input type="url" id="s-a${aptIndex}-rt${j}-maps" value="${escAttr(r.maps || '')}"></div>`;
  });
  container.innerHTML = html;
}

function collectAptRests(aptIndex) {
  const container = document.getElementById(`s-a${aptIndex}-restaurants`);
  if (!container) return [];
  const count = parseInt(container.dataset.count || '0');
  const rests = [];
  for (let j = 0; j < count; j++) {
    const emojiEl = document.getElementById(`s-a${aptIndex}-rt${j}-emoji`);
    const r = { emoji: emojiEl ? emojiEl.value : '🍽️' };
    ['name', 'tipo', 'descIt', 'descEn', 'price', 'maps'].forEach(k => {
      const el = document.getElementById(`s-a${aptIndex}-rt${j}-${k}`);
      if (el) r[k] = el.value.trim();
    });
    rests.push(r);
  }
  return rests;
}

function addAptRest(aptIndex) {
  const current = collectAptRests(aptIndex);
  current.push({ name: '', emoji: '🍽️', tipo: '', descIt: '', price: '€€', maps: '#' });
  renderAptRests(aptIndex, current);
}

function removeAptRest(aptIndex, restIdx) {
  if (!confirm(`Rimuovere il ristorante ${restIdx + 1}?`)) return;
  const current = collectAptRests(aptIndex);
  current.splice(restIdx, 1);
  renderAptRests(aptIndex, current);
}

// ════════════════════════════════════════════
//  SETTINGS: APT SUPERMARKETS (per-apt)
// ════════════════════════════════════════════
function renderAptSupermarkets(aptIndex, supermarkets) {
  const container = document.getElementById(`s-a${aptIndex}-supermarkets`);
  if (!container) return;
  container.dataset.count = supermarkets.length;
  let html = '';
  supermarkets.forEach((s, j) => {
    html += `
      <div class="s-sub-title s-sub-title-row" style="margin-top:12px">
        <span>Supermercato ${j + 1}</span>
        <button class="s-remove-btn" onclick="removeAptSupermarket(${aptIndex}, ${j})">🗑️ Rimuovi</button>
      </div>
      <div class="s-field"><label>Emoji</label><input type="text" id="s-a${aptIndex}-sm${j}-emoji" value="${escAttr(s.emoji || '🛒')}" placeholder="🛒" style="max-width:80px"></div>
      <div class="s-field"><label>Nome</label><input type="text" id="s-a${aptIndex}-sm${j}-name" value="${escAttr(s.name || '')}"></div>
      <div class="s-field"><label>Tipo</label><input type="text" id="s-a${aptIndex}-sm${j}-tipo" value="${escAttr(s.tipo || '')}"></div>
      <div class="s-field"><label>Descrizione 🇮🇹</label><textarea id="s-a${aptIndex}-sm${j}-descIt" onblur="autoTranslateField('s-a${aptIndex}-sm${j}-descIt','s-a${aptIndex}-sm${j}-descEn')">${escHtml(s.descIt || '')}</textarea></div>
      <div class="s-field"><label>Descrizione 🇬🇧</label><textarea id="s-a${aptIndex}-sm${j}-descEn">${escHtml(s.descEn || '')}</textarea></div>
      <div class="s-field"><label>Fascia prezzo</label><input type="text" id="s-a${aptIndex}-sm${j}-price" value="${escAttr(s.price || '')}" placeholder="€ / €€ / €€€"></div>
      <div class="s-field"><label>Link Maps</label><input type="url" id="s-a${aptIndex}-sm${j}-maps" value="${escAttr(s.maps || '')}"></div>`;
  });
  container.innerHTML = html;
}

function collectAptSupermarkets(aptIndex) {
  const container = document.getElementById(`s-a${aptIndex}-supermarkets`);
  if (!container) return [];
  const count = parseInt(container.dataset.count || '0');
  const supermarkets = [];
  for (let j = 0; j < count; j++) {
    const emojiEl = document.getElementById(`s-a${aptIndex}-sm${j}-emoji`);
    const s = { emoji: emojiEl ? emojiEl.value : '🛒' };
    ['name', 'tipo', 'descIt', 'descEn', 'price', 'maps'].forEach(k => {
      const el = document.getElementById(`s-a${aptIndex}-sm${j}-${k}`);
      if (el) s[k] = el.value.trim();
    });
    supermarkets.push(s);
  }
  return supermarkets;
}

function addAptSupermarket(aptIndex) {
  const current = collectAptSupermarkets(aptIndex);
  current.push({ name: '', emoji: '🛒', tipo: '', descIt: '', descEn: '', price: '', maps: '' });
  renderAptSupermarkets(aptIndex, current);
}

function removeAptSupermarket(aptIndex, smIdx) {
  if (!confirm(`Rimuovere il supermercato ${smIdx + 1}?`)) return;
  const current = collectAptSupermarkets(aptIndex);
  current.splice(smIdx, 1);
  renderAptSupermarkets(aptIndex, current);
}

// ════════════════════════════════════════════
//  SETTINGS: APT TRANSPORT (per-apt)
// ════════════════════════════════════════════
function collectAptTransport(aptIndex) {
  const g = id => document.getElementById(`s-a${aptIndex}-tr-${id}`);
  return {
    airportEnabled: g('airportEnabled') ? g('airportEnabled').checked : true,
    airportIcon:  (g('airportIcon')  || {}).value || '✈️',
    airportIt:    (g('airportIt')    || {}).value || '',
    airportEn:    (g('airportEn')    || {}).value || '',
    airportMaps:  (g('airportMaps')  || {}).value || '',
    stationEnabled: g('stationEnabled') ? g('stationEnabled').checked : true,
    stationIcon:  (g('stationIcon')  || {}).value || '🚉',
    stationIt:    (g('stationIt')    || {}).value || '',
    stationEn:    (g('stationEn')    || {}).value || '',
    stationMaps:  (g('stationMaps')  || {}).value || '',
    metroEnabled: g('metroEnabled') ? g('metroEnabled').checked : true,
    metroIcon:    (g('metroIcon')    || {}).value || '🚇',
    metroIt:      (g('metroIt')      || {}).value || '',
    metroEn:      (g('metroEn')      || {}).value || '',
    metroMaps:    (g('metroMaps')    || {}).value || '',
    busEnabled:   g('busEnabled') ? g('busEnabled').checked : true,
    busIcon:      (g('busIcon')      || {}).value || '🚌',
    busIt:        (g('busIt')        || {}).value || '',
    busEn:        (g('busEn')        || {}).value || '',
    busMaps:      (g('busMaps')      || {}).value || '',
    ticketsIt:    (g('ticketsIt')    || {}).value || '',
    ticketsEn:    (g('ticketsEn')    || {}).value || '',
    taxiIt:       (g('taxiIt')       || {}).value || '',
    taxiEn:       (g('taxiEn')       || {}).value || ''
  };
}

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
      <div class="s-field"><label>Titolo 🇮🇹</label><input type="text" id="s-a${aptIndex}-cs${j}-titleIt" value="${escAttr(step.titleIt || '')}" onblur="autoTranslateField('s-a${aptIndex}-cs${j}-titleIt','s-a${aptIndex}-cs${j}-titleEn')"></div>
      <div class="s-field"><label>Titolo 🇬🇧</label><input type="text" id="s-a${aptIndex}-cs${j}-titleEn" value="${escAttr(step.titleEn || '')}"></div>
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
// ════════════════════════════════════════════
//  SETTINGS: DYNAMIC CONTACTS
// ════════════════════════════════════════════
function renderSettingsContacts(contacts) {
  const container = document.getElementById('s-contacts-fields');
  container.dataset.count = contacts.length;
  container.innerHTML = '';
  let html = '';
  contacts.forEach((c, i) => {
    html += `
      <div class="s-sub-title s-sub-title-row">
        <span>Contatto ${i + 1}</span>
        <button class="s-remove-btn" onclick="removeSettingsContact(${i})">🗑️ Rimuovi</button>
      </div>
      <div class="s-field"><label>Nome</label><input type="text" id="s-c${i}-name" value="${escAttr(c.name || '')}" placeholder="Nome Contatto"></div>
      <div class="s-field"><label>Telefono</label><input type="tel" id="s-c${i}-phone" value="${escAttr(c.phone || '')}" placeholder="+39 000 000 0000"></div>
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
  window.open('https://wa.me/393450307922', '_blank');
  showToast('💬 WhatsApp aperto.', 'success');
}

// ════════════════════════════════════════════
//  HOST PUBLISH: TOKEN PRE-SALVATO DALL'ADMIN
// ════════════════════════════════════════════

async function saveTokenForHost() {
  const tokenInput = document.getElementById('s-github-token');
  const token = (tokenInput && tokenInput.value.trim()) || '';
  if (!token) {
    showToast('⚠️ Inserisci prima il GitHub Token nel campo sopra.', 'error');
    return;
  }
  try {
    const enc = await encryptToken(token);
    localStorage.setItem(HOST_TOKEN_STORE, enc);
    if (tokenInput) { tokenInput.value = ''; tokenInput.placeholder = '[Token salvato ✅]'; }
    showToast('✅ Token cifrato e salvato in modo sicuro nel browser!', 'success');
  } catch (e) {
    showToast('❌ Errore nel salvataggio del token.', 'error');
  }
}

async function hostPublishNow() {
  const btn = document.getElementById('host-publish-btn');

  // Prova a recuperare il token pre-salvato dall'admin (cifrato in localStorage)
  const encTok = localStorage.getItem(HOST_TOKEN_STORE) || '';
  const token = encTok ? await decryptToken(encTok).catch(() => '') : '';

  if (!token) {
    // Fallback: nessun token configurato, usa il vecchio metodo di invio email/JSON
    showToast('⚠️ L\'amministratore non ha ancora configurato la pubblicazione automatica. Invio modifiche via email...', 'info');
    sendChangesAsHost();
    return;
  }

  if (!confirm('Vuoi pubblicare le modifiche online? Saranno visibili a tutti gli ospiti in pochi secondi.')) return;

  // 1. Salva localmente
  const d = collectFormData();
  currentData = d;
  saveData(d);
  renderLanding();

  // 2. Pubblica usando il token pre-salvato
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Pubblicazione…'; }

  try {
    const OWNER = 'ffeliteapartments';
    const REPO = 'guide';
    const DATA_FILE = 'js/data.js';
    const BRANCH = 'main';
    const DATA_API = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${DATA_FILE}`;

    // Get current js/data.js SHA
    const getResp = await fetch(`${DATA_API}?ref=${BRANCH}`, {
      headers: { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github.v3+json' }
    });
    if (!getResp.ok) {
      const e = await getResp.json().catch(() => ({}));
      throw new Error(e.message || `HTTP ${getResp.status}`);
    }
    const fileData = await getResp.json();

    // Build updated js/data.js
    const rawHtml = decodeURIComponent(escape(atob(fileData.content.replace(/\n/g, ''))));
    const jsonStr = JSON.stringify(d, null, 2);
    const updatedHtml = rawHtml.replace(
      /\/\* PUBLISHED_DATA_START \*\/[\s\S]*?\/\* PUBLISHED_DATA_END \*\//,
      '/* PUBLISHED_DATA_START */\nconst PUBLISHED_DATA = ' + jsonStr + ';\n/* PUBLISHED_DATA_END */'
    );

    // Push updated file
    const putResp = await fetch(DATA_API, {
      method: 'PUT',
      headers: { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github.v3+json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: '📱 Aggiornamento guida (host) — ' + new Date().toLocaleDateString('it-IT'),
        content: btoa(unescape(encodeURIComponent(updatedHtml))),
        sha: fileData.sha,
        branch: BRANCH
      })
    });

    if (!putResp.ok) {
      const e = await putResp.json().catch(() => ({}));
      throw new Error(e.message || `HTTP ${putResp.status}`);
    }

    showToast('✅ Pubblicato! Le modifiche saranno online tra qualche secondo.', 'success');
    closeSettings();
  } catch (err) {
    showToast('❌ Errore: ' + (err.message || 'Errore sconosciuto.') + ' Prova a contattare l\'amministratore.', 'error');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '🚀 Pubblica Ora'; }
  }
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
//  QR CODE GENERATOR (embedded)
// ════════════════════════════════════════════
var qrcode=function(){var t=function(t,r){var e=t,n=g[r],o=null,i=0,a=null,u=[],f={},c=function(t,r){o=function(t){for(var r=new Array(t),e=0;e<t;e+=1){r[e]=new Array(t);for(var n=0;n<t;n+=1)r[e][n]=null}return r}(i=4*e+17),l(0,0),l(i-7,0),l(0,i-7),s(),h(),d(t,r),e>=7&&v(t),null==a&&(a=p(e,n,u)),w(a,r)},l=function(t,r){for(var e=-1;e<=7;e+=1)if(!(t+e<=-1||i<=t+e))for(var n=-1;n<=7;n+=1)r+n<=-1||i<=r+n||(o[t+e][r+n]=0<=e&&e<=6&&(0==n||6==n)||0<=n&&n<=6&&(0==e||6==e)||2<=e&&e<=4&&2<=n&&n<=4)},h=function(){for(var t=8;t<i-8;t+=1)null==o[t][6]&&(o[t][6]=t%2==0);for(var r=8;r<i-8;r+=1)null==o[6][r]&&(o[6][r]=r%2==0)},s=function(){for(var t=B.getPatternPosition(e),r=0;r<t.length;r+=1)for(var n=0;n<t.length;n+=1){var i=t[r],a=t[n];if(null==o[i][a])for(var u=-2;u<=2;u+=1)for(var f=-2;f<=2;f+=1)o[i+u][a+f]=-2==u||2==u||-2==f||2==f||0==u&&0==f}},v=function(t){for(var r=B.getBCHTypeNumber(e),n=0;n<18;n+=1){var a=!t&&1==(r>>n&1);o[Math.floor(n/3)][n%3+i-8-3]=a}for(n=0;n<18;n+=1){a=!t&&1==(r>>n&1);o[n%3+i-8-3][Math.floor(n/3)]=a}},d=function(t,r){for(var e=n<<3|r,a=B.getBCHTypeInfo(e),u=0;u<15;u+=1){var f=!t&&1==(a>>u&1);u<6?o[u][8]=f:u<8?o[u+1][8]=f:o[i-15+u][8]=f}for(u=0;u<15;u+=1){f=!t&&1==(a>>u&1);u<8?o[8][i-u-1]=f:u<9?o[8][15-u-1+1]=f:o[8][15-u-1]=f}o[i-8][8]=!t},w=function(t,r){for(var e=-1,n=i-1,a=7,u=0,f=B.getMaskFunction(r),c=i-1;c>0;c-=2)for(6==c&&(c-=1);;){for(var g=0;g<2;g+=1)if(null==o[n][c-g]){var l=!1;u<t.length&&(l=1==(t[u]>>>a&1)),f(n,c-g)&&(l=!l),o[n][c-g]=l,-1==(a-=1)&&(u+=1,a=7)}if((n+=e)<0||i<=n){n-=e,e=-e;break}}},p=function(t,r,e){for(var n=A.getRSBlocks(t,r),o=b(),i=0;i<e.length;i+=1){var a=e[i];o.put(a.getMode(),4),o.put(a.getLength(),B.getLengthInBits(a.getMode(),t)),a.write(o)}var u=0;for(i=0;i<n.length;i+=1)u+=n[i].dataCount;if(o.getLengthInBits()>8*u)throw"code length overflow. ("+o.getLengthInBits()+">"+8*u+")";for(o.getLengthInBits()+4<=8*u&&o.put(0,4);o.getLengthInBits()%8!=0;)o.putBit(!1);for(;!(o.getLengthInBits()>=8*u||(o.put(236,8),o.getLengthInBits()>=8*u));)o.put(17,8);return function(t,r){for(var e=0,n=0,o=0,i=new Array(r.length),a=new Array(r.length),u=0;u<r.length;u+=1){var f=r[u].dataCount,c=r[u].totalCount-f;n=Math.max(n,f),o=Math.max(o,c),i[u]=new Array(f);for(var g=0;g<i[u].length;g+=1)i[u][g]=255&t.getBuffer()[g+e];e+=f;var l=B.getErrorCorrectPolynomial(c),h=k(i[u],l.getLength()-1).mod(l);for(a[u]=new Array(l.getLength()-1),g=0;g<a[u].length;g+=1){var s=g+h.getLength()-a[u].length;a[u][g]=s>=0?h.getAt(s):0}}var v=0;for(g=0;g<r.length;g+=1)v+=r[g].totalCount;var d=new Array(v),w=0;for(g=0;g<n;g+=1)for(u=0;u<r.length;u+=1)g<i[u].length&&(d[w]=i[u][g],w+=1);for(g=0;g<o;g+=1)for(u=0;u<r.length;u+=1)g<a[u].length&&(d[w]=a[u][g],w+=1);return d}(o,n)};f.addData=function(t,r){var e=null;switch(r=r||"Byte"){case"Numeric":e=M(t);break;case"Alphanumeric":e=x(t);break;case"Byte":e=m(t);break;case"Kanji":e=L(t);break;default:throw"mode:"+r}u.push(e),a=null},f.isDark=function(t,r){if(t<0||i<=t||r<0||i<=r)throw t+","+r;return o[t][r]},f.getModuleCount=function(){return i},f.make=function(){if(e<1){for(var t=1;t<40;t++){for(var r=A.getRSBlocks(t,n),o=b(),i=0;i<u.length;i++){var a=u[i];o.put(a.getMode(),4),o.put(a.getLength(),B.getLengthInBits(a.getMode(),t)),a.write(o)}var g=0;for(i=0;i<r.length;i++)g+=r[i].dataCount;if(o.getLengthInBits()<=8*g)break}e=t}c(!1,function(){for(var t=0,r=0,e=0;e<8;e+=1){c(!0,e);var n=B.getLostPoint(f);(0==e||t>n)&&(t=n,r=e)}return r}())},f.createTableTag=function(t,r){t=t||2;var e="";e+='<table style="',e+=" border-width: 0px; border-style: none;",e+=" border-collapse: collapse;",e+=" padding: 0px; margin: "+(r=void 0===r?4*t:r)+"px;",e+='">',e+="<tbody>";for(var n=0;n<f.getModuleCount();n+=1){e+="<tr>";for(var o=0;o<f.getModuleCount();o+=1)e+='<td style="',e+=" border-width: 0px; border-style: none;",e+=" border-collapse: collapse;",e+=" padding: 0px; margin: 0px;",e+=" width: "+t+"px;",e+=" height: "+t+"px;",e+=" background-color: ",e+=f.isDark(n,o)?"#000000":"#ffffff",e+=";",e+='"/>';e+="</tr>"}return e+="</tbody>",e+="</table>"},f.createSvgTag=function(t,r,e,n){var o={};"object"==typeof arguments[0]&&(t=(o=arguments[0]).cellSize,r=o.margin,e=o.alt,n=o.title),t=t||2,r=void 0===r?4*t:r,(e="string"==typeof e?{text:e}:e||{}).text=e.text||null,e.id=e.text?e.id||"qrcode-description":null,(n="string"==typeof n?{text:n}:n||{}).text=n.text||null,n.id=n.text?n.id||"qrcode-title":null;var i,a,u,c,g=f.getModuleCount()*t+2*r,l="";for(c="l"+t+",0 0,"+t+" -"+t+",0 0,-"+t+"z ",l+='<svg version="1.1" xmlns="http://www.w3.org/2000/svg"',l+=o.scalable?"":' width="'+g+'px" height="'+g+'px"',l+=' viewBox="0 0 '+g+" "+g+'" ',l+=' preserveAspectRatio="xMinYMin meet"',l+=n.text||e.text?' role="img" aria-labelledby="'+y([n.id,e.id].join(" ").trim())+'"':"",l+=">",l+=n.text?'<title id="'+y(n.id)+'">'+y(n.text)+"</title>":"",l+=e.text?'<description id="'+y(e.id)+'">'+y(e.text)+"</description>":"",l+='<rect width="100%" height="100%" fill="white" cx="0" cy="0"/>',l+='<path d="',a=0;a<f.getModuleCount();a+=1)for(u=a*t+r,i=0;i<f.getModuleCount();i+=1)f.isDark(a,i)&&(l+="M"+(i*t+r)+","+u+c);return l+='" stroke="transparent" fill="black"/>',l+="</svg>"},f.createDataURL=function(t,r){t=t||2,r=void 0===r?4*t:r;var e=f.getModuleCount()*t+2*r,n=r,o=e-r;return I(e,e,function(r,e){if(n<=r&&r<o&&n<=e&&e<o){var i=Math.floor((r-n)/t),a=Math.floor((e-n)/t);return f.isDark(a,i)?0:1}return 1})},f.createImgTag=function(t,r,e){t=t||2,r=void 0===r?4*t:r;var n=f.getModuleCount()*t+2*r,o="";return o+="<img",o+=' src="',o+=f.createDataURL(t,r),o+='"',o+=' width="',o+=n,o+='"',o+=' height="',o+=n,o+='"',e&&(o+=' alt="',o+=y(e),o+='"'),o+="/>"};var y=function(t){for(var r="",e=0;e<t.length;e+=1){var n=t.charAt(e);switch(n){case"<":r+="&lt;";break;case">":r+="&gt;";break;case"&":r+="&amp;";break;case'"':r+="&quot;";break;default:r+=n}}return r};return f.createASCII=function(t,r){if((t=t||1)<2)return function(t){t=void 0===t?2:t;var r,e,n,o,i,a=1*f.getModuleCount()+2*t,u=t,c=a-t,g={"██":"█","█ ":"▀"," █":"▄","  ":" "},l={"██":"▀","█ ":"▀"," █":" ","  ":" "},h="";for(r=0;r<a;r+=2){for(n=Math.floor((r-u)/1),o=Math.floor((r+1-u)/1),e=0;e<a;e+=1)i="█",u<=e&&e<c&&u<=r&&r<c&&f.isDark(n,Math.floor((e-u)/1))&&(i=" "),u<=e&&e<c&&u<=r+1&&r+1<c&&f.isDark(o,Math.floor((e-u)/1))?i+=" ":i+="█",h+=t<1&&r+1>=c?l[i]:g[i];h+="\n"}return a%2&&t>0?h.substring(0,h.length-a-1)+Array(a+1).join("▀"):h.substring(0,h.length-1)}(r);t-=1,r=void 0===r?2*t:r;var e,n,o,i,a=f.getModuleCount()*t+2*r,u=r,c=a-r,g=Array(t+1).join("██"),l=Array(t+1).join("  "),h="",s="";for(e=0;e<a;e+=1){for(o=Math.floor((e-u)/t),s="",n=0;n<a;n+=1)i=1,u<=n&&n<c&&u<=e&&e<c&&f.isDark(o,Math.floor((n-u)/t))&&(i=0),s+=i?g:l;for(o=0;o<t;o+=1)h+=s+"\n"}return h.substring(0,h.length-1)},f.renderTo2dContext=function(t,r){r=r||2;for(var e=f.getModuleCount(),n=0;n<e;n++)for(var o=0;o<e;o++)t.fillStyle=f.isDark(n,o)?"black":"white",t.fillRect(o*r,n*r,r,r)},f};t.stringToBytes=(t.stringToBytesFuncs={default:function(t){for(var r=[],e=0;e<t.length;e+=1){var n=t.charCodeAt(e);r.push(255&n)}return r}}).default,t.createStringToBytes=function(t,r){var e=function(){for(var e=S(t),n=function(){var t=e.read();if(-1==t)throw"eof";return t},o=0,i={};;){var a=e.read();if(-1==a)break;var u=n(),f=n()<<8|n();i[String.fromCharCode(a<<8|u)]=f,o+=1}if(o!=r)throw o+" != "+r;return i}(),n="?".charCodeAt(0);return function(t){for(var r=[],o=0;o<t.length;o+=1){var i=t.charCodeAt(o);if(i<128)r.push(i);else{var a=e[t.charAt(o)];"number"==typeof a?(255&a)==a?r.push(a):(r.push(a>>>8),r.push(255&a)):r.push(n)}}return r}};var r,e,n,o,i,a=1,u=2,f=4,c=8,g={L:1,M:0,Q:3,H:2},l=0,h=1,s=2,v=3,d=4,w=5,p=6,y=7,B=(r=[[],[6,18],[6,22],[6,26],[6,30],[6,34],[6,22,38],[6,24,42],[6,26,46],[6,28,50],[6,30,54],[6,32,58],[6,34,62],[6,26,46,66],[6,26,48,70],[6,26,50,74],[6,30,54,78],[6,30,56,82],[6,30,58,86],[6,34,62,90],[6,28,50,72,94],[6,26,50,74,98],[6,30,54,78,102],[6,28,54,80,106],[6,32,58,84,110],[6,30,58,86,114],[6,34,62,90,118],[6,26,50,74,98,122],[6,30,54,78,102,126],[6,26,52,78,104,130],[6,30,56,82,108,134],[6,34,60,86,112,138],[6,30,58,86,114,142],[6,34,62,90,118,146],[6,30,54,78,102,126,150],[6,24,50,76,102,128,154],[6,28,54,80,106,132,158],[6,32,58,84,110,136,162],[6,26,54,82,110,138,166],[6,30,58,86,114,142,170]],e=1335,n=7973,i=function(t){for(var r=0;0!=t;)r+=1,t>>>=1;return r},(o={}).getBCHTypeInfo=function(t){for(var r=t<<10;i(r)-i(e)>=0;)r^=e<<i(r)-i(e);return 21522^(t<<10|r)},o.getBCHTypeNumber=function(t){for(var r=t<<12;i(r)-i(n)>=0;)r^=n<<i(r)-i(n);return t<<12|r},o.getPatternPosition=function(t){return r[t-1]},o.getMaskFunction=function(t){switch(t){case l:return function(t,r){return(t+r)%2==0};case h:return function(t,r){return t%2==0};case s:return function(t,r){return r%3==0};case v:return function(t,r){return(t+r)%3==0};case d:return function(t,r){return(Math.floor(t/2)+Math.floor(r/3))%2==0};case w:return function(t,r){return t*r%2+t*r%3==0};case p:return function(t,r){return(t*r%2+t*r%3)%2==0};case y:return function(t,r){return(t*r%3+(t+r)%2)%2==0};default:throw"bad maskPattern:"+t}},o.getErrorCorrectPolynomial=function(t){for(var r=k([1],0),e=0;e<t;e+=1)r=r.multiply(k([1,C.gexp(e)],0));return r},o.getLengthInBits=function(t,r){if(1<=r&&r<10)switch(t){case a:return 10;case u:return 9;case f:case c:return 8;default:throw"mode:"+t}else if(r<27)switch(t){case a:return 12;case u:return 11;case f:return 16;case c:return 10;default:throw"mode:"+t}else{if(!(r<41))throw"type:"+r;switch(t){case a:return 14;case u:return 13;case f:return 16;case c:return 12;default:throw"mode:"+t}}},o.getLostPoint=function(t){for(var r=t.getModuleCount(),e=0,n=0;n<r;n+=1)for(var o=0;o<r;o+=1){for(var i=0,a=t.isDark(n,o),u=-1;u<=1;u+=1)if(!(n+u<0||r<=n+u))for(var f=-1;f<=1;f+=1)o+f<0||r<=o+f||0==u&&0==f||a==t.isDark(n+u,o+f)&&(i+=1);i>5&&(e+=3+i-5)}for(n=0;n<r-1;n+=1)for(o=0;o<r-1;o+=1){var c=0;t.isDark(n,o)&&(c+=1),t.isDark(n+1,o)&&(c+=1),t.isDark(n,o+1)&&(c+=1),t.isDark(n+1,o+1)&&(c+=1),0!=c&&4!=c||(e+=3)}for(n=0;n<r;n+=1)for(o=0;o<r-6;o+=1)t.isDark(n,o)&&!t.isDark(n,o+1)&&t.isDark(n,o+2)&&t.isDark(n,o+3)&&t.isDark(n,o+4)&&!t.isDark(n,o+5)&&t.isDark(n,o+6)&&(e+=40);for(o=0;o<r;o+=1)for(n=0;n<r-6;n+=1)t.isDark(n,o)&&!t.isDark(n+1,o)&&t.isDark(n+2,o)&&t.isDark(n+3,o)&&t.isDark(n+4,o)&&!t.isDark(n+5,o)&&t.isDark(n+6,o)&&(e+=40);var g=0;for(o=0;o<r;o+=1)for(n=0;n<r;n+=1)t.isDark(n,o)&&(g+=1);return e+=Math.abs(100*g/r/r-50)/5*10},o),C=function(){for(var t=new Array(256),r=new Array(256),e=0;e<8;e+=1)t[e]=1<<e;for(e=8;e<256;e+=1)t[e]=t[e-4]^t[e-5]^t[e-6]^t[e-8];for(e=0;e<255;e+=1)r[t[e]]=e;var n={glog:function(t){if(t<1)throw"glog("+t+")";return r[t]},gexp:function(r){for(;r<0;)r+=255;for(;r>=256;)r-=255;return t[r]}};return n}();function k(t,r){if(void 0===t.length)throw t.length+"/"+r;var e=function(){for(var e=0;e<t.length&&0==t[e];)e+=1;for(var n=new Array(t.length-e+r),o=0;o<t.length-e;o+=1)n[o]=t[o+e];return n}(),n={getAt:function(t){return e[t]},getLength:function(){return e.length},multiply:function(t){for(var r=new Array(n.getLength()+t.getLength()-1),e=0;e<n.getLength();e+=1)for(var o=0;o<t.getLength();o+=1)r[e+o]^=C.gexp(C.glog(n.getAt(e))+C.glog(t.getAt(o)));return k(r,0)},mod:function(t){if(n.getLength()-t.getLength()<0)return n;for(var r=C.glog(n.getAt(0))-C.glog(t.getAt(0)),e=new Array(n.getLength()),o=0;o<n.getLength();o+=1)e[o]=n.getAt(o);for(o=0;o<t.getLength();o+=1)e[o]^=C.gexp(C.glog(t.getAt(o))+r);return k(e,0).mod(t)}};return n}var A=function(){var t=[[1,26,19],[1,26,16],[1,26,13],[1,26,9],[1,44,34],[1,44,28],[1,44,22],[1,44,16],[1,70,55],[1,70,44],[2,35,17],[2,35,13],[1,100,80],[2,50,32],[2,50,24],[4,25,9],[1,134,108],[2,67,43],[2,33,15,2,34,16],[2,33,11,2,34,12],[2,86,68],[4,43,27],[4,43,19],[4,43,15],[2,98,78],[4,49,31],[2,32,14,4,33,15],[4,39,13,1,40,14],[2,121,97],[2,60,38,2,61,39],[4,40,18,2,41,19],[4,40,14,2,41,15],[2,146,116],[3,58,36,2,59,37],[4,36,16,4,37,17],[4,36,12,4,37,13],[2,86,68,2,87,69],[4,69,43,1,70,44],[6,43,19,2,44,20],[6,43,15,2,44,16],[4,101,81],[1,80,50,4,81,51],[4,50,22,4,51,23],[3,36,12,8,37,13],[2,116,92,2,117,93],[6,58,36,2,59,37],[4,46,20,6,47,21],[7,42,14,4,43,15],[4,133,107],[8,59,37,1,60,38],[8,44,20,4,45,21],[12,33,11,4,34,12],[3,145,115,1,146,116],[4,64,40,5,65,41],[11,36,16,5,37,17],[11,36,12,5,37,13],[5,109,87,1,110,88],[5,65,41,5,66,42],[5,54,24,7,55,25],[11,36,12,7,37,13],[5,122,98,1,123,99],[7,73,45,3,74,46],[15,43,19,2,44,20],[3,45,15,13,46,16],[1,135,107,5,136,108],[10,74,46,1,75,47],[1,50,22,15,51,23],[2,42,14,17,43,15],[5,150,120,1,151,121],[9,69,43,4,70,44],[17,50,22,1,51,23],[2,42,14,19,43,15],[3,141,113,4,142,114],[3,70,44,11,71,45],[17,47,21,4,48,22],[9,39,13,16,40,14],[3,135,107,5,136,108],[3,67,41,13,68,42],[15,54,24,5,55,25],[15,43,15,10,44,16],[4,144,116,4,145,117],[17,68,42],[17,50,22,6,51,23],[19,46,16,6,47,17],[2,139,111,7,140,112],[17,74,46],[7,54,24,16,55,25],[34,37,13],[4,151,121,5,152,122],[4,75,47,14,76,48],[11,54,24,14,55,25],[16,45,15,14,46,16],[6,147,117,4,148,118],[6,73,45,14,74,46],[11,54,24,16,55,25],[30,46,16,2,47,17],[8,132,106,4,133,107],[8,75,47,13,76,48],[7,54,24,22,55,25],[22,45,15,13,46,16],[10,142,114,2,143,115],[19,74,46,4,75,47],[28,50,22,6,51,23],[33,46,16,4,47,17],[8,152,122,4,153,123],[22,73,45,3,74,46],[8,53,23,26,54,24],[12,45,15,28,46,16],[3,147,117,10,148,118],[3,73,45,23,74,46],[4,54,24,31,55,25],[11,45,15,31,46,16],[7,146,116,7,147,117],[21,73,45,7,74,46],[1,53,23,37,54,24],[19,45,15,26,46,16],[5,145,115,10,146,116],[19,75,47,10,76,48],[15,54,24,25,55,25],[23,45,15,25,46,16],[13,145,115,3,146,116],[2,74,46,29,75,47],[42,54,24,1,55,25],[23,45,15,28,46,16],[17,145,115],[10,74,46,23,75,47],[10,54,24,35,55,25],[19,45,15,35,46,16],[17,145,115,1,146,116],[14,74,46,21,75,47],[29,54,24,19,55,25],[11,45,15,46,46,16],[13,145,115,6,146,116],[14,74,46,23,75,47],[44,54,24,7,55,25],[59,46,16,1,47,17],[12,151,121,7,152,122],[12,75,47,26,76,48],[39,54,24,14,55,25],[22,45,15,41,46,16],[6,151,121,14,152,122],[6,75,47,34,76,48],[46,54,24,10,55,25],[2,45,15,64,46,16],[17,152,122,4,153,123],[29,74,46,14,75,47],[49,54,24,10,55,25],[24,45,15,46,46,16],[4,152,122,18,153,123],[13,74,46,32,75,47],[48,54,24,14,55,25],[42,45,15,32,46,16],[20,147,117,4,148,118],[40,75,47,7,76,48],[43,54,24,22,55,25],[10,45,15,67,46,16],[19,148,118,6,149,119],[18,75,47,31,76,48],[34,54,24,34,55,25],[20,45,15,61,46,16]],r=function(t,r){var e={};return e.totalCount=t,e.dataCount=r,e},e={};return e.getRSBlocks=function(e,n){var o=function(r,e){switch(e){case g.L:return t[4*(r-1)+0];case g.M:return t[4*(r-1)+1];case g.Q:return t[4*(r-1)+2];case g.H:return t[4*(r-1)+3];default:return}}(e,n);if(void 0===o)throw"bad rs block @ typeNumber:"+e+"/errorCorrectionLevel:"+n;for(var i=o.length/3,a=[],u=0;u<i;u+=1)for(var f=o[3*u+0],c=o[3*u+1],l=o[3*u+2],h=0;h<f;h+=1)a.push(r(c,l));return a},e}(),b=function(){var t=[],r=0,e={getBuffer:function(){return t},getAt:function(r){var e=Math.floor(r/8);return 1==(t[e]>>>7-r%8&1)},put:function(t,r){for(var n=0;n<r;n+=1)e.putBit(1==(t>>>r-n-1&1))},getLengthInBits:function(){return r},putBit:function(e){var n=Math.floor(r/8);t.length<=n&&t.push(0),e&&(t[n]|=128>>>r%8),r+=1}};return e},M=function(t){var r=a,e=t,n={getMode:function(){return r},getLength:function(t){return e.length},write:function(t){for(var r=e,n=0;n+2<r.length;)t.put(o(r.substring(n,n+3)),10),n+=3;n<r.length&&(r.length-n==1?t.put(o(r.substring(n,n+1)),4):r.length-n==2&&t.put(o(r.substring(n,n+2)),7))}},o=function(t){for(var r=0,e=0;e<t.length;e+=1)r=10*r+i(t.charAt(e));return r},i=function(t){if("0"<=t&&t<="9")return t.charCodeAt(0)-"0".charCodeAt(0);throw"illegal char :"+t};return n},x=function(t){var r=u,e=t,n={getMode:function(){return r},getLength:function(t){return e.length},write:function(t){for(var r=e,n=0;n+1<r.length;)t.put(45*o(r.charAt(n))+o(r.charAt(n+1)),11),n+=2;n<r.length&&t.put(o(r.charAt(n)),6)}},o=function(t){if("0"<=t&&t<="9")return t.charCodeAt(0)-"0".charCodeAt(0);if("A"<=t&&t<="Z")return t.charCodeAt(0)-"A".charCodeAt(0)+10;switch(t){case" ":return 36;case"$":return 37;case"%":return 38;case"*":return 39;case"+":return 40;case"-":return 41;case".":return 42;case"/":return 43;case":":return 44;default:throw"illegal char :"+t}};return n},m=function(r){var e=f,n=t.stringToBytes(r),o={getMode:function(){return e},getLength:function(t){return n.length},write:function(t){for(var r=0;r<n.length;r+=1)t.put(n[r],8)}};return o},L=function(r){var e=c,n=t.stringToBytesFuncs.SJIS;if(!n)throw"sjis not supported.";!function(){var t=n("友");if(2!=t.length||38726!=(t[0]<<8|t[1]))throw"sjis not supported."}();var o=n(r),i={getMode:function(){return e},getLength:function(t){return~~(o.length/2)},write:function(t){for(var r=o,e=0;e+1<r.length;){var n=(255&r[e])<<8|255&r[e+1];if(33088<=n&&n<=40956)n-=33088;else{if(!(57408<=n&&n<=60351))throw"illegal char at "+(e+1)+"/"+n;n-=49472}n=192*(n>>>8&255)+(255&n),t.put(n,13),e+=2}if(e<r.length)throw"illegal char at "+(e+1)}};return i},D=function(){var t=[],r={writeByte:function(r){t.push(255&r)},writeShort:function(t){r.writeByte(t),r.writeByte(t>>>8)},writeBytes:function(t,e,n){e=e||0,n=n||t.length;for(var o=0;o<n;o+=1)r.writeByte(t[o+e])},writeString:function(t){for(var e=0;e<t.length;e+=1)r.writeByte(t.charCodeAt(e))},toByteArray:function(){return t},toString:function(){var r="";r+="[";for(var e=0;e<t.length;e+=1)e>0&&(r+=","),r+=t[e];return r+="]"}};return r},S=function(t){var r=t,e=0,n=0,o=0,i={read:function(){for(;o<8;){if(e>=r.length){if(0==o)return-1;throw"unexpected end of file./"+o}var t=r.charAt(e);if(e+=1,"="==t)return o=0,-1;t.match(/^\s$/)||(n=n<<6|a(t.charCodeAt(0)),o+=6)}var i=n>>>o-8&255;return o-=8,i}},a=function(t){if(65<=t&&t<=90)return t-65;if(97<=t&&t<=122)return t-97+26;if(48<=t&&t<=57)return t-48+52;if(43==t)return 62;if(47==t)return 63;throw"c:"+t};return i},I=function(t,r,e){for(var n=function(t,r){var e=t,n=r,o=new Array(t*r),i={setPixel:function(t,r,n){o[r*e+t]=n},write:function(t){t.writeString("GIF87a"),t.writeShort(e),t.writeShort(n),t.writeByte(128),t.writeByte(0),t.writeByte(0),t.writeByte(0),t.writeByte(0),t.writeByte(0),t.writeByte(255),t.writeByte(255),t.writeByte(255),t.writeString(","),t.writeShort(0),t.writeShort(0),t.writeShort(e),t.writeShort(n),t.writeByte(0);var r=a(2);t.writeByte(2);for(var o=0;r.length-o>255;)t.writeByte(255),t.writeBytes(r,o,255),o+=255;t.writeByte(r.length-o),t.writeBytes(r,o,r.length-o),t.writeByte(0),t.writeString(";")}},a=function(t){for(var r=1<<t,e=1+(1<<t),n=t+1,i=u(),a=0;a<r;a+=1)i.add(String.fromCharCode(a));i.add(String.fromCharCode(r)),i.add(String.fromCharCode(e));var f,c,g,l=D(),h=(f=l,c=0,g=0,{write:function(t,r){if(t>>>r!=0)throw"length over";for(;c+r>=8;)f.writeByte(255&(t<<c|g)),r-=8-c,t>>>=8-c,g=0,c=0;g|=t<<c,c+=r},flush:function(){c>0&&f.writeByte(g)}});h.write(r,n);var s=0,v=String.fromCharCode(o[s]);for(s+=1;s<o.length;){var d=String.fromCharCode(o[s]);s+=1,i.contains(v+d)?v+=d:(h.write(i.indexOf(v),n),i.size()<4095&&(i.size()==1<<n&&(n+=1),i.add(v+d)),v=d)}return h.write(i.indexOf(v),n),h.write(e,n),h.flush(),l.toByteArray()},u=function(){var t={},r=0,e={add:function(n){if(e.contains(n))throw"dup key:"+n;t[n]=r,r+=1},size:function(){return r},indexOf:function(r){return t[r]},contains:function(r){return void 0!==t[r]}};return e};return i}(t,r),o=0;o<r;o+=1)for(var i=0;i<t;i+=1)n.setPixel(i,o,e(i,o));var a=D();n.write(a);for(var u=function(){var t=0,r=0,e=0,n="",o={},i=function(t){n+=String.fromCharCode(a(63&t))},a=function(t){if(t<0);else{if(t<26)return 65+t;if(t<52)return t-26+97;if(t<62)return t-52+48;if(62==t)return 43;if(63==t)return 47}throw"n:"+t};return o.writeByte=function(n){for(t=t<<8|255&n,r+=8,e+=1;r>=6;)i(t>>>r-6),r-=6},o.flush=function(){if(r>0&&(i(t<<6-r),t=0,r=0),e%3!=0)for(var o=3-e%3,a=0;a<o;a+=1)n+="="},o.toString=function(){return n},o}(),f=a.toByteArray(),c=0;c<f.length;c+=1)u.writeByte(f[c]);return u.flush(),"data:image/gif;base64,"+u};return t}();qrcode.stringToBytesFuncs["UTF-8"]=function(t){return function(t){for(var r=[],e=0;e<t.length;e++){var n=t.charCodeAt(e);n<128?r.push(n):n<2048?r.push(192|n>>6,128|63&n):n<55296||n>=57344?r.push(224|n>>12,128|n>>6&63,128|63&n):(e++,n=65536+((1023&n)<<10|1023&t.charCodeAt(e)),r.push(240|n>>18,128|n>>12&63,128|n>>6&63,128|63&n))}return r}(t)},function(t){"function"==typeof define&&define.amd?define([],t):"object"==typeof exports&&(module.exports=t())}(function(){return qrcode});

// ════════════════════════════════════════════
//  QR CODE SECTION
// ════════════════════════════════════════════
function getGuideBaseUrl() {
  return (currentData && currentData.qrBaseUrl && currentData.qrBaseUrl.trim())
    ? currentData.qrBaseUrl.trim()
    : window.location.origin + window.location.pathname;
}

function renderQrSection() {
  const grid = document.getElementById('qr-grid');
  if (!grid) return;
  const apts = (currentData && currentData.apts) || [];
  const base = getGuideBaseUrl();
  grid.innerHTML = '';
  if (!apts.length) {
    grid.innerHTML = '<p style="color:var(--text2);font-size:12px">Nessun appartamento configurato.</p>';
    return;
  }
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
      + '<p style="font-family:serif;font-size:16px;color:#c9a84c;margin-bottom:8px">' + name + '</p>'
      + (dataUrl ? '<img src="' + dataUrl + '" style="width:200px;height:200px">' : '')
      + '<p style="font-size:10px;color:#666;margin-top:8px;word-break:break-all;max-width:200px">' + url + '</p>'
      + '</div>';
  });
  var win = window.open('', '_blank', 'noopener');
  if (!win) return;
  win.document.write('<html><head><title>QR Codes</title><style>body{background:#fff;text-align:center;padding:20px}@media print{@page{margin:1cm}}</style></head><body>' + items + '</body></html>');
  win.document.close();
  win.focus();
  setTimeout(function() { win.print(); }, 300);
}


async function changeRecoveryWord() {
  const currentWord = document.getElementById('s-recovery-current').value;
  const newWord = document.getElementById('s-recovery-new').value;
  const msg = document.getElementById('s-recovery-msg');
  const showErr = text => { msg.style.color = 'var(--accent)'; msg.textContent = '❌ ' + text; };
  const showOk = text => { msg.style.color = 'var(--teal)'; msg.textContent = '✅ ' + text; };
  if (!currentWord) { showErr('Inserisci la parola attuale.'); return; }
  const currentHash = await hashPin(currentWord);
  if (currentHash !== getStoredRecoveryHash()) { showErr('Parola attuale non corretta.'); return; }
  if (!newWord) { showErr('La nuova parola non può essere vuota.'); return; }
  const newHash = await hashPin(newWord);
  localStorage.setItem(RECOVERY_KEY, newHash);
  document.getElementById('s-recovery-current').value = '';
  document.getElementById('s-recovery-new').value = '';
  showOk('Parola di recovery aggiornata!');
  setTimeout(() => { msg.textContent = ''; }, 3000);
}

// ════════════════════════════════════════════
//  GITHUB TOKEN REMOVAL
// ════════════════════════════════════════════
function removeGithubToken() {
  localStorage.removeItem(TOKEN_STORE);
  localStorage.removeItem(HOST_TOKEN_STORE);
  const field = document.getElementById('s-github-token');
  if (field) { field.value = ''; field.placeholder = 'ghp_...'; }
  const msg = document.getElementById('s-publish-msg');
  if (msg) { msg.style.color = 'var(--teal)'; msg.textContent = '✅ Token rimosso.'; setTimeout(() => { msg.textContent = ''; }, 2000); }
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
