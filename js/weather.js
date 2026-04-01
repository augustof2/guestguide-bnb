// ════════════════════════════════════════════
//  WEATHER WIDGET — Open-Meteo API
// ════════════════════════════════════════════
const WEATHER_CACHE_KEY = 'bnb_weather_cache';
const WEATHER_CACHE_TTL = 30 * 60 * 1000; // 30 minutes

const WMO_CODES = {
  0:'☀️', 1:'🌤️', 2:'⛅', 3:'☁️',
  45:'🌫️', 48:'🌫️',
  51:'🌦️', 53:'🌦️', 55:'🌧️',
  61:'🌧️', 63:'🌧️', 65:'🌧️',
  71:'❄️', 73:'❄️', 75:'❄️',
  80:'🌦️', 81:'🌧️', 82:'⛈️',
  95:'⛈️', 96:'⛈️', 99:'⛈️'
};

const WMO_LABELS_IT = {
  0:'Soleggiato', 1:'Quasi sereno', 2:'Parz. nuvoloso', 3:'Nuvoloso',
  45:'Nebbia', 48:'Nebbia ghiacciata',
  51:'Pioggia leggera', 53:'Pioggia', 55:'Pioggia forte',
  61:'Pioggia', 63:'Pioggia mod.', 65:'Pioggia forte',
  71:'Neve leggera', 73:'Neve', 75:'Neve forte',
  80:'Rovesci', 81:'Rovesci mod.', 82:'Rovesci forti',
  95:'Temporale', 96:'Temporale+grandine', 99:'Temporale forte'
};

const WMO_LABELS_EN = {
  0:'Sunny', 1:'Mostly clear', 2:'Partly cloudy', 3:'Overcast',
  45:'Fog', 48:'Icy fog',
  51:'Light rain', 53:'Rain', 55:'Heavy rain',
  61:'Rain', 63:'Mod. rain', 65:'Heavy rain',
  71:'Light snow', 73:'Snow', 75:'Heavy snow',
  80:'Showers', 81:'Mod. showers', 82:'Heavy showers',
  95:'Thunderstorm', 96:'Thunderstorm+hail', 99:'Heavy thunderstorm'
};

async function fetchWeather(lat, lon) {
  const cached = localStorage.getItem(WEATHER_CACHE_KEY);
  if (cached) {
    try {
      const {ts, data, clat, clon} = JSON.parse(cached);
      if (Date.now() - ts < WEATHER_CACHE_TTL && clat === lat && clon === lon) return data;
    } catch(e) {}
  }
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode,apparent_temperature&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=4`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error('Weather API error');
  const data = await resp.json();
  localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify({ts: Date.now(), data, clat: lat, clon: lon}));
  return data;
}

async function renderWeatherWidget(containerId, lat, lon, lang) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '<div class="weather-loading">🌤️ Caricamento meteo...</div>';
  try {
    // If no explicit coordinates were passed, try to extract them from the
    // current apartment's mapsUrl before falling back to hardcoded Rome coords.
    let resolvedLat = lat;
    let resolvedLon = lon;
    if (!resolvedLat || !resolvedLon) {
      try {
        const apt = currentData && currentData.apts && currentData.apts[currentAptIndex];
        const mapsUrl = apt && apt.mapsUrl;
        if (mapsUrl) {
          // Try ?q=lat,lon or @lat,lon patterns used by Google Maps
          const qMatch  = mapsUrl.match(/[?&]q=([-\d.]+),([-\d.]+)/);
          const atMatch = mapsUrl.match(/@([-\d.]+),([-\d.]+)/);
          const m = qMatch || atMatch;
          if (m) {
            resolvedLat = parseFloat(m[1]);
            resolvedLon = parseFloat(m[2]);
          }
        }
      } catch (e) {
        console.warn('[weather] Failed to parse coordinates from mapsUrl:', e);
        /* fall through to Rome defaults */
      }
    }
    const data = await fetchWeather(resolvedLat || 41.9028, resolvedLon || 12.4964);
    const cur = data.current;
    const daily = data.daily;
    const wmoCode = cur.weathercode;
    const emoji = WMO_CODES[wmoCode] || '🌤️';
    const label = lang === 'en' ? (WMO_LABELS_EN[wmoCode] || '') : (WMO_LABELS_IT[wmoCode] || '');
    const forecastLabel = lang === 'en' ? '3-day forecast' : 'Previsioni 3 giorni';
    const feelsLabel = lang === 'en' ? 'Feels like' : 'Percepita';

    const days = [];
    const dayNamesIT = ['Dom','Lun','Mar','Mer','Gio','Ven','Sab'];
    const dayNamesEN = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const dayNames = lang === 'en' ? dayNamesEN : dayNamesIT;
    for (let i = 1; i <= 3; i++) {
      if (!daily.time[i]) break;
      const d = new Date(daily.time[i]);
      const wmo = daily.weathercode[i];
      days.push(`<div class="weather-day"><div class="weather-day-name">${dayNames[d.getDay()]}</div><div class="weather-day-emoji">${WMO_CODES[wmo]||'🌤️'}</div><div class="weather-day-temp"><span class="temp-max">${Math.round(daily.temperature_2m_max[i])}°C</span><span class="temp-min">${Math.round(daily.temperature_2m_min[i])}°C</span></div></div>`);
    }

    container.innerHTML = `
      <div class="weather-card">
        <div class="weather-current">
          <div class="weather-emoji">${emoji}</div>
          <div class="weather-info">
            <div class="weather-temp">${Math.round(cur.temperature_2m)}°C</div>
            <div class="weather-label">${label}</div>
            <div class="weather-feels">${feelsLabel}: ${Math.round(cur.apparent_temperature)}°C</div>
          </div>
        </div>
        <div class="weather-forecast">
          <div class="weather-forecast-label">${forecastLabel}</div>
          <div class="weather-days">${days.join('')}</div>
        </div>
      </div>`;
  } catch(e) {
    container.innerHTML = `<div class="weather-unavailable">${lang==='en'?'🌤️ Weather unavailable':'🌤️ Meteo non disponibile'}</div>`;
  }
}
