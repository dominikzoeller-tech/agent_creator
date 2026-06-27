# Phase 6.6 Patch Template für council-engine.ts

Dieses Template ist noch kein automatischer Patch. Es zeigt den geplanten Minimal-Eingriff.

## 1. Imports

```ts
import { buildCouncilRoutingMetadata } from "./council-routing-metadata";
import { attachCouncilRoutingMetadata } from "./council-routing-response-types";
```

## 2. Routing-Metadaten berechnen

Möglichst früh in der Hauptfunktion:

```ts
const routingMetadata = buildCouncilRoutingMetadata({
  userInput,
  sensitivity,
  processingMode,
  includeCouncilResult,
});
```

## 3. Return additiv erweitern

Statt bestehende Felder zu entfernen:

```ts
return attachCouncilRoutingMetadata(existingResult, {
  suggestedAgents: routingMetadata.suggestedAgents,
  routingDetails: routingMetadata.routingDetails,
  routingSummary: routingMetadata.summary,
});
```

## 4. Danach testen

```powershell
npm run agent:capabilities:test
npm run agent:routing:test
npm run council:routing:metadata:test
npm run routing:regression
npm run api:smoke
npm run stack:up:detached
npm run stack:health
```
