# Phase 6.8b2 – Fix für Routing-Metadaten Logging / Analytics Patch

## Problem

Der erste Phase-6.8b-Patch brach mit `ReferenceError: response is not defined` ab.

Ursache war ein Template-Literal im Patch-Script selbst.

## Fix

Dieses Paket ersetzt den fehlerhaften Patch durch eine sichere Variante:

- keine ungewollte Template-Auswertung im Node-Script
- Cloud-Logging wird erweitert
- Local-Policy-Logging wird best effort erweitert
- Analytics API bekommt zusätzliche Felder

## Anwendung

```powershell
node scripts/add-phase6-8b2-patch-script.cjs
npm run phase6:logs:patch2
```

## Danach testen

```powershell
npm run stack:down
docker compose -f docker-compose.internal.yml build --no-cache api
npm run stack:up:detached
npm run stack:health
```

Danach im Browser eine neue Council-Anfrage senden und danach Analytics öffnen.
