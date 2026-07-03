# Runbook – Phase 14.3 Cockpit Actions / Orchestration Prep

## Patch
```powershell
npm run phase14:3:patch
```

Falls Script noch nicht registriert ist:
```powershell
node scripts/phase14-3-patch-cockpit-actions-orchestration-prep.cjs
```

## Verify
```powershell
npm run phase14:3:verify
npm run build
```

Docker-Neustart nur für Browser-Test:
```powershell
npm run stack:up:detached
npm run stack:health
```

## Manuelle Prüfung
1. /master-cockpit öffnen.
2. Bei Guided Next Actions auf Planen klicken.
3. /api/cockpit-actions prüfen.
4. Sicherstellen: executionAllowed=false, toolExecutionAllowed=false, dryRunOnly=true.
