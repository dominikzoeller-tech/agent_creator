# Phase 9.5 – Web Research Save to Knowledge/Memory

## Ziel

Web Research soll dauerhaft nutzbar werden, indem geprüfte Research-Ergebnisse gespeichert werden können.

## Neue Seite

```text
http://localhost:3000/web-research-save
```

## Neue API

```text
POST /api/web-research-save
```

## Funktionen

- Web Research laden
- Summary manuell prüfen/bearbeiten
- als Knowledge-Datei speichern
- optional als Project-Memory-Eintrag speichern
- manuelle Bestätigung vor Speicherung

## Speicherorte

Knowledge:

```text
knowledge/*.md
```

Memory:

```text
memory/project-memory.json
```

## Anwendung

```powershell
node scripts/phase9-5-patch-web-research-save.cjs
npm run web:research:save:verify
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
http://localhost:3000/web-research-save
```

Erwartung:

1. `Web Research laden` funktioniert, wenn Web Research aktiviert ist.
2. Summary kann geprüft und bearbeitet werden.
3. `Geprüftes Research speichern` fragt nach Bestätigung.
4. Knowledge-Datei erscheint danach unter `knowledge/`.
5. Optionaler Memory-Eintrag erscheint unter `/memory`.

## Nächster Schritt

Phase 9.6 – Web Research Quality & Governance:

- Quellen-Deduplizierung
- Mindestanzahl Quellen
- Warnung bei fehlender Summary
- Governance-Regeln für externe Quellen
