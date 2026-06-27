# Phase 7.1 – Local Knowledge Base Foundation

## Ziel

Nach Phase 6 kann der Agent Routing-Entscheidungen erklären und auswerten. Phase 7 beginnt mit einer lokalen Knowledge Base.

Die Knowledge Base ist bewusst einfach:

- lokale Markdown-/Text-Dateien im Ordner `knowledge/`
- keine Cloud-Abhängigkeit
- keine Vektor-Datenbank
- Privacy-First by default
- einfache regelbasierte Suche als Grundlage

## Neue Dateien

```text
knowledge-base.ts
knowledge-base-smoke-test.ts
scripts/add-phase7-1-knowledge-script.cjs
knowledge/agent-routing-guide.md
phase7-1-local-knowledge-base-foundation.md
```

## Einrichtung

```powershell
node scripts/add-phase7-1-knowledge-script.cjs
```

## Test

```powershell
npm run knowledge:smoke
```

## Was der Test macht

Der Test erstellt/aktualisiert eine Seed-Datei:

```text
knowledge/agent-routing-guide.md
```

Dann sucht der Test nach Begriffen wie:

- `suggestedAgents routingDetails`
- `Agent Routing Analytics`
- `Privacy Risiken`

## Nächster Schritt

Phase 7.2 kann diese Knowledge Base in das Routing integrieren:

- `searchKnowledgeBase(userInput)` vor Council-Entscheidung ausführen
- relevante Treffer in den Kontext aufnehmen
- Routing-Details optional um `knowledgeHits` erweitern
- Frontend später um Knowledge-Hit-Badges erweitern
