// ════════════════════════════════════════════
//  DEFAULT DATA
// ════════════════════════════════════════════
const DEFAULT_DATA = {
  bbName: "Il Tuo B&B",
  subtitle: "Guest Guide",
  cityZone: "La Tua Città · Zona",
  hostName: "Nome Host",
  hostPhone: "+39 000 000 0000",
  googleReviewUrl: "",
  qrBaseUrl: '',
  supportPhone: '',
  customDomain: '',
  checkinSteps: [
    { icon: "📍", titleIt: "Raggiungi l'appartamento", titleEn: "Reach the apartment", descIt: "Segui le indicazioni su Google Maps per raggiungere l'indirizzo.", descEn: "Follow Google Maps directions to reach the address." },
    { icon: "🔑", titleIt: "Ritira le chiavi", titleEn: "Pick up the keys", descIt: "Le chiavi sono nella cassetta di sicurezza accanto alla porta. Il codice ti è stato inviato via messaggio.", descEn: "Keys are in the lockbox next to the door. The code was sent to you via message." },
    { icon: "🚪", titleIt: "Entra nell'appartamento", titleEn: "Enter the apartment", descIt: "Apri la porta e fai come se fossi a casa tua!", descEn: "Open the door and make yourself at home!" },
    { icon: "📶", titleIt: "Connettiti al WiFi", titleEn: "Connect to WiFi", descIt: "Il nome della rete e la password li trovi nella sezione Soggiorno.", descEn: "You can find the network name and password in the Stay section." }
  ],
  welcomeIt: "Siamo felici di avervi come ospiti! Questo appartamento è stato preparato con cura per rendere il vostro soggiorno indimenticabile. Siamo a vostra disposizione per qualsiasi necessità — non esitate a contattarci.",
  welcomeEn: "We are delighted to have you as our guests! This apartment has been carefully prepared to make your stay unforgettable. We are at your disposal for any need — do not hesitate to contact us.",
  closingTitleIt: "Grazie per aver scelto il nostro B&B!",
  closingTitleEn: "Thank you for choosing our B&B!",
  closingTextIt: "È stato un piacere avervi come ospiti. Speriamo di rivedervi presto! Buon viaggio! ✈️",
  closingTextEn: "It was a pleasure having you as our guests. We hope to see you again soon! Have a great trip! ✈️",
  extraContacts: [
    { name: "Secondo Contatto", phone: "+39 000 000 0001" }
  ],
  apts: [
    {
      name: "Appartamento 1",
      address: "Via Example 1, La Tua Città",
      addressShort: "Via Example 1",
      mapsLink: "#",
      maxGuests: "4 persone",
      maxGuestsEn: "4 people",
      bedroomTagsIt: "Letto matrimoniale,Armadio,Biancheria inclusa,Cuscini extra",
      bedroomTagsEn: "Double bed,Wardrobe,Linen included,Extra pillows",
      wifi: "NomeRete",
      wifiPass: obfuscate("password123"),
      checkin: "15:00",
      checkout: "10:00",
      lat: '',
      lon: '',
      howToReachIt: "Dalla stazione centrale: prendete la metro linea A fino alla fermata Centrale, poi 10 minuti a piedi. In taxi dal centro ~10€. Consigliamo di salvare l'indirizzo su Google Maps prima di partire.",
      howToReachEn: "From the central station: take metro line A to the Centrale stop, then 10 minutes on foot. Taxi from the centre ~€10. We recommend saving the address on Google Maps before you set off.",
      howToAccessIt: "Le chiavi vi verranno consegnate direttamente dall'host al vostro arrivo. In caso di check-in autonomo, troverete le istruzioni dettagliate via messaggio prima dell'arrivo.",
      howToAccessEn: "Keys will be handed to you directly by the host upon your arrival. In case of self check-in, you will find detailed instructions via message before your arrival.",
      parkingIt: "Parcheggio pubblico disponibile nelle vicinanze (~200 metri). Strisce blu a pagamento nei giorni feriali 8:00–20:00 (~€1,50/h). Parcheggio gratuito nelle strisce bianche.",
      parkingEn: "Public parking available nearby (~200 metres). Blue lines (paid) on weekdays 8:00–20:00 (~€1.50/h). Free parking on white lines.",
      houseRules: [
        { icon: "🔇", titleIt: "Silenzio Notturno", titleEn: "Quiet Hours", descIt: "Dalle 22:00 alle 8:00 si prega di mantenere il silenzio per rispetto dei vicini.", descEn: "From 22:00 to 08:00 please keep noise to a minimum out of respect for the neighbours." },
        { icon: "🚭", titleIt: "Niente Fumo", titleEn: "No Smoking", descIt: "Vietato fumare all'interno dell'appartamento. È possibile farlo sul balcone.", descEn: "Smoking inside the apartment is strictly prohibited. It is allowed on the balcony." },
        { icon: "🐾", titleIt: "Animali Domestici", titleEn: "Pets", descIt: "Gli animali domestici non sono ammessi senza previo accordo con l'host.", descEn: "Pets are not allowed without prior agreement with the host." },
        { icon: "👥", titleIt: "Ospiti Esterni", titleEn: "Outside Guests", descIt: "Non sono ammesse feste. Il numero di ospiti non deve superare la capienza massima indicata.", descEn: "No parties allowed. The number of guests must not exceed the maximum capacity indicated." },
        { icon: "♻️", titleIt: "Raccolta Rifiuti", titleEn: "Waste Sorting", descIt: "Si prega di rispettare la raccolta differenziata. Istruzioni in cucina.", descEn: "Please follow the recycling rules. Instructions are in the kitchen." }
      ],
      kitchenTagsIt: "Piano cottura,Forno,Frigorifero,Lavastoviglie,Caffettiera,Microonde",
      kitchenTagsEn: "Hob,Oven,Refrigerator,Dishwasher,Coffee machine,Microwave",
      bathroomTagsIt: "Doccia,Asciugamani,Phon,Prodotti igiene",
      bathroomTagsEn: "Shower,Towels,Hair dryer,Toiletries",
      extraServices: [
        { icon: "🧺", nameIt: "Cambio Biancheria", nameEn: "Linen Change", descIt: "Ogni 4 giorni su richiesta", descEn: "Every 4 days on request" },
        { icon: "🧹", nameIt: "Pulizie Aggiuntive", nameEn: "Additional Cleaning", descIt: "Disponibile su richiesta", descEn: "Available on request" },
        { icon: "🚗", nameIt: "Transfer Aeroporto", nameEn: "Airport Transfer", descIt: "Prenotabile in anticipo", descEn: "Bookable in advance" },
        { icon: "☕", nameIt: "Colazione", nameEn: "Breakfast", descIt: "Disponibile su richiesta", descEn: "Available on request" }
      ],
      places: [
        { name: "Monumento Principale", emoji: "🏛", descIt: "Il monumento più famoso della città. Perfetto per chi ama la storia.", descEn: "The most famous monument in the city. Perfect for history lovers.", howIt: "🚇 Metro linea A → fermata Centrale → 10 min a piedi.", howEn: "🚇 Metro line A → Centrale stop → 10 min on foot.", maps: "#" },
        { name: "Piazza Centrale", emoji: "⛲", descIt: "La piazza principale della città, cuore della vita sociale.", descEn: "The main square of the city, heart of social life.", howIt: "🚌 Bus 10 o 20 → fermata Piazza Centrale.", howEn: "🚌 Bus 10 or 20 → Piazza Centrale stop.", maps: "#" },
        { name: "Chiesa Storica", emoji: "🎭", descIt: "Un'importante chiesa storica con architettura medievale.", descEn: "An important historic church with medieval architecture.", howIt: "🚶 A piedi ~15 minuti dal centro.", howEn: "🚶 On foot ~15 minutes from the centre.", maps: "#" },
        { name: "Parco Panoramico", emoji: "🍊", descIt: "Parco con vista panoramica sulla città. Accesso libero.", descEn: "Park with a panoramic view over the city. Free admission.", howIt: "🚌 Bus 5 → fermata Parco.", howEn: "🚌 Bus 5 → Parco stop.", maps: "#" },
        { name: "Museo Locale", emoji: "🏺", descIt: "Il museo principale della zona con collezioni locali.", descEn: "The main local museum with regional collections.", howIt: "🚇 Metro → fermata Museo.", howEn: "🚇 Metro → Museo stop.", maps: "#" }
      ],
      restaurants: [
        { name: "Ristorante Da Mario", emoji: "🍝", tipo: "Trattoria · Vicino a casa", descIt: "Cucina tipica italiana. Ottimi primi piatti. Prenotazione consigliata.", descEn: "Typical Italian cuisine. Excellent pasta dishes. Booking recommended.", price: "€€", maps: "#" },
        { name: "Pizzeria Il Forno", emoji: "🍕", tipo: "Pizzeria · Zona centro", descIt: "Ottima pizza napoletana cotta in forno a legna.", descEn: "Excellent Neapolitan pizza cooked in a wood-fired oven.", price: "€", maps: "#" },
        { name: "Bar Centrale", emoji: "☕", tipo: "Bar · Colazione", descIt: "Il bar perfetto per la colazione: cappuccino e cornetto.", descEn: "The perfect bar for breakfast: cappuccino and croissant.", price: "€", maps: "#" },
        { name: "Osteria del Porto", emoji: "🍷", tipo: "Osteria · Cucina di pesce", descIt: "Specialità di pesce fresco. Atmosfera accogliente.", descEn: "Fresh fish specialities. Welcoming atmosphere.", price: "€€€", maps: "#" }
      ],
      supermarkets: [
        { name: "Supermercato", emoji: "🛒", tipo: "", descIt: "Supermercato più vicino a ~300 metri. Orari: Lun–Sab 8:00–20:00, Dom 9:00–13:00.", descEn: "Nearest supermarket ~300 metres away. Hours: Mon–Sat 8:00–20:00, Sun 9:00–13:00.", price: "", maps: "" }
      ],
      checkoutSteps: [
        { titleIt: "Raccogliete i vostri effetti personali", titleEn: "Collect your personal belongings", descIt: "Controllate tutti i cassetti, armadi e il bagno per non dimenticare nulla.", descEn: "Check all drawers, wardrobes and the bathroom so you don't forget anything." },
        { titleIt: "Lasciate le chiavi", titleEn: "Leave the keys", descIt: "Depositate le chiavi nel luogo indicato dall'host al momento del check-in.", descEn: "Leave the keys in the place indicated by the host at check-in." },
        { titleIt: "Rifiuti e raccolta differenziata", titleEn: "Waste and recycling", descIt: "Smaltite i rifiuti negli appositi contenitori seguendo le istruzioni in cucina.", descEn: "Dispose of waste in the appropriate containers following the instructions in the kitchen." },
        { titleIt: "Lasciate una recensione", titleEn: "Leave a review", descIt: "Se avete apprezzato il soggiorno, la vostra recensione è un grande aiuto per noi!", descEn: "If you enjoyed your stay, your review is a huge help for us!" }
      ],
      transport: {
        airportEnabled: true,
        airportIcon: "✈️",
        airportIt: "All'uscita dell'aeroporto trovi i taxi ufficiali. Tariffa fissa ~50–60€ per il centro. In alternativa, treno diretto per la stazione centrale ogni 30 min (~14€).",
        airportEn: "At the airport exit you will find official taxis. Fixed fare ~€50–60 to the city centre. Alternatively, direct train to the central station every 30 min (~€14).",
        airportMaps: "",
        stationEnabled: true,
        stationIcon: "🚉",
        stationIt: "Dalla stazione puoi prendere metro, autobus o taxi per raggiungere l'appartamento. La fermata metro è a 5 min a piedi.",
        stationEn: "From the station you can take the metro, bus or taxi to reach the apartment. The metro stop is 5 min on foot.",
        stationMaps: "",
        metroEnabled: true,
        metroIcon: "🚇",
        metroIt: "Fermata più vicina: Centrale (Linea A) a 800 metri dall'appartamento.",
        metroEn: "Nearest stop: Centrale (Line A), 800 metres from the apartment.",
        metroMaps: "",
        busEnabled: true,
        busIcon: "🚌",
        busIt: "Linee principali: Bus 10, 20, 30 verso il centro. Fermata a 200 metri dall'appartamento.",
        busEn: "Main lines: Bus 10, 20, 30 towards the city centre. Stop 200 metres from the apartment.",
        busMaps: "",
        ticketsIt: "Biglietto singolo: ~€1,50 (valido 90 minuti). Abbonamento giornaliero: ~€5,00. Acquisto alle macchinette in stazione o tramite app.",
        ticketsEn: "Single ticket: ~€1.50 (valid 90 minutes). Daily pass: ~€5.00. Purchase at station machines or via app.",
        taxiIt: "Taxi ufficiali: trovate i posteggi in piazza principale e in stazione. App consigliate: Uber, FREE NOW, Bolt. Tariffa minima ~€5.",
        taxiEn: "Official taxis: you'll find stands at the main square and at the station. Recommended apps: Uber, FREE NOW, Bolt. Minimum fare ~€5."
      }
    },
    {
      name: "Appartamento 2",
      address: "Via Example 2, La Tua Città",
      addressShort: "Via Example 2",
      mapsLink: "#",
      maxGuests: "4 persone",
      maxGuestsEn: "4 people",
      bedroomTagsIt: "Letto matrimoniale,Armadio,Biancheria inclusa,Cuscini extra",
      bedroomTagsEn: "Double bed,Wardrobe,Linen included,Extra pillows",
      wifi: "NomeRete2",
      wifiPass: obfuscate("password456"),
      checkin: "15:00",
      checkout: "10:00",
      lat: '',
      lon: '',
      howToReachIt: "Dalla stazione centrale: prendete la metro linea A fino alla fermata Centrale, poi 10 minuti a piedi. In taxi dal centro ~10€. Consigliamo di salvare l'indirizzo su Google Maps prima di partire.",
      howToReachEn: "From the central station: take metro line A to the Centrale stop, then 10 minutes on foot. Taxi from the centre ~€10. We recommend saving the address on Google Maps before you set off.",
      howToAccessIt: "Le chiavi vi verranno consegnate direttamente dall'host al vostro arrivo. In caso di check-in autonomo, troverete le istruzioni dettagliate via messaggio prima dell'arrivo.",
      howToAccessEn: "Keys will be handed to you directly by the host upon your arrival. In case of self check-in, you will find detailed instructions via message before your arrival.",
      parkingIt: "Parcheggio pubblico disponibile nelle vicinanze (~200 metri). Strisce blu a pagamento nei giorni feriali 8:00–20:00 (~€1,50/h). Parcheggio gratuito nelle strisce bianche.",
      parkingEn: "Public parking available nearby (~200 metres). Blue lines (paid) on weekdays 8:00–20:00 (~€1.50/h). Free parking on white lines.",
      houseRules: [
        { icon: "🔇", titleIt: "Silenzio Notturno", titleEn: "Quiet Hours", descIt: "Dalle 22:00 alle 8:00 si prega di mantenere il silenzio per rispetto dei vicini.", descEn: "From 22:00 to 08:00 please keep noise to a minimum out of respect for the neighbours." },
        { icon: "🚭", titleIt: "Niente Fumo", titleEn: "No Smoking", descIt: "Vietato fumare all'interno dell'appartamento. È possibile farlo sul balcone.", descEn: "Smoking inside the apartment is strictly prohibited. It is allowed on the balcony." },
        { icon: "🐾", titleIt: "Animali Domestici", titleEn: "Pets", descIt: "Gli animali domestici non sono ammessi senza previo accordo con l'host.", descEn: "Pets are not allowed without prior agreement with the host." },
        { icon: "👥", titleIt: "Ospiti Esterni", titleEn: "Outside Guests", descIt: "Non sono ammesse feste. Il numero di ospiti non deve superare la capienza massima indicata.", descEn: "No parties allowed. The number of guests must not exceed the maximum capacity indicated." },
        { icon: "♻️", titleIt: "Raccolta Rifiuti", titleEn: "Waste Sorting", descIt: "Si prega di rispettare la raccolta differenziata. Istruzioni in cucina.", descEn: "Please follow the recycling rules. Instructions are in the kitchen." }
      ],
      kitchenTagsIt: "Piano cottura,Forno,Frigorifero,Lavastoviglie,Caffettiera,Microonde",
      kitchenTagsEn: "Hob,Oven,Refrigerator,Dishwasher,Coffee machine,Microwave",
      bathroomTagsIt: "Doccia,Asciugamani,Phon,Prodotti igiene",
      bathroomTagsEn: "Shower,Towels,Hair dryer,Toiletries",
      extraServices: [
        { icon: "🧺", nameIt: "Cambio Biancheria", nameEn: "Linen Change", descIt: "Ogni 4 giorni su richiesta", descEn: "Every 4 days on request" },
        { icon: "🧹", nameIt: "Pulizie Aggiuntive", nameEn: "Additional Cleaning", descIt: "Disponibile su richiesta", descEn: "Available on request" },
        { icon: "🚗", nameIt: "Transfer Aeroporto", nameEn: "Airport Transfer", descIt: "Prenotabile in anticipo", descEn: "Bookable in advance" },
        { icon: "☕", nameIt: "Colazione", nameEn: "Breakfast", descIt: "Disponibile su richiesta", descEn: "Available on request" }
      ],
      places: [
        { name: "Monumento Principale", emoji: "🏛", descIt: "Il monumento più famoso della città. Perfetto per chi ama la storia.", descEn: "The most famous monument in the city. Perfect for history lovers.", howIt: "🚇 Metro linea A → fermata Centrale → 10 min a piedi.", howEn: "🚇 Metro line A → Centrale stop → 10 min on foot.", maps: "#" },
        { name: "Piazza Centrale", emoji: "⛲", descIt: "La piazza principale della città, cuore della vita sociale.", descEn: "The main square of the city, heart of social life.", howIt: "🚌 Bus 10 o 20 → fermata Piazza Centrale.", howEn: "🚌 Bus 10 or 20 → Piazza Centrale stop.", maps: "#" },
        { name: "Chiesa Storica", emoji: "🎭", descIt: "Un'importante chiesa storica con architettura medievale.", descEn: "An important historic church with medieval architecture.", howIt: "🚶 A piedi ~15 minuti dal centro.", howEn: "🚶 On foot ~15 minutes from the centre.", maps: "#" },
        { name: "Parco Panoramico", emoji: "🍊", descIt: "Parco con vista panoramica sulla città. Accesso libero.", descEn: "Park with a panoramic view over the city. Free admission.", howIt: "🚌 Bus 5 → fermata Parco.", howEn: "🚌 Bus 5 → Parco stop.", maps: "#" },
        { name: "Museo Locale", emoji: "🏺", descIt: "Il museo principale della zona con collezioni locali.", descEn: "The main local museum with regional collections.", howIt: "🚇 Metro → fermata Museo.", howEn: "🚇 Metro → Museo stop.", maps: "#" }
      ],
      restaurants: [
        { name: "Ristorante Da Mario", emoji: "🍝", tipo: "Trattoria · Vicino a casa", descIt: "Cucina tipica italiana. Ottimi primi piatti. Prenotazione consigliata.", descEn: "Typical Italian cuisine. Excellent pasta dishes. Booking recommended.", price: "€€", maps: "#" },
        { name: "Pizzeria Il Forno", emoji: "🍕", tipo: "Pizzeria · Zona centro", descIt: "Ottima pizza napoletana cotta in forno a legna.", descEn: "Excellent Neapolitan pizza cooked in a wood-fired oven.", price: "€", maps: "#" },
        { name: "Bar Centrale", emoji: "☕", tipo: "Bar · Colazione", descIt: "Il bar perfetto per la colazione: cappuccino e cornetto.", descEn: "The perfect bar for breakfast: cappuccino and croissant.", price: "€", maps: "#" },
        { name: "Osteria del Porto", emoji: "🍷", tipo: "Osteria · Cucina di pesce", descIt: "Specialità di pesce fresco. Atmosfera accogliente.", descEn: "Fresh fish specialities. Welcoming atmosphere.", price: "€€€", maps: "#" }
      ],
      supermarkets: [
        { name: "Supermercato", emoji: "🛒", tipo: "", descIt: "Supermercato più vicino a ~300 metri. Orari: Lun–Sab 8:00–20:00, Dom 9:00–13:00.", descEn: "Nearest supermarket ~300 metres away. Hours: Mon–Sat 8:00–20:00, Sun 9:00–13:00.", price: "", maps: "" }
      ],
      checkoutSteps: [
        { titleIt: "Raccogliete i vostri effetti personali", titleEn: "Collect your personal belongings", descIt: "Controllate tutti i cassetti, armadi e il bagno per non dimenticare nulla.", descEn: "Check all drawers, wardrobes and the bathroom so you don't forget anything." },
        { titleIt: "Lasciate le chiavi", titleEn: "Leave the keys", descIt: "Depositate le chiavi nel luogo indicato dall'host al momento del check-in.", descEn: "Leave the keys in the place indicated by the host at check-in." },
        { titleIt: "Rifiuti e raccolta differenziata", titleEn: "Waste and recycling", descIt: "Smaltite i rifiuti negli appositi contenitori seguendo le istruzioni in cucina.", descEn: "Dispose of waste in the appropriate containers following the instructions in the kitchen." },
        { titleIt: "Lasciate una recensione", titleEn: "Leave a review", descIt: "Se avete apprezzato il soggiorno, la vostra recensione è un grande aiuto per noi!", descEn: "If you enjoyed your stay, your review is a huge help for us!" }
      ],
      transport: {
        airportEnabled: true,
        airportIcon: "✈️",
        airportIt: "All'uscita dell'aeroporto trovi i taxi ufficiali. Tariffa fissa ~50–60€ per il centro. In alternativa, treno diretto per la stazione centrale ogni 30 min (~14€).",
        airportEn: "At the airport exit you will find official taxis. Fixed fare ~€50–60 to the city centre. Alternatively, direct train to the central station every 30 min (~€14).",
        airportMaps: "",
        stationEnabled: true,
        stationIcon: "🚉",
        stationIt: "Dalla stazione puoi prendere metro, autobus o taxi per raggiungere l'appartamento. La fermata metro è a 5 min a piedi.",
        stationEn: "From the station you can take the metro, bus or taxi to reach the apartment. The metro stop is 5 min on foot.",
        stationMaps: "",
        metroEnabled: true,
        metroIcon: "🚇",
        metroIt: "Fermata più vicina: Centrale (Linea A) a 800 metri dall'appartamento.",
        metroEn: "Nearest stop: Centrale (Line A), 800 metres from the apartment.",
        metroMaps: "",
        busEnabled: true,
        busIcon: "🚌",
        busIt: "Linee principali: Bus 10, 20, 30 verso il centro. Fermata a 200 metri dall'appartamento.",
        busEn: "Main lines: Bus 10, 20, 30 towards the city centre. Stop 200 metres from the apartment.",
        busMaps: "",
        ticketsIt: "Biglietto singolo: ~€1,50 (valido 90 minuti). Abbonamento giornaliero: ~€5,00. Acquisto alle macchinette in stazione o tramite app.",
        ticketsEn: "Single ticket: ~€1.50 (valid 90 minutes). Daily pass: ~€5.00. Purchase at station machines or via app.",
        taxiIt: "Taxi ufficiali: trovate i posteggi in piazza principale e in stazione. App consigliate: Uber, FREE NOW, Bolt. Tariffa minima ~€5.",
        taxiEn: "Official taxis: you'll find stands at the main square and at the station. Recommended apps: Uber, FREE NOW, Bolt. Minimum fare ~€5."
      }
    }
  ],
  navLabels: {
    homeIt: "Home",
    homeIcon: "🏠",
    stayIt: "Soggiorno",
    stayIcon: "🛋️",
    placesIt: "Luoghi",
    placesIcon: "🗺️",
    foodIt: "Mangiare",
    foodIcon: "🍽️",
    transportIt: "Muoversi",
    transportIcon: "🚇",
    departureIt: "Partenza",
    departureIcon: "🧳"
  },
  sectionTitles: {
    stayEyebrowIt: "Il Tuo Appartamento",
    stayTitleIt: "Soggiorno",
    placesEyebrowIt: "Scopri la Città",
    placesTitleIt: "Luoghi",
    foodEyebrowIt: "Dove Mangiare",
    foodTitleIt: "Mangiare",
    transportEyebrowIt: "In Città",
    transportTitleIt: "Muoversi",
    departureEyebrowIt: "È Ora di Partire",
    departureTitleIt: "Partenza"
  },
  reviews: [
    { author: "Maria R.", stars: 5, textIt: "Appartamento bellissimo, pulito e in posizione perfetta! L'host è stato molto disponibile.", textEn: "Beautiful apartment, clean and perfectly located! The host was very helpful." },
    { author: "John S.", stars: 5, textIt: "Esperienza fantastica! Torneremo sicuramente.", textEn: "Fantastic experience! We will definitely come back." },
    { author: "Sophie L.", stars: 5, textIt: "Tutto perfetto, dalla pulizia all'accoglienza. Consigliatissimo!", textEn: "Everything was perfect, from cleanliness to hospitality. Highly recommended!" }
  ]
};

/* PUBLISHED_DATA_START */
const PUBLISHED_DATA = {
  "bbName": "FF Elite Apartments",
  "subtitle": "GUIDA OSPITE",
  "cityZone": "Roma",
  "hostName": "Nicolò",
  "hostPhone": "+393342177311",
  "googleReviewUrl": "https://g.page/r/CZvIjdaReVG_EBM/review",
  "qrBaseUrl": "",
  "supportPhone": "+393450307922",
  "customDomain": "",
  "checkinSteps": [
    {
      "icon": "📍",
      "titleIt": "Raggiungi l'appartamento",
      "titleEn": "Reach the apartment",
      "descIt": "Segui le indicazioni su Google Maps per raggiungere l'indirizzo.",
      "descEn": "Follow Google Maps directions to reach the address."
    },
    {
      "icon": "🔑",
      "titleIt": "Ritira le chiavi",
      "titleEn": "Pick up the keys",
      "descIt": "Le chiavi sono nella cassetta di sicurezza accanto alla porta. Il codice ti è stato inviato via messaggio.",
      "descEn": "Keys are in the lockbox next to the door. The code was sent to you via message."
    },
    {
      "icon": "🚪",
      "titleIt": "Entra nell'appartamento",
      "titleEn": "Enter the apartment",
      "descIt": "Apri la porta e fai come se fossi a casa tua!",
      "descEn": "Open the door and make yourself at home!"
    },
    {
      "icon": "📶",
      "titleIt": "Connettiti al WiFi",
      "titleEn": "Connect to WiFi",
      "descIt": "Il nome della rete e la password li trovi nella sezione Soggiorno.",
      "descEn": "You can find the network name and password in the Stay section."
    }
  ],
  "welcomeIt": "Siamo felici di avervi come ospiti e rimaniamo a vostra disposizione per qualsiasi necessità — non esitate a contattarci.",
  "welcomeEn": "We are delighted to have you as our guests! This apartment has been carefully prepared to make your stay unforgettable. We are at your disposal for any need — do not hesitate to contact us.",
  "closingTitleIt": "Grazie per aver scelto il nostro B&B!",
  "closingTitleEn": "Thank you for choosing our B&B!",
  "closingTextIt": "È stato un piacere avervi come ospiti. Speriamo di rivedervi presto! Buon viaggio! ✈️",
  "closingTextEn": "It was a pleasure having you as our guests. We hope to see you again soon! Have a great trip! ✈️",
  "extraContacts": [],
  "apts": [
    {
      "name": "FF Elite Apartment - Nuovo Salario",
      "address": "Via Suvereto 330, 00139, Roma, Italia",
      "addressShort": "Via Suvereto 330",
      "mapsLink": "https://maps.app.goo.gl/Ttk5SWh85eUa2EKE9?g_st=ic",
      "maxGuests": "3 persone",
      "maxGuestsEn": "3 people",
      "wifi": "FF Elite Apartments",
      "wifiPass": "_OBF_AgsRGwoLbhYeHQ==",
      "checkin": "15:00",
      "checkout": "10:00",
      "lat": "",
      "lon": "",
      "howToReachIt": "",
      "howToReachEn": "",
      "howToAccessIt": "Le chiavi vi verranno consegnate direttamente dall'host al vostro arrivo. In caso di check-in autonomo, troverete le istruzioni dettagliate via messaggio prima dell'arrivo.",
      "howToAccessEn": "The keys will be given to you directly by the host upon your arrival. In case of self-check-in, you will find detailed instructions via message before arrival.",
      "parkingIt": "Parcheggi pubblici gratuiti sono disponibili nelle vicinanze (strisce bianche). A 500mt si trova GARAGE CERVIALTO a pagamento.",
      "parkingEn": "Free public parking is available nearby (white stripes). At 500m there is A PAID CERVIALTO GARAGE.",
      "bedroomTagsIt": "Letto matrimoniale,Jacuzzi,Bagno in Camera,Cabina Armadio,Biancheria,Cuscini extra",
      "bedroomTagsEn": "Double bed,Jacuzzi,En suite bathroom,Wardrobe,Linen, Extra pillows",
      "kitchenTagsIt": "Piano cottura,Forno,Frigorifero,Lavastoviglie,Caffettiera,Microonde",
      "kitchenTagsEn": "Cooktop,Oven,Refrigerator,Dishwasher,Coffee maker,Microwave",
      "bathroomTagsIt": "Doccia,Asciugamani,Phon,Prodotti igiene",
      "bathroomTagsEn": "Shower,Towels,Hairdryer, Hygiene products",
      "houseRules": [
        {
          "icon": "🔇",
          "titleIt": "Silenzio Notturno",
          "titleEn": "Quiet Hours",
          "descIt": "Dalle 23:00 alle 7:00 si prega di mantenere il silenzio per rispetto dei vicini.",
          "descEn": "From 23:00 to 08:00 please keep noise to a minimum out of respect for the neighbours."
        },
        {
          "icon": "🚭",
          "titleIt": "Vietato Fumare",
          "titleEn": "No Smoking",
          "descIt": "Vietato fumare all'interno dell'appartamento.",
          "descEn": "No smoking inside the apartment."
        },
        {
          "icon": "🐾",
          "titleIt": "Animali Domestici",
          "titleEn": "Pets",
          "descIt": "Gli animali domestici non sono ammessi senza previo accordo con l'host.",
          "descEn": "Pets are not allowed without prior agreement with the host."
        },
        {
          "icon": "👥",
          "titleIt": "Ospiti Esterni",
          "titleEn": "External guests",
          "descIt": "Non sono ammesse feste. Il numero di ospiti non deve superare la capienza massima indicata.",
          "descEn": "Parties are not allowed. The number of guests must not exceed the maximum capacity indicated."
        }
      ],
      "extraServices": [
        {
          "icon": "🧺",
          "nameIt": "Cambio Biancheria",
          "nameEn": "Linen Change",
          "descIt": "Ogni 4 giorni su richiesta (50€)",
          "descEn": "Every 4 days on request (€50)"
        },
        {
          "icon": "🧹",
          "nameIt": "Pulizie Aggiuntive",
          "nameEn": "Additional Cleaning",
          "descIt": "Disponibile su richiesta (50€)",
          "descEn": "Available on request (50€)"
        },
        {
          "icon": "🚗",
          "nameIt": "Transfer Aeroporto",
          "nameEn": "Airport transfers",
          "descIt": "Prenotabile in anticipo (50€)",
          "descEn": "Bookable in advance (€50)"
        },
        {
          "icon": "🛁",
          "nameIt": "Jacuzzi Pacchetto",
          "nameEn": "Jacuzzi Package",
          "descIt": "Disponibile su richiesta: prosecco, fiori, palloncini, cibo (da 30 a 60€)",
          "descEn": "Available on request: prosecco, flowers, balloons, food (from 30 to 60€)"
        }
      ],
      "places": [
        {
          "emoji": "🏛",
          "name": "Colosseo",
          "descIt": "il simbolo più famoso di Roma, un’antica arena imperiale che racconta la grandezza della storia romana. Imponente e suggestivo, è una tappa imperdibile per chi visita la città.",
          "descEn": "the most famous symbol of Rome, an ancient imperial arena that tells the greatness of Roman history. Imposing and evocative, it is an unmissable stop for those who visit the city.",
          "howIt": "autobus 80 (4 fermate) da Vimercati fino a Conca d’Oro + Metro B1 fino a Colosseo (8 fermate)",
          "howEn": "bus 80 (4 stops) from Vimercati to Conca d 'Oro + Metro B1 to Colosseum (8 stops)",
          "maps": "https://maps.app.goo.gl/hg9Zm6WKgg8PcrJG6?g_st=ic"
        },
        {
          "emoji": "⛪️",
          "name": "San Pietro",
          "descIt": "uno dei simboli più grandi della cristianità e un capolavoro del Rinascimento, con la sua imponente cupola michelangiolesca e gli interni ricchi di marmi, mosaici e sculture. È meta di pellegrinaggi e visitatori da tutto il mondo, perfetta per una visita lenta e contemplativa al centro del Vaticano.",
          "descEn": "one of the greatest symbols of Christianity and a masterpiece of the Renaissance, with its imposing Michelangelo dome and interiors rich in marble, mosaics and sculptures. It is a destination for pilgrims and visitors from all over the world, perfect for a slow and contemplative visit to the center of the Vatican.",
          "howIt": "autobus 80 (14 fermate) da Vimercati fino a Barberini oppure autobus 90 (14 fermate) fino a Termini + Metro A fino a Ottaviano (6 fermate)",
          "howEn": "bus 80 (14 stops) from Vimercati to Barberini or bus 90 (14 stops) to Termini + Metro A to Ottaviano (6 stops)",
          "maps": "https://maps.app.goo.gl/YvfySVmPFX7XZHhB7?g_st=ic"
        },
        {
          "emoji": "🎭",
          "name": "Pantheon",
          "descIt": "un tempio antico trasformato in chiesa, celebre per la sua cupola perfetta e per il grande oculus che illumina l’interno in modo suggestivo. È uno dei monumenti meglio conservati di Roma, simbolo di genio architettonico e di continuità fra mondo antico e moderno.",
          "descEn": "an ancient temple transformed into a church, famous for its perfect dome and for the large oculus that illuminates the interior in a suggestive way. It is one of the best preserved monuments in Rome, a symbol of architectural genius and continuity between the ancient and modern world.",
          "howIt": "autobus 80 da Vimercati (15 fermate)",
          "howEn": "80 bus from Vimercati (15 stops)",
          "maps": "https://maps.app.goo.gl/iCwfNkeNLb5BuB7z7?g_st=ic"
        },
        {
          "emoji": "📍",
          "name": "Altare della Patria",
          "descIt": "il grande monumento dedicato a Vittorio Emanuele II, al centro del Vittoriano, che domina Piazza Venezia. È un simbolo dell’unità d’Italia, con colonne, sculture e terrazze da cui si gode una vista spettacolare su Roma.",
          "descEn": "the large monument dedicated to Vittorio Emanuele II, in the centre of the Vittoriano, overlooking Piazza Venezia. It is a symbol of the unity of Italy, with columns, sculptures and terraces from which you can enjoy a spectacular view of Rome.",
          "howIt": "autobus 80 da Vimercati (16 fermate)",
          "howEn": "80 bus from Vimercati (16 stops)",
          "maps": "https://maps.app.goo.gl/n1p2aHj9ifofQNWa7?g_st=ic"
        },
        {
          "emoji": "⛲️",
          "name": "Fontana di Trevi",
          "descIt": "è la più celebre delle fontane di Roma, un trionfo barocco di statue, acqua e architettura ai piedi del Palazzo Poli. Luogo di riti, selfie e desideri (con la tradizione della moneta gettata nella vasca), è un must‑see per ogni visita alla città.",
          "descEn": "is the most famous of Rome's fountains, a Baroque triumph of statues, water and architecture at the foot of Palazzo Poli. Place of rituals, selfies and desires (with the tradition of the coin thrown into the tub), it is a must-see for every visit to the city.",
          "howIt": "autobus 80 da Vimercati (15 fermate)",
          "howEn": "80 bus from Vimercati (15 stops)",
          "maps": "https://maps.app.goo.gl/2rY5e4CFBBy9ANXV7?g_st=ic"
        }
      ],
      "restaurants": [
        {
          "emoji": "🍝",
          "name": "La Villetta dal 1940",
          "tipo": "",
          "descIt": "ristorante storico dove la tradizione romana incontra un’atmosfera autentica e accogliente. Piatti classici, materie prime eccellenti e un servizio familiare lo rendono una tappa perfetta per gustare la vera cucina locale.",
          "descEn": "a historic restaurant where the Roman tradition meets an authentic and welcoming atmosphere. Classic dishes, excellent raw materials and family service make it a perfect stop to enjoy real local cuisine.",
          "price": "€€",
          "maps": "https://maps.app.goo.gl/xTnhXpv9NNpGUBzt5?g_st=ic"
        },
        {
          "emoji": "🍕",
          "name": "50 Kalò",
          "tipo": "",
          "descIt": "una pizzeria rinomata per la sua impasto leggero e ingredienti di alta qualità, perfetta per chi cerca sapori tradizionali e genuini.",
          "descEn": "a pizzeria renowned for its light dough and high quality ingredients, perfect for those looking for traditional and genuine flavours.",
          "price": "€€",
          "maps": "https://maps.app.goo.gl/2ieGKwRM6HZFLYv19?g_st=ic"
        },
        {
          "emoji": "🐟",
          "name": "Ristorante Antamoro",
          "tipo": "",
          "descIt": "un elegante ristorante di pesce. Propone piatti curati e ingredienti freschissimi, perfetti per chi desidera gustare specialità di mare in un’atmosfera tranquilla e raffinata.",
          "descEn": "an elegant seafood restaurant. It offers carefully prepared dishes and fresh ingredients, perfect for those who want to enjoy seafood specialities in a quiet and refined atmosphere.",
          "price": "€€€",
          "maps": "https://maps.app.goo.gl/w9fsq3fu5fnMGtds6?g_st=ic"
        },
        {
          "emoji": "🥩",
          "name": "Carnesa Churrascaria Brasiliana",
          "tipo": "",
          "descIt": "dove il rodizio di carni alla brace incontra un’atmosfera vivace e accogliente. Ideale per chi vuole provare una grigliata sudamericana con tagli pregiati, ricco buffet di antipasti e il sapore autentico del Brasile.",
          "descEn": "where the rodizio of grilled meats meets a lively and welcoming atmosphere. Ideal for those who want to try a South American grill with fine cuts, a rich buffet of appetizers and the authentic flavour of Brazil.",
          "price": "€€€",
          "maps": "https://maps.app.goo.gl/iKoK5QjAvGYN6EaP7?g_st=ic"
        }
      ],
      "supermarkets": [
        {
          "emoji": "🛒",
          "name": "Todis",
          "tipo": "",
          "descIt": "discount di marca, volantini e promozioni frequenti, buona qualità per il prezzo.",
          "descEn": "brand discounts, frequent flyers and promotions, good quality for the price.",
          "price": "€",
          "maps": "https://maps.app.goo.gl/pCaVYYnRBV5epv9z5?g_st=ic"
        },
        {
          "emoji": "🛒",
          "name": "Conad",
          "tipo": "",
          "descIt": "catena medio‑alta, buon assortimento di prodotti freschi e convenzionali, prezzi più alti di Todis ma qualità spesso superiore.",
          "descEn": "medium-high chain, good assortment of fresh and conventional products, higher prices than Todis but often higher quality.",
          "price": "€€",
          "maps": "https://maps.app.goo.gl/zsLP9HziFEhAcCKE6?g_st=ic"
        }
      ],
      "transport": {
        "airportEnabled": true,
        "airportIcon": "✈️",
        "airportIt": "**Opzione 1: Taxi (più comoda, diretta)**\nI taxi ufficiali bianchi sono disponibili ai Terminal 1 e 3 (area arrivi). Il costo fisso per Roma centro è intorno ai 60/70€.\n\n**Opzione 2: Treno Leonardo Express + bus/metro**\nPrendete il Leonardo Express dalla stazione Fiumicino Aeroporto a Roma Termini. Da Termini, prendere la metro B direzione Rebibbia fino a Jonio, poi prendere l’autobus n. 80, 344 o 350 fino a fermata Suvereto/Calcinaia.\n\n**Opzione 3: Treno regionale FL1 + bus**\nTreno FL1 da Fiumicino a Nuovo Salario. Da Nuovo Salario, fermata a 10 min a piedi; altrimenti bus 69 o 349.",
        "airportEn": "**Option 1: Taxi (more convenient, direct)**\nOfficial white taxis are available at Terminals 1 and 3 (arrivals area). The fixed cost for central Rome is around 60/70€.\n\n**Option 2: Leonardo Express train + bus/metro**\nTake the Leonardo Express from Fiumicino Aeroporto station in Rome Termini. From Termini, take metro B towards Rebibbia until Jonio, then take bus no. 80, 344 or 350 until Suvereto/Calcinaia stop.\n\n**Option 3: Regional train FL1 + bus**\nFL1 train from Fiumicino to Nuovo Salario. From Nuovo Salario, 10 minutes walk otherwise bus 69 or 349.",
        "airportMaps": "https://maps.app.goo.gl/ryLrzD8CMPjSXJhw7?g_st=ic",
        "stationEnabled": true,
        "stationIcon": "🚉",
        "stationIt": "**Opzione 1: Taxi (più comoda, diretta)**\nI taxi ufficiali bianchi sono disponibili fuori dalla stazione Termini. Il costo per la nostra zona è intorno ai 25-35€.\n\n**Opzione 2: Metro + bus**  \nDa Termini, prendete la metro B verso Rebibbia fino a Jonio. Poi bus 80, 344 o 350 fino alla fermata Suvereto/Calcinaia.\n\n**Opzione 3: Treno regionale FL1/FL3 + bus/a piedi**  \nPrendete il treno FL1 o FL3 da Termini a Nuovo Salario. Dalla stazione Nuovo Salario, 10 minuti a piedi oppure bus 69 o 349.",
        "stationEn": "**Option 1: Taxi (most convenient, direct)**\nOfficial white taxis are available outside Termini station. The cost for our area is around 25-35€.\n\n**Option 2: Metro + bus**  \nFrom Termini, take metro B towards Rebibbia until Jonio. Then bus 80, 344 or 350 to the Suvereto/Calcinaia stop.\n\n**Option 3: Regional train FL1/FL3 + bus/walk**  \nTake the FL1 or FL3 train from Termini to Nuovo Salario. From Nuovo Salario station, a 10-minute walk or bus 69 or 349.",
        "stationMaps": "https://maps.app.goo.gl/YNQo7Vnp4HCVqFEB8?g_st=ic",
        "metroEnabled": false,
        "metroIcon": "🚇",
        "metroIt": "Fermata più vicina: Centrale (Linea A) a 800 metri dall'appartamento.",
        "metroEn": "Nearest stop: Central (Line A) 800 meters from the apartment.",
        "metroMaps": "https://maps.app.goo.gl/DnbiRpgZgTzxD2ni8?g_st=ic",
        "busEnabled": false,
        "busIcon": "🚌",
        "busIt": "Linee principali: Bus 10, 20, 30 verso il centro. Fermata a 200 metri dall'appartamento.",
        "busEn": "Main lines: Buses 10, 20, 30 to the centre. Stop 200 meters from the apartment.",
        "busMaps": "https://maps.app.goo.gl/Hs8CX6wZe4ifcZ8t6?g_st=ic",
        "ticketsIt": "Biglietto singolo: €1,50 (valido 90 minuti). Biglietto giornaliero: €8,50. Si possono acquistare presso le biglietterie, rivenditori autorizzati o via Tap & Go.",
        "ticketsEn": "Single ticket: €1.50 (valid for 90 minutes). Daily ticket: €8.50. You can buy them at ticket offices, authorized dealers or via Tap & Go.",
        "taxiIt": "Taxi ufficiali: trovate i posteggi in piazza principale e in stazione. App consigliate: Uber, FREE NOW.",
        "taxiEn": "Official taxis: find parking spaces in the main square and at the station. Recommended apps: Uber, FREE NOW."
      },
      "checkoutSteps": [
        {
          "titleIt": "Raccogliete i vostri effetti personali",
          "titleEn": "Collect your personal belongings",
          "descIt": "Controllate tutti i cassetti, armadi e il bagno per non dimenticare nulla.",
          "descEn": "Check all drawers, wardrobes and the bathroom so you don't forget anything."
        },
        {
          "titleIt": "Lasciate le chiavi",
          "titleEn": "Leave the keys",
          "descIt": "Depositate le chiavi nel luogo indicato dall'host al momento del check-in.",
          "descEn": "Deposit your keys at the location indicated by the host at check-in."
        },
        {
          "titleIt": "Rifiuti e raccolta differenziata",
          "titleEn": "waste management and separate collection",
          "descIt": "Smaltite i rifiuti negli appositi contenitori seguendo le istruzioni in cucina.",
          "descEn": "Dispose of the waste in the appropriate containers following the instructions in the kitchen."
        },
        {
          "titleIt": "Lasciate una recensione",
          "titleEn": "Leave a review",
          "descIt": "Se avete apprezzato il soggiorno, la vostra recensione è un grande aiuto per noi!",
          "descEn": "If you enjoyed your stay, your review is a great help for us!"
        }
      ]
    }
  ],
  "navLabels": {
    "homeIt": "Home",
    "homeEn": "",
    "homeIcon": "🏠",
    "stayIt": "Soggiorno",
    "stayEn": "",
    "stayIcon": "🛋️",
    "placesIt": "Luoghi",
    "placesEn": "",
    "placesIcon": "🗺️",
    "foodIt": "Mangiare",
    "foodEn": "",
    "foodIcon": "🍽️",
    "transportIt": "Muoversi",
    "transportEn": "",
    "transportIcon": "🚇",
    "departureIt": "Partenza",
    "departureEn": "",
    "departureIcon": "🧳"
  },
  "sectionTitles": {
    "stayEyebrowIt": "Il Tuo Appartamento",
    "stayEyebrowEn": "",
    "stayTitleIt": "Soggiorno",
    "stayTitleEn": "",
    "placesEyebrowIt": "Scopri la Città",
    "placesEyebrowEn": "",
    "placesTitleIt": "Luoghi",
    "placesTitleEn": "",
    "foodEyebrowIt": "Dove Mangiare",
    "foodEyebrowEn": "",
    "foodTitleIt": "Mangiare",
    "foodTitleEn": "",
    "transportEyebrowIt": "In Città",
    "transportEyebrowEn": "",
    "transportTitleIt": "Muoversi",
    "transportTitleEn": "",
    "departureEyebrowIt": "È Ora di Partire",
    "departureEyebrowEn": "",
    "departureTitleIt": "Partenza",
    "departureTitleEn": ""
  },
  "reviews": [
    {
      "author": "Maria Rosa",
      "stars": 5,
      "textIt": "Appartamento bellissimo, pulito e in posizione perfetta! L'host è stato molto disponibile",
      "textEn": "Beautiful apartment, clean and perfectly located! The host was very helpful"
    },
    {
      "author": "John Sa",
      "stars": 5,
      "textIt": "Esperienza fantastica! Torneremo sicuramente",
      "textEn": "Fantastic experience! We will definitely come back"
    },
    {
      "author": "Sophie L",
      "stars": 5,
      "textIt": "Tutto perfetto, dalla pulizia all'accoglienza. Consigliatissimo",
      "textEn": "Everything was perfect, from cleanliness to hospitality. Highly recommended"
    }
  ]
};
/* PUBLISHED_DATA_END */

// ════════════════════════════════════════════
//  STATE
// ════════════════════════════════════════════
let currentData = null;
let currentAptIndex = 0;
let currentRole = null; // 'host' | 'admin'
let settingsDirty = false;

// PIN state
let pinBuffer = '';
const PIN_KEY = 'bnb_admin_pin';
/* DEFAULT_PIN_HASH_START */
const DEFAULT_PIN_HASH = deobfuscateHash('Pm45Y2NoYmJpPmhraGM/bWhjaGI5OG08OTtjYj5sODs5OD9oPj9tODk7aWhrPzltPm1qY28+PG8/a2ptYmM8aw==');
/* DEFAULT_PIN_HASH_END */

// Login credentials state
const USER_KEY = 'bnb_admin_user';
const PASS_KEY = 'bnb_admin_pass';
/* DEFAULT_USER_HASH_START */
const DEFAULT_USER_HASH = deobfuscateHash('YjlsY21sP284b25ram5rbzg+P2NqYjg+bj4/P2tvPjw4a2xtO2M5Ym1pPDluODhiO2JrPGw8aDs4bm5iO2NrYg==');
/* DEFAULT_USER_HASH_END */
/* DEFAULT_PASS_HASH_START */
const DEFAULT_PASS_HASH = deobfuscateHash('YjlsY21sP284b25ram5rbzg+P2NqYjg+bj4/P2tvPjw4a2xtO2M5Ym1pPDluODhiO2JrPGw8aDs4bm5iO2NrYg==');
/* DEFAULT_PASS_HASH_END */

const RECOVERY_KEY = 'bnb_recovery_hash';
/* DEFAULT_RECOVERY_HASH_START */
const DEFAULT_RECOVERY_HASH = deobfuscateHash('P2w5aT47bzhoamxsaW4+bTxpPGlvYmw+bW5tPDw+OGlsOG85bG1vOGg4YjtuPz4+a2w4OD9sazloPz5vajlu');
/* DEFAULT_RECOVERY_HASH_END */

function getStoredRecoveryHash() {
  return localStorage.getItem(RECOVERY_KEY) || DEFAULT_RECOVERY_HASH;
}


function getStoredPinHash() {
  return localStorage.getItem(PIN_KEY) || DEFAULT_PIN_HASH;
}

function getStoredUserHash() {
  return localStorage.getItem(USER_KEY) || DEFAULT_USER_HASH;
}

function getStoredPassHash() {
  return localStorage.getItem(PASS_KEY) || DEFAULT_PASS_HASH;
}

// ════════════════════════════════════════════
//  DATA HELPERS
// ════════════════════════════════════════════
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function mergeWithDefaults(stored, defaults) {
  if (!stored || typeof stored !== 'object') return deepClone(defaults);
  const result = deepClone(defaults);
  for (const key of Object.keys(defaults)) {
    const sv = stored[key];
    const dv = defaults[key];
    if (sv === undefined || sv === null) {
      // When an English translation field (*En) is absent from stored data but the matching
      // Italian field (*It) is present, set the English field to an empty string so the
      // autoTranslateField onblur hook can auto-fill it the next time the admin opens the settings panel.
      if (typeof dv === 'string' && key.endsWith('En')) {
        const itKey = key.slice(0, -2) + 'It';
        if (stored[itKey] !== undefined && stored[itKey] !== null) {
          result[key] = '';
        }
      }
      continue;
    }
    if (Array.isArray(dv)) {
      if (Array.isArray(sv)) {
        // Preserve empty arrays (user intentionally cleared) and merge populated ones
        const tpl = dv[0] || {};
        result[key] = sv.length > 0 ? sv.map(item => mergeWithDefaults(item, tpl)) : [];
      }
    } else if (typeof dv === 'object') {
      if (typeof sv === 'object') result[key] = mergeWithDefaults(sv, dv);
    } else {
      result[key] = sv;
    }
  }
  return result;
}

function loadData() {
  try {
    const raw = localStorage.getItem('bnb_guide_data');
    if (raw) {
      const stored = JSON.parse(raw);
      // Migrate legacy contact2Name/contact2Phone to extraContacts array
      if ((stored.contact2Name !== undefined || stored.contact2Phone !== undefined) && !stored.extraContacts) {
        stored.extraContacts = [{ name: stored.contact2Name || '', phone: stored.contact2Phone || '' }];
        delete stored.contact2Name;
        delete stored.contact2Phone;
      }
      // Migrate global places/restaurants/transport/checkoutSteps to per-apt
      if (stored.apts && Array.isArray(stored.apts)) {
        stored.apts.forEach(apt => {
          if (apt.places === undefined && stored.places !== undefined) apt.places = stored.places;
          if (apt.restaurants === undefined && stored.restaurants !== undefined) apt.restaurants = stored.restaurants;
          if (apt.supermarkets === undefined) {
            if (stored.supermarkets !== undefined) {
              apt.supermarkets = stored.supermarkets;
            } else if (stored.supermarketIt !== undefined || stored.supermarketEn !== undefined || stored.supermarketMaps !== undefined || apt.supermarketIt !== undefined) {
              // Migrate old string fields to array
              const descIt = apt.supermarketIt || stored.supermarketIt || '';
              const descEn = apt.supermarketEn || stored.supermarketEn || '';
              const maps   = apt.supermarketMaps || stored.supermarketMaps || '';
              apt.supermarkets = descIt || descEn || maps
                ? [{ name: 'Supermercato', emoji: '🛒', tipo: '', descIt, descEn, price: '', maps }]
                : [];
              delete apt.supermarketIt; delete apt.supermarketEn; delete apt.supermarketMaps;
            }
          }
          if (apt.transport === undefined && stored.transport !== undefined) apt.transport = stored.transport;
          if (apt.checkoutSteps === undefined && stored.checkoutSteps !== undefined) apt.checkoutSteps = stored.checkoutSteps;
        });
      }
      return mergeWithDefaults(stored, DEFAULT_DATA);
    }
  } catch(e) { console.error('Failed to load saved data:', e); }
  if (PUBLISHED_DATA) return mergeWithDefaults(PUBLISHED_DATA, DEFAULT_DATA);
  return deepClone(DEFAULT_DATA);
}

function saveData(data) {
  try {
    localStorage.setItem('bnb_guide_data', JSON.stringify(data));
  } catch(e) { console.error('Failed to save data:', e); }
}



// ════════════════════════════════════════════
//  RATE LIMITING
// ════════════════════════════════════════════
const RATE_LIMIT_KEY = 'bnb_rate_limit';
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 60 * 1000; // 60 seconds

function checkRateLimit(type) {
  // Uses sessionStorage so the counter resets automatically when the tab is closed.
  try {
    const raw = sessionStorage.getItem(RATE_LIMIT_KEY);
    const data = raw ? JSON.parse(raw) : {};
    const entry = data[type] || { count: 0, lockedUntil: 0 };
    if (entry.lockedUntil && Date.now() < entry.lockedUntil) {
      return { locked: true, remaining: Math.ceil((entry.lockedUntil - Date.now()) / 1000) };
    }
    // Reset if lock expired
    if (entry.lockedUntil && Date.now() >= entry.lockedUntil) {
      entry.count = 0;
      entry.lockedUntil = 0;
      data[type] = entry;
      sessionStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(data));
    }
    return { locked: false, attempts: entry.count };
  } catch(e) { return { locked: false, attempts: 0 }; }
}

function recordFailedAttempt(type) {
  try {
    const raw = sessionStorage.getItem(RATE_LIMIT_KEY);
    const data = raw ? JSON.parse(raw) : {};
    const entry = data[type] || { count: 0, lockedUntil: 0 };
    entry.count = (entry.count || 0) + 1;
    if (entry.count >= MAX_ATTEMPTS) {
      entry.lockedUntil = Date.now() + LOCKOUT_DURATION;
      entry.count = 0;
    }
    data[type] = entry;
    sessionStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(data));
    return entry;
  } catch(e) { return { count: 0, lockedUntil: 0 }; }
}

function resetRateLimit(type) {
  try {
    const raw = sessionStorage.getItem(RATE_LIMIT_KEY);
    const data = raw ? JSON.parse(raw) : {};
    delete data[type];
    sessionStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(data));
  } catch(e) {}
}

// ════════════════════════════════════════════
//  CHANGE LOG
// ════════════════════════════════════════════
const CHANGELOG_KEY = 'bnb_changelog';
const MAX_CHANGELOG_ENTRIES = 50;

function getChangelog() {
  try {
    const raw = localStorage.getItem(CHANGELOG_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch(e) { return []; }
}

function addChangelogEntry(description, who) {
  try {
    const log = getChangelog();
    log.unshift({
      ts: Date.now(),
      desc: description,
      who: who || 'admin'
    });
    if (log.length > MAX_CHANGELOG_ENTRIES) log.splice(MAX_CHANGELOG_ENTRIES);
    localStorage.setItem(CHANGELOG_KEY, JSON.stringify(log));
  } catch(e) {}
}
