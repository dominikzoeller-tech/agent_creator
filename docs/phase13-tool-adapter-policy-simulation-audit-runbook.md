# Runbook – Phase 13.3 Tool Adapter Policy Simulation & Audit

## Patch
```powershell
npm run phase13:3:patch
```

Falls Script noch nicht registriert ist:
```powershell
node scripts/phase13-3-patch-tool-adapter-policy-simulation-audit.cjs
```

## Verify
```powershell
npm run phase13:3:verify
npm run build
npm run stack:up:detached
npm run stack:health
```

## Manuelle Prüfung
1. /tool-adapter-resume öffnen und Resume Plan erzeugen.
2. /tool-adapter-policy öffnen.
3. Tool Adapter Policy simulieren.
4. /governance-audit öffnen und Tool Adapter Policy Simulation Event prüfen.
5. Sicherstellen: toolExecutionAllowed=false und dryRunOnly=true.
