# Phase 10 Tool Governance Release Notes

## Ziel

Phase 10 macht Agent-Tools sichtbar, bewertbar, messbar und für spätere harte Governance vorbereitet.

## Enthaltene Phasen

### 10.0 – Tool Registry Foundation

- zentrale Tool Registry
- `/tools`
- `/api/tools`
- Risiko, externe Netzwerke, Secrets und Schreibzugriffe sichtbar

### 10.1 – Tool Permissions Matrix

- `/tool-permissions`
- `/api/tool-permissions`
- Matrix nach Sensitivity und Processing Mode
- erste Blockierlogik als Beobachtung

### 10.2 – Tool Permission Preflight API

- `/tool-preflight`
- `/api/tool-preflight`
- einzelnes Tool gegen Anfrage prüfen
- sensible Daten im User Input erkennen

### 10.3 – Tool Preflight in Agent Debug

- `toolPreflight` im Agent Debug JSON
- automatisch erkannte Tool-Kandidaten
- erlaubte/blockierte Tool-Kandidaten sichtbar

### 10.4 – Tool Preflight UI Panel

- Chat-UI-Panel für Tool Preflight
- Blockiergründe und Warnungen lesbar

### 10.5 – Tool Preflight Analytics

- Preflight-Kandidaten messbar
- Top blockierte Tools und Gründe sichtbar

### 10.6 – Tool Permission Enforcement Prep

- `toolEnforcement` im Agent Debug JSON
- ENV-Schalter für off/dry-run/enforce vorbereitet
- keine harte Blockade

### 10.7 – Tool Enforcement UI Panel

- Chat-UI-Panel für Enforcement Prep
- `wouldBlock`, Mode, Reasons, Warnings sichtbar

### 10.8 – Tool Enforcement Analytics

- Enforcement-Dry-Run-Metriken
- Would-Block-Quote
- Top Reasons und Modes

### 10.9 – Release Polish

- Release Notes
- Governance Runbook
- finale Verify/Smoke Scripts
- Abschlusscheck

## Aktueller Sicherheitsstand

- Standardmäßig ist harte Enforcement-Blockade deaktiviert.
- `TOOL_PERMISSION_ENFORCEMENT_ENABLED=false` ist sicherer Default.
- `dry-run` kann aktiviert werden, ohne Agent Flow hart zu blockieren.
- Harte Enforcement-Aktivierung bleibt für spätere Phase vorgesehen.

## Wichtige Seiten

```text
/tools
/tool-permissions
/tool-preflight
/analytics
```

## Wichtige Chat Panels

- Tool Preflight
- Tool Enforcement

## Release Check

```powershell
npm run tools:governance:release:verify
npm run tools:governance:smoke
npm run stack:health
```
