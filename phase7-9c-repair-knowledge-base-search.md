# Phase 7.9c – Repair Knowledge Search Function

## Problem

Nach Phase 7.9 war `knowledge-base.ts` syntaktisch beschädigt. Der TypeScript-Fehler zeigte einen kaputten `searchKnowledgeBase`-Block.

## Fix

Dieses Reparatur-Script baut `searchKnowledgeBase` in `knowledge-base.ts` vollständig und sauber neu auf:

- korrekte Funktionssignatur
- gewichtete Titel-/Tag-/Content-Suche
- Stopwords
- `minScore`
- Snippet-Logik bleibt kompatibel

## Anwendung

```powershell
node scripts/add-phase7-9c-repair-knowledge-search-script.cjs
npm run knowledge:search:repair
npm run knowledge:search:repair:verify
npm run knowledge:search:smoke
```

Wenn Smoke grün ist:

```powershell
npm run knowledge:routing:smoke
npm run stack:down
docker compose -f docker-compose.internal.yml build --no-cache api
npm run stack:up:detached
npm run stack:health
```
