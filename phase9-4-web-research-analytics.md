# Phase 9.4 – Web Research Analytics

## Ziel

Phase 9.3 macht Web Research im Chat sichtbar. Phase 9.4 macht Web-Research-Nutzung messbar.

## Neue Analytics-Kennzahlen

Die Analytics-API liefert zusätzlich:

```text
webResearchUsedCount
webResearchUsedSharePercent
webResearchSummaryUsedCount
webResearchSummarySuccessPercent
topWebResearchQueries
topWebResearchSources
topWebResearchTitles
```

## Neues Frontend Panel

```text
frontend/components/WebResearchAnalyticsPanel.tsx
```

Die Analytics-Seite zeigt damit:

- wie oft Web Research genutzt wurde
- Anteil der Web-Research-Nutzung an allen Logs
- wie oft AI Research Summary erfolgreich war
- Top Web-Queries
- Top Web-Quellen
- Top Web-Titel

## Anwendung

```powershell
node scripts/phase9-4-patch-web-research-analytics.cjs
npm run web:research:analytics:verify
```

## Danach neu bauen

```powershell
npm run stack:down
docker compose -f docker-compose.internal.yml build --no-cache frontend
npm run stack:up:detached
npm run stack:health
```

## Browser-Test

1. Im Chat eine Web-Research-relevante Frage stellen:

```text
Was ist aktuell zu Privacy-first AI Agents relevant?
```

2. Danach Analytics öffnen:

```text
http://localhost:3000/analytics
```

Erwartung:

- Panel `Web-Research-Analytics` ist sichtbar.
- Bei deaktivierter Websuche sind die Werte wahrscheinlich 0.
- Bei aktivierter Websuche steigen Web Research Count und ggf. Summary-Erfolg.

## Nächster Schritt

Phase 9.5 – Web Research Save to Knowledge/Memory:

- Research-Ergebnis als Knowledge-Datei speichern
- Research-Zusammenfassung als Memory speichern
- manuelle Bestätigung vor Speicherung
