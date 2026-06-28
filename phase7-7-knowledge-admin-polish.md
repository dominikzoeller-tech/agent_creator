# Phase 7.7 – Knowledge Admin Navigation & UI Polishing

## Ziel

Phase 7.6 hat die Knowledge-Admin-Seite angelegt. Phase 7.7 macht diese Seite im Frontend besser erreichbar und etwas verständlicher.

## Änderungen

- Knowledge-Link in die bestehende Navigation ergänzen
- Knowledge-Seite mit Schnellnavigation ergänzen
- Hinweis ergänzen, dass Knowledge-Dateien lokal im `knowledge/` Ordner gespeichert werden

## Anwendung

```powershell
node scripts/add-phase7-7-knowledge-admin-polish-script.cjs
npm run knowledge:admin:polish
node scripts/add-phase7-7-knowledge-admin-polish-verify-script.cjs
npm run knowledge:admin:polish:verify
```

## Danach neu bauen

```powershell
npm run stack:down
docker compose -f docker-compose.internal.yml build --no-cache
npm run stack:up:detached
npm run stack:health
```

## Browser-Test

```text
http://localhost:3000
http://localhost:3000/knowledge
http://localhost:3000/analytics
```

Erwartung:

- In der Navigation ist `Knowledge` sichtbar.
- `/knowledge` zeigt die Knowledge-Admin-Seite.
- Bestehende Knowledge-Dateien sind weiterhin sichtbar.
