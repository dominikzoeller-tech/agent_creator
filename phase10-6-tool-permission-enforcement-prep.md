# Phase 10.6 – Tool Permission Enforcement Prep

## Ziel

Phase 10.6 bereitet Tool Permission Enforcement vor, ohne den Agent Flow hart zu blockieren.

## Neue Root-Datei

```text
tool-enforcement-prep.ts
```

## Neue Debug-Felder

Der Agent ergänzt künftig:

```json
"toolEnforcement": {
  "enabled": false,
  "dryRun": true,
  "wouldBlock": false,
  "blockedToolIds": [],
  "allowedToolIds": [],
  "confirmationRequiredToolIds": [],
  "reasons": [],
  "warnings": [],
  "mode": "off"
}
```

## Wichtig

Diese Phase blockiert noch nicht hart. Sie bereitet nur vor:

- Enforcement Config
- Dry-Run Modus
- wouldBlock Auswertung
- Rollback-Schalter
- Debug/Decision Log Sichtbarkeit

## Anwendung

```powershell
node scripts/phase10-6-patch-tool-enforcement-prep.cjs
npm run tools:enforcement:prep:verify
```

## Danach API und Frontend neu bauen

```powershell
npm run stack:down
docker compose -f docker-compose.internal.yml build --no-cache api frontend
npm run stack:up:detached
npm run stack:health
```

## Browser-Test

Im Chat fragen:

```text
Was ist aktuell zu Privacy-first AI Agents relevant?
```

Erwartung:

- `toolPreflight` ist sichtbar.
- `toolEnforcement` ist sichtbar.
- Standardmodus ist `off`.
- Es wird noch nichts hart blockiert.

## Nächster Schritt

Phase 10.7 – Tool Enforcement UI Panel:

- Tool Enforcement im Chat UI sichtbar machen
- wouldBlock, mode, reasons und warnings anzeigen
- Safe staged rollout vorbereiten
