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
- 🏠 **Multi-appartamento** — supporto per 2 appartamenti
- 🗺️ **5 sezioni** — Home, Soggiorno, Luoghi, Mangiare, Muoversi
- ⚙️ **Pannello di personalizzazione** — modifica tutto dal browser senza toccare il codice
- 💾 **Salvataggio automatico** in `localStorage`
- 📋 **Esporta/Importa JSON** — per backup e condivisione delle impostazioni
- 📞 **Bottoni di chiamata** per emergenze e host
- 🧭 **Link Google Maps** per ogni luogo e ristorante

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

### Metodo 1: Pannello Integrato (consigliato)

1. Apri il sito nel browser
2. Clicca il pulsante **⚙️** in basso a destra nella landing page
3. Modifica tutti i campi nei pannelli collassabili:
   - 🏡 **Info B&B** — nome, sottotitolo, città, host, telefono
   - 🏠 **Appartamento 1 & 2** — indirizzo, WiFi, check-in/out, Maps
   - 🗺️ **Luoghi da Visitare** — 5 slot con descrizioni IT/EN e link Maps
   - 🍽️ **Ristoranti** — 4 slot con tipo, descrizioni, fascia prezzi
   - 🚇 **Trasporti** — aeroporto, stazione, metro, bus (IT/EN)
   - 📞 **Contatti Extra** — secondo contatto di emergenza
4. Clicca **💾 Salva e Applica** — le modifiche vengono salvate e applicate immediatamente
5. Usa **📋 Esporta JSON** per fare un backup delle impostazioni
6. Usa **🗑️ Reset** per tornare ai valori predefiniti

### Metodo 2: Modifica Diretta del File HTML

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
guestguide-bnb/
├── index.html                    ← tutto il codice (HTML + CSS + JS inline)
├── .nojekyll                     ← disabilita Jekyll su GitHub Pages
└── .github/workflows/deploy.yml ← auto-deploy su GitHub Pages
```

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