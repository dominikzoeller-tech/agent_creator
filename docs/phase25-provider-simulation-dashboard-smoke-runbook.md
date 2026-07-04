# Runbook – Phase 25.2 Provider Simulation Dashboard & Smoke

## Patch
```powershell
npm run phase25:2:patch
```

Falls Script noch nicht registriert ist:
```powershell
node scripts/phase25-2-patch-provider-simulation-dashboard-smoke.cjs
```

## Verify
```powershell
npm run phase25:2:verify
npm run build
```

Docker nur für Browser/Smoke:
```powershell
npm run stack:up:detached
npm run stack:health
npm run phase25:2:smoke
```
