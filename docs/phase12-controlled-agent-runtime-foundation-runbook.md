# Runbook – Phase 12.0 Controlled Agent Runtime Foundation

## Patch
```powershell
npm run phase12:0:patch
```

Falls Script noch nicht registriert ist:
```powershell
node scripts/phase12-0-patch-controlled-agent-runtime-foundation.cjs
```

## Verify
```powershell
npm run phase12:0:verify
npm run build
npm run stack:up:detached
npm run stack:health
```

## Manuelle Prüfung
1. /agent-runtime öffnen.
2. Dry-run Envelope erzeugen.
3. Prüfen: toolExecutionAllowed=false und dryRunOnly=true.
4. /api/agent-runtime prüfen.
