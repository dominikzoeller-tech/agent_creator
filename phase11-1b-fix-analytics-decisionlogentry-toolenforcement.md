# Phase 11.1b – Fix Analytics DecisionLogEntry ToolEnforcement Type

## Problem

Der Frontend-Build schlägt erneut fehl mit:

```text
Property 'toolEnforcement' does not exist on type 'DecisionLogEntry'.
```

Ursache: `frontend/app/api/analytics/route.ts` besitzt einen lokalen `DecisionLogEntry`-Typ. Dieser Typ muss `toolEnforcement` enthalten. Der frühere Fix konnte übersprungen werden, wenn `toolEnforcement` an anderer Stelle in der Datei bereits vorkam.

## Fix

Dieser Hotfix prüft gezielt nur den Block `interface DecisionLogEntry` und ergänzt dort:

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
node scripts/phase11-1b-fix-analytics-decisionlogentry-toolenforcement.cjs
node scripts/phase11-1b-verify-analytics-decisionlogentry-toolenforcement.cjs
```

Danach neu bauen:

```powershell
npm run stack:down
docker compose -f docker-compose.internal.yml build --no-cache api frontend
docker compose -f docker-compose.internal.yml up -d
docker compose -f docker-compose.internal.yml ps
npm run stack:health
```
