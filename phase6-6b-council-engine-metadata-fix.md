# Phase 6.6b – Council Engine Metadata Fix

## Zweck

Dieses Mini-Paket repariert den Zustand, bei dem in `council-engine.ts` zwar die Imports vorhanden sind, aber die Felder noch nicht in `CouncilResult` und `runCouncil` gesetzt werden.

## Enthaltene Dateien

```text
scripts/phase6-6b-fix-council-engine-metadata.cjs
scripts/add-phase6-6b-fix-script.cjs
phase6-6b-council-engine-metadata-fix.md
```

## Anwendung

Im Projekt-Root ausführen:

```powershell
node scripts/add-phase6-6b-fix-script.cjs
npm run phase6:council:metadata:fix
```

## Danach prüfen

```powershell
Select-String -Path council-engine.ts -Pattern "suggestedAgents|routingDetails|routingSummary|buildCouncilRoutingMetadata"
```

Jetzt sollten Treffer nicht nur bei den Imports erscheinen, sondern auch im Interface und in `runCouncil`.

## Danach Docker API neu bauen

```powershell
npm run stack:down
docker compose -f docker-compose.internal.yml build --no-cache api
npm run stack:up:detached
npm run stack:health
```

## Danach Browser testen

```text
http://localhost:3000
```

Im Debug JSON sollte in `councilResult` sichtbar sein:

```json
"suggestedAgents": [],
"routingDetails": {},
"routingSummary": "..."
```
