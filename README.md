# Agent Creator – Master-Agent mit Rat, CLI, Logging und Analytics

Dieses Projekt implementiert eine **lokal laufende Agenten-Architektur** mit einem zentralen **Master-Agenten** und einem spezialisierten Entscheidungsmodul namens **„Der Rat“**.

Der Master-Agent ist die primäre Gesprächsinstanz. Bei normalen Wissens- oder Erklärfragen antwortet der Master direkt. Bei echten Entscheidungen mit Tradeoffs, Unsicherheit oder hohem Einsatz wird intern der Rat zugeschaltet, der mehrere Perspektiven analysiert und eine strukturierte Empfehlung zurückgibt.

---

## Kernidee

Die Architektur trennt zwei Aufgaben sauber:

- **Master-Agent**
  - führt das Gespräch
  - entscheidet, ob der Rat nötig ist
  - antwortet direkt bei normalen Fragen
  - aggregiert Council-Ergebnisse in eine klare Hauptantwort

- **Der Rat / Council Engine**
  - analysiert echte Entscheidungen aus 5 Denkrollen
  - erzeugt strukturierte Empfehlungen
  - liefert Einigung, Streitpunkte, blinde Flecken und ersten Schritt

---

## Aktuelle Features

### Agentenlogik
- Master-Agent als primäre Benutzerinstanz
- Council-Engine als spezialisiertes Entscheidungsmodul
- Routing zwischen:
  - `direct`
  - `council`
- Erkennung von Tradeoff-/Ratsfragen
- direkter Faktenmodus für normale Wissensfragen

### Rollen des Rats
- Der Skeptiker
- Der Grundsatz-Denker
- Der Visionär
- Der Außenstehende
- Der Macher

### Ausgabeformate
- Markdown-Ausgabe
- JSON-Ausgabe
  - kompakt
  - debug (inkl. vollem `councilResult`)

### Laufzeit / Nutzung
- lokale CLI zum direkten Chatten mit dem Master-Agenten
- Shell-Guard, damit `npm`, `git`, `node` usw. nicht versehentlich als Nutzerfrage interpretiert werden

### Logging / Analytics
- Decision Logging in `logs/decision-log.jsonl`
- Log-Viewer
- Stats-Tool mit:
  - Direct vs. Council Verteilung
  - Konfidenz-Auswertung
  - häufige Empfehlungen
  - häufige erste Schritte
  - häufige Optionen
  - wiederkehrende Entscheidungsmuster
  - Zeitaggregation pro Tag / Woche / Monat
- Exporte als:
  - CSV
  - kompakte CSV
  - Summary-CSV
  - Excel-Report
  - Summary-only Excel

### Security / Dependency Hygiene
- `xlsx` ist auf die gepflegte CDN-Version umgestellt
- `npm audit` ist sauber
- `.env` bleibt lokal und wird nicht committed

---

## Projektstruktur

```text
agent_creator/
├─ .env
├─ .env.example
├─ .gitignore
├─ .gitattributes
├─ CHANGELOG.md
├─ package.json
├─ package-lock.json
├─ tsconfig.json
│
├─ agent-response.ts
├─ cli.ts
├─ council-engine.ts
├─ decision-log.ts
├─ decision-stats.ts
├─ json-test.ts
├─ log-view.ts
├─ master-agent.ts
├─ master-test.ts
├─ real-llm.ts
├─ smoke-test.ts
├─ test.ts
│
├─ logs/
│  ├─ decision-log.jsonl
│  ├─ *.csv
│  └─ *.xlsx
│
└─ tools/
```

---

## Voraussetzungen

- **Node.js** installiert
- **npm** verfügbar
- OpenAI API Key in einer lokalen `.env`

Optional:
- VS Code
- Git

---

## Installation

### 1. Dependencies installieren

```bash
npm install
```

### 2. Falls nötig: zusätzliche Pakete prüfen
Dieses Projekt nutzt unter anderem:

- `openai`
- `dotenv`
- `typescript`
- `ts-node`
- `xlsx`

Wenn das Projekt frisch geklont wurde, reicht normalerweise ein:

```bash
npm install
```

---

## `.env` Konfiguration

Lege lokal eine Datei `.env` an.

Beispiel:

```env
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4.1-mini
```

### Wichtig
- `.env` bleibt **lokal**
- `.env` ist in `.gitignore`
- `.env.example` kann als Vorlage im Repo bleiben

---

## Verfügbare npm Scripts

### Agent-CLI starten

```bash
npm run agent:cli
```

### Council-Test

```bash
npm run council:test
```

### Master-Agent-Test

```bash
npm run master:test
```

### JSON-Test

```bash
npm run json:test
```

### Logs anzeigen

```bash
npm run log:view
```

### Decision Stats / Exporte

```bash
npm run stats:view
```

Mit Filtern:

```bash
npm run stats:view -- --route=council --order=oldest
npm run stats:view -- --route=direct
npm run stats:view -- --route=all --order=newest --limit=200
```

---

## Nutzung der CLI

Starte zuerst:

```bash
npm run agent:cli
```

Dann kannst du mit dem Agenten sprechen.

### Beispiel für direkte Frage

```text
Was ist der Unterschied zwischen TypeScript und JavaScript?
```

### Beispiel für Council-Frage

```text
Ich bin hin- und hergerissen: Soll ich zuerst die CLI fertig bauen oder zuerst JSON-Output standardisieren?
```

### Nützliche CLI-Kommandos

```text
:help
:json on
:json off
:debug on
:debug off
exit
```

### Wichtig
Die CLI ist **kein normales Shell-Terminal**, sondern ein Chat mit dem Agenten.

Das heißt:
- in der CLI gibst du **Fragen** ein
- im normalen Terminal gibst du **Befehle** ein wie:

```bash
npm run stats:view
```

---

## JSON-Modi

Der Master-Agent unterstützt zwei JSON-Varianten:

### Compact JSON
Für Tools / Automatisierung:
- `route`
- `usedCouncil`
- `answer`
- `recommendation`
- `firstStep`
- `confidence`

### Debug JSON
Zusätzlich mit vollem:
- `councilResult`

---

## Logging

Council-Entscheidungen werden protokolliert in:

```text
logs/decision-log.jsonl
```

Jeder Eintrag enthält u. a.:
- Zeitpunkt
- Route
- Nutzerfrage
- Empfehlung
- erster Schritt
- Konfidenz
- erkannte Optionen

Log anzeigen:

```bash
npm run log:view
```

---

## Analytics / Exporte

Stats ausführen:

```bash
npm run stats:view
```

### Typische Auswertungen
- Gesamtanzahl Einträge
- Direct vs. Council
- Ø Konfidenz
- häufige Empfehlungen
- häufige erste Schritte
- häufige Optionen
- Muster / wiederkehrende Entscheidungstypen
- Aggregation nach Tag / Woche / Monat

### Exporte
Die Exporte landen in:

```text
logs/
```

Je nach Filter / Reihenfolge entstehen dort z. B.:

- `decision-log-export-...csv`
- `decision-log-compact-...csv`
- `decision-summary-...csv`
- `decision-recommendations-...csv`
- `decision-first-steps-...csv`
- `decision-options-...csv`
- `decision-patterns-...csv`
- `decision-report-...xlsx`
- `decision-summary-...xlsx`

---

## Routing-Logik

Der Master-Agent nutzt Council **nur**, wenn eine Frage eine echte Entscheidung mit Tradeoff, Unsicherheit oder mehreren Optionen enthält.

### Typische `direct`-Fragen
- Faktenfragen
- Erklärfragen
- Definitionsfragen
- normale Wissensfragen

### Typische `council`-Fragen
- „Soll ich X oder Y?“
- „Ich bin hin- und hergerissen“
- „Welche Option ist besser?“
- „rat das durch“
- „pressure-test das“

---

## Git / Repository-Hinweise

Dieses Repo ignoriert unter anderem:

- `.env`
- `node_modules/`
- `logs/`
- `output/`
- `*.log`

Das ist bewusst so, damit:
- keine Secrets committed werden
- keine generierten Dateien das Repo aufblasen
- Exporte lokal bleiben

---

## Sicherheit

### OpenAI Key
- nur in lokaler `.env`
- niemals committen

### xlsx / Excel-Export
- auf CDN-Version `0.20.3` umgestellt
- `npm audit` ist sauber

---

## Typischer Workflow

### Entwicklung
```bash
npm run agent:cli
```

### Testen
```bash
npm run council:test
npm run master:test
npm run json:test
```

### Logs prüfen
```bash
npm run log:view
```

### Stats / Exporte
```bash
npm run stats:view -- --route=council --order=oldest
```

---

## Nächste sinnvolle Ausbaustufen

Mögliche nächste Schritte:

- Web-UI für den Master-Agenten
- API / Deployment
- Dashboard für Entscheidungen und Trends
- feinere Routing-Intelligenz
- strukturierte Pattern-Klassifikation
- wiederverwendbare Prompt-/Agent-Profile

---

## Status

Aktuell ist das Projekt ein **lokal lauffähiger, commit-fähiger Master-Agent + Council-Kern** mit:

- CLI
- JSON-Ausgabe
- Logging
- Analytics
- CSV/Excel-Export
- sauberem Git-Stand

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

<!-- PHASE6_AGENT_ROUTING_START -->

## Phase 6 – Agenten-Routing, Logs und Analytics

Phase 6 erweitert den Master-Agenten um eine strukturierte Agenten- und Routing-Schicht.

### Agent Capability Registry

Das System kennt jetzt zentrale Agentenfähigkeiten, unter anderem:

- `decision_agent`
- `privacy_agent`
- `planning_agent`
- `risk_agent`
- `technical_agent`
- `writing_agent`
- `research_agent`

Die Registry befindet sich in:

```text
agent-capabilities.ts
```

### Routing-Metadaten

Council-Ergebnisse enthalten zusätzliche Routing-Metadaten:

```text
suggestedAgents
routingDetails
routingSummary
```

Diese Metadaten werden im Frontend angezeigt und in Decision Logs geschrieben.

### Frontend-Sichtbarkeit

Die Chat-Seite zeigt Routing-Metadaten in einem eigenen Panel:

```text
frontend/components/RoutingMetadataPanel.tsx
```

Die Analytics-Seite zeigt Agenten- und Routing-Auswertungen:

```text
frontend/components/AgentRoutingAnalyticsPanel.tsx
```

### Logs und Analytics

Decision Logs enthalten Routing-Metadaten. Analytics wertet zusätzlich aus:

- Top Suggested Agents
- Top Routing-Komplexitäten
- Top Privacy-Risiken

### Docker Shared Logs

Damit API und Frontend im Docker-Stack dieselben Logs sehen, nutzt der interne Stack gemeinsame Volumes:

```yaml
api:
  volumes:
    - ./logs:/app/logs

frontend:
  volumes:
    - ./logs:/logs:ro
```

### Wichtige Tests

```powershell
npm run agent:capabilities:test
npm run agent:routing:test
npm run council:routing:metadata:test
npm run stack:up:detached
npm run stack:health
```

### UI prüfen

```text
http://localhost:3000
http://localhost:3000/analytics
```

<!-- PHASE6_AGENT_ROUTING_END -->


## Web Research Hardening

Web Research ist standardmäßig deaktiviert und wird über Environment-Variablen gesteuert.
API-Keys dürfen nicht in Logs, Screenshots oder API-Responses ausgegeben werden.

Wichtige Checks:

```powershell
npm run web:research:hardening:verify
npm run web:research:smoke
```

Die Smoke Tests prüfen:

- Web Research API Baseline
- Governance Checks
- Settings ohne Secret-Leaks
- Save API blockiert unsichere Payloads


## Phase 9 Web Research Release

Phase 9 ergänzt kontrollierte Web Research Fähigkeiten für den Privacy-First Agent.

Web Research ist standardmäßig deaktiviert und wird über Environment-Variablen aktiviert:

```env
WEB_RESEARCH_ENABLED=true
BING_SEARCH_API_KEY=...
BING_SEARCH_ENDPOINT=https://api.bing.microsoft.com/v7.0/search
WEB_RESEARCH_GOVERNANCE_ENABLED=true
WEB_RESEARCH_SAFE_MODE=true
```

Wichtige Routen:

- `/web-research` – Web Research testen
- `/web-research-save` – geprüfte Research-Ergebnisse speichern
- `/web-research-governance` – Governance Check
- `/web-research-settings` – Admin/Settings ohne Secret-Leak
- `/analytics` – Web Research Analytics

Release Checks:

```powershell
npm run web:research:hardening:verify
npm run web:research:smoke
npm run stack:health
```


## Phase 10 Tool Governance

Phase 10 führt eine sichtbare und messbare Tool Governance ein.

Wichtige Seiten:

- `/tools` – Tool Registry
- `/tool-permissions` – Permissions Matrix
- `/tool-preflight` – Einzelner Preflight
- `/analytics` – Preflight- und Enforcement-Analytics

Wichtige Checks:

```powershell
npm run tools:governance:release:verify
npm run tools:governance:smoke
```

Harte Enforcement-Blockade ist in Phase 10 noch nicht standardmäßig aktiv.
