// ════════════════════════════════════════════
//  I18N — LANGUAGE SYSTEM
// ════════════════════════════════════════════
let currentLang = localStorage.getItem('bnb_lang') || 'it';

function setLang(lang) {
  currentLang = lang;
  localStorage.setItem('bnb_lang', lang);
  document.documentElement.lang = lang;
}

const UI_STRINGS = {
  it: {
    landingIntro: 'Benvenuti! Selezionate il vostro appartamento per accedere alla guida completa.',
    langBtnItTitle: 'Italiano',
    langBtnItSub:   'Guida Ospiti',
    langBtnEnTitle: 'English',
    langBtnEnSub:   'Guest Guide',
    superhost:      '★ Superhost',
    statCheckin:    'Check-in',
    statCheckout:   'Check-out',
    statWifi:       'WiFi',
    statMap:        'Mappa',
    openMaps:       'Apri Maps',
    openInMaps:     '🗺️ Google Maps',
    welcome:        'Benvenuti! 👋',
    exploreGuide:   'Esplora la guida',
    stayDesc:       'WiFi, regole, spazi, servizi',
    placesDesc:     'Attrazioni e punti di interesse',
    foodDesc:       'Ristoranti, bar, supermercati',
    transportDesc:  'Metro, bus, taxi, emergenze',
    departureDesc:  'Check-out e recensione',
    leaveReview:    '⭐ Lascia una Recensione su Google',
    howToReach:     'Come raggiungerci',
    howToAccess:    'Come accedere',
    parking:        'Parcheggio',
    houseRules:     '🏠 Regole della casa',
    spaces:         '🏡 Gli Spazi',
    bedroom:        'Camera da Letto',
    kitchen:        'Cucina',
    bathroom:       'Bagno',
    extraServices:  '✨ Servizi Extra',
    waHint:         '💬 Richiedi su WhatsApp',
    waRequest:      'Ciao! Vorrei richiedere il servizio: ',
    placesSubtitle: 'Le attrazioni più belle nei dintorni',
    foodSubtitle:   "I migliori locali consigliati dall'host",
    howToArrive:    'Come arrivarci',
    wazeBtn:        'Waze',
    supermarket:    'Supermercato',
    transportSubtitle: 'Come spostarsi in città',
    fromAirport:    "Dall'Aeroporto",
    fromStation:    'Dalla Stazione',
    metro:          'Metro',
    bus:            'Bus',
    tickets:        'Biglietti',
    taxiApp:        'Taxi & App',
    emergencies:    'Emergenze',
    hospital:       'Pronto Soccorso',
    police:         'Carabinieri',
    firefighters:   'Vigili del Fuoco',
    host:           'Host',
    call:           'Chiama',
    departureSubtitle: "Tutto quello che c'è da sapere prima di andare",
    atCheckout:     'Al Check-out',
    navHome:        'Home',
    navStay:        'Soggiorno',
    navPlaces:      'Luoghi',
    navFood:        'Mangiare',
    navTransport:   'Muoversi',
    navDeparture:   'Partenza',
    stayEyebrow:    'Il Tuo Appartamento',
    stayTitle:      'Soggiorno',
    placesEyebrow:  'Scopri la Città',
    placesTitle:    'Luoghi',
    foodEyebrow:    'Dove Mangiare',
    foodTitle:      'Mangiare',
    transportEyebrow: 'In Città',
    transportTitle: 'Muoversi',
    departureEyebrow: 'È Ora di Partire',
    departureTitle: 'Partenza',
    langToggle:     '🇬🇧 EN',
    selfCheckin:    'Self Check-in',
    arrivalInstructions: 'Istruzioni Arrivo'
  },
  en: {
    landingIntro:   'Welcome! Select your apartment to access the complete guide.',
    langBtnItTitle: 'Italiano',
    langBtnItSub:   'Guida Ospiti',
    langBtnEnTitle: 'English',
    langBtnEnSub:   'Guest Guide',
    superhost:      '★ Superhost',
    statCheckin:    'Check-in',
    statCheckout:   'Check-out',
    statWifi:       'WiFi',
    statMap:        'Map',
    openMaps:       'Open Maps',
    openInMaps:     '🗺️ Google Maps',
    welcome:        'Welcome! 👋',
    exploreGuide:   'Explore the guide',
    stayDesc:       'WiFi, rules, spaces, services',
    placesDesc:     'Attractions and points of interest',
    foodDesc:       'Restaurants, bars, supermarkets',
    transportDesc:  'Metro, bus, taxi, emergencies',
    departureDesc:  'Check-out and review',
    leaveReview:    '⭐ Leave a Review on Google',
    howToReach:     'How to reach us',
    howToAccess:    'How to access',
    parking:        'Parking',
    houseRules:     '🏠 House rules',
    spaces:         '🏡 Spaces',
    bedroom:        'Bedroom',
    kitchen:        'Kitchen',
    bathroom:       'Bathroom',
    extraServices:  '✨ Extra Services',
    waHint:         '💬 Request on WhatsApp',
    waRequest:      'Hello! I would like to request the service: ',
    placesSubtitle: 'Best attractions in the area',
    foodSubtitle:   'Best restaurants recommended by the host',
    howToArrive:    'How to get there',
    wazeBtn:        'Waze',
    supermarket:    'Supermarket',
    transportSubtitle: 'How to get around the city',
    fromAirport:    'From the Airport',
    fromStation:    'From the Station',
    metro:          'Metro',
    bus:            'Bus',
    tickets:        'Tickets',
    taxiApp:        'Taxi & Apps',
    emergencies:    'Emergencies',
    hospital:       'Emergency Room (118)',
    police:         'Carabinieri / Police (112)',
    firefighters:   'Fire Brigade (115)',
    host:           'Host',
    call:           'Call',
    departureSubtitle: 'Everything you need to know before you go',
    atCheckout:     'At Check-out',
    navHome:        'Home',
    navStay:        'Stay',
    navPlaces:      'Places',
    navFood:        'Food',
    navTransport:   'Getting around',
    navDeparture:   'Departure',
    stayEyebrow:    'Your Apartment',
    stayTitle:      'Your Stay',
    placesEyebrow:  'Discover the City',
    placesTitle:    'Places',
    foodEyebrow:    'Where to Eat',
    foodTitle:      'Food',
    transportEyebrow: 'Around the City',
    transportTitle: 'Getting Around',
    departureEyebrow: 'Time to Leave',
    departureTitle: 'Departure',
    langToggle:     '🇮🇹 IT',
    selfCheckin:    'Self Check-in',
    arrivalInstructions: 'Arrival Instructions'
  }
};

function t(key) {
  const strings = UI_STRINGS[currentLang] || UI_STRINGS.it;
  return strings[key] !== undefined ? strings[key] : (UI_STRINGS.it[key] !== undefined ? UI_STRINGS.it[key] : key);
}

// Returns obj[field+'En'] (if lang=en and present) → obj[field+'It'] → obj[field] → ''
function langField(obj, field) {
  if (!obj) return '';
  if (currentLang === 'en') {
    const v = obj[field + 'En'];
    if (v !== undefined && v !== null && v !== '') return v;
  }
  const vIt = obj[field + 'It'];
  if (vIt !== undefined && vIt !== null) return vIt;
  const vBase = obj[field];
  return (vBase !== undefined && vBase !== null) ? vBase : '';
}

function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
}
