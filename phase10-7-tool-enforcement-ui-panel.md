# Phase 10.7 – Tool Enforcement UI Panel

## Ziel

Phase 10.6 ergänzt `toolEnforcement` im Debug JSON. Phase 10.7 macht diese Enforcement-Auswertung im Chat-Frontend sichtbar.

## Neues Panel

```text
frontend/components/ToolEnforcementPanel.tsx
```

Das Panel zeigt:

- Enforcement Mode
- Enforcement aktiv ja/nein
- Dry Run ja/nein
- `wouldBlock`
- erlaubte Tools
- blockierte Tools
- Tools mit empfohlener Bestätigung
- Blockiergründe
- Warnungen
- klare Hinweise für `off` und `dry-run`

## Anwendung

```powershell
node scripts/phase10-7-patch-tool-enforcement-panel.cjs
npm run tools:enforcement:panel:verify
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

- Panel `Tool Enforcement` ist sichtbar.
- Standardmodus ist `off`.
- `wouldBlock` wird angezeigt.
- Es wird noch nichts hart blockiert.

## Optionaler Dry-Run-Test

In `.env`:

```env
TOOL_PERMISSION_ENFORCEMENT_ENABLED=true
TOOL_PERMISSION_ENFORCEMENT_DRY_RUN=true
```

Danach Stack neu starten.

Erwartung:

- Mode `dry-run`
- `wouldBlock` kann true sein
- Agent Flow läuft trotzdem weiter

## Nächster Schritt

Phase 10.8 – Tool Enforcement Analytics:

- wouldBlock zählen
- Dry-Run Blockiergründe auswerten
- Top blocked tools anzeigen
- Rollout-Reife messen
