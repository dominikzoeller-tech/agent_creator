# Runbook – Phase 29.2 Approval Token Activation Dashboard & Smoke

## Patch
```powershell
npm run phase29:2:patch
```

Falls Script noch nicht registriert ist:
```powershell
node scripts/phase29-2-patch-approval-token-activation-dashboard-smoke.cjs
```

## Verify
```powershell
npm run phase29:2:verify
npm run build
```

Docker nur für Browser/Smoke:
```powershell
npm run stack:up:detached
npm run stack:health
npm run phase29:2:smoke
```
