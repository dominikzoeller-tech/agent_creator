# Phase 6.6c – Council Engine Metadata Line-Fix

## Zweck

Der vorherige Regex-Fix konnte das `CouncilResult` Interface nicht sicher finden. Dieser Fix arbeitet deshalb line-basiert und ist robuster.

## Dateien

```text
scripts/phase6-6c-line-fix-council-engine-metadata.cjs
scripts/add-phase6-6c-line-fix-script.cjs
phase6-6c-council-engine-metadata-line-fix.md
```

## Anwendung

```powershell
node scripts/add-phase6-6c-line-fix-script.cjs
npm run phase6:council:metadata:linefix
```

## Prüfen

```powershell
Select-String -Path council-engine.ts -Pattern "suggestedAgents|routingDetails|routingSummary|buildCouncilRoutingMetadata"
```

Danach Docker API neu bauen:

```powershell
npm run stack:down
docker compose -f docker-compose.internal.yml build --no-cache api
npm run stack:up:detached
npm run stack:health
```
