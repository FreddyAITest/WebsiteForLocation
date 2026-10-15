# 🚀 Pendler-Radar (Google Maps & Netlify)

Eine moderne Web-Applikation zur Echtzeit-Anzeige und automatischen Berechnung deiner täglichen Strecken:
1. **Zuhause ➔ Arbeit**
2. **Arbeit ➔ Zuhause**
3. **Zuhause ➔ Uni**

Bei jedem Aufruf der Website wird automatisch der **aktuell schnellste Weg** (Vergleich zwischen **ÖPNV**, **Auto mit Live-Verkehr** und **Fahrrad**) sowie die **nächste Verbindung / Abfahrt** ermittelt.

---

## ✨ Features

- 🏆 **Schnellster Weg immer im Fokus**: Vergleicht live die Fahrzeiten aller Verkehrsmittel und hebt den schnellsten Modus hervor.
- 🚆 **Nächste ÖPNV-Verbindungen**: Live-Abfahrtszeit ("in 4 Min."), Linie (z.B. U2, S3, Bus), Start- und Zielstation sowie Umstiege.
- 🚗 **PKW mit Live-Verkehrslage**: Aktuelle Fahrzeit inklusive Stau-Verzögerungen ("+7 Min. Verzögerung").
- 🔒 **Google Account Login**: Sichere Anmeldung über moderne *Google Identity Services* (OAuth 2.0).
- 📍 **Personalisierbare Adressen**: Adressen für Zuhause, Arbeit und Uni können direkt in der App angepasst werden.
- ⏱️ **Auto-Refresh**: Aktualisiert die Daten automatisch alle 3 Minuten (konfigurierbar) oder manuell per Klick.
- 🗺️ **1-Klick Google Maps Navigation**: Startet die Route direkt in der Google Maps App oder im Browser.
- ⚡ **Netlify Serverless Ready**: Bereit für 1-Klick-Deployments auf Netlify inklusive geschützter Netlify Functions für die Google Maps API.

---

## 🛠️ Schnellstart Lokal

### 1. Abhängigkeiten installieren
```bash
npm install
```

### 2. Entwicklungsserver starten
```bash
npm run dev
```
Die Seite öffnet sich unter `http://localhost:3000`.

*Hinweis: Wenn noch keine Google API-Keys eingetragen sind, startet die App im Live-Simulationsmodus, sodass das gesamte Interface und alle Funktionen sofort getestet werden können!*

---

## ☁️ Deployment auf Netlify

Eine ausführliche Schritt-für-Schritt-Anleitung für Google Cloud und Netlify findest du in der Datei:
👉 **[DEPLOYMENT.md](./DEPLOYMENT.md)**

### Kurzüberblick:

1. **Projekt auf GitHub pushen**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/dein-user/pendler-dashboard.git
   git push -u origin main
   ```

2. **In Netlify importieren**:
   - Gehe auf [netlify.com](https://www.netlify.com/) und wähle **"Add new site" > "Import an existing project"**.
   - Wähle dein GitHub-Repository aus.
   - Build-Kommando: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`

3. **Umgebungsvariablen in Netlify eintragen**:
   Unter *Site configuration > Environment variables*:
   - `GOOGLE_MAPS_API_KEY`: Dein Google Cloud API-Schlüssel (Directions API)
   - `VITE_GOOGLE_CLIENT_ID`: Deine Google OAuth 2.0 Web Client-ID

4. **Klick auf "Deploy site"** – Fertig! Deine Seite ist online.
