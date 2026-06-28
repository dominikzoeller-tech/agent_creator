# Phase 8.2 – Memory in Agent Flow integrieren

## Ziel

Phase 8.1 hat die Project-Memory-Context-Bridge gebaut. Phase 8.2 bindet diese Bridge in den echten `/v1/ask` Agent Flow ein.

## Änderung im Flow

Vor `runMasterAgent(...)` läuft jetzt:

```ts
const knowledge = await buildKnowledgeRoutingContext(effectiveUserInput, { limit: 3 });
const knowledgeContext = mergeKnowledgeContext(baseEffectiveContext, knowledge);
const memory = await buildProjectMemoryContext(effectiveUserInput, { limit: 5 });
const effectiveContext = mergeProjectMemoryContext(knowledgeContext, memory);
```

Der Agent bekommt dadurch:

1. normalen Request-Kontext
2. lokale Knowledge-Hits
3. Project-Memory-Hits

## API Response Ergänzung

`result` bekommt additiv:

```json
"usedMemory": true,
"memorySummary": "...",
"memoryHits": []
```

## Docker / Volumes

Die API erhält:

```yaml
- ./memory:/app/memory
```

Damit liest die API denselben Project-Memory-Store wie dein lokales Projekt.

## Anwendung

```powershell
npm run memory:context:verify
npm run memory:context:smoke
npm run memory:flow:patch
npm run memory:flow:verify
```

Falls `memory:flow:*` noch nicht existiert:

```powershell
node scripts/phase8-2-patch-memory-agent-flow.cjs
node scripts/phase8-2-verify-memory-agent-flow.cjs
```

## Danach testen

```powershell
npm run stack:down
docker compose -f docker-compose.internal.yml build --no-cache api
npm run stack:up:detached
npm run stack:health
```

## Browser-Test

Frage im Chat:

```text
Was wurde in Phase 7 zum Knowledge Layer erreicht?
```

Erwartung:

- Antwort kommt normal.
- Debug JSON enthält `usedMemory`, `memorySummary`, `memoryHits`.
- Memory wird noch nicht als eigenes UI-Panel angezeigt. Das kommt in Phase 8.3.
