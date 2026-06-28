# Phase 8.7 – Memory Navigation & UI Polishing

## Ziel

Memory-Funktionen sollen im Frontend schneller erreichbar und verständlicher verbunden sein.

## Änderungen

- Navigation um `Memory` und `Memory Quality` ergänzen
- Memory Admin mit Schnelllinks zu Memory Quality und Analytics ergänzen
- Memory Quality mit Schnelllink zum Memory Admin ergänzen
- Hinweise klarer machen: Knowledge = Dokumente, Memory = strukturierte Projektfakten

## Anwendung

```powershell
node scripts/phase8-7-patch-memory-ui-polish.cjs
npm run memory:ui:verify
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
http://localhost:3000
http://localhost:3000/memory
http://localhost:3000/memory-quality
http://localhost:3000/analytics
```

Erwartung:

- Memory und Memory Quality sind über die Navigation erreichbar.
- Memory Admin verweist auf Memory Quality.
- Memory Quality verweist zurück auf Memory Admin.

## Nächster Schritt

Phase 8.8 kann Session Summary to Memory vorbereiten:

- Logs/Sessions zusammenfassen
- wichtige Entscheidungen als Memory speichern
- optional manuelle Bestätigung vor Speicherung
