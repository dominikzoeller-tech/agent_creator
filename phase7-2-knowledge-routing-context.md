# Phase 7.2 – Knowledge Base in Routing nutzbar machen

## Ziel

Phase 7.1 hat die lokale Knowledge Base angelegt. Phase 7.2 macht diese Knowledge Base für Routing- und Council-Kontext nutzbar.

Diese Phase ist bewusst additiv und sicher:

- keine produktive API-Datei wird automatisch verändert
- `master-agent.ts`, `server.ts` und `council-engine.ts` bleiben unangetastet
- die neue Context-Bridge kann separat getestet werden

## Neue Dateien

```text
knowledge-routing-context.ts
knowledge-routing-context-smoke-test.ts
scripts/add-phase7-2-knowledge-routing-script.cjs
phase7-2-knowledge-routing-context.md
phase7-2-integration-notes.md
```

## Einrichtung

```powershell
node scripts/add-phase7-2-knowledge-routing-script.cjs
```

## Test

```powershell
npm run knowledge:routing:smoke
```

## Ergebnis

Der Smoke-Test zeigt:

- ob lokale Knowledge-Hits gefunden wurden
- welche Treffer in Kontextzeilen übersetzt werden
- wie vorhandener Kontext mit Knowledge-Kontext gemerged wird

## Nächster Schritt: Phase 7.3

Phase 7.3 kann die Bridge in den echten Agentenfluss integrieren:

1. `buildKnowledgeRoutingContext(userInput)` vor `runMasterAgent` oder vor `runCouncil` ausführen
2. `mergeKnowledgeContext(context, knowledge)` benutzen
3. den erweiterten Kontext an Council oder Direct Answer übergeben
4. optional Response um `knowledgeHits` und `knowledgeSummary` erweitern
5. Frontend später um Knowledge-Hits erweitern
