# Phase 10.3 – Tool Preflight in Agent Debug

## Ziel

Phase 10.2 stellt eine Preflight API bereit. Phase 10.3 macht Preflight-Ergebnisse im echten Agent Debug sichtbar.

## Verhalten

Der Agent berechnet bei jeder Anfrage:

```json
"toolPreflight": {
  "sensitivity": "internal",
  "processingMode": "auto",
  "candidateToolIds": [],
  "allowedToolIds": [],
  "blockedToolIds": [],
  "decisions": []
}
```

## Wichtig

Diese Phase blockiert den Agent Flow noch nicht hart.

Sie macht nur sichtbar:

- welche Tools Kandidaten wären
- welche Tools erlaubt wären
- welche Tools blockiert wären
- warum Tools blockiert werden
- ob Confirmation empfohlen wird

## Anwendung

```powershell
node scripts/phase10-3-patch-tool-preflight-debug.cjs
npm run tools:preflight:debug:verify
```

## Danach API neu bauen

```powershell
npm run stack:down
docker compose -f docker-compose.internal.yml build --no-cache api frontend
npm run stack:up:detached
npm run stack:health
```

## Browser-Test

Im Chat Debug JSON fragen:

```text
Was ist aktuell zu Privacy-first AI Agents relevant?
```

Erwartung:

- `toolPreflight` ist im Debug JSON sichtbar.
- `web-research` erscheint als Kandidat.
- Bei `internal` wird `web-research` blockiert.

## Nächster Schritt

Phase 10.4 – Tool Preflight UI Panel:

- eigenes Frontend Panel für Tool Preflight
- Allowed/Blocked Tool-Kandidaten sichtbar
- Gründe und Warnungen schön rendern
