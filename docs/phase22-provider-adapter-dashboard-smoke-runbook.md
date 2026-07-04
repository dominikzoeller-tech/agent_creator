# Runbook – Phase 22.2 Provider Adapter Dashboard & Smoke

## Patch
```powershell
npm run phase22:2:patch
```

Falls Script noch nicht registriert ist:
```powershell
node scripts/phase22-2-patch-provider-adapter-dashboard-smoke.cjs
```

## Verify
```powershell
npm run phase22:2:verify
npm run build
```

Docker nur für Browser/Smoke:
```powershell
npm run stack:up:detached
npm run stack:health
npm run phase22:2:smoke
```
