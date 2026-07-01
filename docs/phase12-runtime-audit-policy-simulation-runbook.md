# Runbook – Phase 12.3 Runtime Audit Integration & Policy Simulation

## Patch
```powershell
npm run phase12:3:patch
```

Falls Script noch nicht registriert ist:
```powershell
node scripts/phase12-3-patch-runtime-audit-policy-simulation.cjs
```

## Verify
```powershell
npm run phase12:3:verify
npm run build
npm run stack:up:detached
npm run stack:health
```

## Manuelle Prüfung
1. /agent-runtime-resume öffnen und Resume Envelope erzeugen.
2. /agent-runtime-policy öffnen.
3. Runtime Policy simulieren.
4. /governance-audit öffnen und Runtime Policy Simulation Event prüfen.
5. Sicherstellen: toolExecutionAllowed=false und dryRunOnly=true.
