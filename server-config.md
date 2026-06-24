# server-config.md

## Zweck

Die Datei `server.ts` startet eine **lokale Privacy-First HTTP-API** für den Master-Agenten.

Die API ist so gebaut, dass Anfragen je nach Sensitivität unterschiedlich verarbeitet werden:

- **public** → Cloud-Pfad ohne Redaction
- **internal** → Cloud-Pfad ohne Redaction
- **confidential** → Cloud-Pfad mit Redaction (`cloud_redacted`)
- **restricted** → lokale Policy (`local_policy`), kein Cloud-LLM

---

## Wichtige Dateien

- `server.ts`
- `privacy-utils.ts`
- `master-agent.ts`
- `council-engine.ts`
- `real-llm.ts`
- `.env`
- `.env.example`

---

## Erwartete Umgebungsvariablen

### Pflicht

```env
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4.1-mini
```

### Optional

```env
PORT=7071
```

Wenn `PORT` nicht gesetzt ist, nutzt die API standardmäßig **7071**.

---

## Start lokal

```bash
npm run api:start
```

Danach läuft die API standardmäßig auf:

```text
http://localhost:7071
```

---

## Endpunkte

### `GET /health`
Prüft, ob die API läuft.

### `POST /v1/redact`
Maskiert sensible Inhalte lokal.

### `POST /v1/ask`
Führt die Privacy-First Verarbeitungslogik aus und ruft – je nach Modus – den Master-Agenten oder eine lokale Policy-Antwort auf.

---

## Request-Felder für `/v1/ask`

```json
{
  "userInput": "Soll ich zuerst X oder Y machen?",
  "context": ["optional", "mehr Kontext"],
  "outputMode": "json",
  "includeCouncilResult": true,
  "sensitivity": "internal",
  "processingMode": "auto",
  "allowCloudForSensitive": false
}
```

### `sensitivity`
- `public`
- `internal`
- `confidential`
- `restricted`

### `processingMode`
- `auto`
- `local_only`
- `hybrid`
- `cloud_allowed`

---

## Verarbeitungslogik

### `cloud_raw`
Anfrage wird direkt an den Master-Agenten / Cloud-LLM weitergegeben.

Typisch für:
- `public`
- `internal`

### `cloud_redacted`
Anfrage wird lokal redigiert und erst danach weitergegeben.

Typisch für:
- `confidential`
- optional auch `restricted`, wenn später bewusst erlaubt

### `local_policy`
Kein Cloud-LLM-Aufruf. Die API liefert nur eine lokale Policy-Entscheidung zurück.

Typisch für:
- `restricted`
- `local_only`

---

## Beispielantworten

### `/health`
```json
{
  "ok": true,
  "service": "master-agent-api",
  "status": "ok",
  "port": 7071
}
```

### `/v1/ask` mit `restricted`
```json
{
  "ok": true,
  "mode": "local_policy",
  "sensitivity": "restricted",
  "processingPath": "local_policy",
  "routeSuggestion": "direct",
  "answer": "..."
}
```

---

## Lokale Tests

### Health
```bash
Invoke-RestMethod http://localhost:7071/health
```

### API Smoke Test
```bash
npm run api:smoke
```

---

## Sicherheit / Datenschutz

### Aktueller Schutz
- Redaction sensibler Inhalte vor Cloud-Nutzung
- `restricted` wird standardmäßig nicht nach außen gegeben
- lokale Policy-Entscheidung statt externer Verarbeitung

### Empfohlene Praxis
- nur notwendige Inhalte an den Cloud-Pfad geben
- vertrauliche Daten möglichst maskieren
- hochsensible Inhalte lokal halten
- später optional on-prem / lokales Modell ergänzen

---

## Deployment-Hinweis

Für den ersten Deployment-Schritt ist diese API bereits gut vorbereitet.

Empfohlene Reihenfolge:
1. lokal testen
2. Docker bauen
3. in geschützter Umgebung deployen
4. erst danach UI / Dashboard andocken

---

## Nächste sinnvolle Dateien

- `api-smoke-test.ts`
- `Dockerfile`
- `docker-run.md`
- später optional `docker-compose.yml`
