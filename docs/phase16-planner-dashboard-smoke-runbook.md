# Runbook – Phase 16.2 Planner Dashboard & Smoke

## Patch
```powershell
npm run phase16:2:patch
```

Falls Script noch nicht registriert ist:
```powershell
node scripts/phase16-2-patch-planner-dashboard-smoke.cjs
```

## Verify
```powershell
npm run phase16:2:verify
npm run build
```

Docker nur für Browser/Smoke:
```powershell
npm run stack:up:detached
npm run stack:health
npm run phase16:2:smoke
```
