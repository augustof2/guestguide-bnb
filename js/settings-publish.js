// ════════════════════════════════════════════
//  SETTINGS: PUBLISH & SECURITY
// ════════════════════════════════════════════

function getGitHubOwnerRepo() {
  const qrBase = (currentData && currentData.qrBaseUrl) ? currentData.qrBaseUrl.trim() : '';
  const m = qrBase.match(/^https?:\/\/([^.]+)\.github\.io\/([^/?#]+)/);
  if (m) return { owner: m[1], repo: m[2] };
  return null; // No fallback — must be configured
}

// ── Shared GitHub commit helper ───────────────────────────────────────────────
// Fetches js/data.js, patches it, and pushes the result back to GitHub.
// patchHashes: when true, also patches PIN/user/pass/recovery hashes (admin flow).

async function _commitDataToGitHub(token, dataObj, commitMessage, patchHashes) {
  const ownerRepo = getGitHubOwnerRepo();
  if (!ownerRepo) {
    throw new Error('⚠️ Configura prima il "QR Base URL" (es: https://tuonome.github.io/guide) nelle impostazioni.');
  }
  const { owner: OWNER, repo: REPO } = ownerRepo;
  const DATA_FILE = 'js/data.js';
  const BRANCH    = 'main';
  const DATA_API  = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${DATA_FILE}`;

  // 1. Fetch current file (need SHA for the PUT)
  const getResp = await fetch(`${DATA_API}?ref=${BRANCH}`, {
    headers: { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github.v3+json' }
  });
  if (!getResp.ok) {
    const e = await getResp.json().catch(() => ({}));
    throw new Error(e.message || `HTTP ${getResp.status}`);
  }
  const fileData = await getResp.json();
  let newContent = decodeURIComponent(escape(atob(fileData.content.replace(/\n/g, ''))));

  // 2. Optionally patch credential hashes (admin only)
  if (patchHashes) {
    const pinHash = getStoredPinHash();
    newContent = newContent.replace(
      /\/\* DEFAULT_PIN_HASH_START \*\/[\s\S]*?\/\* DEFAULT_PIN_HASH_END \*\//,
      `/* DEFAULT_PIN_HASH_START */\nconst DEFAULT_PIN_HASH = deobfuscateHash('${obfuscateHash(pinHash)}');\n/* DEFAULT_PIN_HASH_END */`
    );
    const userHash = getStoredUserHash();
    newContent = newContent.replace(
      /\/\* DEFAULT_USER_HASH_START \*\/[\s\S]*?\/\* DEFAULT_USER_HASH_END \*\//,
      `/* DEFAULT_USER_HASH_START */\nconst DEFAULT_USER_HASH = deobfuscateHash('${obfuscateHash(userHash)}');\n/* DEFAULT_USER_HASH_END */`
    );
    const passHash = getStoredPassHash();
    newContent = newContent.replace(
      /\/\* DEFAULT_PASS_HASH_START \*\/[\s\S]*?\/\* DEFAULT_PASS_HASH_END \*\//,
      `/* DEFAULT_PASS_HASH_START */\nconst DEFAULT_PASS_HASH = deobfuscateHash('${obfuscateHash(passHash)}');\n/* DEFAULT_PASS_HASH_END */`
    );
    const recoveryHash = getStoredRecoveryHash();
    newContent = newContent.replace(
      /\/\* DEFAULT_RECOVERY_HASH_START \*\/[\s\S]*?\/\* DEFAULT_RECOVERY_HASH_END \*\//,
      `/* DEFAULT_RECOVERY_HASH_START */\nconst DEFAULT_RECOVERY_HASH = deobfuscateHash('${obfuscateHash(recoveryHash)}');\n/* DEFAULT_RECOVERY_HASH_END */`
    );
  }

  // 3. Patch PUBLISHED_DATA
  const dataStr = JSON.stringify(dataObj, null, 2);
  newContent = newContent.replace(
    /\/\* PUBLISHED_DATA_START \*\/[\s\S]*?\/\* PUBLISHED_DATA_END \*\//,
    `/* PUBLISHED_DATA_START */\nconst PUBLISHED_DATA = ${dataStr};\n/* PUBLISHED_DATA_END */`
  );

  // 4. Push
  const newContentB64 = btoa(unescape(encodeURIComponent(newContent)));
  const putResp = await fetch(DATA_API, {
    method: 'PUT',
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: commitMessage,
      content: newContentB64,
      sha: fileData.sha,
      branch: BRANCH
    })
  });
  if (!putResp.ok) {
    const e = await putResp.json().catch(() => ({}));
    throw new Error(e.message || `HTTP ${putResp.status}`);
  }
  return { owner: OWNER, repo: REPO };
}

// ── Shared SW cache version bump helper ──────────────────────────────────────
// Fetches sw.js from GitHub, increments CACHE_VERSION, and pushes it back.
// Non-fatal: errors are silently swallowed so the caller's main flow continues.

async function _bumpSwCacheVersion(token, owner, repo, branch) {
  const SW_FILE = 'sw.js';
  const SW_API = `https://api.github.com/repos/${owner}/${repo}/contents/${SW_FILE}`;
  const swGetResp = await fetch(`${SW_API}?ref=${branch}`, {
    headers: { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github.v3+json' }
  });
  if (!swGetResp.ok) return;
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
      branch: branch
    })
  });
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
    const ownerRepo = getGitHubOwnerRepo();
    if (!ownerRepo) {
      showErr(msg, '⚠️ Configura prima il "QR Base URL" (es: https://tuonome.github.io/guide) nelle impostazioni.');
      if (btn) { btn.disabled = false; btn.textContent = '🚀 Pubblica Online'; }
      return;
    }
    const { owner: OWNER, repo: REPO } = ownerRepo;
    const BRANCH = 'main';

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
      if (state === 'active') {
        const icon = el.querySelector('.deploy-step-icon');
        if (icon) icon.innerHTML = '<div class="deploy-spinner"></div>';
      }
    };
    const deployStart = Date.now();
    const timerInterval = setInterval(() => {
      const el = document.getElementById('deploy-timer');
      if (el) el.textContent = ((Date.now() - deployStart) / 1000).toFixed(1) + 's';
    }, 100);

    try {
      setStep('step-fetch', 'active');

      await _commitDataToGitHub(
        token,
        await collectFormData(),
        'Aggiorna guida e PIN [via admin panel]',
        true /* patchHashes */
      );

      setStep('step-fetch', 'done');
      setStep('step-patch', 'active');
      setStep('step-patch', 'done');
      setStep('step-upload', 'done');
      setStep('step-deploy', 'active');

      // Patch CACHE_VERSION in sw.js
      try {
        await _bumpSwCacheVersion(token, OWNER, REPO, BRANCH);
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
  const msg = document.getElementById('s-publish-msg');

  // Prova a recuperare il token pre-salvato dall'admin (cifrato in localStorage)
  const encTok = localStorage.getItem(HOST_TOKEN_STORE) || '';
  const token = encTok ? await decryptToken(encTok).catch(() => '') : '';

  if (!token) {
    // Nessun token: mostra errore nel pannello (stesso stile dell'admin) invece di aprire WhatsApp silenziosamente
    showErr(msg, '⚠️ La pubblicazione automatica non è ancora configurata. Chiedi all\'amministratore di salvare il token GitHub nella sezione Sicurezza, poi riprova.');
    showToast('⚠️ Pubblicazione automatica non configurata.', 'info');
    return;
  }

  if (!confirm('Vuoi pubblicare le modifiche online? Saranno visibili a tutti gli ospiti in pochi secondi.')) return;

  // Mostra subito lo stato di caricamento, prima di qualsiasi operazione asincrona
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Pubblicazione…'; }
  if (msg) msg.textContent = '';

  // 1. Salva localmente
  const d = await collectFormData();
  currentData = d;
  saveData(d);
  renderLanding();

  // Show deploy progress steps
  const deploySteps = [
    { id: 'hstep-fetch',  label: 'Recupero file dal server...', icon: '📡' },
    { id: 'hstep-patch',  label: 'Applicazione modifiche...',   icon: '✏️' },
    { id: 'hstep-upload', label: 'Caricamento su GitHub...',    icon: '⬆️' },
    { id: 'hstep-deploy', label: 'Avvio deploy su GitHub Pages...', icon: '🚀' }
  ];
  if (msg) {
    msg.innerHTML = '<div class="deploy-steps">' +
      deploySteps.map(s => `<div class="deploy-step" id="${s.id}"><div class="deploy-step-icon">${s.icon}</div><div class="deploy-step-label">${s.label}</div></div>`).join('') +
      '<div class="deploy-timer" id="hdeploy-timer"></div>' +
      '</div>';
  }
  const setStep = (id, state) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('active', 'done', 'error');
    el.classList.add(state);
    if (state === 'active') {
      const icon = el.querySelector('.deploy-step-icon');
      if (icon) icon.innerHTML = '<div class="deploy-spinner"></div>';
    }
  };
  const deployStart = Date.now();
  const timerInterval = setInterval(() => {
    const el = document.getElementById('hdeploy-timer');
    if (el) el.textContent = ((Date.now() - deployStart) / 1000).toFixed(1) + 's';
  }, 100);

  try {
    setStep('hstep-fetch', 'active');

    await _commitDataToGitHub(
      token,
      d,
      '📱 Aggiornamento guida (host) — ' + new Date().toLocaleDateString('it-IT'),
      false /* patchHashes */
    );

    // Patch CACHE_VERSION in sw.js
    try {
      const ownerRepo = getGitHubOwnerRepo();
      if (ownerRepo) await _bumpSwCacheVersion(token, ownerRepo.owner, ownerRepo.repo, 'main');
    } catch(swErr) { /* Non-fatal: SW cache patch failed */ }

    setStep('hstep-fetch', 'done');
    setStep('hstep-patch', 'active');
    setStep('hstep-patch', 'done');
    setStep('hstep-upload', 'active');
    setStep('hstep-upload', 'done');
    setStep('hstep-deploy', 'active');
    setTimeout(() => { setStep('hstep-deploy', 'done'); }, 1500);

    clearInterval(timerInterval);
    showOk(msg, '✅ Pubblicato! Le modifiche saranno online tra qualche secondo.');
    showToast('✅ Pubblicato! Le modifiche saranno online tra qualche secondo.', 'success');
    addChangelogEntry('Pubblicazione online (host)', 'host');
    setTimeout(() => { if (msg) msg.innerHTML = ''; closeSettings(); }, 3000);
  } catch (err) {
    clearInterval(timerInterval);
    showErr(msg, '❌ Errore: ' + (err.message || 'Errore sconosciuto.') + ' Prova a contattare l\'amministratore.');
    showToast('❌ Errore: ' + (err.message || 'Errore sconosciuto.'), 'error');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '🚀 Pubblica Ora'; }
  }
}

async function changeRecoveryWord() {
  const currentWord = document.getElementById('s-recovery-current').value;
  const newWord = document.getElementById('s-recovery-new').value;
  const msg = document.getElementById('s-recovery-msg');
  if (!currentWord) { showErr(msg, 'Inserisci la parola attuale.'); return; }
  if (!await verifyPin(currentWord, getStoredRecoveryHash())) { showErr(msg, 'Parola attuale non corretta.'); return; }
  if (!newWord) { showErr(msg, 'La nuova parola non può essere vuota.'); return; }
  const newHash = await hashPin(newWord);
  localStorage.setItem(RECOVERY_KEY, newHash);
  document.getElementById('s-recovery-current').value = '';
  document.getElementById('s-recovery-new').value = '';
  showOk(msg, 'Parola di recovery aggiornata!');
  setTimeout(() => { msg.textContent = ''; }, 3000);
}

function removeGithubToken() {
  localStorage.removeItem('bnb_github_token');
  localStorage.removeItem(HOST_TOKEN_STORE);
  const field = document.getElementById('s-github-token');
  if (field) { field.value = ''; field.placeholder = 'ghp_...'; }
  const msg = document.getElementById('s-publish-msg');
  if (msg) { msg.style.color = 'var(--teal)'; msg.textContent = '✅ Token rimosso.'; setTimeout(() => { msg.textContent = ''; }, 2000); }
}
