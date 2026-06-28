# Phase 9.2 – AI Web Research Summary

## Ziel

Phase 9.1 integriert Web Research in den Agent Flow. Phase 9.2 lässt gefundene Web-Ergebnisse zusätzlich vom LLM zusammenfassen.

## Verhalten

Wenn Web Research Ergebnisse liefert und `OPENAI_API_KEY` vorhanden ist:

- Snippets werden an das LLM übergeben
- das LLM erzeugt eine kurze deutsche Research-Zusammenfassung
- Quellen werden strukturiert als `webResearchSources` zurückgegeben

Wenn keine Ergebnisse vorhanden sind oder kein Key vorhanden ist:

- Agent Flow läuft normal weiter
- `webResearchSummaryMessage` erklärt den Grund

## Neue Response-Felder

```json
"usedWebResearchSummary": true,
"webResearchSummary": "...",
"webResearchSummaryMessage": "...",
"webResearchSources": []
```

## Anwendung

```powershell
node scripts/phase9-2-patch-ai-web-research-summary.cjs
npm run web:research:summary:verify
```

## Danach neu bauen

```powershell
npm run stack:down
docker compose -f docker-compose.internal.yml build --no-cache api
npm run stack:up:detached
npm run stack:health
```

## Browser-Test

Mit Web Research deaktiviert:

```text
Was ist aktuell zu Privacy-first AI Agents relevant?
```

Erwartung:

- Agent antwortet normal
- Debug JSON enthält `webResearchSummaryMessage`
- `usedWebResearchSummary` bleibt false/leer, solange keine Web-Ergebnisse vorhanden sind

Mit Web Research aktiv und Bing-Key:

```env
WEB_RESEARCH_ENABLED=true
BING_SEARCH_API_KEY=...
```

werden Web-Ergebnisse gesucht und vom LLM zusammengefasst.

## Nächster Schritt

Phase 9.3 – Web Research Frontend Visibility:

- Web Research Results im Frontend anzeigen
- AI Summary sichtbar machen
- Quellenliste anklickbar rendern
