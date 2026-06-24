# Phase 4 – API Mapping für Web-UI

## Regel

Die Web-UI spricht ausschließlich mit der Privacy-First API.

---

## 1. `GET /health`

### Zweck in der UI
- Systemstatus anzeigen
- Health-Badge
- Port / unterstützte Modi anzeigen

### Eingesetzt in
- `System` Seite
- optional oben rechts als Statusanzeige

### Erwartete Daten
- `ok`
- `service`
- `status`
- `port`
- `modes.sensitivities`
- `modes.processingModes`
- `modes.processingPaths`

---

## 2. `POST /v1/redact`

### Zweck in der UI
- Privacy-Vorschau
- Nutzer kann sehen, wie Inhalte maskiert würden
- Debug-/Vertrauensfunktion

### Eingesetzt in
- optionales Privacy-Panel im Chat
- spätere Admin-/Debug-Funktion

### Request-Beispiel
```json
{
  "userInput": "Bitte prüfe Bilanzdaten von max.mustermann@firma.de",
  "context": ["Interner Finanzkontext"]
}
```

### Response-Nutzung in der UI
- `original`
- `redacted`
- `redactedContext`

---

## 3. `POST /v1/ask`

### Zweck in der UI
- Haupt-Chat-Endpunkt
- alle Nutzerfragen gehen hierhin

### Wichtigste Request-Felder
```json
{
  "userInput": "Soll ich zuerst X oder Y machen?",
  "context": ["optional"],
  "outputMode": "json",
  "includeCouncilResult": true,
  "sensitivity": "internal",
  "processingMode": "auto",
  "allowCloudForSensitive": false
}
```

---

## UI-Bedeutung der Request-Felder

### `userInput`
Die eigentliche Chat-Nachricht.

### `context`
Optionaler Zusatzkontext für den Agenten.
Für Phase 4 kann das im Start aus einem versteckten Systemkontext kommen.

### `outputMode`
Empfehlung für die UI:
- Standard: `json`

**Warum?**
Dann kann die UI strukturierte Felder direkt anzeigen.

### `includeCouncilResult`
Für Phase 4 Start:
- Standard: `false`

Später optional in einem Debug-Modus aktivieren.

### `sensitivity`
Pflichtfeld in der UI.
Der Nutzer soll bewusst wählen können:
- `public`
- `internal`
- `confidential`
- `restricted`

### `processingMode`
Pflichtfeld in der UI.
Empfohlener Default:
- `auto`

### `allowCloudForSensitive`
Für den Start:
- Standard: `false`

---

## UI-Nutzung der Antwort von `/v1/ask`

### Wenn `mode = cloud`
Die UI zeigt an:
- `processingPath`
- `redacted`
- `result.route`
- `result.answer`
- optional `recommendation`
- optional `firstStep`
- optional `confidence`

### Wenn `mode = local_policy`
Die UI zeigt an:
- `processingPath`
- `routeSuggestion`
- `answer`
- `reason`

---

## Wichtig für das Chat-Design

Die UI sollte die API-Antwort in drei Ebenen aufteilen:

### Ebene 1 – eigentliche Antwort
- `answer`

### Ebene 2 – Steuerinformationen
- `route`
- `processingPath`
- `redacted`
- `mode`

### Ebene 3 – strukturierte Decision-Felder
- `recommendation`
- `firstStep`
- `confidence`

---

## Phase-4-Minimum für die UI

Für die erste UI-Version reicht:

### Chat
- Request an `/v1/ask`
- Antwort anzeigen
- Route-Badge
- ProcessingPath-Badge

### System
- Health von `/health`

### Später
- `/v1/redact`
- Logs
- Analytics

