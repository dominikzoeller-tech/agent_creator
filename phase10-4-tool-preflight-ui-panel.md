# Phase 10.4 – Tool Preflight UI Panel

## Ziel

Phase 10.3 zeigt Tool Preflight im Debug JSON. Phase 10.4 macht die Ergebnisse im Chat-Frontend als eigenes Panel sichtbar.

## Neues Panel

```text
frontend/components/ToolPreflightPanel.tsx
```

Das Panel zeigt:

- Sensitivity
- Processing Mode
- Anzahl Tool-Kandidaten
- erlaubte Tools
- blockierte Tools
- erkannte Tool-Kandidaten
- Blockiergründe
- Warnungen
- Hinweis auf empfohlene manuelle Bestätigung
- optional nicht erkannte Tools im Details-Bereich

## Anwendung

```powershell
node scripts/phase10-4-patch-tool-preflight-panel.cjs
npm run tools:preflight:panel:verify
```

## Danach Frontend neu bauen

```powershell
npm run stack:down
docker compose -f docker-compose.internal.yml build --no-cache frontend
npm run stack:up:detached
npm run stack:health
```

## Browser-Test

Im Chat fragen:

```text
Was ist aktuell zu Privacy-first AI Agents relevant?
```

Erwartung:

- Panel `Tool Preflight` ist sichtbar.
- `web-research` erscheint als Kandidat.
- Bei `internal` wird `web-research` blockiert.
- Blockiergründe werden lesbar angezeigt.

## Nächster Schritt

Phase 10.5 – Tool Preflight Analytics:

- erkannte Tool-Kandidaten zählen
- blockierte Tools zählen
- Top Blockiergründe auswerten
- High-Risk Tool Kandidaten sichtbar machen
