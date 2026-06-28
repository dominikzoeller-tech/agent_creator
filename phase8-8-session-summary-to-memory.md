# Phase 8.8 – Session Summary to Memory

## Ziel

Aus Logs/Sessions sollen Memory-Vorschläge entstehen, die als strukturierte Project-Memory-Einträge gespeichert werden können.

## Neue Seite

```text
http://localhost:3000/memory-sessions
```

## Neue API

```text
GET  /api/memory-session-summary?limit=25&save=false
POST /api/memory-session-summary
```

## Funktionen

- letzte Logeinträge lesen
- Memory-/Knowledge-Nutzung zählen
- Routenverteilung berechnen
- Top Memory-Titel und Top Knowledge-Titel extrahieren
- daraus einen Memory-Vorschlag bauen
- optional direkt in `memory/project-memory.json` speichern

## Anwendung

```powershell
node scripts/phase8-8-patch-session-summary-memory.cjs
npm run memory:sessions:verify
```

## Danach neu bauen

```powershell
npm run stack:down
docker compose -f docker-compose.internal.yml build --no-cache frontend
npm run stack:up:detached
npm run stack:health
```

## Browser-Test

```text
http://localhost:3000/memory-sessions
```

Erwartung:

- Vorschlag erzeugen funktioniert.
- Als Memory speichern legt einen neuen Eintrag in `memory/project-memory.json` an.
- Der Eintrag ist danach unter `/memory` sichtbar.
