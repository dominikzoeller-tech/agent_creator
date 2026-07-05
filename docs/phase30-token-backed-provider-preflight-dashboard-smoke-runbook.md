# Runbook – Phase 30.2 Token-Backed Provider Preflight Dashboard & Smoke

## Patch
```powershell
npm run phase30:2:patch
```

Falls Script noch nicht registriert ist:
```powershell
node scripts/phase30-2-patch-token-backed-provider-preflight-dashboard-smoke.cjs
```

## Verify
```powershell
npm run phase30:2:verify
npm run build
```

Docker nur für Browser/Smoke:
```powershell
npm run stack:up:detached
npm run stack:health
npm run phase30:2:smoke
```
