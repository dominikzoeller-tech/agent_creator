# Phase 7.6 – Knowledge Admin im Frontend

## Ziel

Lokale Knowledge-Dateien im Frontend verwalten:

- Dateien aus `knowledge/` listen
- Dateiinhalt ansehen
- Markdown/Text-Dateien erstellen oder bearbeiten
- Dateien löschen

## Neue Routen

```text
http://localhost:3000/knowledge
```

## Neue API

```text
GET    /api/knowledge
GET    /api/knowledge?file=agent-routing-guide.md
POST   /api/knowledge
DELETE /api/knowledge?file=agent-routing-guide.md
```

## Sicherheit / Scope

- nur `.md` und `.txt`
- Dateiname wird sanitisiert
- Pfad-Traversal wird blockiert
- maximal 200.000 Zeichen pro Datei
- Knowledge bleibt lokal im Docker-Volume `./knowledge:/knowledge`

## Anwendung

```powershell
node scripts/add-phase7-6-knowledge-admin-patch-script.cjs
npm run knowledge:admin:patch
npm run knowledge:admin:verify
```

## Stack-Test

```powershell
npm run stack:down
docker compose -f docker-compose.internal.yml build --no-cache
npm run stack:up:detached
npm run stack:health
```

## Browser-Test

```text
http://localhost:3000/knowledge
```

Erwartung:

- vorhandene Knowledge-Dateien sind sichtbar
- `agent-routing-guide.md` kann geöffnet werden
- neue `.md` Datei kann gespeichert werden
- `/api/knowledge` liefert JSON mit Dateien
