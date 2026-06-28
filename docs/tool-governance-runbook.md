# Tool Governance Runbook

## Zweck

Dieses Runbook beschreibt Betrieb, Prüfung und Rollback der Tool-Governance-Funktionen.

## Grundprinzip

Tool Governance ist in Phase 10 sichtbar und messbar, aber harte Blockade ist bewusst noch nicht aktiv.

## Relevante Konzepte

### Tool Registry

Zentrale Liste aller Tools mit Risiko, Secrets, Netzwerkzugriff und Schreibzugriff.

```text
/tools
/api/tools
```

### Tool Permissions Matrix

Matrix nach Sensitivity und Processing Mode.

```text
/tool-permissions
/api/tool-permissions?sensitivity=internal&processingMode=auto
```

### Tool Preflight

Prüft einzelne Tool-Nutzung oder erkannte Tool-Kandidaten.

```text
/tool-preflight
/api/tool-preflight
```

### Tool Enforcement Prep

Bereitet harte Blockade vor, blockiert aber noch nicht.

```json
"toolEnforcement": {
  "mode": "off",
  "wouldBlock": false
}
```

## Environment Flags

```env
TOOL_PERMISSION_ENFORCEMENT_ENABLED=false
TOOL_PERMISSION_ENFORCEMENT_DRY_RUN=true
TOOL_PERMISSION_BLOCK_EXTERNAL_NETWORK=true
TOOL_PERMISSION_BLOCK_WRITES=false
TOOL_PERMISSION_REQUIRE_CONFIRMATION_FOR_HIGH_RISK=true
```

## Empfohlene Modi

### Produktiver sicherer Default

```env
TOOL_PERMISSION_ENFORCEMENT_ENABLED=false
```

### Beobachtungsmodus / Dry Run

```env
TOOL_PERMISSION_ENFORCEMENT_ENABLED=true
TOOL_PERMISSION_ENFORCEMENT_DRY_RUN=true
```

### Harte Blockade

Noch nicht für Phase 10 empfohlen.

```env
TOOL_PERMISSION_ENFORCEMENT_ENABLED=true
TOOL_PERMISSION_ENFORCEMENT_DRY_RUN=false
```

## Rollback

Wenn Verhalten unerwartet ist:

```env
TOOL_PERMISSION_ENFORCEMENT_ENABLED=false
```

Danach:

```powershell
npm run stack:down
npm run stack:up:detached
npm run stack:health
```

## Operativer Check

```powershell
npm run tools:governance:release:verify
npm run tools:governance:smoke
npm run stack:health
```

## UI Check

- `/tools` lädt
- `/tool-permissions` lädt
- `/tool-preflight` lädt
- `/analytics` zeigt Tool Preflight und Enforcement Analytics
- Chat zeigt Tool Preflight und Tool Enforcement Panels

## Sicherheitscheck

```powershell
git ls-files .env
git status --short .env
```

Erwartung: keine Ausgabe.
