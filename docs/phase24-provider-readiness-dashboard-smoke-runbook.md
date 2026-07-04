# Runbook – Phase 24.2 Provider Readiness Dashboard & Smoke

## Patch
```powershell
npm run phase24:2:patch
```

Falls Script noch nicht registriert ist:
```powershell
node scripts/phase24-2-patch-provider-readiness-dashboard-smoke.cjs
```

## Verify
```powershell
npm run phase24:2:verify
npm run build
```

Docker nur für Browser/Smoke:
```powershell
npm run stack:up:detached
npm run stack:health
npm run phase24:2:smoke
```
