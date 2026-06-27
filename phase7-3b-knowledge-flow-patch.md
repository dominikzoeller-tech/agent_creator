# Phase 7.3b – Knowledge Base in echten Agent Flow integrieren

## Ziel

Diese Phase verbindet die lokale Knowledge Base mit dem echten `/v1/ask` Agent Flow.

## Was gepatcht wird

### `server.ts`

Vor `runMasterAgent(...)` wird jetzt lokal gesucht:

```ts
const knowledge = await buildKnowledgeRoutingContext(effectiveUserInput, { limit: 3 });
const effectiveContext = mergeKnowledgeContext(baseEffectiveContext, knowledge);
```

Dann wird der bestehende Agent Flow unverändert mit `effectiveContext` aufgerufen.

### `Dockerfile`

Damit der API-Container die neuen Module laden kann, werden ergänzt:

```dockerfile
COPY knowledge-base.ts ./
COPY knowledge-routing-context.ts ./
COPY knowledge ./knowledge
```

## Privacy-Regel

Die Knowledge Base bleibt lokal. Es wird nur der gemergte Kontext in den bestehenden Agentenfluss gegeben. Keine externe Knowledge-DB wird verwendet.

## Anwendung

```powershell
node scripts/add-phase7-3b-knowledge-flow-patch-script.cjs
npm run knowledge:flow:patch
```

## Verify

```powershell
node scripts/add-phase7-3b-knowledge-flow-verify-script.cjs
npm run knowledge:flow:verify
```

## Tests

```powershell
npm run knowledge:smoke
npm run knowledge:routing:smoke
npm run stack:down
docker compose -f docker-compose.internal.yml build --no-cache api
npm run stack:up:detached
npm run stack:health
```

## Browser-Test

Öffne:

```text
http://localhost:3000
```

Stelle eine Frage mit Begriffen aus `knowledge/agent-routing-guide.md`, z. B.:

```text
Wie funktionieren suggestedAgents und routingDetails im Agent Routing?
```

Der Agent bekommt dann automatisch lokale Knowledge-Hits als zusätzlichen Kontext.
