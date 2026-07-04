# Runbook – Phase 28.2 Approval Token Issuance Dashboard & Smoke

## Patch
```powershell
npm run phase28:2:patch
```

Falls Script noch nicht registriert ist:
```powershell
node scripts/phase28-2-patch-approval-token-issuance-dashboard-smoke.cjs
```

## Verify
```powershell
npm run phase28:2:verify
npm run build
```

Docker nur für Browser/Smoke:
```powershell
npm run stack:up:detached
npm run stack:health
npm run phase28:2:smoke
```
