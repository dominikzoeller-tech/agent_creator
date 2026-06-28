# Phase 8.9 – Memory Session Navigation & Confirmation UX

## Ziel

Phase 8.8 erzeugt Session-Summaries als Memory-Vorschläge. Phase 8.9 macht das Speichern sicherer und komfortabler.

## Änderungen

- `/memory-sessions` wird in der Navigation verlinkt
- Memory-Vorschlag kann vor dem Speichern bearbeitet werden
- Speichern erfolgt erst nach Bestätigung über `window.confirm`
- Nach dem Speichern wird die neue Memory-ID angezeigt
- Link zum Memory Admin ist sichtbar

## Anwendung

```powershell
node scripts/phase8-9-patch-memory-session-ux.cjs
npm run memory:sessions:ux:verify
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

1. `Vorschlag erzeugen` erzeugt eine editierbare Zusammenfassung.
2. Titel, Tags, Typ und Summary können bearbeitet werden.
3. `Geprüften Vorschlag speichern` fragt nach Bestätigung.
4. Nach Bestätigung wird ein Memory-Eintrag gespeichert.
5. Der Eintrag ist unter `/memory` sichtbar.
