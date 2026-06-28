# Phase 8.4 – Memory Logs/Analytics

## Ziel

Phase 8.3 macht Project Memory im Chat-Frontend sichtbar. Phase 8.4 macht Project-Memory-Nutzung messbar.

## Neue Analytics-Kennzahlen

Die Analytics-API liefert zusätzlich:

```text
memoryUsedCount
memoryUsedSharePercent
topMemoryTypes
topMemoryTags
topMemoryTitles
```

## Neues Frontend Panel

```text
frontend/components/MemoryAnalyticsPanel.tsx
```

Die Analytics-Seite zeigt damit:

- wie oft Memory genutzt wurde
- Anteil der Memory-Nutzung an allen Logs
- Top Memory-Typen
- Top Memory-Tags
- Top Memory-Titel

## Anwendung

```powershell
node scripts/phase8-4-patch-memory-logs-analytics.cjs
npm run memory:analytics:verify
```

Nach dem Patch sind verfügbar:

```powershell
npm run memory:analytics:patch
npm run memory:analytics:verify
```

## Danach neu bauen

```powershell
npm run stack:down
docker compose -f docker-compose.internal.yml build --no-cache frontend
npm run stack:up:detached
npm run stack:health
```

## Browser-Test

1. Im Chat eine Memory-relevante Frage stellen:

```text
Was wurde in Phase 7 zum Knowledge Layer erreicht?
```

2. Danach Analytics öffnen:

```text
http://localhost:3000/analytics
```

Erwartung:

- Panel `Memory-Analytics` ist sichtbar.
- `Memory genutzt` steigt nach passenden Anfragen.
- Top Memory-Typen zeigt z. B. `milestone` oder `decision`.
