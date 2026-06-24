# Phase 4 – Umsetzungsreihenfolge für Web-UI / Dashboard

## Phase 4.1 – Minimal UI

### Ziel
Eine funktionierende Weboberfläche, die mit deiner API spricht.

### Umfang
- Chat Seite
- Texteingabe
- Sensitivity Dropdown
- Processing Mode Dropdown
- Antwortpanel
- Route-Badge
- ProcessingPath-Badge
- Health-Anzeige oben oder auf separater Seite

### Erfolgskriterium
Ein Nutzer kann eine Frage im Browser stellen und erhält eine strukturierte Antwort aus `/v1/ask`.

---

## Phase 4.2 – Privacy sichtbar machen

### Ziel
Die UI zeigt nicht nur Antworten, sondern auch den Datenschutzpfad.

### Umfang
- Panel für `sensitivity`
- Panel für `processingMode`
- Panel für `processingPath`
- Text: ob Redaction aktiv war
- optionale Redaction-Vorschau über `/v1/redact`

### Erfolgskriterium
Der Nutzer versteht, warum eine Anfrage cloudbasiert, redigiert oder lokal behandelt wurde.

---

## Phase 4.3 – Logs integrieren

### Ziel
Decision Logs im Browser sichtbar machen.

### Umfang
- Logs-Seite
- Tabelle mit Timestamp, Route, Frage, Empfehlung, Confidence
- einfache Filter

### Technische Voraussetzung
Später zusätzlicher API-Endpunkt für Logs oder serverseitiger Dateizugriff.

---

## Phase 4.4 – Analytics integrieren

### Ziel
Stats im Browser anzeigen.

### Umfang
- Summary Cards
- häufige Empfehlungen
- häufige Optionen
- Decision Patterns
- Zeitaggregation
- Exportlinks für CSV / Excel

### Technische Voraussetzung
Später API-Endpunkt für Stats oder serverseitige Wrapper um bestehende Auswertung.

---

## Phase 4.5 – UI aufräumen und härten

### Ziel
Die Oberfläche wirkt produktionsreif.

### Umfang
- Validierung
- Ladezustände
- Fehlermeldungen
- saubere Layoutstruktur
- responsive Darstellung

---

## Meine klare Empfehlung zur Reihenfolge

### Jetzt als nächstes bauen
1. Chat-UI
2. Health-UI
3. Privacy-Panel

### Danach
4. Logs
5. Analytics
6. UI-Härtung

