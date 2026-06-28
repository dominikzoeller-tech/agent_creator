# Phase 7.9 – Knowledge Search Tuning

## Ziel

Die lokale Knowledge-Suche soll relevantere Treffer liefern.

## Verbesserungen

- Titel werden stärker gewichtet
- Tags werden stärker gewichtet
- Inhalte werden schwächer, aber weiterhin berücksichtigt
- exakte Phrasen erhalten Bonuspunkte
- Stopwords werden aus der Query entfernt
- `minScore` filtert schwache Zufallstreffer
- Snippets werden um den ersten relevanten Suchbegriff gebaut

## Neue / geänderte Dateien

```text
knowledge-base.ts
knowledge-search-tuning-smoke-test.ts
scripts/phase7-9-patch-knowledge-search-tuning.cjs
scripts/add-phase7-9-knowledge-search-tuning-script.cjs
scripts/phase7-9-verify-knowledge-search-tuning.cjs
scripts/add-phase7-9-knowledge-search-tuning-verify-script.cjs
phase7-9-knowledge-search-tuning.md
```

## Anwendung

```powershell
node scripts/add-phase7-9-knowledge-search-tuning-script.cjs
npm run knowledge:search:tune
node scripts/add-phase7-9-knowledge-search-tuning-verify-script.cjs
npm run knowledge:search:verify
npm run knowledge:search:smoke
```

## Danach testen

```powershell
npm run knowledge:routing:smoke
npm run stack:down
docker compose -f docker-compose.internal.yml build --no-cache api
npm run stack:up:detached
npm run stack:health
```

## Browser-Test

```text
http://localhost:3000
```

Frage:

```text
Wie funktionieren suggestedAgents und routingDetails im Agent Routing?
```

Erwartung:

- Knowledge-Hit `Agent Routing Guide` erscheint weiterhin.
- Irrelevante Zufallstreffer werden stärker reduziert.
