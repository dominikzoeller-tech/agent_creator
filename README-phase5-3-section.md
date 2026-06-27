<!-- PHASE5_README_START -->

## Internes Deployment / Docker Stack

Dieses Projekt kann lokal entweder klassisch über zwei Terminals oder als interner Docker-Stack gestartet werden.

Der Docker-Stack startet gemeinsam:

- **Privacy-First API** auf `http://localhost:7071`
- **Frontend / Dashboard** auf `http://localhost:3000`

---

### Schnellstart mit Docker

#### Stack im Hintergrund starten

```powershell
npm run stack:up:detached
```

#### Health prüfen

```powershell
npm run stack:health
```

#### Browser öffnen

```text
http://localhost:3000
```

Weitere Seiten:

```text
http://localhost:3000/logs
http://localhost:3000/analytics
http://localhost:3000/system
http://localhost:7071/health
```

#### Logs anzeigen

```powershell
npm run stack:logs
```

#### Containerstatus anzeigen

```powershell
npm run stack:ps
```

#### Stack stoppen

```powershell
npm run stack:down
```

---

### Klassischer lokaler Start ohne Docker

#### Terminal 1 – API

```powershell
npm run api:start
```

#### Terminal 2 – Frontend

```powershell
cd frontend
npm run dev
```

Danach:

```text
http://localhost:3000
```

---

## Wichtige UI-Bereiche

### Chat

Hauptoberfläche für Fragen an den Master-Agenten.

Enthält:

- Sensitivitätsauswahl
- Processing-Mode-Auswahl
- Redaction Preview
- Admin-/Debug-JSON
- Antwortkarte mit Route, Processing Path, Recommendation, First Step und Confidence

### Logs

Zeigt Einträge aus `logs/decision-log.jsonl`.

Unterstützt:

- Route-Filter
- Suche
- Limit-Auswahl

### Analytics

Zeigt aggregierte Kennzahlen aus den Decision Logs.

Enthält:

- Direct vs. Council
- Ø Konfidenz
- Top Empfehlungen
- Top erste Schritte
- Top Muster
- Export-/Download-Bereich für CSV-/Excel-Dateien

### System

Zeigt Betriebsinformationen:

- API Health
- Port
- Sensitivitäten
- Processing Modes
- Processing Paths
- Quick-Start-Checkliste

---

## Privacy-First-Verarbeitung

Die API entscheidet je nach Sensitivität und Verarbeitungsmodus über den Verarbeitungspfad.

### Sensitivitäten

```text
public
internal
confidential
restricted
```

### Processing Paths

```text
cloud_raw
cloud_redacted
local_policy
```

### Empfohlenes Standardverhalten

- `public` / `internal` → normaler Cloud-Pfad
- `confidential` → Redaction vor Cloud-Verarbeitung
- `restricted` → lokale Policy, kein Cloud-LLM

---

## Wichtige Dateien

### Backend / API

```text
server.ts
privacy-utils.ts
master-agent.ts
council-engine.ts
decision-log.ts
real-llm.ts
```

### Tests / Checks

```text
health-check.ts
validate-env.ts
routing-regression.ts
api-smoke-test.ts
test-matrix.md
```

### Frontend

```text
frontend/app/page.tsx
frontend/app/logs/page.tsx
frontend/app/analytics/page.tsx
frontend/app/system/page.tsx
frontend/components/
frontend/lib/
```

### Deployment

```text
Dockerfile
frontend/Dockerfile
docker-compose.internal.yml
phase5-internal-deployment.md
phase5-runbook.md
phase5-1-hardening.md
phase5-2-ops.md
```

---

## Umgebungsvariablen

Die echte `.env` bleibt lokal und wird nicht committed.

Beispiel:

```env
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4.1-mini
PORT=7071
```

Für das Frontend:

```env
NEXT_PUBLIC_AGENT_API_BASE_URL=http://localhost:7071
```

---

## Typische Probleme

### Docker-Befehl nicht gefunden

Docker Desktop starten und danach prüfen:

```powershell
docker --version
docker compose version
```

### Docker Daemon nicht erreichbar

Docker Desktop öffnen und warten, bis Docker vollständig gestartet ist.

Danach:

```powershell
docker info
```

### Port 3000 oder 7071 belegt

Laufende Prozesse prüfen oder den Stack stoppen:

```powershell
npm run stack:down
```

### Frontend läuft, aber API nicht erreichbar

API direkt prüfen:

```powershell
Invoke-RestMethod http://localhost:7071/health
```

---

## Empfohlener Arbeitsablauf

### Start

```powershell
npm run stack:up:detached
npm run stack:health
```

### Nutzung

```text
http://localhost:3000
```

### Stoppen

```powershell
npm run stack:down
```

<!-- PHASE5_README_END -->
