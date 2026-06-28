# Phase 11.1 Persistent Consent Requests Runbook

## Ziel

Phase 11.1 ergänzt persistente Consent Requests für bestätigungspflichtige Tool-Ausführung.

## Neue Seite

```text
/tool-consent
```

## Neue API

```text
GET   /api/tool-consent
POST  /api/tool-consent
PATCH /api/tool-consent
```

## Statuswerte

```text
pending
approved
denied
expired
```

## Speicherort

Standard im Frontend-Container:

```text
data/tool-consent-requests.json
```

Optional steuerbar über:

```env
TOOL_CONSENT_DATA_DIR=/app/data
```

## Sicherheit

`userInputPreview` wird vor Speicherung gekürzt und einfache Secret-/E-Mail-Muster werden redigiert.

## Tests

```powershell
npm run tools:consent:verify
```

Danach Frontend neu bauen:

```powershell
npm run stack:down
docker compose -f docker-compose.internal.yml build --no-cache frontend
npm run stack:up:detached
npm run stack:health
```
