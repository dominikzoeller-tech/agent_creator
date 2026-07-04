# Runbook – Phase 26.2 Real Provider Gate Dashboard & Smoke

## Patch
```powershell
npm run phase26:2:patch
```

Falls Script noch nicht registriert ist:
```powershell
node scripts/phase26-2-patch-real-provider-gate-dashboard-smoke.cjs
```

## Verify
```powershell
npm run phase26:2:verify
npm run build
```

Docker nur für Browser/Smoke:
```powershell
npm run stack:up:detached
npm run stack:health
npm run phase26:2:smoke
```
