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

