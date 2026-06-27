# Phase 6.6 Dockerfile Copy Fix

## Problem

Nach der Phase-6.6-Integration importiert `council-engine.ts` neue Module:

- `council-routing-metadata.ts`
- `agent-routing-details.ts`
- `agent-capabilities.ts`
- optional `council-routing-response-types.ts`

Der API-Dockerfile hatte diese Dateien aber noch nicht in das Image kopiert.
Dadurch kann der API-Container beim Start fehlschlagen und anschließend als `unhealthy` markiert werden.

## Fix

Der Root-`Dockerfile` wurde erweitert um:

```dockerfile
COPY agent-capabilities.ts ./
COPY agent-routing-details.ts ./
COPY council-routing-metadata.ts ./
COPY council-routing-response-types.ts ./
```

## Test

```powershell
npm run stack:down
docker compose -f docker-compose.internal.yml build --no-cache api
npm run stack:up:detached
npm run stack:health
```

Wenn alles sauber läuft, committen:

```powershell
git add Dockerfile
git commit -m "fix: copy phase 6 routing modules into api docker image"
git push origin main
```
