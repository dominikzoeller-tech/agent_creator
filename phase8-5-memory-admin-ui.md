# Phase 8.5 – Memory Admin UI

## Ziel

Project Memory soll im Frontend verwaltbar werden.

Neue Seite:

```text
http://localhost:3000/memory
```

Neue API:

```text
GET    /api/memory
POST   /api/memory
DELETE /api/memory?id=...
```

## Funktionen

- Memory-Einträge aus `memory/project-memory.json` anzeigen
- nach Text, Typ und Tag filtern
- neue Einträge erstellen
- bestehende Einträge bearbeiten
- Einträge löschen

## Memory-Typen

```text
decision
milestone
issue
preference
system-state
note
```

## Anwendung

```powershell
node scripts/phase8-5-patch-memory-admin.cjs
npm run memory:admin:verify
```

Danach neu bauen:

```powershell
npm run stack:down
docker compose -f docker-compose.internal.yml build --no-cache frontend
npm run stack:up:detached
npm run stack:health
```

## Browser-Test

```text
http://localhost:3000/memory
```

Erwartung:

- Project Memory Admin ist sichtbar
- bestehende Memory-Einträge sind sichtbar
- neue Einträge können gespeichert werden
- Einträge können bearbeitet und gelöscht werden

## Nächster Schritt

Phase 8.6 kann Memory-Qualität prüfen:

- fehlende Tags
- sehr kurze Summaries
- doppelte Titel
- veraltete Systemzustände
