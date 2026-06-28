# Phase 10.8b – Fix Analytics Tool Enforcement Type

## Problem

Der Frontend-Build bricht ab mit:

```text
Property 'toolEnforcement' does not exist on type 'DecisionLogEntry'.
```

Ursache: `frontend/app/api/analytics/route.ts` hat einen eigenen lokalen `DecisionLogEntry`-Typ. Phase 10.8 hat die Analytics-Logik für `entry.toolEnforcement` ergänzt, aber der lokale Typ wurde nicht erweitert.

## Fix

Dieses Hotfix-Script ergänzt im lokalen `DecisionLogEntry`-Typ:

```ts
toolEnforcement?: {
  enabled?: boolean;
  dryRun?: boolean;
  wouldBlock?: boolean;
  blockedToolIds?: string[];
  allowedToolIds?: string[];
  confirmationRequiredToolIds?: string[];
  reasons?: string[];
  warnings?: string[];
  mode?: string;
};
```

## Anwendung

```powershell
node scripts/phase10-8b-fix-analytics-tool-enforcement-type.cjs
node scripts/phase10-8b-verify-analytics-tool-enforcement-type.cjs
```

Danach erneut bauen:

```powershell
docker compose -f docker-compose.internal.yml build --no-cache frontend
docker compose -f docker-compose.internal.yml up -d
docker compose -f docker-compose.internal.yml ps
npm run stack:health
```
