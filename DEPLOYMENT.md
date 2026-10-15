# 📘 Detaillierte Deployment- & Google Cloud Anleitung

Diese Anleitung führt dich durch die Einrichtung der **Google Cloud Console** (für Maps und Login) und das Veröffentlichen auf **Netlify**.

---

## 1. Google Cloud Console einrichten

### A. Google Cloud Projekt erstellen
1. Öffne die [Google Cloud Console](https://console.cloud.google.com/).
2. Klicke oben links auf das Projektauswahl-Menü und erstelle ein **Neues Projekt** (z. B. `Pendler-Dashboard`).

### B. Notwendige APIs aktivieren
1. Gehe im Hauptmenü auf **APIs & Dienste** > **Bibliothek**.
2. Suche nach **Directions API** und klicke auf **Aktivieren**.
3. (Optional) Aktiviere zusätzlich die **Maps JavaScript API**.

### C. Google Maps API-Schlüssel erstellen
1. Gehe zu **APIs & Dienste** > **Anmeldedaten**.
2. Klicke auf **Anmeldedaten erstellen** > **API-Schlüssel**.
3. Kopiere den erstellten API-Schlüssel.
4. *(Empfohlen für Sicherheit)*:
   - Klicke auf den Schlüssel, um ihn zu bearbeiten.
   - Wähle unter **API-Einschränkungen**: *Schlüssel einschränken* und wähle nur die **Directions API** aus.
   - Speichere die Einstellungen.
   - Dieser Schlüssel wird später in Netlify als `GOOGLE_MAPS_API_KEY` hinterlegt.

### D. Google OAuth 2.0 Web Client-ID (für Google Login)
1. Gehe zu **APIs & Dienste** > **OAuth-Zustimmungsbildschirm**.
2. Wähle **Extern** und klicke auf **Erstellen**.
3. Trage einen App-Namen ein (z. B. *Pendler Radar*) und deine Support-E-Mail-Adresse.
4. Klicke auf *Speichern und fortfahren*.
5. Gehe anschließend zu **Anmeldedaten** > **Anmeldedaten erstellen** > **OAuth-Client-ID**.
6. Wähle als Anwendungstyp **Webanwendung**.
7. Trage unter **Autorisierte JavaScript-Quellen** folgende URLs ein:
   - `http://localhost:3000` (für lokale Tests)
   - `http://localhost:5173`
   - `https://dein-projektname.netlify.app` (deine Netlify Domain)
8. Klicke auf **Erstellen** und kopiere die **Client-ID** (endet auf `.apps.googleusercontent.com`).

---

## 2. Deployment auf Netlify

### Option 1: Automatisches Deployment via Git (Empfohlen)
1. Erstelle ein Repository auf GitHub / GitLab und lade den Code hoch:
   ```bash
   git init
   git add .
   git commit -m "Init Pendler Dashboard"
   git remote add origin https://github.com/DEIN_USERNAME/DEIN_REPO.git
   git push -u origin main
   ```
2. Logge dich auf [Netlify](https://www.netlify.com/) ein.
3. Klicke auf **Add new site** > **Import an existing project**.
4. Wähle dein Git-Repository aus.
5. Die Einstellungen in der Datei `netlify.toml` werden automatisch erkannt:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Functions directory**: `netlify/functions`
6. Klicke auf **Environment variables** und füge folgende Variablen hinzu:
   - `GOOGLE_MAPS_API_KEY` = `[Dein Google Maps API Key aus Schritt 1C]`
   - `VITE_GOOGLE_CLIENT_ID` = `[Deine Google OAuth Client-ID aus Schritt 1D]`
7. Klicke auf **Deploy site**.
8. Nach ca. 1 Minute ist deine Website unter einer URL wie `https://xyz-123.netlify.app` live!

---

### Option 2: Direkt über die Netlify CLI deployen
Falls du kein Git-Repository nutzen möchtest:
```bash
# 1. Netlify CLI installieren (falls noch nicht vorhanden)
npm install -g netlify-cli

# 2. Bauen
npm run build

# 3. Anmelden und deployen
npx netlify login
npx netlify deploy --prod
```

Folge den Anweisungen im Terminal und wähle `dist` als Veröffentlichungsordner.

---

## 3. Adressen in der App anpassen
Sobald die Website geöffnet ist:
1. Klicke oben rechts auf das **Zahnrad-Symbol (Einstellungen)**.
2. Trage deine realen Adressen für **Zuhause**, **Arbeit** und **Universität** ein (z. B. mit Straße, Hausnummer und Stadt).
3. Klicke auf **Speichern**.
4. Die App speichert deine Präferenzen und aktualisiert bei jedem Aufruf automatisch die schnellsten Wege und nächsten Abfahrten.
