# Phase 11.0 – Hard Tool Enforcement & Consent Flow

## Ziel

Phase 11.0 startet den nächsten großen Block: harte Tool-Enforcement-Integration und Consent-Sichtbarkeit.

## Enthalten

- `hardBlocked` im Enforcement Prep
- `consentRequired` im Enforcement Prep
- harter Agent-Gate, wenn `mode=enforce` und `wouldBlock=true`
- neues Chat-Panel `ToolConsentPanel`
- ENV Flag für explizite Consent-Policy
- Runbook

## Wichtig

Harte Blockade ist weiterhin opt-in:

```env
TOOL_PERMISSION_ENFORCEMENT_ENABLED=true
TOOL_PERMISSION_ENFORCEMENT_DRY_RUN=false
```

Ohne diese Flags bleibt der Agent im Beobachtungs-/Dry-Run-Modus.

## Anwendung

```powershell
node scripts/phase11-0-patch-hard-tool-enforcement-consent.cjs
npm run tools:enforcement:hard:verify
```

## Danach API + Frontend neu bauen

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

- Tool Preflight sichtbar
- Tool Enforcement sichtbar
- Tool Consent sichtbar
- Bei Standard-ENV keine harte Blockade

## Enforce-Test optional

Nur zum Testen:

```env
TOOL_PERMISSION_ENFORCEMENT_ENABLED=true
TOOL_PERMISSION_ENFORCEMENT_DRY_RUN=false
```

Erwartung:

- blockierte Tool-Kandidaten führen zu einer kontrollierten Block-Antwort
- Tool Consent Panel zeigt Hard Enforcement Hinweise

## Nächster Schritt

Phase 11.1 – Persistent Consent Requests:

- explizite Consent Requests speichern
- UI-Aktionen für erlauben/ablehnen
- Consent Audit Log
- Tool-Ausführung erst nach bestätigtem Consent
