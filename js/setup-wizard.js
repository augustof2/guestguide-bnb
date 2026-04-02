// ════════════════════════════════════════════
//  SETUP WIZARD
//  Step-by-step modal for first-time setup.
//  Shown only when data is default (bbName === 'Il Tuo B&B' or wifi === 'NomeRete').
//  The wizard is interruptible via the "Salta" button.
// ════════════════════════════════════════════

(function() {
  'use strict';

  // ── State ──────────────────────────────────
  let _currentStep = 1;
  const _TOTAL_STEPS = 5;
  let _selectedTheme = 'dark';

  // ── DOM helpers ────────────────────────────
  function _el(id) { return document.getElementById(id); }

  function _showError(msg) {
    const el = _el('wz-error');
    if (!el) return;
    el.textContent = msg;
    el.classList.toggle('d-none', !msg);
  }

  function _clearError() { _showError(''); }

  // ── Show / Hide wizard ─────────────────────
  function showSetupWizard() {
    const overlay = _el('setup-wizard');
    if (!overlay) return;
    _currentStep = 1;
    _renderStep(1);
    overlay.classList.remove('d-none');
    document.body.classList.add('wizard-open');
    // Pre-fill fields with current data so user can edit without starting from scratch
    _prefillFields();
  }

  function _hideWizard() {
    const overlay = _el('setup-wizard');
    if (!overlay) return;
    overlay.classList.add('d-none');
    document.body.classList.remove('wizard-open');
  }

  // ── Pre-fill fields ────────────────────────
  function _prefillFields() {
    const d = (typeof currentData !== 'undefined') ? currentData : null;
    if (!d) return;
    const apt = d.apts && d.apts[0];

    _setVal('wz-bbname',    d.bbName    !== 'Il Tuo B&B'   ? d.bbName    : '');
    _setVal('wz-subtitle',  d.subtitle  !== 'Guest Guide'   ? d.subtitle  : '');
    _setVal('wz-cityzone',  d.cityZone  !== 'La Tua Città · Zona' ? d.cityZone : '');
    _setVal('wz-hostname',  d.hostName  || '');
    _setVal('wz-hostphone', d.hostPhone || '');

    if (apt) {
      _setVal('wz-apt-name',          apt.name          !== 'Appartamento 1' ? apt.name          : '');
      _setVal('wz-apt-address',       apt.address       || '');
      _setVal('wz-apt-address-short', apt.addressShort  || '');
      _setVal('wz-apt-maps',          apt.mapsLink      || '');
      _setVal('wz-wifi-name',         apt.wifi          !== 'NomeRete'       ? apt.wifi          : '');
      _setVal('wz-checkin',           apt.checkIn       || '');
      _setVal('wz-checkout',          apt.checkOut      || '');
      _setVal('wz-maxguests',         apt.maxGuests     ? String(apt.maxGuests) : '');
    }

    _setVal('wz-qr-url', d.qrBaseUrl || '');

    // Restore theme selection
    const theme = d.theme || 'dark';
    _selectedTheme = theme;
    document.querySelectorAll('.wizard-theme-btn').forEach(function(btn) {
      btn.classList.toggle('active', btn.dataset.theme === theme);
    });
  }

  function _setVal(id, val) {
    const el = _el(id);
    if (el) el.value = val || '';
  }

  function _getVal(id) {
    const el = _el(id);
    return el ? el.value.trim() : '';
  }

  // ── Step rendering ─────────────────────────
  function _renderStep(step) {
    document.querySelectorAll('.wizard-step').forEach(function(s) {
      s.classList.toggle('active', parseInt(s.dataset.step, 10) === step);
    });
    document.querySelectorAll('.wizard-step-dot').forEach(function(dot) {
      const dotStep = parseInt(dot.dataset.step, 10);
      dot.classList.toggle('active',    dotStep === step);
      dot.classList.toggle('completed', dotStep < step);
    });

    const prevBtn = _el('wz-prev-btn');
    const nextBtn = _el('wz-next-btn');
    const skipBtn = _el('wz-skip-btn');

    if (prevBtn) prevBtn.style.display = step > 1 && step < _TOTAL_STEPS ? '' : 'none';
    if (skipBtn) skipBtn.style.display = step < _TOTAL_STEPS ? '' : 'none';

    if (nextBtn) {
      if (step === _TOTAL_STEPS) {
        nextBtn.textContent = 'Vai alla Guida';
        nextBtn.dataset.wizardEn = 'Go to Guide';
      } else if (step === 4) {
        nextBtn.textContent = 'Salva e Pubblica';
        nextBtn.dataset.wizardEn = 'Save & Publish';
      } else {
        nextBtn.textContent = 'Avanti →';
        nextBtn.dataset.wizardEn = 'Next';
      }
    }

    _clearError();
  }

  // ── Step validation ────────────────────────
  function _validateStep(step) {
    if (step === 1) {
      if (!_getVal('wz-bbname')) {
        _showError('Inserisci il nome della struttura.');
        return false;
      }
    }
    if (step === 2) {
      const pin = _getVal('wz-pin');
      const pinConfirm = _getVal('wz-pin-confirm');
      const pass = _getVal('wz-admin-pass');
      const passConfirm = _getVal('wz-admin-pass-confirm');

      if (pin && pin !== pinConfirm) {
        _showError('I PIN non coincidono.');
        return false;
      }
      if (pin && !/^\d{4}$/.test(pin)) {
        _showError('Il PIN deve essere di 4 cifre numeriche.');
        return false;
      }
      if (pass && pass !== passConfirm) {
        _showError('Le password non coincidono.');
        return false;
      }
    }
    if (step === 3) {
      if (!_getVal('wz-apt-name')) {
        _showError('Inserisci il nome dell\'appartamento.');
        return false;
      }
      if (!_getVal('wz-wifi-name')) {
        _showError('Inserisci il nome della rete WiFi.');
        return false;
      }
    }
    return true;
  }

  // ── Save step 1-3 data ─────────────────────
  async function _saveBasicData() {
    const d = (typeof currentData !== 'undefined') ? currentData : null;
    if (!d) return;

    // Step 1: Basic info
    const bbName = _getVal('wz-bbname') || d.bbName;
    d.bbName    = bbName;
    d.subtitle  = _getVal('wz-subtitle')  || d.subtitle;
    d.cityZone  = _getVal('wz-cityzone')  || d.cityZone;
    d.hostName  = _getVal('wz-hostname')  || d.hostName;
    d.hostPhone = _getVal('wz-hostphone') || d.hostPhone;
    d.theme     = _selectedTheme;

    // Step 3: First apartment
    const apt = d.apts && d.apts[0];
    if (apt) {
      apt.name          = _getVal('wz-apt-name')          || apt.name;
      apt.address       = _getVal('wz-apt-address')       || apt.address;
      apt.addressShort  = _getVal('wz-apt-address-short') || apt.addressShort;
      apt.mapsLink      = _getVal('wz-apt-maps')          || apt.mapsLink;
      const wifiName    = _getVal('wz-wifi-name');
      const wifiPass    = _getVal('wz-wifi-pass');
      if (wifiName) apt.wifi = wifiName;
      if (wifiPass && typeof encryptWifi === 'function') {
        apt.wifiPass = await encryptWifi(wifiPass);
      }
      const checkIn  = _getVal('wz-checkin');
      const checkOut = _getVal('wz-checkout');
      const maxGuests = _getVal('wz-maxguests');
      if (checkIn)   apt.checkIn   = checkIn;
      if (checkOut)  apt.checkOut  = checkOut;
      if (maxGuests) apt.maxGuests = parseInt(maxGuests, 10) || apt.maxGuests;
    }

    // Step 4: Publishing
    const qrUrl = _getVal('wz-qr-url');
    if (qrUrl) d.qrBaseUrl = qrUrl;

    if (typeof saveData === 'function') saveData(d);
    if (typeof applyTheme === 'function') applyTheme(_selectedTheme);
    if (typeof renderLanding === 'function') renderLanding();
  }

  // ── Save security credentials (step 2) ────
  async function _saveSecurityData() {
    const pin          = _getVal('wz-pin');
    const adminUser    = _getVal('wz-admin-user');
    const adminPass    = _getVal('wz-admin-pass');
    const recoveryWord = _getVal('wz-recovery');

    if (typeof hashPin !== 'function') return;

    if (pin && typeof PIN_KEY !== 'undefined') {
      localStorage.setItem(PIN_KEY, await hashPin(pin));
    }
    if (adminUser && typeof USER_KEY !== 'undefined') {
      localStorage.setItem(USER_KEY, await hashPin(adminUser));
    }
    if (adminPass && typeof PASS_KEY !== 'undefined') {
      localStorage.setItem(PASS_KEY, await hashPin(adminPass));
    }
    if (recoveryWord && typeof RECOVERY_KEY !== 'undefined') {
      localStorage.setItem(RECOVERY_KEY, await hashPin(recoveryWord));
    }
  }

  // ── Publish (step 4) ──────────────────────
  async function _runPublish() {
    const statusEl = _el('wz-publish-status');
    const token    = _getVal('wz-gh-token');

    if (token && typeof encryptToken === 'function') {
      const encrypted = await encryptToken(token);
      localStorage.setItem('bnb_host_publish_token', encrypted);
    }

    if (typeof publishOnline === 'function') {
      if (statusEl) {
        statusEl.classList.remove('d-none');
        statusEl.textContent = '⏳ Pubblicazione in corso…';
      }
      try {
        await publishOnline();
        if (statusEl) statusEl.textContent = '✅ Pubblicato con successo!';
      } catch (err) {
        if (statusEl) statusEl.textContent = '⚠️ Pubblicazione non riuscita. Puoi riprovare dal pannello ⚙️.';
        console.warn('[wizard] Publish failed:', err);
      }
    } else {
      if (statusEl) {
        statusEl.classList.remove('d-none');
        statusEl.textContent = 'ℹ️ Salvataggio completato. Per la pubblicazione usa il pannello ⚙️.';
      }
    }
  }

  // ── Next button handler ────────────────────
  async function _handleNext() {
    const nextBtn = _el('wz-next-btn');
    if (nextBtn) nextBtn.disabled = true;

    try {
      if (_currentStep === _TOTAL_STEPS) {
        _hideWizard();
        return;
      }

      if (!_validateStep(_currentStep)) return;

      if (_currentStep === 2) {
        await _saveSecurityData();
      }

      if (_currentStep === 4) {
        await _saveBasicData();
        await _runPublish();
        _currentStep++;
        _renderStep(_currentStep);
        return;
      }

      _currentStep++;
      _renderStep(_currentStep);
    } finally {
      if (nextBtn) nextBtn.disabled = false;
    }
  }

  // ── Event binding ──────────────────────────
  function _bindEvents() {
    const nextBtn = _el('wz-next-btn');
    const prevBtn = _el('wz-prev-btn');
    const skipBtn = _el('wz-skip-btn');

    if (nextBtn) nextBtn.addEventListener('click', _handleNext);

    if (prevBtn) {
      prevBtn.addEventListener('click', function() {
        if (_currentStep > 1) {
          _currentStep--;
          _renderStep(_currentStep);
        }
      });
    }

    if (skipBtn) {
      skipBtn.addEventListener('click', function() {
        _hideWizard();
        // Show the legacy setup banner so user knows they can still configure
        const banner = document.getElementById('setup-banner');
        if (banner) banner.style.display = 'block';
      });
    }

    // Theme picker
    const themePicker = _el('wz-theme-picker');
    if (themePicker) {
      themePicker.addEventListener('click', function(e) {
        const btn = e.target.closest('.wizard-theme-btn');
        if (!btn) return;
        _selectedTheme = btn.dataset.theme;
        document.querySelectorAll('.wizard-theme-btn').forEach(function(b) {
          b.classList.toggle('active', b.dataset.theme === _selectedTheme);
        });
        if (typeof applyTheme === 'function') applyTheme(_selectedTheme);
      });
    }
  }

  // ── Init ──────────────────────────────────
  function _init() {
    _bindEvents();
    // Expose showSetupWizard globally so checkUnconfigured() in app.js can call it
    window.showSetupWizard = showSetupWizard;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _init);
  } else {
    _init();
  }

})();
