// ════════════════════════════════════════════
//  SETTINGS: PUBLISH & SECURITY
// ════════════════════════════════════════════

function getGitHubOwnerRepo() {
  const qrBase = (currentData && currentData.qrBaseUrl) ? currentData.qrBaseUrl.trim() : '';
  const m = qrBase.match(/^https?:\/\/([^.]+)\.github\.io\/([^/?#]+)/);
  if (m) return { owner: m[1], repo: m[2] };
  return { owner: 'ffeliteapartments', repo: 'guide' };
}

async function publishOnline() {
  const tokenInput = document.getElementById('s-github-token');
  const typedToken = tokenInput && tokenInput.value.trim();
  let token = typedToken || '';
  if (!token) {
    const enc = localStorage.getItem(HOST_TOKEN_STORE);
    if (enc) token = await decryptToken(enc).catch(() => '');
  }
  const msg = document.getElementById('s-publish-msg');

  if (!token) {
    showErr(msg, 'Inserisci il GitHub Token nella sezione Sicurezza PIN prima di pubblicare.');
    return;
  }
  // Persist token encrypted for future use
  encryptToken(token).then(enc => localStorage.setItem(HOST_TOKEN_STORE, enc)).catch(() => {});

  const btn = document.getElementById('publish-btn');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Pubblicazione…'; }
  if (msg) msg.textContent = '';

  try {
    const { owner: OWNER, repo: REPO } = getGitHubOwnerRepo();
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
    showOk(msg, '✅ Pubblicato! Le modifiche saranno live tra qualche secondo.');
    showToast('Pubblicato online!', 'success');
    addChangelogEntry('Pubblicazione online (admin)', 'admin');
    setTimeout(() => { if (msg) msg.innerHTML = ''; }, 12000);
    } catch(innerErr) {
      clearInterval(timerInterval);
      throw innerErr;
    }
  } catch (err) {
    showErr(msg, err.message || 'Errore sconosciuto.');
    showToast(err.message || 'Errore di pubblicazione', 'error');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '🚀 Pubblica Online'; }
  }
}

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
    const { owner: OWNER, repo: REPO } = getGitHubOwnerRepo();
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

async function changeRecoveryWord() {
  const currentWord = document.getElementById('s-recovery-current').value;
  const newWord = document.getElementById('s-recovery-new').value;
  const msg = document.getElementById('s-recovery-msg');
  if (!currentWord) { showErr(msg, 'Inserisci la parola attuale.'); return; }
  const currentHash = await hashPin(currentWord);
  if (currentHash !== getStoredRecoveryHash()) { showErr(msg, 'Parola attuale non corretta.'); return; }
  if (!newWord) { showErr(msg, 'La nuova parola non può essere vuota.'); return; }
  const newHash = await hashPin(newWord);
  localStorage.setItem(RECOVERY_KEY, newHash);
  document.getElementById('s-recovery-current').value = '';
  document.getElementById('s-recovery-new').value = '';
  showOk(msg, 'Parola di recovery aggiornata!');
  setTimeout(() => { msg.textContent = ''; }, 3000);
}

function removeGithubToken() {
  localStorage.removeItem(TOKEN_STORE);
  localStorage.removeItem(HOST_TOKEN_STORE);
  const field = document.getElementById('s-github-token');
  if (field) { field.value = ''; field.placeholder = 'ghp_...'; }
  const msg = document.getElementById('s-publish-msg');
  if (msg) { msg.style.color = 'var(--teal)'; msg.textContent = '✅ Token rimosso.'; setTimeout(() => { msg.textContent = ''; }, 2000); }
}
