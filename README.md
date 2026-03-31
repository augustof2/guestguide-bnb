# 🏨 GuestGuide B&B

Una **Guest Guide interattiva** per il tuo Bed & Breakfast — un singolo file `index.html` da deployare su GitHub Pages, con supporto bilingue IT/EN e un pannello di personalizzazione integrato.

---

## ▶️ Cosa fare adesso per vedere il sito

> Segui questi **3 passi** — bastano 5 minuti.

**Passo 1 — Fai il merge di questa Pull Request**
- Apri la [Pull Request #1](../../pull/1) su GitHub
- Se è marcata come *Draft*, clicca **"Ready for review"**
- Poi clicca **"Merge pull request"** → **"Confirm merge"**

**Passo 2 — Attiva GitHub Pages**
- Vai su **Settings** (menu in alto nel tuo repository)
- Nel menu laterale clicca **Pages**
- Sotto *Source* seleziona **GitHub Actions**
- Clicca **Save**

**Passo 3 — Aspetta 1-2 minuti e apri il link**
- Vai su **Actions** (menu in alto) e attendi che il deployment finisca (cerchio verde ✅)
- Il sito sarà live su: **`https://www.ffeliteapartments.github.io/`**

> 💡 Dopo aver aperto il sito, clicca il pulsante **⚙️** in basso a destra per personalizzare nome, appartamenti, WiFi, luoghi e tutto il resto — senza toccare il codice.

---

## 🌐 Come rendere visibili le tue personalizzazioni a tutti

Le personalizzazioni fatte tramite il pannello ⚙️ sono salvate nel tuo browser (`localStorage`). Per pubblicarle online in modo che **tutti** vedano la versione aggiornata, segui questi passi:

**1. Personalizza il sito** — Apri `https://www.ffeliteapartments.github.io/`, clicca ⚙️ e modifica tutti i campi. Poi clicca **💾 Salva e Applica**.

**2. Scarica l'HTML aggiornato** — Nel pannello ⚙️, clicca il pulsante **📥 Scarica HTML Aggiornato**. Verrà scaricato un file `index.html` con i tuoi dati incorporati.

**3. Carica su GitHub** — Vai su `https://github.com/augustof2/guestguide-bnb`, clicca sul file `index.html`, poi su ✏️ **Edit**, e incolla il contenuto del file scaricato. Oppure, se usi Git:
```bash
# Copia il file scaricato nella cartella del repo, poi:
git add index.html
git commit -m "Aggiorna dati B&B"
git push
```

**4. Attendi il deploy** — Il workflow si avvia automaticamente. Dopo 1-2 minuti il sito sarà live con i tuoi dati per tutti gli ospiti.

---

![Landing Page](https://github.com/user-attachments/assets/ee2fe4ec-a0c4-4ac8-afba-e66ebaec33bb)

---

## ✨ Funzionalità

- 📱 **Design mobile-first** (max 430px, stile app nativa)
- 🌐 **Bilingue IT/EN** — cambio lingua istantaneo
- 🏠 **Multi-appartamento** — supporto per più appartamenti
- 🗺️ **5 sezioni** — Home, Soggiorno, Luoghi, Mangiare, Muoversi
- ⚙️ **Pannello di personalizzazione** — modifica tutto dal browser senza toccare il codice
- 💾 **Salvataggio automatico** in `localStorage`
- 📋 **Esporta/Importa JSON** — per backup e condivisione delle impostazioni
- 📞 **Bottoni di chiamata** per emergenze e host
- 🧭 **Link Google Maps** per ogni luogo e ristorante
- 🔐 **Pannello Host (PIN)** — accesso semplificato per il proprietario B&B (solo sezioni operative)
- 🛡️ **Pannello Admin (Login)** — accesso completo per l'amministratore tecnico
- 📧 **Invia Modifiche** — l'host può notificare l'admin via email o download JSON
- 📱 **QR Code per ogni appartamento** — generati automaticamente, scaricabili e stampabili (solo Admin)
- 🔑 **Autenticazione doppia** — PIN e credenziali hashati con SHA-256

---

## 🚀 Deploy su GitHub Pages

Il repository include un workflow GitHub Actions che pubblica automaticamente il sito ogni volta che fai push su `main`.

### Primo Deploy (una sola volta)

1. Vai su **Settings → Pages** nel tuo repository
2. In **Source**, seleziona **GitHub Actions**
3. Clicca **Save**
4. Il sito si pubblicherà automaticamente ad ogni push su `main`
5. Sarà live su `https://www.ffeliteapartments.github.io/`

> **Nota:** Se vedi ancora una pagina vuota o un errore 404 subito dopo il merge, attendi 1-2 minuti che il deployment finisca, poi ricarica la pagina.

---

## ⚙️ Come Personalizzare

### Pannello HOST (PIN) — Per l'host del B&B
1. Apri il sito nel browser
2. Clicca il pulsante **⚙️** in basso a destra nella landing page
3. Inserisci il **PIN a 4 cifre** (default: `1234`)
4. Modifica i campi nel pannello semplificato:
   - 🏡 **Info B&B** — nome, sottotitolo, città, host, telefono
   - 🏠 **Appartamenti** — indirizzo, WiFi, check-in/out, Maps, regole
   - 🧳 **Partenza** — messaggi di chiusura IT/EN, link recensione Google
   - 🗺️ **Luoghi da Visitare** — 5 slot con descrizioni e link Maps
   - 🍽️ **Ristoranti** — 4 slot con tipo, descrizioni, fascia prezzi
   - 🚇 **Trasporti** — aeroporto, stazione, metro, bus
   - 📞 **Contatti Extra** — numeri utili aggiuntivi
   - 🔐 **Sicurezza** — cambio PIN
5. Clicca **💾 Salva e Applica** (viene chiesta conferma)
6. Clicca **📧 Invia Modifiche** per notificare l'amministratore

### Pannello ADMIN (Login) — Per l'amministratore tecnico
1. Apri il sito nel browser
2. Clicca il pulsante **⚙️**, poi **🛡️ Accesso Admin**
3. Inserisci username e password (default: `admin` / `admin`)
4. Hai accesso a **tutte** le sezioni, incluse:
   - 🎨 **Aspetto** — cambio tema chiaro/scuro
   - 🏷️ **Etichette Navigazione** — personalizza tutte le label
   - 🔐 **Sicurezza completa** — PIN + credenziali admin + recovery + GitHub Token
   - 📱 **QR Code** — visualizza, scarica e stampa QR per ogni appartamento
5. Usa **🚀 Pubblica Online** per aggiornare il sito su GitHub Pages

Apri `index.html` in un editor di testo e modifica l'oggetto `DEFAULT_DATA` all'inizio del tag `<script>`:

```javascript
const DEFAULT_DATA = {
  bbName: "Il Nome del Tuo B&B",
  subtitle: "Guest Guide",
  cityZone: "La Tua Città · Quartiere",
  hostName: "Mario Rossi",
  hostPhone: "+39 333 123 4567",
  // ... altri campi
};
```

---

## 📂 Struttura del Progetto

```
guide/
├── index.html                    ← tutto il codice (HTML + CSS + JS inline)
├── LICENSE                       ← licenza MIT
├── .nojekyll                     ← disabilita Jekyll su GitHub Pages
└── .github/workflows/deploy.yml ← auto-deploy su GitHub Pages
```

---

## 🔑 Autenticazione: Due Ruoli Separati

Il pannello ⚙️ è protetto da **due metodi di accesso** che aprono **pannelli diversi**:

### 🏡 Ruolo HOST — Accesso con PIN
- **Come accedere:** Inserisci il PIN a 4 cifre (default: `1234`)
- **Cosa vede:** Pannello semplificato ⚙️ con solo le sezioni utili:
  - 🏡 Info B&B, 🏠 Appartamenti, 🧳 Partenza, 🗺️ Luoghi, 🍽️ Ristoranti, 🚇 Trasporti, 📞 Contatti Extra, 🔐 Cambio PIN
- **Azioni disponibili:** 💾 Salva e Applica, 📧 Invia Modifiche, 👁️ Anteprima
- **NON vede:** Reset, Pubblica Online, GitHub Token, cambio credenziali admin, QR Code, etichette navigazione

### 🛡️ Ruolo ADMIN — Accesso con Login
- **Come accedere:** Clicca "🛡️ Accesso Admin" nel modal PIN, poi inserisci username e password (default: `admin` / `admin`)
- **Cosa vede:** Pannello completo con **tutte** le sezioni e funzionalità
- **Azioni disponibili:** 💾 Salva e Applica, 🗑️ Reset, 👁️ Anteprima, 🚀 Pubblica Online

Entrambe le credenziali sono hashate con SHA-256 e salvate in `localStorage`. Puoi cambiarle dal pannello Admin → sezione **🔐 Sicurezza**.

---

## 📧 "Invia Modifiche" — Flusso Host → Admin

L'host (persona non tecnica) può comunicare le sue modifiche all'amministratore tramite il pulsante **📧 Invia Modifiche**:

1. L'host salva le modifiche con 💾 Salva e Applica
2. L'host clicca **📧 Invia Modifiche**:
   - Se l'admin ha configurato la propria email (campo "📧 Email Admin" nel pannello Admin → Info B&B): si apre il client email con un messaggio precompilato contenente tutti i dati in JSON
   - Se l'email non è configurata: viene scaricato un file `guestguide-backup-YYYY-MM-DD.json` da inviare manualmente
3. L'admin riceve i dati, accede al pannello con il proprio login e usa **🚀 Pubblica Online** per aggiornare il sito

### Come configurare l'email Admin
1. Accedi al pannello con il login Admin (🛡️ Accesso Admin)
2. Apri la sezione **🏡 Info B&B**
3. Compila il campo **📧 Email Admin** (es. `ffeliteapartments@gmail.com`)
4. Clicca **💾 Salva e Applica** (e poi **🚀 Pubblica Online** per rendere la configurazione permanente)

---

## 📱 QR Code per Appartamenti

Ogni appartamento ha un **QR Code univoco** che punta direttamente alla sua guida (`?apt=0`, `?apt=1`, ecc.). Dal pannello ⚙️ → sezione **📱 QR Code** puoi:

- Visualizzare il QR di ogni appartamento
- Scaricare il QR come PNG con "📥 Scarica QR"
- Stampare tutti i QR con "🖨️ Stampa Tutti i QR"

Gli ospiti scansionano il QR e accedono direttamente alla guida dell'appartamento corretto, saltando la landing page.

---

## 🛠️ Tecnologie

- HTML5, CSS3, JavaScript vanilla
- Google Fonts (Playfair Display + Jost)
- Nessuna dipendenza esterna oltre ai font
- `localStorage` per il salvataggio delle personalizzazioni

---

## 📸 Screenshot

| Landing Page | Guida | Pannello Personalizzazione |
|---|---|---|
| ![Landing](https://github.com/user-attachments/assets/ee2fe4ec-a0c4-4ac8-afba-e66ebaec33bb) | ![Guide](https://github.com/user-attachments/assets/ce9de08d-ea1e-45df-99f0-f883d3e9ff7e) | ![Panel](https://github.com/user-attachments/assets/9554ee5e-47aa-4da5-9c5e-236a4ab5508c) |