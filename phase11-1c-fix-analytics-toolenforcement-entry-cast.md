# Phase 11.1c – Fix Analytics ToolEnforcement Entry Cast

## Problem

Der Build meldet weiterhin:

```text
Property 'toolEnforcement' does not exist on type 'DecisionLogEntry'.
```

Obwohl `toolEnforcement?:` in `frontend/app/api/analytics/route.ts` vorkommt, erkennt TypeScript die `entries`-Variable weiterhin als `DecisionLogEntry[]` ohne dieses Feld. Das kann passieren, wenn das Feld nicht im tatsächlich genutzten Interface-Block liegt oder wenn der Typ an anderer Stelle enger inferiert wird.

## Fix

Dieser Hotfix ergänzt einen expliziten erweiterten Typ:

```ts
type DecisionLogEntryWithToolEnforcement = DecisionLogEntry & {
  toolEnforcement?: { ... };
};
```

Und castet die Analytics-Einträge vor der Enforcement-Auswertung:

```ts
const entriesWithToolEnforcement = entries as DecisionLogEntryWithToolEnforcement[];
const toolEnforcementEntries = entriesWithToolEnforcement.filter((entry) => Boolean(entry.toolEnforcement));
```

Damit bleiben alle bestehenden `DecisionLogEntry`-Typen unverändert, aber die Phase-10.8/11.x Enforcement-Analytics kann sauber bauen.

## Anwendung

```powershell
node scripts/phase11-1c-fix-analytics-toolenforcement-entry-cast.cjs
node scripts/phase11-1c-verify-analytics-toolenforcement-entry-cast.cjs
```

Danach neu bauen:

```powershell
npm run stack:down
docker compose -f docker-compose.internal.yml build --no-cache api frontend
docker compose -f docker-compose.internal.yml up -d
docker compose -f docker-compose.internal.yml ps
npm run stack:health
```
