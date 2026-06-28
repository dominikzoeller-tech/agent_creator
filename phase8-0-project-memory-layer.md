# Phase 8.0 – Project Memory Layer

## Ziel

Phase 7 hat lokale Knowledge-Dateien nutzbar gemacht. Phase 8 startet ein separates Projektgedächtnis.

## Wichtig: Knowledge vs. Memory

### Knowledge

Knowledge sind bearbeitbare Dokumente:

```text
knowledge/*.md
knowledge/*.txt
```

Beispiele:

- technische Notizen
- Projektinfos
- Prozessbeschreibungen
- Agent-Routing-Guides

### Project Memory

Project Memory sind strukturierte Projektfakten:

```text
memory/project-memory.json
```

Beispiele:

- Entscheidungen
- Meilensteine
- bekannte Probleme
- Systemzustände
- Langfristige Präferenzen

## Neue Dateien

```text
project-memory.ts
project-memory-smoke-test.ts
scripts/add-phase8-0-project-memory-script.cjs
scripts/phase8-0-verify-project-memory.cjs
scripts/add-phase8-0-project-memory-verify-script.cjs
phase8-0-project-memory-layer.md
```

## Anwendung

```powershell
node scripts/add-phase8-0-project-memory-script.cjs
node scripts/add-phase8-0-project-memory-verify-script.cjs
npm run memory:verify
npm run memory:smoke
```

## Ergebnis

Der Smoke-Test erstellt:

```text
memory/project-memory.json
```

und legt erste Memory-Einträge an.

## Nächster Schritt

Phase 8.1 kann den Memory Layer in den Agent Flow einbinden:

- Memory-Suche vor Agent-Antwort
- Memory-Kontext additiv in `context` mergen
- Memory-Hits im Debug sichtbar machen
- Memory später in Logs/Analytics aufnehmen
