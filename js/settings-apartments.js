// ════════════════════════════════════════════
//  SETTINGS: APARTMENTS MANAGEMENT
// ════════════════════════════════════════════

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

