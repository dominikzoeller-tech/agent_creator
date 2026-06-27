# Phase 6.8c2 – Analytics UI Variable Fix

## Problem

Der Frontend-Build bricht ab mit:

```text
Type error: Cannot find name 'analytics'.
```

Ursache: Der Phase-6.8c-Patch hat dieses Panel eingefügt:

```tsx
<AgentRoutingAnalyticsPanel analytics={analytics} />
```

In der echten Datei `frontend/app/analytics/page.tsx` heißt die Analytics-Datenvariable aber anders, zum Beispiel `summary`, `data`, `stats` oder `analyticsData`.

## Fix

Dieses Script sucht automatisch die vorhandene Analytics-State-Variable in `frontend/app/analytics/page.tsx` und ersetzt:

```tsx
analytics={analytics}
```

mit der korrekten Variable.

## Anwendung

```powershell
node scripts/add-phase6-8c2-analytics-ui-fix-script.cjs
npm run phase6:analytics:ui:fix
```

## Danach testen

```powershell
docker compose -f docker-compose.internal.yml build frontend --no-cache --progress=plain
npm run stack:up:detached
npm run stack:health
```

Wenn der Build läuft, Browser öffnen:

```text
http://localhost:3000/analytics
```
