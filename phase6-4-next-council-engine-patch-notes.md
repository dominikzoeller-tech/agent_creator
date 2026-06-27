# Phase 6.5 Vorschau – council-engine.ts Patch Notes

## Ziel

Nach erfolgreichem Phase-6.4-Preflight kann `council-engine.ts` vorsichtig erweitert werden.

## Geplanter Minimal-Patch

1. Import ergänzen:

```ts
import { buildCouncilRoutingMetadata } from "./council-routing-metadata";
```

2. In der Hauptfunktion des Council Engines am Anfang berechnen:

```ts
const routingMetadata = buildCouncilRoutingMetadata({
  userInput,
  sensitivity,
  processingMode,
  includeCouncilResult,
});
```

3. Ergebnisobjekt ergänzen:

```ts
suggestedAgents: routingMetadata.suggestedAgents,
routingDetails: routingMetadata.routingDetails,
routingSummary: routingMetadata.summary,
```

## Wichtige Regel

Erst als additive Felder ergänzen. Keine bestehende Rückgabestruktur entfernen.

## Danach testen

```powershell
npm run routing:regression
npm run api:smoke
npm run stack:up:detached
npm run stack:health
```
