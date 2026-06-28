# Phase 8.3 – Memory Hits im Frontend sichtbar machen

## Ziel

Phase 8.2 integriert Project Memory in den Agent Flow und ergänzt die API-Response um:

```json
"usedMemory": true,
"memorySummary": "...",
"memoryHits": []
```

Phase 8.3 macht diese Felder im Frontend sichtbar.

## Neue Komponente

```text
frontend/components/MemoryHitsPanel.tsx
```

Das Panel zeigt:

- Used Memory ja/nein
- Memory Summary
- gefundene Memory-Einträge
- Typ, Titel, Summary, Tags, Source

## Anwendung

```powershell
npm run memory:flow:verify
node scripts/phase8-3-patch-memory-visibility.cjs
npm run memory:visibility:verify
```

Nach dem Patch sind auch diese Scripts in `package.json` verfügbar:

```powershell
npm run memory:visibility:patch
npm run memory:visibility:verify
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
http://localhost:3000
```

Frage:

```text
Was wurde in Phase 7 zum Knowledge Layer erreicht?
```

Erwartung:

- Antwort kommt normal.
- Panel `Project Memory Treffer` erscheint.
- Debug JSON enthält `usedMemory`, `memorySummary`, `memoryHits`.
