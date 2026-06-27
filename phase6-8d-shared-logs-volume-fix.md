# Phase 6.8d – Shared Logs Volume Fix

## Problem

Die Analytics-Seite ist sichtbar, zeigt aber im Docker-Betrieb weiterhin `0` beziehungsweise `Noch keine Daten vorhanden`.

Wahrscheinliche Ursache:

- API-Container schreibt Decision Logs nach `/app/logs/decision-log.jsonl`.
- Frontend-Container liest Analytics aus `/logs/decision-log.jsonl`, weil `frontend/app/api/analytics/route.ts` relativ zu `/app` den Pfad `../logs` nutzt.
- Ohne geteiltes Volume sehen API und Frontend unterschiedliche Dateisysteme.

## Fix

`docker-compose.internal.yml` bekommt geteilte Log-Mounts:

```yaml
api:
  volumes:
    - ./logs:/app/logs

frontend:
  volumes:
    - ./logs:/logs:ro
```

Damit schreibt die API auf dem Host in `./logs`, und die Frontend-Analytics-API kann dieselben Logs lesen.

## Anwendung

```powershell
node scripts/add-phase6-8d-shared-logs-volume-script.cjs
npm run phase6:logs:shared-volume
```

## Danach neu starten

```powershell
npm run stack:down
npm run stack:up:detached
npm run stack:health
```

## Test

1. Neue Council-Anfrage auf `http://localhost:3000` senden.
2. Danach `http://localhost:3000/analytics` öffnen.
3. Der Abschnitt `Agenten- und Routing-Analytics` sollte Daten anzeigen.

## Optional prüfen

```powershell
Get-Content .\logs\decision-log.jsonl -Tail 3
```
