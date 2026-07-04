# Runbook – Phase 27.2 Approval Token Request Dashboard & Smoke

## Patch
```powershell
npm run phase27:2:patch
```

Falls Script noch nicht registriert ist:
```powershell
node scripts/phase27-2-patch-approval-token-request-dashboard-smoke.cjs
```

## Verify
```powershell
npm run phase27:2:verify
npm run build
```

Docker nur für Browser/Smoke:
```powershell
npm run stack:up:detached
npm run stack:health
npm run phase27:2:smoke
```
