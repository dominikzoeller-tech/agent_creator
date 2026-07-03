# Runbook – Phase 13.0 Tool Adapter Registry Sandbox

## Patch
```powershell
npm run phase13:0:patch
```

Falls Script noch nicht registriert ist:
```powershell
node scripts/phase13-0-patch-tool-adapter-registry-sandbox.cjs
```

## Verify
```powershell
npm run phase13:0:verify
npm run build
npm run stack:up:detached
npm run stack:health
```

## Manuelle Prüfung
1. /tool-sandbox öffnen.
2. Adapter registrieren.
3. Dry-run Plan erzeugen.
4. Prüfen: toolExecutionAllowed=false und dryRunOnly=true.
