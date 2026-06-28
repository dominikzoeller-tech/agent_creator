# Phase 7.8b – Knowledge Quality Frontend Import Fix

## Problem

Die Route `frontend/app/api/knowledge-quality/route.ts` importiert ursprünglich:

```ts
import { buildKnowledgeQualityReport } from "../../../../knowledge-quality";
```

Im Docker-Frontend-Build ist der Build-Kontext aber `./frontend`. Dadurch kann Next.js Dateien außerhalb von `frontend/` nicht zuverlässig auflösen.

## Fix

- `knowledge-quality.ts` wird nach `frontend/lib/knowledge-quality.ts` kopiert.
- Die API-Route importiert danach lokal aus:

```ts
import { buildKnowledgeQualityReport } from "../../../lib/knowledge-quality";
```

## Anwendung

```powershell
node scripts/phase7-8b-fix-knowledge-quality-frontend-import.cjs
node scripts/add-phase7-8b-knowledge-quality-frontend-import-verify-script.cjs
npm run knowledge:quality:frontendfix:verify
```

## Danach

```powershell
docker compose -f docker-compose.internal.yml config
docker compose -f docker-compose.internal.yml build frontend --no-cache --progress=plain
npm run stack:up:detached
npm run stack:health
```
