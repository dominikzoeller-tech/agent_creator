# Phase 7.5 – Knowledge Hits in Logs/Analytics aufnehmen

## Ziel

Phase 7.4 macht Knowledge Hits in API und Frontend sichtbar. Phase 7.5 macht Knowledge-Nutzung historisch auswertbar.

## Neue Log-Felder

Decision Logs erhalten additiv:

```text
usedKnowledge
knowledgeSummary
knowledgeHits
```

## Neue Analytics-Felder

Die Analytics-API liefert zusätzlich:

```text
knowledgeUsedCount
knowledgeUsedSharePercent
topKnowledgeFiles
topKnowledgeTags
```

## Neues Frontend Panel

```text
frontend/components/KnowledgeAnalyticsPanel.tsx
```

Die Analytics-Seite zeigt damit:

- wie oft Knowledge genutzt wurde
- Knowledge-Anteil an allen Logs
- Top Knowledge-Dateien
- Top Knowledge-Tags

## Anwendung

```powershell
node scripts/add-phase7-5-knowledge-analytics-patch-script.cjs
npm run knowledge:analytics:patch
node scripts/add-phase7-5-knowledge-analytics-verify-script.cjs
npm run knowledge:analytics:verify
```

## Test

```powershell
npm run stack:down
docker compose -f docker-compose.internal.yml build --no-cache
npm run stack:up:detached
npm run stack:health
```

Dann im Browser eine Knowledge-Frage senden:

```text
Wie funktionieren suggestedAgents und routingDetails im Agent Routing?
```

Danach öffnen:

```text
http://localhost:3000/analytics
```

Erwartung:

- Panel `Knowledge-Analytics` ist sichtbar.
- `Knowledge genutzt` steigt nach passenden Anfragen.
- Top Knowledge-Dateien zeigt z. B. `Agent Routing Guide`.
