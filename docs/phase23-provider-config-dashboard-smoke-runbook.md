# Runbook – Phase 23.2 Provider Config Dashboard & Smoke

## Patch
```powershell
npm run phase23:2:patch
```

Falls Script noch nicht registriert ist:
```powershell
node scripts/phase23-2-patch-provider-config-dashboard-smoke.cjs
```

## Verify
```powershell
npm run phase23:2:verify
npm run build
```

Docker nur für Browser/Smoke:
```powershell
npm run stack:up:detached
npm run stack:health
npm run phase23:2:smoke
```
