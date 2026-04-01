// ════════════════════════════════════════════
//  UNCONFIGURED DATA CHECK
// ════════════════════════════════════════════
function checkUnconfigured() {
  const banner = document.getElementById('setup-banner');
  if (!banner) return;
  const d = currentData;
  const firstApt = d.apts && d.apts[0];
  const isDefault = d.bbName === 'Il Tuo B&B' ||
    (firstApt && firstApt.wifi === 'NomeRete') ||
    (firstApt && deobfuscate(firstApt.wifiPass) === 'password123');
  banner.style.display = isDefault ? 'block' : 'none';
}

// ════════════════════════════════════════════
//  RENDER LANDING
// ════════════════════════════════════════════
function renderLanding() {
  const d = currentData;

  document.getElementById('l-cityzone').textContent = d.cityZone;
  const nameParts = d.bbName.split(' ');
  if (nameParts.length >= 3) {
    document.getElementById('l-bbname-line1').textContent = nameParts.slice(0, -1).join(' ');
    document.getElementById('l-bbname-em').textContent = nameParts[nameParts.length - 1];
  } else {
    document.getElementById('l-bbname-line1').textContent = d.bbName;
    document.getElementById('l-bbname-em').textContent = '';
  }
  document.getElementById('l-subtitle').textContent = d.subtitle;

  // Apt cards — each shows IT + EN language selection buttons
  const container = document.getElementById('apt-cards-container');
  container.innerHTML = '';
  d.apts.forEach((apt, i) => {
    const card = document.createElement('div');
    card.className = 'apt-card';
    const aptName = apt.name;
    card.innerHTML = `
      <div class="apt-card-top">
        <div class="apt-card-meta">
          <div class="apt-card-name">${escHtml(aptName)}</div>
          <div class="apt-card-addr">${escHtml(apt.addressShort || apt.address)} · ${escHtml(d.cityZone)}</div>
        </div>
        <div class="apt-card-superhost">${escHtml(t('superhost'))}</div>
      </div>
      <div class="lang-cards">
        <div class="lang-card" onclick="openGuide(${i},'it')">
          <span class="lang-card-flag">🇮🇹</span>
          <div class="lang-card-body">
            <div class="lang-card-title">${escHtml(t('langBtnItTitle'))}</div>
            <div class="lang-card-sub">${escHtml(t('langBtnItSub'))}</div>
          </div>
          <span class="lang-card-arrow">›</span>
        </div>
        <div class="lang-card" onclick="openGuide(${i},'en')">
          <span class="lang-card-flag">🇬🇧</span>
          <div class="lang-card-body">
            <div class="lang-card-title">${escHtml(t('langBtnEnTitle'))}</div>
            <div class="lang-card-sub">${escHtml(t('langBtnEnSub'))}</div>
          </div>
          <span class="lang-card-arrow">›</span>
        </div>
      </div>
    `;
    container.appendChild(card);
  });

  updateMetaTags(d);
  checkUnconfigured();
}

function updateMetaTags(d) {
  const setMeta = (sel, attr, val) => {
    const el = document.querySelector(sel);
    if (el) el.setAttribute(attr, val);
  };
  const title = `${d.bbName} — ${d.subtitle || 'Guest Guide'}`;
  const desc  = `La guida digitale interattiva per gli ospiti di ${d.bbName}${d.cityZone ? ' · ' + d.cityZone : ''}.`;
  document.title = title;
  setMeta('meta[property="og:title"]',       'content', title);
  setMeta('meta[property="og:description"]', 'content', desc);
  setMeta('meta[name="twitter:title"]',      'content', title);
  setMeta('meta[name="twitter:description"]','content', desc);
  setMeta('meta[name="apple-mobile-web-app-title"]', 'content', d.bbName || 'Guest Guide');
}

// ════════════════════════════════════════════
//  OPEN / CLOSE GUIDE
// ════════════════════════════════════════════
function openGuide(aptIndex, lang) {
  if (lang) setLang(lang);
  currentAptIndex = aptIndex;
  document.getElementById('landing').style.display = 'none';
  document.getElementById('gear-btn').classList.add('hidden');
  const guide = document.getElementById('guide');
  guide.classList.add('active');
  renderApp(aptIndex);
  switchTab('home');
}

function switchLang() {
  const newLang = currentLang === 'it' ? 'en' : 'it';
  setLang(newLang);
  if (typeof GuestAnalytics !== 'undefined') GuestAnalytics.trackLang(newLang);
  // Perf: only update language-dependent text, skip full DOM rebuild & weather re-fetch
  updateLanguageOnly(currentAptIndex);
}

function goBack() {
  document.getElementById('guide').classList.remove('active');
  document.getElementById('landing').style.display = '';
  document.getElementById('gear-btn').classList.remove('hidden');
  document.getElementById('wa-fab').classList.remove('visible');
  document.title = `${currentData.bbName} — ${currentData.subtitle}`;
}

// ════════════════════════════════════════════
//  RENDER APP (guide for an apt)
// ════════════════════════════════════════════
function renderApp(aptIndex) {
  const d = currentData;
  const apt = d.apts[aptIndex] || d.apts[0];

  // Update document title
  document.title = `${apt.name} — ${d.bbName} — Guest Guide`;

  // Apply static i18n strings to data-i18n elements
  applyI18n();

  // Update lang toggle button
  const langBtn = document.getElementById('lang-toggle-btn');
  if (langBtn) langBtn.textContent = t('langToggle');

  // Header
  document.getElementById('guide-apt-name').textContent = apt.name;

  // Home tab
  document.getElementById('h-eyebrow').textContent = '✦ ' + d.cityZone.toUpperCase();
  document.getElementById('h-apt-title').textContent = apt.name;
  document.getElementById('h-address').textContent = apt.addressShort || apt.address;
  document.getElementById('s-checkin').textContent = apt.checkin;
  document.getElementById('s-checkout').textContent = apt.checkout;
  // Guard: hide default placeholder WiFi name
  const wifiDisplay = (apt.wifi === 'NomeRete' || apt.wifi === 'NomeRete2') ? '' : apt.wifi;
  document.getElementById('s-wifi').textContent = wifiDisplay;
  const sMaps = document.getElementById('s-maps');
  sMaps.href = apt.mapsLink || '#';
  sMaps.textContent = t('openMaps');
  sMaps.className = 'stat-value maps-link google-maps-link';

  // Waze button next to s-maps
  let sWaze = document.getElementById('s-waze');
  if (!sWaze) {
    sWaze = document.createElement('a');
    sWaze.id = 's-waze';
    sWaze.target = '_blank';
    sWaze.rel = 'noopener noreferrer';
    sWaze.className = 'stat-value maps-link waze-link';
    sMaps.parentNode.insertBefore(sWaze, sMaps.nextSibling);
  }
  if (apt.mapsLink && apt.mapsLink !== '#') {
    sWaze.href = `https://waze.com/ul?q=${encodeURIComponent(apt.addressShort || apt.address || '')}`;
    sWaze.textContent = 'Waze';
    sWaze.style.display = '';
  } else {
    sWaze.style.display = 'none';
  }

  document.getElementById('w-title').textContent = t('welcome');
  const wItEl = document.getElementById('w-text-it');
  wItEl.innerHTML = renderRichText(langField(d, 'welcome') || '');
  document.getElementById('w-sign').textContent = '★ ' + d.hostName;

  // Stay tab
  document.getElementById('st-checkin').textContent = apt.checkin;
  document.getElementById('st-checkout').textContent = apt.checkout;
  document.getElementById('st-guests').textContent = langField(apt, 'maxGuests');
  // Guard: hide default placeholder WiFi name and password
  const isDefaultWifi = apt.wifi === 'NomeRete' || apt.wifi === 'NomeRete2';
  const plainPass = deobfuscate(apt.wifiPass || '');
  const isDefaultPass = plainPass === 'password123' || plainPass === 'password456';
  document.getElementById('st-wifi-name').textContent = isDefaultWifi ? '' : apt.wifi;
  document.getElementById('st-wifi-pass').textContent = isDefaultPass ? '' : plainPass;
  const copyBtn = document.getElementById('copy-wifi-btn');
  if (copyBtn) copyBtn.style.display = isDefaultPass ? 'none' : '';

  const stMaps = document.getElementById('st-maps');
  stMaps.href = apt.mapsLink || '#';

  // Stay tab - extended fields (language-aware)
  document.getElementById('st-how-reach').innerHTML = renderRichText(langField(apt, 'howToReach') || '');
  document.getElementById('st-how-access').innerHTML = renderRichText(langField(apt, 'howToAccess') || '');
  document.getElementById('st-parking').innerHTML = renderRichText(langField(apt, 'parking') || '');

  // House Rules
  const rulesList = document.getElementById('st-rules-list');
  rulesList.innerHTML = '';
  (apt.houseRules || []).forEach(r => {
    const li = document.createElement('li');
    li.className = 'rule-item';
    const title = langField(r, 'title');
    const desc = langField(r, 'desc');
    li.innerHTML = `<span class="rule-icon">${escHtml(r.icon || '')}</span><div><div class="rule-title">${escHtml(title || '')}</div><div class="rule-desc">${renderRichText(desc || '')}</div></div>`;
    rulesList.appendChild(li);
  });

  // Bedroom tags
  const bedroomTagsEl = document.getElementById('st-bedroom-tags');
  if (bedroomTagsEl) {
    const bedroomRaw = langField(apt, 'bedroomTags') || '';
    bedroomTagsEl.innerHTML = bedroomRaw
      ? bedroomRaw.split(',').map(tt => tt.trim()).filter(Boolean).map(tt => `<span class="tag tag-bedroom">${escHtml(tt)}</span>`).join('')
      : '';
  }

  // Kitchen tags
  const kitchenTagsEl = document.getElementById('st-kitchen-tags');
  if (kitchenTagsEl) {
    const kitchenRaw = langField(apt, 'kitchenTags') || '';
    kitchenTagsEl.innerHTML = kitchenRaw
      ? kitchenRaw.split(',').map(tt => tt.trim()).filter(Boolean).map(tt => `<span class="tag tag-kitchen">${escHtml(tt)}</span>`).join('')
      : '';
  }

  // Bathroom tags
  const bathroomTagsEl = document.getElementById('st-bathroom-tags');
  if (bathroomTagsEl) {
    const bathroomRaw = langField(apt, 'bathroomTags') || '';
    bathroomTagsEl.innerHTML = bathroomRaw
      ? bathroomRaw.split(',').map(tt => tt.trim()).filter(Boolean).map(tt => `<span class="tag tag-bathroom">${escHtml(tt)}</span>`).join('')
      : '';
  }

  // Extra Services
  const servicesEl = document.getElementById('st-extra-services');
  if (servicesEl) {
    servicesEl.innerHTML = '';
    (apt.extraServices || []).forEach(svc => {
      const name = langField(svc, 'name') || '';
      const desc = langField(svc, 'desc') || '';
      const a = document.createElement('a');
      a.className = 'service-item';
      a.href = '#';
      a.addEventListener('click', function(e) {
        e.preventDefault();
        requestService(svc);
      });
      a.innerHTML = `
        <div class="service-icon">${escHtml(svc.icon || '✨')}</div>
        <div class="service-name">${escHtml(name)}</div>
        <div class="service-desc">${escHtml(desc)}</div>
        <div class="service-wa-hint">${escHtml(t('waHint'))}</div>`;
      servicesEl.appendChild(a);
    });
  }

  // Checkin Steps
  renderCheckinSteps(d.checkinSteps || []);

  // Places
  renderPlaces(apt.places || []);

  // Food
  renderFood(apt.restaurants || [], apt);

  // Transport
  renderTransport(apt.transport || {});

  // Departure
  renderDeparture(d, apt.checkoutSteps || []);

  // SOS
  document.getElementById('sos-host-name').textContent = d.hostName;
  // Guard: hide default placeholder phone
  const isDefaultPhone = d.hostPhone === '+39 000 000 0000';
  const phoneEl = document.getElementById('sos-host-phone');
  const callEl = document.getElementById('sos-host-call');
  if (isDefaultPhone) {
    phoneEl.textContent = '';
    callEl.style.display = 'none';
  } else {
    phoneEl.textContent = '📞 ' + (d.hostPhone || '');
    callEl.style.display = '';
    callEl.href = 'tel:' + (d.hostPhone || '').replace(/\s/g, '');
  }
  renderExtraContacts(d.extraContacts || []);

  // Google Review Button
  const reviewUrl = d.googleReviewUrl || '';
  const reviewContainer = document.getElementById('google-review-btn-container');
  const homeReviewSection = document.getElementById('home-review-section');
  if (reviewUrl) {
    document.getElementById('google-review-btn').href = reviewUrl;
    reviewContainer.style.display = '';
    document.getElementById('home-review-btn').href = reviewUrl;
    homeReviewSection.style.display = '';
  } else {
    reviewContainer.style.display = 'none';
    homeReviewSection.style.display = 'none';
  }

  // Reviews
  renderReviews(d.reviews || []);

  // WhatsApp FAB
  updateWaFab();

  // Weather widget
  if (typeof renderWeatherWidget === 'function' && apt.lat && apt.lon) {
    const wContainer = document.getElementById('weather-container');
    if (wContainer) renderWeatherWidget('weather-container', apt.lat, apt.lon, currentLang);
  } else if (typeof renderWeatherWidget === 'function') {
    const wContainer = document.getElementById('weather-container');
    if (wContainer) renderWeatherWidget('weather-container', 41.9028, 12.4964, currentLang);
  }

  // Update nav labels (language-aware: EN from t(), IT from data)
  const nl = d.navLabels || DEFAULT_DATA.navLabels;
  const navLabelMap = {
    home:      currentLang === 'en' ? (nl.homeEn      || t('navHome'))      : (nl.homeIt      || t('navHome')),
    stay:      currentLang === 'en' ? (nl.stayEn      || t('navStay'))      : (nl.stayIt      || t('navStay')),
    places:    currentLang === 'en' ? (nl.placesEn    || t('navPlaces'))    : (nl.placesIt    || t('navPlaces')),
    food:      currentLang === 'en' ? (nl.foodEn      || t('navFood'))      : (nl.foodIt      || t('navFood')),
    transport: currentLang === 'en' ? (nl.transportEn || t('navTransport')) : (nl.transportIt || t('navTransport')),
    departure: currentLang === 'en' ? (nl.departureEn || t('navDeparture')) : (nl.departureIt || t('navDeparture'))
  };
  const navIconMap = {
    home:      nl.homeIcon      || DEFAULT_DATA.navLabels.homeIcon,
    stay:      nl.stayIcon      || DEFAULT_DATA.navLabels.stayIcon,
    places:    nl.placesIcon    || DEFAULT_DATA.navLabels.placesIcon,
    food:      nl.foodIcon      || DEFAULT_DATA.navLabels.foodIcon,
    transport: nl.transportIcon || DEFAULT_DATA.navLabels.transportIcon,
    departure: nl.departureIcon || DEFAULT_DATA.navLabels.departureIcon
  };
  document.querySelectorAll('.nav-item[data-tab]').forEach(btn => {
    const tab = btn.getAttribute('data-tab');
    const label = btn.querySelector('.nav-label');
    if (label && navLabelMap[tab]) label.textContent = navLabelMap[tab];
    const icon = btn.querySelector('.nav-icon');
    if (icon && navIconMap[tab]) icon.textContent = navIconMap[tab];
  });
  // Perf: use data-tab attribute instead of regex parsing of onclick
  document.querySelectorAll('.quick-nav-card[data-tab]').forEach(card => {
    const tab = card.dataset.tab;
    const label = card.querySelector('.quick-nav-label');
    if (label && navLabelMap[tab]) label.textContent = navLabelMap[tab];
    const icon = card.querySelector('.quick-nav-icon');
    if (icon && navIconMap[tab]) icon.textContent = navIconMap[tab];
  });

  // Update section headers (language-aware)
  const st = d.sectionTitles || DEFAULT_DATA.sectionTitles;
  const sectionHeaderMap = [
    { tab: 'stay',      eyebrow: currentLang === 'en' ? (st.stayEyebrowEn      || t('stayEyebrow'))      : (st.stayEyebrowIt      || t('stayEyebrow')),      title: currentLang === 'en' ? (st.stayTitleEn      || t('stayTitle'))      : (st.stayTitleIt      || t('stayTitle')) },
    { tab: 'places',    eyebrow: currentLang === 'en' ? (st.placesEyebrowEn    || t('placesEyebrow'))    : (st.placesEyebrowIt    || t('placesEyebrow')),    title: currentLang === 'en' ? (st.placesTitleEn    || t('placesTitle'))    : (st.placesTitleIt    || t('placesTitle')) },
    { tab: 'food',      eyebrow: currentLang === 'en' ? (st.foodEyebrowEn      || t('foodEyebrow'))      : (st.foodEyebrowIt      || t('foodEyebrow')),      title: currentLang === 'en' ? (st.foodTitleEn      || t('foodTitle'))      : (st.foodTitleIt      || t('foodTitle')) },
    { tab: 'transport', eyebrow: currentLang === 'en' ? (st.transportEyebrowEn || t('transportEyebrow')) : (st.transportEyebrowIt || t('transportEyebrow')), title: currentLang === 'en' ? (st.transportTitleEn || t('transportTitle')) : (st.transportTitleIt || t('transportTitle')) },
    { tab: 'departure', eyebrow: currentLang === 'en' ? (st.departureEyebrowEn || t('departureEyebrow')) : (st.departureEyebrowIt || t('departureEyebrow')), title: currentLang === 'en' ? (st.departureTitleEn || t('departureTitle')) : (st.departureTitleIt || t('departureTitle')) }
  ];
  sectionHeaderMap.forEach(({ tab, eyebrow, title }) => {
    const tabEl = document.getElementById('tab-' + tab);
    if (!tabEl) return;
    const eyebrowEl = tabEl.querySelector('.section-eyebrow');
    const titleEl = tabEl.querySelector('.section-title');
    if (eyebrowEl) eyebrowEl.textContent = eyebrow;
    if (titleEl) titleEl.textContent = title;
  });
}

// ════════════════════════════════════════════
//  LANGUAGE-ONLY UPDATE (avoids full DOM rebuild)
// ════════════════════════════════════════════
function updateLanguageOnly(aptIndex) {
  const d = currentData;
  const apt = d.apts[aptIndex] || d.apts[0];

  // Apply static i18n strings
  applyI18n();

  // Lang toggle button
  const langBtn = document.getElementById('lang-toggle-btn');
  if (langBtn) langBtn.textContent = t('langToggle');

  // Home tab text
  document.getElementById('w-title').textContent = t('welcome');
  document.getElementById('w-text-it').innerHTML = renderRichText(langField(d, 'welcome') || '');

  // Stay tab text
  document.getElementById('st-guests').textContent = langField(apt, 'maxGuests');
  document.getElementById('st-how-reach').innerHTML = renderRichText(langField(apt, 'howToReach') || '');
  document.getElementById('st-how-access').innerHTML = renderRichText(langField(apt, 'howToAccess') || '');
  document.getElementById('st-parking').innerHTML = renderRichText(langField(apt, 'parking') || '');
  const sMaps = document.getElementById('s-maps');
  if (sMaps) sMaps.textContent = t('openMaps');

  // House Rules (language-dependent text)
  const rulesList = document.getElementById('st-rules-list');
  rulesList.innerHTML = '';
  (apt.houseRules || []).forEach(r => {
    const li = document.createElement('li');
    li.className = 'rule-item';
    const title = langField(r, 'title');
    const desc = langField(r, 'desc');
    li.innerHTML = `<span class="rule-icon">${escHtml(r.icon || '')}</span><div><div class="rule-title">${escHtml(title || '')}</div><div class="rule-desc">${renderRichText(desc || '')}</div></div>`;
    rulesList.appendChild(li);
  });

  // Tags (language-dependent)
  const bedroomTagsEl = document.getElementById('st-bedroom-tags');
  if (bedroomTagsEl) {
    const bedroomRaw = langField(apt, 'bedroomTags') || '';
    bedroomTagsEl.innerHTML = bedroomRaw
      ? bedroomRaw.split(',').map(tt => tt.trim()).filter(Boolean).map(tt => `<span class="tag tag-bedroom">${escHtml(tt)}</span>`).join('')
      : '';
  }
  const kitchenTagsEl = document.getElementById('st-kitchen-tags');
  if (kitchenTagsEl) {
    const kitchenRaw = langField(apt, 'kitchenTags') || '';
    kitchenTagsEl.innerHTML = kitchenRaw
      ? kitchenRaw.split(',').map(tt => tt.trim()).filter(Boolean).map(tt => `<span class="tag tag-kitchen">${escHtml(tt)}</span>`).join('')
      : '';
  }
  const bathroomTagsEl = document.getElementById('st-bathroom-tags');
  if (bathroomTagsEl) {
    const bathroomRaw = langField(apt, 'bathroomTags') || '';
    bathroomTagsEl.innerHTML = bathroomRaw
      ? bathroomRaw.split(',').map(tt => tt.trim()).filter(Boolean).map(tt => `<span class="tag tag-bathroom">${escHtml(tt)}</span>`).join('')
      : '';
  }

  // Extra Services (language text)
  const servicesEl = document.getElementById('st-extra-services');
  if (servicesEl) {
    servicesEl.innerHTML = '';
    (apt.extraServices || []).forEach(svc => {
      const name = langField(svc, 'name') || '';
      const desc = langField(svc, 'desc') || '';
      const a = document.createElement('a');
      a.className = 'service-item';
      a.href = '#';
      a.addEventListener('click', function(e) {
        e.preventDefault();
        requestService(svc);
      });
      a.innerHTML = `
        <div class="service-icon">${escHtml(svc.icon || '✨')}</div>
        <div class="service-name">${escHtml(name)}</div>
        <div class="service-desc">${escHtml(desc)}</div>
        <div class="service-wa-hint">${escHtml(t('waHint'))}</div>`;
      servicesEl.appendChild(a);
    });
  }

  // Re-render language-dependent lists
  renderPlaces(apt.places || []);
  renderFood(apt.restaurants || [], apt);
  renderTransport(apt.transport || {});
  renderCheckinSteps(d.checkinSteps || []);
  renderDeparture(d, apt.checkoutSteps || []);
  renderReviews(d.reviews || []);

  // Nav labels
  const nl = d.navLabels || DEFAULT_DATA.navLabels;
  const navLabelMap = {
    home:      currentLang === 'en' ? (nl.homeEn      || t('navHome'))      : (nl.homeIt      || t('navHome')),
    stay:      currentLang === 'en' ? (nl.stayEn      || t('navStay'))      : (nl.stayIt      || t('navStay')),
    places:    currentLang === 'en' ? (nl.placesEn    || t('navPlaces'))    : (nl.placesIt    || t('navPlaces')),
    food:      currentLang === 'en' ? (nl.foodEn      || t('navFood'))      : (nl.foodIt      || t('navFood')),
    transport: currentLang === 'en' ? (nl.transportEn || t('navTransport')) : (nl.transportIt || t('navTransport')),
    departure: currentLang === 'en' ? (nl.departureEn || t('navDeparture')) : (nl.departureIt || t('navDeparture'))
  };
  const navIconMap = {
    home:      nl.homeIcon      || DEFAULT_DATA.navLabels.homeIcon,
    stay:      nl.stayIcon      || DEFAULT_DATA.navLabels.stayIcon,
    places:    nl.placesIcon    || DEFAULT_DATA.navLabels.placesIcon,
    food:      nl.foodIcon      || DEFAULT_DATA.navLabels.foodIcon,
    transport: nl.transportIcon || DEFAULT_DATA.navLabels.transportIcon,
    departure: nl.departureIcon || DEFAULT_DATA.navLabels.departureIcon
  };
  document.querySelectorAll('.nav-item[data-tab]').forEach(btn => {
    const tab = btn.getAttribute('data-tab');
    const label = btn.querySelector('.nav-label');
    if (label && navLabelMap[tab]) label.textContent = navLabelMap[tab];
    const icon = btn.querySelector('.nav-icon');
    if (icon && navIconMap[tab]) icon.textContent = navIconMap[tab];
  });
  // Perf: use data-tab attribute instead of regex parsing of onclick
  document.querySelectorAll('.quick-nav-card[data-tab]').forEach(card => {
    const tab = card.dataset.tab;
    const label = card.querySelector('.quick-nav-label');
    if (label && navLabelMap[tab]) label.textContent = navLabelMap[tab];
    const icon = card.querySelector('.quick-nav-icon');
    if (icon && navIconMap[tab]) icon.textContent = navIconMap[tab];
  });

  // Section headers
  const st = d.sectionTitles || DEFAULT_DATA.sectionTitles;
  const sectionHeaderMap = [
    { tab: 'stay',      eyebrow: currentLang === 'en' ? (st.stayEyebrowEn      || t('stayEyebrow'))      : (st.stayEyebrowIt      || t('stayEyebrow')),      title: currentLang === 'en' ? (st.stayTitleEn      || t('stayTitle'))      : (st.stayTitleIt      || t('stayTitle')) },
    { tab: 'places',    eyebrow: currentLang === 'en' ? (st.placesEyebrowEn    || t('placesEyebrow'))    : (st.placesEyebrowIt    || t('placesEyebrow')),    title: currentLang === 'en' ? (st.placesTitleEn    || t('placesTitle'))    : (st.placesTitleIt    || t('placesTitle')) },
    { tab: 'food',      eyebrow: currentLang === 'en' ? (st.foodEyebrowEn      || t('foodEyebrow'))      : (st.foodEyebrowIt      || t('foodEyebrow')),      title: currentLang === 'en' ? (st.foodTitleEn      || t('foodTitle'))      : (st.foodTitleIt      || t('foodTitle')) },
    { tab: 'transport', eyebrow: currentLang === 'en' ? (st.transportEyebrowEn || t('transportEyebrow')) : (st.transportEyebrowIt || t('transportEyebrow')), title: currentLang === 'en' ? (st.transportTitleEn || t('transportTitle')) : (st.transportTitleIt || t('transportTitle')) },
    { tab: 'departure', eyebrow: currentLang === 'en' ? (st.departureEyebrowEn || t('departureEyebrow')) : (st.departureEyebrowIt || t('departureEyebrow')), title: currentLang === 'en' ? (st.departureTitleEn || t('departureTitle')) : (st.departureTitleIt || t('departureTitle')) }
  ];
  sectionHeaderMap.forEach(({ tab, eyebrow, title }) => {
    const tabEl = document.getElementById('tab-' + tab);
    if (!tabEl) return;
    const eyebrowEl = tabEl.querySelector('.section-eyebrow');
    const titleEl = tabEl.querySelector('.section-title');
    if (eyebrowEl) eyebrowEl.textContent = eyebrow;
    if (titleEl) titleEl.textContent = title;
  });
}

function renderPlaces(places) {
  const container = document.getElementById('places-container');
  container.innerHTML = '';
  places.forEach(p => {
    const desc = langField(p, 'desc');
    const how  = langField(p, 'how');
    const howLabel  = t('howToArrive');
    const mapsLabel = t('guideHere');
    const wazeLabel = t('wazeBtn');
    const hasValidMaps = p.maps && p.maps !== '#';
    const mapsHref = hasValidMaps ? p.maps : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.name)}`;
    const wazeBtn = hasValidMaps
      ? `<a class="maps-btn waze-btn" href="https://waze.com/ul?q=${encodeURIComponent(p.name)}" target="_blank" rel="noopener noreferrer">🗺️ ${wazeLabel}</a>`
      : '';
    const card = document.createElement('div');
    card.className = 'place-card';
    card.innerHTML = `
      <div class="place-header">
        <span class="place-icon">${escHtml(p.emoji || '📍')}</span>
        <span class="place-title">${escHtml(p.name)}</span>
      </div>
      <p class="place-desc">${renderRichText(desc)}</p>
      <div class="place-how">
        <div class="place-how-label">${escHtml(howLabel)}</div>
        ${renderRichText(how)}
      </div>
      <div class="maps-btn-group">
        <a class="maps-btn google-maps-btn" href="${escAttr(mapsHref)}" target="_blank" rel="noopener noreferrer">${mapsLabel}</a>
        ${wazeBtn}
      </div>
    `;
    container.appendChild(card);
  });
}

function renderFood(restaurants, apt) {
  const container = document.getElementById('food-container');
  container.innerHTML = '';
  restaurants.forEach(r => {
    const desc = langField(r, 'desc');
    const mapsLabel = t('viewOnMaps');
    const wazeLabel = t('wazeBtn');
    const hasValidMaps = r.maps && r.maps !== '#';
    const mapsHref = hasValidMaps ? r.maps : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.name)}`;
    const wazeBtn = hasValidMaps
      ? `<a class="maps-btn waze-btn" href="https://waze.com/ul?q=${encodeURIComponent(r.name)}" target="_blank" rel="noopener noreferrer">🗺️ ${wazeLabel}</a>`
      : '';
    const card = document.createElement('div');
    card.className = 'restaurant-card';
    card.innerHTML = `
      <div class="rest-header">
        <span class="rest-icon">${escHtml(r.emoji || '🍽️')}</span>
        <div class="rest-body">
          <div class="rest-name">${escHtml(r.name)}</div>
          <div class="rest-tipo">${escHtml(r.tipo || '')}</div>
        </div>
        <span class="rest-price">${escHtml(r.price || '')}</span>
      </div>
      <p class="rest-desc">${renderRichText(desc)}</p>
      <div class="maps-btn-group">
        <a class="maps-btn google-maps-btn" href="${escAttr(mapsHref)}" target="_blank" rel="noopener noreferrer">${mapsLabel}</a>
        ${wazeBtn}
      </div>
    `;
    container.appendChild(card);
  });

  // Supermercato
  const supermarkets = (apt && apt.supermarkets) || [];
  const mapsLabelSuper = t('viewOnMaps');
  const wazeLabelSuper = t('wazeBtn');
  supermarkets.forEach(s => {
    const desc = langField(s, 'desc');
    const hasValidMapsSuper = s.maps && s.maps !== '#';
    const mapsHrefSuper = hasValidMapsSuper ? s.maps : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.name || '')}`;
    const wazeBtnSuper = hasValidMapsSuper
      ? `<a class="maps-btn waze-btn" href="https://waze.com/ul?q=${encodeURIComponent(s.name || '')}" target="_blank" rel="noopener noreferrer">🗺️ ${wazeLabelSuper}</a>`
      : '';
    const card = document.createElement('div');
    card.className = 'restaurant-card';
    card.innerHTML = `
      <div class="rest-header">
        <span class="rest-icon">${escHtml(s.emoji || '🛒')}</span>
        <div class="rest-body">
          <div class="rest-name">${escHtml(s.name || '')}</div>
          <div class="rest-tipo">${escHtml(s.tipo || '')}</div>
        </div>
        <span class="rest-price">${escHtml(s.price || '')}</span>
      </div>
      <p class="rest-desc">${renderRichText(desc)}</p>
      <div class="maps-btn-group">
        <a class="maps-btn google-maps-btn" href="${escAttr(mapsHrefSuper)}" target="_blank" rel="noopener noreferrer">${mapsLabelSuper}</a>
        ${wazeBtnSuper}
      </div>
    `;
    container.appendChild(card);
  });
}

function renderTransport(transport) {
  const container = document.getElementById('transport-container');
  container.innerHTML = '';
  const items = [
    { key: 'airport', icon: transport.airportIcon || '✈️', label: t('fromAirport'), text: langField(transport, 'airport'), maps: transport.airportMaps, enabled: transport.airportEnabled !== false },
    { key: 'station', icon: transport.stationIcon || '🚉', label: t('fromStation'), text: langField(transport, 'station'), maps: transport.stationMaps, enabled: transport.stationEnabled !== false },
    { key: 'metro',   icon: transport.metroIcon   || '🚇', label: t('metro'),       text: langField(transport, 'metro'),   maps: transport.metroMaps,   enabled: transport.metroEnabled   !== false },
    { key: 'bus',     icon: transport.busIcon     || '🚌', label: t('bus'),         text: langField(transport, 'bus'),     maps: transport.busMaps,     enabled: transport.busEnabled     !== false }
  ];
  const mapsLabel = t('viewOnMaps');
  const wazeLabel = t('wazeBtn');
  items.forEach(item => {
    if (!item.enabled) return;
    const card = document.createElement('div');
    card.className = 'transport-card';
    const showWaze = (item.key === 'airport' || item.key === 'station') && item.maps;
    const wazeBtn = showWaze
      ? `<a class="maps-btn waze-btn" href="https://waze.com/ul?q=${encodeURIComponent(item.label)}&navigate=yes" target="_blank" rel="noopener noreferrer">🗺️ ${wazeLabel}</a>`
      : '';
    const mapsBtn = item.maps ? `<a class="maps-btn google-maps-btn" href="${escAttr(item.maps)}" target="_blank" rel="noopener">${mapsLabel}</a>` : '';
    card.innerHTML = `
      <div class="transport-header">
        <span class="transport-icon">${escHtml(item.icon)}</span>
        <span class="transport-title">${escHtml(item.label)}</span>
      </div>
      <p class="transport-desc">${renderRichText(item.text)}</p>
      <div class="maps-btn-group">
        ${mapsBtn}
        ${wazeBtn}
      </div>
    `;
    container.appendChild(card);
  });

  // Biglietti
  const ticketsText = langField(transport, 'tickets') || '';
  const ticketsCard = document.getElementById('tr-tickets-card');
  const ticketsEl = document.getElementById('tr-tickets-desc');
  if (ticketsEl) ticketsEl.innerHTML = renderRichText(ticketsText);
  if (ticketsCard) ticketsCard.style.display = ticketsText ? '' : 'none';

  // Taxi & App
  const taxiText = langField(transport, 'taxi') || '';
  const taxiCard = document.getElementById('tr-taxi-card');
  const taxiEl = document.getElementById('tr-taxi-desc');
  if (taxiEl) taxiEl.innerHTML = renderRichText(taxiText);
  if (taxiCard) taxiCard.style.display = taxiText ? '' : 'none';
}

// ════════════════════════════════════════════
//  EXTRA CONTACTS RENDER
// ════════════════════════════════════════════
function renderExtraContacts(contacts) {
  const container = document.getElementById('sos-extra-contacts');
  container.innerHTML = '';
  (contacts || []).forEach(c => {
    if (!c.name && !c.phone) return;
    const card = document.createElement('div');
    card.className = 'sos-card';
    card.innerHTML = `
      <div class="sos-icon">👤</div>
      <div class="sos-body">
        <div class="sos-name">${escHtml(c.name || '')}</div>
        <div class="sos-number">📞 ${escHtml(c.phone || '')}</div>
      </div>
      <a class="call-btn host" href="tel:${escAttr((c.phone || '').replace(/\s/g, ''))}">📞 ${escHtml(t('call'))}</a>
    `;
    container.appendChild(card);
  });
}

// ════════════════════════════════════════════
//  CHECKIN STEPS RENDER
// ════════════════════════════════════════════
function renderCheckinSteps(steps) {
  const container = document.getElementById('checkin-steps-list');
  if (!container) return;
  const section = document.getElementById('checkin-steps-section');
  if (section) section.style.display = steps.length ? '' : 'none';
  container.innerHTML = '';
  steps.forEach((step, i) => {
    const title = langField(step, 'title') || '';
    const desc  = langField(step, 'desc')  || '';
    const item  = document.createElement('div');
    item.className = 'step-item';
    item.innerHTML = `
      <div class="step-num">${escHtml(step.icon || String(i + 1))}</div>
      <div class="step-body">
        <div class="step-title">${escHtml(title)}</div>
        <div class="step-desc">${escHtml(desc)}</div>
      </div>`;
    container.appendChild(item);
  });
}

// ════════════════════════════════════════════
//  DEPARTURE TAB RENDER
// ════════════════════════════════════════════
function renderDeparture(d, checkoutSteps) {
  const titleEl = document.getElementById('closing-title');
  const textEl  = document.getElementById('closing-text');
  if (titleEl) titleEl.textContent = langField(d, 'closingTitle') || '';
  if (textEl)  textEl.innerHTML    = renderRichText(langField(d, 'closingText') || '');

  // Checkout steps
  const stepsContainer = document.getElementById('departure-steps-list');
  if (stepsContainer) {
    stepsContainer.innerHTML = '';
    (checkoutSteps || []).forEach((step, i) => {
      const title = langField(step, 'title') || '';
      const desc  = langField(step, 'desc')  || '';
      const item  = document.createElement('div');
      item.className = 'step-item';
      item.innerHTML = `
        <div class="step-num">${i + 1}</div>
        <div class="step-body">
          <div class="step-title">${escHtml(title)}</div>
          <div class="step-desc">${escHtml(desc)}</div>
        </div>`;
      stepsContainer.appendChild(item);
    });
  }
}

// ════════════════════════════════════════════
//  WHATSAPP SERVICE REQUEST
// ════════════════════════════════════════════
function requestService(svc) {
  const phone   = ((currentData && currentData.hostPhone) || '').replace(/[\s\-\(\)]/g, '').replace(/^\+/, '');
  const svcName = langField(svc, 'name') || svc.nameIt || '';
  const msg     = t('waRequest') + svcName;
  const url     = phone
    ? `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
    : `https://wa.me/?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

// ════════════════════════════════════════════
//  TAB NAVIGATION
// ════════════════════════════════════════════
const TAB_IDS = ['home', 'stay', 'places', 'food', 'transport', 'departure'];

function switchTab(tabId) {
  showTab(tabId);
  if (typeof GuestAnalytics !== 'undefined') GuestAnalytics.trackPageView(tabId);
}

// ════════════════════════════════════════════
//  WIFI COPY
// ════════════════════════════════════════════
function copyWifi() {
  const pass = document.getElementById('st-wifi-pass').textContent;
  const btn = document.getElementById('copy-wifi-btn');
  if (navigator.clipboard) {
    navigator.clipboard.writeText(pass).then(() => {
      btn.textContent = '✅';
      btn.classList.add('copied');
      showToast('Copiato!', 'info');
      setTimeout(() => { btn.textContent = '📋'; btn.classList.remove('copied'); }, 2000);
    }).catch(() => fallbackCopy(pass, btn));
  } else {
    fallbackCopy(pass, btn);
  }
}

function fallbackCopy(text, btn) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.focus(); ta.select();
  let ok = false;
  try { ok = document.execCommand('copy'); } catch(e) {}
  document.body.removeChild(ta);
  if (ok) {
    btn.textContent = '✅';
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = '📋'; btn.classList.remove('copied'); }, 2000);
  } else {
    btn.textContent = '❌';
    setTimeout(() => { btn.textContent = '📋'; }, 2000);
  }
}

// ════════════════════════════════════════════
//  PIN MODAL
// ════════════════════════════════════════════
function openSettings() {
  pinBuffer = '';
  updatePinDots();
  document.getElementById('pin-error').textContent = '';
  document.getElementById('pin-modal').classList.add('open');
}

function closePinModal() {
  document.getElementById('pin-modal').classList.remove('open');
  pinBuffer = '';
  // Reset to PIN view when modal closes
  document.getElementById('login-view').style.display = 'none';
  document.getElementById('pin-view').style.display = 'block';
}

function pinKey(digit) {
  if (pinBuffer.length >= 4) return;
  pinBuffer += digit;
  updatePinDots();
  if (pinBuffer.length === 4) setTimeout(checkPin, 120);
}

function pinBackspace() {
  pinBuffer = pinBuffer.slice(0, -1);
  updatePinDots();
  document.getElementById('pin-error').textContent = '';
}

function updatePinDots() {
  for (let i = 0; i < 4; i++) {
    const dot = document.getElementById('pd' + i);
    dot.classList.toggle('filled', i < pinBuffer.length);
    dot.classList.remove('error');
  }
}

function checkPin() {
  const rl = checkRateLimit('pin');
  if (rl.locked) {
    const err = document.getElementById('pin-error');
    err.textContent = '🔒 Troppi tentativi. Riprova tra ' + rl.remaining + 's.';
    let remaining = rl.remaining;
    const t = setInterval(() => {
      remaining--;
      if (remaining <= 0) { clearInterval(t); err.textContent = ''; }
      else err.textContent = '🔒 Troppi tentativi. Riprova tra ' + remaining + 's.';
    }, 1000);
    return;
  }
  hashPin(pinBuffer).then(hash => {
    if (hash === getStoredPinHash()) {
      resetRateLimit('pin');
      currentRole = 'host';
      closePinModal();
      _openSettingsPanel();
    } else {
      const entry = recordFailedAttempt('pin');
      let msg = '❌ PIN errato.';
      if (entry.lockedUntil) {
        msg = '🔒 Troppi tentativi. Bloccato per 5 minuti.';
      } else {
        const left = MAX_ATTEMPTS - (entry.count || 0);
        if (left <= 2) msg = '❌ PIN errato. ' + left + ' tentativ' + (left === 1 ? 'o' : 'i') + ' rimast' + (left === 1 ? 'o' : 'i') + '.';
      }
      document.getElementById('pin-error').textContent = msg;
      for (let i = 0; i < 4; i++) document.getElementById('pd' + i).classList.add('error');
      setTimeout(() => { pinBuffer = ''; updatePinDots(); }, 600);
    }
  });
}

async function forgotPin() {
  const word = prompt('Inserisci la parola segreta per resettare il PIN:');
  if (word === null) return;
  const wordHash = await hashPin(word);
  if (wordHash !== getStoredRecoveryHash()) {
    const err = document.getElementById('pin-error');
    err.style.color = 'var(--accent)';
    err.textContent = '❌ Parola segreta errata.';
    setTimeout(() => { err.style.color = ''; err.textContent = ''; }, 2000);
    return;
  }
  const hash = await hashPin('1234');
  localStorage.setItem(PIN_KEY, hash);
  pinBuffer = '';
  updatePinDots();
  const err = document.getElementById('pin-error');
  err.style.color = 'var(--teal)';
  err.textContent = '✅ PIN resettato a 1234.';
  setTimeout(() => { err.style.color = ''; err.textContent = ''; closePinModal(); }, 1800);
}

function _openSettingsPanel() {
  populateSettingsForms();
  applyRoleVisibility();
  const panel = document.getElementById('settings-panel');
  panel.classList.add('open');
  document.body.style.overflow = 'hidden';
  settingsDirty = false;
  panel.querySelectorAll('input, textarea, select').forEach(function(el) {
    el.addEventListener('input', function() { settingsDirty = true; }, { once: false });
  });
}

function applyRoleVisibility() {
  const isAdmin = currentRole === 'admin';

  // Elements visible only to admin
  document.querySelectorAll('.admin-only').forEach(el => {
    el.style.display = isAdmin ? '' : 'none';
  });

  // Elements visible only to host
  document.querySelectorAll('.host-only').forEach(el => {
    el.style.display = isAdmin ? 'none' : '';
  });

  // Update panel title
  const titleEl = document.querySelector('.settings-title');
  if (titleEl) {
    titleEl.textContent = isAdmin ? '🛡️ Pannello Admin' : '⚙️ Impostazioni Host';
  }
}

function closeSettings() {
  if (settingsDirty) {
    if (!confirm('Hai modifiche non salvate. Vuoi davvero uscire?')) return;
    settingsDirty = false;
  }
  document.getElementById('settings-panel').classList.remove('open');
  document.body.style.overflow = '';
  currentRole = null;
}

async function changePin() {
  const current = document.getElementById('s-pin-current').value;
  const newPin = document.getElementById('s-pin-new').value;
  const confirm2 = document.getElementById('s-pin-confirm').value;
  const msg = document.getElementById('s-pin-msg');
  const currentHash = await hashPin(current);
  if (currentHash !== getStoredPinHash()) { showErr(msg, 'PIN attuale non corretto.'); return; }
  if (!/^\d{4}$/.test(newPin)) { showErr(msg, 'Il nuovo PIN deve essere di esattamente 4 cifre numeriche.'); return; }
  if (newPin !== confirm2) { showErr(msg, 'I due PIN non coincidono. Riprova.'); return; }
  const newHash = await hashPin(newPin);
  localStorage.setItem(PIN_KEY, newHash);
  document.getElementById('s-pin-current').value = '';
  document.getElementById('s-pin-new').value = '';
  document.getElementById('s-pin-confirm').value = '';
  showOk(msg, 'PIN aggiornato con successo!');
  showToast('PIN aggiornato', 'success');
  setTimeout(() => { msg.textContent = ''; }, 3000);
}

// ════════════════════════════════════════════
//  LOGIN FORM (username + password)
// ════════════════════════════════════════════
function openLoginForm() {
  document.getElementById('pin-view').style.display = 'none';
  document.getElementById('login-view').style.display = 'block';
  document.getElementById('login-username').value = '';
  document.getElementById('login-password').value = '';
  document.getElementById('login-error').textContent = '';
  setTimeout(() => {
    // Force browser to unlock inputs after clearing values (prevents some browsers
    // from blocking keyboard input after autocomplete interactions)
    const u = document.getElementById('login-username');
    const p = document.getElementById('login-password');
    if (u) { u.focus(); u.blur(); }
  }, 50);
}

function closeLoginForm() {
  document.getElementById('login-view').style.display = 'none';
  document.getElementById('pin-view').style.display = 'block';
  document.getElementById('login-error').textContent = '';
}

async function submitLogin() {
  const user = document.getElementById('login-username').value.trim();
  const pass = document.getElementById('login-password').value;
  const errEl = document.getElementById('login-error');
  const rl = checkRateLimit('admin');
  if (rl.locked) {
    errEl.textContent = '🔒 Troppi tentativi. Riprova tra ' + rl.remaining + 's.';
    return;
  }
  if (!user || !pass) {
    errEl.textContent = '❌ Inserisci username e password.';
    return;
  }
  const userHash = await hashPin(user);
  const passHash = await hashPin(pass);
  if (userHash === getStoredUserHash() && passHash === getStoredPassHash()) {
    resetRateLimit('admin');
    currentRole = 'admin';
    closePinModal();
    _openSettingsPanel();
  } else {
    const entry = recordFailedAttempt('admin');
    let msg = '❌ Credenziali errate.';
    if (entry.lockedUntil) {
      msg = '🔒 Troppi tentativi. Bloccato per 5 minuti.';
    }
    errEl.textContent = msg;
    setTimeout(() => { if (!entry.lockedUntil) errEl.textContent = ''; }, 2000);
  }
}

async function changeCredentials() {
  const currentUser = document.getElementById('s-user-current').value.trim();
  const currentPass = document.getElementById('s-pass-current').value;
  const newUser = document.getElementById('s-user-new').value.trim();
  const newPass = document.getElementById('s-pass-new').value;
  const confirmPass = document.getElementById('s-pass-confirm').value;
  const msg = document.getElementById('s-cred-msg');
  if (!currentUser || !currentPass) { showErr(msg, 'Inserisci le credenziali attuali.'); return; }
  const currentUserHash = await hashPin(currentUser);
  const currentPassHash = await hashPin(currentPass);
  if (currentUserHash !== getStoredUserHash() || currentPassHash !== getStoredPassHash()) {
    showErr(msg, 'Credenziali attuali non corrette.');
    return;
  }
  if (!newUser) { showErr(msg, 'Il nuovo username non può essere vuoto.'); return; }
  if (!newPass) { showErr(msg, 'La nuova password non può essere vuota.'); return; }
  if (newPass !== confirmPass) { showErr(msg, 'Le due password non coincidono.'); return; }
  const newUserHash = await hashPin(newUser);
  const newPassHash = await hashPin(newPass);
  localStorage.setItem(USER_KEY, newUserHash);
  localStorage.setItem(PASS_KEY, newPassHash);
  document.getElementById('s-user-current').value = '';
  document.getElementById('s-pass-current').value = '';
  document.getElementById('s-user-new').value = '';
  document.getElementById('s-pass-new').value = '';
  document.getElementById('s-pass-confirm').value = '';
  showOk(msg, 'Credenziali aggiornate con successo!');
  showToast('Credenziali aggiornate!', 'success');
  setTimeout(() => { msg.textContent = ''; }, 3000);
}

// ════════════════════════════════════════════
//  PIN MIGRATION (plain → SHA-256)
// ════════════════════════════════════════════
async function migratePinIfNeeded() {
  const stored = localStorage.getItem(PIN_KEY);
  if (stored && /^\d{4}$/.test(stored)) {
    const hash = await hashPin(stored);
    localStorage.setItem(PIN_KEY, hash);
  }
}

// ════════════════════════════════════════════
//  PUBLISH ONLINE (GitHub API)

function showToast(message, type = 'success', duration = 2500) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  toast.textContent = (icons[type] || '') + ' ' + message;
  container.appendChild(toast);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => { toast.classList.add('show'); });
  });
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 350);
  }, duration);
}

// ════════════════════════════════════════════
//  PREVIEW MODE
// ════════════════════════════════════════════
let _previewPreviousData = null;

function previewMode() {
  const d = collectFormData();
  _previewPreviousData = deepClone(currentData);
  currentData = d;
  closeSettings();
  renderLanding();
  document.getElementById('preview-banner').classList.add('show');
}

function previewSave() {
  saveData(currentData);
  _previewPreviousData = null;
  document.getElementById('preview-banner').classList.remove('show');
  showToast('Salvato con successo!', 'success');
}

function previewCancel() {
  if (_previewPreviousData) {
    currentData = _previewPreviousData;
    _previewPreviousData = null;
    renderLanding();
  }
  document.getElementById('preview-banner').classList.remove('show');
}

// ════════════════════════════════════════════
//  REVIEWS
// ════════════════════════════════════════════
function renderReviews(reviews) {
  const section = document.getElementById('reviews-section');
  const container = document.getElementById('reviews-container');
  if (!section || !container) return;
  if (!reviews || reviews.length === 0) { section.style.display = 'none'; return; }
  container.innerHTML = '';
  reviews.forEach(function(r) {
    const text = currentLang === 'en' ? (r.textEn || r.textIt || '') : (r.textIt || r.textEn || '');
    const stars = '★'.repeat(Math.max(1, Math.min(5, r.stars || 5)));
    const card = document.createElement('div');
    card.className = 'review-card';
    card.innerHTML =
      '<div class="review-stars">' + escHtml(stars) + '</div>' +
      '<p class="review-text">"' + escHtml(text) + '"</p>' +
      '<div class="review-author">— ' + escHtml(r.author || '') + '</div>';
    container.appendChild(card);
  });
  section.style.display = '';
}


// ════════════════════════════════════════════
//  WHATSAPP FAB
// ════════════════════════════════════════════
function updateWaFab() {
  const fab = document.getElementById('wa-fab');
  if (!fab) return;
  const phone = ((currentData && currentData.hostPhone) || '').replace(/[\s\-\(\)]/g, '').replace(/^\+/, '');
  if (!phone || currentData.hostPhone === '+39 000 000 0000') { fab.style.display = 'none'; fab.classList.remove('visible'); return; }
  const aptName = (currentData && currentData.apts && currentData.apts[currentAptIndex]) ? currentData.apts[currentAptIndex].name : '';
  const msg = encodeURIComponent('Ciao! Sono un ospite di ' + aptName + ', avrei bisogno di assistenza.');
  fab.onclick = function() { window.open('https://wa.me/' + phone + '?text=' + msg, '_blank'); };
  fab.style.display = '';
  setTimeout(() => fab.classList.add('visible'), 50);
}

// ════════════════════════════════════════════
//  CHAR COUNTER (textarea)
// ════════════════════════════════════════════
function initCharCounters() {
  document.querySelectorAll('#settings-panel textarea').forEach(function(ta) {
    if (ta.nextElementSibling && ta.nextElementSibling.classList.contains('char-counter')) return;
    const counter = document.createElement('div');
    counter.className = 'char-counter';
    counter.style.cssText = 'font-size:11px;color:var(--text2);text-align:right;margin-top:2px';
    ta.parentNode.appendChild(counter);
    var update = function() {
      var len = ta.value.length;
      counter.textContent = len + ' caratteri';
      counter.style.color = len > 500 ? 'var(--accent)' : 'var(--text2)';
    };
    ta.addEventListener('input', update);
    update();
  });
}

// ════════════════════════════════════════════
//  THEME (Dark/Light)
// ════════════════════════════════════════════
function applyTheme(theme) {
  document.documentElement.className = document.documentElement.className
    .replace(/\b(light-theme|theme-roma|theme-romantic|theme-minimal)\b/g, '').trim();
  if (theme === 'light') document.documentElement.classList.add('light-theme');
  else if (theme === 'roma') document.documentElement.classList.add('theme-roma');
  else if (theme === 'romantic') document.documentElement.classList.add('theme-romantic');
  else if (theme === 'minimal') document.documentElement.classList.add('theme-minimal');
  localStorage.setItem('bnb_theme', theme);
  document.querySelectorAll('.theme-option').forEach(function(el) {
    el.classList.toggle('active', el.dataset.theme === theme);
  });
}

function selectTheme(theme) {
  applyTheme(theme);
}

function toggleTheme() {
  const current = localStorage.getItem('bnb_theme') || 'dark';
  applyTheme(current === 'dark' ? 'light' : 'dark');
  document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
    btn.textContent = (localStorage.getItem('bnb_theme') === 'dark') ? '☀️' : '🌙';
  });
}



// ════════════════════════════════════════════
//  NAVIGATION ANIMATIONS
// ════════════════════════════════════════════
const TAB_ORDER = ['home', 'stay', 'places', 'food', 'transport', 'departure'];
let _currentTabId = 'home';

function showTab(tabId) {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const currentIdx = TAB_ORDER.indexOf(_currentTabId);
  const nextIdx = TAB_ORDER.indexOf(tabId);
  const direction = nextIdx > currentIdx ? 'right' : 'left';

  document.querySelectorAll('.tab-section.active').forEach(section => {
    if (!prefersReduced) {
      section.classList.add(direction === 'right' ? 'slide-out-left' : 'slide-out-right');
    }
    section.classList.remove('active');
    if (!prefersReduced) {
      section.classList.remove('slide-out-left', 'slide-out-right');
    }
  });

  const next = document.getElementById('tab-' + tabId);
  if (next) {
    next.classList.remove('slide-out-left', 'slide-out-right', 'slide-in-left', 'slide-in-right');
    if (!prefersReduced && tabId !== _currentTabId) {
      next.classList.add(direction === 'right' ? 'slide-in-right' : 'slide-in-left');
    }
    next.classList.add('active');
  }

  document.querySelectorAll('.nav-item[data-tab]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
  });

  const content = document.getElementById('guide-content');
  if (content) content.scrollTop = 0;
  window.scrollTo(0, 0);

  _currentTabId = tabId;
}

// ════════════════════════════════════════════
//  OFFLINE INDICATOR
// ════════════════════════════════════════════
function initOfflineIndicator() {
  const banner = document.getElementById('offline-banner');
  if (!banner) return;
  function updateStatus() {
    if (navigator.onLine) {
      banner.classList.remove('show');
    } else {
      banner.classList.add('show');
    }
  }
  window.addEventListener('online', updateStatus);
  window.addEventListener('offline', updateStatus);
  updateStatus();
}

// ════════════════════════════════════════════
//  SWIPE GESTURES
// ════════════════════════════════════════════
function initSwipeGestures() {
  const content = document.getElementById('guide-content');
  if (!content) return;
  let touchStartX = 0;
  let touchStartY = 0;
  const SWIPE_THRESHOLD = 50;
  const SWIPE_MAX_VERTICAL = 80;

  content.addEventListener('touchstart', function(e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  content.addEventListener('touchend', function(e) {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = Math.abs(e.changedTouches[0].clientY - touchStartY);
    if (Math.abs(dx) > SWIPE_THRESHOLD && dy < SWIPE_MAX_VERTICAL) {
      const currentIdx = TAB_ORDER.indexOf(_currentTabId);
      if (dx < 0 && currentIdx < TAB_ORDER.length - 1) {
        showTab(TAB_ORDER[currentIdx + 1]);
      } else if (dx > 0 && currentIdx > 0) {
        showTab(TAB_ORDER[currentIdx - 1]);
      }
    }
  }, { passive: true });
}

// ════════════════════════════════════════════
//  SCROLL TO TOP
// ════════════════════════════════════════════
function scrollToTop() {
  const content = document.getElementById('guide-content');
  if (content) content.scrollTo({ top: 0, behavior: 'smooth' });
}

function initScrollTopBtn() {
  const content = document.getElementById('guide-content');
  const btn = document.getElementById('scroll-top-btn');
  if (!content || !btn) return;
  content.addEventListener('scroll', function() {
    if (content.scrollTop > 200) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });
}

// ════════════════════════════════════════════
//  INIT
// ════════════════════════════════════════════
function init() {
  currentData = loadData();

  // Splash screen
  const splash = document.getElementById('splash-screen');
  if (splash) {
    const nameEl = document.getElementById('splash-bbname');
    if (nameEl) nameEl.textContent = currentData.bbName || 'Guest Guide';
    setTimeout(function () {
      splash.classList.add('fade-out');
      setTimeout(function () { splash.style.display = 'none'; }, 300);
    }, 1500);
  }

  // Analytics: track visit on page load
  if (typeof GuestAnalytics !== 'undefined') GuestAnalytics.trackVisit();

  const savedTheme = localStorage.getItem('bnb_theme') ||
    (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  applyTheme(savedTheme);

  migratePinIfNeeded();

  (function() {
    try {
      var params = new URLSearchParams(window.location.search);
      var aptParam = params.get('apt');
      if (aptParam !== null) {
        var aptIdx = parseInt(aptParam, 10);
        if (!isNaN(aptIdx) && aptIdx >= 0 && aptIdx < (currentData.apts || []).length) {
          renderApp(aptIdx);
          return;
        }
      }
    } catch(e) {}
    renderLanding();
  })();

  document.addEventListener('keydown', function(e) {
    if (!document.getElementById('pin-modal').classList.contains('open')) return;
    if (e.key >= '0' && e.key <= '9') { e.preventDefault(); pinKey(e.key); }
    else if (e.key === 'Backspace') { e.preventDefault(); pinBackspace(); }
    else if (e.key === 'Escape') closePinModal();
  });

  initOfflineIndicator();
  initSwipeGestures();
  initScrollTopBtn();
}
