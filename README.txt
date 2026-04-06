Cyber Security Training – React Version

Diese Version baut das bisherige Projekt mit React + Komponenten + JSON-Daten nach.
Ziel: gleiche Struktur, ähnliche Optik und dieselbe Funktionalität, aber modular und leichter pflegbar.

Projektstruktur:
- public/images/            -> Bilder und Favicon
- src/data/slides.json      -> Inhalte der Slides
- src/components/           -> Wiederverwendbare React-Komponenten
- src/App.jsx               -> Hauptlogik für Navigation, Theme, Quiz, Modal
- src/styles.css            -> Stile aus dem bestehenden Projekt

Start:
1. npm install
2. npm run dev

Build:
- npm run build

Hinweise:

Code-Qualität:
- ESLint und Prettier sind konfiguriert für automatische Formatierung
- Bei Speichern werden Dateien automatisch formatiert (benötigt VS Code Extension "Prettier")
- Verfügbare Scripts:
  - npm run lint     -> ESLint prüfen
  - npm run lint:fix -> ESLint Fehler automatisch beheben
  - npm run format   -> Alle Dateien mit Prettier formatieren
- Neue Slides können direkt in src/data/slides.json ergänzt werden.
- Quiz-Fragen lassen sich dort ebenfalls einfach erweitern.
- Design und Übergänge bleiben in src/styles.css.
