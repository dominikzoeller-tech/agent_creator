# Phase 6.6 – council-engine.ts Routing-Metadaten Integration

## Ziel

Diese Phase integriert die neuen Agent-/Routing-Metadaten additiv in `council-engine.ts`.

Bestehende Felder bleiben erhalten:

- `framedQuestion`
- `opinions`
- `agreement`
- `disagreements`
- `missedThings`
- `recommendation`
- `firstStep`
- `confidence`
- `extractedOptions`

Neu ergänzt werden:

- `suggestedAgents`
- `routingDetails`
- `routingSummary`

## Dateien

```text
scripts/phase6-6-patch-council-engine.cjs
scripts/add-phase6-6-patch-script.cjs
phase6-6-council-engine-routing-metadata-patch.md
```

## Einrichtung

```powershell
node scripts/add-phase6-6-patch-script.cjs
```

## Patch ausführen

```powershell
npm run phase6:council:patch
```

## Danach testen

```powershell
npm run agent:capabilities:test
npm run agent:routing:test
npm run council:routing:metadata:test
npm run phase6:council:inspect
npm run routing:regression
npm run stack:up:detached
npm run stack:health
```

Falls `api:smoke` bei dir als Script existiert, zusätzlich:

```powershell
npm run api:smoke
```

## Erwarteter Effekt

`runCouncil(...)` gibt weiterhin ein `CouncilResult` zurück, aber das Result enthält zusätzlich Routing-Metadaten.

```ts
{
  recommendation: "...",
  firstStep: "...",
  confidence: 0.82,
  suggestedAgents: ["decision_agent", "technical_agent"],
  routingSummary: "Route: council | Komplexität: ...",
  routingDetails: { ... }
}
```

## Rollback

Falls etwas unerwartet ist und noch nicht committed wurde:

```powershell
git checkout -- council-engine.ts package.json
```
