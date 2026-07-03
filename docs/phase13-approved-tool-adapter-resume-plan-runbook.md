# Runbook – Phase 13.2 Approved Tool Adapter Resume Plan

## Patch
```powershell
npm run phase13:2:patch
```

Falls Script noch nicht registriert ist:
```powershell
node scripts/phase13-2-patch-approved-tool-adapter-resume-plan.cjs
```

## Verify
```powershell
npm run phase13:2:verify
npm run build
npm run stack:up:detached
npm run stack:health
```

## Manuelle Prüfung
1. /tool-sandbox öffnen und Dry-run Plan erzeugen.
2. /tool-adapter-consent öffnen und Binding erzeugen.
3. /tool-consent öffnen und Consent Request approved setzen.
4. /tool-adapter-resume öffnen und Resume Plan erzeugen.
5. Prüfen: toolExecutionAllowed=false und dryRunOnly=true.
