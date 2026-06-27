# Phase 6.8b3 – DecisionLogEntry Type Fix

## Problem

Der API-Container bricht mit TypeScript Fehler ab:

```text
server.ts(...): error TS2353: Object literal may only specify known properties, and 'suggestedAgents' does not exist in type 'DecisionLogEntry'.
```

## Ursache

`server.ts` schreibt bereits `suggestedAgents`, `routingDetails` und `routingSummary` in den Decision Log, aber das Interface `DecisionLogEntry` in `decision-log.ts` enthält diese Felder noch nicht.

## Anwendung

```powershell
node scripts/add-phase6-8b3-decision-log-typefix-script.cjs
npm run phase6:decisionlog:typefix
```

## Prüfen

```powershell
Select-String -Path decision-log.ts -Pattern "suggestedAgents|routingDetails|routingSummary"
```

## Danach API neu bauen

```powershell
npm run stack:down
docker compose -f docker-compose.internal.yml build --no-cache api
npm run stack:up:detached
npm run stack:health
```
