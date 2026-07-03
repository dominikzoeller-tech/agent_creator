# Runbook – Phase 15.1 Orchestration Policy Simulation & Audit

## Patch
```powershell
npm run phase15:1:patch
```

Falls Script noch nicht registriert ist:
```powershell
node scripts/phase15-1-patch-orchestration-policy-simulation-audit.cjs
```

## Verify
```powershell
npm run phase15:1:verify
npm run build
```

Docker nur für Browser-Test:
```powershell
npm run stack:up:detached
npm run stack:health
```
