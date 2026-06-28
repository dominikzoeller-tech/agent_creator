# Phase 7.4 – Knowledge Hits im API-Debug und Frontend sichtbar machen

## Ziel

Phase 7.3b nutzt lokale Knowledge-Treffer bereits intern im Agent Flow. Phase 7.4 macht sichtbar, welche lokalen Wissensdateien genutzt wurden.

## Sichtbare Felder in der API-Antwort

Die Cloud-Response `result` bekommt additiv:

```json
"usedKnowledge": true,
"knowledgeSummary": "Lokale Knowledge-Base-Treffer: ...",
"knowledgeHits": []
```

Bestehende Felder bleiben erhalten.

## Frontend

Neue Komponente:

```text
frontend/components/KnowledgeHitsPanel.tsx
```

Die Chat-Seite zeigt danach ein Panel:

```text
Lokale Knowledge-Treffer
```

## Anwendung

```powershell
node scripts/add-phase7-4-knowledge-visibility-patch-script.cjs
npm run knowledge:visibility:patch
```

## Verify

```powershell
node scripts/add-phase7-4-knowledge-visibility-verify-script.cjs
npm run knowledge:visibility:verify
```

## Tests

```powershell
npm run knowledge:smoke
npm run knowledge:routing:smoke
npm run stack:down
docker compose -f docker-compose.internal.yml build --no-cache
npm run stack:up:detached
npm run stack:health
```

## Browser-Test

```text
http://localhost:3000
```

Beispielfrage:

```text
Wie funktionieren suggestedAgents und routingDetails im Agent Routing?
```

Erwartung:

- Antwort kommt normal.
- Routing-Metadaten bleiben sichtbar.
- Neues Panel `Lokale Knowledge-Treffer` zeigt mindestens `Agent Routing Guide`.
- Admin/Debug JSON enthält `usedKnowledge`, `knowledgeSummary` und `knowledgeHits`.
