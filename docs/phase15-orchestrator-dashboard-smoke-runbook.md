# Runbook – Phase 15.2 Orchestrator Dashboard & Smoke

## Patch
```powershell
npm run phase15:2:patch
```

Falls Script noch nicht registriert ist:
```powershell
node scripts/phase15-2-patch-orchestrator-dashboard-smoke.cjs
```

## Verify
```powershell
npm run phase15:2:verify
npm run build
```

Docker nur für Browser/Smoke:
```powershell
npm run stack:up:detached
npm run stack:health
npm run phase15:2:smoke
```
