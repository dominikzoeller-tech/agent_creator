# Phase 8.6 – Memory Quality Checks

## Ziel

Project Memory soll langfristig sauber bleiben. Phase 8.6 ergänzt Qualitätsprüfungen für `memory/project-memory.json`.

## Neue Seite

```text
http://localhost:3000/memory-quality
```

## Neue API

```text
GET /api/memory-quality
```

## Prüfungen

- fehlende ID
- fehlender Titel
- fehlende Summary
- unbekannter Memory-Typ
- fehlende Tags
- sehr kurze Summary
- sehr lange Summary
- doppelte Titel
- alte `system-state` Einträge
- fehlende Zeitstempel

## Anwendung

```powershell
node scripts/phase8-6-patch-memory-quality.cjs
npm run memory:quality:verify
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
http://localhost:3000/memory-quality
```

Erwartung:

- Memory Quality Checks ist sichtbar.
- Memory-Einträge mit Issues werden angezeigt.
- Filter `Nur Einträge mit Issues` und `Alle Einträge` funktioniert.
