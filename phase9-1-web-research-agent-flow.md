# Phase 9.1 – Web Research in Agent Flow

## Ziel

Phase 9.0 hat Web Research separat testbar gemacht. Phase 9.1 integriert Web Research kontrolliert in den echten Agent Flow.

## Verhalten

Web Research wird nur genutzt, wenn:

1. `WEB_RESEARCH_ENABLED=true`
2. die Anfrage Web-/Aktualitäts-Intent enthält, z. B. `aktuell`, `latest`, `news`, `recherche`
3. die Anfrage keine offensichtlichen sensiblen Daten enthält

## Neue Response-Felder

```json
"usedWebResearch": true,
"webResearchEnabled": true,
"webResearchQuery": "...",
"webResearchMessage": "...",
"webResearchResults": []
```

## Privacy Guard

Der Query-Sanitizer blockt einfache sensible Muster:

- E-Mail-Adressen
- Telefonnummern
- API-Key-/Secret-/Token-Hinweise

## Anwendung

```powershell
node scripts/phase9-1-patch-web-research-agent-flow.cjs
npm run web:research:flow:verify
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

- Agent antwortet normal.
- Debug JSON enthält Web-Research-Felder.
- `usedWebResearch` bleibt false, solange `WEB_RESEARCH_ENABLED=false`.

Mit später aktivierter Websuche:

```env
WEB_RESEARCH_ENABLED=true
BING_SEARCH_API_KEY=...
```

werden Web-Ergebnisse als zusätzlicher Kontext in den Agent Flow gemerged.

## Nächster Schritt

Phase 9.2 – AI Web Research Summary:

- Web-Ergebnisse vom LLM zusammenfassen lassen
- Quellenliste sichtbar machen
- optional Research-Ergebnis als Knowledge/Memory speichern
