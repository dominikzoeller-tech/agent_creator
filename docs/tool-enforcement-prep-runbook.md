# Tool Permission Enforcement Prep Runbook

## Ziel

Phase 10.6 bereitet Enforcement vor, ohne den Agent Flow hart zu blockieren.

## Environment Flags

```env
TOOL_PERMISSION_ENFORCEMENT_ENABLED=false
TOOL_PERMISSION_ENFORCEMENT_DRY_RUN=true
TOOL_PERMISSION_BLOCK_EXTERNAL_NETWORK=true
TOOL_PERMISSION_BLOCK_WRITES=false
TOOL_PERMISSION_REQUIRE_CONFIRMATION_FOR_HIGH_RISK=true
```

## Modi

### off

```env
TOOL_PERMISSION_ENFORCEMENT_ENABLED=false
```

Der Agent zeigt Preflight und Enforcement-Prep nur als Beobachtung.

### dry-run

```env
TOOL_PERMISSION_ENFORCEMENT_ENABLED=true
TOOL_PERMISSION_ENFORCEMENT_DRY_RUN=true
```

Der Agent berechnet, ob blockiert würde, blockiert aber noch nicht.

### enforce, später

```env
TOOL_PERMISSION_ENFORCEMENT_ENABLED=true
TOOL_PERMISSION_ENFORCEMENT_DRY_RUN=false
```

Dieser Modus ist vorbereitet, aber harte Blockade wird erst in einer späteren Phase aktiviert.

## Rollback

Bei Problemen:

```env
TOOL_PERMISSION_ENFORCEMENT_ENABLED=false
```

Danach:

```powershell
npm run stack:down
npm run stack:up:detached
npm run stack:health
```
